<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { AI_PROVIDERS } from '$utils/constants';
  import { Eye, EyeOff, ExternalLink } from 'lucide-svelte';
  import { focusGlow, pressEffect } from '$animations/micro';
  import ModelSelector from './ModelSelector.svelte';
  import type { AIProviderId } from '$types/index';

  let showApiKey = $state(false);

  let providerConfig = $derived(AI_PROVIDERS[$settings.provider]);
  let isCustomProvider = $derived(providerConfig?.isCustom ?? false);

  function handleProviderChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as AIProviderId;
    const config = AI_PROVIDERS[value];
    settings.update({
      provider: value,
      modelName: config?.defaultModel ?? '',
      apiKey: '',
    });
    settings.reload();
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
  <ModelSelector />

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

  .field-slide-in {
    animation: fieldSlideDown 0.3s cubic-bezier(0.2, 0.98, 0.28, 1) both;
  }

  @keyframes fieldSlideDown {
    from { opacity: 0; transform: translateY(-8px); max-height: 0; }
    to { opacity: 1; transform: translateY(0); max-height: 80px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bfao-icon-btn :global(svg) { transition: none; }
  }
</style>
