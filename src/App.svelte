<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import FloatButton from '$components/FloatButton.svelte';
  import Panel from '$components/Panel.svelte';
  import Toast from '$components/Toast.svelte';
  import { panelOpen } from '$stores/state';
  import { isDark, accentColor, destroyThemeListeners } from '$stores/theme';
  import { Flip, shouldAnimate } from '$animations/gsap-config';
  import './styles/variables.css';
  import './styles/forms.css';
  import './styles/modal.css';

  let flipState: Flip.FlipState | null = null;
  let spotlightEl = $state<HTMLDivElement>(undefined!);

  onDestroy(destroyThemeListeners);

  // Global cursor spotlight
  onMount(() => {
    if (!shouldAnimate()) return;
    function onMove(e: MouseEvent) {
      if (spotlightEl) {
        spotlightEl.style.left = e.clientX + 'px';
        spotlightEl.style.top = e.clientY + 'px';
        spotlightEl.style.opacity = '1';
      }
    }
    function onLeave() {
      if (spotlightEl) spotlightEl.style.opacity = '0';
    }
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  });

  function openPanel() {
    // Capture button position for panel entry animation
    const btn = document.querySelector('.bfao-app .float-btn') as HTMLElement | null;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      flipState = { btnX: rect.left, btnY: rect.top } as unknown as Flip.FlipState;
    }
    panelOpen.set(true);
  }

  function closePanel() {
    flipState = null;
    panelOpen.set(false);
  }
</script>

<div
  class="bfao-app"
  data-theme={$isDark ? 'dark' : 'light'}
  style:--ai-accent={$accentColor}
>
  <FloatButton onclick={openPanel} visible={!$panelOpen} />

  {#if $panelOpen}
    <Panel onclose={closePanel} {flipState} />
  {/if}

  <Toast />
  <div class="cursor-spotlight" bind:this={spotlightEl}></div>
</div>

<style>
  .bfao-app {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483640; /* Z_INDEX.FLOAT */
  }

  .bfao-app :global(*) {
    pointer-events: auto;
  }

  .cursor-spotlight {
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(var(--ai-primary-rgb, 115, 100, 255), 0.12) 0%,
      rgba(var(--ai-primary-rgb, 115, 100, 255), 0.05) 30%,
      transparent 65%
    );
    pointer-events: none;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2147483647;
    will-change: left, top;
  }
</style>
