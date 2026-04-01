import type {
  Settings, AIFormat, AIClassificationResult,
  GeminiModelEntry, ModelEntry,
} from '$types/index';
import { AI_PROVIDERS, AI_TIMEOUT_MS } from '$utils/constants';
import { gmXmlHttpRequest, gmFetch } from '$utils/gm';
import { sleep, backoffMs } from '$utils/timing';
import { logs } from '$stores/state';
import { getErrorMessage } from '$utils/errors';
import { extractJsonObject } from '$utils/json-extract';
import {
  REQUEST_BUILDERS,
  RESPONSE_PARSERS,
  getProviderBaseUrl,
  type AIPrompt,
} from './ai-providers';

// ================= AI 结果校验 =================

/** 运行时校验 AI 返回的 JSON 符合 AIClassificationResult 结构 */
function validateAIResult(parsed: unknown): AIClassificationResult {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI 返回的 JSON 不是对象');
  }
  const obj = parsed as Record<string, unknown>;

  // categories 字段可选（AI 可能只返回 thoughts），但如果存在必须是对象
  if (obj.categories !== undefined) {
    if (typeof obj.categories !== 'object' || obj.categories === null || Array.isArray(obj.categories)) {
      throw new Error('AI 返回的 categories 字段格式错误（应为对象）');
    }
    // 验证每个分类下是数组，数组元素有 id 和 type
    for (const [catName, entries] of Object.entries(obj.categories as Record<string, unknown>)) {
      if (!Array.isArray(entries)) {
        throw new Error(`分类「${catName}」的值不是数组`);
      }
      for (const entry of entries) {
        if (typeof entry !== 'object' || entry === null) {
          throw new Error(`分类「${catName}」中包含非对象条目`);
        }
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== 'number' || typeof e.type !== 'number') {
          throw new Error(`分类「${catName}」中条目缺少有效的 id/type 字段`);
        }
      }
    }
  }

  return parsed as AIClassificationResult;
}

// ================= API 密钥脱敏 =================

/** 从文本片段中脱敏 API 密钥，防止密钥通过错误消息泄露 */
function redactApiKey(text: string, apiKey: string): string {
  if (!apiKey || apiKey.length <= 8) return text;
  try {
    return text.replace(
      new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      '***',
    );
  } catch {
    return text.replaceAll(apiKey, '***');
  }
}

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
    gmXmlHttpRequest({
      method: 'POST',
      url,
      headers,
      data: body,
      timeout: AI_TIMEOUT_MS,
      onload(response) {
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
          const errSnippet = redactApiKey(
            (response.responseText || '').substring(0, 300),
            settings.apiKey,
          );
          reject(new Error(`API 报错 ${response.status}：${errSnippet}`));
          return;
        }

        try {
          const content = parser(response.responseText);
          const parsed = extractJsonObject(content);
          const result = validateAIResult(parsed);
          resolve(result);
        } catch (e: unknown) {
          const snippet = redactApiKey(
            (response.responseText || '').substring(0, 120),
            settings.apiKey,
          );
          reject(new Error(`解析 AI 回复失败: ${getErrorMessage(e)}\n响应片段: ${snippet}`));
        }
      },
      onerror(resp) {
        const detail =
          resp && typeof resp === 'object' && 'error' in resp ? ` (${(resp as Record<string, unknown>).error})` : '';
        reject({
          retryable: true,
          message: `网络请求失败${detail}，请检查网络或 API 地址`,
        });
      },
      ontimeout() {
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
      const isRetryable = err != null && typeof err === 'object' && 'retryable' in err && (err as Record<string, unknown>).retryable === true;
      const errMsg = getErrorMessage(err);
      if (isRetryable && attempt < maxRetries) {
        const waitMs = backoffMs(attempt, 2000, 16000);
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
    const MAX_PAGES = 20;
    let page = 0;
    do {
      if (++page > MAX_PAGES) break;
      const params = new URLSearchParams({ key: settings.apiKey, pageSize: '100' });
      if (pageToken) params.set('pageToken', pageToken);
      const pageUrl = `${config.baseUrl}/models?${params}`;
      const resp = await gmFetch(pageUrl);
      let json: { models?: GeminiModelEntry[]; nextPageToken?: string };
      try {
        json = JSON.parse(resp.responseText);
      } catch {
        throw new Error(`Gemini 模型列表返回了无效 JSON: ${resp.responseText.substring(0, 120)}`);
      }
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
      'anthropic-version': '2024-10-22', // models list API 使用稳定版本，与 messages API 版本不同
    };
  } else {
    throw new Error('不支持的提供商');
  }

  const resp = await gmFetch(url, { headers });
  let json: unknown;
  try {
    json = JSON.parse(resp.responseText);
  } catch {
    throw new Error(`模型列表返回了无效 JSON: ${resp.responseText.substring(0, 120)}`);
  }
  let models: string[];

  if (fmt === 'github') {
    // GitHub catalog API 可能直接返回数组或 { data/models } 对象
    const list: ModelEntry[] = Array.isArray(json)
      ? json
      : ((json as Record<string, unknown>).data ?? (json as Record<string, unknown>).models ?? []) as ModelEntry[];
    models = list.map((m) => m.id ?? m.name ?? '').filter(Boolean);
  } else {
    const obj = json as { data?: ModelEntry[] };
    const list: ModelEntry[] = obj.data ?? [];
    models = list.map((m) => m.id ?? '').filter(Boolean);
  }
  models.sort();
  return models;
}
