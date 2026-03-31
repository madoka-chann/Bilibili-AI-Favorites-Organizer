import type {
  Settings, AIFormat, AIClassificationResult,
  GeminiModelEntry, ModelEntry,
} from '$lib/types';
import { AI_PROVIDERS, AI_TIMEOUT_MS } from '$lib/utils/constants';
import { gmXmlHttpRequest } from '$lib/utils/gm';
import { gmFetch } from '$lib/utils/gm';
import { sleep } from '$lib/utils/timing';
import { logs } from '$lib/stores/state';
import { getErrorMessage } from '$lib/utils/errors';
import {
  REQUEST_BUILDERS,
  RESPONSE_PARSERS,
  getProviderBaseUrl,
  type AIPrompt,
} from './ai-providers';

// ================= 单次 AI 调用 =================

export function callAISingle(
  prompt: AIPrompt,
  settings: Settings
): Promise<AIClassificationResult> {
  const fmt: AIFormat =
    (AI_PROVIDERS[settings.provider]?.format as AIFormat) ?? 'gemini';
  const builder = REQUEST_BUILDERS[fmt] ?? REQUEST_BUILDERS.gemini;
  const parser = RESPONSE_PARSERS[fmt] ?? RESPONSE_PARSERS.gemini;
  const { url, headers, body } = builder(prompt, settings);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject({ retryable: true, message: 'AI 请求超时 (120秒)' }),
      AI_TIMEOUT_MS
    );

    gmXmlHttpRequest({
      method: 'POST',
      url,
      headers,
      data: body,
      timeout: AI_TIMEOUT_MS,
      onload(response) {
        clearTimeout(timeoutId);

        // 可重试的状态码
        if ([429, 503, 529].includes(response.status)) {
          reject({
            retryable: true,
            message: `API 限流/过载 (${response.status})`,
            status: response.status,
          });
          return;
        }

        if (response.status !== 200) {
          let errSnippet = (response.responseText || '').substring(0, 300);
          if (settings.apiKey && settings.apiKey.length > 8) {
            errSnippet = errSnippet.replace(
              new RegExp(
                settings.apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                'g'
              ),
              '***'
            );
          }
          reject(new Error(`API 报错 ${response.status}：${errSnippet}`));
          return;
        }

        try {
          let content = parser(response.responseText);
          content = content.replace(/```json/g, '').replace(/```/g, '').trim();

          // 用括号匹配提取第一个完整的 JSON 对象
          const firstBrace = content.indexOf('{');
          if (firstBrace !== -1) {
            let depth = 0;
            let inString = false;
            let escape = false;
            let endPos = -1;
            for (let ci = firstBrace; ci < content.length; ci++) {
              const ch = content[ci];
              if (escape) {
                escape = false;
                continue;
              }
              if (ch === '\\' && inString) {
                escape = true;
                continue;
              }
              if (ch === '"') {
                inString = !inString;
                continue;
              }
              if (inString) continue;
              if (ch === '{') depth++;
              else if (ch === '}') {
                depth--;
                if (depth === 0) {
                  endPos = ci;
                  break;
                }
              }
            }
            if (endPos > firstBrace) {
              content = content.substring(firstBrace, endPos + 1);
            } else {
              const lastBrace = content.lastIndexOf('}');
              if (lastBrace > firstBrace)
                content = content.substring(firstBrace, lastBrace + 1);
            }
          }

          // 尝试解析 JSON，失败则修复常见问题
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch {
            const fixed = content.replace(/,\s*([\]}])/g, '$1');
            parsed = JSON.parse(fixed);
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`解析 AI 回复失败: ${e instanceof Error ? e.message : String(e)}`));
        }
      },
      onerror(resp) {
        clearTimeout(timeoutId);
        const detail =
          resp && 'error' in resp ? ` (${(resp as { error: string }).error})` : '';
        reject({
          retryable: true,
          message: `网络请求失败${detail}，请检查网络或 API 地址`,
        });
      },
      ontimeout() {
        clearTimeout(timeoutId);
        reject({ retryable: true, message: 'AI 请求超时' });
      },
    });
  });
}

// ================= 带重试的 AI 调用 =================

export async function callAI(
  prompt: AIPrompt,
  settings: Settings,
  maxRetries = 3
): Promise<AIClassificationResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callAISingle(prompt, settings);
    } catch (err: unknown) {
      const isRetryable = err && typeof err === 'object' && 'retryable' in err && (err as { retryable?: boolean }).retryable;
      const errMsg = getErrorMessage(err);
      if (isRetryable && attempt < maxRetries) {
        const waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 16000);
        logs.add(
          `AI 请求失败 (${errMsg})，${(waitMs / 1000).toFixed(0)}秒后重试 (${attempt}/${maxRetries})...`,
          'warning'
        );
        await sleep(waitMs);
        continue;
      }
      throw new Error(errMsg);
    }
  }
  throw new Error(`AI 请求 ${maxRetries} 次均失败`);
}

// ================= 模型列表获取 =================

export async function fetchModelList(settings: Settings): Promise<string[]> {
  const config = AI_PROVIDERS[settings.provider];
  if (!config) throw new Error('不支持的提供商');
  const fmt = config.format as AIFormat;

  if (fmt === 'gemini') {
    const allModels: string[] = [];
    let pageToken = '';
    do {
      const pageUrl = `${config.baseUrl}/models?key=${settings.apiKey}&pageSize=100${pageToken ? '&pageToken=' + pageToken : ''}`;
      const resp = await gmFetch(pageUrl);
      const json: { models?: GeminiModelEntry[]; nextPageToken?: string } =
        JSON.parse(resp.responseText);
      const models = (json.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace('models/', ''));
      allModels.push(...models);
      pageToken = json.nextPageToken ?? '';
    } while (pageToken);
    allModels.sort();
    return allModels;
  }

  let url: string;
  let headers: Record<string, string> = {};

  if (fmt === 'openai') {
    url = `${getProviderBaseUrl(settings)}/models`;
    headers = { Authorization: `Bearer ${settings.apiKey}` };
  } else if (fmt === 'github') {
    url = `${config.baseUrl}/catalog/models`;
    headers = { Authorization: `Bearer ${settings.apiKey}` };
  } else if (fmt === 'anthropic') {
    url = `${config.baseUrl}/v1/models`;
    headers = {
      'x-api-key': settings.apiKey,
      'anthropic-version': '2024-10-22',
    };
  } else {
    throw new Error('不支持的提供商');
  }

  const resp = await gmFetch(url, { headers });
  const json: { data?: ModelEntry[]; models?: ModelEntry[] } =
    JSON.parse(resp.responseText);
  let models: string[];

  if (fmt === 'github') {
    const list: ModelEntry[] = Array.isArray(json) ? json : (json.data ?? json.models ?? []);
    models = list.map((m) => m.id ?? m.name ?? '').filter(Boolean);
  } else {
    const list: ModelEntry[] = json.data ?? [];
    models = list.map((m) => m.id ?? '').filter(Boolean);
  }
  models.sort();
  return models;
}
