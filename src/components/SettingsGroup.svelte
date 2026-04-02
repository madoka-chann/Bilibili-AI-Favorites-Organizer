<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Snippet, ComponentType } from 'svelte';
  import { ChevronRight } from 'lucide-svelte';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';

  interface Props {
    title: string;
    icon?: ComponentType | null;
    iconColor?: string;
    defaultOpen?: boolean;
    children?: Snippet;
  }

  let { title, icon = null, iconColor = '#7C5CFC', defaultOpen = false, children }: Props = $props();

  let _initOpen = defaultOpen; // eslint-disable-line -- intentional initial capture
  let open = $state(_initOpen);
  let bodyEl = $state<HTMLElement>(undefined!);
  let chevronEl = $state<HTMLElement>(undefined!);

  onMount(() => {
    // Set initial state for GSAP control — body element is now bound
    if (!open && bodyEl) {
      bodyEl.style.height = '0px';
      bodyEl.style.overflow = 'hidden';
    }
    if (open && chevronEl) {
      gsap.set(chevronEl, { rotation: 90 });
    }
  });

  onDestroy(() => {
    if (bodyEl) gsap.killTweensOf(bodyEl);
    if (chevronEl) gsap.killTweensOf(chevronEl);
  });

  /** Convert hex to rgba string for background tint */
  function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function toggle() {
    open = !open;
    if (!bodyEl) return;

    if (shouldAnimate()) {
      // B4: GSAP spring accordion
      if (open) {
        gsap.set(bodyEl, { height: 'auto', overflow: 'hidden' });
        const h = bodyEl.offsetHeight;
        gsap.fromTo(bodyEl,
          { height: 0, opacity: 0 },
          { height: h, opacity: 1, duration: 0.35, ease: EASINGS.velvetSpring,
            onComplete: () => { gsap.set(bodyEl, { height: 'auto', overflow: '', clearProps: 'opacity' }); } }
        );
      } else {
        gsap.to(bodyEl, {
          height: 0, opacity: 0, duration: 0.28, ease: EASINGS.silkOut,
          overflow: 'hidden',
        });
      }

      if (chevronEl) {
        gsap.to(chevronEl, {
          rotation: open ? 90 : 0,
          duration: 0.3,
          ease: EASINGS.velvetSpring,
        });
      }
    } else {
      // No animation — instant toggle
      bodyEl.style.height = open ? 'auto' : '0px';
      bodyEl.style.overflow = open ? '' : 'hidden';
    }
  }
</script>

<div class="group">
  <button
    class="group-header"
    onclick={toggle}
    aria-expanded={open}
  >
    {#if icon}
      {@const Icon = icon}
      <span class="group-icon" style:background={hexToRgba(iconColor, 0.1)} style:color={iconColor}>
        <Icon size={14} />
      </span>
    {/if}
    <span class="group-title">{title}</span>
    <span class="chevron" class:open bind:this={chevronEl}>
      <ChevronRight size={14} />
    </span>
  </button>

  <div class="group-body" bind:this={bodyEl} class:initially-open={defaultOpen}>
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .group {
    margin-bottom: 2px;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    margin: 3px -10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text-secondary);
    user-select: none;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    background: transparent;
    border: none;
    width: calc(100% + 20px);
    text-align: left;
  }

  .group-header:hover {
    background: linear-gradient(
      135deg,
      var(--ai-primary-bg),
      rgba(255, 107, 157, 0.05)
    );
    color: var(--ai-primary);
  }

  .group-icon {
    width: 22px;
    height: 22px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .group-title {
    flex: 1;
  }

  .chevron {
    display: flex;
  }

  .group-body {
    padding-left: 2px;
    padding-bottom: 8px;
    height: 0;
    overflow: hidden;
  }

  .group-body.initially-open {
    height: auto;
    overflow: visible;
  }
</style>
