/**
 * 进度追踪工具
 */

import {
  progressPhase, progressCurrent, progressTotal,
  type ProgressPhase,
} from '$stores/state';

/** 保存原始标题，用于进度结束后恢复 */
let originalTitle = '';

/** 更新进度状态并同步到文档标题 */
export function updateProgress(phase: ProgressPhase, current: number, total: number): void {
  if (!originalTitle) originalTitle = document.title;
  progressPhase.set(phase);
  progressCurrent.set(current);
  progressTotal.set(total);
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  document.title = `[${phase} ${pct}%] ${originalTitle}`;
}

/** 重置进度状态并恢复文档标题 */
export function resetProgress(): void {
  progressPhase.set('');
  progressCurrent.set(0);
  progressTotal.set(0);
  if (originalTitle) {
    document.title = originalTitle;
    originalTitle = '';
  }
}
