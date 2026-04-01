/**
 * B站收藏夹操作 (列表查询 + 创建 + 缓存)
 */

import type { BiliData, FavFolder, BiliFolderListData, BiliCreateFolderData } from '$lib/types';
import { BILIBILI_URLS, DEFAULT_FOLDER_TITLE } from '$lib/utils/constants';
import { humanDelay } from '$lib/utils/timing';
import { logs } from '$lib/stores/state';
import { lightFetchJson, postBiliApi, buildFormData } from './bilibili-http';

// ================= 文件夹列表 (带缓存) =================

let _folderListCache: FavFolder[] | null = null;
let _folderListCacheTime = 0;
const FOLDER_CACHE_TTL = 300_000;

export async function getAllFoldersWithIds(
  biliData: BiliData,
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
  biliData: BiliData,
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
  biliData: BiliData,
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
