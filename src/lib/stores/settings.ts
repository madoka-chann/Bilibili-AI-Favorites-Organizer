import { writable, get } from 'svelte/store';
import type { Settings } from '$lib/types';
import { DEFAULT_SETTINGS } from '$lib/types';
import { gmGetValue, gmSetValue } from '$lib/utils/gm';

/** 所有持久化键 — 从 DEFAULT_SETTINGS 自动推导，避免手动维护 */
const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/** 从 GM_getValue 加载所有设置 (数据驱动，无需逐字段手写) */
function loadFromStorage(): Settings {
  const entries = SETTINGS_KEYS.map(
    (key) => [key, gmGetValue('bfao_' + key, DEFAULT_SETTINGS[key])] as const,
  );
  const result = Object.fromEntries(entries) as Settings;
  // apiKey 按服务商隔离存储，优先读取当前服务商的 Key
  const providerKey = gmGetValue('bfao_apiKey_' + result.provider, '');
  if (providerKey) result.apiKey = providerKey;
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
