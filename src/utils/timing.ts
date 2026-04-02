/** 延迟指定毫秒 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 人性化延迟：在基准值上加 ±30% 随机抖动 */
export function humanDelay(baseMs: number): Promise<void> {
  const jitter = baseMs * 0.3;
  const delay = baseMs + (Math.random() * 2 - 1) * jitter;
  return sleep(Math.max(0, Math.round(delay)));
}

/** 防抖函数 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

/** 节流函数 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= delayMs) {
      last = now;
      fn(...args);
    }
  };
}

/** 生成统一的时间戳对 (ISO + 本地化) */
export function formatNow(): { time: string; timeLocal: string } {
  const now = new Date();
  return {
    time: now.toISOString(),
    timeLocal: now.toLocaleString('zh-CN'),
  };
}

/** 计算指数退避延迟 (ms) */
export function backoffMs(attempt: number, baseMs: number, maxMs = Infinity): number {
  return Math.min(baseMs * Math.pow(2, attempt - 1), maxMs);
}

/** 创建并发限制器 */
export function createConcurrencyLimiter(maxConcurrent: number) {
  let running = 0;
  const queue: Array<() => void> = [];

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (running >= maxConcurrent) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    running++;
    try {
      return await fn();
    } finally {
      running--;
      const next = queue.shift();
      if (next) next();
    }
  }

  return { run };
}
