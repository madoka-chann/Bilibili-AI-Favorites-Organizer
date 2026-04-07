<script lang="ts">
  import { onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { progressPhase, progressCurrent, progressTotal, isRunning, tokenUsage } from '$stores/state';
  import { getContinuousPercent } from '$utils/progress';
  import {
    spawnTrailParticles,
    phaseTransition,
    victoryCelebration,
    numberBounce,
  } from '$animations/progress';
  import { numberRoll } from '$animations/text';

  // Continuous progress across all phases
  let continuousPercent = $derived(
    getContinuousPercent($progressPhase, $progressCurrent, $progressTotal)
  );

  // D1: 平滑进度条 — Svelte tweened
  const smoothProgress = tweened(0, { duration: 800, easing: cubicOut });

  $effect(() => { smoothProgress.set(continuousPercent); });

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
  let tokenEl = $state<HTMLSpanElement>(undefined!);

  // D2: 进度轨迹粒子 — 节流触发
  let lastParticlePercent = 0;
  $effect(() => {
    if (trackEl && continuousPercent > lastParticlePercent + 4) {
      spawnTrailParticles(trackEl, $smoothProgress);
      lastParticlePercent = continuousPercent;
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
    if (containerEl && continuousPercent >= 100 && !celebrated) {
      celebrated = true;
      cleanupCelebration = victoryCelebration(containerEl);
    }
  });

  // D5: 数字翻滚弹跳
  let prevPercent = 0;
  $effect(() => {
    if (percentEl && continuousPercent !== prevPercent) {
      if (continuousPercent > prevPercent) {
        numberBounce(percentEl);
      }
      prevPercent = continuousPercent;
    }
  });

  // Token 数字翻滚
  let prevTokens = 0;
  let cleanupTokenRoll: (() => void) | undefined;
  $effect(() => {
    const tokens = $tokenUsage.totalTokens;
    if (tokenEl && tokens > 0 && tokens !== prevTokens) {
      cleanupTokenRoll?.();
      cleanupTokenRoll = numberRoll(tokenEl, tokens, { useLocale: true }).destroy;
      prevTokens = tokens;
    }
  });

  // 重置状态
  $effect(() => {
    if (!$isRunning) {
      lastParticlePercent = 0;
      celebrated = false;
      prevPhase = '';
      prevPercent = 0;
      prevTokens = 0;
      cleanupCelebration?.();
      cleanupCelebration = undefined;
      cleanupTokenRoll?.();
      cleanupTokenRoll = undefined;
    }
  });

  onDestroy(() => {
    cleanupCelebration?.();
    cleanupTokenRoll?.();
  });
</script>

{#if $isRunning}
  <div class="progress-container" bind:this={containerEl}>
    <div class="progress-header">
      <span class="phase-label" bind:this={labelEl}>
        {PHASE_LABELS[$progressPhase] ?? '准备中'}
      </span>
      <span class="progress-text" bind:this={percentEl}>{continuousPercent}%</span>
    </div>
    <div class="progress-track" bind:this={trackEl}>
      <div
        class="progress-bar"
        class:complete={continuousPercent >= 100}
        style:width="{$smoothProgress}%"
        bind:this={barEl}
      ></div>
      <span class="progress-cat" style:left="{$smoothProgress}%">🐱</span>
    </div>
    {#if $tokenUsage.totalTokens > 0}
      <div class="token-stats">
        Token: <span bind:this={tokenEl}>{$tokenUsage.totalTokens.toLocaleString()}</span> ({$tokenUsage.callCount} 次调用)
      </div>
    {/if}
  </div>
{/if}

<style>
  .progress-container {
    margin-top: 10px;
    padding: 8px 0;
    animation: progressEnter 0.4s cubic-bezier(0.2, 0.98, 0.28, 1) both;
    transform-origin: top center;
  }

  @keyframes progressEnter {
    from {
      opacity: 0;
      transform: translateY(8px) scaleY(0.8);
    }
    to {
      opacity: 1;
      transform: translateY(0) scaleY(1);
    }
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: transform 0.25s cubic-bezier(0.2, 1.04, 0.42, 1);
  }
  .phase-label::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ai-primary);
    animation: phaseDot 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes phaseDot {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(var(--ai-primary-rgb), 0.4); }
    50% { opacity: 0.6; box-shadow: 0 0 0 3px rgba(var(--ai-primary-rgb), 0); }
  }
  .phase-label:hover {
    transform: scale(1.05);
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
    box-shadow: var(--ai-shadow-inset);
    border: 1px solid transparent;
    transition: border-color 0.5s ease, box-shadow 0.5s ease;
  }

  .progress-track:has(.complete) {
    border-color: rgba(var(--ai-success-rgb), 0.3);
    box-shadow: var(--ai-shadow-inset), 0 0 8px rgba(var(--ai-success-rgb), 0.2);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent), #d946ef, var(--ai-primary));
    background-size: 300% 100%;
    border-radius: 3px;
    transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    position: relative;
    will-change: width;
    animation: auroraFlow 3s ease-in-out infinite;
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
    animation: completeGlow 2s ease-in-out infinite;
  }

  .token-stats {
    font-size: 10px;
    color: var(--ai-text-muted);
    margin-top: 4px;
    text-align: right;
    animation: tokenFadeIn 0.4s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  .progress-cat {
    position: absolute;
    top: -18px;
    font-size: 16px;
    line-height: 1;
    transform: translateX(-50%);
    animation: catBounce 0.5s ease-in-out infinite alternate;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
    pointer-events: auto;
    cursor: pointer;
    transition: left 0.8s cubic-bezier(0.19, 1, 0.22, 1), filter 0.2s ease, transform 0.2s ease;
  }
  .progress-cat::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    width: 10px;
    height: 4px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    transform: translateX(-50%);
    animation: catShadow 0.5s ease-in-out infinite alternate;
    pointer-events: none;
  }
  .progress-cat:hover {
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)) brightness(1.2);
    animation: none;
    transform: translateX(-50%) scale(1.3);
  }
  .progress-cat:hover::after {
    animation: none;
    opacity: 0.3;
    transform: translateX(-50%) scaleX(1.4);
  }
  @keyframes catBounce {
    from { transform: translateX(-50%) translateY(0); }
    to { transform: translateX(-50%) translateY(-6px); }
  }
  @keyframes catShadow {
    from { transform: translateX(-50%) scaleX(1.2); opacity: 0.25; }
    to { transform: translateX(-50%) scaleX(0.7); opacity: 0.12; }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes auroraFlow {
    0% { background-position: 0% 0; }
    50% { background-position: 100% 0; }
    100% { background-position: 0% 0; }
  }

  @keyframes completeGlow {
    0%, 100% { box-shadow: 0 0 4px rgba(var(--ai-primary-rgb), 0.1); }
    50% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.35); }
  }

  @keyframes tokenFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-container { animation: none; }
    .progress-bar { animation: none; }
    .progress-bar::after { animation: none; }
    .progress-bar.complete { animation: none; }
    .token-stats { animation: none; }
    .phase-label::before { animation: none; opacity: 1; }
    .progress-cat { animation: none; }
    .progress-cat::after { animation: none; opacity: 0.15; }
    .progress-track:has(.complete) { box-shadow: var(--ai-shadow-inset); border-color: transparent; }
  }
</style>
