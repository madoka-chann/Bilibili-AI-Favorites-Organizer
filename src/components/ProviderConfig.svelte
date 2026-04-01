<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$lib/stores/settings';
  import { AI_PROVIDERS } from '$lib/utils/constants';
  import { fetchModelList } from '$lib/api/ai-client';
  import { logs } from '$lib/stores/state';
  import { Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-svelte';
  import { getErrorMessage } from '$lib/utils/errors';
  import type { AIProviderId } from '$lib/types';

  let showApiKey = false;
  let modelLoading = false;
  let modelList: string[] = [];
  let showModelDropdown = false;

  $: providerConfig = AI_PROVIDERS[$settings.provider];
  $: isCustomProvider = providerConfig?.isCustom ?? false;

  function handleProviderChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as AIProviderId;
    const config = AI_PROVIDERS[value];
    settings.update({
      provider: value,
      modelName: config?.defaultModel ?? '',
      apiKey: '', // 会从 per-provider 存储中恢复
    });
    // 重新加载该 provider 的 apiKey
    settings.reload();
  }

  async function handleFetchModels() {
    modelLoading = true;
    try {
      const s = $settings;
      modelList = await fetchModelList(s);
      showModelDropdown = true;
      logs.add(`获取到 ${modelList.length} 个模型`, 'success');
    } catch (e: unknown) {
      logs.add(`获取模型列表失败: ${getErrorMessage(e)}`, 'error');
    } finally {
      modelLoading = false;
    }
  }

  function selectModel(model: string) {
    settings.update({ modelName: model });
    showModelDropdown = false;
  }
</script>

<div class="provider-config">
  <!-- 服务商选择 -->
  <div class="bfao-field">
    <label class="bfao-label">AI 服务商</label>
    <div class="bfao-input-row">
      <select
        class="bfao-select"
        value={$settings.provider}
        onchange={handleProviderChange}
      >
        {#each Object.entries(AI_PROVIDERS) as [key, config]}
          <option value={key}>{config.name}</option>
        {/each}
      </select>
      {#if providerConfig?.apiUrl}
        <a
          href={providerConfig.apiUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="link-btn"
          title="申请 API Key"
        >
          <ExternalLink size={14} />
        </a>
      {/if}
    </div>
  </div>

  <!-- 自定义 URL (仅自定义 provider) -->
  {#if isCustomProvider}
    <div class="bfao-field">
      <label class="bfao-label">API 地址</label>
      <input
        class="bfao-input"
        type="text"
        placeholder="https://your-api.com/v1"
        value={$settings.customBaseUrl}
        oninput={(e) =>
          settings.update({ customBaseUrl: (e.target as HTMLInputElement).value })}
      />
    </div>
  {/if}

  <!-- API Key -->
  <div class="bfao-field">
    <label class="bfao-label">API Key</label>
    <div class="bfao-input-row">
      <input
        class="bfao-input bfao-input-flex"
        type={showApiKey ? 'text' : 'password'}
        placeholder={providerConfig?.keyPlaceholder ?? '填入 API Key'}
        value={$settings.apiKey}
        oninput={(e) =>
          settings.update({ apiKey: (e.target as HTMLInputElement).value })}
      />
      <button
        class="bfao-icon-btn"
        onclick={() => (showApiKey = !showApiKey)}
        title={showApiKey ? '隐藏' : '显示'}
      >
        {#if showApiKey}
          <EyeOff size={14} />
        {:else}
          <Eye size={14} />
        {/if}
      </button>
    </div>
  </div>

  <!-- 模型选择 -->
  <div class="bfao-field">
    <label class="bfao-label">模型</label>
    <div class="bfao-input-row">
      <input
        class="bfao-input bfao-input-flex"
        type="text"
        placeholder="输入模型名称"
        value={$settings.modelName}
        oninput={(e) =>
          settings.update({ modelName: (e.target as HTMLInputElement).value })}
      />
      <button
        class="bfao-icon-btn"
        onclick={handleFetchModels}
        disabled={modelLoading}
        title="获取模型列表"
      >
        <RefreshCw size={14} class={modelLoading ? 'spinning' : ''} />
      </button>
    </div>

    {#if showModelDropdown && modelList.length > 0}
      <div class="model-dropdown">
        {#each modelList as model}
          <button
            class="model-item"
            class:active={model === $settings.modelName}
            onclick={() => selectModel(model)}
          >
            {model}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- 并发数 -->
  <div class="bfao-field">
    <label class="bfao-label">AI 并发数</label>
    <input
      class="bfao-input bfao-input-small"
      type="number"
      min="1"
      max="20"
      value={$settings.aiConcurrency}
      oninput={(e) =>
        settings.update({
          aiConcurrency: Number((e.target as HTMLInputElement).value) || 2,
        })}
    />
  </div>
</div>

<style>
  .provider-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .link-btn {
    padding: 6px;
    border: 1.5px solid var(--ai-border);
    border-radius: 8px;
    background: var(--ai-bg);
    color: var(--ai-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    text-decoration: none;
    flex-shrink: 0;
  }

  .link-btn:hover {
    border-color: var(--ai-primary);
    color: var(--ai-primary);
  }

  :global(.spinning) {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .model-dropdown {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-bg);
    box-shadow: var(--ai-shadow-md);
    margin-top: 4px;
  }

  .model-item {
    display: block;
    width: 100%;
    padding: 7px 12px;
    font-size: 12px;
    text-align: left;
    border: none;
    background: transparent;
    color: var(--ai-text);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .model-item:hover {
    background: var(--ai-bg-hover);
  }

  .model-item.active {
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
    font-weight: 600;
  }
</style>
