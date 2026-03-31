/** 用户设置接口 — 持久化到 GM_getValue/GM_setValue */
export interface Settings {
  // AI 服务商
  provider: string;
  customBaseUrl: string;
  apiKey: string;
  modelName: string;

  // AI 请求参数
  aiChunkSize: number;
  aiConcurrency: number;

  // 抓取限制
  limitEnabled: boolean;
  limitCount: number;

  // 速度控制
  fetchDelay: number;
  writeDelay: number;
  moveChunkSize: number;

  // 行为开关
  skipDeadVideos: boolean;
  adaptiveRate: boolean;
  notifyOnComplete: boolean;
  multiFolderEnabled: boolean;
  animEnabled: boolean;
  incrementalMode: boolean;

  // 批量休息防风控
  batchRestInterval: number;
  batchRestMinutes: number;

  // 后台缓存
  bgCacheEnabled: boolean;
  cacheScanInterval: number;

  // 自定义 Prompt
  lastPrompt: string;
}

/** 设置默认值 */
export const DEFAULT_SETTINGS: Settings = {
  provider: 'gemini',
  customBaseUrl: '',
  apiKey: '',
  modelName: 'gemini-2.5-flash',
  aiChunkSize: 50,
  aiConcurrency: 2,
  limitEnabled: false,
  limitCount: 200,
  fetchDelay: 800,
  writeDelay: 2500,
  moveChunkSize: 20,
  skipDeadVideos: true,
  adaptiveRate: true,
  notifyOnComplete: true,
  multiFolderEnabled: false,
  animEnabled: false,
  incrementalMode: false,
  batchRestInterval: 100,
  batchRestMinutes: 1,
  bgCacheEnabled: false,
  cacheScanInterval: 15,
  lastPrompt: '',
};
