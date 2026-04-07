<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tick } from 'svelte';
  import { gsap, Flip, Draggable, EASINGS, shouldAnimateFunctional, shouldAnimate } from '$animations/gsap-config';
  import { gmGetValue, gmSetValue } from '$utils/gm';
  import { parallax } from '$actions/parallax';
  import { panelCanvas } from '$actions/panel-canvas';
  import { cursorScatter } from '$actions/cursor-scatter';
  import { glowTrack } from '$actions/glow-track';
  import Header from './Header.svelte';
  import SettingsPanel from './SettingsPanel.svelte';
  import PromptEditor from './PromptEditor.svelte';
  import LogArea from './LogArea.svelte';
  import ProgressBar from './ProgressBar.svelte';
  import ActionButtons from './ActionButtons.svelte';
  import PanelModals from './PanelModals.svelte';
  import { isRunning, cancelRequested, logs } from '$stores/state';
  import { rejectAllModals, requestPreviewConfirm } from '$stores/modal-bridge';
  import { handleStart, handleBackup } from '$core/panel-actions';
  import { exportLogs } from '$core/export-logs';
  import {
    onCleanDead, onFindDups, openUndo, onStatsClick,
    openHelp, openHistory,
  } from '$stores/panel-modals.svelte';

  interface Props {
    onclose?: () => void;
    flipState?: Flip.FlipState | null;
  }

  let { onclose, flipState = null }: Props = $props();

  let panelEl = $state<HTMLDivElement>(undefined!);
  let headerEl = $state<HTMLElement>(undefined!);
  let settingsEl = $state<HTMLElement>(undefined!);
  let contentEl = $state<HTMLDivElement>(undefined!);
  let ctx: gsap.Context;
  let settingsOpen = $state(false);
  let settingsVisible = $state(false);
  let abortCtrl: AbortController;

  // Scroll indicator state
  let scrollProgress = $state(0);
  let showScrollIndicator = $state(false);

  function updateScrollIndicator() {
    if (!contentEl) return;
    const { scrollTop, scrollHeight, clientHeight } = contentEl;
    const maxScroll = scrollHeight - clientHeight;
    showScrollIndicator = maxScroll > 10;
    scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    // Scroll-reactive nebula opacity
    if (panelEl) {
      panelEl.style.setProperty('--scroll-alpha', String(scrollProgress));
    }
  }

  /** 调试: 用假数据打开预览界面 */
  async function debugPreview() {
    const fakeCategories = ['游戏实况', '音乐MV', '编程教程', '科技数码', '美食制作', '动画MAD', '影视解说', '搞笑日常'].reduce((acc, name, i) => {
      const count = [50, 50, 50, 30, 30, 30, 15, 15][i];
      acc[name] = Array.from({ length: count }, (_, j) => ({
        id: i * 100 + j + 1,
        type: 2,
        conf: 0.5 + Math.random() * 0.5,
      }));
      return acc;
    }, {} as Record<string, Array<{ id: number; type: number; conf: number }>>);

    const fakeVideos = Object.entries(fakeCategories).flatMap(([cat, vids]) =>
      vids.map(v => ({
        id: v.id, type: v.type, title: `【${cat}】模拟视频标题第${v.id}集 - 这是一个用于测试预览界面的模拟视频`,
        bvid: `BV1test${v.id}`, intro: '', duration: Math.floor(60 + Math.random() * 600),
        pubtime: Date.now() / 1000, fav_time: Date.now() / 1000,
        cnt_info: { play: Math.floor(Math.random() * 100000), collect: 0, danmaku: 0 },
        upper: { mid: 1000 + v.id % 10, name: ['何同学', '3Blue1Brown', 'LKs', '罗翔说刑法', '老番茄'][v.id % 5], face: '' },
        cover: '', link: '',
      }))
    );

    const existingNames = ['游戏实况', '音乐MV', '编程教程', '科技数码', '美食制作'];
    try {
      await requestPreviewConfirm(fakeCategories, fakeVideos, existingNames);
      logs.add('[调试] 预览确认完成', 'success');
    } catch {
      logs.add('[调试] 预览已取消', 'info');
    }
  }

  import { POS_STORAGE_KEY } from '$utils/constants';

  /** 保存当前 transform 偏移到共享位置 */
  function savePosition() {
    if (!panelEl) return;
    gmSetValue(POS_STORAGE_KEY, {
      tx: gsap.getProperty(panelEl, 'x') as number,
      ty: gsap.getProperty(panelEl, 'y') as number,
    });
  }

  onMount(() => {
    // 1. 恢复保存的 transform 偏移（与 FloatButton 共享，CSS bottom/left 不变 → 向上扩展）
    const saved = gmGetValue(POS_STORAGE_KEY, null) as { tx: number; ty: number } | null;
    if (saved) {
      gsap.set(panelEl, { x: saved.tx, y: saved.ty });
    }

    // 2. 创建 Draggable（在动画之前，这样 Draggable 能正确识别初始 x/y）
    let draggableInstance: Draggable[] | undefined;
    if (headerEl) {
      draggableInstance = Draggable.create(panelEl, {
        trigger: headerEl,
        bounds: document.body,
        edgeResistance: 0.65,
        inertia: false,
        minimumMovement: 8,
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
          savePosition();
        },
      });
    }

    // 3. 入场动画（Draggable 已就绪，动画结束后 update 让 Draggable 同步最终位置）
    const onEntryDone = () => draggableInstance?.[0]?.update();

    ctx = gsap.context(() => {
      if (flipState && shouldAnimateFunctional()) {
        const btnPos = flipState as unknown as { btnX: number; btnY: number };
        const panelRect = panelEl.getBoundingClientRect();
        const dx = btnPos.btnX - panelRect.left;
        const dy = btnPos.btnY - panelRect.top;

        gsap.from(panelEl, {
          x: `+=${dx}`, y: `+=${dy}`, scale: 0.15, opacity: 0, filter: 'blur(10px)',
          duration: 0.45, ease: EASINGS.velvetSpring,
          onComplete: onEntryDone,
        });
      } else if (shouldAnimateFunctional()) {
        gsap.from(panelEl, {
          scale: 0.86, opacity: 0, filter: 'blur(14px)',
          duration: 0.5, ease: EASINGS.velvetSpring,
          onComplete: onEntryDone,
        });
      }
    }, panelEl);

    abortCtrl = new AbortController();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !$isRunning) onStart();
    }, { signal: abortCtrl.signal });
  });

  onDestroy(() => {
    Draggable.get(panelEl)?.kill();
    ctx?.revert();
    abortCtrl?.abort();
    if (settingsEl) gsap.killTweensOf(settingsEl);
    rejectAllModals();
  });

  function doClose() {
    savePosition();
    if (!panelEl) { onclose?.(); return; }
    if (shouldAnimateFunctional()) {
      gsap.to(panelEl, { scale: 0.9, opacity: 0, filter: 'blur(6px)', duration: 0.35, ease: EASINGS.silkOut, onComplete: () => onclose?.() });
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

  function handleBackupClick() { handleBackup(); }
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

  <div class="panel-content" bind:this={contentEl} onscroll={updateScrollIndicator} use:parallax={{ speed: 0.6, maxOffset: 80 }} use:cursorScatter use:glowTrack>
    <div class="scroll-indicator" class:visible={showScrollIndicator} style:width="{scrollProgress * 100}%" aria-hidden="true"></div>
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
        onundo={openUndo}
        onbackup={handleBackupClick}
        onstats={() => onStatsClick('stats')}
        onhealth={() => onStatsClick('health')}
        onexportlogs={exportLogs}
        onhelp={openHelp}
        ondebugpreview={debugPreview}
        onhistory={openHistory}
      />
    </div>
  </div>
</div>

<PanelModals />

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
    border: 1px solid transparent;
    animation: panelBorderBreathe 8s ease-in-out infinite;
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
    overscroll-behavior: contain;
    border-bottom-left-radius: 26px;
    border-bottom-right-radius: 26px;
    mask-image: linear-gradient(to bottom, black 0%, black calc(100% - 12px), transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black calc(100% - 12px), transparent 100%);
    background:
      radial-gradient(
        circle at var(--glow-x, -100px) var(--glow-y, -100px),
        rgba(var(--ai-primary-rgb, 115, 100, 255), 0.04) 0%,
        transparent 50%
      );
  }

  .panel :global(.gsap-draggable) {
    cursor: default;
  }

  /* Scroll progress indicator */
  .scroll-indicator {
    position: sticky;
    top: 0;
    height: 2px;
    min-height: 2px;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent));
    border-radius: 0 1px 1px 0;
    z-index: 3;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.98, 0.28, 1), width 0.1s linear, box-shadow 0.3s ease;
    pointer-events: none;
    margin-bottom: -2px;
  }

  .scroll-indicator.visible {
    opacity: 1;
    transform: scaleX(1);
    box-shadow: var(--ai-indicator-glow);
  }

  .settings-wrapper {
    will-change: transform, opacity;
  }


  .main-area {
    padding: 0 15px 15px;
  }

  .main-area > :global(*) {
    animation: mainContentFadeIn 0.35s ease both;
  }
  .main-area > :global(*:nth-child(1)) { animation-delay: 0.05s; }
  .main-area > :global(*:nth-child(2)) { animation-delay: 0.1s; }
  .main-area > :global(*:nth-child(3)) { animation-delay: 0.15s; }
  .main-area > :global(*:nth-child(4)) { animation-delay: 0.2s; }

  @keyframes mainContentFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
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
    opacity: calc(0.3 + var(--scroll-alpha, 0) * 0.4);
    transition: background 0.5s ease, box-shadow 0.5s ease, opacity 0.5s ease;
  }

  @keyframes panelBorderBreathe {
    0%, 100% { border-color: transparent; }
    50% { border-color: rgba(var(--ai-primary-rgb, 115, 100, 255), 0.15); }
  }

  @keyframes nebula-float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(calc(8px - var(--i) * 2px), calc(-12px + var(--i) * 1.5px)) scale(1.1); }
    66% { transform: translate(calc(-6px + var(--i) * 1px), calc(8px - var(--i) * 1px)) scale(0.9); }
    100% { transform: translate(calc(4px - var(--i) * 0.5px), calc(-6px + var(--i) * 0.8px)) scale(1.05); }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      animation: none;
      border-color: transparent;
    }
    .nebula-particle {
      animation: none;
    }
    .scroll-indicator {
      transition: none;
      transform: none;
    }
    .scroll-indicator.visible {
      transform: none;
      box-shadow: none;
    }
    .main-area > :global(*) {
      animation: none;
    }
  }
</style>
