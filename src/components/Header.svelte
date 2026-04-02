<script lang="ts">
  import { X, Settings, Moon, Sun } from 'lucide-svelte';
  import { isDark, toggleTheme } from '$stores/theme';
  import { ripple } from '$actions/ripple';
  import { pressEffect } from '$animations/micro';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';
  import { Z_INDEX } from '$utils/constants';
  import { onDestroy } from 'svelte';

  interface Props {
    settingsOpen?: boolean;
    onclose?: () => void;
  }

  let { settingsOpen = $bindable(false), onclose }: Props = $props();

  let themeIconEl = $state<HTMLButtonElement>(undefined!);
  let themeIconTween: gsap.core.Tween | null = null;
  let transitionTimer: ReturnType<typeof setTimeout> | null = null;

  onDestroy(() => {
    if (transitionTimer) clearTimeout(transitionTimer);
    themeIconTween?.kill();
  });

  /** J1 圆形揭示 + J2 图标旋转 + J3 色彩插值 */
  function handleThemeToggle(e: MouseEvent) {
    if (!shouldAnimate()) {
      toggleTheme();
      return;
    }

    // J3: 快照切换前的背景色 (用于遮罩层)
    const appEl = document.querySelector('.bfao-app') as HTMLElement | null;
    const oldBg = appEl
      ? getComputedStyle(appEl).getPropertyValue('--ai-bg').trim()
      : '';

    // 切换主题 (App.svelte 的 data-theme 会立即响应更新)
    toggleTheme();

    // J2: 主题图标旋转动画 — 快速连续点击时先终止前一个动画
    if (themeIconEl) {
      themeIconTween?.kill();
      themeIconTween = gsap.fromTo(themeIconEl,
        { rotation: 0, scale: 1 },
        { rotation: 360, scale: 1, duration: 0.5, ease: EASINGS.prismBounce }
      );
    }

    if (!appEl || !oldBg) return;

    // J1: 圆形揭示过渡
    const cx = e.clientX;
    const cy = e.clientY;
    const maxRadius = Math.ceil(Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    ));

    // 遮罩: 旧主题背景色的全屏层，通过 clip-path 收缩来揭示新主题
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: ${Z_INDEX.PARTICLE};
      background: ${oldBg};
      clip-path: circle(${maxRadius}px at ${cx}px ${cy}px);
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      clipPath: `circle(0px at ${cx}px ${cy}px)`,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => overlay.remove(),
    });

    // J3: 面板内元素的 CSS 变量色彩过渡
    const panelEl = appEl.querySelector('.panel') as HTMLElement | null;
    if (panelEl) {
      panelEl.style.transition = 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease';
      if (transitionTimer) clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => { panelEl.style.transition = ''; transitionTimer = null; }, 600);
    }
  }
</script>

<div class="header">
  <div class="header-title">
    <span>AI 收藏夹整理器</span>
    <span class="version">v2.0</span>
  </div>

  <div class="header-actions">
    <button
      class="header-btn"
      bind:this={themeIconEl}
      onclick={handleThemeToggle}
      title={$isDark ? '切换到亮色模式' : '切换到暗色模式'}
      use:ripple={{ color: 'rgba(255,255,255,0.25)' }}
      use:pressEffect
    >
      {#if $isDark}
        <Sun size={16} />
      {:else}
        <Moon size={16} />
      {/if}
    </button>

    <button
      class="header-btn"
      class:active={settingsOpen}
      title="设置"
      onclick={() => (settingsOpen = !settingsOpen)}
      use:ripple={{ color: 'rgba(255,255,255,0.25)' }}
      use:pressEffect
    >
      <Settings size={16} />
    </button>

    <button
      class="header-btn"
      onclick={() => onclose?.()}
      title="关闭"
      use:ripple={{ color: 'rgba(255,255,255,0.25)' }}
      use:pressEffect
    >
      <X size={16} />
    </button>
  </div>
</div>

<style>
  .header {
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary));
    background-size: 400% 400%;
    animation: aurora-flow 18s ease-in-out infinite;
    color: #fff;
    padding: 16px 18px;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
    cursor: grab;
  }

  .header:active {
    cursor: grabbing;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .version {
    font-size: 10px;
    opacity: 0.7;
    background: rgba(255, 255, 255, 0.15);
    padding: 1px 6px;
    border-radius: 8px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .header-btn {
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .header-btn.active {
    background: rgba(255, 255, 255, 0.35);
  }

  @keyframes aurora-flow {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 25%; }
    50% { background-position: 50% 100%; }
    75% { background-position: 0% 75%; }
  }
</style>
