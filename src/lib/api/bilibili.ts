import type { BiliData, FavFolder, VideoResource } from '$lib/types';
import { BILIBILI_PAGE_SIZE } from '$lib/utils/constants';
import { sleep, humanDelay } from '$lib/utils/timing';
import { logs } from '$lib/stores/state';

// ================= 认证数据 =================

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

// ================= 工具函数 =================

function buildFormData(obj: Record<string, string | number>): string {
  return new URLSearchParams(obj as Record<string, string>).toString();
}

/** 轻量级 JSON 请求 (只读, 短超时) */
export async function lightFetchJson(
  url: string,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
        continue;
      }
      throw e;
    }
  }
}

/** 带风控重试的 JSON 请求 */
export async function safeFetchJson(
  url: string,
  maxRetries = 4
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json();

      if (json.code === -412 || json.code === -429) {
        const waitMs = 5000 * Math.pow(2, attempt - 1);
        logs.add(
          `请求被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
          'warning'
        );
        await sleep(waitMs);
        continue;
      }
      return json;
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (attempt < maxRetries) {
        await sleep(2000 * attempt);
        continue;
      }
      throw e;
    }
  }
}

// ================= 文件夹列表 (带缓存) =================

let _folderListCache: FavFolder[] | null = null;
let _folderListCacheTime = 0;
const FOLDER_CACHE_TTL = 300_000;

export async function getAllFoldersWithIds(
  biliData: BiliData
): Promise<FavFolder[]> {
  const now = Date.now();
  if (_folderListCache && now - _folderListCacheTime < FOLDER_CACHE_TTL) {
    return _folderListCache;
  }
  const url = `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${biliData.mid}`;
  const res = await lightFetchJson(url);
  if (res.code === 0 && res.data?.list) {
    _folderListCache = res.data.list;
    _folderListCacheTime = now;
    return res.data.list;
  }
  return [];
}

export function invalidateFolderCache(): void {
  _folderListCache = null;
  _folderListCacheTime = 0;
}

export async function getMyFolders(
  biliData: BiliData
): Promise<Record<string, number>> {
  const allFolders = await getAllFoldersWithIds(biliData);
  const folderMap: Record<string, number> = {};
  for (const f of allFolders) {
    if (f.title !== '默认收藏夹') folderMap[f.title] = f.id;
  }
  return folderMap;
}

// ================= 创建收藏夹 =================

export async function createFolder(
  title: string,
  biliData: BiliData
): Promise<number> {
  logs.add(`正在新建收藏夹：【${title}】`, 'info');
  const url = 'https://api.bilibili.com/x/v3/fav/folder/add';
  const data = buildFormData({
    title,
    privacy: 1,
    csrf: biliData.csrf,
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    }).then((r) => r.json());

    if (res.code === 0) {
      // 追加到缓存
      if (_folderListCache) {
        _folderListCache.push({
          id: res.data.id,
          fid: res.data.fid ?? res.data.id,
          mid: Number(biliData.mid),
          title,
          media_count: 0,
        });
      }
      await humanDelay(1000);
      return res.data.id;
    }

    if (res.code === -412 || res.code === -429) {
      const waitMs = 3000 * Math.pow(2, attempt - 1);
      logs.add(
        `创建收藏夹被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/3)...`,
        'warning'
      );
      await sleep(waitMs);
      continue;
    }
    throw new Error(`新建失败: ${res.message}`);
  }
  throw new Error('创建收藏夹重试 3 次仍被限流');
}

// ================= 移动视频 =================

export async function moveVideos(
  sourceMediaId: number,
  tarMediaId: number,
  resourcesStr: string,
  biliData: BiliData
): Promise<boolean> {
  const url = 'https://api.bilibili.com/x/v3/fav/resource/move';
  const payload = {
    src_media_id: sourceMediaId,
    tar_media_id: tarMediaId,
    mid: biliData.mid,
    resources: resourcesStr,
    csrf: biliData.csrf,
  };

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildFormData(payload as any),
    }).then((r) => r.json());

    if (res.code === 0) return true;

    if (res.code === -412 || res.code === -429) {
      const waitMs = 5000 * Math.pow(2, attempt - 1);
      logs.add(
        `移动操作被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/4)...`,
        'warning'
      );
      await sleep(waitMs);
      continue;
    }

    logs.add(
      `移动失败 (code ${res.code}): ${res.message || '未知错误'}`,
      'warning'
    );
    if (attempt < 4) {
      await sleep(3000 * attempt);
    }
  }
  return false;
}

// ================= 批量删除 =================

export async function batchDeleteVideos(
  mediaId: number,
  resources: string,
  biliData: BiliData
): Promise<boolean> {
  const url = 'https://api.bilibili.com/x/v3/fav/resource/batch-del';
  const data = buildFormData({
    media_id: mediaId,
    resources,
    csrf: biliData.csrf,
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    }).then((r) => r.json());

    if (res.code === 0) return true;

    if (res.code === -412 || res.code === -429) {
      const waitMs = 3000 * Math.pow(2, attempt - 1);
      logs.add(
        `删除操作被限流，等待 ${(waitMs / 1000).toFixed(0)}s 后重试 (${attempt}/3)...`,
        'warning'
      );
      await sleep(waitMs);
      continue;
    }
    return false;
  }
  logs.add('删除操作重试 3 次仍被限流', 'warning');
  return false;
}

// ================= 获取所有视频 =================

export async function fetchAllVideos(
  mediaId: number,
  fetchDelay: number,
  cancelCheck: () => boolean,
  onProgress?: (page: number, totalPages: number) => void
): Promise<VideoResource[]> {
  const allVideos: VideoResource[] = [];
  let pn = 1;
  let totalPages = 0;

  while (true) {
    if (cancelCheck()) break;

    if (pn <= 3 || pn % 10 === 0) {
      logs.add(
        `正在读取第 ${pn}${totalPages > 0 ? ` / ${totalPages}` : ''} 页...`,
        'info'
      );
    }

    const listUrl = `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${mediaId}&pn=${pn}&ps=${BILIBILI_PAGE_SIZE}&platform=web`;
    let listRes: any;
    try {
      listRes = await safeFetchJson(listUrl);
    } catch (e: any) {
      logs.add(`读取出错: ${e.message}`, 'error');
      break;
    }

    if (listRes.code !== 0) {
      logs.add(`读取出错: ${listRes.message}`, 'error');
      break;
    }

    if (pn === 1 && listRes.data?.info) {
      const totalCount = listRes.data.info.media_count || 0;
      totalPages = Math.ceil(totalCount / BILIBILI_PAGE_SIZE);
      logs.add(`收藏夹共 ${totalCount} 个视频，约 ${totalPages} 页`, 'info');
    }

    const videos: VideoResource[] = listRes.data?.medias ?? [];
    allVideos.push(...videos);

    if (onProgress) onProgress(pn, totalPages || pn);

    if (!listRes.data?.has_more || videos.length === 0) break;
    pn++;
    await humanDelay(fetchDelay);
  }

  return allVideos;
}
