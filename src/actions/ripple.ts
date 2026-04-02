/**
 * Svelte action: use:ripple
 * Material Design 风格的点击涟漪效果
 *
 * 用法: <button use:ripple>  或  <button use:ripple={{ color: 'rgba(255,255,255,0.3)' }}>
 */
import { gsap, EASINGS } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';

export interface RippleOptions {
  /** 涟漪颜色 */
  color?: string;
  /** 动画时长 (s) */
  duration?: number;
}

const DEFAULTS: Required<RippleOptions> = {
  color: 'rgba(255, 255, 255, 0.25)',
  duration: 0.55,
};

export function ripple(node: HTMLElement, opts: RippleOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  // 确保 node 可以包含绝对定位子元素
  const originalPosition = getComputedStyle(node).position;
  if (originalPosition === 'static') {
    node.style.position = 'relative';
  }
  node.style.overflow = 'hidden';

  function onClick(e: MouseEvent) {
    if (!shouldAnimate()) return;

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const circle = document.createElement('span');
    circle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${cfg.color};
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
    `;

    node.appendChild(circle);
    activeCircles.add(circle);

    gsap.to(circle, {
      scale: 1,
      opacity: 0,
      duration: cfg.duration,
      ease: EASINGS.rippleExpand,
      onComplete: () => {
        circle.remove();
        activeCircles.delete(circle);
      },
    });
  }

  const activeCircles = new Set<HTMLSpanElement>();

  node.addEventListener('click', onClick);

  return {
    update(newOpts: RippleOptions) {
      Object.assign(cfg, DEFAULTS, newOpts);
    },
    destroy() {
      node.removeEventListener('click', onClick);
      // 清理所有在飞涟漪，防止 DOM 残留
      for (const circle of activeCircles) {
        gsap.killTweensOf(circle);
        circle.remove();
      }
      activeCircles.clear();
    },
  };
}
