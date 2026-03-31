/** AI API 格式类型 */
export type AIFormat = 'gemini' | 'openai' | 'github' | 'anthropic';

/** AI 服务商配置 */
export interface AIProvider {
  name: string;
  format: AIFormat;
  baseUrl: string;
  defaultModel: string;
  keyPlaceholder: string;
  apiUrl: string;
  isCustom?: boolean;
}

/** AI 服务商注册表 */
export type AIProviderRegistry = Record<string, AIProvider>;

/** AI 请求构建结果 */
export interface AIRequestConfig {
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: string;
}

/** AI 响应解析结果 */
export interface AIResponseParsed {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/** Token 用量统计 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  callCount: number;
}

/** 速度预设 */
export interface SpeedPreset {
  label: string;
  value: number;
  desc: string;
}

/** AI 分块预设 */
export interface ChunkPreset {
  label: string;
  value: number;
  desc: string;
}

/** 内置 Prompt 预设 */
export interface PromptPreset {
  label: string;
  value: string;
  isCustom?: boolean;
  id?: string;
}

// ================= AI API 响应类型 =================

/** Gemini Token 用量元数据 */
export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

/** OpenAI/Anthropic Token 用量 */
export interface StandardUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
}

/** Gemini API 响应 */
export interface GeminiResponse {
  candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  usageMetadata?: GeminiUsageMetadata;
}

/** OpenAI/GitHub API 响应 */
export interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>;
  usage?: StandardUsage;
}

/** Anthropic API 响应 */
export interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage?: StandardUsage;
}

/** Gemini 模型列表条目 */
export interface GeminiModelEntry {
  name: string;
  supportedGenerationMethods?: string[];
}

/** OpenAI/GitHub/Anthropic 模型列表条目 */
export interface ModelEntry {
  id?: string;
  name?: string;
}

/** AI 分类结果 (AI 返回的原始结构) */
export interface AIClassificationResult {
  thoughts?: string;
  categories?: Record<string, Array<{ id: number; type: number; conf?: number }>>;
}

/** 分类条目 (带置信度) */
export interface ClassifiedVideoEntry {
  id: number;
  type: number;
  conf?: number;
}
