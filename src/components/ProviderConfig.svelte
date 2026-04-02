<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { AI_PROVIDERS } from '$utils/constants';
  import { fetchModelList } from '$api/ai-client';
  import { logs } from '$stores/state';
  import { Eye, EyeOff, RefreshCw, ExternalLink, Zap } from 'lucide-svelte';
  import { getErrorMessage } from '$utils/errors';
  import { focusGlow, pressEffect } from '$animations/micro';
  import type { AIProviderId } from '$types/index';

  let showApiKey = $state(false);
  let modelLoading = $state(false);
  let modelList = $state<string[]>([]);
  let showModelDropdown = $state(false);

  let providerConfig = $derived(AI_PROVIDERS[$settings.provider]);
  let isCustomProvider = $derived(providerConfig?.isCustom ?? false);

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

  let testLoading = $state(false);
  async function handleTestConnectivity() {
    testLoading = true;
    try {
      const s = $settings;
      if (!s.apiKey) {
        logs.add('请先填写 API Key', 'warning');
        return;
      }
      // Use fetchModelList as a lightweight connectivity test
      await fetchModelList(s);
      logs.add('连通性测试成功 ✓', 'success');
    } catch (e: unknown) {
      logs.add(`连通性测试失败: ${getErrorMessage(e)}`, 'error');
    } finally {
      testLoading = false;
    }
  }
</script>

<div class="provider-config">
  <!-- 服务商选择 -->
  <div class="bfao-field">
    <label class="bfao-label" for="bfao-provider">AI 服务商</label>
    <div class="bfao-input-row">
      <select
        id="bfao-provider"
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
    <div class="bfao-field field-slide-in">
      <label class="bfao-label" for="bfao-custom-url">API 地址</label>
      <input
        id="bfao-custom-url"
        class="bfao-input"
        type="text"
        placeholder="https://your-api.com/v1"
        value={$settings.customBaseUrl}
        oninput={(e) =>
          settings.update({ customBaseUrl: (e.target as HTMLInputElement).value })}
        use:focusGlow
      />
    </div>
  {/if}

  <!-- API Key -->
  <div class="bfao-field">
    <label class="bfao-label" for="bfao-api-key">API Key</label>
    <div class="bfao-input-row">
      <input
        id="bfao-api-key"
        class="bfao-input bfao-input-flex"
        type={showApiKey ? 'text' : 'password'}
        placeholder={providerConfig?.keyPlaceholder ?? '填入 API Key'}
        value={$settings.apiKey}
        oninput={(e) =>
          settings.update({ apiKey: (e.target as HTMLInputElement).value })}
        use:focusGlow
      />
      <button
        class="bfao-icon-btn"
        onclick={() => (showApiKey = !showApiKey)}
        title={showApiKey ? '隐藏' : '显示'}
        use:pressEffect
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
    <label class="bfao-label" for="bfao-model">模型</label>
    <div class="bfao-input-row">
      <input
        id="bfao-model"
        class="bfao-input bfao-input-flex"
        type="text"
        placeholder="输入模型名称"
        value={$settings.modelName}
        oninput={(e) =>
          settings.update({ modelName: (e.target as HTMLInputElement).value })}
        use:focusGlow
      />
      <button
        class="bfao-icon-btn"
        onclick={handleFetchModels}
        disabled={modelLoading}
        title="获取模型列表"
        use:pressEffect
      >
        <RefreshCw size={14} class={modelLoading ? 'spinning' : ''} />
      </button>
      <button
        class="bfao-icon-btn"
        onclick={handleTestConnectivity}
        disabled={testLoading}
        title="测试连通性"
        use:pressEffect
      >
        <Zap size={14} class={testLoading ? 'spinning' : ''} />
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
    <label class="bfao-label" for="bfao-concurrency">AI 并发数</label>
    <input
      id="bfao-concurrency"
      class="bfao-input bfao-input-small"
      type="number"
      min="1"
      max="20"
      value={$settings.aiConcurrency}
      oninput={(e) =>
        settings.update({
          aiConcurrency: Number((e.target as HTMLInputElement).value) || 2,
        })}
      use:focusGlow
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
    box-shadow: 0 0 8px rgba(var(--ai-primary-rgb), 0.25);
  }

  /* Eye icon toggle transition */
  .bfao-icon-btn :global(svg) {
    transition: transform 0.2s cubic-bezier(0.2, 0.98, 0.28, 1);
  }

  .bfao-icon-btn:active :global(svg) {
    transform: scale(0.8);
  }

  /* :global() needed: .spinning is applied to Lucide SVG child component */
  .bfao-icon-btn :global(.spinning) {
    animation: spin 0.8s linear infinite;
    filter: drop-shadow(0 0 4px rgba(var(--ai-primary-rgb), 0.5));
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .field-slide-in {
    animation: fieldSlideDown 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes fieldSlideDown {
    from { opacity: 0; transform: translateY(-8px); max-height: 0; }
    to { opacity: 1; transform: translateY(0); max-height: 80px; }
  }

  .model-dropdown {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-bg);
    box-shadow: var(--ai-shadow-md);
    margin-top: 4px;
    animation: dropdownIn 0.2s cubic-bezier(0.2, 0.98, 0.28, 1) both;
    transform-origin: top center;
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 8%,
      black 92%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 8%,
      black 92%,
      transparent 100%
    );
    padding: 4px 0;
  }

  @keyframes dropdownIn {
    from { opacity: 0; transform: scaleY(0.92) scaleX(0.98); }
    to { opacity: 1; transform: scaleY(1) scaleX(1); }
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
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease;
    animation: modelItemSlideIn 0.2s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  .model-item:nth-child(1) { animation-delay: 0s; }
  .model-item:nth-child(2) { animation-delay: 0.03s; }
  .model-item:nth-child(3) { animation-delay: 0.06s; }
  .model-item:nth-child(4) { animation-delay: 0.09s; }
  .model-item:nth-child(5) { animation-delay: 0.12s; }
  .model-item:nth-child(n+6) { animation-delay: 0.15s; }

  @keyframes modelItemSlideIn {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .model-item:hover {
    background: var(--ai-bg-hover);
    transform: translateX(2px);
  }

  .model-item.active {
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--ai-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .bfao-icon-btn :global(svg) { transition: none; }
    .bfao-icon-btn :global(.spinning) { filter: none; }
  }
</style>
