/**
 * 微交互动画工具函数
 * Plan Phase 2 - Section C: 全局可复用微交互
 */
import { gsap, EASINGS } from './gsap-config';
import { shouldAnimate } from './gsap-config';

/**
 * C2: 新拟态按压效果
 * 按下缩小 + 内阴影，松开弹回
 */
export function pressEffect(node: HTMLElement) {
  function onDown() {
    if (!shouldAnimate()) return;
    gsap.to(node, {
      scale: 0.95,
      duration: 0.12,
      ease: 'power2.out',
    });
  }

  function onUp() {
    if (!shouldAnimate()) return;
    gsap.to(node, {
      scale: 1,
      duration: 0.35,
      ease: EASINGS.prismBounce,
    });
  }

  node.addEventListener('pointerdown', onDown);
  node.addEventListener('pointerup', onUp);
  node.addEventListener('pointerleave', onUp);

  return {
    destroy() {
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointerup', onUp);
      node.removeEventListener('pointerleave', onUp);
    },
  };
}

/**
 * C4: 输入框聚焦发光
 */
export function focusGlow(
  node: HTMLElement,
  opts: { color?: string; spread?: number } = {}
) {
  const color = opts.color ?? 'var(--ai-primary)';
  const spread = opts.spread ?? 8;

  function onFocus() {
    if (!shouldAnimate()) return;
    gsap.to(node, {
      boxShadow: `0 0 0 2px ${color}, 0 0 ${spread}px ${color}40`,
      duration: 0.3,
      ease: EASINGS.velvetSpring,
    });
  }

  function onBlur() {
    gsap.to(node, {
      boxShadow: '0 0 0 0px transparent, 0 0 0px transparent',
      duration: 0.25,
      ease: EASINGS.silkOut,
    });
  }

  node.addEventListener('focus', onFocus);
  node.addEventListener('blur', onBlur);

  return {
    destroy() {
      node.removeEventListener('focus', onFocus);
      node.removeEventListener('blur', onBlur);
      gsap.set(node, { clearProps: 'boxShadow' });
    },
  };
}

/**
 * C6: 勾选弹跳效果
 */
export function checkBounce(node: HTMLElement) {
  function onChange() {
    if (!shouldAnimate()) return;
    gsap.fromTo(
      node,
      { scale: 0.7 },
      { scale: 1, duration: 0.4, ease: EASINGS.prismBounce }
    );
  }

  node.addEventListener('change', onChange);
  return {
    destroy() {
      node.removeEventListener('change', onChange);
    },
  };
}

/**
 * C7: 交错下拉显示
 * 容器展开 + 子元素交错滑入
 */
export function staggerReveal(
  container: HTMLElement,
  opts: { itemSelector?: string; stagger?: number } = {}
) {
  const selector = opts.itemSelector ?? ':scope > *';
  const stagger = opts.stagger ?? 0.03;

  const items = container.querySelectorAll(selector);
  if (items.length === 0 || !shouldAnimate()) return { destroy() {} };

  gsap.fromTo(
    container,
    { scale: 0.95, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.25, ease: EASINGS.velvetSpring }
  );

  gsap.fromTo(
    items,
    { x: -10, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.25,
      stagger,
      ease: EASINGS.velvetSpring,
    }
  );

  return { destroy() {} };
}

/**
 * F4: 模态框内容交错入场
 * 在模态框打开动画完成后，子元素依次浮现
 */
export function contentStagger(
  container: HTMLElement,
  opts: { delay?: number; stagger?: number } = {}
) {
  const delay = opts.delay ?? 0.15;
  const stagger = opts.stagger ?? 0.05;

  if (!shouldAnimate()) return { destroy() {} };

  const children = container.children;
  if (children.length === 0) return { destroy() {} };

  gsap.fromTo(
    children,
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger,
      delay,
      ease: EASINGS.velvetSpring,
    }
  );

  return { destroy() {} };
}

/**
 * E1: 列表项交错揭示
 * 用于分类展开时视频项的交错入场
 */
export function listStaggerReveal(
  items: HTMLElement[] | NodeListOf<Element>,
  opts: { maxItems?: number } = {}
) {
  const maxItems = opts.maxItems ?? 20;

  if (!shouldAnimate() || !items.length) return;

  // 只动画前 N 个可见项（性能预算）
  const targets = Array.from(items).slice(0, maxItems);

  gsap.fromTo(
    targets,
    { x: 36, scale: 0.93, opacity: 0, filter: 'blur(2.5px)' },
    {
      x: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.35,
      stagger: 0.04,
      ease: EASINGS.velvetSpring,
    }
  );
}
