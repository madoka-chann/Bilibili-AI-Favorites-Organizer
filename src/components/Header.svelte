<script lang="ts">
  import { X, Settings, Moon, Sun } from 'lucide-svelte';
  import { isDark, toggleTheme } from '$lib/stores/theme';

  export let settingsOpen = false;
  export let onclose: (() => void) | undefined = undefined;
</script>

<div class="header">
  <div class="header-title">
    <span>AI 收藏夹整理器</span>
    <span class="version">v2.0</span>
  </div>

  <div class="header-actions">
    <button
      class="header-btn"
      onclick={toggleTheme}
      title={$isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {#if $isDark}
        <Sun size={16} />
      {:else}
        <Moon size={16} />
      {/if}
    </button>

    <button
      class="header-btn"
      class:active={settingsOpen}
      title="设置"
      onclick={() => (settingsOpen = !settingsOpen)}
    >
      <Settings size={16} />
    </button>

    <button
      class="header-btn"
      onclick={() => onclose?.()}
      title="关闭"
    >
      <X size={16} />
    </button>
  </div>
</div>

<style>
  .header {
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary));
    background-size: 400% 400%;
    animation: aurora-flow 18s ease-in-out infinite;
    color: #fff;
    padding: 16px 18px;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .version {
    font-size: 10px;
    opacity: 0.7;
    background: rgba(255, 255, 255, 0.15);
    padding: 1px 6px;
    border-radius: 8px;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .header-btn {
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.12) translateY(-1px);
  }

  .header-btn.active {
    background: rgba(255, 255, 255, 0.35);
  }

  @keyframes aurora-flow {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 25%; }
    50% { background-position: 50% 100%; }
    75% { background-position: 0% 75%; }
  }
</style>
