<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tick } from 'svelte';
  import { gsap, Flip, Draggable, EASINGS, shouldAnimateFunctional, shouldAnimate } from '$animations/gsap-config';
  import { gmGetValue, gmSetValue } from '$utils/gm';
  import { parallax } from '$actions/parallax';
  import { panelCanvas } from '$actions/panel-canvas';
  import { cursorScatter } from '$actions/cursor-scatter';
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
  import { isRunning, cancelRequested, logs } from '$stores/state';
  import {
    folderSelect, previewConfirm, rejectAllModals,
  } from '$stores/modal-bridge';
  import { loadUndoHistory } from '$core/undo';
  import { loadHistory } from '$core/history';
  import { exportLogs } from '$core/export-logs';
  import {
    handleStart, handleCleanDead, handleArchiveDead, handleDeleteDead,
    handleFindDups, handleDedup, handleUndoConfirm, handleBackup,
    handleStats, handleHistoryClear,
  } from '$core/panel-actions';
  import type { DeadVideoEntry } from '$core/dead-videos';
  import type { DuplicateEntry } from '$core/duplicates';
  import type { FavFolder } from '$types/index';

  interface Props {
    onclose?: () => void;
    flipState?: Flip.FlipState | null;
  }

  let { onclose, flipState = null }: Props = $props();

  let panelEl = $state<HTMLDivElement>(undefined!);
  let headerEl = $state<HTMLElement>(undefined!);
  let settingsEl = $state<HTMLElement>(undefined!);
  let ctx: gsap.Context;
  let settingsOpen = $state(false);
  let settingsVisible = $state(false);
  let abortCtrl: AbortController;

  // Modal 状态
  let showDeadResult = $state(false);
  let deadVideos = $state<DeadVideoEntry[]>([]);
  let deadProcessing = $state(false);

  let showDupResult = $state(false);
  let duplicates = $state<DuplicateEntry[]>([]);
  let dupProcessing = $state(false);

  let showUndo = $state(false);

  let showHistory = $state(false);

  let showStats = $state(false);
  let statsMode = $state<'stats' | 'health'>('stats');
  let statsFolders = $state<FavFolder[]>([]);
  let statsTotalVideos = $state(0);
  let statsDeadCount = $state(0);

  /** K3: 恢复保存的面板位置，钳制到视口范围内 */
  function restoreSavedPosition() {
    const savedPos = gmGetValue('bfao_panelPos', null as { top: number; left: number } | null);
    if (savedPos && panelEl) {
      const rect = panelEl.getBoundingClientRect();
      panelEl.style.top = Math.max(0, Math.min(savedPos.top, window.innerHeight - rect.height)) + 'px';
      panelEl.style.left = Math.max(0, Math.min(savedPos.left, window.innerWidth - rect.width)) + 'px';
      panelEl.style.bottom = 'auto';
    }
  }

  onMount(() => {
    restoreSavedPosition();

    ctx = gsap.context(() => {
      if (flipState && shouldAnimate() && Flip) {
        // A4: FLIP 变形 — 从 FloatButton 位置形变为面板
        gsap.set(panelEl, { opacity: 1 });
        Flip.from(flipState, {
          targets: panelEl,
          duration: 0.55,
          ease: EASINGS.velvetSpring,
          scale: true,
          absolute: true,
          prune: true,
          onComplete: () => {
            gsap.set(panelEl, { clearProps: 'all' });
            restoreSavedPosition();
          },
        });
      } else if (shouldAnimateFunctional()) {
        // B1: 丝绒绽放 (fallback when no Flip state)
        gsap.fromTo(panelEl,
          { y: 48, scale: 0.86, rotation: -0.35, opacity: 0, filter: 'blur(14px) brightness(1.06) saturate(0.72)' },
          { y: 0, scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px) brightness(1) saturate(1)', duration: 0.5, ease: EASINGS.velvetSpring }
        );
      }

      // K2: 面板拖拽 (header 作为拖拽触发区域)
      if (headerEl) {
        Draggable.create(panelEl, {
          type: 'left,top',
          trigger: headerEl,
          bounds: document.body,
          edgeResistance: 0.65,
          inertia: false,
          cursor: 'grab',
          activeCursor: 'grabbing',
          onDragStart() {
            if (shouldAnimate()) {
              gsap.to(panelEl, { scale: 0.98, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', duration: 0.2 });
            }
          },
          onDragEnd() {
            if (shouldAnimate()) {
              gsap.to(panelEl, { scale: 1, boxShadow: '', duration: 0.35, ease: EASINGS.prismBounce });
            }
            // K3: 持久化面板位置
            const rect = panelEl.getBoundingClientRect();
            panelEl.style.bottom = 'auto';
            gmSetValue('bfao_panelPos', { top: rect.top, left: rect.left });
          },
        });
      }
    }, panelEl);

    abortCtrl = new AbortController();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !$isRunning) onStart();
    }, { signal: abortCtrl.signal });
  });

  onDestroy(() => {
    ctx?.revert();
    abortCtrl?.abort();
    if (settingsEl) gsap.killTweensOf(settingsEl);
    rejectAllModals();
  });

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
  $effect(() => {
    if (settingsOpen !== prevSettingsOpen) {
      const opening = settingsOpen;
      prevSettingsOpen = settingsOpen;
      animateSettingsToggle(opening);
    }
  });

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

<div class="panel" bind:this={panelEl} use:panelCanvas={{ mode: 'aurora' }}>
  <!-- I4: 星云漂移 CSS 粒子 -->
  <div class="nebula-drift" aria-hidden="true">
    {#each Array(8) as _, i}
      <span class="nebula-particle" style="--i: {i}"></span>
    {/each}
  </div>

  <div bind:this={headerEl}>
    <Header onclose={doClose} bind:settingsOpen />
  </div>

  <div class="panel-content" use:parallax={{ speed: 0.3, maxOffset: 40 }} use:cursorScatter>
    {#if settingsVisible}
      <div class="settings-wrapper" bind:this={settingsEl}>
        <SettingsPanel />
      </div>
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
    z-index: 2147483641; /* Z_INDEX.PANEL */
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

  /* B5: 深度视差 — 面板背景层随滚动偏移 */
  .panel::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse at 30% 20%, rgba(var(--ai-primary-rgb, 115, 100, 255), 0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, rgba(155, 89, 246, 0.04) 0%, transparent 50%);
    transform: translateY(var(--parallax-y, 0px));
    pointer-events: none;
    z-index: 0;
    will-change: transform;
  }

  .panel-content {
    position: relative;
    z-index: 1;
    flex: 1 1 0%;
    min-height: 0;
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
    border-bottom-left-radius: 26px;
    border-bottom-right-radius: 26px;
  }

  .panel :global(.gsap-draggable) {
    cursor: default;
  }

  .settings-wrapper {
    will-change: transform, opacity;
  }

  .main-area {
    padding: 0 15px 15px;
  }

  /* I4: 星云漂移 — 8 个环境粒子缓慢漂浮 */
  .nebula-drift {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
    z-index: 0;
  }

  .nebula-particle {
    position: absolute;
    width: calc(3px + var(--i) * 0.5px);
    height: calc(3px + var(--i) * 0.5px);
    border-radius: 50%;
    background: rgba(var(--ai-primary-rgb, 115, 100, 255), 0.12);
    box-shadow: 0 0 6px rgba(var(--ai-primary-rgb, 115, 100, 255), 0.08);
    left: calc(10% + var(--i) * 10%);
    top: calc(15% + var(--i) * 8%);
    animation: nebula-float calc(12s + var(--i) * 3s) ease-in-out calc(var(--i) * -2s) infinite alternate;
    opacity: 0.4;
  }

  @keyframes nebula-float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(calc(8px - var(--i) * 2px), calc(-12px + var(--i) * 1.5px)) scale(1.1); }
    66% { transform: translate(calc(-6px + var(--i) * 1px), calc(8px - var(--i) * 1px)) scale(0.9); }
    100% { transform: translate(calc(4px - var(--i) * 0.5px), calc(-6px + var(--i) * 0.8px)) scale(1.05); }
  }

  @media (prefers-reduced-motion: reduce) {
    .nebula-particle {
      animation: none;
    }
  }
</style>
