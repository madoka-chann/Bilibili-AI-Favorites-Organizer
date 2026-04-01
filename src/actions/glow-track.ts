/**
 * Svelte action: use:glowTrack
 * 径向光追踪效果 — 鼠标移动时发光点跟随光标
 * 通过 CSS 变量 --glow-x / --glow-y 传递坐标，组件自行用 radial-gradient 实现
 *
 * 用法: <button use:glowTrack>
 * CSS:  background: radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(255,255,255,0.15), transparent 60%);
 */
import { shouldAnimate } from '$animations/gsap-config';

export interface GlowTrackOptions {
  /** 是否启用 (可动态切换) */
  enabled?: boolean;
}

export function glowTrack(node: HTMLElement, opts: GlowTrackOptions = {}) {
  let enabled = opts.enabled ?? true;

  function onMouseMove(e: MouseEvent) {
    if (!enabled || !shouldAnimate()) return;

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    node.style.setProperty('--glow-x', x + 'px');
    node.style.setProperty('--glow-y', y + 'px');
  }

  function onMouseLeave() {
    node.style.removeProperty('--glow-x');
    node.style.removeProperty('--glow-y');
  }

  node.addEventListener('mousemove', onMouseMove);
  node.addEventListener('mouseleave', onMouseLeave);

  return {
    update(newOpts: GlowTrackOptions) {
      enabled = newOpts.enabled ?? true;
    },
    destroy() {
      node.removeEventListener('mousemove', onMouseMove);
      node.removeEventListener('mouseleave', onMouseLeave);
      node.style.removeProperty('--glow-x');
      node.style.removeProperty('--glow-y');
    },
  };
}
