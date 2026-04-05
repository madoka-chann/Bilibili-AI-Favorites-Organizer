<script lang="ts">
  import { isRunning, cancelRequested } from '$stores/state';
  import {
    Play, Square, Archive, Copy, Undo2, Download,
    BarChart3, Heart, FileText, HelpCircle, History,
  } from 'lucide-svelte';
  import { glowTrack } from '$actions/glow-track';
  import { magnetic } from '$actions/magnetic';
  import { ripple } from '$actions/ripple';
  import { pressEffect } from '$animations/micro';

  const magneticSmall = { radius: 60, strength: 0.3 };
  const magneticPrimary = { radius: 80, strength: 0.15 };

  interface Props {
    onstart?: () => void;
    onstop?: () => void;
    oncleandead?: () => void;
    onfinddups?: () => void;
    onundo?: () => void;
    onbackup?: () => void;
    onstats?: () => void;
    onhealth?: () => void;
    onexportlogs?: () => void;
    onhelp?: () => void;
    ondebugpreview?: () => void;
    onhistory?: () => void;
  }

  let {
    onstart, onstop, oncleandead, onfinddups, onundo,
    onbackup, onstats, onhealth, onexportlogs, onhelp, ondebugpreview, onhistory,
  }: Props = $props();

  function handleStartStop() {
    if ($isRunning) {
      cancelRequested.set(true);
      onstop?.();
    } else {
      onstart?.();
    }
  }
</script>

<div class="actions">
  <button class="btn-primary" class:running={$isRunning} onclick={handleStartStop} use:glowTrack use:pressEffect use:magnetic={magneticPrimary} use:ripple={{ color: 'rgba(255,255,255,0.3)' }}>
    {#if $isRunning}
      <Square size={16} /><span>停止整理</span><kbd class="kbd">Esc</kbd>
    {:else}
      <Play size={16} /><span>开始整理</span><kbd class="kbd">Ctrl+↵</kbd>
    {/if}
  </button>

  <div class="tool-row">
    <button class="btn-tool" onclick={() => oncleandead?.()} disabled={$isRunning} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <Archive size={14} /><span>失效归档</span>
    </button>
    <button class="btn-tool" onclick={() => onfinddups?.()} disabled={$isRunning} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <Copy size={14} /><span>查重</span>
    </button>
    <button class="btn-tool" onclick={() => onundo?.()} disabled={$isRunning} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <Undo2 size={14} /><span>撤销</span>
    </button>
  </div>

  <div class="tool-row">
    <button class="btn-tool" onclick={() => onbackup?.()} disabled={$isRunning} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <Download size={14} /><span>备份</span>
    </button>
    <button class="btn-tool" onclick={() => onstats?.()} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <BarChart3 size={14} /><span>统计</span>
    </button>
    <button class="btn-tool" onclick={() => onhealth?.()} disabled={$isRunning} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <Heart size={14} /><span>健康</span>
    </button>
  </div>

  <div class="tool-row">
    <button class="btn-tool" onclick={() => onexportlogs?.()} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <FileText size={14} /><span>日志</span>
    </button>
    <button class="btn-tool" onclick={(e) => { if (e.ctrlKey || e.metaKey) ondebugpreview?.(); else onhelp?.(); }} title="Ctrl+点击: 调试预览" use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <HelpCircle size={14} /><span>帮助</span>
    </button>
    <button class="btn-tool" onclick={() => onhistory?.()} use:glowTrack use:pressEffect use:magnetic={magneticSmall} use:ripple>
      <History size={14} /><span>历史</span>
    </button>
  </div>
</div>

<style>
  .actions {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  .btn-primary {
    width: 100%;
    padding: 12px;
    border: 1.5px solid transparent;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    background:
      radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px), rgba(255,255,255,0.2), transparent 60%),
      linear-gradient(135deg, var(--ai-primary), var(--ai-gradient-accent), var(--ai-primary));
    background-size: auto, 500% 500%;
    animation: gradientFlow 8s ease-in-out infinite;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 0.3s cubic-bezier(0.2, 1.04, 0.42, 1);
  }

  .btn-primary:hover {
    box-shadow: 0 12px 32px rgba(var(--ai-primary-rgb), 0.3), 0 5px 16px rgba(255, 107, 157, 0.16);
    transform: translateY(-1px);
  }

  .btn-primary:active {
    transform: scale(0.97);
    transition-duration: 0.08s;
  }

  .btn-primary.running {
    background: linear-gradient(135deg, var(--ai-error), var(--ai-error-hover), var(--ai-error));
    animation: runningPulse 2s ease-in-out infinite;
    border: 1.5px solid rgba(var(--ai-error-rgb), 0.4);
  }

  /* Running state: Esc shortcut becomes more prominent to guide user */
  .btn-primary.running .kbd {
    opacity: 0.8;
    animation: kbdPulse 2s ease-in-out infinite;
  }

  @keyframes kbdPulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; background: rgba(255, 255, 255, 0.3); }
  }

  .btn-primary.running :global(svg) {
    animation: iconSwitch 0.35s cubic-bezier(0.22, 1.42, 0.29, 1) both,
               runningTremor 0.8s ease-in-out 0.35s infinite;
  }

  @keyframes runningTremor {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1) rotate(-2deg); }
    75% { transform: scale(1) rotate(2deg); }
  }

  /* Icon switch bounce on state change */
  .btn-primary:not(.running) :global(svg) {
    animation: iconSwitch 0.35s cubic-bezier(0.22, 1.42, 0.29, 1) both;
  }

  @keyframes iconSwitch {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  .kbd {
    font-size: 10px;
    opacity: 0.4;
    background: rgba(255, 255, 255, 0.15);
    padding: 1px 5px;
    border-radius: 4px;
    margin-left: 4px;
    font-family: monospace;
    transition: opacity 0.25s ease;
  }

  .btn-primary:hover .kbd {
    opacity: 0.8;
  }

  .tool-row {
    display: flex;
    gap: 6px;
    animation: toolRowSlideIn 0.3s ease both;
  }

  .tool-row:nth-child(2) { animation-delay: 0s; }
  .tool-row:nth-child(3) { animation-delay: 0.06s; }
  .tool-row:nth-child(4) { animation-delay: 0.12s; }

  .btn-tool {
    flex: 1;
    padding: 8px 6px;
    border: 1.5px solid var(--ai-border);
    border-radius: 10px;
    background:
      radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px), rgba(var(--ai-primary-rgb), 0.12), transparent 60%),
      var(--ai-bg-tertiary);
    color: var(--ai-text-secondary);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.35s cubic-bezier(0.22, 1.42, 0.29, 1);
  }

  .btn-tool :global(svg) {
    transition: transform 0.25s cubic-bezier(0.22, 1.42, 0.29, 1);
  }

  .btn-tool:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--ai-primary-rgb), 0.12);
    border-color: var(--ai-primary-light);
  }

  .btn-tool:hover :global(svg) {
    transform: scale(1.2);
  }

  /* Unique per-tool icon hover — personality over uniformity */
  .tool-row:nth-child(2) .btn-tool:nth-child(1):hover :global(svg) { transform: translateY(-2px); }       /* Archive: lift up */
  .tool-row:nth-child(2) .btn-tool:nth-child(2):hover :global(svg) { transform: scaleX(-1); }             /* Copy: mirror flip */
  .tool-row:nth-child(2) .btn-tool:nth-child(3):hover :global(svg) { transform: rotate(-45deg); }         /* Undo: counter-rotate */
  .tool-row:nth-child(3) .btn-tool:nth-child(1):hover :global(svg) { transform: translateY(2px); }        /* Download: push down */
  .tool-row:nth-child(3) .btn-tool:nth-child(2):hover :global(svg) { transform: scaleY(1.25); }           /* Stats: stretch tall */
  .tool-row:nth-child(3) .btn-tool:nth-child(3):hover :global(svg) { transform: scale(1.3); }             /* Heart: pulse bigger */
  .tool-row:nth-child(4) .btn-tool:nth-child(1):hover :global(svg) { transform: rotate(-5deg) scale(1.1); }  /* Logs: slight tilt */
  .tool-row:nth-child(4) .btn-tool:nth-child(2):hover :global(svg) { transform: rotate(15deg); }          /* Help: curious tilt */
  .tool-row:nth-child(4) .btn-tool:nth-child(3):hover :global(svg) { transform: rotate(-120deg); }        /* History: rewind spin */

  .btn-tool:active {
    transform: scale(0.92);
    transition-duration: 0.08s;
  }

  .btn-tool:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: grayscale(0.5);
    transition: opacity 0.3s ease, filter 0.3s ease;
  }

  /* When a row has disabled buttons, dim the entire row for visual coherence */
  .tool-row:has(.btn-tool:disabled) {
    opacity: 0.75;
    transition: opacity 0.3s ease;
  }

  @keyframes runningPulse {
    0%, 100% {
      box-shadow: 0 4px 16px rgba(var(--ai-primary-rgb), 0.15);
      border-color: rgba(var(--ai-error-rgb), 0.3);
    }
    50% {
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.35), 0 0 12px rgba(239, 68, 68, 0.2);
      border-color: rgba(var(--ai-error-rgb), 0.6);
    }
  }

  @keyframes gradientFlow {
    0% { background-position: 0% 0%, 0% 50%; }
    50% { background-position: 0% 0%, 100% 50%; }
    100% { background-position: 0% 0%, 0% 50%; }
  }

  @keyframes toolRowSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn-primary { animation: none; }
    .btn-primary :global(svg) { animation: none; }
    .btn-primary.running :global(svg) { animation: none; }
    .btn-primary:not(.running) :global(svg) { animation: none; }
    .btn-primary.running .kbd { animation: none; }
    .kbd { transition: none; }
    .btn-tool :global(svg) { transition: none; }
    .btn-tool:hover :global(svg) { transform: none; }
  }
</style>
