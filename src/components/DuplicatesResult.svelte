<script lang="ts">
  import Modal from './Modal.svelte';
  import { Copy } from 'lucide-svelte';
  import type { DuplicateEntry } from '$lib/core/duplicates';

  export let duplicates: DuplicateEntry[];
  export let ondedup: (() => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
  export let processing = false;

  const showCount = Math.min(duplicates.length, 50);
</script>

<Modal title="重复视频扫描结果" showFooter={false} onclose={() => onclose?.()}>
  <svelte:fragment slot="icon"><Copy size={18} /></svelte:fragment>

  <div class="result-content">
    <div class="summary">
      发现 <strong>{duplicates.length}</strong> 个重复视频
    </div>

    <div class="dup-list">
      {#each duplicates.slice(0, showCount) as d}
        <div class="dup-item">
          <div class="dup-title">• {d.title}</div>
          <div class="dup-folders">出现在：{d.folders.join('、')}</div>
        </div>
      {/each}
      {#if duplicates.length > 50}
        <div class="more-hint">...及其他 {duplicates.length - 50} 个</div>
      {/if}
    </div>

    <div class="action-bar">
      <button class="btn btn-dedup" onclick={() => ondedup?.()} disabled={processing}>
        {processing ? '正在去重...' : '一键去重'}
      </button>
      <span class="hint">保留首次出现的收藏夹，从其他收藏夹删除副本</span>
    </div>
  </div>
</Modal>

<style>
  .result-content { padding: 16px 20px; }
  .summary { font-size: 13px; font-weight: bold; margin-bottom: 12px; }
  .summary strong { color: var(--ai-primary); }

  .dup-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 14px;
  }

  .dup-item {
    font-size: 11px;
    padding: 5px 0;
    border-bottom: 1px solid var(--ai-border-lighter);
  }
  .dup-title { color: var(--ai-text); }
  .dup-folders {
    color: var(--ai-text-muted);
    padding-left: 12px;
    font-size: 10px;
  }
  .more-hint {
    font-size: 10px;
    color: var(--ai-text-muted);
    padding: 4px 0;
  }

  .action-bar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .btn-dedup {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent));
    color: #fff;
    transition: all 0.2s ease;
  }
  .btn-dedup:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(var(--ai-primary-rgb), 0.3); }
  .btn-dedup:disabled { opacity: 0.5; cursor: not-allowed; }
  .hint {
    font-size: 10px;
    color: var(--ai-text-muted);
    line-height: 1.3;
  }
</style>
