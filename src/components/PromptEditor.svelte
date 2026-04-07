<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { BUILTIN_PRESETS } from '$utils/constants';
  import { debounce } from '$utils/timing';
  import { focusGlow, pressEffect } from '$animations/micro';
  import { ripple } from '$actions/ripple';
  import { gsap, EASINGS, shouldAnimate } from '$animations/gsap-config';
  import { gmGetValue, gmSetValue } from '$utils/gm';
  import { Save, Trash2, Star, Settings2 } from 'lucide-svelte';
  import type { PromptPreset } from '$types/ai';

  let promptValue = $state($settings.lastPrompt);

  // Custom presets from GM storage
  let customPresets = $state<PromptPreset[]>(
    gmGetValue<PromptPreset[]>('bfao_customPromptPresets', [])
  );
  let defaultPresetId = $state<string>(
    gmGetValue('bfao_defaultPromptPreset', '')
  );
  let hiddenBuiltins = $state<string[]>(
    gmGetValue<string[]>('bfao_hiddenPresets', [])
  );
  let showManager = $state(false);
  let managerEl = $state<HTMLDivElement>(undefined!);
  let saveFlash = $state(false);

  let visibleBuiltins = $derived(
    BUILTIN_PRESETS.filter(p => !hiddenBuiltins.includes(p.label))
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
    const defaultName = promptValue.trim().slice(0, 20) + (promptValue.trim().length > 20 ? '...' : '');
    const name = window.prompt('预设名称:', defaultName);
    if (!name) return;
    const id = 'custom_' + Date.now();
    const preset: PromptPreset = { label: name, value: promptValue, isCustom: true, id };
    customPresets = [...customPresets, preset];
    gmSetValue('bfao_customPromptPresets', customPresets);
    // Save success flash
    saveFlash = true;
    setTimeout(() => { saveFlash = false; }, 600);
  }

  function toggleManager() {
    if (showManager) {
      // Collapse with animation
      if (managerEl && shouldAnimate()) {
        managerEl.style.overflow = 'hidden';
        gsap.to(managerEl, {
          height: 0, opacity: 0, duration: 0.22, ease: EASINGS.silkOut,
          onComplete: () => { showManager = false; }
        });
      } else {
        showManager = false;
      }
    } else {
      showManager = true;
    }
  }

  /** GSAP expand animation for preset manager */
  function managerExpand(node: HTMLDivElement) {
    managerEl = node;
    if (!shouldAnimate()) return;
    node.style.overflow = 'hidden';
    gsap.fromTo(node,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.3, ease: EASINGS.velvetSpring,
        onComplete: () => { node.style.overflow = ''; } }
    );
  }

  function hideBuiltin(label: string) {
    hiddenBuiltins = [...hiddenBuiltins, label];
    gmSetValue('bfao_hiddenPresets', hiddenBuiltins);
  }

  function restoreBuiltin(label: string) {
    hiddenBuiltins = hiddenBuiltins.filter(l => l !== label);
    gmSetValue('bfao_hiddenPresets', hiddenBuiltins);
  }

  function renameCustom(id: string) {
    const preset = customPresets.find(p => p.id === id);
    if (!preset) return;
    const name = window.prompt('重命名预设:', preset.label);
    if (!name) return;
    preset.label = name;
    customPresets = [...customPresets];
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
      {#if customPresets.length > 0}
        <optgroup label="自定义预设">
          {#each customPresets as preset}
            <option value={preset.value}>{preset.label}{defaultPresetId === preset.id ? ' ★' : ''}</option>
          {/each}
        </optgroup>
      {/if}
      <optgroup label="内置预设">
        {#each visibleBuiltins as preset}
          <option value={preset.value}>{preset.label}</option>
        {/each}
      </optgroup>
    </select>
    <button class="prompt-action-btn" class:save-flash={saveFlash} title="保存为自定义预设" onclick={saveAsCustom} disabled={!promptValue.trim()} use:pressEffect use:ripple>
      <Save size={12} />
    </button>
    <button class="prompt-action-btn" title="管理预设" onclick={toggleManager} use:pressEffect use:ripple>
      <Settings2 size={12} />
    </button>
  </div>

  <textarea
    class="prompt-textarea"
    placeholder="输入自定义整理规则（留空则 AI 自动判断最佳分类方式）&#10;&#10;示例：按游戏类型分类，如 MOBA、FPS、RPG..."
    value={promptValue}
    oninput={handleInput}
    use:focusGlow
  ></textarea>

  {#if showManager}
    <div class="preset-manager" use:managerExpand>
      <div class="manager-title">预设管理</div>
      {#if customPresets.length > 0}
        <div class="manager-section">自定义</div>
        {#each customPresets as preset (preset.id)}
          <div class="custom-preset-row">
            <button class="preset-select" onclick={() => { promptValue = preset.value; settings.update({ lastPrompt: preset.value }); }}>
              {preset.label}
            </button>
            <button class="preset-icon-btn" title="重命名" onclick={() => renameCustom(preset.id ?? '')}>✎</button>
            <button class="preset-icon-btn" title={defaultPresetId === preset.id ? '取消默认' : '设为默认'} onclick={() => setAsDefault(preset.id ?? '')}>
              <Star size={11} class={defaultPresetId === preset.id ? 'starred' : ''} />
            </button>
            <button class="preset-icon-btn danger" title="删除" onclick={() => deleteCustom(preset.id ?? '')}>
              <Trash2 size={11} />
            </button>
          </div>
        {/each}
      {/if}
      <div class="manager-section">内置</div>
      {#each BUILTIN_PRESETS as preset}
        <div class="custom-preset-row">
          <button class="preset-select" class:hidden-preset={hiddenBuiltins.includes(preset.label)}
            onclick={() => { promptValue = preset.value; settings.update({ lastPrompt: preset.value }); }}>
            {preset.label}
          </button>
          {#if hiddenBuiltins.includes(preset.label)}
            <button class="preset-icon-btn" title="恢复显示" onclick={() => restoreBuiltin(preset.label)}>↩</button>
          {:else}
            <button class="preset-icon-btn danger" title="隐藏" onclick={() => hideBuiltin(preset.label)}>
              <Trash2 size={11} />
            </button>
          {/if}
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

  .prompt-action-btn.save-flash {
    color: var(--ai-success-dark);
    border-color: var(--ai-success);
    animation: saveFlash 0.6s ease both;
    position: relative;
  }

  .prompt-action-btn.save-flash::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    border: 2px solid var(--ai-success);
    animation: saveBurst 0.5s ease-out both;
    pointer-events: none;
  }

  @keyframes saveFlash {
    0% { background: var(--ai-bg-secondary); }
    30% { background: var(--ai-success-bg); box-shadow: 0 0 8px rgba(var(--ai-success-rgb), 0.3); }
    100% { background: var(--ai-bg-secondary); box-shadow: none; }
  }

  @keyframes saveBurst {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }

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
    transition: border-color 0.3s ease, box-shadow 0.3s ease, height 0.3s cubic-bezier(0.2, 0.98, 0.28, 1);
  }

  .prompt-textarea:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px var(--ai-primary-shadow);
    height: 72px;
  }

  /* Typing pulse — border oscillates when actively editing */
  .prompt-textarea:focus:not(:placeholder-shown) {
    animation: typingPulse 2s ease-in-out infinite;
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
    animation: presetSlideIn 0.25s cubic-bezier(0.2, 0.98, 0.28, 1) both;
    transition: background 0.2s ease, transform 0.15s ease;
  }

  .custom-preset-row:nth-child(1) { animation-delay: 0s; }
  .custom-preset-row:nth-child(2) { animation-delay: 0.04s; }
  .custom-preset-row:nth-child(3) { animation-delay: 0.08s; }
  .custom-preset-row:nth-child(4) { animation-delay: 0.12s; }
  .custom-preset-row:nth-child(n+5) { animation-delay: 0.16s; }

  @keyframes typingPulse {
    0%, 100% { border-color: var(--ai-primary); }
    50% { border-color: var(--ai-gradient-accent); }
  }

  @keyframes presetSlideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .custom-preset-row:hover {
    background: var(--ai-bg-hover);
    transform: translateX(2px);
    box-shadow: var(--ai-glow-selected);
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
  .preset-icon-btn.danger:hover {
    color: var(--ai-error, #ef4444);
    animation: deleteShake 0.3s ease;
  }
  .preset-icon-btn :global(.starred) {
    color: var(--ai-warning-dark);
    fill: var(--ai-warning-dark);
    animation: starBounce 0.35s cubic-bezier(0.2, 0.98, 0.28, 1);
  }

  @keyframes starBounce {
    0% { transform: scale(0.5); }
    60% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }

  @keyframes deleteShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  .preset-manager {
    margin-top: 8px;
    padding: 8px;
    border: 1px solid var(--ai-border-light);
    border-radius: 8px;
    background: var(--ai-bg-secondary);
  }
  .manager-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--ai-text);
    margin-bottom: 6px;
    position: relative;
    padding-bottom: 4px;
  }
  .manager-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1.5px;
    background: linear-gradient(90deg, var(--ai-primary), var(--ai-gradient-accent), transparent);
    transform: scaleX(0);
    transform-origin: left;
    animation: titleLineExpand 0.4s cubic-bezier(0.2, 0.98, 0.28, 1) 0.15s both;
  }
  @keyframes titleLineExpand {
    to { transform: scaleX(1); }
  }
  .manager-section {
    font-size: 10px;
    font-weight: 600;
    color: var(--ai-text-muted);
    margin: 6px 0 2px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .hidden-preset {
    opacity: 0.4;
    text-decoration: line-through;
  }

  @media (prefers-reduced-motion: reduce) {
    .prompt-textarea { transition: border-color 0.3s ease, box-shadow 0.3s ease; height: 65px !important; }
    .prompt-textarea:focus:not(:placeholder-shown) { animation: none; }
    .prompt-action-btn.save-flash { animation: none; }
    .prompt-action-btn.save-flash::after { animation: none; display: none; }
    .manager-title::after { animation: none; transform: scaleX(1); }
    .custom-preset-row { animation: none; }
  }
</style>
