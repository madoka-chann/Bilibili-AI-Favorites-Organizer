/**
 * 进度条动画工具函数
 * Plan Phase 2 - Section D: 进度与加载动画
 */
import { gsap, EASINGS } from './gsap-config';
import { shouldAnimate, shouldAnimateFunctional } from './gsap-config';
import { CONFETTI_COLORS, Z_INDEX } from '$utils/constants';

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
 * D4 + I3: 胜利庆祝
 * 面板微震 + 物理模拟五彩纸屑 (gsap.ticker 逐帧更新)
 *
 * I3 增强: 60 粒子 + 帧级物理模拟 (速度 + 重力 + 旋转 + 空气阻力)
 * 替代预计算 tween 路径，获得更自然的重力弧线
 */
export function victoryCelebration(containerEl: HTMLElement): (() => void) | undefined {
  if (!shouldAnimate()) return undefined;

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

  // I3: 物理模拟纸屑
  const rect = containerEl.getBoundingClientRect();
  const PARTICLE_COUNT = 60;
  const GRAVITY = 700;   // px/s²
  const DRAG = 0.98;     // 空气阻力 (60fps 基准)
  const MAX_LIFE = 2.5;  // 秒

  interface ConfettiParticle {
    el: HTMLSpanElement;
    x: number; y: number;
    vx: number; vy: number;
    rotation: number;
    rotSpeed: number;
    life: number;
    maxLife: number;
  }

  const particles: ConfettiParticle[] = [];

  // 生成粒子
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const piece = document.createElement('span');
    const size = 4 + Math.random() * 4;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const isCircle = Math.random() > 0.5;

    piece.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${isCircle ? size : size * 0.5}px;
      background: ${color};
      border-radius: ${isCircle ? '50%' : '1px'};
      pointer-events: none;
      z-index: ${Z_INDEX.PARTICLE};
      will-change: transform, opacity;
    `;
    document.body.appendChild(piece);

    // 发射参数: 从面板中上部区域向上扇形散射
    const angle = -90 + (Math.random() - 0.5) * 120; // -150° to -30°
    const speed = 200 + Math.random() * 400;
    const rad = (angle * Math.PI) / 180;
    const maxLife = 1.2 + Math.random() * (MAX_LIFE - 1.2);

    particles.push({
      el: piece,
      x: rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4,
      y: rect.top + rect.height * 0.3,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 600, // °/s
      life: 0,
      maxLife,
    });
  }

  // gsap.ticker 逐帧物理更新
  function tickPhysics() {
    const dr = gsap.ticker.deltaRatio(); // 1 at 60fps, 2 at 30fps
    const dt = dr / 60; // 秒 (帧率无关)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;

      // 物理更新
      p.vy += GRAVITY * dt;                 // 重力
      const dragFactor = Math.pow(DRAG, dr); // 帧率无关阻力
      p.vx *= dragFactor;
      p.vy *= dragFactor;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;

      // 淡出 (最后 30% 生命周期)
      const lifeRatio = p.life / p.maxLife;
      const opacity = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
      p.el.style.opacity = String(opacity);

      // 生命结束 → 移除
      if (p.life >= p.maxLife) {
        p.el.remove();
        particles.splice(i, 1);
      }
    }

    // 所有粒子结束 → 停止 ticker
    if (particles.length === 0) {
      gsap.ticker.remove(tickPhysics);
    }
  }

  gsap.ticker.add(tickPhysics);

  return () => {
    gsap.ticker.remove(tickPhysics);
    for (const p of particles) p.el.remove();
    particles.length = 0;
  };
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
