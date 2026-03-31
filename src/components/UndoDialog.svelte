<script lang="ts">
  import Modal from './Modal.svelte';
  import { Undo2 } from 'lucide-svelte';
  import type { UndoRecord } from '$lib/core/undo';

  export let history: UndoRecord[];
  export let onundo: ((index: number) => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
  export let processing = false;

  let selectedIndex = 0;
</script>

<Modal
  title="撤销操作"
  confirmText="执行撤销"
  confirmDisabled={processing || history.length === 0}
  onclose={() => onclose?.()}
  onconfirm={() => onundo?.(selectedIndex)}
>
  <svelte:fragment slot="icon"><Undo2 size={18} /></svelte:fragment>

  <div class="undo-content">
    {#if history.length === 0}
      <div class="empty">没有可撤销的操作记录</div>
    {:else}
      <div class="hint">选择要撤销的操作，撤销将把所有视频移回原收藏夹：</div>
      <div class="history-list">
        {#each history as record, i}
          <label class="history-item" class:selected={selectedIndex === i}>
            <input type="radio" bind:group={selectedIndex} value={i} disabled={processing} />
            <div class="item-info">
              <div class="item-time">{record.timeLocal || record.time}</div>
              <div class="item-detail">
                {record.totalVideos ?? '?'} 个视频 → {record.totalCategories ?? '?'} 个分类
                ({record.moves.length} 步操作)
              </div>
            </div>
          </label>
        {/each}
      </div>
    {/if}
  </div>
</Modal>

<style>
  .undo-content { padding: 16px 20px; }
  .empty {
    text-align: center;
    color: var(--ai-text-muted);
    padding: 24px 0;
    font-size: 13px;
  }
  .hint {
    font-size: 12px;
    color: var(--ai-text-secondary);
    margin-bottom: 12px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .history-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--ai-bg);
  }
  .history-item:hover { border-color: var(--ai-primary-light); }
  .history-item.selected {
    border-color: var(--ai-primary);
    background: var(--ai-bg-tertiary);
  }

  .history-item input[type="radio"] { margin-top: 2px; }

  .item-info { flex: 1; }
  .item-time {
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text);
  }
  .item-detail {
    font-size: 11px;
    color: var(--ai-text-muted);
    margin-top: 2px;
  }
</style>
