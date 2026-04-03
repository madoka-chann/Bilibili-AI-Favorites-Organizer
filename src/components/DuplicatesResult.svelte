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
  }

  .dup-item {
    font-size: 11px;
    padding: 5px 4px;
    border-bottom: 1px solid var(--ai-border-lighter);
    border-radius: 4px;
    transition: background 0.2s ease, padding-left 0.2s ease;
  }
  .dup-item:hover {
    background: var(--ai-bg-hover);
    padding-left: 8px;
  }
  .dup-title { color: var(--ai-text); }
  .dup-folders {
    color: var(--ai-text-muted);
    padding-left: 12px;
    font-size: 10px;
  }
</style>
