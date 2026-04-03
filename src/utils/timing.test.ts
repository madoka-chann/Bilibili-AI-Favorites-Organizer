import { describe, it, expect, vi } from 'vitest';
import { backoffMs, createConcurrencyLimiter, throttle, debounce } from './timing';

describe('backoffMs', () => {
  it('doubles delay with each attempt', () => {
    expect(backoffMs(1, 100)).toBe(100);
    expect(backoffMs(2, 100)).toBe(200);
    expect(backoffMs(3, 100)).toBe(400);
  });

  it('respects maxMs cap', () => {
    expect(backoffMs(10, 100, 500)).toBe(500);
  });
});

describe('createConcurrencyLimiter', () => {
  it('limits concurrent executions', async () => {
    const limiter = createConcurrencyLimiter(2);
    let running = 0;
    let maxRunning = 0;

    const task = () =>
      limiter.run(async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((r) => setTimeout(r, 50));
        running--;
      });

    await Promise.all([task(), task(), task(), task()]);
    expect(maxRunning).toBe(2);
  });

  it('runs tasks to completion', async () => {
    const limiter = createConcurrencyLimiter(1);
    const results: number[] = [];

    await Promise.all([
      limiter.run(async () => { results.push(1); }),
      limiter.run(async () => { results.push(2); }),
      limiter.run(async () => { results.push(3); }),
    ]);

    expect(results).toEqual([1, 2, 3]);
  });
});

describe('throttle', () => {
  it('calls immediately then throttles', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe('debounce', () => {
  it('delays execution until quiet period', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
