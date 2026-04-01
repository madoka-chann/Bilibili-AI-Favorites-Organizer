/**
 * Svelte action: use:cursorScatter
 * I2 光标散射效果 — 鼠标移动时在光标轨迹上生成发光粒子
 *
 * 用法: <div use:cursorScatter>
 *
 * 性能约束:
 * - 80ms 节流
 * - 30% 生成率
 * - 最多 ~5 并发粒子
 */
import { gsap, EASINGS } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';
import { AURORA_COLORS } from '$utils/constants';

export interface CursorScatterOptions {
  /** 节流间隔 (ms) */
  throttle?: number;
  /** 生成概率 (0-1) */
  spawnRate?: number;
  /** 最大并发粒子数 */
  maxParticles?: number;
}

const DEFAULTS: Required<CursorScatterOptions> = {
  throttle: 80,
  spawnRate: 0.3,
  maxParticles: 5,
};

export function cursorScatter(node: HTMLElement, opts: CursorScatterOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  let lastTime = 0;
  let activeCount = 0;
  const activeParticles = new Set<HTMLDivElement>();

  function onMouseMove(e: MouseEvent) {
    if (!shouldAnimate()) return;

    const now = Date.now();
    if (now - lastTime < cfg.throttle) return;
    lastTime = now;

    if (Math.random() > cfg.spawnRate) return;
    if (activeCount >= cfg.maxParticles) return;

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spawnParticle(x, y);
  }

  function spawnParticle(x: number, y: number) {
    const dot = document.createElement('div');
    const size = 3 + Math.random() * 3;
    const color = AURORA_COLORS[Math.floor(Math.random() * AURORA_COLORS.length)];

    // 使用 fixed 定位避免被 overflow:auto 裁剪
    const rect = node.getBoundingClientRect();
    dot.style.cssText = `
      position: fixed;
      left: ${rect.left + x}px;
      top: ${rect.top + y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      pointer-events: none;
      will-change: transform, opacity;
      z-index: 1;
    `;
    document.body.appendChild(dot);
    activeCount++;
    activeParticles.add(dot);

    // 粒子散射动画: 随机方向飘散 + 缩小消失
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 25;

    gsap.fromTo(
      dot,
      { scale: 1, opacity: 0.8 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 10, // 略微上飘
        scale: 0,
        opacity: 0,
        duration: 0.6 + Math.random() * 0.4,
        ease: EASINGS.confettiArc,
        onComplete() {
          dot.remove();
          activeCount--;
          activeParticles.delete(dot);
        },
      }
    );
  }

  node.addEventListener('mousemove', onMouseMove, { passive: true });

  return {
    update(newOpts: CursorScatterOptions) {
      Object.assign(cfg, DEFAULTS, newOpts);
    },
    destroy() {
      node.removeEventListener('mousemove', onMouseMove);
      // 清理所有在飞粒子，防止 DOM 残留
      for (const dot of activeParticles) {
        gsap.killTweensOf(dot);
        dot.remove();
      }
      activeParticles.clear();
      activeCount = 0;
    },
  };
}
