/**
 * Svelte action: use:panelCanvas
 * I1 极光画布 + I5 丝线网络 — 面板背景 Canvas2D 特效
 *
 * 用法: <div use:panelCanvas={{ mode: 'aurora' }}>
 *
 * 性能约束:
 * - 最多 1 个 Canvas 活跃 (MAX_CANVAS_FX=1)
 * - 分辨率: I1 50%, I5 40%
 * - 使用 gsap.ticker 统一渲染循环 (替代独立 RAF)
 */
import { gsap } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';
import { AURORA_COLORS } from '$utils/constants';

export interface PanelCanvasOptions {
  /** Canvas 渲染模式 */
  mode?: 'aurora' | 'lumen';
}

const DEFAULTS: Required<PanelCanvasOptions> = {
  mode: 'aurora',
};

export function panelCanvas(node: HTMLElement, opts: PanelCanvasOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  if (!shouldAnimate()) return { update() {}, destroy() {} };

  // Canvas 创建
  const canvas = document.createElement('canvas');
  const ctx2d = canvas.getContext('2d')!;

  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  `;
  node.insertBefore(canvas, node.firstChild);

  // 分辨率缩放
  let w = 0;
  let h = 0;
  let mouseX = 0.5;
  let mouseY = 0.5;
  let time = 0;

  function getScale() {
    return cfg.mode === 'aurora' ? 0.5 : 0.4;
  }

  // I5 Lumen Drift 线程数据
  interface Thread {
    x: number; y: number;
    vx: number; vy: number;
    radius: number;
    hue: number;
  }
  let threads: Thread[] = [];

  function resize() {
    const rect = node.getBoundingClientRect();
    const s = getScale();
    w = Math.floor(rect.width * s);
    h = Math.floor(rect.height * s);
    canvas.width = w;
    canvas.height = h;
  }

  function initThreads() {
    const count = 30;
    threads = [];
    for (let i = 0; i < count; i++) {
      threads.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1.5 + Math.random() * 2,
        hue: 240 + Math.random() * 80,
      });
    }
  }

  // ================= I1: 极光画布渲染器 =================
  function renderAurora() {
    ctx2d.clearRect(0, 0, w, h);
    if (w === 0 || h === 0) return;

    // 绘制 3 层极光带
    for (let layer = 0; layer < 3; layer++) {
      const speed = 0.3 + layer * 0.15;
      const amplitude = h * (0.15 + layer * 0.05);
      const yBase = h * (0.25 + layer * 0.2);
      const color = AURORA_COLORS[layer % AURORA_COLORS.length];

      ctx2d.beginPath();
      ctx2d.moveTo(0, h);

      for (let x = 0; x <= w; x += 3) {
        const nx = x / w;
        const wave1 = Math.sin(nx * 3 + time * speed) * amplitude * 0.6;
        const wave2 = Math.sin(nx * 5 - time * speed * 0.7 + layer) * amplitude * 0.3;
        const wave3 = Math.sin(nx * 1.5 + time * speed * 0.4 + layer * 2) * amplitude * 0.1;
        const y = yBase + wave1 + wave2 + wave3;
        ctx2d.lineTo(x, y);
      }

      ctx2d.lineTo(w, h);
      ctx2d.closePath();

      const gradient = ctx2d.createLinearGradient(0, yBase - amplitude, 0, yBase + amplitude);
      gradient.addColorStop(0, hexToRgba(color, 0));
      gradient.addColorStop(0.4, hexToRgba(color, 0.08 - layer * 0.015));
      gradient.addColorStop(1, hexToRgba(color, 0));
      ctx2d.fillStyle = gradient;
      ctx2d.fill();
    }

    // 鼠标影响 — 靠近鼠标处增强亮度
    const mx = mouseX * w;
    const my = mouseY * h;
    const radGrad = ctx2d.createRadialGradient(mx, my, 0, mx, my, w * 0.3);
    radGrad.addColorStop(0, 'rgba(180, 160, 255, 0.04)');
    radGrad.addColorStop(1, 'rgba(180, 160, 255, 0)');
    ctx2d.fillStyle = radGrad;
    ctx2d.fillRect(0, 0, w, h);
  }

  // ================= I5: 丝线网络渲染器 =================
  function renderLumen() {
    ctx2d.clearRect(0, 0, w, h);
    if (w === 0 || h === 0) return;

    const connectionDist = w * 0.25;
    const mx = mouseX * w;
    const my = mouseY * h;

    // 更新线程位置 (帧率无关)
    const dr = gsap.ticker.deltaRatio();
    for (const t of threads) {
      // 鼠标引力 (轻微)
      const dmx = mx - t.x;
      const dmy = my - t.y;
      const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
      if (distMouse < connectionDist) {
        const force = 0.003 * (1 - distMouse / connectionDist) * dr;
        t.vx += dmx * force;
        t.vy += dmy * force;
      }

      t.x += t.vx * dr;
      t.y += t.vy * dr;

      // 边界反弹
      if (t.x < 0 || t.x > w) t.vx *= -1;
      if (t.y < 0 || t.y > h) t.vy *= -1;
      t.x = Math.max(0, Math.min(w, t.x));
      t.y = Math.max(0, Math.min(h, t.y));

      // 阻尼 (帧率无关)
      t.vx *= Math.pow(0.998, dr);
      t.vy *= Math.pow(0.998, dr);
    }

    // 绘制连接丝线
    for (let i = 0; i < threads.length; i++) {
      for (let j = i + 1; j < threads.length; j++) {
        const a = threads[i];
        const b = threads[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.15;
          ctx2d.beginPath();
          ctx2d.moveTo(a.x, a.y);
          ctx2d.lineTo(b.x, b.y);
          ctx2d.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 60%, 70%, ${alpha})`;
          ctx2d.lineWidth = 0.5;
          ctx2d.stroke();
        }
      }
    }

    // 绘制线程节点
    for (const t of threads) {
      const distMouse = Math.sqrt((mx - t.x) ** 2 + (my - t.y) ** 2);
      const glow = distMouse < connectionDist ? (1 - distMouse / connectionDist) * 0.4 : 0;
      const alpha = 0.3 + glow;

      ctx2d.beginPath();
      ctx2d.arc(t.x, t.y, t.radius * (1 + glow), 0, Math.PI * 2);
      ctx2d.fillStyle = `hsla(${t.hue}, 65%, 75%, ${alpha})`;
      ctx2d.fill();
    }
  }

  // ================= 统一渲染循环 =================
  function tick() {
    // 帧率无关时间推进: deltaRatio()=1 at 60fps, =2 at 30fps
    time += 0.008 * gsap.ticker.deltaRatio();
    if (cfg.mode === 'aurora') {
      renderAurora();
    } else {
      renderLumen();
    }
  }

  // 鼠标追踪 (节流)
  let lastMouseTime = 0;
  function onMouseMove(e: MouseEvent) {
    const now = Date.now();
    if (now - lastMouseTime < 50) return;
    lastMouseTime = now;

    const rect = node.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
  }

  // ResizeObserver 处理尺寸变化
  const ro = new ResizeObserver(() => {
    resize();
    if (cfg.mode === 'lumen' && threads.length === 0) {
      initThreads();
    }
  });

  // 初始化
  resize();
  if (cfg.mode === 'lumen') initThreads();
  gsap.ticker.add(tick);
  ro.observe(node);
  node.addEventListener('mousemove', onMouseMove, { passive: true });

  return {
    update(newOpts: PanelCanvasOptions) {
      const prevMode = cfg.mode;
      Object.assign(cfg, DEFAULTS, newOpts);
      if (cfg.mode !== prevMode) {
        resize(); // 分辨率随模式变化
        if (cfg.mode === 'lumen') initThreads();
      }
    },
    destroy() {
      gsap.ticker.remove(tick);
      ro.disconnect();
      node.removeEventListener('mousemove', onMouseMove);
      canvas.remove();
    },
  };
}

// ================= 工具函数 =================

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
