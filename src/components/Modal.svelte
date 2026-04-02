<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { gsap, EASINGS } from '$animations/gsap-config';
  import { shouldAnimateFunctional, shouldAnimate } from '$animations/gsap-config';
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

  onMount(() => {
    ctx = gsap.context(() => {
      if (shouldAnimateFunctional()) {
        // F1: 模态框入场 — 简洁 fade+slide，内容同步显示无二次弹跳
        gsap.fromTo(
          backdropEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.25 }
        );
        gsap.fromTo(
          modalEl,
          { scale: 0.92, y: 24, opacity: 0 },
          {
            scale: 1, y: 0, opacity: 1,
            duration: 0.35,
            ease: EASINGS.velvetSpring,
            delay: 0.05,
            clearProps: 'transform,filter',
          }
        );
      }
    });

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
      gsap.to(modalEl, {
        scale: 0.95,
        y: 16,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(backdropEl, {
        opacity: 0,
        duration: 0.25,
        delay: 0.05,
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
      <button class="close-btn" onclick={handleClose} aria-label="关闭">
        <X size={16} />
      </button>
    </div>

    {#if toolbar}{@render toolbar()}{/if}

    <div class="modal-body" bind:this={bodyEl}>
      {#if children}{@render children()}{/if}
    </div>

    {#if showFooter}
      <div class="modal-footer">
        {#if footer}
          {@render footer()}
        {:else}
          <button class="modal-btn cancel" onclick={handleClose}>
            {cancelText}
          </button>
          <button
            class="modal-btn confirm"
            disabled={confirmDisabled}
            onclick={() => onconfirm?.()}
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
  }

  .modal {
    background: var(--ai-bg);
    color: var(--ai-text);
    border-radius: 28px;
    box-shadow: var(--ai-shadow-modal);
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    padding: 18px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary));
    background-size: 800% 800%;
    color: #fff;
    position: relative;
    overflow: hidden;
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
    transition: background 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    min-height: 0;
  }

  .modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--ai-border-light);
    display: flex;
    gap: 12px;
    background: var(--ai-bg-secondary);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04); /* intentionally static — upward shadow, minor */
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

  .modal-btn.confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .modal-btn.cancel {
    background: var(--ai-border-lighter);
    color: var(--ai-text-muted);
  }

  .modal-btn.cancel:hover {
    background: var(--ai-bg-tertiary);
  }
</style>
