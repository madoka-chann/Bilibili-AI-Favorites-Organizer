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
    transform-origin: top;
    animation: lineGrow 0.6s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  /* Flowing light pulse along the timeline */
  .timeline::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    width: 4px;
    height: 12px;
    border-radius: 2px;
    background: var(--ai-primary);
    box-shadow: 0 0 8px rgba(var(--ai-primary-rgb), 0.5);
    opacity: 0.6;
    animation: timelineDotFadeIn 0.4s ease 0.6s both,
               timelinePulseFlow 3s linear 1s infinite;
    pointer-events: none;
  }

  @keyframes lineGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  @keyframes timelineDotFadeIn {
    from { opacity: 0; }
    to { opacity: 0.6; }
  }

  @keyframes timelinePulseFlow {
    0% { top: 0; opacity: 0; }
    10% { opacity: 0.7; }
    80% { opacity: 0.4; }
    100% { top: calc(100% - 12px); opacity: 0; }
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
    box-shadow: inset 0 0 0 1px rgba(var(--ai-primary-rgb), 0.12),
                0 4px 12px rgba(var(--ai-primary-rgb), 0.1);
  }

  .timeline-time {
    font-size: 10px;
    color: var(--ai-text-muted);
    margin-bottom: 4px;
    transition: letter-spacing 0.3s ease, color 0.25s ease;
  }
  .timeline-item:hover .timeline-time {
    letter-spacing: 0.03em;
    color: var(--ai-primary);
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
    background: var(--ai-bg-hover);
    border-radius: 4px;
    padding: 3px 6px;
    border: 1px solid transparent;
    transition: background 0.2s ease, color 0.2s ease, transform 0.25s ease, border-color 0.25s ease;
  }
  .timeline-item:hover .timeline-cats {
    background: var(--ai-primary-bg);
    color: var(--ai-text-secondary);
    transform: translateY(-1px);
    border: 1px solid rgba(var(--ai-primary-rgb), 0.15);
  }

  .clear-btn:hover {
    color: var(--ai-error);
    animation: clearShake 0.4s ease;
    box-shadow: 0 0 12px rgba(var(--ai-error-rgb), 0.2);
  }

  .timeline-item:first-child .timeline-card {
    border-left: 2px solid var(--ai-primary);
    background: var(--ai-bg-hover);
    animation: latestGlow 3s ease-in-out 0.8s infinite;
  }

  @keyframes latestGlow {
    0%, 100% { box-shadow: inset 0 0 0 1px rgba(var(--ai-primary-rgb), 0.12), 0 4px 12px rgba(var(--ai-primary-rgb), 0.1); }
    50% { box-shadow: inset 0 0 0 1px rgba(var(--ai-primary-rgb), 0.2), var(--ai-glow-breath-strong); }
  }

  .timeline-dot {
    animation: dotPulse 0.6s ease calc(var(--i) * 0.05s + 0.3s),
               dotChainPulse 1.5s ease-in-out calc(var(--i) * 0.3s + 1s) infinite;
  }

  @keyframes dotChainPulse {
    0%, 100% { box-shadow: 0 0 0 2px var(--ai-primary-light); }
    50% { box-shadow: 0 0 0 4px rgba(var(--ai-primary-rgb), 0.25), 0 0 8px rgba(var(--ai-primary-rgb), 0.15); }
  }

  /* Inner glow bar on card hover — no overflow:hidden on card to preserve hover box-shadow */
  .timeline-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ai-primary-light), transparent);
    transform: scaleX(0);
    transition: transform 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    pointer-events: none;
  }
  .timeline-item:hover .timeline-card::before {
    transform: scaleX(1);
  }

  /* Empty state breathing */
  :global(.bfao-modal-empty) {
    animation: emptyBreath 3s ease-in-out infinite;
  }

  @keyframes emptyBreath {
    0%, 100% { opacity: 0.5; transform: translateY(0); }
    50% { opacity: 0.8; transform: translateY(-2px); }
  }

  /* Category tag hover accent */
  .timeline-cats:hover {
    border-left: 2px solid var(--ai-gradient-accent);
    padding-left: 4px;
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
    .timeline::before { animation: none; transform: scaleY(1); }
    .timeline::after { animation: none; display: none; }
    .timeline-item:first-child .timeline-card { animation: none; }
    .timeline-time { transition: none; }
    .timeline-cats { transition: none; }
    .timeline-cats:hover { border-left: none; padding-left: 6px; }
    .timeline-item:hover .timeline-cats { transform: none; }
    .timeline-card::before { transition: none; display: none; }
    :global(.bfao-modal-empty) { animation: none; opacity: 0.5; }
  }
</style>
