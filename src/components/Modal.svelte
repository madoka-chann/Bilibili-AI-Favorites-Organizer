<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';
  import { shouldAnimateFunctional } from '$animations/gsap-config';
  import { glowTrack } from '$actions/glow-track';
  import { ripple } from '$actions/ripple';
  import { magnetic } from '$actions/magnetic';
  import { X } from 'lucide-svelte';
  import { Z_INDEX } from '$utils/constants';

  interface Props {
    title?: string;
    showFooter?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
    width?: string;
    onclose?: () => void;
    onconfirm?: () => void;
    children?: Snippet;
    icon?: Snippet;
    toolbar?: Snippet;
    footer?: Snippet;
  }

  let {
    title = '', showFooter = true, confirmText = '确认', cancelText = '取消',
    confirmDisabled = false, width = 'min(600px, 90vw)',
    onclose, onconfirm,
    children, icon, toolbar, footer,
  }: Props = $props();

  let backdropEl = $state<HTMLDivElement>(undefined!);
  let modalEl = $state<HTMLDivElement>(undefined!);
  let bodyEl = $state<HTMLDivElement>(undefined!);
  let ctx: gsap.Context;
  let abortCtrl: AbortController;

  // Scroll fade edge state + progress
  let scrolledTop = $state(false);
  let scrolledBottom = $state(false);
  let scrollProgress = $state(0);
  let showScrollBar = $state(false);

  function updateScrollFade() {
    if (!bodyEl) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyEl;
    const isScrollable = scrollHeight > clientHeight + 2;
    scrolledTop = isScrollable && scrollTop > 4;
    scrolledBottom = isScrollable && scrollTop < scrollHeight - clientHeight - 4;
    const maxScroll = scrollHeight - clientHeight;
    showScrollBar = maxScroll > 10;
    scrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    // Scroll-reactive depth shadow
    if (modalEl) {
      modalEl.style.setProperty('--modal-scroll-depth', String(scrollProgress));
    }
  }

  onMount(() => {
    ctx = gsap.context(() => {
      if (shouldAnimateFunctional()) {
        // F1: 绽放入场 — fast scale+blur
        gsap.fromTo(
          backdropEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 }
        );

        gsap.fromTo(
          modalEl,
          { scale: 0.88, y: 24, opacity: 0, filter: 'blur(8px)' },
          {
            scale: 1, y: 0, opacity: 1, filter: 'blur(0px)',
            duration: 0.35,
            ease: EASINGS.velvetSpring,
            clearProps: 'transform,filter',
          }
        );
      }
    });

    // Initial scroll fade check after mount
    requestAnimationFrame(() => updateScrollFade());

    // ESC 关闭
    abortCtrl = new AbortController();
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    }, { signal: abortCtrl.signal });
  });

  onDestroy(() => {
    ctx?.revert();
    abortCtrl?.abort();
  });

  function handleClose() {
    if (shouldAnimateFunctional() && modalEl && backdropEl) {
      // F3: 物理退出
      gsap.to(modalEl, {
        scale: 0.92,
        y: 16,
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(backdropEl, {
        opacity: 0,
        duration: 0.2,
        delay: 0.03,
        onComplete: () => onclose?.(),
      });
    } else {
      onclose?.();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="backdrop"
  bind:this={backdropEl}
  style:z-index={Z_INDEX.MODAL}
  onmousedown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
>
  <div class="modal" bind:this={modalEl} style:width role="dialog" aria-modal="true">
    <div class="modal-header">
      <h3>
        {#if icon}{@render icon()}{/if}
        {title}
      </h3>
      <button class="close-btn" onclick={handleClose} aria-label="关闭" use:ripple={{ color: 'rgba(255,255,255,0.3)' }}>
        <X size={16} />
      </button>
    </div>

    {#if toolbar}{@render toolbar()}{/if}

    <div
      class="modal-body"
      class:fade-top={scrolledTop}
      class:fade-bottom={scrolledBottom}
      bind:this={bodyEl}
      onscroll={updateScrollFade}
      use:glowTrack
    >
      <div class="modal-scroll-indicator" class:visible={showScrollBar} style:width="{scrollProgress * 100}%"></div>
      {#if children}{@render children()}{/if}
    </div>

    {#if showFooter}
      <div class="modal-footer">
        {#if footer}
          {@render footer()}
        {:else}
          <button class="modal-btn cancel" onclick={handleClose} use:ripple use:magnetic={{ radius: 60, strength: 0.4 }}>
            {cancelText}
          </button>
          <button
            class="modal-btn confirm"
            disabled={confirmDisabled}
            onclick={() => onconfirm?.()}
            use:ripple={{ color: 'rgba(255,255,255,0.3)' }}
            use:magnetic={{ radius: 60, strength: 0.4 }}
          >
            {confirmText}
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: var(--ai-backdrop);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
    backdrop-filter: blur(16px) saturate(1.4);
    overflow: hidden;
  }

  .backdrop::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.4) 50%, transparent 50%),
      radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.3) 50%, transparent 50%),
      radial-gradient(1.5px 1.5px at 72% 18%, rgba(255,255,255,0.35) 50%, transparent 50%),
      radial-gradient(1px 1px at 88% 72%, rgba(255,255,255,0.3) 50%, transparent 50%),
      radial-gradient(1.5px 1.5px at 30% 85%, rgba(255,255,255,0.25) 50%, transparent 50%);
    animation: backdropStardust 4s ease-in-out infinite alternate;
    pointer-events: none;
  }

  /* Scroll-responsive depth shadow — deepens as user scrolls */
  .modal {
    background: var(--ai-bg);
    color: var(--ai-text);
    border-radius: 28px;
    box-shadow:
      var(--ai-shadow-modal),
      0 0 calc(var(--modal-scroll-depth, 0) * 40px) rgba(0, 0, 0, calc(var(--modal-scroll-depth, 0) * 0.1));
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.5s ease;
  }

  .modal-header {
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary));
    background-size: 400% 400%;
    animation: modal-aurora-flow 18s ease-in-out infinite;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .modal-header::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 60%
    );
    background-size: 200% 100%;
    animation: headerSweep 8s ease-in-out infinite;
    pointer-events: none;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;
    letter-spacing: 0;
    transition: letter-spacing 0.35s cubic-bezier(0.2, 0.98, 0.28, 1);
  }

  /* Header icon entrance bounce */
  .modal-header h3 :global(svg) {
    animation: modalIconBounce 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) 0.15s both;
  }
  @keyframes modalIconBounce {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  .modal-header:hover h3 {
    letter-spacing: 1px;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    transition: background 0.2s ease, transform 0.25s cubic-bezier(0.2, 1, 0.4, 1), box-shadow 0.25s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    min-height: 0;
    position: relative;
    background:
      radial-gradient(
        circle at var(--glow-x, -100px) var(--glow-y, -100px),
        rgba(var(--ai-primary-rgb, 115, 100, 255), 0.05) 0%,
        transparent 55%
      );
  }

  /* Scroll fade edges — gradient masks at top/bottom */
  .modal-body::before,
  .modal-body::after {
    content: '';
    position: sticky;
    display: block;
    height: 18px;
    pointer-events: none;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .modal-body::before {
    top: 0;
    background: linear-gradient(to bottom, var(--ai-bg), transparent);
    margin-bottom: -18px;
  }

  .modal-body::after {
    bottom: 0;
    background: linear-gradient(to top, var(--ai-bg), transparent);
    margin-top: -18px;
  }

  .modal-body.fade-top::before { opacity: 1; }
  .modal-body.fade-bottom::after { opacity: 1; }

  .modal-footer {
    padding: 14px 20px;
    border-top: none;
    display: flex;
    gap: 12px;
    background: var(--ai-bg-secondary);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04); /* intentionally static — upward shadow, minor */
    animation: footerSlideUp 0.3s ease 0.15s both;
    position: relative;
  }
  .modal-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--ai-primary-light), var(--ai-border-light), transparent);
    transform: scaleX(0);
    animation: footerDividerExpand 0.4s cubic-bezier(0.2, 0.98, 0.28, 1) 0.25s both;
    pointer-events: none;
  }
  @keyframes footerDividerExpand {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  .modal-btn {
    flex: 1;
    padding: 11px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .modal-btn.confirm {
    background: linear-gradient(135deg, var(--ai-success-dark), var(--ai-success), var(--ai-success-light));
    color: #fff;
  }

  .modal-btn.confirm:hover {
    transform: translateY(-2px) scale(1.015);
    box-shadow: 0 10px 28px var(--ai-success-bg);
  }

  .modal-btn.confirm {
    position: relative;
    overflow: hidden;
  }
  .modal-btn.confirm::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .modal-btn.confirm:active::after {
    animation: confirmRipple 0.5s ease-out;
  }
  @keyframes confirmRipple {
    0% { width: 0; height: 0; opacity: 0.5; }
    100% { width: 300px; height: 300px; opacity: 0; }
  }

  .modal-btn.confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .modal-btn.confirm:disabled::after {
    display: none;
  }

  .modal-btn.cancel {
    background: var(--ai-border-lighter);
    color: var(--ai-text-muted);
  }

  .modal-btn.cancel:hover {
    background: var(--ai-bg-tertiary);
    transform: translateX(-2px);
    opacity: 0.85;
  }

  .modal-scroll-indicator {
    position: sticky;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent));
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.2, 0.98, 0.28, 1), width 0.15s linear, box-shadow 0.3s ease;
    z-index: 3;
    border-radius: 1px;
    flex-shrink: 0;
  }
  .modal-scroll-indicator.visible {
    opacity: 1;
    transform: scaleX(1);
    box-shadow: var(--ai-indicator-glow);
  }

  @keyframes modal-aurora-flow {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 25%; }
    50% { background-position: 50% 100%; }
    75% { background-position: 0% 75%; }
  }

  @keyframes headerSweep {
    0%, 100% { background-position: 200% 0; }
    50% { background-position: -200% 0; }
  }

  @keyframes backdropStardust {
    0% { opacity: 0.3; }
    100% { opacity: 0.8; }
  }

  @keyframes footerSlideUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-header { animation: none; }
    .modal-header::after { animation: none; }
    .backdrop::before { animation: none; opacity: 0.5; }
    .modal-header h3 { transition: none; }
    .modal-header h3 :global(svg) { animation: none; }
    .modal-header:hover h3 { letter-spacing: 0; }
    .close-btn:hover { transform: none; }
    .modal-body::before,
    .modal-body::after { transition: none; }
    .modal-footer { animation: none; }
    .modal-footer::before { animation: none; transform: scaleX(1); }
    .modal-btn.confirm:active::after { animation: none; }
    .modal-btn.cancel:hover { transform: none; opacity: 1; }
    .modal-scroll-indicator { transition: none; transform: none; }
    .modal-scroll-indicator.visible { transform: none; box-shadow: none; }
  }
</style>
