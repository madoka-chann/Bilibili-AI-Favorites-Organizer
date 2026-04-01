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

export const gmGetValue = <T>(key: string, defaultValue: T): T => {
  return GM_getValue(key, defaultValue);
};

export const gmSetValue = (key: string, value: unknown): void => {
  GM_setValue(key, value);
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
