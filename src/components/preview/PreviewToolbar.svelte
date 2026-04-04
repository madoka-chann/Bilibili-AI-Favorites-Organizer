<script lang="ts">
  import { Search, CheckSquare, Square, GitMerge } from 'lucide-svelte';

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
    />
  </div>

  <div class="filter-row">
    <button class="filter-btn" class:active={allSelected} onclick={() => ontoggleall?.()}>
      {#if allSelected}
        <CheckSquare size={12} />
      {:else}
        <Square size={12} />
      {/if}
      全选
    </button>
    <button class="filter-btn" class:active={activeFilter === 'existing'} onclick={() => onfilter?.('existing')}>
      仅已有
    </button>
    <button class="filter-btn" class:active={activeFilter === 'new'} onclick={() => onfilter?.('new')}>
      仅新建
    </button>
    <button class="filter-btn" class:active={activeFilter === 'low-conf'} onclick={() => onfilter?.('low-conf')}>
      低置信度
    </button>
    <button class="filter-btn" class:active={mergeMode} onclick={() => ontogglemerge?.()}>
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
  .preview-stats strong { color: var(--ai-primary); }

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

  @media (prefers-reduced-motion: reduce) {
    .filter-btn.active::after { animation: none; }
    .filter-count { animation: none; }
  }
</style>
