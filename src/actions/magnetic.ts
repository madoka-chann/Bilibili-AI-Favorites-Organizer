/**
 * Svelte action: use:magnetic
 * 磁性光标吸引效果 — 鼠标靠近时元素向光标方向偏移
 *
 * 用法: <button use:magnetic={{ radius: 120, strength: 0.3 }}>
 */
import { gsap } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';

export interface MagneticOptions {
  /** 触发半径 (px) */
  radius?: number;
  /** 吸引强度 (0-1) */
  strength?: number;
  /** 是否启用 (可动态切换) */
  enabled?: boolean;
}

const DEFAULTS: Required<MagneticOptions> = {
  radius: 120,
  strength: 0.3,
  enabled: true,
};

export function magnetic(node: HTMLElement, opts: MagneticOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  let qx: gsap.QuickToFunc;
  let qy: gsap.QuickToFunc;

  function setup() {
    qx = gsap.quickTo(node, 'x', { duration: 0.4, ease: 'magneticPull' });
    qy = gsap.quickTo(node, 'y', { duration: 0.4, ease: 'magneticPull' });
  }

  function onMouseMove(e: MouseEvent) {
    if (!shouldAnimate() || !cfg.enabled) return;

    const rect = node.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < cfg.radius) {
      qx(dx * cfg.strength);
      qy(dy * cfg.strength);
    } else {
      qx(0);
      qy(0);
    }
  }

  function onMouseLeave() {
    gsap.to(node, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  }

  setup();
  document.addEventListener('mousemove', onMouseMove);
  node.addEventListener('mouseleave', onMouseLeave);

  return {
    update(newOpts: MagneticOptions) {
      Object.assign(cfg, DEFAULTS, newOpts);
    },
    destroy() {
      document.removeEventListener('mousemove', onMouseMove);
      node.removeEventListener('mouseleave', onMouseLeave);
      gsap.killTweensOf(node);
      gsap.set(node, { x: 0, y: 0 });
    },
  };
}
