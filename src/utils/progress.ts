/**
 * 进度追踪工具
 */

import {
  progressPhase, progressCurrent, progressTotal,
  type ProgressPhase,
} from '$stores/state';

/** 更新进度状态并同步到文档标题 */
export function updateProgress(phase: ProgressPhase, current: number, total: number): void {
  progressPhase.set(phase);
  progressCurrent.set(current);
  progressTotal.set(total);
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.title = `[${phase} ${pct}%] B站收藏夹整理`;
}

/** 重置进度状态并清理文档标题 */
export function resetProgress(): void {
  progressPhase.set('');
  progressCurrent.set(0);
  progressTotal.set(0);
  document.title = document.title.replace(/^\[.*?\]\s*/, '');
}
