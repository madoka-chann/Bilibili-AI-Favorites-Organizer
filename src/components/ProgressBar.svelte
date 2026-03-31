<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { progressPercent, progressPhase, isRunning } from '$lib/stores/state';

  // D1: 平滑进度条 — Svelte tweened
  const smoothProgress = tweened(0, { duration: 400, easing: cubicOut });

  $: smoothProgress.set($progressPercent);

  const PHASE_LABELS: Record<string, string> = {
    fetch: '抓取视频',
    ai: 'AI 分类',
    move: '移动视频',
  };
</script>

{#if $isRunning}
  <div class="progress-container">
    <div class="progress-header">
      <span class="phase-label">
        {PHASE_LABELS[$progressPhase] ?? '准备中'}
      </span>
      <span class="progress-text">{$progressPercent}%</span>
    </div>
    <div class="progress-track">
      <div
        class="progress-bar"
        class:complete={$progressPercent >= 100}
        style:width="{$smoothProgress}%"
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
  }

  .progress-text {
    font-size: 11px;
    font-weight: 700;
    color: var(--ai-text-secondary);
  }

  .progress-track {
    height: 6px;
    background: var(--ai-bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
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
