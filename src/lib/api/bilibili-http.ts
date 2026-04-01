/**
 * B站 API 底层 HTTP 工具层
 * - POST 请求 (含限流重试)
 * - GET JSON 请求 (含超时/限流)
 * - 表单数据构建
 */

import type { BiliApiResponse } from '$lib/types';
import { sleep } from '$lib/utils/timing';
import { logs } from '$lib/stores/state';

// ================= 工具函数 =================

export function buildFormData(obj: Record<string, string | number>): string {
  const entries = Object.entries(obj).map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(entries).toString();
}

/** B站限流错误码 */
const RATE_LIMIT_CODES = [-412, -429];

/** 是否为限流响应 */
function isRateLimited(json: BiliApiResponse): boolean {
  return RATE_LIMIT_CODES.includes(json.code);
}

// ================= POST API (带限流重试) =================

interface PostBiliOptions {
  /** 操作名称 (用于日志) */
  label: string;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 首次限流等待基数 (ms) */
  baseWaitMs?: number;
}

/**
 * 统一的 B站 POST API 请求 (含限流重试)
 */
export async function postBiliApi<T = unknown>(
  url: string,
  formData: string,
  opts: PostBiliOptions,
): Promise<BiliApiResponse<T>> {
  const { label, maxRetries = 3, baseWaitMs = 3000 } = opts;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res: BiliApiResponse<T> = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    }).then((r) => r.json());

    if (res.code === 0) return res;

    if (isRateLimited(res)) {
      const waitMs = baseWaitMs * Math.pow(2, attempt - 1);
      logs.add(
        `${label}被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
        'warning',
      );
      await sleep(waitMs);
      continue;
    }

    return res;
  }

  throw new Error(`${label}重试 ${maxRetries} 次仍被限流`);
}

// ================= GET JSON 请求 =================

interface FetchBiliOptions {
  /** 超时毫秒数 */
  timeoutMs?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 是否处理限流重试 (带日志) */
  handleRateLimit?: boolean;
}

/**
 * 统一的 B站 API JSON 请求
 */
export async function fetchBiliJson<T = unknown>(
  url: string,
  opts: FetchBiliOptions = {},
): Promise<BiliApiResponse<T>> {
  const {
    timeoutMs = 30000,
    maxRetries = 4,
    handleRateLimit = true,
  } = opts;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!handleRateLimit) {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      const json: BiliApiResponse<T> = await res.json();

      if (handleRateLimit && isRateLimited(json)) {
        const waitMs = 5000 * Math.pow(2, attempt - 1);
        logs.add(
          `请求被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
          'warning',
        );
        await sleep(waitMs);
        continue;
      }
      return json;
    } catch (e: unknown) {
      clearTimeout(timer);
      if (attempt < maxRetries) {
        await sleep(handleRateLimit ? 2000 * attempt : 1000 * attempt);
        continue;
      }
      throw e;
    }
  }
  throw new Error(`请求 ${maxRetries} 次均失败`);
}

/** 轻量级 JSON 请求 (只读, 短超时, 不处理限流) */
export async function lightFetchJson<T = unknown>(
  url: string,
  maxRetries = 3,
): Promise<BiliApiResponse<T>> {
  return fetchBiliJson<T>(url, { timeoutMs: 15000, maxRetries, handleRateLimit: false });
}

/** 带风控重试的 JSON 请求 */
export async function safeFetchJson<T = unknown>(
  url: string,
  maxRetries = 4,
): Promise<BiliApiResponse<T>> {
  return fetchBiliJson<T>(url, { timeoutMs: 30000, maxRetries, handleRateLimit: true });
}
