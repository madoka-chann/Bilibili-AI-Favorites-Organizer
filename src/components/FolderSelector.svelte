<script lang="ts">
  import Modal from './Modal.svelte';
  import { FolderOpen, CheckSquare, Square } from 'lucide-svelte';
  import { magnetic } from '$actions/magnetic';
  import { contentStagger, checkBounce } from '$animations/micro';
  import type { FavFolder } from '$types/index';

  interface Props {
    folders?: FavFolder[];
    onconfirm?: (ids: number[]) => void;
    onclose?: () => void;
  }

  let { folders = [], onconfirm, onclose }: Props = $props();

  let selected = $state(new Set<number>());

  function toggle(id: number) {
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    selected = new Set(selected);
  }

  function toggleAll() {
    if (selected.size === folders.length) {
      selected = new Set();
    } else {
      selected = new Set(folders.map(f => f.id));
    }
  }

  let allSelected = $derived(selected.size === folders.length && folders.length > 0);
</script>

<Modal
  title="选择收藏夹"
  confirmText="确认选择 ({selected.size})"
  confirmDisabled={selected.size === 0}
  onclose={() => onclose?.()}
  onconfirm={() => onconfirm?.([...selected])}
>
  {#snippet icon()}<FolderOpen size={18} />{/snippet}

  <div class="selector-content">
    <div class="toolbar">
      <button class="toggle-all" onclick={toggleAll} use:magnetic={{ radius: 80, strength: 0.45 }}>
        {#if allSelected}
          <CheckSquare size={14} /> 取消全选
        {:else}
          <Square size={14} /> 全选
        {/if}
      </button>
      <span class="count">共 {folders.length} 个收藏夹</span>
    </div>

    <div class="folder-list" use:contentStagger={{ stagger: 0.025, delay: 0.15 }}>
      {#each folders as folder (folder.id)}
        <label class="bfao-selectable-item" class:selected={selected.has(folder.id)}>
          <input
            type="checkbox"
            checked={selected.has(folder.id)}
            onchange={() => toggle(folder.id)}
            use:checkBounce
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

  .folder-info { flex: 1; }

  :global(.bfao-selectable-item) {
    transition: transform 0.2s cubic-bezier(0.2, 1.04, 0.42, 1), box-shadow 0.2s ease !important;
  }
  :global(.bfao-selectable-item:hover:not(.selected)) {
    box-shadow: inset 0 0 0 1px rgba(var(--ai-primary-rgb), 0.15),
                0 0 8px rgba(var(--ai-primary-rgb), 0.08);
  }
  :global(.bfao-selectable-item.selected) {
    transform: translateX(2px);
    box-shadow: inset 3px 0 0 var(--ai-primary);
  }
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
