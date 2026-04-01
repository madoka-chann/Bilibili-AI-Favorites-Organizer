<script lang="ts">
  import Modal from './Modal.svelte';
  import { Copy } from 'lucide-svelte';
  import { magnetic } from '$actions/magnetic';
  import type { DuplicateEntry } from '$core/duplicates';

  export let duplicates: DuplicateEntry[];
  export let ondedup: (() => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;
  export let processing = false;

  const showCount = Math.min(duplicates.length, 50);
</script>

<Modal title="重复视频扫描结果" showFooter={false} onclose={() => onclose?.()}>
  <svelte:fragment slot="icon"><Copy size={18} /></svelte:fragment>

  <div class="bfao-modal-body">
    <div class="bfao-modal-summary">
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
        <div class="bfao-modal-more">...及其他 {duplicates.length - 50} 个</div>
      {/if}
    </div>

    <div class="bfao-action-bar">
      <button class="bfao-btn bfao-btn-primary" onclick={() => ondedup?.()} disabled={processing} use:magnetic={{ radius: 40, strength: 0.25 }}>
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
</style>
