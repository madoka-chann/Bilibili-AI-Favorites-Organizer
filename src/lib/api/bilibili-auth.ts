/**
 * B站认证与页面上下文
 */

import type { BiliData } from '$lib/types';

/** 从 cookie 获取认证数据 */
export function getBiliData(): BiliData {
  const midMatch = document.cookie.match(/DedeUserID=([^;]+)/);
  const csrfMatch = document.cookie.match(/bili_jct=([^;]+)/);
  return {
    mid: midMatch ? midMatch[1] : '',
    csrf: csrfMatch ? csrfMatch[1] : '',
  };
}

/** 从 URL 获取当前收藏夹 ID */
export function getSourceMediaId(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromSearch =
    params.get('fid') || params.get('media_id') || params.get('id');
  if (fromSearch) return fromSearch;

  // B站新版 hash 路由
  const hash = window.location.hash;
  if (hash) {
    const hashQuery =
      hash.indexOf('?') !== -1 ? hash.substring(hash.indexOf('?')) : '';
    if (hashQuery) {
      const hashParams = new URLSearchParams(hashQuery);
      return (
        hashParams.get('fid') ||
        hashParams.get('media_id') ||
        hashParams.get('id') ||
        null
      );
    }
  }
  return null;
}
