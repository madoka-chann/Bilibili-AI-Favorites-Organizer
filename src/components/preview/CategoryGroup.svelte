<script lang="ts">
  import { ChevronRight, LogOut } from 'lucide-svelte';
  import VideoItem from './VideoItem.svelte';
  import { checkBounce } from '$animations/micro';
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

  /** Height transition for expand/collapse */
  function slideAction(node: HTMLDivElement) {
    // Skip animation if reduced motion is preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const h = node.scrollHeight;
    node.style.maxHeight = '0px';
    node.style.overflow = 'hidden';
    node.style.transition = 'max-height 0.35s cubic-bezier(0.2, 0.98, 0.28, 1), opacity 0.3s ease';
    node.style.opacity = '0';
    requestAnimationFrame(() => {
      node.style.maxHeight = h + 'px';
      node.style.opacity = '1';
    });
    // Clean up inline styles after transition so CSS takes over
    const cleanup = () => {
      node.style.maxHeight = '';
      node.style.overflow = '';
      node.style.transition = '';
      node.style.opacity = '';
    };
    node.addEventListener('transitionend', cleanup, { once: true });

    return {
      destroy() {
        node.removeEventListener('transitionend', cleanup);
      }
    };
  }
</script>

<div class="category-group" class:merge-source={isMergeSource} data-category={name}>
  <div class="category-header">
    <input
      type="checkbox"
      checked={isSelected}
      onchange={() => ontoggleselect?.()}
      use:checkBounce
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
      <div class="video-list-wrap" use:slideAction>
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
      </div>
    {:else}
      <div class="video-list-wrap" use:slideAction>
        <div class="video-list">
          {#each vids as vid, i (vid.id)}
            <VideoItem
              {vid}
              info={videoMap.get(vid.id)}
              {onlightbox}
              staggerIndex={i < 5 ? i : undefined}
            />
          {/each}
        </div>
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
    box-shadow: 0 4px 16px rgba(var(--ai-primary-rgb), 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
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
    border-radius: 4px;
    transition: transform 0.25s ease, color 0.2s, box-shadow 0.25s ease;
  }
  .expand-btn:hover {
    box-shadow: 0 0 0 3px rgba(var(--ai-primary-rgb), 0.12);
  }
  .expand-btn.expanded {
    transform: rotate(90deg);
    color: var(--ai-primary);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s, box-shadow 0.25s ease;
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
    transition: color 0.25s ease;
  }
  .category-header:hover .category-name {
    color: var(--ai-primary);
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
    position: relative;
    overflow: hidden;
  }
  .badge-new::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, var(--ai-shimmer-color) 50%, transparent 100%);
    animation: badgeShimmer 3s ease-in-out 0.5s infinite;
    pointer-events: none;
  }

  .conf-avg {
    font-size: 10px;
    font-weight: 600;
    color: var(--ai-success-dark);
    flex-shrink: 0;
  }
  .conf-avg.low {
    color: var(--ai-warning-dark);
    animation: confAvgPulse 2s ease-in-out infinite;
  }

  .category-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    background: var(--ai-bg-secondary);
    padding: 2px 8px;
    border-radius: 8px;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.2, 1.04, 0.42, 1), background 0.25s ease, color 0.25s ease;
  }
  .category-header:hover .category-count {
    transform: scale(1.05);
    background: rgba(var(--ai-primary-rgb), 0.1);
    color: var(--ai-primary);
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
  .remove-btn :global(svg) {
    transition: transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1);
  }
  .remove-btn:hover :global(svg) {
    transform: rotate(-90deg);
  }
  .remove-btn:hover {
    border-color: var(--ai-error, #ef4444);
    color: var(--ai-error, #ef4444);
    background: var(--ai-error-bg, rgba(239, 68, 68, 0.1));
    box-shadow: var(--ai-glow-danger);
    animation: removeShake 0.4s ease-in-out;
  }

  .video-list {
    padding: 0 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 408px;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
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

  @keyframes confAvgPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes badgeShimmer {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .category-group { transition: none; }
    .expand-btn { transition: none; }
    .expand-btn.expanded { transition: none; }
    .conf-avg.low { animation: none; }
    .badge-new::after { animation: none; display: none; }
    .remove-btn :global(svg) { transition: none; }
    .remove-btn:hover :global(svg) { transform: none; }
  }
</style>
