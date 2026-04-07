<script lang="ts">
  import Modal from './Modal.svelte';
  import { Copy } from 'lucide-svelte';
  import { magnetic } from '$actions/magnetic';
  import { contentStagger, pressEffect } from '$animations/micro';
  import type { DuplicateEntry } from '$core/duplicates';

  interface Props {
    duplicates: DuplicateEntry[];
    ondedup?: () => void;
    onclose?: () => void;
    processing?: boolean;
  }

  let { duplicates, ondedup, onclose, processing = false }: Props = $props();

  let showCount = $derived(Math.min(duplicates.length, 50));
</script>

<Modal title="重复视频扫描结果" showFooter={false} onclose={() => onclose?.()}>
  {#snippet icon()}<Copy size={18} />{/snippet}

  <div class="bfao-modal-body" use:contentStagger={{ delay: 0.1, stagger: 0.06 }}>
    <div class="bfao-modal-summary">
      发现 <strong>{duplicates.length}</strong> 个重复视频
    </div>

    <div class="dup-list" use:contentStagger={{ stagger: 0.03, delay: 0.2 }}>
      {#each duplicates.slice(0, showCount) as d, i}
        <div class="dup-item" style="--idx: {i}">
          <div class="dup-title">• {d.title}</div>
          <div class="dup-folders">出现在：{d.folders.join('、')}</div>
        </div>
      {/each}
      {#if duplicates.length > 50}
        <div class="bfao-modal-more">...及其他 {duplicates.length - 50} 个</div>
      {/if}
    </div>

    <div class="bfao-action-bar">
      <button class="bfao-btn bfao-btn-primary" onclick={() => ondedup?.()} disabled={processing} use:magnetic={{ radius: 80, strength: 0.45 }} use:pressEffect>
        {processing ? '正在去重...' : '一键去重'}
      </button>
      <span class="bfao-modal-hint">保留首次出现的收藏夹，从其他收藏夹删除副本</span>
    </div>
  </div>
</Modal>

<style>
  .dup-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 14px;
    mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 12px,
      black calc(100% - 12px),
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0px,
      black 12px,
      black calc(100% - 12px),
      transparent 100%
    );
    padding-top: 4px;
    padding-bottom: 4px;
    counter-reset: dup-counter;
  }

  .dup-item {
    font-size: 11px;
    padding: 5px 4px 5px 28px;
    border-bottom: 1px solid var(--ai-border-lighter);
    border-radius: 4px;
    transition: background 0.2s ease, padding-left 0.2s ease,
                box-shadow 0.2s ease, transform 0.2s ease;
    position: relative;
    counter-increment: dup-counter;
  }
  .dup-item::before {
    content: counter(dup-counter);
    position: absolute;
    left: 4px;
    top: 6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, color 0.2s ease;
    animation: counterPop 0.35s cubic-bezier(0.22, 1.42, 0.29, 1) backwards;
    animation-delay: calc(var(--idx, 0) * 0.04s + 0.25s);
  }

  @keyframes counterPop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  .dup-item:hover::before {
    background: var(--ai-primary);
    color: #fff;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(var(--ai-primary-rgb), 0.3);
  }
  .dup-item:hover {
    background: var(--ai-bg-hover);
    padding-left: 32px;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--ai-primary-rgb), 0.08);
  }
  .dup-title {
    color: var(--ai-text);
    transition: color 0.2s ease;
  }
  .dup-item:hover .dup-title {
    color: var(--ai-primary);
  }
  .dup-folders {
    color: var(--ai-text-muted);
    padding-left: 12px;
    font-size: 10px;
    transition: opacity 0.2s ease, transform 0.2s ease;
    opacity: 0.7;
    position: relative;
  }
  /* Underline gradient reveal on hover */
  .dup-folders::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 12px;
    right: 0;
    height: 1px;
    background: var(--ai-divider-gradient);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
  }
  .dup-item:hover .dup-folders::after {
    transform: scaleX(1);
  }

  /* Connection line between adjacent items */
  .dup-item + .dup-item::before {
    box-shadow: 0 -4px 0 0 rgba(var(--ai-primary-rgb), 0.08);
  }
  .dup-item:hover .dup-folders {
    opacity: 1;
    transform: translateX(2px);
  }

  /* Processing state striped overlay on dedup button — scoped to .bfao-action-bar to avoid global leak */
  .bfao-action-bar :global(.bfao-btn-primary:disabled)::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      var(--ai-stripe-overlay) 0px,
      var(--ai-stripe-overlay) 6px,
      transparent 6px,
      transparent 12px
    );
    animation: dupProcessingStripes 0.8s linear infinite;
    border-radius: inherit;
    pointer-events: none;
  }

  @keyframes dupProcessingStripes {
    from { background-position: 0 0; }
    to { background-position: 17px 0; }
  }

  /* Duplicate count emphasis — strong is Svelte-scoped, no leak */
  :global(.bfao-modal-summary) strong {
    color: var(--ai-error);
    font-size: 1.15em;
    animation: dupCountPulse 2s ease-in-out 0.5s infinite;
  }

  @keyframes dupCountPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; text-shadow: var(--ai-glow-danger-text); }
  }

  /* "...及其他 N 个" fade-in reveal */
  :global(.bfao-modal-more) {
    animation: moreReveal 0.4s ease 0.5s both;
  }

  @keyframes moreReveal {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 0.7; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dup-item { transition: none; }
    .dup-item:hover { transform: none; }
    .dup-item::before { transition: none; animation: none; opacity: 1; }
    .dup-item:hover::before { transform: none; box-shadow: none; }
    .dup-folders { transition: none; }
    .dup-folders::after { transition: none; display: none; }
    .dup-item:hover .dup-folders { transform: none; }
    .bfao-action-bar :global(.bfao-btn-primary:disabled)::after { animation: none; display: none; }
    :global(.bfao-modal-summary) strong { animation: none; opacity: 1; }
    :global(.bfao-modal-more) { animation: none; opacity: 0.7; }
  }
</style>
