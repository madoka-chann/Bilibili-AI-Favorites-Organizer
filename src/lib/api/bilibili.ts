import type {
  BiliData, FavFolder, VideoResource,
  BiliApiResponse, BiliFolderListData, BiliFavResourceData, BiliCreateFolderData,
} from '$lib/types';
import { BILIBILI_PAGE_SIZE, BILIBILI_URLS, DEFAULT_FOLDER_TITLE } from '$lib/utils/constants';
import { sleep, humanDelay } from '$lib/utils/timing';
import { logs } from '$lib/stores/state';
import { getErrorMessage } from '$lib/utils/errors';

// ================= B站 POST API (带限流重试) =================

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
 * 消除 createFolder / moveVideos / batchDeleteVideos 中的重复逻辑
 */
async function postBiliApi<T = unknown>(
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

    // 非限流错误直接返回，由调用方判断
    return res;
  }

  throw new Error(`${label}重试 ${maxRetries} 次仍被限流`);
}

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

/** B站限流错误码 */
const RATE_LIMIT_CODES = [-412, -429];

/** 是否为限流响应 */
function isRateLimited(json: BiliApiResponse): boolean {
  return RATE_LIMIT_CODES.includes(json.code);
}

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
 * - light 模式: { timeoutMs: 15000, maxRetries: 3 }
 * - safe 模式:  { timeoutMs: 30000, maxRetries: 4, handleRateLimit: true }
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
    } catch (e) {
      clearTimeout(timer);
      if (attempt < maxRetries) {
        await sleep(handleRateLimit ? 2000 * attempt : 1000 * attempt);
        continue;
      }
      throw e;
    }
  }
  // TypeScript 需要一个不可达返回
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
  const url = BILIBILI_URLS.folderList(biliData.mid);
  const res = await lightFetchJson<BiliFolderListData>(url);
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
    if (f.title !== DEFAULT_FOLDER_TITLE) folderMap[f.title] = f.id;
  }
  return folderMap;
}

// ================= 创建收藏夹 =================

export async function createFolder(
  title: string,
  biliData: BiliData
): Promise<number> {
  logs.add(`正在新建收藏夹：【${title}】`, 'info');

  const res = await postBiliApi<BiliCreateFolderData>(
    BILIBILI_URLS.folderAdd,
    buildFormData({ title, privacy: 1, csrf: biliData.csrf }),
    { label: '创建收藏夹', maxRetries: 3, baseWaitMs: 3000 },
  );

  if (res.code !== 0 || !res.data) {
    throw new Error(`新建失败: ${res.message}`);
  }

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

// ================= 移动视频 =================

export async function moveVideos(
  sourceMediaId: number,
  tarMediaId: number,
  resourcesStr: string,
  biliData: BiliData
): Promise<boolean> {
  try {
    const res = await postBiliApi(
      BILIBILI_URLS.resourceMove,
      buildFormData({
        src_media_id: sourceMediaId,
        tar_media_id: tarMediaId,
        mid: biliData.mid,
        resources: resourcesStr,
        csrf: biliData.csrf,
      }),
      { label: '移动操作', maxRetries: 4, baseWaitMs: 5000 },
    );

    if (res.code === 0) return true;
    logs.add(`移动失败 (code ${res.code}): ${res.message ?? '未知错误'}`, 'warning');
    return false;
  } catch {
    return false;
  }
}

// ================= 批量删除 =================

export async function batchDeleteVideos(
  mediaId: number,
  resources: string,
  biliData: BiliData
): Promise<boolean> {
  try {
    const res = await postBiliApi(
      BILIBILI_URLS.resourceBatchDel,
      buildFormData({ media_id: mediaId, resources, csrf: biliData.csrf }),
      { label: '删除操作', maxRetries: 3, baseWaitMs: 3000 },
    );
    return res.code === 0;
  } catch {
    logs.add('删除操作重试 3 次仍被限流', 'warning');
    return false;
  }
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
        'info',
      );
    }

    const listUrl = BILIBILI_URLS.resourceList(mediaId, pn);
    let listRes: BiliApiResponse<BiliFavResourceData>;
    try {
      listRes = await safeFetchJson<BiliFavResourceData>(listUrl);
    } catch (e: unknown) {
      logs.add(`读取出错: ${getErrorMessage(e)}`, 'error');
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

// ================= 通用收藏夹分页遍历 =================

export interface FolderScanOptions<T> {
  /** B站认证数据 */
  biliData: BiliData;
  /** 每页请求间隔 (ms) */
  fetchDelay: number;
  /** 取消检查回调 */
  cancelCheck: () => boolean;
  /** 使用的请求函数 (safeFetchJson 或 lightFetchJson) */
  fetchFn?: typeof safeFetchJson;
  /** 处理每个视频的回调，返回要收集的结果 (返回 undefined 则跳过) */
  onVideo: (video: VideoResource, folder: FavFolder) => T | undefined;
  /** 日志前缀 */
  logPrefix?: string;
}

/**
 * 遍历所有收藏夹的所有视频 (通用分页逻辑)
 * 消除 dead-videos / duplicates / backup 中的重复分页代码
 */
export async function scanAllFolderVideos<T>(
  opts: FolderScanOptions<T>,
): Promise<{ results: T[]; totalScanned: number }> {
  const {
    biliData, fetchDelay, cancelCheck,
    fetchFn = safeFetchJson, onVideo, logPrefix = '扫描',
  } = opts;

  const allFolders = await getAllFoldersWithIds(biliData);
  logs.add(`共 ${allFolders.length} 个收藏夹，开始逐个${logPrefix}...`, 'info');

  const results: T[] = [];
  let totalScanned = 0;

  for (let fi = 0; fi < allFolders.length; fi++) {
    if (cancelCheck()) break;
    const folder = allFolders[fi];
    logs.add(`${logPrefix} [${fi + 1}/${allFolders.length}] ${folder.title}...`, 'info');

    let pn = 1;
    while (true) {
      if (cancelCheck()) break;
      try {
        const res = await fetchFn<BiliFavResourceData>(
          BILIBILI_URLS.resourceList(folder.id, pn),
        );
        if (res.code !== 0) break;
        const medias = res.data?.medias ?? [];
        for (const v of medias) {
          totalScanned++;
          const item = onVideo(v as VideoResource, folder);
          if (item !== undefined) results.push(item);
        }
        if (!res.data?.has_more || medias.length === 0) break;
        pn++;
        await humanDelay(fetchDelay);
      } catch (e: unknown) {
        logs.add(
          `${logPrefix} ${folder.title} 出错: ${getErrorMessage(e)}，跳过`,
          'warning',
        );
        break;
      }
    }
    await humanDelay(fetchDelay);
  }

  return { results, totalScanned };
}
