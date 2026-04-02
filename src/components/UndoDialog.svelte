<script lang="ts">
  import Modal from './Modal.svelte';
  import { Undo2 } from 'lucide-svelte';
  import { contentStagger } from '$animations/micro';
  import type { UndoRecord } from '$core/undo';

  interface Props {
    history: UndoRecord[];
    onundo?: (index: number) => void;
    onclose?: () => void;
    processing?: boolean;
  }

  let { history, onundo, onclose, processing = false }: Props = $props();

  let selectedIndex = $state(0);
</script>

<Modal
  title="撤销操作"
  confirmText="执行撤销"
  confirmDisabled={processing || history.length === 0}
  onclose={() => onclose?.()}
  onconfirm={() => onundo?.(selectedIndex)}
>
  {#snippet icon()}<Undo2 size={18} />{/snippet}

  <div class="bfao-modal-body">
    {#if history.length === 0}
      <div class="bfao-modal-empty">没有可撤销的操作记录</div>
    {:else}
      <div class="hint">选择要撤销的操作，撤销将把所有视频移回原收藏夹：</div>
      <div class="history-list" use:contentStagger={{ stagger: 0.04, delay: 0.1 }}>
        {#each history as record, i}
          <label class="bfao-selectable-item" class:selected={selectedIndex === i}>
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

  :global(.bfao-selectable-item) {
    transition: border-color 0.25s ease, background 0.25s ease, transform 0.2s cubic-bezier(0.2, 1.04, 0.42, 1) !important;
  }
  :global(.bfao-selectable-item.selected) {
    transform: translateX(2px);
  }
</style>
