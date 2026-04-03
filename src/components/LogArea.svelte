<script lang="ts">
  import { logs, isRunning } from '$stores/state';
  import { onMount, onDestroy, tick } from 'svelte';
  import { textDecode, textDecodeLoop } from '$animations/text';

  let logEl = $state<HTMLDivElement>(undefined!);

  // 跟踪已解码的日志 ID，避免重复动画
  let decodedIds = new Set<number>();

  // 自动滚动到底部 + 同步清理已不在 DOM 中的 ID
  $effect(() => {
    if ($logs.length && logEl) {
      // 保持 decodedIds 与当前日志同步，防止长时间运行后无限增长
      if (decodedIds.size > $logs.length * 2) {
        const currentIds = new Set($logs.map((l) => l.id));
        decodedIds = new Set([...decodedIds].filter((id) => currentIds.has(id)));
      }
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

  let catTextEl = $state<HTMLSpanElement>(undefined!);
  let catCleanup: { destroy: () => void } | null = null;

  onMount(() => {
    if ($logs.length === 0) {
      logs.add('AI 收藏夹整理器 v2.0 就绪', 'success');
    }
    // Start cat text loop
    if (catTextEl) {
      catCleanup = textDecodeLoop(catTextEl, {
        charDelay: 18,
        pauseMs: 3000,
        messages: [
          '喵~ 准备好了吗？',
          '点击「开始整理」吧~',
          '收藏夹需要整理喵！',
          '我来帮你分类~',
        ],
      });
    }
  });

  onDestroy(() => { catCleanup?.destroy(); });
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

  <div class="log-cat" class:away={$isRunning}>
    <span class="cat-emoji">🐱</span>
    <span class="cat-text" bind:this={catTextEl}>喵~ 准备好了吗？</span>
  </div>
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
    position: relative;
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
    animation: logSlideIn 0.25s ease both;
    transition: background 0.2s ease;
  }

  .log-entry:hover {
    background: var(--ai-bg-tertiary);
    border-left-width: 4px;
    padding-left: 7px; /* compensate 1px border-left growth to prevent layout shift */
  }

  .log-time {
    flex-shrink: 0;
    font-size: 9px;
    color: var(--ai-text-muted);
    background: var(--ai-bg-tertiary);
    padding: 1px 5px;
    border-radius: 8px;
    line-height: 16px;
    transition: letter-spacing 0.2s ease, background 0.2s ease;
  }

  .log-entry:hover .log-time {
    letter-spacing: 0.04em;
    background: var(--ai-border-light);
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

  .log-entry:first-child.log-success {
    animation: logSlideIn 0.25s ease both, readyPulse 3s ease-in-out 0.5s infinite;
  }

  .log-error {
    color: var(--ai-error-alt);
    border-left-color: var(--ai-error-alt);
    animation: logSlideIn 0.25s ease both, borderGlow 0.6s ease 0.25s 2;
  }

  .log-warning {
    color: var(--ai-warning);
    border-left-color: var(--ai-warning);
    animation: logSlideIn 0.25s ease both, borderGlowWarn 0.8s ease 0.25s 1;
  }

  .log-info {
    color: var(--ai-info);
    border-left-color: var(--ai-info);
  }

  .log-cat {
    position: absolute;
    bottom: 4px;
    left: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: linear-gradient(to top, var(--ai-bg-tertiary) 70%, transparent);
    font-size: 11px;
    color: var(--ai-primary);
    border-radius: 0 0 8px 8px;
    transition: opacity 0.4s ease, transform 0.4s ease;
    pointer-events: none;
  }
  .log-cat.away {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
    pointer-events: none;
  }
  .cat-emoji {
    font-size: 18px;
    animation: catIdle 1s ease-in-out infinite alternate;
  }
  .cat-text {
    font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
    letter-spacing: 0.03em;
  }
  @keyframes catIdle {
    from { transform: translateY(0); }
    to { transform: translateY(-3px); }
  }

  @keyframes logSlideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes borderGlow {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: inset 3px 0 8px -2px var(--ai-error-alt); }
  }

  @keyframes borderGlowWarn {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: inset 3px 0 6px -2px var(--ai-warning); }
  }

  @keyframes readyPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @media (prefers-reduced-motion: reduce) {
    .log-entry:first-child.log-success { animation: none; }
    .log-time { transition: none; }
    .log-entry:hover { border-left-width: 3px; padding-left: 8px; }
  }
</style>
