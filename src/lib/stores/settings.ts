import { writable, get } from 'svelte/store';
import type { Settings } from '$lib/types';
import { DEFAULT_SETTINGS } from '$lib/types';
import { gmGetValue, gmSetValue } from '$lib/utils/gm';

/** 从 GM_getValue 加载所有设置 */
function loadFromStorage(): Settings {
  const provider = gmGetValue('bfao_provider', DEFAULT_SETTINGS.provider);
  const apiKey =
    gmGetValue('bfao_apiKey_' + provider, '') ||
    gmGetValue('bfao_apiKey', '');

  return {
    provider,
    customBaseUrl: gmGetValue('bfao_customBaseUrl', DEFAULT_SETTINGS.customBaseUrl),
    apiKey,
    modelName: gmGetValue('bfao_modelName', DEFAULT_SETTINGS.modelName),
    aiChunkSize: gmGetValue('bfao_aiChunkSize', DEFAULT_SETTINGS.aiChunkSize),
    aiConcurrency: gmGetValue('bfao_aiConcurrency', DEFAULT_SETTINGS.aiConcurrency),
    limitEnabled: gmGetValue('bfao_limitEnabled', DEFAULT_SETTINGS.limitEnabled),
    limitCount: gmGetValue('bfao_limitCount', DEFAULT_SETTINGS.limitCount),
    fetchDelay: gmGetValue('bfao_fetchDelay', DEFAULT_SETTINGS.fetchDelay),
    writeDelay: gmGetValue('bfao_writeDelay', DEFAULT_SETTINGS.writeDelay),
    moveChunkSize: gmGetValue('bfao_moveChunkSize', DEFAULT_SETTINGS.moveChunkSize),
    skipDeadVideos: gmGetValue('bfao_skipDeadVideos', DEFAULT_SETTINGS.skipDeadVideos),
    lastPrompt: gmGetValue('bfao_lastPrompt', DEFAULT_SETTINGS.lastPrompt),
    adaptiveRate: gmGetValue('bfao_adaptiveRate', DEFAULT_SETTINGS.adaptiveRate),
    notifyOnComplete: gmGetValue('bfao_notifyOnComplete', DEFAULT_SETTINGS.notifyOnComplete),
    multiFolderEnabled: gmGetValue('bfao_multiFolderEnabled', DEFAULT_SETTINGS.multiFolderEnabled),
    animEnabled: gmGetValue('bfao_animEnabled', DEFAULT_SETTINGS.animEnabled),
    incrementalMode: gmGetValue('bfao_incrementalMode', DEFAULT_SETTINGS.incrementalMode),
    batchRestInterval: gmGetValue('bfao_batchRestInterval', DEFAULT_SETTINGS.batchRestInterval),
    batchRestMinutes: gmGetValue('bfao_batchRestMinutes', DEFAULT_SETTINGS.batchRestMinutes),
    bgCacheEnabled: gmGetValue('bfao_bgCacheEnabled', DEFAULT_SETTINGS.bgCacheEnabled),
    cacheScanInterval: gmGetValue('bfao_cacheScanInterval', DEFAULT_SETTINGS.cacheScanInterval),
  };
}

/** 所有持久化键 — 从 DEFAULT_SETTINGS 自动推导，避免手动维护 */
const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

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
