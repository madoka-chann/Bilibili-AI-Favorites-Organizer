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

  // Count badge bounce effect on selection change
  let countEl = $state<HTMLSpanElement>(undefined!);
  let prevSize = 0;
  $effect(() => {
    const size = selected.size;
    if (countEl && size !== prevSize) {
      countEl.classList.remove('bounce');
      // Force reflow to restart animation
      void countEl.offsetWidth;
      countEl.classList.add('bounce');
      prevSize = size;
    }
  });
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
      <span class="count" class:has-selected={selected.size > 0} bind:this={countEl}>
        {#if selected.size > 0}
          已选 {selected.size} / {folders.length}
        {:else}
          共 {folders.length} 个收藏夹
        {/if}
      </span>
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
    position: relative;
    overflow: visible;
  }
  .toggle-all:hover {
    border-color: var(--ai-primary-light);
    background: var(--ai-bg-tertiary);
  }
  /* Bottom light bar on hover */
  .toggle-all::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 1.5px;
    background: var(--ai-divider-gradient);
    border-radius: 1px;
    transform: scaleX(0);
    transition: transform 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    pointer-events: none;
  }
  .toggle-all:hover::before {
    transform: scaleX(1);
  }

  .toggle-all::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 8px;
    box-shadow: 0 0 0 0 var(--ai-pulse-spread-color);
    opacity: 0;
    pointer-events: none;
  }
  .toggle-all:active {
    transform: scale(0.95);
    box-shadow: 0 0 0 3px rgba(var(--ai-primary-rgb), 0.15);
  }
  .toggle-all:active::after {
    animation: togglePulse 0.5s ease-out;
  }
  .toggle-all :global(svg) {
    transition: transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1);
  }
  .toggle-all:active :global(svg) {
    transform: rotate(15deg);
  }

  .count {
    font-size: 12px;
    color: var(--ai-text-muted);
    display: inline-block;
    animation: countPop 0.4s cubic-bezier(0.22, 1.42, 0.29, 1) 0.2s both;
    transition: color 0.25s ease;
  }
  .count.has-selected {
    color: var(--ai-primary);
    font-weight: 600;
  }
  .count.bounce {
    animation: countBounce 0.3s cubic-bezier(0.22, 1.42, 0.29, 1);
  }

  @keyframes countPop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes countBounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.15); }
    100% { transform: scale(1); }
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
    position: relative;
  }
  /* Selected light arc on right side */
  :global(.bfao-selectable-item.selected)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 2px;
    background: linear-gradient(to bottom, transparent, var(--ai-primary-light), transparent);
    border-radius: 1px;
    animation: selectedArc 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes selectedArc {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 0.7; }
  }
  .folder-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
    transition: color 0.2s ease, font-weight 0.2s ease, letter-spacing 0.25s ease;
  }
  :global(.bfao-selectable-item:hover) .folder-title {
    letter-spacing: 0.03em;
  }
  :global(.bfao-selectable-item.selected) .folder-title {
    color: var(--ai-primary);
    font-weight: 700;
  }
  .folder-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    margin-top: 2px;
    transition: color 0.2s ease;
  }
  :global(.bfao-selectable-item:hover) .folder-count {
    color: var(--ai-primary-light);
  }

  @keyframes togglePulse {
    0% { box-shadow: 0 0 0 0 var(--ai-pulse-spread-color); opacity: 0.6; }
    100% { box-shadow: 0 0 0 10px var(--ai-pulse-spread-color); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle-all:active::after { animation: none; }
    .toggle-all::before { transition: none; display: none; }
    .folder-title { transition: none; }
    :global(.bfao-selectable-item:hover) .folder-title { letter-spacing: normal; }
    :global(.bfao-selectable-item.selected)::after { animation: none; display: none; }
    .folder-count { transition: none; }
    .count { transition: none; }
    .count.bounce { animation: none; }
  }
</style>
