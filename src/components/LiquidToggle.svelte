<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';

  export let checked = false;
  export let onchange: ((checked: boolean) => void) | undefined = undefined;

  let thumbEl: HTMLElement;
  let trackEl: HTMLElement;
  let mounted = false;

  onMount(() => {
    if (checked && thumbEl) {
      gsap.set(thumbEl, { x: 18 });
    }
    mounted = true;
  });

  function toggle() {
    checked = !checked;
    onchange?.(checked);

    if (!mounted || !shouldAnimate() || !thumbEl || !trackEl) return;

    // C5: Liquid toggle — thumb slides with stretch/squish
    const tl = gsap.timeline();
    tl.to(thumbEl, {
      scaleX: 1.3,
      scaleY: 0.85,
      duration: 0.12,
      ease: 'power2.in',
    });
    tl.to(thumbEl, {
      x: checked ? 18 : 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.28,
      ease: EASINGS.velvetSpring,
    });
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
    transition: background 0.3s ease;
    padding: 0;
    flex-shrink: 0;
  }

  .liquid-toggle.on {
    background: var(--ai-primary);
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
  }
</style>
