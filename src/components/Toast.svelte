<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { gsap, Flip, EASINGS } from '$animations/gsap-config';
  import { shouldAnimateFunctional, shouldAnimate } from '$animations/gsap-config';
  import { Z_INDEX, MAX_TOAST_COUNT } from '$utils/constants';

  interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  }

  let toasts: ToastItem[] = [];
  let nextId = 0;
  let containerEl: HTMLDivElement;

  /** 全局 showToast 函数，挂载到 window 供其他模块调用 */
  function addToast(
    message: string,
    type: ToastItem['type'] = 'info',
    duration = 3500
  ) {
    const id = nextId++;

    // G3: FLIP 堆栈重排 — 记录当前状态
    let flipState: Flip.FlipState | null = null;
    if (shouldAnimate() && containerEl) {
      const existing = containerEl.querySelectorAll('.toast');
      if (existing.length > 0) {
        flipState = Flip.getState(existing);
      }
    }

    toasts = [...toasts, { id, message, type, duration }];

    // 限制最大数量
    if (toasts.length > MAX_TOAST_COUNT) {
      toasts = toasts.slice(-MAX_TOAST_COUNT);
    }

    // G3: 应用 FLIP 重排动画
    if (flipState) {
      tick().then(() => {
        const current = containerEl?.querySelectorAll('.toast');
        if (current && current.length > 1) {
          Flip.from(flipState!, {
            duration: 0.3,
            ease: EASINGS.velvetSpring,
            targets: Array.from(current).slice(0, -1), // 排除新增的（它有自己的入场动画）
          });
        }
      });
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
          // G3: 移除后 FLIP 重排剩余 toast
          let flipState: Flip.FlipState | null = null;
          if (shouldAnimate() && containerEl) {
            const remaining = containerEl.querySelectorAll('.toast');
            if (remaining.length > 1) {
              flipState = Flip.getState(remaining);
            }
          }

          toasts = toasts.filter((t) => t.id !== id);

          if (flipState) {
            tick().then(() => {
              const current = containerEl?.querySelectorAll('.toast');
              if (current && current.length > 0) {
                Flip.from(flipState!, {
                  duration: 0.3,
                  ease: EASINGS.velvetSpring,
                });
              }
            });
          }
        },
      });
    } else {
      toasts = toasts.filter((t) => t.id !== id);
    }
  }

  /**
   * G4: 类型化入场动画
   * success=弹跳 / error=滑入+震动 / warning=从上方落下 / info=标准弹性滑
   */
  function animateIn(node: HTMLElement) {
    if (!shouldAnimateFunctional()) return;

    const type = node.dataset.toastType as ToastItem['type'];

    switch (type) {
      case 'success':
        // 弹跳 scale 入场
        gsap.fromTo(
          node,
          { x: 140, scale: 0.4, opacity: 0 },
          {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.55,
            ease: EASINGS.prismBounce,
          }
        );
        break;

      case 'error':
        // 滑入 + 震动
        gsap.fromTo(
          node,
          { x: 140, scale: 0.6, opacity: 0 },
          {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: EASINGS.velvetSpring,
            onComplete: () => {
              // 短促震动
              gsap.to(node, {
                keyframes: [
                  { x: -4, duration: 0.04 },
                  { x: 4, duration: 0.04 },
                  { x: -3, duration: 0.04 },
                  { x: 2, duration: 0.04 },
                  { x: 0, duration: 0.04 },
                ],
                ease: 'none',
              });
            },
          }
        );
        break;

      case 'warning':
        // 从上方落下
        gsap.fromTo(
          node,
          { y: -60, x: 0, scale: 0.8, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: EASINGS.prismBounce,
          }
        );
        break;

      default:
        // info: 标准弹性滑入 (G1)
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
    // 暴露全局 API (类型安全)
    (window as Window & { __bfao_toast?: typeof addToast }).__bfao_toast = addToast;
  });

  // 导出供其他 Svelte 组件使用
  export { addToast as show };
</script>

<div class="toast-container" style:z-index={Z_INDEX.TOAST} bind:this={containerEl}>
  {#each toasts as toast (toast.id)}
    <button
      class="toast toast-{toast.type}"
      data-toast-id={toast.id}
      data-toast-type={toast.type}
      data-flip-id="toast-{toast.id}"
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
