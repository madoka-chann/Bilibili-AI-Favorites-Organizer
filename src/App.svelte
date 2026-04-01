<script lang="ts">
  import { onDestroy } from 'svelte';
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

  onDestroy(destroyThemeListeners);

  function openPanel() {
    // A4: Capture FloatButton position for FLIP morph
    if (shouldAnimate()) {
      const btn = document.querySelector('.bfao-app .float-btn') as HTMLElement | null;
      if (btn && Flip) {
        flipState = Flip.getState(btn);
      }
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
</div>

<style>
  .bfao-app {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483640;
  }

  .bfao-app :global(*) {
    pointer-events: auto;
  }
</style>
