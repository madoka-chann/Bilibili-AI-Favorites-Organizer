import { get } from 'svelte/store';
import type { BiliData } from '$types/index';
import { cancelRequested, logs } from '$stores/state';
import { moveVideos, invalidateFolderCache } from '$api/bilibili';
import { humanDelay } from '$utils/timing';
import { gmGetValue, gmSetValue } from '$utils/gm';
import { MAX_UNDO_HISTORY } from '$utils/constants';
import { getErrorMessage } from '$utils/errors';
import { withRunningState } from '$utils/running-state';

export interface UndoRecord {
  time: string;
  timeLocal: string;
  totalVideos: number;
  totalCategories: number;
  sourceMediaIds: number[];
  moves: Array<{
    fromMediaId: number;
    toMediaId: number;
    resources: string;
    count: number;
  }>;
}

const UNDO_KEY = 'bfao_undoHistory';

/** 校验对象是否符合 UndoRecord 基本结构 */
function isValidUndoRecord(val: unknown): val is UndoRecord {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return Array.isArray(obj.moves) && obj.moves.length > 0;
}

/** 读取撤销历史栈 */
export function loadUndoHistory(): UndoRecord[] {
  try {
    const raw = gmGetValue(UNDO_KEY, null);
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isValidUndoRecord);
    }
    // 兼容旧版单条记录
    const oldRaw = gmGetValue('bfao_undoData', null);
    if (typeof oldRaw === 'string') {
      const oldData = JSON.parse(oldRaw);
      if (isValidUndoRecord(oldData)) return [oldData];
    }
    return [];
  } catch {
    return [];
  }
}

/** 保存一条撤销数据 (入栈) */
export function saveUndoData(record: UndoRecord): void {
  try {
    const history = loadUndoHistory();
    history.unshift(record);
    gmSetValue(UNDO_KEY, JSON.stringify(history.slice(0, MAX_UNDO_HISTORY)));
    gmSetValue('bfao_undoData', JSON.stringify(record));
  } catch (e: unknown) {
    logs.add(`保存撤销数据失败: ${getErrorMessage(e)}`, 'warning');
  }
}

/** 清除指定索引的撤销记录 */
export function clearUndoRecord(index: number): void {
  try {
    const history = loadUndoHistory();
    if (index >= 0 && index < history.length) {
      history.splice(index, 1);
    }
    gmSetValue(UNDO_KEY, JSON.stringify(history));
    gmSetValue('bfao_undoData', history.length > 0 ? JSON.stringify(history[0]) : null);
  } catch (e: unknown) {
    logs.add(`清除撤销数据失败: ${getErrorMessage(e)}`, 'warning');
  }
}

/** 执行撤销操作 */
export async function undoOperation(
  selectedIndex: number,
  biliData: BiliData,
  writeDelay: number,
): Promise<void> {
  const history = loadUndoHistory();
  const undo = history[selectedIndex];
  if (!undo?.moves?.length) {
    logs.add('撤销记录数据异常', 'error');
    return;
  }

  logs.add('正在撤销操作...', 'info');

  await withRunningState(async () => {
    let restored = 0;
    try {
      for (let i = 0; i < undo.moves.length; i++) {
        if (get(cancelRequested)) {
          logs.add('用户已取消撤销', 'warning');
          break;
        }
        const move = undo.moves[i];
        logs.add(`[${i + 1}/${undo.moves.length}] 移回 ${move.count} 个视频到原收藏夹...`, 'info');

        const ok = await moveVideos(move.toMediaId, move.fromMediaId, move.resources, biliData);
        if (ok) {
          restored += move.count;
        } else {
          logs.add(`第 ${i + 1} 批移回失败，跳过`, 'warning');
        }
        await humanDelay(writeDelay);
      }

      logs.add(`撤销完成！共恢复 ${restored} 个视频。请刷新页面。`, 'success');
      clearUndoRecord(selectedIndex);
      invalidateFolderCache();
    } catch (err: unknown) {
      logs.add(`撤销失败: ${getErrorMessage(err)}`, 'error');
    }
  }, { trackCancel: true });
}
