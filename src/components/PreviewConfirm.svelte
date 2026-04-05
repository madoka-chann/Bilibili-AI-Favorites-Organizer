<script lang="ts">
  import { tick } from 'svelte';
  import Modal from './Modal.svelte';
  import {
    Eye, Clipboard, Download, FileText, X,
  } from 'lucide-svelte';
  import { gsap, Flip, shouldAnimate } from '$animations/gsap-config';
  import { listStaggerReveal, pressEffect } from '$animations/micro';
  import { triggerDownload } from '$utils/download';
  import CategoryGroup from './preview/CategoryGroup.svelte';
  import PreviewToolbar from './preview/PreviewToolbar.svelte';
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

  // Lightbox
  let lightboxSrc = $state<string | null>(null);
  let lightboxClosing = $state(false);
  function openLightbox(src: string) { lightboxSrc = src; lightboxClosing = false; }
  function closeLightbox() {
    lightboxClosing = true;
    setTimeout(() => { lightboxSrc = null; lightboxClosing = false; }, 250);
  }

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
    const q = searchQuery.trim().toLowerCase();
    if (q) entries = entries.filter(([name]) => name.toLowerCase().includes(q));
    return entries;
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
    let matching: string[];
    switch (mode) {
      case 'existing': matching = allEntries.filter(([name]) => existingSet.has(name)).map(([n]) => n); break;
      case 'new': matching = allEntries.filter(([name]) => !existingSet.has(name)).map(([n]) => n); break;
      case 'low-conf': matching = allEntries.filter(([, vids]) => vids.some(v => v.conf != null && v.conf < 0.6)).map(([n]) => n); break;
      default: matching = allEntries.map(([n]) => n);
    }

    if (activeFilter === mode) {
      for (const name of matching) selectedCategories.delete(name);
      activeFilter = 'all';
    } else {
      selectedCategories = new Set(matching);
      activeFilter = mode;
    }
    selectedCategories = new Set(selectedCategories);
  }

  function toggleMergeMode() {
    mergeMode = !mergeMode;
    mergeSource = null;
  }

  function handleMergeClick(name: string) {
    if (!mergeMode) return;
    if (mergeSource === null) { mergeSource = name; return; }
    if (mergeSource === name) { mergeSource = null; return; }
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
    try { await navigator.clipboard.writeText(lines.join('\n')); } catch { /* noop */ }
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

    if (wasExpanded) {
      expanded.clear();
      delete scrollTops[name];
    } else {
      for (const prev of expanded) delete scrollTops[prev];
      expanded.clear();
      expanded.add(name);
    }
    expanded = new Set(expanded);

    await tick();

    if (!wasExpanded && categoryListEl) {
      const videoItems = categoryListEl.querySelectorAll(`[data-category="${CSS.escape(name)}"] .video-item`);
      if (videoItems.length > 0) {
        gsap.set(videoItems, { opacity: 0, x: 36, scale: 0.93 });
      }
    }

    if (!wasExpanded && categoryListEl) {
      const listEl = categoryListEl.querySelector(`[data-category="${CSS.escape(name)}"] .video-list`);
      if (listEl) {
        setTimeout(() => listStaggerReveal(listEl.querySelectorAll('.video-item')), 100);
      }
    }

    if (flipState) {
      Flip.from(flipState, {
        duration: 0.35,
        ease: 'power2.out',
        nested: true,
        onComplete: () => {},
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
  width="min(780px, 92vw)"
  onclose={() => onclose?.()}
>
  {#snippet icon()}<Eye size={18} />{/snippet}

  {#snippet toolbar()}
    <PreviewToolbar
      {selectedVideoCount}
      {totalVideos}
      totalCategories={allEntries.length}
      filteredCount={filteredEntries.length}
      allSelected={selectedCategories.size === allEntries.length}
      {activeFilter}
      {mergeMode}
      {searchQuery}
      onsearchchange={(q) => { searchQuery = q; }}
      ontoggleall={toggleSelectAll}
      onfilter={selectByFilter}
      ontogglemerge={toggleMergeMode}
    />
  {/snippet}

  <div class="preview-content">
    <div class="category-list" bind:this={categoryListEl}>
      {#each filteredEntries as [name, vids] (name)}
        <CategoryGroup
          {name}
          {vids}
          {videoMap}
          isExpanded={expanded.has(name)}
          isSelected={selectedCategories.has(name)}
          isExisting={existingSet.has(name)}
          isMergeSource={mergeMode && mergeSource === name}
          {mergeMode}
          virtualThreshold={VIRTUAL_THRESHOLD}
          visibleRows={VISIBLE_ROWS}
          rowHeight={ROW}
          visibleRange={getVisibleRange(name, vids.length)}
          ontoggleselect={() => toggleCategory(name)}
          ontoggleexpand={() => toggleExpand(name)}
          onmergeclick={() => handleMergeClick(name)}
          onremove={() => removeCategory(name)}
          onvirtualscroll={(e) => onVirtualScroll(name, e)}
          onlightbox={openLightbox}
        />
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
        <button class="icon-btn" data-tooltip="复制到剪贴板" title="复制到剪贴板" onclick={copyToClipboard} use:pressEffect>
          <Clipboard size={14} />
        </button>
        <button class="icon-btn" data-tooltip="下载 JSON" title="下载 JSON" onclick={downloadJSON} use:pressEffect>
          <Download size={14} />
        </button>
        <button class="icon-btn" data-tooltip="导出 Markdown" title="导出 Markdown" onclick={exportMarkdown} use:pressEffect>
          <FileText size={14} />
        </button>
        <button class="icon-btn" data-tooltip="取消" title="取消" onclick={() => onclose?.()} use:pressEffect>
          <X size={14} />
        </button>
      </div>
    </div>
  {/snippet}
</Modal>

{#if lightboxSrc}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lightbox-overlay" class:closing={lightboxClosing} onclick={closeLightbox} onkeydown={(e) => { if (e.key === 'Escape') closeLightbox(); }}>
    <img class="lightbox-img" src={lightboxSrc} alt="" />
  </div>
{/if}

<style>
  .lightbox-overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483645;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    backdrop-filter: blur(8px);
    animation: lightboxIn 0.25s ease both;
  }
  .lightbox-img {
    max-width: 90vw;
    max-height: 85vh;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: lightboxZoom 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  @keyframes lightboxIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lightboxZoom { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .lightbox-overlay.closing { animation: lightboxOut 0.25s ease both; }
  .lightbox-overlay.closing .lightbox-img { animation: lightboxZoomOut 0.25s ease both; }
  @keyframes lightboxOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes lightboxZoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }

  .preview-content { padding: 8px 20px 12px; }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }

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
    position: relative;
    overflow: hidden;
  }
  .footer-custom .modal-btn.confirm::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, var(--ai-shimmer-color) 50%, transparent 60%);
    transform: translateX(-100%);
    animation: confirmShimmer 3s ease-in-out 1s infinite;
    pointer-events: none;
  }
  @keyframes confirmShimmer {
    0%, 75% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
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
  .footer-custom .modal-btn.confirm:disabled::after {
    animation: none;
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
    position: relative;
    animation: iconBtnSlideIn 0.3s cubic-bezier(0.22, 1.42, 0.29, 1) backwards;
  }
  .icon-btn:nth-child(1) { animation-delay: 0.05s; }
  .icon-btn:nth-child(2) { animation-delay: 0.1s; }
  .icon-btn:nth-child(3) { animation-delay: 0.15s; }
  .icon-btn:nth-child(4) { animation-delay: 0.2s; }
  @keyframes iconBtnSlideIn {
    from { opacity: 0; transform: translateY(6px) scale(0.8); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .icon-btn:hover {
    background: var(--ai-bg-tertiary);
    color: var(--ai-text);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .icon-btn::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--ai-text);
    color: var(--ai-bg);
    font-size: 10px;
    white-space: nowrap;
    padding: 3px 8px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .icon-btn:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .bfao-modal-empty {
    animation: emptyFloat 3s ease-in-out infinite, emptyBreathe 4s ease-in-out infinite;
  }

  @keyframes emptyFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes emptyBreathe {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-custom .modal-btn.confirm::after { animation: none; }
    .icon-btn { animation: none; opacity: 1; }
  }
</style>
