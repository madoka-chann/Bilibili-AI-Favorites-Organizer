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
