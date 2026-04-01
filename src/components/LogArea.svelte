<script lang="ts">
  import { logs } from '$stores/state';
  import { onMount, tick } from 'svelte';
  import { textDecode } from '$animations/text';

  let logEl = $state<HTMLDivElement>(undefined!);

  // 跟踪已解码的日志 ID，避免重复动画
  let decodedIds = new Set<number>();

  // 自动滚动到底部
  $effect(() => {
    if ($logs.length && logEl) {
      tick().then(() => {
        logEl.scrollTop = logEl.scrollHeight;
      });
    }
  });

  /** H1: 日志条目文字解码效果 */
  function decodeEntry(node: HTMLElement) {
    const msgEl = node.querySelector('.log-msg') as HTMLElement;
    if (!msgEl) return;

    const id = Number(node.dataset.logId);
    if (decodedIds.has(id)) return;
    decodedIds.add(id);

    const { destroy } = textDecode(msgEl, { charDelay: 20 });
    return { destroy };
  }

  onMount(() => {
    // 添加欢迎消息
    if ($logs.length === 0) {
      logs.add('AI 收藏夹整理器 v2.0 就绪', 'success');
    }
  });
</script>

<div class="log-area" bind:this={logEl}>
  {#each $logs as entry (entry.id)}
    <div
      class="log-entry log-{entry.level}"
      data-log-id={entry.id}
      use:decodeEntry
    >
      <span class="log-time">{entry.time}</span>
      <span class="log-msg">{entry.message}</span>
    </div>
  {/each}
</div>

<style>
  .log-area {
    margin-top: 10px;
    background: var(--ai-bg-tertiary);
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 11px;
    color: var(--ai-text);
    height: 120px;
    overflow-y: auto;
    overflow-wrap: break-word;
    word-break: break-word;
    border: 1px solid var(--ai-border-light);
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .log-entry {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--ai-bg-secondary);
    border-left: 3px solid transparent;
    line-height: 1.5;
  }

  .log-time {
    flex-shrink: 0;
    font-size: 9px;
    color: var(--ai-text-muted);
    background: var(--ai-bg-tertiary);
    padding: 1px 5px;
    border-radius: 8px;
    line-height: 16px;
  }

  .log-msg {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
    letter-spacing: 0.02em;
  }

  .log-success {
    color: var(--ai-success-dark);
    border-left-color: var(--ai-success);
  }

  .log-error {
    color: var(--ai-error-alt);
    border-left-color: var(--ai-error-alt);
  }

  .log-warning {
    color: var(--ai-warning);
    border-left-color: var(--ai-warning);
  }

  .log-info {
    color: var(--ai-info);
    border-left-color: var(--ai-info);
  }
</style>
