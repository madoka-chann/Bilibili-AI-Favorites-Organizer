/**
 * Panel modal 共享响应式状态 + handler 函数
 * 使用对象属性模式，避免 Svelte 5 "Cannot export reassigned state" 限制
 */

import {
  handleCleanDead, handleArchiveDead, handleDeleteDead,
  handleFindDups, handleDedup, handleUndoConfirm,
  handleStats, handleHistoryClear,
} from '$core/panel-actions';
import type { DeadVideoEntry } from '$core/dead-videos';
import type { DuplicateEntry } from '$core/duplicates';
import type { FavFolder } from '$types/index';

export const modals = $state({
  showDeadResult: false,
  deadVideos: [] as DeadVideoEntry[],
  deadProcessing: false,

  showDupResult: false,
  duplicates: [] as DuplicateEntry[],
  dupProcessing: false,

  showUndo: false,
  showHistory: false,

  showStats: false,
  statsMode: 'stats' as 'stats' | 'health',
  statsFolders: [] as FavFolder[],
  statsTotalVideos: 0,
  statsDeadCount: 0,

  showHelp: false,
});

// --- Handlers ---

export async function onCleanDead() {
  const result = await handleCleanDead({
    deadVideos: modals.deadVideos,
    showDeadResult: modals.showDeadResult,
    deadProcessing: modals.deadProcessing,
  });
  modals.deadVideos = result.deadVideos;
  modals.showDeadResult = result.showDeadResult;
}

export async function onArchiveDead() {
  modals.deadProcessing = true;
  const ok = await handleArchiveDead(modals.deadVideos);
  modals.deadProcessing = false;
  if (ok) modals.showDeadResult = false;
}

export async function onDeleteDead() {
  modals.deadProcessing = true;
  const ok = await handleDeleteDead(modals.deadVideos);
  modals.deadProcessing = false;
  if (ok) modals.showDeadResult = false;
}

export async function onFindDups() {
  const result = await handleFindDups({
    duplicates: modals.duplicates,
    showDupResult: modals.showDupResult,
    dupProcessing: modals.dupProcessing,
  });
  modals.duplicates = result.duplicates;
  modals.showDupResult = result.showDupResult;
}

export async function onDedup() {
  modals.dupProcessing = true;
  const ok = await handleDedup(modals.duplicates);
  modals.dupProcessing = false;
  if (ok) modals.showDupResult = false;
}

export function openUndo() { modals.showUndo = true; }
export function closeUndo() { modals.showUndo = false; }

export async function onUndoConfirm(index: number) {
  modals.showUndo = false;
  await handleUndoConfirm(index);
}

export async function onStatsClick(mode: 'stats' | 'health') {
  const result = await handleStats(mode);
  if (result) {
    modals.showStats = result.showStats;
    modals.statsMode = result.statsMode;
    modals.statsFolders = result.statsFolders;
    modals.statsTotalVideos = result.statsTotalVideos;
    modals.statsDeadCount = result.statsDeadCount;
  }
}

export function onHistoryClear() {
  handleHistoryClear();
  modals.showHistory = false;
}

export function openHelp() { modals.showHelp = true; }
export function closeHelp() { modals.showHelp = false; }
export function openHistory() { modals.showHistory = true; }
export function closeHistory() { modals.showHistory = false; }
export function closeDeadResult() { modals.showDeadResult = false; }
export function closeDupResult() { modals.showDupResult = false; }
export function closeStats() { modals.showStats = false; }

/** 重置所有 modal 状态 */
export function resetAll() {
  modals.showDeadResult = false;
  modals.showDupResult = false;
  modals.showUndo = false;
  modals.showHistory = false;
  modals.showStats = false;
  modals.showHelp = false;
}
