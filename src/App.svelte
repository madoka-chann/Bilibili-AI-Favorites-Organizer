<script lang="ts">
  import FloatButton from '$components/FloatButton.svelte';
  import Panel from '$components/Panel.svelte';
  import Toast from '$components/Toast.svelte';
  import { panelOpen } from '$stores/state';
  import { isDark, accentColor } from '$stores/theme';
  import '$animations/gsap-config';
  import './styles/variables.css';
  import './styles/forms.css';
  import './styles/modal.css';
</script>

<div
  class="bfao-app"
  data-theme={$isDark ? 'dark' : 'light'}
  style:--ai-accent={$accentColor}
>
  <FloatButton onclick={() => panelOpen.set(true)} visible={!$panelOpen} />

  {#if $panelOpen}
    <Panel onclose={() => panelOpen.set(false)} />
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
