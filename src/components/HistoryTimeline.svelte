<script lang="ts">
  import Modal from './Modal.svelte';
  import { Clock, Trash2 } from 'lucide-svelte';
  import type { HistoryEntry } from '$lib/core/history';

  export let history: HistoryEntry[];
  export let onclear: (() => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
</script>

<Modal title="整理历史" showFooter={true} cancelText="关闭" confirmText="" on:close={() => onclose?.()}>
  <svelte:fragment slot="icon"><Clock size={18} /></svelte:fragment>

  <div class="timeline-content">
    {#if history.length === 0}
      <div class="empty">暂无整理历史记录</div>
    {:else}
      <div class="timeline">
        {#each history as entry, i}
          <div class="timeline-item" style="--i: {i}">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-time">{entry.time}</div>
              <div class="timeline-detail">
                整理了 <strong>{entry.videoCount}</strong> 个视频 →
                <strong>{entry.categoryCount}</strong> 个分类
              </div>
              {#if entry.categories}
                <div class="timeline-cats">{entry.categories}</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    <button class="modal-btn clear-btn" onclick={() => onclear?.()}>
      <Trash2 size={14} /> 清空
    </button>
    <button class="modal-btn close-btn" onclick={() => onclose?.()}>
      关闭
    </button>
  </svelte:fragment>
</Modal>

<style>
  .timeline-content { padding: 16px 20px; }
  .empty {
    text-align: center;
    color: var(--ai-text-muted);
    padding: 24px 0;
    font-size: 13px;
  }

  .timeline {
    position: relative;
    padding-left: 20px;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--ai-border);
  }

  .timeline-item {
    position: relative;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease calc(var(--i) * 0.05s) both;
  }

  .timeline-dot {
    position: absolute;
    left: -17px;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ai-primary);
    border: 2px solid var(--ai-bg);
    box-shadow: 0 0 0 2px var(--ai-primary-light);
  }

  .timeline-card {
    padding: 8px 12px;
    background: var(--ai-bg-tertiary);
    border-radius: 10px;
    border: 1px solid var(--ai-border-lighter);
  }

  .timeline-time {
    font-size: 10px;
    color: var(--ai-text-muted);
    margin-bottom: 4px;
  }
  .timeline-detail {
    font-size: 12px;
    color: var(--ai-text);
  }
  .timeline-detail strong { color: var(--ai-primary); }
  .timeline-cats {
    font-size: 10px;
    color: var(--ai-text-muted);
    margin-top: 4px;
    line-height: 1.4;
  }

  .modal-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s ease;
  }
  .clear-btn {
    max-width: 120px;
    background: var(--ai-border-lighter);
    color: var(--ai-text-muted);
    font-size: 12px;
  }
  .clear-btn:hover { background: var(--ai-bg-tertiary); color: var(--ai-error); }
  .close-btn {
    max-width: 120px;
    background: var(--ai-border-lighter);
    color: var(--ai-text-secondary);
  }
  .close-btn:hover { background: var(--ai-bg-tertiary); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
