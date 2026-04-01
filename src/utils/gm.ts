/**
 * Tampermonkey GM_* API 类型安全封装
 * vite-plugin-monkey 会在构建时自动处理这些全局变量
 */

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_addStyle(css: string): void;
declare function GM_xmlhttpRequest(details: GMXMLHttpRequestDetails): void;

export interface GMXMLHttpRequestDetails {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  data?: string;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob';
  onload?: (response: GMXMLHttpResponse) => void;
  onerror?: (response: GMXMLHttpResponse) => void;
  ontimeout?: () => void;
}

export interface GMXMLHttpResponse {
  status: number;
  statusText: string;
  responseText: string;
  response: unknown;
  responseHeaders: string;
  finalUrl: string;
}

/**
 * 内存缓存层 — 避免对同一 key 的重复 GM_getValue 调用。
 * GM_getValue 虽然是同步的，但在某些 Tampermonkey 实现中存在
 * JSON parse 开销；缓存可消除同一会话内的冗余反序列化。
 */
const gmCache = new Map<string, unknown>();

export const gmGetValue = <T>(key: string, defaultValue: T): T => {
  if (gmCache.has(key)) return gmCache.get(key) as T;
  const val = GM_getValue(key, defaultValue);
  gmCache.set(key, val);
  return val;
};

export const gmSetValue = (key: string, value: unknown): void => {
  gmCache.set(key, value);
  GM_setValue(key, value);
};

/** 清除单个缓存条目 (用于强制重新读取) */
export const gmCacheInvalidate = (key: string): void => {
  gmCache.delete(key);
};

export const gmAddStyle = (css: string): void => {
  GM_addStyle(css);
};

export const gmXmlHttpRequest = (details: GMXMLHttpRequestDetails): void => {
  GM_xmlhttpRequest(details);
};

/** 封装为 Promise 的 HTTP 请求 */
export function gmFetch(
  url: string,
  options: {
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  } = {}
): Promise<GMXMLHttpResponse> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method ?? 'GET',
      url,
      headers: options.headers,
      data: options.body,
      timeout: options.timeout ?? 30_000,
      onload: resolve,
      onerror: reject,
      ontimeout: () => reject(new Error(`Request timeout: ${url}`)),
    });
  });
}
