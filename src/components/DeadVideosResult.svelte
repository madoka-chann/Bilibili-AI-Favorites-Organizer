<script lang="ts">
  import Modal from './Modal.svelte';
  import { Archive, Trash2 } from 'lucide-svelte';
  import { magnetic } from '$actions/magnetic';
  import { contentStagger, pressEffect } from '$animations/micro';
  import type { DeadVideoEntry } from '$core/dead-videos';

  interface Props {
    deadVideos: DeadVideoEntry[];
    onarchive?: () => void;
    ondelete?: () => void;
    onclose?: () => void;
    processing?: boolean;
  }

  let { deadVideos, onarchive, ondelete, onclose, processing = false }: Props = $props();

  // 按来源收藏夹分组
  let byFolder = $derived(deadVideos.reduce<Record<string, DeadVideoEntry[]>>((acc, v) => {
    if (!acc[v.folderTitle]) acc[v.folderTitle] = [];
    acc[v.folderTitle].push(v);
    return acc;
  }, {}));
</script>

<Modal title="失效视频扫描结果" showFooter={false} onclose={() => onclose?.()}>
  {#snippet icon()}<Archive size={18} />{/snippet}

  <div class="bfao-modal-body" use:contentStagger={{ delay: 0.1, stagger: 0.06 }}>
    <div class="bfao-modal-summary">
      发现 <strong>{deadVideos.length}</strong> 个失效视频，分布在
      <strong>{Object.keys(byFolder).length}</strong> 个收藏夹中
    </div>

    <div class="folder-list" use:contentStagger={{ stagger: 0.04, delay: 0.2 }}>
      {#each Object.entries(byFolder) as [folderName, vids]}
        <div class="folder-group">
          <div class="folder-header">📁 {folderName} ({vids.length}个)</div>
          {#each vids.slice(0, 10) as v}
            <div class="video-item">• {v.title}</div>
          {/each}
          {#if vids.length > 10}
            <div class="bfao-modal-more">...及其他 {vids.length - 10} 个</div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="bfao-action-bar">
      <button class="bfao-btn bfao-btn-primary" onclick={() => onarchive?.()} disabled={processing} use:magnetic={{ radius: 80, strength: 0.45 }} use:pressEffect>
        <Archive size={14} />
        {processing ? '处理中...' : '移动到「失效视频归档」'}
      </button>
      <button class="bfao-btn bfao-btn-danger" onclick={() => ondelete?.()} disabled={processing} use:magnetic={{ radius: 80, strength: 0.45 }} use:pressEffect>
        <Trash2 size={14} />
        {processing ? '处理中...' : '直接删除'}
      </button>
      <span class="bfao-modal-hint">移动到专用收藏夹便于日后查看；删除不可撤销</span>
    </div>
  </div>
</Modal>

<style>
  .folder-list {
    max-height: 280px;
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
  }

  .folder-group {
    margin-bottom: 8px;
    position: relative;
    border-left: 2px solid transparent;
    padding-left: 6px;
    animation: dangerAmbient 4s ease-in-out infinite;
  }

  @keyframes dangerAmbient {
    0%, 100% { border-left-color: rgba(var(--ai-error-rgb), 0.3); }
    50% { border-left-color: rgba(var(--ai-error-rgb), 0.6); }
  }
  /* Gradient separator between folder groups */
  .folder-group + .folder-group::before {
    content: '';
    display: block;
    height: 1px;
    margin: 4px 8px 8px;
    background: var(--ai-divider-gradient);
    opacity: 0.5;
  }
  .folder-header {
    font-size: 12px;
    font-weight: bold;
    color: var(--ai-text-secondary);
    padding: 4px 0;
    transition: color 0.2s ease, letter-spacing 0.2s ease;
    cursor: default;
  }
  .folder-header:hover {
    color: var(--ai-text);
    letter-spacing: 0.02em;
  }
  .folder-header::after {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 4px;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 4px solid var(--ai-text-muted);
    vertical-align: middle;
    transition: transform 0.25s ease, border-top-color 0.2s ease;
  }
  .folder-header:hover::after {
    transform: translateY(2px);
    border-top-color: var(--ai-primary);
  }
  .video-item {
    font-size: 11px;
    padding: 2px 4px 2px 12px;
    border-bottom: 1px solid var(--ai-border-lighter);
    border-left: 2px solid transparent;
    color: var(--ai-text-muted);
    border-radius: 4px;
    transition: background 0.2s ease, padding-left 0.2s ease,
                box-shadow 0.2s ease, transform 0.2s ease,
                border-left-color 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  /* Strikethrough sweep on hover */
  .video-item::after {
    content: '';
    position: absolute;
    left: 12px;
    top: 50%;
    height: 1px;
    width: 0;
    background: var(--ai-error);
    opacity: 0.5;
    transition: width 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    pointer-events: none;
  }
  .video-item:hover::after {
    width: calc(100% - 24px);
  }
  .video-item:hover {
    background: var(--ai-bg-hover);
    padding-left: 16px;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--ai-primary-rgb), 0.08);
    border-left-color: var(--ai-error);
  }

  /* Summary number emphasis pop */
  :global(.bfao-modal-summary strong) {
    display: inline-block;
    animation: emphasisPop 0.4s cubic-bezier(0.22, 1.42, 0.29, 1) both;
  }
  :global(.bfao-modal-summary strong:nth-of-type(1)) { animation-delay: 0.3s; }
  :global(.bfao-modal-summary strong:nth-of-type(2)) { animation-delay: 0.45s; }

  @keyframes emphasisPop {
    0% { transform: scale(0.8); opacity: 0.5; }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .video-item { transition: none; }
    .video-item:hover { transform: none; }
    .video-item::after { transition: none; display: none; }
    .folder-group { animation: none; border-left-color: rgba(var(--ai-error-rgb), 0.3); }
    :global(.bfao-modal-summary strong) { animation: none; opacity: 1; }
    .folder-header { transition: none; }
    .folder-header:hover { letter-spacing: normal; }
    .folder-header::after { transition: none; }
    .folder-header:hover::after { transform: none; }
  }
</style>
