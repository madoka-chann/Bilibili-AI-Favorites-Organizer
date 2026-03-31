<script lang="ts">
  import Modal from './Modal.svelte';
  import { FolderOpen, CheckSquare, Square } from 'lucide-svelte';
  import type { FavFolder } from '$lib/types';

  export let folders: FavFolder[] = [];
  export let onconfirm: ((ids: number[]) => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;

  let selected = new Set<number>();

  function toggle(id: number) {
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    selected = selected; // trigger reactivity
  }

  function toggleAll() {
    if (selected.size === folders.length) {
      selected = new Set();
    } else {
      selected = new Set(folders.map(f => f.id));
    }
  }

  $: allSelected = selected.size === folders.length && folders.length > 0;
</script>

<Modal
  title="选择收藏夹"
  confirmText="确认选择 ({selected.size})"
  confirmDisabled={selected.size === 0}
  onclose={() => onclose?.()}
  onconfirm={() => onconfirm?.([...selected])}
>
  <svelte:fragment slot="icon"><FolderOpen size={18} /></svelte:fragment>

  <div class="selector-content">
    <div class="toolbar">
      <button class="toggle-all" onclick={toggleAll}>
        {#if allSelected}
          <CheckSquare size={14} /> 取消全选
        {:else}
          <Square size={14} /> 全选
        {/if}
      </button>
      <span class="count">共 {folders.length} 个收藏夹</span>
    </div>

    <div class="folder-list">
      {#each folders as folder (folder.id)}
        <label class="folder-item" class:selected={selected.has(folder.id)}>
          <input
            type="checkbox"
            checked={selected.has(folder.id)}
            onchange={() => toggle(folder.id)}
          />
          <div class="folder-info">
            <div class="folder-title">{folder.title}</div>
            <div class="folder-count">{folder.media_count} 个视频</div>
          </div>
        </label>
      {/each}
    </div>
  </div>
</Modal>

<style>
  .selector-content { padding: 12px 20px 16px; }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .toggle-all {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1.5px solid var(--ai-border);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--ai-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .toggle-all:hover {
    border-color: var(--ai-primary-light);
    background: var(--ai-bg-tertiary);
  }

  .count {
    font-size: 12px;
    color: var(--ai-text-muted);
  }

  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 340px;
    overflow-y: auto;
  }

  .folder-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--ai-bg);
  }
  .folder-item:hover { border-color: var(--ai-primary-light); }
  .folder-item.selected {
    border-color: var(--ai-primary);
    background: var(--ai-bg-tertiary);
  }

  .folder-item input[type="checkbox"] { margin: 0; }

  .folder-info { flex: 1; }
  .folder-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
  }
  .folder-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    margin-top: 2px;
  }
</style>
