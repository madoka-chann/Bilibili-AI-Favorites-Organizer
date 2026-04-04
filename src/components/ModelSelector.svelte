<script lang="ts">
  import { settings } from '$stores/settings';
  import { fetchModelList } from '$api/ai-client';
  import { logs } from '$stores/state';
  import { RefreshCw, Zap, CheckCircle, XCircle } from 'lucide-svelte';
  import { getErrorMessage } from '$utils/errors';
  import { focusGlow, pressEffect } from '$animations/micro';
  import { gmGetValue, gmSetValue } from '$utils/gm';

  let modelLoading = $state(false);
  let modelList = $state<string[]>([]);
  let showModelDropdown = $state(false);
  let modelSearchQuery = $state('');
  let testStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load cached model list on provider change
  $effect(() => {
    const provider = $settings.provider;
    const cached = gmGetValue(`bfao_modelList_${provider}`, []) as string[];
    modelList = cached.length > 0 ? cached : [];
  });

  let filteredModels = $derived((() => {
    const q = modelSearchQuery.trim().toLowerCase();
    if (!q) return modelList;
    return modelList.filter(m => m.toLowerCase().includes(q));
  })());

  async function handleFetchModels() {
    modelLoading = true;
    try {
      const s = $settings;
      modelList = await fetchModelList(s);
      showModelDropdown = true;
      gmSetValue(`bfao_modelList_${s.provider}`, modelList);
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
    modelSearchQuery = '';
  }

  // Close dropdown on click outside
  function handleDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.bfao-field') || !target.closest('#bfao-model, .model-dropdown, .model-search')) {
      showModelDropdown = false;
    }
  }
  $effect(() => {
    if (showModelDropdown) {
      document.addEventListener('click', handleDocClick, true);
      return () => document.removeEventListener('click', handleDocClick, true);
    }
  });

  async function handleTestConnectivity() {
    testStatus = 'loading';
    try {
      const s = $settings;
      if (!s.apiKey) {
        logs.add('请先填写 API Key', 'warning');
        testStatus = 'idle';
        return;
      }
      await fetchModelList(s);
      testStatus = 'success';
      logs.add('连通性测试成功 ✓', 'success');
    } catch (e: unknown) {
      testStatus = 'error';
      logs.add(`连通性测试失败: ${getErrorMessage(e)}`, 'error');
    }
    setTimeout(() => { testStatus = 'idle'; }, 2000);
  }
</script>

<div class="bfao-field">
  <label class="bfao-label" for="bfao-model">模型</label>
  <div class="bfao-input-row">
    <input
      id="bfao-model"
      class="bfao-input bfao-input-flex"
      type="text"
      placeholder="输入或搜索模型名称"
      value={$settings.modelName}
      oninput={(e) =>
        settings.update({ modelName: (e.target as HTMLInputElement).value })}
      onfocus={() => { if (modelList.length > 0) showModelDropdown = true; }}
      onclick={() => { if (modelList.length > 0) showModelDropdown = !showModelDropdown; }}
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
      class:test-success={testStatus === 'success'}
      class:test-error={testStatus === 'error'}
      onclick={handleTestConnectivity}
      disabled={testStatus === 'loading'}
      title="测试连通性"
      use:pressEffect
    >
      {#if testStatus === 'success'}
        <CheckCircle size={14} />
      {:else if testStatus === 'error'}
        <XCircle size={14} />
      {:else}
        <Zap size={14} class={testStatus === 'loading' ? 'spinning' : ''} />
      {/if}
    </button>
  </div>

  {#if showModelDropdown && modelList.length > 0}
    <div class="model-dropdown">
      {#if modelList.length > 5}
        <input
          class="model-search"
          type="text"
          placeholder="搜索模型..."
          bind:value={modelSearchQuery}
        />
      {/if}
      <div class="model-list">
        {#each filteredModels as model}
          <button
            class="model-item"
            class:active={model === $settings.modelName}
            onclick={() => selectModel(model)}
          >
            {model}
          </button>
        {/each}
        {#if filteredModels.length === 0}
          <div class="model-empty">无匹配模型</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* :global() needed: .spinning is applied to Lucide SVG child component */
  .bfao-icon-btn :global(svg) {
    transition: transform 0.2s cubic-bezier(0.2, 0.98, 0.28, 1);
  }

  .bfao-icon-btn:active :global(svg) {
    transform: scale(0.8);
  }

  .bfao-icon-btn :global(.spinning) {
    animation: spin 0.8s linear infinite;
    filter: drop-shadow(0 0 4px rgba(var(--ai-primary-rgb), 0.5));
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Test connectivity button status */
  .bfao-icon-btn.test-success {
    color: var(--ai-success-dark);
    background: var(--ai-success-bg);
    border-color: var(--ai-success);
    animation: testPop 0.35s cubic-bezier(0.2, 1.2, 0.4, 1) both;
  }
  .bfao-icon-btn.test-error {
    color: var(--ai-error, #ef4444);
    background: var(--ai-error-bg, rgba(239, 68, 68, 0.1));
    border-color: var(--ai-error, #ef4444);
    animation: testShake 0.4s ease both;
  }
  @keyframes testPop {
    0% { transform: scale(0.5); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes testShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(1px); }
  }

  .model-dropdown {
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-bg);
    box-shadow: var(--ai-shadow-md);
    margin-top: 4px;
    animation: dropdownIn 0.2s cubic-bezier(0.2, 0.98, 0.28, 1) both;
    transform-origin: top center;
    padding: 4px 0;
  }
  .model-search {
    width: calc(100% - 16px);
    margin: 4px 8px;
    padding: 5px 8px;
    border: 1px solid var(--ai-border);
    border-radius: 6px;
    font-size: 11px;
    background: var(--ai-bg-secondary);
    color: var(--ai-text);
    outline: none;
    box-sizing: border-box;
  }
  .model-search:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 1px 0 0 var(--ai-primary);
  }
  .model-list {
    max-height: 180px;
    overflow-y: auto;
    mask-image: linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%);
  }
  .model-empty {
    padding: 8px 12px;
    font-size: 11px;
    color: var(--ai-text-muted);
    text-align: center;
    animation: floatIdle 3s ease-in-out infinite;
  }
  @keyframes floatIdle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
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
    box-shadow: inset 0 0 12px rgba(var(--ai-primary-rgb), 0.06);
  }

  .model-item.active {
    background: var(--ai-primary-bg);
    color: var(--ai-primary);
    font-weight: 600;
    box-shadow: inset 3px 0 0 var(--ai-primary);
    animation: activePulse 2.5s ease-in-out infinite;
  }

  @keyframes activePulse {
    0%, 100% { box-shadow: inset 3px 0 0 var(--ai-primary); }
    50% { box-shadow: inset 3px 0 8px rgba(var(--ai-primary-rgb), 0.2), inset 3px 0 0 var(--ai-primary); }
  }

  @media (prefers-reduced-motion: reduce) {
    .bfao-icon-btn :global(svg) { transition: none; }
    .bfao-icon-btn :global(.spinning) { filter: none; }
    .model-item.active { animation: none; }
    .model-empty { animation: none; }
    .model-search:focus { box-shadow: none; }
  }
</style>
