import { isRunning, cancelRequested } from '$stores/state';

interface RunningStateOptions {
  /** 是否同时管理 cancelRequested (默认 false) */
  trackCancel?: boolean;
}

/**
 * 统一管理 isRunning / cancelRequested 的生命周期
 * 消除各操作模块中的重复 try/finally 模式
 */
export async function withRunningState<T>(
  fn: () => Promise<T>,
  opts: RunningStateOptions = {},
): Promise<T> {
  const { trackCancel = false } = opts;
  isRunning.set(true);
  if (trackCancel) cancelRequested.set(false);
  try {
    return await fn();
  } finally {
    isRunning.set(false);
    if (trackCancel) cancelRequested.set(false);
  }
}
