<script lang="ts">
  import { Search, CheckSquare, Square, GitMerge } from 'lucide-svelte';
  import { pressEffect, focusGlow } from '$animations/micro';

  type FilterMode = 'all' | 'existing' | 'new' | 'low-conf';

  interface Props {
    selectedVideoCount: number;
    totalVideos: number;
    totalCategories: number;
    filteredCount: number;
    allSelected: boolean;
    activeFilter: FilterMode;
    mergeMode: boolean;
    searchQuery: string;
    onsearchchange?: (query: string) => void;
    ontoggleall?: () => void;
    onfilter?: (mode: FilterMode) => void;
    ontogglemerge?: () => void;
  }

  let {
    selectedVideoCount, totalVideos, totalCategories, filteredCount,
    allSelected, activeFilter, mergeMode, searchQuery,
    onsearchchange, ontoggleall, onfilter, ontogglemerge,
  }: Props = $props();
</script>

<div class="preview-toolbar">
  <div class="preview-stats">
    已选 <strong>{selectedVideoCount}</strong> / {totalVideos} 个视频
  </div>

  <div class="search-wrap">
    <Search size={14} class="search-icon" />
    <input
      type="text"
      class="search-input"
      placeholder="搜索分类名..."
      value={searchQuery}
      oninput={(e) => onsearchchange?.(e.currentTarget.value)}
      use:focusGlow
    />
  </div>

  <div class="filter-row">
    <button class="filter-btn" class:active={allSelected} onclick={() => ontoggleall?.()} use:pressEffect>
      {#if allSelected}
        <CheckSquare size={12} />
      {:else}
        <Square size={12} />
      {/if}
      全选
    </button>
    <button class="filter-btn" class:active={activeFilter === 'existing'} onclick={() => onfilter?.('existing')} use:pressEffect>
      仅已有
    </button>
    <button class="filter-btn" class:active={activeFilter === 'new'} onclick={() => onfilter?.('new')} use:pressEffect>
      仅新建
    </button>
    <button class="filter-btn" class:active={activeFilter === 'low-conf'} onclick={() => onfilter?.('low-conf')} use:pressEffect>
      低置信度
    </button>
    <button class="filter-btn merge-btn" class:active={mergeMode} onclick={() => ontogglemerge?.()} use:pressEffect>
      <GitMerge size={12} />
      合并分类
    </button>
  </div>

  <div class="filter-count">{filteredCount} 个分类</div>
</div>

<style>
  .preview-toolbar {
    padding: 10px 20px 12px;
    border-bottom: 1px solid var(--ai-border-light);
  }

  .preview-stats {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .preview-stats strong {
    color: var(--ai-primary);
    display: inline-block;
    transition: transform 0.25s cubic-bezier(0.2, 1.04, 0.42, 1), color 0.2s;
  }

  .search-wrap {
    position: relative;
    margin-bottom: 8px;
  }

  .search-wrap :global(.search-icon) {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ai-text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 7px 10px 7px 30px;
    border-radius: 8px;
    border: 1.5px solid var(--ai-border);
    background: var(--ai-bg-secondary);
    color: var(--ai-text);
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.3s cubic-bezier(0.2, 1, 0.4, 1);
  }
  .search-input:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px var(--ai-primary-shadow);
  }

  .filter-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .filter-row .filter-btn {
    animation: filterSlideIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  .filter-row .filter-btn:nth-child(1) { animation-delay: 0s; }
  .filter-row .filter-btn:nth-child(2) { animation-delay: 0.04s; }
  .filter-row .filter-btn:nth-child(3) { animation-delay: 0.08s; }
  .filter-row .filter-btn:nth-child(4) { animation-delay: 0.12s; }
  .filter-row .filter-btn:nth-child(5) { animation-delay: 0.16s; }

  .filter-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 6px;
    border: 1.5px solid var(--ai-border);
    background: var(--ai-border-lighter);
    color: var(--ai-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: all 0.25s cubic-bezier(0.2, 1, 0.4, 1);
  }
  .filter-btn:hover {
    border-color: var(--ai-primary-light);
    transform: translateY(-1px);
    box-shadow: inset 0 0 0 1px rgba(var(--ai-primary-rgb), 0.15), 0 2px 6px rgba(0, 0, 0, 0.06);
  }
  .filter-btn.active {
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent));
    color: #fff;
    border-color: transparent;
    transform: scale(1.05);
    box-shadow: 0 2px 8px var(--ai-primary-shadow);
    position: relative;
    animation: filterActivate 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
  }

  /* Merge button icon rotation when active */
  .merge-btn.active :global(svg) {
    transform: rotate(180deg);
    transition: transform 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
  }
  .merge-btn :global(svg) {
    transition: transform 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
  }
  .filter-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 15%;
    width: 70%;
    height: 2px;
    background: #fff;
    border-radius: 1px;
    animation: tabUnderline 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  /* Search icon highlight when input has value */
  .search-wrap :global(.search-icon) {
    transition: color 0.25s ease, opacity 0.25s ease;
  }
  .search-wrap:has(.search-input:not(:placeholder-shown)) :global(.search-icon) {
    color: var(--ai-primary);
    opacity: 1;
  }

  .filter-count {
    font-size: 11px;
    color: var(--ai-text-muted);
    animation: countPop 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both;
  }

  @keyframes tabUnderline {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  @keyframes countPop {
    0% { transform: scale(0.8); opacity: 0; }
    70% { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes filterActivate {
    0% { box-shadow: 0 0 0 0 rgba(var(--ai-primary-rgb), 0.4); }
    50% { box-shadow: 0 0 0 6px rgba(var(--ai-primary-rgb), 0.1); }
    100% { box-shadow: 0 2px 8px var(--ai-primary-shadow); }
  }

  @keyframes filterSlideIn {
    from { opacity: 0; transform: translateY(6px) scale(0.92); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .filter-btn.active::after { animation: none; }
    .filter-btn.active { animation: none; }
    .filter-count { animation: none; }
    .filter-row .filter-btn { animation: none; }
  }
</style>
