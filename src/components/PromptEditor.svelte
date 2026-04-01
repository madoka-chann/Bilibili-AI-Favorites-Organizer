<script lang="ts">
  import '$styles/forms.css';
  import { settings } from '$stores/settings';
  import { BUILTIN_PRESETS } from '$utils/constants';
  import { debounce } from '$utils/timing';
  import { focusGlow } from '$animations/micro';

  let promptValue = $state($settings.lastPrompt);

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
    if (value) {
      promptValue = value;
      settings.update({ lastPrompt: value });
    }
  }
</script>

<div class="prompt-editor">
  <div class="prompt-header">
    <select class="bfao-select" onchange={handlePresetChange}>
      {#each BUILTIN_PRESETS as preset}
        <option value={preset.value}>{preset.label}</option>
      {/each}
    </select>
  </div>

  <textarea
    class="prompt-textarea"
    placeholder="输入自定义整理规则（留空则 AI 自动判断最佳分类方式）&#10;&#10;示例：按游戏类型分类，如 MOBA、FPS、RPG..."
    value={promptValue}
    oninput={handleInput}
    use:focusGlow
  ></textarea>
</div>

<style>
  .prompt-editor {
    margin-top: 10px;
  }

  .prompt-header {
    margin-bottom: 6px;
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
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .prompt-textarea:focus {
    border-color: var(--ai-primary);
    box-shadow: 0 0 0 3px var(--ai-primary-shadow);
  }
</style>
