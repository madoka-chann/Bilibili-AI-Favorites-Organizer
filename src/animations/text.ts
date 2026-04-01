/**
 * 文字特效动画工具函数
 * Plan Phase 2 - Section H: 文字特效
 */
import { shouldAnimate } from './gsap-config';

// 用于文字解码效果的字符集
const DECODE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFabcdef';

/**
 * H1: 文字解码效果
 * 纯 JS 字符乱码 → 逐位解码为真实文字
 * 适用于 LogArea 新日志条目
 */
export function textDecode(
  el: HTMLElement,
  opts: { duration?: number; charDelay?: number } = {}
): { destroy: () => void } {
  if (!shouldAnimate()) return { destroy() {} };

  const finalText = el.textContent ?? '';
  if (!finalText) return { destroy() {} };

  const charDelay = opts.charDelay ?? 25;
  const totalChars = finalText.length;
  let resolved = 0;
  let rafId: number | null = null;
  let destroyed = false;

  // 初始化为全乱码
  el.textContent = scramble(finalText, 0);

  let lastTime = performance.now();

  function step(now: number) {
    if (destroyed) return;

    if (now - lastTime >= charDelay) {
      resolved++;
      lastTime = now;

      if (resolved >= totalChars) {
        el.textContent = finalText;
        return;
      }

      el.textContent = scramble(finalText, resolved);
    }

    rafId = requestAnimationFrame(step);
  }

  rafId = requestAnimationFrame(step);

  return {
    destroy() {
      destroyed = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      el.textContent = finalText;
    },
  };
}

/** 生成部分解码的字符串：前 resolved 位为真实字符，后面为随机字符 */
function scramble(text: string, resolved: number): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    if (i < resolved || text[i] === ' ') {
      result += text[i];
    } else {
      result += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
    }
  }
  return result;
}

/**
 * H2: 数字翻滚效果
 * 从 0 平滑计数到目标值，带弹跳
 * 适用于 StatsDialog 统计数字
 */
export function numberRoll(
  el: HTMLElement,
  targetValue: number,
  opts: { duration?: number; suffix?: string; useLocale?: boolean } = {}
): { destroy: () => void } {
  if (!shouldAnimate()) {
    el.textContent = formatNumber(targetValue, opts.suffix, opts.useLocale);
    return { destroy() {} };
  }

  const duration = opts.duration ?? 800;
  const startTime = performance.now();
  let rafId: number | null = null;
  let destroyed = false;

  function step(now: number) {
    if (destroyed) return;

    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(targetValue * eased);

    el.textContent = formatNumber(current, opts.suffix, opts.useLocale);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    }
  }

  rafId = requestAnimationFrame(step);

  return {
    destroy() {
      destroyed = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      el.textContent = formatNumber(targetValue, opts.suffix, opts.useLocale);
    },
  };
}

function formatNumber(
  value: number,
  suffix?: string,
  useLocale?: boolean
): string {
  const formatted = useLocale ? value.toLocaleString() : String(value);
  return suffix ? formatted + suffix : formatted;
}
