<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
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
  const toastTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

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

    // 限制最大数量 — 清理被丢弃 toast 的 timeout 防止泄漏
    if (toasts.length > MAX_TOAST_COUNT) {
      const discarded = toasts.slice(0, -MAX_TOAST_COUNT);
      for (const t of discarded) {
        const tid = toastTimeouts.get(t.id);
        if (tid) { clearTimeout(tid); toastTimeouts.delete(t.id); }
      }
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

    // 自动消失 (追踪 timeout 以便组件销毁时清理)
    toastTimeouts.set(id, setTimeout(() => removeToast(id), duration));
  }

  function removeToast(id: number) {
    const tid = toastTimeouts.get(id);
    if (tid) { clearTimeout(tid); toastTimeouts.delete(id); }
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
          { x: 140, scale: 0.6, rotation: 3, opacity: 0, filter: 'blur(12px)' },
          {
            x: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            filter: 'blur(0px)',
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

  onDestroy(() => {
    toastTimeouts.forEach((tid) => clearTimeout(tid));
    toastTimeouts.clear();
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
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .toast:hover {
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.18),
      0 4px 12px rgba(0, 0, 0, 0.1);
    transform: scale(1.02);
  }

  /* Hover pauses the timer — user can read the toast without it vanishing */
  .toast:hover .toast-timer {
    animation-play-state: paused;
  }

  /* Pause indicator on hover — positioned inside the toast (overflow: hidden safe) */
  .toast::before {
    content: '⏸';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    font-size: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 1;
  }
  .toast:hover::before {
    opacity: 1;
    transform: scale(1);
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
    display: inline-block;
  }

  .toast-success .toast-icon {
    animation: toastIconBounce 0.5s cubic-bezier(0.2, 1, 0.4, 1) 0.3s both;
  }

  .toast-error .toast-icon {
    animation: toastIconShake 0.4s ease 0.3s both;
  }

  .toast-warning .toast-icon {
    animation: toastIconWobble 0.5s ease 0.3s both;
  }

  .toast-info .toast-icon {
    animation: toastIconPulse 0.5s cubic-bezier(0.2, 1, 0.4, 1) 0.3s both;
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
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3));
    animation: toast-timer linear forwards;
    border-radius: 0 0 14px 14px;
    transition: opacity 0.2s ease;
    overflow: hidden;
  }

  /* Timer bar shimmer sweep — "time flowing" visual cue */
  .toast-timer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, var(--ai-timer-shimmer, rgba(255,255,255,0.5)) 50%, transparent 100%);
    animation: timerShimmer 2s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes toast-timer {
    0% {
      width: 100%;
    }
    100% {
      width: 0%;
    }
  }

  @keyframes toastIconBounce {
    0% { transform: scale(0); }
    60% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  @keyframes toastIconShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
  }

  @keyframes toastIconWobble {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-12deg); }
    50% { transform: rotate(8deg); }
    75% { transform: rotate(-4deg); }
  }

  @keyframes toastIconPulse {
    0% { transform: scale(0.6); opacity: 0.4; }
    50% { transform: scale(1.25); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes timerShimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
    .toast:hover { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06); transform: none; }
    .toast::before { display: none; }
    .toast-success .toast-icon,
    .toast-error .toast-icon,
    .toast-warning .toast-icon,
    .toast-info .toast-icon { animation: none; }
    .toast-timer::after { animation: none; }
  }
</style>
