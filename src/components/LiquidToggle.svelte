<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap, EASINGS, shouldAnimate, shouldAnimateFunctional } from '$animations/gsap-config';

  interface Props {
    checked?: boolean;
    label?: string;
    onchange?: (checked: boolean) => void;
  }

  let { checked = false, label = '', onchange }: Props = $props();

  let thumbEl = $state<HTMLElement>(undefined!);
  let trackEl = $state<HTMLElement>(undefined!);
  let mounted = false;
  let activeTl: gsap.core.Timeline | null = null;

  onMount(() => {
    if (checked && thumbEl) {
      gsap.set(thumbEl, { x: 18 });
    }
    mounted = true;
  });

  onDestroy(() => {
    activeTl?.kill();
    if (thumbEl) gsap.killTweensOf(thumbEl);
    if (trackEl) gsap.killTweensOf(trackEl);
  });

  function toggle() {
    const newChecked = !checked;
    onchange?.(newChecked);

    if (!mounted || !thumbEl || !trackEl) return;

    // Toggle slide is functional — always animate unless OS prefers-reduced-motion
    if (!shouldAnimateFunctional()) {
      gsap.set(thumbEl, { x: newChecked ? 18 : 0 });
      return;
    }

    // C5: Liquid toggle — thumb slides with optional stretch/squish
    activeTl?.kill();
    const tl = gsap.timeline();
    activeTl = tl;
    if (shouldAnimate()) {
      // Fancy liquid stretch effect
      tl.to(thumbEl, { scaleX: 1.3, scaleY: 0.85, duration: 0.12, ease: 'power2.in' });
    }
    tl.to(thumbEl, {
      x: newChecked ? 18 : 0,
      scaleX: 1,
      scaleY: 1,
      duration: shouldAnimate() ? 0.28 : 0.15,
      ease: shouldAnimate() ? EASINGS.velvetSpring : 'power2.out',
    });
    if (!shouldAnimate()) return;
    // Track color pulse
    gsap.to(trackEl, {
      scale: 1.06,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
    });
  }
</script>

<button
  class="liquid-toggle"
  class:on={checked}
  role="switch"
  aria-checked={checked}
  aria-label={label || undefined}
  onclick={toggle}
  bind:this={trackEl}
>
  <span class="thumb" bind:this={thumbEl}></span>
</button>

<style>
  .liquid-toggle {
    position: relative;
    width: 38px;
    height: 20px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    background: var(--ai-bg-tertiary);
    transition: background 0.3s ease, box-shadow 0.3s ease;
    padding: 0;
    flex-shrink: 0;
  }

  .liquid-toggle.on {
    background: var(--ai-primary);
    box-shadow: 0 0 10px rgba(var(--ai-primary-rgb), 0.35);
  }

  .thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    will-change: transform;
    transition: box-shadow 0.3s ease;
  }

  .liquid-toggle.on .thumb {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 6px rgba(255, 255, 255, 0.5);
  }
</style>
