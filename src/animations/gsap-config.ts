import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { CustomEase } from 'gsap/CustomEase';
import { get } from 'svelte/store';
import { prefersReducedMotion } from '$lib/stores/theme';
import { settings } from '$lib/stores/settings';

// ================= 插件注册 =================
gsap.registerPlugin(Flip, Draggable, CustomEase);

// ================= 全局默认值 =================
gsap.defaults({
  force3D: true,
  overwrite: 'auto',
});

// ================= 品牌缓动曲线 (10个) =================
// 替代原始 70+ CSS cubic-bezier 变量

CustomEase.create('velvetSpring', '0.20, 1.04, 0.42, 1');
CustomEase.create('silkOut', '0.08, 0.92, 0.16, 1');
CustomEase.create('prismBounce', '0.22, 1.42, 0.29, 1');
CustomEase.create('liquidMorph', '0.08, 0.82, 0.17, 1');
CustomEase.create('magneticPull', '0.18, 0.88, 0.28, 1.08');
CustomEase.create('rippleExpand', '0.14, 1, 0.28, 1');

// auroraFlow, nebulaDrift, toastBounce, confettiArc
// 使用 GSAP 内置缓动，不需要 CustomEase
export const EASINGS = {
  velvetSpring: 'velvetSpring',
  silkOut: 'silkOut',
  prismBounce: 'prismBounce',
  liquidMorph: 'liquidMorph',
  magneticPull: 'magneticPull',
  rippleExpand: 'rippleExpand',
  auroraFlow: 'sine.inOut',
  nebulaDrift: 'none',
  toastBounce: 'elastic.out(1, 0.4)',
  confettiArc: 'power2.out',
} as const;

// ================= 动画开关检测 =================

/** 检测是否应该播放动画 (三级策略) */
export function shouldAnimate(): boolean {
  // Tier 1: OS 偏好减弱动画 → 全禁
  if (get(prefersReducedMotion)) return false;
  // Tier 2: 用户关闭动画
  if (!get(settings).animEnabled) return false;
  // Tier 3: 全开
  return true;
}

/** 检测是否应该播放功能性动画 (始终启用，除非 OS 减弱) */
export function shouldAnimateFunctional(): boolean {
  return !get(prefersReducedMotion);
}

// ================= 导出 =================
export { gsap, Flip, Draggable };
