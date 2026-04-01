import { writable, derived } from 'svelte/store';

// ================= 运行时状态 =================

/** 面板是否打开 */
export const panelOpen = writable(false);

/** 是否正在运行整理流程 */
export const isRunning = writable(false);

/** 是否请求取消 */
export const cancelRequested = writable(false);

// ================= 进度追踪 =================

export type ProgressPhase = '' | 'fetch' | 'ai' | 'move';

export const progressPhase = writable<ProgressPhase>('');
export const progressCurrent = writable(0);
export const progressTotal = writable(0);
export const progressStartTime = writable(0);

/** 进度百分比 (0-100) */
export const progressPercent = derived(
  [progressCurrent, progressTotal],
  ([$current, $total]) => ($total > 0 ? Math.min(100, Math.round(($current / $total) * 100)) : 0)
);

// ================= 自适应限速状态 =================

export interface AdaptiveState {
  rateLimitHits: number;
  successStreak: number;
  currentFetchDelay: number;
  currentWriteDelay: number;
}

export const adaptive = writable<AdaptiveState>({
  rateLimitHits: 0,
  successStreak: 0,
  currentFetchDelay: 0,
  currentWriteDelay: 0,
});

// ================= 日志 =================

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  level: LogLevel;
}

let logIdCounter = 0;
const MAX_LOG_ENTRIES = 500;

function createLogStore() {
  const store = writable<LogEntry[]>([]);

  return {
    subscribe: store.subscribe,

    add(message: string, level: LogLevel = 'info') {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      store.update((entries) => {
        const updated = [...entries, { id: ++logIdCounter, time, message, level }];
        return updated.length > MAX_LOG_ENTRIES ? updated.slice(-MAX_LOG_ENTRIES) : updated;
      });
    },

    clear() {
      store.set([]);
    },
  };
}

export const logs = createLogStore();

// ================= Token 用量 =================

export interface TokenUsageState {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  callCount: number;
}

export const tokenUsage = writable<TokenUsageState>({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  callCount: 0,
});

export function resetTokenUsage() {
  tokenUsage.set({ promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0 });
}
