<script lang="ts">
  import Modal from './Modal.svelte';
  import { BarChart3, Heart } from 'lucide-svelte';
  import type { FavFolder } from '$lib/types';
  import { numberRoll } from '$animations/text';

  export let folders: FavFolder[];
  export let totalVideos: number;
  export let deadCount: number;
  export let mode: 'stats' | 'health' = 'stats';
  export let onclose: (() => void) | undefined = undefined;

  $: healthScore = totalVideos > 0
    ? Math.max(0, Math.round(100 - (deadCount / totalVideos) * 100))
    : 100;

  $: healthColor = healthScore >= 80 ? 'var(--ai-success)' : healthScore >= 60 ? 'var(--ai-warning)' : 'var(--ai-error)';
  $: deadRate = totalVideos > 0 ? ((deadCount / totalVideos) * 100).toFixed(1) : '0';

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
</script>

<Modal
  title={mode === 'health' ? '收藏夹健康检查' : '收藏夹统计'}
  showFooter={true}
  cancelText=""
  confirmText="关闭"
  onclose={() => onclose?.()}
  onconfirm={() => onclose?.()}
>
  <svelte:fragment slot="icon">
    {#if mode === 'health'}
      <Heart size={18} />
    {:else}
      <BarChart3 size={18} />
    {/if}
  </svelte:fragment>

  <div class="bfao-modal-body">
    {#if mode === 'health'}
      <div class="health-score" style:color={healthColor}>
        <div class="score-number" use:rollNumber={healthScore}>{healthScore}</div>
        <div class="score-label">健康评分</div>
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
      <div class="stat-card">
        <div class="stat-value" use:rollNumber={folders.length}>{folders.length}</div>
        <div class="stat-label">收藏夹</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" data-locale="true" use:rollNumber={totalVideos}>{totalVideos.toLocaleString()}</div>
        <div class="stat-label">视频总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" class:danger={deadCount > 0} use:rollNumber={deadCount}>{deadCount}</div>
        <div class="stat-label">失效视频</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{deadRate}%</div>
        <div class="stat-label">失效率</div>
      </div>
    </div>

    {#if folders.length > 0}
      <div class="folder-breakdown">
        <div class="section-title">收藏夹分布</div>
        {#each folders.slice(0, 15) as f}
          <div class="folder-row">
            <span class="folder-name">{f.title}</span>
            <span class="folder-count">{f.media_count} 个视频</span>
          </div>
        {/each}
        {#if folders.length > 15}
          <div class="bfao-modal-more">...及其他 {folders.length - 15} 个收藏夹</div>
        {/if}
      </div>
    {/if}
  </div>
</Modal>

<style>
  .health-score {
    text-align: center;
    padding: 16px 0 8px;
  }
  .score-number {
    font-size: 48px;
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
  }
  .stat-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--ai-primary);
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
    padding: 4px 0;
    border-bottom: 1px solid var(--ai-border-lighter);
    font-size: 11px;
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
</style>
