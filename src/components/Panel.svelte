<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap, EASINGS } from '$animations/gsap-config';
  import { shouldAnimateFunctional } from '$animations/gsap-config';
  import Header from './Header.svelte';
  import SettingsPanel from './SettingsPanel.svelte';
  import PromptEditor from './PromptEditor.svelte';
  import LogArea from './LogArea.svelte';
  import ProgressBar from './ProgressBar.svelte';
  import ActionButtons from './ActionButtons.svelte';
  import DeadVideosResult from './DeadVideosResult.svelte';
  import DuplicatesResult from './DuplicatesResult.svelte';
  import UndoDialog from './UndoDialog.svelte';
  import HistoryTimeline from './HistoryTimeline.svelte';
  import StatsDialog from './StatsDialog.svelte';
  import FolderSelector from './FolderSelector.svelte';
  import PreviewConfirm from './PreviewConfirm.svelte';
  import { isRunning, cancelRequested, logs } from '$lib/stores/state';
  import {
    folderSelectRequest, resolveFolderSelect, rejectFolderSelect,
    previewConfirmRequest, resolvePreviewConfirm, rejectPreviewConfirm,
    rejectAllModals,
  } from '$lib/stores/modal-bridge';
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
  import type { FavFolder } from '$lib/types';

  export let onclose: (() => void) | undefined = undefined;

  let panelEl: HTMLDivElement;
  let ctx: gsap.Context;
  let settingsOpen = false;

  // Modal 状态
  let showDeadResult = false;
  let deadVideos: DeadVideoEntry[] = [];
  let deadProcessing = false;

  let showDupResult = false;
  let duplicates: DuplicateEntry[] = [];
  let dupProcessing = false;

  let showUndo = false;

  let showHistory = false;

  let showStats = false;
  let statsMode: 'stats' | 'health' = 'stats';
  let statsFolders: FavFolder[] = [];
  let statsTotalVideos = 0;
  let statsDeadCount = 0;

  onMount(() => {
    ctx = gsap.context(() => {
      if (shouldAnimateFunctional()) {
        gsap.fromTo(panelEl,
          { y: 48, scale: 0.86, rotation: -0.35, opacity: 0, filter: 'blur(14px) brightness(1.06) saturate(0.72)' },
          { y: 0, scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px) brightness(1) saturate(1)', duration: 0.5, ease: EASINGS.velvetSpring }
        );
      }
    }, panelEl);

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !$isRunning) handleStart();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  onDestroy(() => { ctx?.revert(); });

  function handleClose() {
    if (!panelEl) { onclose?.(); return; }
    if (shouldAnimateFunctional()) {
      gsap.to(panelEl, { y: 32, scale: 0.9, rotation: 0.5, opacity: 0, filter: 'blur(6px)', duration: 0.35, ease: EASINGS.silkOut, onComplete: () => onclose?.() });
    } else {
      onclose?.();
    }
  }

  function ensureBiliData() {
    const biliData = getBiliData();
    if (!biliData.mid || !biliData.csrf) {
      logs.add('请先登录 B站', 'error');
      return null;
    }
    return biliData;
  }

  async function handleStart() {
    const s = $settings;
    if (!s.apiKey && s.provider !== 'ollama') {
      settingsOpen = true;
      logs.add('请先配置 API Key', 'warning');
      return;
    }
    const biliData = ensureBiliData();
    if (!biliData) return;
    try {
      await startProcess(s, biliData);
    } catch (e: any) {
      logs.add(`整理流程出错: ${e.message}`, 'error');
      isRunning.set(false);
    }
  }

  // ========== 失效视频归档 ==========
  async function handleCleanDead() {
    const biliData = ensureBiliData();
    if (!biliData) return;

    isRunning.set(true);
    cancelRequested.set(false);
    try {
      deadVideos = await scanDeadVideos(biliData, $settings.fetchDelay);
      if (deadVideos.length === 0) {
        logs.add('没有发现失效视频！收藏夹很健康！', 'success');
      } else {
        logs.add(`发现 ${deadVideos.length} 个失效视频`, 'warning');
        showDeadResult = true;
      }
    } catch (e: any) {
      logs.add(`扫描失败: ${e.message}`, 'error');
    } finally {
      isRunning.set(false);
      cancelRequested.set(false);
    }
  }

  async function handleArchiveDead() {
    const biliData = ensureBiliData();
    if (!biliData) return;
    deadProcessing = true;
    isRunning.set(true);
    try {
      const moved = await archiveDeadVideos(deadVideos, biliData, $settings.moveChunkSize, $settings.writeDelay);
      logs.add(`完成！共 ${moved} 个失效视频已归档。请刷新页面。`, 'success');
      showDeadResult = false;
    } catch (e: any) {
      logs.add(`归档失败: ${e.message}`, 'error');
    } finally {
      deadProcessing = false;
      isRunning.set(false);
    }
  }

  async function handleDeleteDead() {
    const biliData = ensureBiliData();
    if (!biliData) return;
    deadProcessing = true;
    isRunning.set(true);
    try {
      const deleted = await deleteDeadVideos(deadVideos, biliData, $settings.writeDelay);
      logs.add(`删除完成！共删除 ${deleted} 个失效视频。请刷新页面。`, 'success');
      showDeadResult = false;
    } catch (e: any) {
      logs.add(`删除失败: ${e.message}`, 'error');
    } finally {
      deadProcessing = false;
      isRunning.set(false);
    }
  }

  // ========== 跨收藏夹去重 ==========
  async function handleFindDups() {
    const biliData = ensureBiliData();
    if (!biliData) return;

    isRunning.set(true);
    cancelRequested.set(false);
    try {
      duplicates = await scanDuplicates(biliData, $settings.fetchDelay);
      if (duplicates.length === 0) {
        logs.add('没有发现重复视频！', 'success');
      } else {
        logs.add(`发现 ${duplicates.length} 个重复视频`, 'warning');
        showDupResult = true;
      }
    } catch (e: any) {
      logs.add(`扫描失败: ${e.message}`, 'error');
    } finally {
      isRunning.set(false);
      cancelRequested.set(false);
    }
  }

  async function handleDedup() {
    const biliData = ensureBiliData();
    if (!biliData) return;
    dupProcessing = true;
    isRunning.set(true);
    cancelRequested.set(false);
    try {
      const removed = await deduplicateVideos(duplicates, biliData, $settings.writeDelay);
      logs.add(`去重完成！共删除 ${removed} 个重复副本。请刷新页面。`, 'success');
      showDupResult = false;
    } catch (e: any) {
      logs.add(`去重失败: ${e.message}`, 'error');
    } finally {
      dupProcessing = false;
      isRunning.set(false);
      cancelRequested.set(false);
    }
  }

  // ========== 撤销 ==========
  function handleUndo() {
    showUndo = true;
  }

  async function handleUndoConfirm(index: number) {
    const biliData = ensureBiliData();
    if (!biliData) return;
    showUndo = false;
    await undoOperation(index, biliData, $settings.writeDelay);
  }

  // ========== 备份 ==========
  async function handleBackup() {
    const biliData = ensureBiliData();
    if (!biliData) return;
    const backup = await backupFavorites(biliData, $settings.fetchDelay);
    if (backup) {
      downloadBackupFile(backup);
      logs.add('备份文件已下载', 'success');
    }
  }

  // ========== 统计/健康 ==========
  async function handleStats(mode: 'stats' | 'health') {
    const biliData = ensureBiliData();
    if (!biliData) return;

    statsMode = mode;
    isRunning.set(true);
    logs.add('正在统计收藏夹信息...', 'info');

    try {
      statsFolders = await getAllFoldersWithIds(biliData);
      statsTotalVideos = statsFolders.reduce((s, f) => s + (f.media_count || 0), 0);

      // 快速估算失效视频数（仅基于文件夹信息）
      statsDeadCount = 0;
      showStats = true;
      logs.add(`统计完成：${statsFolders.length} 个收藏夹，${statsTotalVideos} 个视频`, 'success');
    } catch (e: any) {
      logs.add(`统计失败: ${e.message}`, 'error');
    } finally {
      isRunning.set(false);
    }
  }

  // ========== 历史时间线 ==========
  function handleHistoryClear() {
    clearHistory();
    showHistory = false;
    logs.add('整理历史已清空', 'success');
  }
</script>

<div class="panel" bind:this={panelEl}>
  <Header onclose={handleClose} bind:settingsOpen />

  <div class="panel-content">
    {#if settingsOpen}
      <SettingsPanel />
    {/if}

    <div class="main-area">
      <PromptEditor />
      <LogArea />
      <ProgressBar />
      <ActionButtons
        onstart={handleStart}
        onstop={() => { cancelRequested.set(true); rejectAllModals(); logs.add('正在停止...', 'warning'); }}
        oncleandead={handleCleanDead}
        onfinddups={handleFindDups}
        onundo={handleUndo}
        onbackup={handleBackup}
        onstats={() => handleStats('stats')}
        onhealth={() => handleStats('health')}
        onexportlogs={exportLogs}
        onhelp={() => logs.add('帮助: github.com/madoka-chann/Bilibili-AI-Favorites-Organizer', 'info')}
        onhistory={() => { showHistory = true; }}
      />
    </div>
  </div>
</div>

<!-- Modals -->
{#if showDeadResult}
  <DeadVideosResult
    {deadVideos}
    processing={deadProcessing}
    onarchive={handleArchiveDead}
    ondelete={handleDeleteDead}
    onclose={() => { showDeadResult = false; }}
  />
{/if}

{#if showDupResult}
  <DuplicatesResult
    {duplicates}
    processing={dupProcessing}
    ondedup={handleDedup}
    onclose={() => { showDupResult = false; }}
  />
{/if}

{#if showUndo}
  <UndoDialog
    history={loadUndoHistory()}
    onundo={handleUndoConfirm}
    onclose={() => { showUndo = false; }}
  />
{/if}

{#if showHistory}
  <HistoryTimeline
    history={loadHistory()}
    onclear={handleHistoryClear}
    onclose={() => { showHistory = false; }}
  />
{/if}

{#if showStats}
  <StatsDialog
    folders={statsFolders}
    totalVideos={statsTotalVideos}
    deadCount={statsDeadCount}
    mode={statsMode}
    onclose={() => { showStats = false; }}
  />
{/if}

{#if $folderSelectRequest}
  <FolderSelector
    folders={$folderSelectRequest.folders}
    onconfirm={(ids) => resolveFolderSelect(ids)}
    onclose={() => rejectFolderSelect()}
  />
{/if}

{#if $previewConfirmRequest}
  <PreviewConfirm
    categories={$previewConfirmRequest.categories}
    videos={$previewConfirmRequest.videos}
    onconfirm={(data) => resolvePreviewConfirm(data)}
    onclose={() => rejectPreviewConfirm()}
  />
{/if}

<style>
  .panel {
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 2147483641;
    width: min(400px, calc(100vw - 60px));
    display: flex;
    flex-direction: column;
    background: var(--ai-bg);
    color: var(--ai-text);
    box-shadow: var(--ai-shadow-lg);
    border-radius: 28px;
    overflow: visible;
    will-change: transform, opacity;
    backdrop-filter: blur(20px) saturate(1.2);
  }

  .panel-content {
    flex: 1 1 0%;
    min-height: 0;
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
    border-bottom-left-radius: 26px;
    border-bottom-right-radius: 26px;
  }

  .main-area {
    padding: 0 15px 15px;
  }
</style>
