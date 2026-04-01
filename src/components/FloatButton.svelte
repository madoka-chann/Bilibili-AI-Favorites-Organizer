<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Bot } from 'lucide-svelte';
  import { gsap, Draggable, EASINGS } from '$animations/gsap-config';
  import { shouldAnimate } from '$animations/gsap-config';
  import { gmGetValue, gmSetValue } from '$lib/utils/gm';

  export let visible = true;
  export let onclick: (() => void) | undefined = undefined;

  let btnEl: HTMLButtonElement;
  let ctx: gsap.Context;
  let dragged = false;

  onMount(() => {
    ctx = gsap.context(() => {
      const savedPos = gmGetValue('bfao_floatBtnPos', { bottom: 30, left: 30 });
      if (btnEl) {
        btnEl.style.bottom = savedPos.bottom + 'px';
        btnEl.style.left = savedPos.left + 'px';
      }

      Draggable.create(btnEl, {
        type: 'left,top',
        bounds: document.body,
        edgeResistance: 0.75,
        inertia: false,
        onDragStart() {
          dragged = false;
          if (shouldAnimate()) {
            gsap.to(btnEl, { scale: 0.9, duration: 0.15 });
          }
        },
        onDrag() {
          dragged = true;
        },
        onDragEnd() {
          if (shouldAnimate()) {
            gsap.to(btnEl, { scale: 1, duration: 0.4, ease: EASINGS.prismBounce });
          }
          const rect = btnEl.getBoundingClientRect();
          gmSetValue('bfao_floatBtnPos', {
            bottom: window.innerHeight - rect.bottom,
            left: rect.left,
          });
        },
      });

      if (shouldAnimate()) {
        const rgb = getComputedStyle(btnEl).getPropertyValue('--ai-primary-rgb').trim() || '115, 100, 255';
        gsap.timeline({ repeat: -1, yoyo: true }).fromTo(
          btnEl,
          { boxShadow: `0 0 14px rgba(${rgb},0.18), 0 0 28px rgba(155,89,246,0.08)` },
          { boxShadow: `0 0 24px rgba(${rgb},0.35), 0 0 48px rgba(155,89,246,0.15)`, duration: 3, ease: 'sine.inOut' }
        );
      }
    }, btnEl);
  });

  onDestroy(() => {
    ctx?.revert();
  });

  function handleClick() {
    if (!dragged) onclick?.();
    dragged = false;
  }
</script>

{#if visible}
  <button
    class="float-btn"
    bind:this={btnEl}
    onclick={handleClick}
    aria-label="打开 AI 收藏夹整理器"
  >
    <Bot size={24} />
  </button>
{/if}

<style>
  .float-btn {
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 2147483640;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary-light), var(--ai-primary));
    background-size: 300% 300%;
    border: 2px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 0 14px rgba(var(--ai-primary-rgb), 0.18), 0 0 28px rgba(155, 89, 246, 0.08);
    transition: transform 0.35s cubic-bezier(0.14, 1.4, 0.3, 1);
    will-change: transform, box-shadow;
    user-select: none;
  }

  .float-btn:hover {
    transform: scale(1.08);
  }
</style>
