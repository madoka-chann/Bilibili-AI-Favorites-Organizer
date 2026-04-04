<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { SPEED_PRESETS, AI_CHUNK_PRESETS } from '$utils/constants';
  import SettingsGroup from './SettingsGroup.svelte';
  import ProviderConfig from './ProviderConfig.svelte';
  import LiquidToggle from './LiquidToggle.svelte';
  import { focusGlow } from '$animations/micro';
  import { prefersReducedMotion } from '$stores/theme';
  import { Cpu, SlidersHorizontal, ToggleRight, Sparkles } from 'lucide-svelte';
</script>

<div class="settings-panel">
  <!-- Group 1: AI 配置 -->
  <SettingsGroup title="AI 服务配置" icon={Cpu} iconColor="#7C5CFC">
    <ProviderConfig />
  </SettingsGroup>

  <!-- Group 2: 请求参数 -->
  <SettingsGroup title="请求参数" icon={SlidersHorizontal} iconColor="#6366f1">
    <div class="field-grid">
      <div class="bfao-field">
        <label class="bfao-label" for="bfao-chunk-size">AI 批次大小</label>
        <input
          id="bfao-chunk-size"
          class="bfao-input"
          type="number"
          min="1"
          max="9999"
          list="bfao-chunk-presets"
          value={$settings.aiChunkSize}
          onchange={(e) => {
            const v = Math.max(1, Number((e.target as HTMLInputElement).value) || 50);
            settings.update({ aiChunkSize: v });
          }}
        />
        <datalist id="bfao-chunk-presets">
          {#each AI_CHUNK_PRESETS as preset}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </datalist>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-fetch-delay">请求速度</label>
        <select
          id="bfao-fetch-delay"
          class="bfao-select"
          value={$settings.fetchDelay}
          onchange={(e) =>
            settings.update({ fetchDelay: Number((e.target as HTMLSelectElement).value) })}
        >
          {#each SPEED_PRESETS as preset}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </select>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-write-delay">写操作间隔 (ms)</label>
        <input
          id="bfao-write-delay"
          class="bfao-input"
          type="number"
          min="500"
          max="10000"
          step="100"
          value={$settings.writeDelay}
          oninput={(e) =>
            settings.update({ writeDelay: Number((e.target as HTMLInputElement).value) || 2500 })}
          use:focusGlow
        />
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-move-chunk">每次移动视频数</label>
        <input
          id="bfao-move-chunk"
          class="bfao-input"
          type="number"
          min="1"
          max="100"
          value={$settings.moveChunkSize}
          oninput={(e) =>
            settings.update({ moveChunkSize: Number((e.target as HTMLInputElement).value) || 20 })}
          use:focusGlow
        />
      </div>

      <div class="bfao-field full">
        <label class="bfao-checkbox-label">
          <input
            type="checkbox"
            checked={$settings.limitEnabled}
            onchange={(e) =>
              settings.update({ limitEnabled: (e.target as HTMLInputElement).checked })}
          />
          <span>限制处理数量</span>
        </label>
        {#if $settings.limitEnabled}
          <input
            class="bfao-input bfao-input-small sub-field-slide"
            type="number"
            min="10"
            max="5000"
            value={$settings.limitCount}
            oninput={(e) =>
              settings.update({ limitCount: Number((e.target as HTMLInputElement).value) || 200 })}
            use:focusGlow
          />
        {/if}
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-rest-interval">批量休息间隔</label>
        <select
          id="bfao-rest-interval"
          class="bfao-select"
          value={$settings.batchRestInterval}
          onchange={(e) =>
            settings.update({ batchRestInterval: Number((e.target as HTMLSelectElement).value) })}
        >
          <option value={50}>50次</option>
          <option value={80}>80次</option>
          <option value={100}>100次</option>
          <option value={150}>150次</option>
          <option value={200}>200次</option>
          <option value={300}>300次</option>
        </select>
      </div>

      <div class="bfao-field">
        <label class="bfao-label" for="bfao-rest-minutes">休息时长 (分)</label>
        <select
          id="bfao-rest-minutes"
          class="bfao-select"
          value={$settings.batchRestMinutes}
          onchange={(e) =>
            settings.update({ batchRestMinutes: Number((e.target as HTMLSelectElement).value) })}
        >
          <option value={0.5}>0.5分钟</option>
          <option value={1}>1分钟</option>
          <option value={1.5}>1.5分钟</option>
          <option value={2}>2分钟</option>
          <option value={3}>3分钟</option>
          <option value={5}>5分钟</option>
        </select>
      </div>
    </div>
  </SettingsGroup>

  <!-- Group 3: 行为开关 -->
  <SettingsGroup title="行为设置" icon={ToggleRight} iconColor="#10b981">
    <div class="toggle-list">
      <div class="toggle-row">
        <span>自适应限速</span>
        <LiquidToggle label="自适应限速" checked={$settings.adaptiveRate}
          onchange={(v) => settings.update({ adaptiveRate: v })} />
      </div>

      <div class="toggle-row">
        <span>完成后通知</span>
        <LiquidToggle label="完成后通知" checked={$settings.notifyOnComplete}
          onchange={(v) => settings.update({ notifyOnComplete: v })} />
      </div>

      <div class="toggle-row">
        <span>增量整理 (仅新增)</span>
        <LiquidToggle label="增量整理" checked={$settings.incrementalMode}
          onchange={(v) => settings.update({ incrementalMode: v })} />
      </div>

      <div class="toggle-row">
        <span>后台自动缓存</span>
        <LiquidToggle label="后台自动缓存" checked={$settings.bgCacheEnabled}
          onchange={(v) => settings.update({ bgCacheEnabled: v })} />
      </div>

      {#if $settings.bgCacheEnabled}
        <div class="sub-field sub-field-slide">
          <label class="bfao-label" for="bfao-cache-interval">缓存间隔 (分)</label>
          <select
            id="bfao-cache-interval"
            class="bfao-select bfao-input-small"
            value={$settings.cacheScanInterval}
            onchange={(e) =>
              settings.update({ cacheScanInterval: Number((e.target as HTMLSelectElement).value) })}
          >
            <option value={5}>5</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>
      {/if}
    </div>
  </SettingsGroup>

  <!-- Group 4: 动画效果 -->
  <SettingsGroup title="动画效果" icon={Sparkles} iconColor="#f59e0b">
    <div class="toggle-row">
      <span>启用极致动画效果</span>
      <LiquidToggle label="启用极致动画效果" checked={$settings.animEnabled}
        onchange={(v) => settings.update({ animEnabled: v })} />
    </div>
    {#if $prefersReducedMotion}
      <div class="anim-hint hint-fade-in">
        系统已开启「减少动画」，动画被自动禁用。
      </div>
    {/if}
  </SettingsGroup>
</div>

<style>
  .settings-panel {
    padding: 10px 15px 12px;
    background: var(--ai-bg-secondary);
    border-bottom: 1px solid var(--ai-border-light);
  }

  /* Stagger entrance for each SettingsGroup when panel mounts */
  .settings-panel > :global(.group) {
    animation: groupSlideIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }
  .settings-panel > :global(.group:nth-child(1)) { animation-delay: 0s; }
  .settings-panel > :global(.group:nth-child(2)) { animation-delay: 0.06s; }
  .settings-panel > :global(.group:nth-child(3)) { animation-delay: 0.12s; }
  .settings-panel > :global(.group:nth-child(4)) { animation-delay: 0.18s; }

  @keyframes groupSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .full {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12.5px;
    color: var(--ai-text-secondary);
    transition: background 0.2s ease, transform 0.25s cubic-bezier(0.2, 0.98, 0.28, 1);
    border-radius: 6px;
    padding: 4px 6px;
    margin: -4px -6px;
  }

  .toggle-row > span:first-child {
    transition: color 0.2s ease;
  }

  .toggle-row:hover {
    background: var(--ai-bg-hover);
    transform: translateX(3px);
  }

  .toggle-row:hover > span:first-child {
    color: var(--ai-text);
  }

  .sub-field {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 23px;
  }

  .sub-field-slide {
    animation: subFieldSlideIn 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes subFieldSlideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hint-fade-in {
    animation: hintFadeIn 0.35s ease both;
  }

  @keyframes hintFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .anim-hint {
    font-size: 10px;
    line-height: 1.4;
    color: var(--ai-warning-dark);
    background: var(--ai-warning-bg);
    padding: 6px 10px;
    border-radius: 6px;
    margin-top: 4px;
  }
  .anim-hint.anim-success {
    color: var(--ai-success-dark);
    background: var(--ai-success-bg);
    border-left: 3px solid var(--ai-success);
  }
  .anim-hint.anim-disabled {
    color: var(--ai-text-muted);
    background: var(--ai-bg-tertiary);
    border-left: 3px solid var(--ai-border);
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle-row:hover { transform: none; }
    .sub-field-slide { animation: none; }
    .hint-fade-in { animation: none; }
    .settings-panel > :global(.group) { animation: none; }
  }
</style>
