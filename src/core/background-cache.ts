/**
 * 后台缓存扫描 — 在所有 B站页面静默运行
 * 不依赖 Svelte stores；getMidFromCookie 来自 bilibili-auth (无 store 依赖)
 */

import { gmGetValue, gmSetValue } from '$utils/gm';
import type { FavFolder, GlobalVideoCache, BiliApiResponse, BiliFolderListData } from '$types/index';
import { BILIBILI_URLS } from '$utils/constants';
import { getMidFromCookie } from '$api/bilibili-auth';

const CACHE_KEY = 'bfao_bg_folder_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const SCAN_INTERVAL = 15 * 60 * 1000; // 15 min

async function fetchJson<T = unknown>(url: string): Promise<BiliApiResponse<T> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json() as BiliApiResponse<T>;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function fetchFolderList(mid: string): Promise<FavFolder[]> {
  const url = BILIBILI_URLS.folderList(mid);
  const res = await fetchJson<BiliFolderListData>(url);
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

let intervalId: ReturnType<typeof setInterval> | null = null;
let initialTimeoutId: ReturnType<typeof setTimeout> | null = null;
let scanInProgress = false;

/** 带重入保护的扫描 — 防止上次扫描未完成时再次触发 */
async function safeScan(): Promise<void> {
  if (scanInProgress) return;
  scanInProgress = true;
  try {
    await scanAndCache();
  } catch (e: unknown) {
    if (import.meta.env.DEV) console.warn('[bg-cache] scan failed:', e);
  } finally {
    scanInProgress = false;
  }
}

export function setupBackgroundCache(): void {
  // Prevent duplicate intervals if called multiple times
  if (intervalId !== null) return;

  // Initial scan after a short delay to avoid blocking page load
  initialTimeoutId = setTimeout(safeScan, 5000);

  // Periodic rescan
  intervalId = setInterval(safeScan, SCAN_INTERVAL);
}

export function stopBackgroundCache(): void {
  if (initialTimeoutId !== null) {
    clearTimeout(initialTimeoutId);
    initialTimeoutId = null;
  }
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  // 重置扫描标记，确保 stop→setup 后不会因残留 flag 阻塞新扫描
  scanInProgress = false;
}
