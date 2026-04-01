<script lang="ts">
  import Modal from './Modal.svelte';
  import { Eye, ChevronDown, ChevronRight } from 'lucide-svelte';
  import type { CategoryResult, VideoResource } from '$lib/types';

  export let categories: CategoryResult = {};
  export let videos: VideoResource[] = [];
  export let onconfirm: ((data: CategoryResult) => void) | undefined = undefined;
  export let onclose: (() => void) | undefined = undefined;

  // Build video lookup map
  $: videoMap = new Map(videos.map(v => [v.id, v]));

  // Sorted entries by video count descending
  $: entries = Object.entries(categories).sort((a, b) => b[1].length - a[1].length);

  $: totalVideos = entries.reduce((sum, [, vids]) => sum + vids.length, 0);

  // Track expanded categories
  let expanded = new Set<string>();

  function toggleExpand(name: string) {
    if (expanded.has(name)) {
      expanded.delete(name);
    } else {
      expanded.add(name);
    }
    expanded = expanded;
  }
</script>

<Modal
  title="分类预览"
  confirmText="确认执行"
  width="min(700px, 92vw)"
  onclose={() => onclose?.()}
  onconfirm={() => onconfirm?.(categories)}
>
  <svelte:fragment slot="icon"><Eye size={18} /></svelte:fragment>

  <div class="bfao-modal-body preview-content">
    <div class="bfao-modal-summary">
      共 <strong>{entries.length}</strong> 个分类，<strong>{totalVideos}</strong> 个视频
    </div>

    <div class="category-list">
      {#each entries as [name, vids] (name)}
        {@const isExpanded = expanded.has(name)}
        <div class="category-group">
          <button class="category-header" onclick={() => toggleExpand(name)}>
            <span class="expand-icon">
              {#if isExpanded}
                <ChevronDown size={14} />
              {:else}
                <ChevronRight size={14} />
              {/if}
            </span>
            <span class="category-name">{name}</span>
            <span class="category-count">{vids.length} 个视频</span>
          </button>

          {#if isExpanded}
            <div class="video-list">
              {#each vids as vid (vid.id)}
                {@const info = videoMap.get(vid.id)}
                <div class="video-item">
                  <span class="video-title" title={info?.title ?? `av${vid.id}`}>
                    {info?.title ?? `av${vid.id}`}
                  </span>
                  {#if vid.conf != null}
                    <span class="conf" class:low={vid.conf < 0.6}>
                      {Math.round(vid.conf * 100)}%
                    </span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</Modal>

<style>
  .preview-content { padding: 12px 20px 16px; }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 380px;
    overflow-y: auto;
  }

  .category-group {
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--ai-bg);
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s ease;
  }
  .category-header:hover { background: var(--ai-bg-tertiary); }

  .expand-icon {
    display: flex;
    color: var(--ai-text-muted);
  }

  .category-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
  }

  .category-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    background: var(--ai-bg-secondary);
    padding: 2px 8px;
    border-radius: 8px;
  }

  .video-list {
    padding: 0 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .video-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--ai-bg-secondary);
    font-size: 12px;
  }

  .video-title {
    flex: 1;
    color: var(--ai-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conf {
    font-size: 10px;
    font-weight: 600;
    color: var(--ai-success-dark);
    background: var(--ai-success-bg);
    padding: 1px 6px;
    border-radius: 6px;
    white-space: nowrap;
  }
  .conf.low {
    color: var(--ai-warning-dark);
    background: var(--ai-warning-bg);
  }
</style>
