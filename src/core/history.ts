import { gmGetValue, gmSetValue } from '$utils/gm';

export interface HistoryEntry {
  time: string;
  videoCount: number;
  categoryCount: number;
  categories: string;
}

const HISTORY_KEY = 'bfao_history';
const MAX_HISTORY = 20;

/** 读取整理历史 */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = gmGetValue(HISTORY_KEY, '[]');
    const parsed = JSON.parse(raw as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 保存一条整理历史 */
export function saveHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory();
  history.unshift(entry);
  gmSetValue(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

/** 清空整理历史 */
export function clearHistory(): void {
  gmSetValue(HISTORY_KEY, '[]');
}
