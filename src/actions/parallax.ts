/**
 * Svelte action: use:parallax
 * B5 深度视差效果 — 滚动时将 --parallax-y 设置在父元素上，供 ::before 背景层消费
 *
 * 用法: <div use:parallax={{ speed: 0.3 }}>
 *   父元素的 ::before 通过 translateY(var(--parallax-y)) 消费视差偏移量
 */
import { shouldAnimate } from '$animations/gsap-config';

export interface ParallaxOptions {
  /** 视差速率 (0 = 无移动, 1 = 同步滚动, <1 = 比滚动慢) */
  speed?: number;
  /** 最大偏移 px */
  maxOffset?: number;
}

const DEFAULTS: Required<ParallaxOptions> = {
  speed: 0.3,
  maxOffset: 40,
};

export function parallax(node: HTMLElement, opts: ParallaxOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  // 视差变量设置在父元素 (.panel) 上，因为 ::before 伪元素在父元素上
  const target = node.parentElement ?? node;
  target.style.setProperty('--parallax-y', '0px');

  function onScroll() {
    if (!shouldAnimate()) return;
    const offset = Math.min(node.scrollTop * cfg.speed, cfg.maxOffset);
    target.style.setProperty('--parallax-y', `${-offset}px`);
  }

  node.addEventListener('scroll', onScroll, { passive: true });

  return {
    update(newOpts: ParallaxOptions) {
      Object.assign(cfg, DEFAULTS, newOpts);
    },
    destroy() {
      node.removeEventListener('scroll', onScroll);
      target.style.removeProperty('--parallax-y');
    },
  };
}
