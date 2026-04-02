<script lang="ts">
  import { tick } from 'svelte';
  import Modal from './Modal.svelte';
  import {
    Eye, ChevronRight, Search,
    CheckSquare, Square, Clipboard, Download, FileText, X,
    GitMerge, LogOut,
  } from 'lucide-svelte';
  import { tilt } from '$actions/tilt';
  import { Flip, EASINGS, shouldAnimate } from '$animations/gsap-config';
  import { listStaggerReveal, hoverScale, pressEffect } from '$animations/micro';
  import { formatDuration } from '$utils/dom';
  import { triggerDownload } from '$utils/download';
  import type { CategoryResult, VideoResource } from '$types/index';

  interface Props {
    categories?: CategoryResult;
    videos?: VideoResource[];
    existingFolderNames?: string[];
    onconfirm?: (data: CategoryResult) => void;
    onclose?: () => void;
  }

  let { categories = {}, videos = [], existingFolderNames = [], onconfirm, onclose }: Props = $props();

  // Build video lookup map
  let videoMap = $derived(new Map(videos.map(v => [v.id, v])));
  let existingSet = $derived(new Set(existingFolderNames));

  // Mutable local copy of categories (deep clone)
  let localCategories = $state<CategoryResult>(
    Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, [...v]]))
  );

  // Selection state — all selected by default
  let selectedCategories = $state(new Set<string>(Object.keys(categories)));

  // Search & filter
  let searchQuery = $state('');
  type FilterMode = 'all' | 'existing' | 'new' | 'low-conf';
  let activeFilter = $state<FilterMode>('all');

  // Merge mode
  let mergeMode = $state(false);
  let mergeSource = $state<string | null>(null);

  // Expand/collapse
  let expanded = $state(new Set<string>());
  let categoryListEl = $state<HTMLElement>(undefined!);

  // Virtual scrolling
  const ITEM_H = 64;
  const GAP = 4;
  const ROW = ITEM_H + GAP;
  const VIRTUAL_THRESHOLD = 40;
  const VISIBLE_ROWS = 6;
  const OVERSCAN = 3;
  let scrollTops = $state<Record<string, number>>({});

  // --- Derived ---

  let allEntries = $derived(
    Object.entries(localCategories).sort((a, b) => b[1].length - a[1].length)
  );

  let filteredEntries = $derived((() => {
    let entries = allEntries;
    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) entries = entries.filter(([name]) => name.toLowerCase().includes(q));
    // Mode filter
    switch (activeFilter) {
      case 'existing': return entries.filter(([name]) => existingSet.has(name));
      case 'new': return entries.filter(([name]) => !existingSet.has(name));
      case 'low-conf': return entries.filter(([, vids]) => vids.some(v => v.conf != null && v.conf < 0.6));
      default: return entries;
    }
  })());

  let totalVideos = $derived(allEntries.reduce((sum, [, vids]) => sum + vids.length, 0));
  let selectedVideoCount = $derived(
    allEntries.filter(([name]) => selectedCategories.has(name))
      .reduce((sum, [, vids]) => sum + vids.length, 0)
  );

  // --- Actions ---

  function toggleCategory(name: string) {
    if (selectedCategories.has(name)) selectedCategories.delete(name);
    else selectedCategories.add(name);
    selectedCategories = new Set(selectedCategories);
  }

  function toggleSelectAll() {
    if (selectedCategories.size === allEntries.length) {
      selectedCategories = new Set();
    } else {
      selectedCategories = new Set(allEntries.map(([name]) => name));
    }
  }

  function selectByFilter(mode: FilterMode) {
    if (activeFilter === mode) {
      // Toggle off — restore all
      activeFilter = 'all';
      selectedCategories = new Set(allEntries.map(([name]) => name));
      return;
    }
    activeFilter = mode;
    // Select only matching
    const matching = filteredEntries.map(([name]) => name);
    selectedCategories = new Set(matching);
  }

  function toggleMergeMode() {
    mergeMode = !mergeMode;
    mergeSource = null;
  }

  function handleMergeClick(name: string) {
    if (!mergeMode) return;
    if (mergeSource === null) {
      mergeSource = name;
      return;
    }
    if (mergeSource === name) {
      mergeSource = null;
      return;
    }
    // Merge source into target
    const sourceVids = localCategories[mergeSource] ?? [];
    if (!localCategories[name]) localCategories[name] = [];
    localCategories[name] = [...localCategories[name], ...sourceVids];
    delete localCategories[mergeSource];
    selectedCategories.delete(mergeSource);
    selectedCategories = new Set(selectedCategories);
    mergeSource = null;
    localCategories = { ...localCategories };
  }

  function removeCategory(name: string) {
    delete localCategories[name];
    selectedCategories.delete(name);
    expanded.delete(name);
    selectedCategories = new Set(selectedCategories);
    expanded = new Set(expanded);
    localCategories = { ...localCategories };
  }

  function handleConfirm() {
    const result: CategoryResult = {};
    for (const [name, vids] of Object.entries(localCategories)) {
      if (selectedCategories.has(name)) result[name] = vids;
    }
    onconfirm?.(result);
  }

  // --- Export ---

  async function copyToClipboard() {
    const lines: string[] = [];
    for (const [name, vids] of Object.entries(localCategories)) {
      if (!selectedCategories.has(name)) continue;
      const badge = existingSet.has(name) ? '[已有]' : '[新建]';
      lines.push(`${badge} ${name} (${vids.length} 个视频)`);
      for (const vid of vids) {
        const info = videoMap.get(vid.id);
        const conf = vid.conf != null ? ` [${Math.round(vid.conf * 100)}%]` : '';
        lines.push(`  - ${info?.title ?? `av${vid.id}`}${conf}`);
      }
      lines.push('');
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      // fallback: noop
    }
  }

  function downloadJSON() {
    const data = Object.fromEntries(
      Object.entries(localCategories).filter(([name]) => selectedCategories.has(name))
    );
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `bfao-categories-${Date.now()}.json`);
  }

  function exportMarkdown() {
    const lines: string[] = ['# 分类结果\n'];
    for (const [name, vids] of Object.entries(localCategories)) {
      if (!selectedCategories.has(name)) continue;
      const badge = existingSet.has(name) ? '已有' : '新建';
      lines.push(`## ${name} (${badge}, ${vids.length} 个视频)\n`);
      for (const vid of vids) {
        const info = videoMap.get(vid.id);
        const conf = vid.conf != null ? ` (${Math.round(vid.conf * 100)}%)` : '';
        lines.push(`- ${info?.title ?? `av${vid.id}`}${conf}`);
      }
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    triggerDownload(blob, `bfao-categories-${Date.now()}.md`);
  }

  // --- Virtual scroll ---

  function onVirtualScroll(name: string, e: Event) {
    const el = e.currentTarget as HTMLElement;
    scrollTops[name] = el.scrollTop;
  }

  function getVisibleRange(name: string, total: number): { start: number; end: number } {
    const st = scrollTops[name] ?? 0;
    const start = Math.max(0, Math.floor(st / ROW) - OVERSCAN);
    const end = Math.min(total, start + VISIBLE_ROWS + OVERSCAN * 2);
    return { start, end };
  }

  // --- Expand/collapse ---

  async function toggleExpand(name: string) {
    const wasExpanded = expanded.has(name);
    const useFlip = shouldAnimate() && categoryListEl;
    const flipState = useFlip ? Flip.getState(categoryListEl.querySelectorAll('.category-group')) : null;

    // 手风琴：一次只展开一个
    if (wasExpanded) {
      expanded.clear();
      delete scrollTops[name];
    } else {
      // 收起其他，清理 scrollTops
      for (const prev of expanded) delete scrollTops[prev];
      expanded.clear();
      expanded.add(name);
    }
    expanded = new Set(expanded);

    await tick();

    if (flipState) {
      Flip.from(flipState, {
        duration: 0.4,
        ease: EASINGS.velvetSpring,
        nested: true,
        onComplete: () => {
          if (!wasExpanded && categoryListEl) {
            const listEl = categoryListEl.querySelector(`[data-category="${CSS.escape(name)}"] .video-list`);
            if (listEl) listStaggerReveal(listEl.querySelectorAll('.video-item'));
          }
        },
      });
    } else if (!wasExpanded && categoryListEl) {
      const listEl = categoryListEl.querySelector(`[data-category="${CSS.escape(name)}"] .video-list`);
      if (listEl) listStaggerReveal(listEl.querySelectorAll('.video-item'));
    }
  }
</script>

<Modal
  title="分类预览"
  showFooter={true}
  width="min(720px, 92vw)"
  onclose={() => onclose?.()}
>
  {#snippet icon()}<Eye size={18} />{/snippet}

  {#snippet toolbar()}
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
          bind:value={searchQuery}
        />
      </div>

      <div class="filter-row">
        <button class="filter-btn" class:active={selectedCategories.size === allEntries.length} onclick={toggleSelectAll}>
          {#if selectedCategories.size === allEntries.length}
            <CheckSquare size={12} />
          {:else}
            <Square size={12} />
          {/if}
          全选
        </button>
        <button class="filter-btn" class:active={activeFilter === 'existing'} onclick={() => selectByFilter('existing')}>
          仅已有
        </button>
        <button class="filter-btn" class:active={activeFilter === 'new'} onclick={() => selectByFilter('new')}>
          仅新建
        </button>
        <button class="filter-btn" class:active={activeFilter === 'low-conf'} onclick={() => selectByFilter('low-conf')}>
          低置信度
        </button>
        <button class="filter-btn" class:active={mergeMode} onclick={toggleMergeMode}>
          <GitMerge size={12} />
          合并分类
        </button>
      </div>

      <div class="filter-count">{filteredEntries.length} 个分类</div>
    </div>
  {/snippet}

  <div class="preview-content">
    <div class="category-list" bind:this={categoryListEl}>
      {#each filteredEntries as [name, vids] (name)}
        {@const isExpanded = expanded.has(name)}
        {@const isSelected = selectedCategories.has(name)}
        {@const isExisting = existingSet.has(name)}
        {@const needsVirtual = vids.length > VIRTUAL_THRESHOLD}
        {@const isMergeSource = mergeMode && mergeSource === name}
        <div class="category-group" class:merge-source={isMergeSource} data-category={name}>
          <div class="category-header">
            <input
              type="checkbox"
              checked={isSelected}
              onchange={() => toggleCategory(name)}
            />
            <button class="expand-btn" class:expanded={isExpanded} onclick={() => toggleExpand(name)}>
              <ChevronRight size={14} />
            </button>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span
              class="category-name"
              onclick={() => mergeMode ? handleMergeClick(name) : toggleExpand(name)}
            >
              {name}
            </span>
            <span class="badge" class:badge-existing={isExisting} class:badge-new={!isExisting}>
              {isExisting ? '已有' : '新建'}
            </span>
            {#if vids.some(v => v.conf != null)}
              {@const avgConf = vids.reduce((s, v) => s + (v.conf ?? 1), 0) / vids.length}
              <span class="conf-avg" class:low={avgConf < 0.6}>
                √{Math.round(avgConf * 100)}%
              </span>
            {/if}
            <span class="category-count">{vids.length} 个视频</span>
            <button class="remove-btn" title="从当前收藏夹移出该分类下所有视频" onclick={() => removeCategory(name)}>
              <LogOut size={12} />
              <span>移出</span>
            </button>
          </div>

          {#if isExpanded}
            {#if needsVirtual}
              {@const range = getVisibleRange(name, vids.length)}
              <div
                class="video-list virtual-scroll"
                style:height="{VISIBLE_ROWS * ROW}px"
                onscroll={(e) => onVirtualScroll(name, e)}
              >
                <div class="virtual-spacer" style:height="{vids.length * ROW}px">
                  {#each vids.slice(range.start, range.end) as vid, i (vid.id)}
                    {@const info = videoMap.get(vid.id)}
                    <div
                      class="video-item virtual-item"
                      style:top="{(range.start + i) * ROW}px"
                      use:tilt={{ maxDeg: 2, perspective: 600, scale: 1 }}
                      use:hoverScale={{ scale: 1.02, duration: 0.3 }}
                    >
                      <div class="video-thumb-wrap">
                        {#if info?.cover}
                          <img class="video-thumb" src={info.cover} alt="" loading="lazy" />
                        {:else}
                          <div class="video-thumb-placeholder"></div>
                        {/if}
                        {#if info?.duration}
                          <span class="video-duration">{formatDuration(info.duration)}</span>
                        {/if}
                      </div>
                      <div class="video-info">
                        <span class="video-title" title={info?.title ?? `av${vid.id}`}>
                          {info?.title ?? `av${vid.id}`}
                        </span>
                        {#if info?.upper?.name}
                          <span class="video-uploader">{info.upper.name}</span>
                        {/if}
                      </div>
                      {#if vid.conf != null}
                        <span class="conf" class:low={vid.conf < 0.6}>
                          {Math.round(vid.conf * 100)}%
                        </span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="video-list">
                {#each vids as vid (vid.id)}
                  {@const info = videoMap.get(vid.id)}
                  <div class="video-item" use:tilt={{ maxDeg: 2, perspective: 600, scale: 1 }} use:hoverScale={{ scale: 1.02, duration: 0.3 }}>
                    <div class="video-thumb-wrap">
                      {#if info?.cover}
                        <img class="video-thumb" src={info.cover} alt="" loading="lazy" />
                      {:else}
                        <div class="video-thumb-placeholder"></div>
                      {/if}
                      {#if info?.duration}
                        <span class="video-duration">{formatDuration(info.duration)}</span>
                      {/if}
                    </div>
                    <div class="video-info">
                      <span class="video-title" title={info?.title ?? `av${vid.id}`}>
                        {info?.title ?? `av${vid.id}`}
                      </span>
                      {#if info?.upper?.name}
                        <span class="video-uploader">{info.upper.name}</span>
                      {/if}
                    </div>
                    {#if vid.conf != null}
                      <span class="conf" class:low={vid.conf < 0.6}>
                        {Math.round(vid.conf * 100)}%
                      </span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/each}

      {#if filteredEntries.length === 0}
        <div class="bfao-modal-empty">无匹配分类</div>
      {/if}
    </div>
  </div>

  {#snippet footer()}
    <div class="footer-custom">
      <button
        class="modal-btn confirm"
        disabled={selectedCategories.size === 0}
        onclick={handleConfirm}
        use:pressEffect
      >
        执行已勾选 ({selectedCategories.size} 个)
      </button>
      <div class="footer-icons">
        <button class="icon-btn" title="复制到剪贴板" onclick={copyToClipboard} use:pressEffect>
          <Clipboard size={14} />
        </button>
        <button class="icon-btn" title="下载 JSON" onclick={downloadJSON} use:pressEffect>
          <Download size={14} />
        </button>
        <button class="icon-btn" title="导出 Markdown" onclick={exportMarkdown} use:pressEffect>
          <FileText size={14} />
        </button>
        <button class="icon-btn" title="取消" onclick={() => onclose?.()} use:pressEffect>
          <X size={14} />
        </button>
      </div>
    </div>
  {/snippet}
</Modal>

<style>
  /* --- Toolbar --- */
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
  }
  .filter-btn.active {
    background: linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent));
    color: #fff;
    border-color: transparent;
    transform: scale(1.05);
    box-shadow: 0 2px 8px var(--ai-primary-shadow);
  }

  .filter-count {
    font-size: 11px;
    color: var(--ai-text-muted);
  }

  /* --- Content --- */
  .preview-content { padding: 8px 20px 12px; }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 50vh;
    overflow-y: auto;
  }

  .category-group {
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--ai-bg);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .category-group:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  .category-group.merge-source {
    border-color: var(--ai-primary);
    background: var(--ai-bg-tertiary);
    animation: mergeSourcePulse 2s ease-in-out infinite;
    box-shadow: none; /* managed by animation */
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
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

  /* --- Video list --- */
  .video-list {
    padding: 0 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 320px;
    overflow-y: auto;
  }

  .video-list.virtual-scroll {
    overflow-y: auto;
    position: relative;
    display: block;
  }

  .virtual-spacer { position: relative; }

  .video-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--ai-bg-secondary);
    font-size: 12px;
    height: 60px;
  }

  .video-item.virtual-item {
    position: absolute;
    left: 0;
    right: 0;
  }

  .video-thumb-wrap {
    position: relative;
    width: 80px;
    height: 45px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
    background: var(--ai-bg-tertiary);
  }

  .video-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  .video-thumb-wrap:hover .video-thumb {
    transform: scale(1.05);
  }

  .video-thumb-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--ai-bg-tertiary), var(--ai-border-lighter));
  }

  .video-duration {
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 1px 4px;
    border-radius: 3px;
    line-height: 1.2;
  }

  .video-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .video-title {
    color: var(--ai-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
  }

  .video-uploader {
    font-size: 11px;
    color: var(--ai-text-muted);
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
    flex-shrink: 0;
  }
  .conf.low {
    color: var(--ai-warning-dark);
    background: var(--ai-warning-bg);
    animation: confLowPulse 2s ease-in-out infinite;
  }

  /* --- Footer --- */
  .footer-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 12px;
  }

  .footer-custom .modal-btn.confirm {
    flex: 1;
    padding: 11px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    background: linear-gradient(135deg, var(--ai-success-dark), var(--ai-success), var(--ai-success-light));
    color: #fff;
    transition: all 0.35s cubic-bezier(0.2, 1.04, 0.42, 1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .footer-custom .modal-btn.confirm:hover {
    transform: translateY(-2px) scale(1.015);
    box-shadow: 0 10px 28px var(--ai-success-bg), 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
  .footer-custom .modal-btn.confirm:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .footer-icons {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: var(--ai-border-lighter);
    color: var(--ai-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  .icon-btn:hover {
    background: var(--ai-bg-tertiary);
    color: var(--ai-text);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* --- Keyframe Animations --- */
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

  @keyframes confLowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.65; }
  }

  @keyframes emptyFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  .bfao-modal-empty {
    animation: emptyFloat 3s ease-in-out infinite;
  }
</style>
