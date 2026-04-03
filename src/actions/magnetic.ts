/**
 * Svelte action: use:magnetic
 * 磁性光标吸引 + hover 微光扫射
 */
import { gsap } from '$animations/gsap-config';
import { shouldAnimate } from '$animations/gsap-config';

export interface MagneticOptions {
  radius?: number;
  strength?: number;
  enabled?: boolean;
}

const DEFAULTS: Required<MagneticOptions> = {
  radius: 100,
  strength: 0.4,
  enabled: true,
};

export function magnetic(node: HTMLElement, opts: MagneticOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  let currentX = 0;
  let currentY = 0;
  let pulseTl: gsap.core.Timeline | null = null;
  let shimmerEl: HTMLElement | null = null;

  function onMouseMove(e: MouseEvent) {
    if (!shouldAnimate() || !cfg.enabled) return;

    const rect = node.getBoundingClientRect();
    const naturalCx = rect.left + rect.width / 2 - currentX;
    const naturalCy = rect.top + rect.height / 2 - currentY;
    const dx = e.clientX - naturalCx;
    const dy = e.clientY - naturalCy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < cfg.radius) {
      const pull = 1 - dist / cfg.radius;
      currentX = dx * cfg.strength * pull;
      currentY = dy * cfg.strength * pull;
    } else {
      currentX = 0;
      currentY = 0;
    }

    gsap.to(node, { x: currentX, y: currentY, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  }

  // Shimmer sweep on THIS button only
  function onEnter() {
    if (!shouldAnimate() || !cfg.enabled) return;
    startShimmer();
  }

  function onLeave() {
    stopShimmer();
    currentX = 0;
    currentY = 0;
    gsap.to(node, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
  }

  function startShimmer() {
    stopShimmer();
    shimmerEl = document.createElement('span');
    shimmerEl.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;z-index:1;';
    const shine = document.createElement('span');
    shine.style.cssText = 'position:absolute;top:0;left:-100%;width:70%;height:100%;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.5) 45%,rgba(255,255,255,0.6) 50%,rgba(255,255,255,0.5) 55%,transparent 100%);transform:skewX(-15deg);';
    shimmerEl.appendChild(shine);
    if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
    node.appendChild(shimmerEl);

    pulseTl = gsap.timeline({ repeat: -1, repeatDelay: 2 })
      .fromTo(shine, { left: '-120%' }, { left: '220%', duration: 1.2, ease: 'power1.inOut' });
  }

  function stopShimmer() {
    if (pulseTl) { pulseTl.kill(); pulseTl = null; }
    if (shimmerEl) { shimmerEl.remove(); shimmerEl = null; }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  node.addEventListener('mouseenter', onEnter);
  node.addEventListener('mouseleave', onLeave);

  return {
    update(newOpts: MagneticOptions) { Object.assign(cfg, DEFAULTS, newOpts); },
    destroy() {
      stopShimmer();
      document.removeEventListener('mousemove', onMouseMove);
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(node);
      gsap.set(node, { x: 0, y: 0 });
    },
  };
}
