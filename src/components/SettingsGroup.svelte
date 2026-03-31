<script lang="ts">
  import { slide } from 'svelte/transition';
  import { ChevronRight } from 'lucide-svelte';

  export let title: string;
  export let icon: any = null;
  export let iconColor: string = '#7C5CFC';
  export let defaultOpen: boolean = false;

  let open = defaultOpen;
</script>

<div class="group">
  <button
    class="group-header"
    onclick={() => (open = !open)}
    aria-expanded={open}
  >
    {#if icon}
      <span class="group-icon" style:background="rgba({iconColor}, 0.1)" style:color={iconColor}>
        <svelte:component this={icon} size={14} />
      </span>
    {/if}
    <span class="group-title">{title}</span>
    <span class="chevron" class:open>
      <ChevronRight size={14} />
    </span>
  </button>

  {#if open}
    <div class="group-body" transition:slide={{ duration: 250 }}>
      <slot />
    </div>
  {/if}
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
    transition: transform 0.25s cubic-bezier(0.2, 1.04, 0.42, 1);
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .group-body {
    padding-left: 2px;
    padding-bottom: 8px;
  }
</style>
