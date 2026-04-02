import { writable, get } from 'svelte/store';
import type { Settings, AIProviderId } from '$types/index';
import { DEFAULT_SETTINGS } from '$types/index';
import { gmGetValue, gmSetValue } from '$utils/gm';
import { AI_PROVIDERS } from '$utils/constants';

/** 所有持久化键 — 从 DEFAULT_SETTINGS 自动推导，避免手动维护 */
const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/** 验证 provider ID 是否在注册表中 */
function isValidProvider(id: unknown): id is AIProviderId {
  return typeof id === 'string' && id in AI_PROVIDERS;
}

/** 数值型设置字段的合法范围 (min, max) */
const NUMERIC_BOUNDS: Partial<Record<keyof Settings, [number, number]>> = {
  aiChunkSize: [1, 200],
  aiConcurrency: [1, 10],
  limitCount: [1, 10000],
  fetchDelay: [0, 30000],
  writeDelay: [0, 30000],
  moveChunkSize: [1, 100],
  batchRestInterval: [1, 10000],
  batchRestMinutes: [0.1, 60],
  cacheScanInterval: [1, 120],
};

/** 校验并修正单个设置值 — 类型不匹配或越界时回退为默认值 */
function sanitizeValue<K extends keyof Settings>(key: K, value: unknown): Settings[K] {
  const def = DEFAULT_SETTINGS[key];
  // 类型不匹配时回退
  if (typeof value !== typeof def) return def;
  // 数值型字段范围校验
  const bounds = NUMERIC_BOUNDS[key];
  if (bounds && typeof value === 'number') {
    if (!Number.isFinite(value)) return def;
    return Math.max(bounds[0], Math.min(bounds[1], value)) as Settings[K];
  }
  return value as Settings[K];
}

/** 从 GM_getValue 加载所有设置 (数据驱动，无需逐字段手写) */
function loadFromStorage(): Settings {
  const entries = SETTINGS_KEYS.map(
    (key) => [key, sanitizeValue(key, gmGetValue('bfao_' + key, DEFAULT_SETTINGS[key]))] as const,
  );
  const result = Object.fromEntries(entries) as unknown as Settings;
  // 校验 provider 有效性，无效时回退为默认值
  if (!isValidProvider(result.provider)) {
    result.provider = DEFAULT_SETTINGS.provider;
  }
  // apiKey 按服务商隔离存储，优先读取当前服务商的 Key
  const providerKey = gmGetValue<string>('bfao_apiKey_' + result.provider, '');
  result.apiKey = providerKey;
  return result;
}

/** 保存设置到 GM_setValue */
function saveToStorage(s: Settings): void {
  for (const k of SETTINGS_KEYS) {
    if (s[k] !== undefined) {
      gmSetValue('bfao_' + k, s[k]);
    }
  }
  // 按服务商保存 API Key
  if (s.provider && s.apiKey !== undefined) {
    gmSetValue('bfao_apiKey_' + s.provider, s.apiKey);
  }
}

/** 创建持久化设置 store */
function createSettingsStore() {
  const store = writable<Settings>(loadFromStorage());

  return {
    subscribe: store.subscribe,

    /** 更新部分设置并持久化 */
    update(partial: Partial<Settings>) {
      store.update((current) => {
        const next = { ...current, ...partial };
        saveToStorage(next);
        return next;
      });
    },

    /** 重置为默认值 */
    reset() {
      store.set({ ...DEFAULT_SETTINGS });
      saveToStorage(DEFAULT_SETTINGS);
    },

    /** 获取当前快照 */
    get(): Settings {
      return get(store);
    },

    /** 从存储重新加载 */
    reload() {
      store.set(loadFromStorage());
    },
  };
}

export const settings = createSettingsStore();
