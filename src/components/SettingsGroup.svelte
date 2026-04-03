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

  let open = $state(defaultOpen);
  let bodyEl = $state<HTMLElement>(undefined!);
  let chevronEl = $state<HTMLElement>(undefined!);

  let iconEl = $state<HTMLElement>(undefined!);

  onMount(() => {
    // Set initial state via inline styles — GSAP takes control from here
    if (open && bodyEl) {
      bodyEl.style.height = 'auto';
      bodyEl.style.overflow = 'visible';
    } else if (bodyEl) {
      bodyEl.style.height = '0px';
      bodyEl.style.overflow = 'hidden';
      bodyEl.style.paddingTop = '0';
      bodyEl.style.paddingBottom = '0';
    }
    if (open && chevronEl) {
      gsap.set(chevronEl, { rotation: 90 });
    }
  });

  onDestroy(() => {
    if (bodyEl) gsap.killTweensOf(bodyEl);
    if (chevronEl) gsap.killTweensOf(chevronEl);
    if (iconEl) gsap.killTweensOf(iconEl);
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
        // Animate from current (0) to auto height using GSAP
        gsap.set(bodyEl, { height: 'auto', overflow: 'hidden', opacity: 1, paddingTop: '', paddingBottom: '' });
        const h = bodyEl.scrollHeight || bodyEl.offsetHeight;
        gsap.set(bodyEl, { height: 0, opacity: 0 });

        // If measurement failed, just snap open
        if (h <= 0) {
          bodyEl.style.height = 'auto';
          bodyEl.style.overflow = '';
          bodyEl.style.opacity = '1';
          bodyEl.style.paddingTop = '';
          bodyEl.style.paddingBottom = '';
        } else {
          gsap.to(bodyEl, {
            height: h, opacity: 1, paddingTop: '', paddingBottom: '', duration: 0.35, ease: 'power2.out',
            onComplete: () => {
              bodyEl.style.height = 'auto';
              bodyEl.style.overflow = '';
              bodyEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          });
        }

        // Icon pulse on open
        if (iconEl) {
          gsap.fromTo(iconEl, { scale: 1 }, {
            scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out',
          });
        }
      } else {
        gsap.to(bodyEl, {
          height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0,
          duration: 0.28, ease: EASINGS.silkOut,
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
      bodyEl.style.paddingTop = open ? '' : '0';
      bodyEl.style.paddingBottom = open ? '' : '0';
    }
  }
</script>

<div class="group" class:open>
  <button
    class="group-header"
    onclick={toggle}
    aria-expanded={open}
  >
    {#if icon}
      {@const Icon = icon}
      <span class="group-icon" style:background={hexToRgba(iconColor, 0.1)} style:color={iconColor} bind:this={iconEl}>
        <Icon size={14} />
      </span>
    {/if}
    <span class="group-title">{title}</span>
    <span class="chevron" class:open bind:this={chevronEl}>
      <ChevronRight size={14} />
    </span>
  </button>

  <div class="group-body" bind:this={bodyEl}>
    {#if children}{@render children()}{/if}
  </div>
</div>

<style>
  .group {
    margin-bottom: 2px;
    overflow: hidden;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text-secondary);
    user-select: none;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    position: relative;
  }

  .group-header:hover {
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
  }

  .group-header:hover .group-icon {
    filter: brightness(1.2);
  }

  .group.open .group-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--ai-primary-light), transparent);
    opacity: 0.4;
  }

  .group-icon {
    width: 22px;
    height: 22px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: filter 0.25s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }

  .group.open .group-icon {
    box-shadow: 0 0 8px rgba(var(--ai-primary-rgb), 0.3);
  }

  .group-title {
    flex: 1;
  }

  .chevron {
    display: flex;
  }

  .group-body {
    padding: 0 2px 8px;
    height: 0;
    overflow: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    .group.open .group-header::after { animation: none; opacity: 0.5; }
    .group-icon { transition: none; }
    .group.open .group-icon { transform: none; box-shadow: none; }
  }
</style>
