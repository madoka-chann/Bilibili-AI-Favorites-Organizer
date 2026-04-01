<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$lib/stores/settings';
  import { SPEED_PRESETS, AI_CHUNK_PRESETS } from '$lib/utils/constants';
  import SettingsGroup from './SettingsGroup.svelte';
  import ProviderConfig from './ProviderConfig.svelte';
  import LiquidToggle from './LiquidToggle.svelte';
  import { focusGlow } from '$animations/micro';
  import { Cpu, SlidersHorizontal, ToggleRight, Sparkles } from 'lucide-svelte';
</script>

<div class="settings-panel">
  <!-- Group 1: AI 配置 -->
  <SettingsGroup title="AI 服务配置" icon={Cpu} iconColor="#7C5CFC" defaultOpen={true}>
    <ProviderConfig />
  </SettingsGroup>

  <!-- Group 2: 请求参数 -->
  <SettingsGroup title="请求参数" icon={SlidersHorizontal} iconColor="#6366f1">
    <div class="field-grid">
      <div class="bfao-field">
        <label class="bfao-label">AI 批次大小</label>
        <select
          class="bfao-select"
          value={$settings.aiChunkSize}
          onchange={(e) =>
            settings.update({ aiChunkSize: Number((e.target as HTMLSelectElement).value) })}
        >
          {#each AI_CHUNK_PRESETS as preset}
            <option value={preset.value}>{preset.label}</option>
          {/each}
          <option value="custom">自定义</option>
        </select>
      </div>

      <div class="bfao-field">
        <label class="bfao-label">请求速度</label>
        <select
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
        <label class="bfao-label">写操作间隔 (ms)</label>
        <input
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
        <label class="bfao-label">每次移动视频数</label>
        <input
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
            class="bfao-input bfao-input-small"
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
        <label class="bfao-label">批量休息间隔</label>
        <select
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
        <label class="bfao-label">休息时长 (分)</label>
        <select
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
        <span>跳过失效视频</span>
        <LiquidToggle checked={$settings.skipDeadVideos}
          onchange={(v) => settings.update({ skipDeadVideos: v })} />
      </div>

      <div class="toggle-row">
        <span>自适应限速</span>
        <LiquidToggle checked={$settings.adaptiveRate}
          onchange={(v) => settings.update({ adaptiveRate: v })} />
      </div>

      <div class="toggle-row">
        <span>完成后通知</span>
        <LiquidToggle checked={$settings.notifyOnComplete}
          onchange={(v) => settings.update({ notifyOnComplete: v })} />
      </div>

      <div class="toggle-row">
        <span>多收藏夹模式</span>
        <LiquidToggle checked={$settings.multiFolderEnabled}
          onchange={(v) => settings.update({ multiFolderEnabled: v })} />
      </div>

      <div class="toggle-row">
        <span>增量整理 (仅新增)</span>
        <LiquidToggle checked={$settings.incrementalMode}
          onchange={(v) => settings.update({ incrementalMode: v })} />
      </div>

      <div class="toggle-row">
        <span>后台自动缓存</span>
        <LiquidToggle checked={$settings.bgCacheEnabled}
          onchange={(v) => settings.update({ bgCacheEnabled: v })} />
      </div>

      {#if $settings.bgCacheEnabled}
        <div class="sub-field">
          <label class="bfao-label">缓存间隔 (分)</label>
          <select
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
      <LiquidToggle checked={$settings.animEnabled}
        onchange={(v) => settings.update({ animEnabled: v })} />
    </div>
  </SettingsGroup>
</div>

<style>
  .settings-panel {
    padding: 10px 15px 12px;
    background: var(--ai-bg-secondary);
    border-bottom: 1px solid var(--ai-border-light);
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
  }

  .sub-field {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 23px;
  }
</style>
