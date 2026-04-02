<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { BUILTIN_PRESETS } from '$utils/constants';
  import { debounce } from '$utils/timing';
  import { focusGlow } from '$animations/micro';
  import { gmGetValue, gmSetValue } from '$utils/gm';
  import { Save, Trash2, Star } from 'lucide-svelte';
  import type { PromptPreset } from '$types/ai';

  let promptValue = $state($settings.lastPrompt);

  // Custom presets from GM storage
  let customPresets = $state<PromptPreset[]>(
    gmGetValue<PromptPreset[]>('bfao_customPromptPresets', [])
  );
  let defaultPresetId = $state<string>(
    gmGetValue('bfao_defaultPromptPreset', '')
  );

  // 1 秒防抖保存
  const savePrompt = debounce((value: string) => {
    settings.update({ lastPrompt: value });
  }, 1000);

  function handleInput(e: Event) {
    promptValue = (e.target as HTMLTextAreaElement).value;
    savePrompt(promptValue);
  }

  function handlePresetChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    // Allow empty string for "自由发挥"
    promptValue = value;
    settings.update({ lastPrompt: value });
  }

  function saveAsCustom() {
    if (!promptValue.trim()) return;
    const id = 'custom_' + Date.now();
    const label = promptValue.trim().slice(0, 20) + (promptValue.trim().length > 20 ? '...' : '');
    const preset: PromptPreset = { label, value: promptValue, isCustom: true, id };
    customPresets = [...customPresets, preset];
    gmSetValue('bfao_customPromptPresets', customPresets);
  }

  function deleteCustom(id: string) {
    customPresets = customPresets.filter(p => p.id !== id);
    gmSetValue('bfao_customPromptPresets', customPresets);
    if (defaultPresetId === id) {
      defaultPresetId = '';
      gmSetValue('bfao_defaultPromptPreset', '');
    }
  }

  function setAsDefault(id: string) {
    if (defaultPresetId === id) {
      defaultPresetId = '';
    } else {
      defaultPresetId = id;
    }
    gmSetValue('bfao_defaultPromptPreset', defaultPresetId);
  }
</script>

<div class="prompt-editor">
  <div class="prompt-header">
    <select class="bfao-select" onchange={handlePresetChange} value={promptValue}>
      <optgroup label="内置预设">
        {#each BUILTIN_PRESETS as preset}
          <option value={preset.value}>{preset.label}</option>
        {/each}
      </optgroup>
      {#if customPresets.length > 0}
        <optgroup label="自定义预设">
          {#each customPresets as preset}
            <option value={preset.value}>{preset.label}{defaultPresetId === preset.id ? ' ★' : ''}</option>
          {/each}
        </optgroup>
      {/if}
    </select>
    <button class="prompt-action-btn" title="保存为自定义预设" onclick={saveAsCustom} disabled={!promptValue.trim()}>
      <Save size={12} />
    </button>
  </div>

  <textarea
    class="prompt-textarea"
    placeholder="输入自定义整理规则（留空则 AI 自动判断最佳分类方式）&#10;&#10;示例：按游戏类型分类，如 MOBA、FPS、RPG..."
    value={promptValue}
    oninput={handleInput}
    use:focusGlow
  ></textarea>

  {#if customPresets.length > 0}
    <div class="custom-presets">
      {#each customPresets as preset (preset.id)}
        <div class="custom-preset-row">
          <button class="preset-select" onclick={() => { promptValue = preset.value; settings.update({ lastPrompt: preset.value }); }}>
            {preset.label}
          </button>
          <button class="preset-icon-btn" title={defaultPresetId === preset.id ? '取消默认' : '设为默认'} onclick={() => setAsDefault(preset.id ?? '')}>
            <Star size={11} class={defaultPresetId === preset.id ? 'starred' : ''} />
          </button>
          <button class="preset-icon-btn danger" title="删除" onclick={() => deleteCustom(preset.id ?? '')}>
            <Trash2 size={11} />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .prompt-editor {
    margin-top: 10px;
  }

  .prompt-header {
    margin-bottom: 6px;
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .prompt-header .bfao-select { flex: 1; }

  .prompt-action-btn {
    padding: 5px 8px;
    border: 1.5px solid var(--ai-border);
    border-radius: 6px;
    background: var(--ai-bg-secondary);
    color: var(--ai-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }
  .prompt-action-btn:hover:not(:disabled) {
    border-color: var(--ai-primary-light);
    color: var(--ai-primary);
  }
  .prompt-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .prompt-textarea {
    width: 100%;
    height: 65px;
    padding: 8px 10px;
    border: 1.5px solid var(--ai-border);
    border-radius: 8px;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
    background: var(--ai-input-bg);
    color: var(--ai-text);
    resize: none;
    font-family: inherit;
    line-height: 1.5;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .prompt-textarea:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px var(--ai-primary-shadow);
  }

  .custom-presets {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .custom-preset-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 6px;
    background: var(--ai-bg-secondary);
  }

  .preset-select {
    flex: 1;
    background: none;
    border: none;
    color: var(--ai-text-secondary);
    font-size: 11px;
    cursor: pointer;
    text-align: left;
    padding: 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preset-select:hover { color: var(--ai-primary); }

  .preset-icon-btn {
    padding: 2px;
    background: none;
    border: none;
    color: var(--ai-text-muted);
    cursor: pointer;
    display: flex;
    transition: color 0.2s;
  }
  .preset-icon-btn:hover { color: var(--ai-primary); }
  .preset-icon-btn.danger:hover { color: var(--ai-error, #ef4444); }
  .preset-icon-btn :global(.starred) { color: var(--ai-warning-dark); fill: var(--ai-warning-dark); }
</style>
