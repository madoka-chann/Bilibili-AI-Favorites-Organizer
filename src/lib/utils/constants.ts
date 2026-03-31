import type { AIProviderRegistry, SpeedPreset, ChunkPreset, PromptPreset } from '$lib/types';

// ================= 时间常量 =================
export const VIDEO_CACHE_TTL = 300_000; // 5 分钟
export const AI_TIMEOUT_MS = 120_000; // 2 分钟
export const FETCH_TIMEOUT_MS = 30_000; // 30 秒
export const SAFETY_TIMEOUT_MS = 30 * 60 * 1000; // 30 分钟
export const DEBOUNCE_DELAY_MS = 400;

// ================= 分页与限制 =================
export const BILIBILI_PAGE_SIZE = 40;
export const MAX_UNDO_HISTORY = 5;
export const MAX_TOAST_COUNT = 5;
export const MAX_CANVAS_FX = 1; // 从 6 减少到 1

// ================= Z-Index =================
export const Z_INDEX = {
  FLOAT: 2147483640,
  PANEL: 2147483641,
  MODAL: 2147483645,
  PARTICLE: 2147483646,
  TOAST: 2147483647,
} as const;

// ================= AI 服务商注册表 =================
export const AI_PROVIDERS: AIProviderRegistry = {
  gemini: {
    name: 'Google Gemini',
    format: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    keyPlaceholder: '从 aistudio.google.com/apikey 获取',
    apiUrl: 'https://aistudio.google.com/apikey',
  },
  openai: {
    name: 'OpenAI',
    format: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: '从 platform.openai.com 获取',
    apiUrl: 'https://platform.openai.com/api-keys',
  },
  deepseek: {
    name: 'DeepSeek',
    format: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    keyPlaceholder: '从 platform.deepseek.com 获取',
    apiUrl: 'https://platform.deepseek.com/api_keys',
  },
  siliconflow: {
    name: '硅基流动',
    format: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    keyPlaceholder: '从 cloud.siliconflow.cn 获取',
    apiUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  qwen: {
    name: '通义千问 (Qwen)',
    format: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    keyPlaceholder: '从 dashscope.aliyun.com 获取',
    apiUrl: 'https://dashscope.console.aliyun.com/apikey',
  },
  moonshot: {
    name: 'Moonshot (Kimi)',
    format: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    keyPlaceholder: '从 platform.moonshot.cn 获取',
    apiUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  zhipu: {
    name: '智谱 (GLM)',
    format: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    keyPlaceholder: '从 open.bigmodel.cn 获取',
    apiUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  groq: {
    name: 'Groq',
    format: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: '从 console.groq.com 获取',
    apiUrl: 'https://console.groq.com/keys',
  },
  openrouter: {
    name: 'OpenRouter',
    format: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash',
    keyPlaceholder: '从 openrouter.ai/keys 获取',
    apiUrl: 'https://openrouter.ai/keys',
  },
  ollama: {
    name: 'Ollama (本地)',
    format: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    keyPlaceholder: '本地运行无需 Key',
    apiUrl: '',
  },
  github: {
    name: 'GitHub Models',
    format: 'github',
    baseUrl: 'https://models.github.ai',
    defaultModel: 'openai/gpt-4o-mini',
    keyPlaceholder: '填入 GitHub Personal Access Token',
    apiUrl: 'https://docs.github.com/zh/github-models/quickstart',
  },
  anthropic: {
    name: 'Anthropic Claude',
    format: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-6-20250627',
    keyPlaceholder: '从 console.anthropic.com 获取',
    apiUrl: 'https://console.anthropic.com/settings/keys',
  },
  custom: {
    name: '自定义 (OpenAI 兼容)',
    format: 'openai',
    baseUrl: '',
    defaultModel: '',
    keyPlaceholder: '填入 API Key',
    apiUrl: '',
    isCustom: true,
  },
};

// ================= 速度预设 =================
export const SPEED_PRESETS: SpeedPreset[] = [
  { label: '○  安全 (1.5s)', value: 1500, desc: '大收藏夹推荐，几乎不会触发风控' },
  { label: '◐  稳健 (800ms)', value: 800, desc: '日常使用推荐，平衡速度与安全' },
  { label: '●  较快 (500ms)', value: 500, desc: '小收藏夹可用，有一定风控风险' },
];

// ================= AI 分块预设 =================
export const AI_CHUNK_PRESETS: ChunkPreset[] = [
  { label: '●  100个', value: 100, desc: '按需选择' },
  { label: '◐  50个', value: 50, desc: '按需选择' },
];

// ================= 内置 Prompt 预设 =================
export const BUILTIN_PRESETS: PromptPreset[] = [
  { label: '自由发挥', value: '' },
  { label: '按UP主分类', value: '请按UP主/创作者名字分类，同一个UP主的视频放在一起，收藏夹名用UP主的名字' },
  { label: '按内容类型分类', value: '请按视频内容类型分类，如游戏、音乐、教程、生活、科技、搞笑、影视等大类' },
  { label: '按时长分类', value: '请按视频时长分类：短视频(5分钟以内)、中等时长(5-30分钟)、长视频(30分钟以上)' },
  { label: '学习资料整理', value: '请将学习类视频按学科/技能分类，如编程、数学、英语、设计、考研、职场技能等。非学习类视频统一归入"休闲娱乐"' },
  { label: '按热度分类', value: '请按视频播放量分类：冷门宝藏(1万以下)、小众精品(1-10万)、热门视频(10-100万)、爆款视频(100万以上)' },
  { label: '精细分类 (多级)', value: '请尽量精细分类，同一大类下如果视频较多可拆分子类。例如"游戏"可细分为"单机游戏"、"网络游戏"、"手游"等。收藏夹名格式：大类-子类' },
  { label: '按语言/地区分类', value: '请按视频的语言或内容地区分类，如国产、日本动画、欧美、韩国等。同一地区内可按类型细分' },
  { label: '待看优先级', value: '请按视频的观看价值和紧迫程度分类为：必看精品、有空再看、背景音/BGM、已过时可清理。重点参考播放量和收藏时间判断' },
];

// ================= Confetti 颜色 =================
export const CONFETTI_COLORS = [
  '#7C5CFC', '#FF6B8A', '#A855F7', '#06B6D4',
  '#10B981', '#F59E0B', '#F43F5E', '#D946EF',
  '#FB7185', '#FBBF24', '#B4A0FF', '#34D399',
];

// ================= 极光颜色 (用于粒子/Canvas) =================
export const AURORA_COLORS = [
  '#B4A0FF', '#FF6B8A', '#22D3EE', '#34D399', '#E879F9', '#FBBF24',
];
