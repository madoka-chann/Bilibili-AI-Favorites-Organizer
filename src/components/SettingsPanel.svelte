<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import { SPEED_PRESETS, AI_CHUNK_PRESETS } from '$lib/utils/constants';
  import SettingsGroup from './SettingsGroup.svelte';
  import ProviderConfig from './ProviderConfig.svelte';
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
      <div class="field">
        <label class="label">AI 批次大小</label>
        <select
          class="select"
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

      <div class="field">
        <label class="label">请求速度</label>
        <select
          class="select"
          value={$settings.fetchDelay}
          onchange={(e) =>
            settings.update({ fetchDelay: Number((e.target as HTMLSelectElement).value) })}
        >
          {#each SPEED_PRESETS as preset}
            <option value={preset.value}>{preset.label}</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label class="label">写操作间隔 (ms)</label>
        <input
          class="input"
          type="number"
          min="500"
          max="10000"
          step="100"
          value={$settings.writeDelay}
          oninput={(e) =>
            settings.update({ writeDelay: Number((e.target as HTMLInputElement).value) || 2500 })}
        />
      </div>

      <div class="field">
        <label class="label">每次移动视频数</label>
        <input
          class="input"
          type="number"
          min="1"
          max="100"
          value={$settings.moveChunkSize}
          oninput={(e) =>
            settings.update({ moveChunkSize: Number((e.target as HTMLInputElement).value) || 20 })}
        />
      </div>

      <div class="field full">
        <label class="checkbox-label">
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
            class="input small"
            type="number"
            min="10"
            max="5000"
            value={$settings.limitCount}
            oninput={(e) =>
              settings.update({ limitCount: Number((e.target as HTMLInputElement).value) || 200 })}
          />
        {/if}
      </div>

      <div class="field">
        <label class="label">批量休息间隔</label>
        <select
          class="select"
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

      <div class="field">
        <label class="label">休息时长 (分)</label>
        <select
          class="select"
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
      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.skipDeadVideos}
          onchange={(e) => settings.update({ skipDeadVideos: (e.target as HTMLInputElement).checked })} />
        <span>跳过失效视频</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.adaptiveRate}
          onchange={(e) => settings.update({ adaptiveRate: (e.target as HTMLInputElement).checked })} />
        <span>自适应限速</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.notifyOnComplete}
          onchange={(e) => settings.update({ notifyOnComplete: (e.target as HTMLInputElement).checked })} />
        <span>完成后通知</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.multiFolderEnabled}
          onchange={(e) => settings.update({ multiFolderEnabled: (e.target as HTMLInputElement).checked })} />
        <span>多收藏夹模式</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.incrementalMode}
          onchange={(e) => settings.update({ incrementalMode: (e.target as HTMLInputElement).checked })} />
        <span>增量整理 (仅新增)</span>
      </label>

      <label class="checkbox-label">
        <input type="checkbox" checked={$settings.bgCacheEnabled}
          onchange={(e) => settings.update({ bgCacheEnabled: (e.target as HTMLInputElement).checked })} />
        <span>后台自动缓存</span>
      </label>

      {#if $settings.bgCacheEnabled}
        <div class="sub-field">
          <label class="label">缓存间隔 (分)</label>
          <select
            class="select small"
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
    <label class="checkbox-label">
      <input type="checkbox" checked={$settings.animEnabled}
        onchange={(e) => settings.update({ animEnabled: (e.target as HTMLInputElement).checked })} />
      <span>启用极致动画效果</span>
    </label>
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

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field.full {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-size: 12px;
    color: var(--ai-text-secondary);
    font-weight: 500;
  }

  .input,
  .select {
    padding: 7px 10px;
    border: 1.5px solid var(--ai-border);
    border-radius: 8px;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
    background: var(--ai-input-bg);
    color: var(--ai-text);
    transition: all 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
    width: 100%;
  }

  .input:focus,
  .select:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px rgba(115, 100, 255, 0.12);
  }

  .small {
    width: 80px;
  }

  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--ai-text-secondary);
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input[type='checkbox'] {
    accent-color: var(--ai-primary);
    width: 15px;
    height: 15px;
    cursor: pointer;
  }

  .sub-field {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 23px;
  }
</style>
