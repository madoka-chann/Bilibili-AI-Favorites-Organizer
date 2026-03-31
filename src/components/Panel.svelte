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
  import { loadUndoHistory } from '$lib/core/undo';
  import { loadHistory } from '$lib/core/history';
  import { exportLogs } from '$lib/core/export-logs';
  import {
    handleStart, handleCleanDead, handleArchiveDead, handleDeleteDead,
    handleFindDups, handleDedup, handleUndoConfirm, handleBackup,
    handleStats, handleHistoryClear, type StatsState,
  } from '$lib/core/panel-actions';
  import type { DeadVideoEntry } from '$lib/core/dead-videos';
  import type { DuplicateEntry } from '$lib/core/duplicates';
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
      if (e.ctrlKey && e.key === 'Enter' && !$isRunning) onStart();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  onDestroy(() => { ctx?.revert(); });

  function doClose() {
    if (!panelEl) { onclose?.(); return; }
    if (shouldAnimateFunctional()) {
      gsap.to(panelEl, { y: 32, scale: 0.9, rotation: 0.5, opacity: 0, filter: 'blur(6px)', duration: 0.35, ease: EASINGS.silkOut, onComplete: () => onclose?.() });
    } else {
      onclose?.();
    }
  }

  function onStart() { handleStart({ openSettings: () => { settingsOpen = true; } }); }

  async function onCleanDead() {
    const result = await handleCleanDead({ deadVideos, showDeadResult, deadProcessing });
    deadVideos = result.deadVideos;
    showDeadResult = result.showDeadResult;
  }

  async function onArchiveDead() {
    deadProcessing = true;
    const ok = await handleArchiveDead(deadVideos);
    deadProcessing = false;
    if (ok) showDeadResult = false;
  }

  async function onDeleteDead() {
    deadProcessing = true;
    const ok = await handleDeleteDead(deadVideos);
    deadProcessing = false;
    if (ok) showDeadResult = false;
  }

  async function onFindDups() {
    const result = await handleFindDups({ duplicates, showDupResult, dupProcessing });
    duplicates = result.duplicates;
    showDupResult = result.showDupResult;
  }

  async function onDedup() {
    dupProcessing = true;
    const ok = await handleDedup(duplicates);
    dupProcessing = false;
    if (ok) showDupResult = false;
  }

  function handleUndo() {
    showUndo = true;
  }

  async function onUndoConfirm(index: number) {
    showUndo = false;
    await handleUndoConfirm(index);
  }

  async function onStatsClick(mode: 'stats' | 'health') {
    const result = await handleStats(mode);
    if (result) {
      showStats = result.showStats;
      statsMode = result.statsMode;
      statsFolders = result.statsFolders;
      statsTotalVideos = result.statsTotalVideos;
      statsDeadCount = result.statsDeadCount;
    }
  }

  function onHistoryClear() {
    handleHistoryClear();
    showHistory = false;
  }
</script>

<div class="panel" bind:this={panelEl}>
  <Header onclose={doClose} bind:settingsOpen />

  <div class="panel-content">
    {#if settingsOpen}
      <SettingsPanel />
    {/if}

    <div class="main-area">
      <PromptEditor />
      <LogArea />
      <ProgressBar />
      <ActionButtons
        onstart={onStart}
        onstop={() => { cancelRequested.set(true); rejectAllModals(); logs.add('正在停止...', 'warning'); }}
        oncleandead={onCleanDead}
        onfinddups={onFindDups}
        onundo={handleUndo}
        onbackup={handleBackup}
        onstats={() => onStatsClick('stats')}
        onhealth={() => onStatsClick('health')}
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
    onarchive={onArchiveDead}
    ondelete={onDeleteDead}
    onclose={() => { showDeadResult = false; }}
  />
{/if}

{#if showDupResult}
  <DuplicatesResult
    {duplicates}
    processing={dupProcessing}
    ondedup={onDedup}
    onclose={() => { showDupResult = false; }}
  />
{/if}

{#if showUndo}
  <UndoDialog
    history={loadUndoHistory()}
    onundo={onUndoConfirm}
    onclose={() => { showUndo = false; }}
  />
{/if}

{#if showHistory}
  <HistoryTimeline
    history={loadHistory()}
    onclear={onHistoryClear}
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
    folders={$folderSelectRequest.input}
    onconfirm={(ids) => resolveFolderSelect(ids)}
    onclose={() => rejectFolderSelect()}
  />
{/if}

{#if $previewConfirmRequest}
  <PreviewConfirm
    categories={$previewConfirmRequest.input.categories}
    videos={$previewConfirmRequest.input.videos}
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
