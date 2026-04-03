/**
 * 进度追踪工具 — 三阶段连续进度 (0-100%)
 * fetch=30%, ai=50%, move=20%
 */

import {
  progressPhase, progressCurrent, progressTotal,
  type ProgressPhase,
} from '$stores/state';

/** Phase weight allocation */
const PHASE_WEIGHTS: Record<string, { offset: number; weight: number }> = {
  fetch: { offset: 0, weight: 30 },
  ai:    { offset: 30, weight: 50 },
  move:  { offset: 80, weight: 20 },
};

/** 保存原始标题，用于进度结束后恢复 */
let originalTitle = '';

/** 更新进度状态并同步到文档标题 */
export function updateProgress(phase: ProgressPhase, current: number, total: number): void {
  if (!originalTitle) originalTitle = document.title;
  progressPhase.set(phase);
  progressCurrent.set(current);
  progressTotal.set(total);

  // Calculate continuous percentage
  const pw = PHASE_WEIGHTS[phase];
  const phasePercent = total > 0 ? (current / total) : 0;
  const continuousPercent = pw
    ? Math.round(pw.offset + phasePercent * pw.weight)
    : 0;

  document.title = `[${phase} ${continuousPercent}%] ${originalTitle}`;
}

/** Get continuous progress 0-100 from current phase state (always integer) */
export function getContinuousPercent(phase: string, current: number, total: number): number {
  const pw = PHASE_WEIGHTS[phase];
  if (!pw) return 0;
  const phasePercent = total > 0 ? (current / total) : 0;
  return Math.min(100, Math.round(pw.offset + phasePercent * pw.weight));
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
