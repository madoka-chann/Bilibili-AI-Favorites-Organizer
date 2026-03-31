import type { Settings, AIFormat, AIRequestConfig, AIResponseParsed } from '$lib/types';
import { AI_PROVIDERS } from '$lib/utils/constants';
import { tokenUsage } from '$lib/stores/state';
import { get } from 'svelte/store';

// ================= 常量 =================
const FALLBACK_SYSTEM =
  '你是一个逻辑严密的B站收藏夹视频分类专家。你只输出纯JSON，不输出任何其他内容。JSON格式为：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字}]}}';

/** Prompt 可以是字符串 (旧格式) 或 {system, user} 对象 */
export type AIPrompt = string | { system: string; user: string };

// ================= Provider Base URL =================
export function getProviderBaseUrl(settings: Settings): string {
  const config = AI_PROVIDERS[settings.provider];
  if (config?.isCustom) {
    let url = (settings.customBaseUrl || '').trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
    if (url && /^http:\/\//i.test(url) && !/^http:\/\/(localhost|127\.|0\.0\.0\.0)/i.test(url)) {
      console.warn('[BFAO] 自定义 API 地址使用了 HTTP 而非 HTTPS，存在中间人攻击风险');
    }
    return url;
  }
  return config?.baseUrl ?? '';
}

// ================= Request Builders =================

function buildGeminiRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const base = AI_PROVIDERS.gemini.baseUrl;
  const userText = typeof prompt === 'string' ? prompt : prompt.user;
  const systemText = typeof prompt === 'string' ? FALLBACK_SYSTEM : prompt.system;
  return {
    url: `${base}/models/${s.modelName}:generateContent?key=${s.apiKey}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemText }] },
      contents: [{ parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  };
}

function buildOpenAIRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const baseUrl = getProviderBaseUrl(s);
  const messages: Array<{ role: string; content: string }> = [];
  if (typeof prompt === 'string') {
    messages.push({ role: 'system', content: FALLBACK_SYSTEM });
    messages.push({ role: 'user', content: prompt });
  } else {
    if (prompt.system) messages.push({ role: 'system', content: prompt.system });
    messages.push({ role: 'user', content: prompt.user });
  }
  return {
    url: `${baseUrl}/chat/completions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey}`,
    },
    body: JSON.stringify({
      model: s.modelName,
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  };
}

function buildAnthropicRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const base = AI_PROVIDERS.anthropic.baseUrl;
  const userText = typeof prompt === 'string' ? prompt : prompt.user;
  const systemText = typeof prompt === 'string' ? FALLBACK_SYSTEM : prompt.system;
  return {
    url: `${base}/v1/messages`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': s.apiKey,
      'anthropic-version': '2025-04-14',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: s.modelName,
      max_tokens: 8192,
      system: systemText,
      messages: [{ role: 'user', content: userText }],
      temperature: 0.1,
    }),
  };
}

function buildGitHubRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const messages: Array<{ role: string; content: string }> = [];
  if (typeof prompt === 'string') {
    messages.push({ role: 'system', content: FALLBACK_SYSTEM });
    messages.push({ role: 'user', content: prompt });
  } else {
    if (prompt.system) messages.push({ role: 'system', content: prompt.system });
    messages.push({ role: 'user', content: prompt.user });
  }
  return {
    url: `${AI_PROVIDERS.github.baseUrl}/inference/chat/completions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey}`,
    },
    body: JSON.stringify({
      model: s.modelName,
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  };
}

// ================= Response Parsers =================

function trackTokenUsageFromResponse(responseJson: any, format: AIFormat): void {
  try {
    let usage: any = null;
    if (format === 'gemini') {
      usage = responseJson.usageMetadata;
    } else {
      usage = responseJson.usage;
    }
    if (!usage) return;

    tokenUsage.update((u) => {
      const next = { ...u, callCount: u.callCount + 1 };
      if (format === 'gemini') {
        next.promptTokens += usage.promptTokenCount || 0;
        next.completionTokens += usage.candidatesTokenCount || 0;
        next.totalTokens += usage.totalTokenCount || 0;
      } else {
        next.promptTokens += usage.prompt_tokens || usage.input_tokens || 0;
        next.completionTokens += usage.completion_tokens || usage.output_tokens || 0;
        next.totalTokens +=
          usage.total_tokens ||
          (usage.input_tokens || 0) + (usage.output_tokens || 0) ||
          0;
      }
      return next;
    });
  } catch {
    /* 静默失败 */
  }
}

function parseGeminiResponse(text: string): string {
  const json = JSON.parse(text);
  trackTokenUsageFromResponse(json, 'gemini');
  return json.candidates[0].content.parts[0].text;
}

function parseOpenAIResponse(text: string): string {
  const json = JSON.parse(text);
  trackTokenUsageFromResponse(json, 'openai');
  return json.choices[0].message.content;
}

function parseAnthropicResponse(text: string): string {
  const json = JSON.parse(text);
  trackTokenUsageFromResponse(json, 'anthropic');
  return json.content[0].text;
}

// ================= 注册表 =================

const REQUEST_BUILDERS: Record<
  AIFormat,
  (prompt: AIPrompt, s: Settings) => AIRequestConfig
> = {
  gemini: buildGeminiRequest,
  openai: buildOpenAIRequest,
  github: buildGitHubRequest,
  anthropic: buildAnthropicRequest,
};

const RESPONSE_PARSERS: Record<AIFormat, (text: string) => string> = {
  gemini: parseGeminiResponse,
  openai: parseOpenAIResponse,
  github: parseOpenAIResponse,
  anthropic: parseAnthropicResponse,
};

export { REQUEST_BUILDERS, RESPONSE_PARSERS };

// ================= Token 格式化 =================

export function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// ================= 费用估算 =================

const MODEL_PRICING: Record<string, [number, number]> = {
  'gemini-2.5-flash': [0.15, 0.6],
  'gemini-2.5-pro': [1.25, 10.0],
  'gemini-2.0-flash': [0.1, 0.4],
  'gemini-1.5-flash': [0.075, 0.3],
  'gemini-1.5-pro': [1.25, 5.0],
  'gpt-4o': [2.5, 10.0],
  'gpt-4o-mini': [0.15, 0.6],
  'gpt-4.1': [2.0, 8.0],
  'gpt-4.1-mini': [0.4, 1.6],
  'gpt-4.1-nano': [0.1, 0.4],
  'o3-mini': [1.1, 4.4],
  'o4-mini': [1.1, 4.4],
  'deepseek-chat': [0.27, 1.1],
  'deepseek-reasoner': [0.55, 2.19],
  'claude-sonnet-4-6': [3.0, 15.0],
  'claude-opus-4-6': [15.0, 75.0],
  'claude-haiku-4-5': [0.8, 4.0],
  'llama-3.3-70b-versatile': [0.59, 0.79],
};

export function estimateCost(modelName: string): string | null {
  const usage = get(tokenUsage);
  if (usage.totalTokens === 0) return null;

  let pricing = MODEL_PRICING[modelName];
  if (!pricing) {
    const key = Object.keys(MODEL_PRICING).find((k) => modelName.startsWith(k));
    if (key) pricing = MODEL_PRICING[key];
  }
  if (!pricing) return null;

  const inputCost = (usage.promptTokens / 1_000_000) * pricing[0];
  const outputCost = (usage.completionTokens / 1_000_000) * pricing[1];
  const totalUSD = inputCost + outputCost;
  const totalCNY = totalUSD * 7.2;

  if (totalUSD < 0.001) return '< $0.001 (≈ ¥0.01)';
  return `$${totalUSD.toFixed(4)} (≈ ¥${totalCNY.toFixed(3)})`;
}
