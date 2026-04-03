<script lang="ts">
  import Modal from './Modal.svelte';
  import { Clock, Trash2 } from 'lucide-svelte';
  import { magnetic } from '$actions/magnetic';
  import { pressEffect } from '$animations/micro';
  import type { HistoryEntry } from '$core/history';

  interface Props {
    history: HistoryEntry[];
    onclear?: () => void;
    onclose?: () => void;
  }

  let { history, onclear, onclose }: Props = $props();
</script>

<Modal title="整理历史" showFooter={true} cancelText="关闭" confirmText="" onclose={() => onclose?.()}>
  {#snippet icon()}<Clock size={18} />{/snippet}

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

  {#snippet footer()}
    <button class="bfao-btn bfao-btn-muted clear-btn" onclick={() => onclear?.()} use:magnetic={{ radius: 80, strength: 0.45 }} use:pressEffect>
      <Trash2 size={14} /> 清空
    </button>
    <button class="bfao-btn bfao-btn-muted" onclick={() => onclose?.()} use:magnetic={{ radius: 80, strength: 0.45 }} use:pressEffect>
      关闭
    </button>
  {/snippet}
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
    background: linear-gradient(to bottom, var(--ai-primary), var(--ai-border) 70%, transparent);
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
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .timeline-item:hover .timeline-dot {
    transform: scale(1.4);
    box-shadow: 0 0 0 3px var(--ai-primary-light), 0 0 10px rgba(var(--ai-primary-rgb), 0.4);
  }

  .timeline-card {
    padding: 8px 12px;
    background: var(--ai-bg-tertiary);
    border-radius: 10px;
    border: 1px solid var(--ai-border-lighter);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .timeline-item:hover .timeline-card {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--ai-primary-rgb), 0.1);
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

  .clear-btn:hover {
    color: var(--ai-error);
    animation: clearShake 0.4s ease;
  }

  .timeline-item:first-child .timeline-card {
    border-left: 2px solid var(--ai-primary);
    background: var(--ai-bg-hover);
  }

  .timeline-dot {
    animation: dotPulse 0.6s ease calc(var(--i) * 0.05s + 0.3s);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes clearShake {
    0%, 100% { margin-left: 0; }
    20% { margin-left: -2px; }
    40% { margin-left: 2px; }
    60% { margin-left: -1.5px; }
    80% { margin-left: 1px; }
  }

  @keyframes dotPulse {
    0% { box-shadow: 0 0 0 2px var(--ai-primary-light); }
    50% { box-shadow: 0 0 0 5px rgba(var(--ai-primary-rgb), 0.3), 0 0 12px rgba(var(--ai-primary-rgb), 0.2); }
    100% { box-shadow: 0 0 0 2px var(--ai-primary-light); }
  }

  @media (prefers-reduced-motion: reduce) {
    .clear-btn:hover { animation: none; }
    .timeline-dot { animation: none; }
    .timeline-item { animation: none; opacity: 1; }
  }
</style>
