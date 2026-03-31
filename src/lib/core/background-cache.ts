/**
 * 后台缓存扫描 — 在所有 B站页面静默运行
 * 不依赖 Svelte stores，不 import bilibili.ts（它依赖 logs store）
 */

import { gmGetValue, gmSetValue } from '$lib/utils/gm';
import type { FavFolder, GlobalVideoCache } from '$lib/types';
import { BILIBILI_URLS } from '$lib/utils/constants';

const CACHE_KEY = 'bfao_bg_folder_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const SCAN_INTERVAL = 15 * 60 * 1000; // 15 min

function getMidFromCookie(): string {
  const match = document.cookie.match(/DedeUserID=([^;]+)/);
  return match ? match[1] : '';
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function fetchFolderList(mid: string): Promise<FavFolder[]> {
  const url = BILIBILI_URLS.folderList(mid);
  const res = await fetchJson(url);
  if (res?.code === 0 && res.data?.list) {
    return res.data.list;
  }
  return [];
}

async function scanAndCache(): Promise<void> {
  const mid = getMidFromCookie();
  if (!mid) return;

  const existing = gmGetValue<GlobalVideoCache>(CACHE_KEY, {});
  const folders = await fetchFolderList(mid);
  if (folders.length === 0) return;

  const now = Date.now();

  // Update folder metadata in cache, keep existing video data if fresh
  for (const folder of folders) {
    const key = String(folder.id);
    const cached = existing[key];
    if (cached && now - cached.cachedAt < CACHE_TTL) continue;

    existing[key] = {
      title: folder.title,
      media_count: folder.media_count,
      videos: cached?.videos ?? [],
      cachedAt: now,
    };
  }

  gmSetValue(CACHE_KEY, existing);
}

export function setupBackgroundCache(): void {
  // Initial scan after a short delay to avoid blocking page load
  setTimeout(() => {
    scanAndCache().catch(() => {});
  }, 5000);

  // Periodic rescan
  setInterval(() => {
    scanAndCache().catch(() => {});
  }, SCAN_INTERVAL);
}
