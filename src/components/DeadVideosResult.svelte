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
  }

  .folder-group { margin-bottom: 8px; }
  .folder-header {
    font-size: 12px;
    font-weight: bold;
    color: var(--ai-text-secondary);
    padding: 4px 0;
    transition: color 0.2s ease;
  }
  .folder-header:hover {
    color: var(--ai-text);
  }
  .video-item {
    font-size: 11px;
    padding: 2px 4px 2px 12px;
    border-bottom: 1px solid var(--ai-border-lighter);
    color: var(--ai-text-muted);
    border-radius: 4px;
    transition: background 0.2s ease, padding-left 0.2s ease;
  }
  .video-item:hover {
    background: var(--ai-bg-hover);
    padding-left: 16px;
  }
</style>
