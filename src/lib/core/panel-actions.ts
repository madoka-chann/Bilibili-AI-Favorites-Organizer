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
import { getErrorMessage } from '$lib/utils/errors';
import { withRunningState } from '$lib/utils/running-state';

// ================= Auth Helper =================

export function ensureBiliData() {
  const biliData = getBiliData();
  if (!biliData.mid || !biliData.csrf) {
    logs.add('请先登录 B站', 'error');
    return null;
  }
  return biliData;
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
    logs.add(`整理流程出错: ${getErrorMessage(e)}`, 'error');
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
  const biliData = ensureBiliData();
  if (!biliData) return state;

  const s = get(settings);
  return withRunningState(async () => {
    try {
      const deadVideos = await scanDeadVideos(biliData, s.fetchDelay);
      if (deadVideos.length === 0) {
        logs.add('没有发现失效视频！收藏夹很健康！', 'success');
        return { ...state, deadVideos, showDeadResult: false };
      } else {
        logs.add(`发现 ${deadVideos.length} 个失效视频`, 'warning');
        return { ...state, deadVideos, showDeadResult: true };
      }
    } catch (e: unknown) {
      logs.add(`扫描失败: ${getErrorMessage(e)}`, 'error');
      return state;
    }
  }, { trackCancel: true });
}

export async function handleArchiveDead(deadVideos: DeadVideoEntry[]): Promise<boolean> {
  const biliData = ensureBiliData();
  if (!biliData) return false;
  const s = get(settings);
  return withRunningState(async () => {
    try {
      const moved = await archiveDeadVideos(deadVideos, biliData, s.moveChunkSize, s.writeDelay);
      logs.add(`完成！共 ${moved} 个失效视频已归档。请刷新页面。`, 'success');
      return true;
    } catch (e: unknown) {
      logs.add(`归档失败: ${getErrorMessage(e)}`, 'error');
      return false;
    }
  });
}

export async function handleDeleteDead(deadVideos: DeadVideoEntry[]): Promise<boolean> {
  const biliData = ensureBiliData();
  if (!biliData) return false;
  const s = get(settings);
  return withRunningState(async () => {
    try {
      const deleted = await deleteDeadVideos(deadVideos, biliData, s.writeDelay);
      logs.add(`删除完成！共删除 ${deleted} 个失效视频。请刷新页面。`, 'success');
      return true;
    } catch (e: unknown) {
      logs.add(`删除失败: ${getErrorMessage(e)}`, 'error');
      return false;
    }
  });
}

// ================= Duplicates =================

export interface DuplicateState {
  duplicates: DuplicateEntry[];
  showDupResult: boolean;
  dupProcessing: boolean;
}

export async function handleFindDups(state: DuplicateState): Promise<DuplicateState> {
  const biliData = ensureBiliData();
  if (!biliData) return state;

  const s = get(settings);
  return withRunningState(async () => {
    try {
      const duplicates = await scanDuplicates(biliData, s.fetchDelay);
      if (duplicates.length === 0) {
        logs.add('没有发现重复视频！', 'success');
        return { ...state, duplicates, showDupResult: false };
      } else {
        logs.add(`发现 ${duplicates.length} 个重复视频`, 'warning');
        return { ...state, duplicates, showDupResult: true };
      }
    } catch (e: unknown) {
      logs.add(`扫描失败: ${getErrorMessage(e)}`, 'error');
      return state;
    }
  }, { trackCancel: true });
}

export async function handleDedup(duplicates: DuplicateEntry[]): Promise<boolean> {
  const biliData = ensureBiliData();
  if (!biliData) return false;
  const s = get(settings);
  return withRunningState(async () => {
    try {
      const removed = await deduplicateVideos(duplicates, biliData, s.writeDelay);
      logs.add(`去重完成！共删除 ${removed} 个重复副本。请刷新页面。`, 'success');
      return true;
    } catch (e: unknown) {
      logs.add(`去重失败: ${getErrorMessage(e)}`, 'error');
      return false;
    }
  }, { trackCancel: true });
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
  const biliData = ensureBiliData();
  if (!biliData) return null;

  logs.add('正在统计收藏夹信息...', 'info');
  return withRunningState(async () => {
    try {
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
    } catch (e: unknown) {
      logs.add(`统计失败: ${getErrorMessage(e)}`, 'error');
      return null;
    }
  });
}

// ================= History =================

export function handleHistoryClear(): void {
  clearHistory();
  logs.add('整理历史已清空', 'success');
}
