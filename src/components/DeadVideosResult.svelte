<script lang="ts">
  import Modal from './Modal.svelte';
  import { Archive, Trash2 } from 'lucide-svelte';
  import type { DeadVideoEntry } from '$lib/core/dead-videos';

  export let deadVideos: DeadVideoEntry[];
  export let onarchive: (() => void) | undefined = undefined;
  export let ondelete: (() => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
  export let processing = false;

  // 按来源收藏夹分组
  $: byFolder = deadVideos.reduce<Record<string, DeadVideoEntry[]>>((acc, v) => {
    if (!acc[v.folderTitle]) acc[v.folderTitle] = [];
    acc[v.folderTitle].push(v);
    return acc;
  }, {});
</script>

<Modal title="失效视频扫描结果" showFooter={false} on:close={() => onclose?.()}>
  <svelte:fragment slot="icon"><Archive size={18} /></svelte:fragment>

  <div class="result-content">
    <div class="summary">
      发现 <strong>{deadVideos.length}</strong> 个失效视频，分布在
      <strong>{Object.keys(byFolder).length}</strong> 个收藏夹中
    </div>

    <div class="folder-list">
      {#each Object.entries(byFolder) as [folderName, vids]}
        <div class="folder-group">
          <div class="folder-header">📁 {folderName} ({vids.length}个)</div>
          {#each vids.slice(0, 10) as v}
            <div class="video-item">• {v.title}</div>
          {/each}
          {#if vids.length > 10}
            <div class="more-hint">...及其他 {vids.length - 10} 个</div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="action-bar">
      <button class="btn btn-archive" onclick={() => onarchive?.()} disabled={processing}>
        <Archive size={14} />
        {processing ? '处理中...' : '移动到「失效视频归档」'}
      </button>
      <button class="btn btn-delete" onclick={() => ondelete?.()} disabled={processing}>
        <Trash2 size={14} />
        {processing ? '处理中...' : '直接删除'}
      </button>
      <span class="hint">移动到专用收藏夹便于日后查看；删除不可撤销</span>
    </div>
  </div>
</Modal>

<style>
  .result-content { padding: 16px 20px; }
  .summary { font-size: 13px; font-weight: bold; margin-bottom: 12px; }
  .summary strong { color: var(--ai-primary); }

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
  }
  .video-item {
    font-size: 11px;
    padding: 2px 0 2px 12px;
    border-bottom: 1px solid var(--ai-border-lighter);
    color: var(--ai-text-muted);
  }
  .more-hint {
    font-size: 10px;
    color: var(--ai-text-muted);
    padding: 2px 0 2px 12px;
  }

  .action-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-archive {
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent));
    color: #fff;
  }
  .btn-archive:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(var(--ai-primary-rgb), 0.3); }
  .btn-delete {
    background: var(--ai-error);
    color: #fff;
  }
  .btn-delete:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); }
  .hint {
    font-size: 10px;
    color: var(--ai-text-muted);
    line-height: 1.3;
  }
</style>
