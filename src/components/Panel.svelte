<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tick } from 'svelte';
  import { gsap, EASINGS, shouldAnimateFunctional, shouldAnimate } from '$animations/gsap-config';
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
    folderSelect, previewConfirm, rejectAllModals,
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
  let settingsEl: HTMLElement;
  let mainAreaEl: HTMLElement;
  let ctx: gsap.Context;
  let settingsOpen = false;
  let settingsVisible = false;

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

  /** B3: 标签交叉淡入 — settings panel toggle with cross-fade */
  let prevSettingsOpen = false;
  $: if (settingsOpen !== prevSettingsOpen) {
    const opening = settingsOpen;
    prevSettingsOpen = settingsOpen;
    animateSettingsToggle(opening);
  }

  async function animateSettingsToggle(open: boolean) {
    if (!shouldAnimate()) {
      settingsVisible = open;
      return;
    }

    if (open) {
      settingsVisible = true;
      await tick();
      if (settingsEl) {
        gsap.fromTo(settingsEl,
          { opacity: 0, x: 15 },
          { opacity: 1, x: 0, duration: 0.3, ease: EASINGS.velvetSpring }
        );
      }
    } else {
      if (settingsEl) {
        gsap.to(settingsEl, {
          opacity: 0, x: -15, duration: 0.2, ease: EASINGS.silkOut,
          onComplete: () => { settingsVisible = false; }
        });
      } else {
        settingsVisible = false;
      }
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
    {#if settingsVisible}
      <div class="settings-wrapper" bind:this={settingsEl}>
        <SettingsPanel />
      </div>
    {/if}

    <div class="main-area" bind:this={mainAreaEl}>
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

{#if $folderSelect}
  <FolderSelector
    folders={$folderSelect.input}
    onconfirm={(ids) => folderSelect.resolve(ids)}
    onclose={() => folderSelect.reject()}
  />
{/if}

{#if $previewConfirm}
  <PreviewConfirm
    categories={$previewConfirm.input.categories}
    videos={$previewConfirm.input.videos}
    onconfirm={(data) => previewConfirm.resolve(data)}
    onclose={() => previewConfirm.reject()}
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

  .settings-wrapper {
    will-change: transform, opacity;
  }

  .main-area {
    padding: 0 15px 15px;
  }
</style>
