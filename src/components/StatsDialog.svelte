<script lang="ts">
  import Modal from './Modal.svelte';
  import { BarChart3, Heart } from 'lucide-svelte';
  import type { FavFolder } from '$types/index';
  import { numberRoll } from '$animations/text';
  import { contentStagger } from '$animations/micro';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';
  import { tilt } from '$actions/tilt';

  interface Props {
    folders: FavFolder[];
    totalVideos: number;
    deadCount: number;
    mode?: 'stats' | 'health';
    onclose?: () => void;
  }

  let { folders, totalVideos, deadCount, mode = 'stats', onclose }: Props = $props();

  let healthScore = $derived(totalVideos > 0
    ? Math.max(0, Math.round(100 - (deadCount / totalVideos) * 100))
    : 100);

  let healthColor = $derived(healthScore >= 80 ? 'var(--ai-success)' : healthScore >= 60 ? 'var(--ai-warning)' : 'var(--ai-error)');
  let deadRate = $derived(totalVideos > 0 ? ((deadCount / totalVideos) * 100).toFixed(1) : '0');

  /** H2: 数字翻滚 action */
  function rollNumber(node: HTMLElement, value: number) {
    const suffix = node.dataset.suffix;
    const useLocale = node.dataset.locale === 'true';
    const { destroy } = numberRoll(node, value, {
      duration: 800,
      suffix,
      useLocale,
    });
    return { destroy };
  }

  /** 健康分数环形进度动画 */
  function healthRing(node: SVGCircleElement, score: number) {
    const circumference = 2 * Math.PI * 54;
    const target = circumference * (1 - score / 100);
    node.style.strokeDasharray = `${circumference}`;
    node.style.strokeDashoffset = `${circumference}`;
    if (shouldAnimate()) {
      gsap.to(node, {
        strokeDashoffset: target,
        duration: 1.2,
        delay: 0.3,
        ease: EASINGS.velvetSpring,
      });
    } else {
      node.style.strokeDashoffset = `${target}`;
    }
    return { destroy() {} };
  }
</script>

<Modal
  title={mode === 'health' ? '收藏夹健康检查' : '收藏夹统计'}
  showFooter={true}
  cancelText=""
  confirmText="关闭"
  onclose={() => onclose?.()}
  onconfirm={() => onclose?.()}
>
  {#snippet icon()}
    {#if mode === 'health'}
      <Heart size={18} />
    {:else}
      <BarChart3 size={18} />
    {/if}
  {/snippet}

  <div class="bfao-modal-body" use:contentStagger={{ delay: 0.1, stagger: 0.06 }}>
    {#if mode === 'health'}
      <div class="health-score" style:color={healthColor}>
        <svg class="health-ring" viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--ai-border-lighter)" stroke-width="7" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={healthColor} stroke-width="7"
            stroke-linecap="round" transform="rotate(-90 60 60)"
            use:healthRing={healthScore} />
        </svg>
        <div class="score-overlay">
          <div class="score-number" use:rollNumber={healthScore}>{healthScore}</div>
          <div class="score-label">健康评分</div>
        </div>
      </div>
      <div class="health-detail">
        {#if healthScore >= 80}
          收藏夹状态良好！
        {:else if healthScore >= 60}
          收藏夹有一些失效视频需要清理
        {:else}
          收藏夹有较多失效视频，建议及时清理
        {/if}
      </div>
    {/if}

    <div class="stats-grid">
      <div class="stat-card" use:tilt={{ maxDeg: 4, scale: 1.03 }}>
        <div class="stat-value" use:rollNumber={folders.length}>{folders.length}</div>
        <div class="stat-label">收藏夹</div>
      </div>
      <div class="stat-card" use:tilt={{ maxDeg: 4, scale: 1.03 }}>
        <div class="stat-value" data-locale="true" use:rollNumber={totalVideos}>{totalVideos.toLocaleString()}</div>
        <div class="stat-label">视频总数</div>
      </div>
      <div class="stat-card" use:tilt={{ maxDeg: 4, scale: 1.03 }}>
        <div class="stat-value" class:danger={deadCount > 0} use:rollNumber={deadCount}>{deadCount}</div>
        <div class="stat-label">失效视频</div>
      </div>
      <div class="stat-card" use:tilt={{ maxDeg: 4, scale: 1.03 }}>
        <div class="stat-value">{deadRate}%</div>
        <div class="stat-label">失效率</div>
      </div>
    </div>

    {#if folders.length > 0}
      <div class="folder-breakdown" use:contentStagger={{ delay: 0.25, stagger: 0.03 }}>
        <div class="section-title">收藏夹分布</div>
        {#each folders as f}
          <div class="folder-row">
            <span class="folder-name">{f.title}</span>
            <span class="folder-count">{f.media_count} 个视频</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</Modal>

<style>
  .health-score {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 0 8px;
  }
  .health-ring { display: block; margin: 0 auto; }
  .score-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 16px;
  }
  .score-number {
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
  }
  .score-label {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 4px;
  }
  .health-detail {
    text-align: center;
    font-size: 13px;
    color: var(--ai-text-secondary);
    margin-bottom: 16px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 12px;
    background: var(--ai-bg-tertiary);
    border-radius: 12px;
    text-align: center;
    border: 1px solid var(--ai-border-lighter);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .stat-card:hover {
    border-color: var(--ai-primary-light);
    box-shadow: 0 0 12px rgba(var(--ai-primary-rgb), 0.15);
  }
  .stat-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--ai-primary);
    transition: filter 0.25s ease;
  }
  .stat-card:hover .stat-value {
    filter: brightness(1.2);
  }
  .stat-value.danger { color: var(--ai-error); }
  .stat-label {
    font-size: 11px;
    color: var(--ai-text-muted);
    margin-top: 2px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text-secondary);
    margin-bottom: 8px;
  }

  .folder-breakdown {
    max-height: 200px;
    overflow-y: auto;
  }
  .folder-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 4px;
    border-bottom: 1px solid var(--ai-border-lighter);
    font-size: 11px;
    border-radius: 4px;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .folder-row:hover {
    background: var(--ai-bg-hover);
    transform: translateX(2px);
  }
  .folder-name {
    color: var(--ai-text);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 8px;
  }
  .folder-count {
    color: var(--ai-text-muted);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .stat-card { transition: none; }
    .stat-value { transition: none; }
    .folder-row { transition: none; }
    .folder-row:hover { transform: none; }
  }
</style>
