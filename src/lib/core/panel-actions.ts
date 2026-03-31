/**
 * Panel-level orchestration actions — extracted from Panel.svelte
 * to keep the component focused on UI rendering.
 */

import { get } from 'svelte/store';
import type { Settings, FavFolder } from '$lib/types';
import { isRunning, cancelRequested, logs } from '$lib/stores/state';
import { settings } from '$lib/stores/settings';
import { getBiliData, getSourceMediaId, getAllFoldersWithIds } from '$lib/api/bilibili';
import { startProcess } from '$lib/core/process';
import { exportLogs } from '$lib/core/export-logs';
import { backupFavorites, downloadBackupFile } from '$lib/core/backup';
import { loadUndoHistory, undoOperation } from '$lib/core/undo';
import { scanDeadVideos, archiveDeadVideos, deleteDeadVideos } from '$lib/core/dead-videos';
import type { DeadVideoEntry } from '$lib/core/dead-videos';
import { scanDuplicates, deduplicateVideos } from '$lib/core/duplicates';
import type { DuplicateEntry } from '$lib/core/duplicates';
import { loadHistory, clearHistory } from '$lib/core/history';

// ================= Auth Helper =================

export function ensureBiliData() {
  const biliData = getBiliData();
  if (!biliData.mid || !biliData.csrf) {
    logs.add('请先登录 B站', 'error');
    return null;
  }
  return biliData;
}

// ================= Running State Wrapper =================

interface RunningOpts {
  /** 是否在 finally 中重置 cancelRequested (默认 false) */
  resetCancel?: boolean;
}

/**
 * 通用的 "需要登录 + 设置 isRunning + try/catch/finally" 包装器。
 * 返回 action 的结果；若未登录则返回 fallback。
 */
async function withRunningState<T>(
  fallback: T,
  action: (biliData: import('$lib/types').BiliData, s: Settings) => Promise<T>,
  opts: RunningOpts = {},
): Promise<T> {
  const biliData = ensureBiliData();
  if (!biliData) return fallback;

  const s = get(settings);
  isRunning.set(true);
  if (opts.resetCancel) cancelRequested.set(false);

  try {
    return await action(biliData, s);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.add(`操作失败: ${msg}`, 'error');
    return fallback;
  } finally {
    isRunning.set(false);
    if (opts.resetCancel) cancelRequested.set(false);
  }
}

// ================= Start Process =================

export interface StartProcessCallbacks {
  openSettings: () => void;
}

export async function handleStart(callbacks: StartProcessCallbacks): Promise<void> {
  const s = get(settings);
  if (!s.apiKey && s.provider !== 'ollama') {
    callbacks.openSettings();
    logs.add('请先配置 API Key', 'warning');
    return;
  }
  const biliData = ensureBiliData();
  if (!biliData) return;
  try {
    await startProcess(s, biliData);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.add(`整理流程出错: ${msg}`, 'error');
    isRunning.set(false);
  }
}

// ================= Dead Videos =================

export interface DeadVideoState {
  deadVideos: DeadVideoEntry[];
  showDeadResult: boolean;
  deadProcessing: boolean;
}

export async function handleCleanDead(state: DeadVideoState): Promise<DeadVideoState> {
  return withRunningState(state, async (biliData, s) => {
    const deadVideos = await scanDeadVideos(biliData, s.fetchDelay);
    if (deadVideos.length === 0) {
      logs.add('没有发现失效视频！收藏夹很健康！', 'success');
      return { ...state, deadVideos, showDeadResult: false };
    }
    logs.add(`发现 ${deadVideos.length} 个失效视频`, 'warning');
    return { ...state, deadVideos, showDeadResult: true };
  }, { resetCancel: true });
}

export async function handleArchiveDead(deadVideos: DeadVideoEntry[]): Promise<boolean> {
  return withRunningState(false, async (biliData, s) => {
    const moved = await archiveDeadVideos(deadVideos, biliData, s.moveChunkSize, s.writeDelay);
    logs.add(`完成！共 ${moved} 个失效视频已归档。请刷新页面。`, 'success');
    return true;
  });
}

export async function handleDeleteDead(deadVideos: DeadVideoEntry[]): Promise<boolean> {
  return withRunningState(false, async (biliData, s) => {
    const deleted = await deleteDeadVideos(deadVideos, biliData, s.writeDelay);
    logs.add(`删除完成！共删除 ${deleted} 个失效视频。请刷新页面。`, 'success');
    return true;
  });
}

// ================= Duplicates =================

export interface DuplicateState {
  duplicates: DuplicateEntry[];
  showDupResult: boolean;
  dupProcessing: boolean;
}

export async function handleFindDups(state: DuplicateState): Promise<DuplicateState> {
  return withRunningState(state, async (biliData, s) => {
    const duplicates = await scanDuplicates(biliData, s.fetchDelay);
    if (duplicates.length === 0) {
      logs.add('没有发现重复视频！', 'success');
      return { ...state, duplicates, showDupResult: false };
    }
    logs.add(`发现 ${duplicates.length} 个重复视频`, 'warning');
    return { ...state, duplicates, showDupResult: true };
  }, { resetCancel: true });
}

export async function handleDedup(duplicates: DuplicateEntry[]): Promise<boolean> {
  return withRunningState(false, async (biliData, s) => {
    const removed = await deduplicateVideos(duplicates, biliData, s.writeDelay);
    logs.add(`去重完成！共删除 ${removed} 个重复副本。请刷新页面。`, 'success');
    return true;
  }, { resetCancel: true });
}

// ================= Undo =================

export async function handleUndoConfirm(index: number): Promise<void> {
  const biliData = ensureBiliData();
  if (!biliData) return;
  const s = get(settings);
  await undoOperation(index, biliData, s.writeDelay);
}

// ================= Backup =================

export async function handleBackup(): Promise<void> {
  const biliData = ensureBiliData();
  if (!biliData) return;
  const s = get(settings);
  const backup = await backupFavorites(biliData, s.fetchDelay);
  if (backup) {
    downloadBackupFile(backup);
    logs.add('备份文件已下载', 'success');
  }
}

// ================= Stats / Health =================

export interface StatsState {
  showStats: boolean;
  statsMode: 'stats' | 'health';
  statsFolders: FavFolder[];
  statsTotalVideos: number;
  statsDeadCount: number;
}

export async function handleStats(mode: 'stats' | 'health'): Promise<StatsState | null> {
  return withRunningState(null, async (biliData) => {
    logs.add('正在统计收藏夹信息...', 'info');
    const statsFolders = await getAllFoldersWithIds(biliData);
    const statsTotalVideos = statsFolders.reduce((s, f) => s + (f.media_count || 0), 0);
    logs.add(`统计完成：${statsFolders.length} 个收藏夹，${statsTotalVideos} 个视频`, 'success');
    return {
      showStats: true,
      statsMode: mode,
      statsFolders,
      statsTotalVideos,
      statsDeadCount: 0,
    };
  });
}

// ================= History =================

export function handleHistoryClear(): void {
  clearHistory();
  logs.add('整理历史已清空', 'success');
}
