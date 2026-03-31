<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap, EASINGS } from '$animations/gsap-config';
  import { shouldAnimateFunctional } from '$animations/gsap-config';
  import { Z_INDEX, MAX_TOAST_COUNT } from '$lib/utils/constants';

  interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  }

  let toasts: ToastItem[] = [];
  let nextId = 0;

  /** 全局 showToast 函数，挂载到 window 供其他模块调用 */
  function addToast(
    message: string,
    type: ToastItem['type'] = 'info',
    duration = 3500
  ) {
    const id = nextId++;
    toasts = [...toasts, { id, message, type, duration }];

    // 限制最大数量
    if (toasts.length > MAX_TOAST_COUNT) {
      toasts = toasts.slice(-MAX_TOAST_COUNT);
    }

    // 自动消失
    setTimeout(() => removeToast(id), duration);
  }

  function removeToast(id: number) {
    const el = document.querySelector(`[data-toast-id="${id}"]`) as HTMLElement;
    if (!el) {
      toasts = toasts.filter((t) => t.id !== id);
      return;
    }

    if (shouldAnimateFunctional()) {
      // G5: 滑出退场
      gsap.to(el, {
        x: 140,
        scale: 0.78,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          toasts = toasts.filter((t) => t.id !== id);
        },
      });
    } else {
      toasts = toasts.filter((t) => t.id !== id);
    }
  }

  /** Toast 入场动画 */
  function animateIn(node: HTMLElement) {
    if (shouldAnimateFunctional()) {
      gsap.fromTo(
        node,
        { x: 140, scale: 0.6, rotation: 3, opacity: 0 },
        {
          x: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.55,
          ease: EASINGS.velvetSpring,
        }
      );
    }
  }

  onMount(() => {
    // 暴露全局 API
    (window as any).__bfao_toast = addToast;
  });

  // 导出供其他 Svelte 组件使用
  export { addToast as show };
</script>

<div class="toast-container" style:z-index={Z_INDEX.TOAST}>
  {#each toasts as toast (toast.id)}
    <button
      class="toast toast-{toast.type}"
      data-toast-id={toast.id}
      use:animateIn
      onclick={() => removeToast(toast.id)}
      aria-label="关闭通知"
    >
      <span class="toast-icon">
        {#if toast.type === 'success'}✓
        {:else if toast.type === 'error'}✕
        {:else if toast.type === 'warning'}⚠
        {:else}ℹ{/if}
      </span>
      <span class="toast-msg">{toast.message}</span>
      <div class="toast-timer" style:animation-duration="{toast.duration}ms"></div>
    </button>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    backdrop-filter: blur(12px) saturate(1.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    max-width: 340px;
    will-change: transform, opacity;
  }

  .toast-success {
    background: rgba(var(--ai-success-rgb), 0.9);
    color: #fff;
  }

  .toast-error {
    background: rgba(var(--ai-error-alt-rgb), 0.9);
    color: #fff;
  }

  .toast-warning {
    background: rgba(var(--ai-warning-rgb), 0.9);
    color: #fff;
  }

  .toast-info {
    background: rgba(var(--ai-primary-rgb), 0.9);
    color: #fff;
  }

  .toast-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .toast-msg {
    flex: 1;
    min-width: 0;
    line-height: 1.4;
  }

  /* G2: 计时环 (保留的3个 @keyframes 之一) */
  .toast-timer {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
    animation: toast-timer linear forwards;
    border-radius: 0 0 14px 14px;
  }

  @keyframes toast-timer {
    0% {
      width: 100%;
    }
    100% {
      width: 0%;
    }
  }
</style>
