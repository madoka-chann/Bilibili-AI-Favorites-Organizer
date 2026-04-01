import type {
  Settings, AIFormat, AIRequestConfig,
  GeminiResponse, OpenAIResponse, AnthropicResponse,
  GeminiUsageMetadata, StandardUsage,
} from '$types/index';
import { AI_PROVIDERS } from '$utils/constants';
import { tokenUsage, logs } from '$stores/state';
import { get } from 'svelte/store';

// ================= 常量 =================
const FALLBACK_SYSTEM =
  '你是一个逻辑严密的B站收藏夹视频分类专家。你只输出纯JSON，不输出任何其他内容。JSON格式为：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字}]}}';

/** Prompt 可以是字符串 (旧格式) 或 {system, user} 对象 */
export type AIPrompt = string | { system: string; user: string };

// ================= SSRF 防护 =================

/** 检测 hostname 是否为私有/保留 IP 范围 */
function isPrivateHost(hostname: string): boolean {
  // IPv4 私有/保留地址
  const PRIVATE_PATTERNS = [
    /^127\./,             // loopback
    /^10\./,              // Class A private
    /^172\.(1[6-9]|2\d|3[01])\./,  // Class B private
    /^192\.168\./,        // Class C private
    /^0\./,               // "this" network
    /^169\.254\./,        // link-local
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGN (RFC 6598)
  ];
  // 特殊 hostnames
  if (/^(localhost|0\.0\.0\.0|\[::1?\])$/i.test(hostname)) return true;
  return PRIVATE_PATTERNS.some(p => p.test(hostname));
}

// ================= Provider Base URL =================
export function getProviderBaseUrl(settings: Settings): string {
  const config = AI_PROVIDERS[settings.provider];
  if (config?.isCustom) {
    let url = (settings.customBaseUrl || '').trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;

    // SSRF 防护: 验证 URL 格式 + 拒绝私有地址
    if (url) {
      try {
        const parsed = new URL(url);
        if (isPrivateHost(parsed.hostname)) {
          logs.add('自定义 API 地址指向内网地址，已拒绝 (SSRF 防护)', 'error');
          return '';
        }
      } catch {
        logs.add('自定义 API 地址格式无效', 'error');
        return '';
      }

      if (/^http:\/\//i.test(url)) {
        logs.add('自定义 API 地址使用了 HTTP 而非 HTTPS，存在中间人攻击风险', 'warning');
      }
    }
    return url;
  }
  return config?.baseUrl ?? '';
}

// ================= Request Builders =================

/** 解析 prompt 为 system + user 文本对 (统一入口) */
function resolvePrompt(prompt: AIPrompt): { system: string; user: string } {
  if (typeof prompt === 'string') {
    return { system: FALLBACK_SYSTEM, user: prompt };
  }
  return { system: prompt.system ?? FALLBACK_SYSTEM, user: prompt.user };
}

function buildGeminiRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const base = AI_PROVIDERS.gemini.baseUrl;
  const { system: systemText, user: userText } = resolvePrompt(prompt);
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

/** 构建 OpenAI 兼容格式的消息列表 (复用 resolvePrompt) */
function buildChatMessages(
  prompt: AIPrompt,
): Array<{ role: string; content: string }> {
  const { system, user } = resolvePrompt(prompt);
  const messages: Array<{ role: string; content: string }> = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: user });
  return messages;
}

/** 构建 OpenAI 兼容格式请求 (OpenAI / GitHub / 第三方) */
function buildChatCompletionRequest(
  prompt: AIPrompt,
  s: Settings,
  baseUrl: string,
  endpoint: string,
): AIRequestConfig {
  return {
    url: `${baseUrl}${endpoint}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey}`,
    },
    body: JSON.stringify({
      model: s.modelName,
      messages: buildChatMessages(prompt),
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  };
}

function buildOpenAIRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  return buildChatCompletionRequest(prompt, s, getProviderBaseUrl(s), '/chat/completions');
}

function buildAnthropicRequest(prompt: AIPrompt, s: Settings): AIRequestConfig {
  const base = AI_PROVIDERS.anthropic.baseUrl;
  const { system: systemText, user: userText } = resolvePrompt(prompt);
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
  return buildChatCompletionRequest(
    prompt, s, AI_PROVIDERS.github.baseUrl, '/inference/chat/completions',
  );
}

// ================= Response Parsers =================

/** 统一 token 用量追踪 — 同时兼容 Gemini 与 OpenAI/Anthropic 字段命名 */
function trackUsage(input: number, output: number, total?: number): void {
  tokenUsage.update((u) => ({
    ...u,
    callCount: u.callCount + 1,
    promptTokens: u.promptTokens + input,
    completionTokens: u.completionTokens + output,
    totalTokens: u.totalTokens + (total ?? (input + output)),
  }));
}

function parseGeminiResponse(text: string): string {
  const json: GeminiResponse = JSON.parse(text);
  if (json.usageMetadata) {
    const u = json.usageMetadata;
    trackUsage(u.promptTokenCount ?? 0, u.candidatesTokenCount ?? 0, u.totalTokenCount);
  }
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini 响应结构异常: 未找到有效内容');
  return content;
}

function parseOpenAIResponse(text: string): string {
  const json: OpenAIResponse = JSON.parse(text);
  if (json.usage) {
    const u = json.usage;
    trackUsage(u.prompt_tokens ?? u.input_tokens ?? 0, u.completion_tokens ?? u.output_tokens ?? 0, u.total_tokens);
  }
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI 响应结构异常: 未找到有效内容');
  return content;
}

function parseAnthropicResponse(text: string): string {
  const json: AnthropicResponse = JSON.parse(text);
  if (json.usage) {
    const u = json.usage;
    trackUsage(u.prompt_tokens ?? u.input_tokens ?? 0, u.completion_tokens ?? u.output_tokens ?? 0, u.total_tokens);
  }
  const content = json.content?.[0]?.text;
  if (!content) throw new Error('Anthropic 响应结构异常: 未找到有效内容');
  return content;
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
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
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
