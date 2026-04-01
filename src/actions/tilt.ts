/**
 * Svelte action: use:tilt
 * 3D 倾斜悬浮效果 — 鼠标悬停时卡片/元素轻微 3D 倾斜
 *
 * 用法: <div use:tilt={{ maxDeg: 3, perspective: 800 }}>
 */
import { gsap } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';

export interface TiltOptions {
  /** 最大倾斜角度 (deg) */
  maxDeg?: number;
  /** 透视距离 (px) */
  perspective?: number;
  /** 缩放量 */
  scale?: number;
}

const DEFAULTS: Required<TiltOptions> = {
  maxDeg: 3,
  perspective: 800,
  scale: 1.02,
};

export function tilt(node: HTMLElement, opts: TiltOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  let qRotX: gsap.QuickToFunc;
  let qRotY: gsap.QuickToFunc;

  function setup() {
    node.style.transformStyle = 'preserve-3d';
    node.style.perspective = cfg.perspective + 'px';
    qRotX = gsap.quickTo(node, 'rotationX', { duration: 0.3, ease: 'power2.out' });
    qRotY = gsap.quickTo(node, 'rotationY', { duration: 0.3, ease: 'power2.out' });
  }

  function onMouseMove(e: MouseEvent) {
    if (!shouldAnimate()) return;

    const rect = node.getBoundingClientRect();
    // Normalized -0.5 to 0.5
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    // rotateX is vertical tilt (invert Y), rotateY is horizontal tilt
    qRotX(-ny * cfg.maxDeg * 2);
    qRotY(nx * cfg.maxDeg * 2);
  }

  function onMouseEnter() {
    if (!shouldAnimate()) return;
    gsap.to(node, { scale: cfg.scale, duration: 0.3, ease: 'power2.out' });
  }

  function onMouseLeave() {
    gsap.to(node, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  }

  setup();
  node.addEventListener('mousemove', onMouseMove);
  node.addEventListener('mouseenter', onMouseEnter);
  node.addEventListener('mouseleave', onMouseLeave);

  return {
    update(newOpts: TiltOptions) {
      Object.assign(cfg, DEFAULTS, newOpts);
      node.style.perspective = cfg.perspective + 'px';
    },
    destroy() {
      node.removeEventListener('mousemove', onMouseMove);
      node.removeEventListener('mouseenter', onMouseEnter);
      node.removeEventListener('mouseleave', onMouseLeave);
      gsap.set(node, { rotationX: 0, rotationY: 0, scale: 1 });
    },
  };
}
