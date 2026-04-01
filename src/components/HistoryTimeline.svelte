<script lang="ts">
  import Modal from './Modal.svelte';
  import { Clock, Trash2 } from 'lucide-svelte';
  import type { HistoryEntry } from '$core/history';

  export let history: HistoryEntry[];
  export let onclear: (() => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
</script>

<Modal title="整理历史" showFooter={true} cancelText="关闭" confirmText="" onclose={() => onclose?.()}>
  <svelte:fragment slot="icon"><Clock size={18} /></svelte:fragment>

  <div class="bfao-modal-body">
    {#if history.length === 0}
      <div class="bfao-modal-empty">暂无整理历史记录</div>
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
    <button class="bfao-btn bfao-btn-muted clear-btn" onclick={() => onclear?.()}>
      <Trash2 size={14} /> 清空
    </button>
    <button class="bfao-btn bfao-btn-muted" onclick={() => onclose?.()}>
      关闭
    </button>
  </svelte:fragment>
</Modal>

<style>
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

  .clear-btn:hover { color: var(--ai-error); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
