<script lang="ts">
  import { ChevronRight, LogOut } from 'lucide-svelte';
  import VideoItem from './VideoItem.svelte';
  import type { VideoResource } from '$types/index';
  import type { ClassifiedVideoEntry } from '$types/ai';

  interface Props {
    name: string;
    vids: ClassifiedVideoEntry[];
    videoMap: Map<number, VideoResource>;
    isExpanded: boolean;
    isSelected: boolean;
    isExisting: boolean;
    isMergeSource: boolean;
    mergeMode: boolean;
    /** Virtual scroll constants */
    virtualThreshold?: number;
    visibleRows?: number;
    rowHeight?: number;
    /** Virtual scroll range (if virtual) */
    visibleRange?: { start: number; end: number };
    ontoggleselect?: () => void;
    ontoggleexpand?: () => void;
    onmergeclick?: () => void;
    onremove?: () => void;
    onvirtualscroll?: (e: Event) => void;
    onlightbox?: (src: string) => void;
  }

  let {
    name, vids, videoMap,
    isExpanded, isSelected, isExisting, isMergeSource, mergeMode,
    virtualThreshold = 40, visibleRows = 6, rowHeight = 68,
    visibleRange,
    ontoggleselect, ontoggleexpand, onmergeclick, onremove,
    onvirtualscroll, onlightbox,
  }: Props = $props();

  let needsVirtual = $derived(vids.length > virtualThreshold);
  let avgConf = $derived(
    vids.some(v => v.conf != null)
      ? vids.reduce((s, v) => s + (v.conf ?? 1), 0) / vids.length
      : null
  );
</script>

<div class="category-group" class:merge-source={isMergeSource} data-category={name}>
  <div class="category-header">
    <input
      type="checkbox"
      checked={isSelected}
      onchange={() => ontoggleselect?.()}
    />
    <button class="expand-btn" class:expanded={isExpanded} onclick={() => ontoggleexpand?.()}>
      <ChevronRight size={14} />
    </button>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <span
      class="category-name"
      onclick={() => mergeMode ? onmergeclick?.() : ontoggleexpand?.()}
    >
      {name}
    </span>
    <span class="badge" class:badge-existing={isExisting} class:badge-new={!isExisting}>
      {isExisting ? '已有' : '新建'}
    </span>
    {#if avgConf !== null}
      <span class="conf-avg" class:low={avgConf < 0.6}>
        √{Math.round(avgConf * 100)}%
      </span>
    {/if}
    <span class="category-count">{vids.length} 个视频</span>
    <button class="remove-btn" title="从当前收藏夹移出该分类下所有视频" onclick={() => onremove?.()}>
      <LogOut size={12} />
      <span>移出</span>
    </button>
  </div>

  {#if isExpanded}
    {#if needsVirtual && visibleRange}
      <div
        class="video-list virtual-scroll"
        style:height="{visibleRows * rowHeight}px"
        onscroll={(e) => onvirtualscroll?.(e)}
      >
        <div class="virtual-spacer" style:height="{vids.length * rowHeight}px">
          {#each vids.slice(visibleRange.start, visibleRange.end) as vid, i (vid.id)}
            <VideoItem
              {vid}
              info={videoMap.get(vid.id)}
              virtual={true}
              top={(visibleRange.start + i) * rowHeight}
              {onlightbox}
            />
          {/each}
        </div>
      </div>
    {:else}
      <div class="video-list">
        {#each vids as vid (vid.id)}
          <VideoItem
            {vid}
            info={videoMap.get(vid.id)}
            {onlightbox}
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .category-group {
    border: 1.5px solid rgba(var(--ai-primary-rgb), 0.25);
    border-radius: 10px;
    overflow: hidden;
    background: var(--ai-bg);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .category-group:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--ai-primary-rgb), 0.45);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  .category-group.merge-source {
    border-color: var(--ai-primary);
    background: var(--ai-bg-tertiary);
    animation: mergeSourcePulse 2s ease-in-out infinite;
    box-shadow: none;
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    min-height: 44px;
    background: none;
    border: none;
    text-align: left;
    box-sizing: border-box;
  }
  .category-header:hover { background: var(--ai-bg-tertiary); }

  .category-header input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--ai-primary);
    cursor: pointer;
    flex-shrink: 0;
  }

  .expand-btn {
    display: flex;
    color: var(--ai-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
    transition: transform 0.25s ease, color 0.2s;
  }
  .expand-btn.expanded {
    transform: rotate(90deg);
    color: var(--ai-primary);
  }

  .category-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--ai-text);
    cursor: pointer;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 6px;
    font-weight: 600;
    flex-shrink: 0;
    animation: badgePop 0.35s cubic-bezier(0.2, 1.2, 0.4, 1) both;
  }
  .badge-existing {
    background: var(--ai-success-bg);
    color: var(--ai-success-dark);
  }
  .badge-new {
    background: var(--ai-error-bg, rgba(239, 68, 68, 0.1));
    color: var(--ai-error, #ef4444);
  }

  .conf-avg {
    font-size: 10px;
    font-weight: 600;
    color: var(--ai-success-dark);
    flex-shrink: 0;
  }
  .conf-avg.low { color: var(--ai-warning-dark); }

  .category-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    background: var(--ai-bg-secondary);
    padding: 2px 8px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .remove-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid var(--ai-border);
    background: var(--ai-bg-secondary);
    color: var(--ai-text-muted);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .remove-btn:hover {
    border-color: var(--ai-error, #ef4444);
    color: var(--ai-error, #ef4444);
    background: var(--ai-error-bg, rgba(239, 68, 68, 0.1));
    animation: removeShake 0.4s ease-in-out;
  }

  .video-list {
    padding: 0 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .video-list.virtual-scroll {
    overflow-y: auto;
    position: relative;
    display: block;
  }

  .virtual-spacer { position: relative; }

  @keyframes badgePop {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes mergeSourcePulse {
    0%, 100% { border-color: var(--ai-primary); box-shadow: 0 0 0 0 var(--ai-primary-shadow); }
    50% { border-color: var(--ai-gradient-accent); box-shadow: 0 0 0 4px var(--ai-primary-shadow); }
  }

  @keyframes removeShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-2px); }
    40% { transform: translateX(2px); }
    60% { transform: translateX(-1.5px); }
    80% { transform: translateX(1px); }
  }
</style>
