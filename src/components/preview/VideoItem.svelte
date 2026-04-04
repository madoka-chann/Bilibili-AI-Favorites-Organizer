<script lang="ts">
  import { thumbPreview } from '$actions/thumb-preview';
  import { formatDuration } from '$utils/dom';
  import type { VideoResource } from '$types/index';
  import type { ClassifiedVideoEntry } from '$types/ai';

  interface Props {
    vid: ClassifiedVideoEntry;
    info?: VideoResource;
    virtual?: boolean;
    top?: number;
    staggerIndex?: number;
    onlightbox?: (src: string) => void;
  }

  let { vid, info, virtual = false, top = 0, staggerIndex, onlightbox }: Props = $props();
</script>

<div
  class="video-item"
  class:virtual-item={virtual}
  class:stagger-reveal={staggerIndex != null}
  style:top={virtual ? `${top}px` : undefined}
  style:animation-delay={staggerIndex != null ? `${staggerIndex * 0.04}s` : undefined}
  onanimationend={(e) => { if (e.animationName === 'itemReveal') e.currentTarget.classList.remove('stagger-reveal'); }}
>
  <div class="video-thumb-wrap" use:thumbPreview>
    {#if info?.cover}
      <img class="video-thumb" src={info.cover} alt="" loading="lazy" onclick={(e) => { e.stopPropagation(); if (info?.cover) onlightbox?.(info.cover); }} />
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

<style>
  .video-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--ai-bg-secondary);
    font-size: 12px;
    height: 60px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .video-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: var(--ai-bg-tertiary);
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
    cursor: zoom-in;
    transition: filter 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1);
  }
  .video-thumb-wrap:hover .video-thumb {
    filter: brightness(1.1);
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

  /* Stagger reveal for first N items when category expands */
  .video-item.stagger-reveal {
    animation: itemReveal 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes confLowPulse {
    0%, 100% { opacity: 1; box-shadow: none; }
    50% { opacity: 0.8; box-shadow: 0 0 0 2px var(--ai-warning-bg); }
  }

  @keyframes itemReveal {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .video-item { transition: none; }
    .video-thumb { transition: filter 0.15s; }
    .video-item.stagger-reveal { animation: none; }
    .conf.low { animation: none; }
  }
</style>
