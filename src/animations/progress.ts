/**
 * 进度条动画工具函数
 * Plan Phase 2 - Section D: 进度与加载动画
 */
import { gsap, EASINGS } from './gsap-config';
import { shouldAnimate, shouldAnimateFunctional } from './gsap-config';
import { CONFETTI_COLORS, Z_INDEX } from '$lib/utils/constants';

/**
 * D2: 进度轨迹粒子
 * 在进度条前沿生成粒子，向上飘散消失
 */
export function spawnTrailParticles(
  trackEl: HTMLElement,
  progressPercent: number
) {
  if (!shouldAnimate() || progressPercent <= 0) return;

  const rect = trackEl.getBoundingClientRect();
  const leadX = (progressPercent / 100) * rect.width;
  const count = 3;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.className = 'progress-particle';
    dot.style.cssText = `
      position: absolute;
      left: ${leadX}px;
      top: 50%;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      pointer-events: none;
      will-change: transform, opacity;
    `;
    trackEl.appendChild(dot);

    gsap.fromTo(
      dot,
      { x: 0, y: 0, scale: 1, opacity: 0.9 },
      {
        x: (Math.random() - 0.5) * 20,
        y: -(10 + Math.random() * 18),
        scale: 0,
        opacity: 0,
        duration: 0.5 + Math.random() * 0.3,
        ease: EASINGS.confettiArc,
        onComplete: () => dot.remove(),
      }
    );
  }
}

/**
 * D3: 阶段切换动画
 * 闪光 + 旧标签上飘出 + 新标签入场
 */
export function phaseTransition(
  labelEl: HTMLElement,
  barEl: HTMLElement,
  newText: string
) {
  if (!shouldAnimateFunctional()) {
    labelEl.textContent = newText;
    return;
  }

  const tl = gsap.timeline();

  // 进度条闪光
  tl.to(barEl, {
    filter: 'brightness(1.5)',
    duration: 0.15,
    ease: 'power2.in',
  });
  tl.to(barEl, {
    filter: 'brightness(1)',
    duration: 0.3,
    ease: 'power2.out',
  });

  // 旧标签上飘
  tl.to(
    labelEl,
    {
      y: -12,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        labelEl.textContent = newText;
      },
    },
    0
  );

  // 新标签入场
  tl.fromTo(
    labelEl,
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.25, ease: EASINGS.velvetSpring }
  );

  return tl;
}

/**
 * D4: 胜利庆祝
 * 面板微震 + 五彩纸屑粒子
 */
export function victoryCelebration(containerEl: HTMLElement) {
  if (!shouldAnimate()) return;

  // 微震
  gsap.to(containerEl, {
    keyframes: [
      { x: -3, duration: 0.05 },
      { x: 3, duration: 0.05 },
      { x: -2, duration: 0.05 },
      { x: 1, duration: 0.05 },
      { x: 0, duration: 0.05 },
    ],
    ease: 'none',
  });

  // 五彩纸屑
  const rect = containerEl.getBoundingClientRect();
  const confettiCount = 24;

  for (let i = 0; i < confettiCount; i++) {
    const piece = document.createElement('span');
    const size = 4 + Math.random() * 4;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const isCircle = Math.random() > 0.5;

    piece.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4}px;
      top: ${rect.top + rect.height * 0.3}px;
      width: ${size}px;
      height: ${isCircle ? size : size * 0.5}px;
      background: ${color};
      border-radius: ${isCircle ? '50%' : '1px'};
      pointer-events: none;
      z-index: ${Z_INDEX.PARTICLE};
      will-change: transform, opacity;
    `;
    document.body.appendChild(piece);

    const angle = -90 + (Math.random() - 0.5) * 120;
    const velocity = 200 + Math.random() * 400;
    const rad = (angle * Math.PI) / 180;
    const vx = Math.cos(rad) * velocity;
    const vy = Math.sin(rad) * velocity;
    const duration = 0.8 + Math.random() * 0.6;

    gsap.to(piece, {
      x: vx * duration * 0.3,
      y: vy * duration * 0.3 + 0.5 * 700 * duration * duration,
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      duration,
      ease: EASINGS.confettiArc,
      onComplete: () => piece.remove(),
    });
  }
}

/**
 * D5: 数字翻滚弹跳
 * 数值变化时短暂放大弹回
 */
export function numberBounce(el: HTMLElement) {
  if (!shouldAnimateFunctional()) return;

  gsap.fromTo(
    el,
    { scale: 1.15 },
    { scale: 1, duration: 0.3, ease: EASINGS.prismBounce }
  );
}
