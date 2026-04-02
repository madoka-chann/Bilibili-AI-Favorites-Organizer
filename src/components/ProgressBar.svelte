<script lang="ts">
  import { onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { progressPercent, progressPhase, isRunning } from '$stores/state';
  import {
    spawnTrailParticles,
    phaseTransition,
    victoryCelebration,
    numberBounce,
  } from '$animations/progress';

  // D1: 平滑进度条 — Svelte tweened
  const smoothProgress = tweened(0, { duration: 400, easing: cubicOut });

  $effect(() => { smoothProgress.set($progressPercent); });

  const PHASE_LABELS: Record<string, string> = {
    fetch: '抓取视频',
    ai: 'AI 分类',
    move: '移动视频',
  };

  let trackEl = $state<HTMLDivElement>(undefined!);
  let barEl = $state<HTMLDivElement>(undefined!);
  let labelEl = $state<HTMLSpanElement>(undefined!);
  let percentEl = $state<HTMLSpanElement>(undefined!);
  let containerEl = $state<HTMLDivElement>(undefined!);

  // D2: 进度轨迹粒子 — 节流触发
  let lastParticlePercent = 0;
  $effect(() => {
    if (trackEl && $progressPercent > lastParticlePercent + 4) {
      spawnTrailParticles(trackEl, $smoothProgress);
      lastParticlePercent = $progressPercent;
    }
  });

  // D3: 阶段切换动画
  let prevPhase = '';
  $effect(() => {
    if (labelEl && barEl && $progressPhase && $progressPhase !== prevPhase) {
      const newLabel = PHASE_LABELS[$progressPhase] ?? '准备中';
      if (prevPhase) {
        phaseTransition(labelEl, barEl, newLabel);
      }
      prevPhase = $progressPhase;
    }
  });

  // D4: 胜利庆祝
  let celebrated = false;
  let cleanupCelebration: (() => void) | undefined;
  $effect(() => {
    if (containerEl && $progressPercent >= 100 && !celebrated) {
      celebrated = true;
      cleanupCelebration = victoryCelebration(containerEl);
    }
  });

  // D5: 数字翻滚弹跳
  let prevPercent = 0;
  $effect(() => {
    if (percentEl && $progressPercent !== prevPercent) {
      if ($progressPercent > prevPercent) {
        numberBounce(percentEl);
      }
      prevPercent = $progressPercent;
    }
  });

  // 重置状态
  $effect(() => {
    if (!$isRunning) {
      lastParticlePercent = 0;
      celebrated = false;
      prevPhase = '';
      prevPercent = 0;
      cleanupCelebration?.();
      cleanupCelebration = undefined;
    }
  });

  onDestroy(() => {
    cleanupCelebration?.();
  });
</script>

{#if $isRunning}
  <div class="progress-container" bind:this={containerEl}>
    <div class="progress-header">
      <span class="phase-label" bind:this={labelEl}>
        {PHASE_LABELS[$progressPhase] ?? '准备中'}
      </span>
      <span class="progress-text" bind:this={percentEl}>{$progressPercent}%</span>
    </div>
    <div class="progress-track" bind:this={trackEl}>
      <div
        class="progress-bar"
        class:complete={$progressPercent >= 100}
        style:width="{$smoothProgress}%"
        bind:this={barEl}
      ></div>
    </div>
  </div>
{/if}

<style>
  .progress-container {
    margin-top: 10px;
    padding: 8px 0;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .phase-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ai-primary);
    display: inline-block;
  }

  .progress-text {
    font-size: 11px;
    font-weight: 700;
    color: var(--ai-text-secondary);
    display: inline-block;
  }

  .progress-track {
    height: 6px;
    background: var(--ai-bg-tertiary);
    border-radius: 3px;
    overflow: visible;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent), #d946ef);
    background-size: 300% 100%;
    border-radius: 3px;
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    position: relative;
    will-change: width;
  }

  /* D6: 微光效果 (保留的3个 @keyframes 之一) */
  .progress-bar::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .progress-bar.complete {
    background: linear-gradient(90deg, var(--ai-success), var(--ai-success-light), var(--ai-success-lighter));
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
