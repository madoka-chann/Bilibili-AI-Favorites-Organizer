/**
 * 通用收藏夹分页遍历器
 * 消除 dead-videos / duplicates / backup 中的重复分页代码
 */

import type { BiliData, FavFolder, VideoResource, BiliFavResourceData } from '$types/index';
import { humanDelay } from '$utils/timing';
import { logs } from '$stores/state';
import { getErrorMessage } from '$utils/errors';
import { BILIBILI_URLS } from '$utils/constants';
import { safeFetchJson } from './bilibili-http';
import { getAllFoldersWithIds } from './bilibili-folders';

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
  const MAX_PAGES = 500; // 安全上限：与 fetchAllVideos 一致

  for (let fi = 0; fi < allFolders.length; fi++) {
    if (cancelCheck()) break;
    const folder = allFolders[fi];
    logs.add(`${logPrefix} [${fi + 1}/${allFolders.length}] ${folder.title}...`, 'info');

    let pn = 1;
    while (pn <= MAX_PAGES) {
      if (cancelCheck()) break;
      try {
        const res = await fetchFn<BiliFavResourceData>(
          BILIBILI_URLS.resourceList(folder.id, pn),
        );
        if (res.code !== 0 || !res.data) break;
        const medias = res.data.medias ?? [];
        if (medias.length === 0) break;
        for (const v of medias) {
          totalScanned++;
          const item = onVideo(v as VideoResource, folder);
          if (item !== undefined) results.push(item);
        }
        if (!res.data.has_more) break;
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
    if (fi < allFolders.length - 1) await humanDelay(fetchDelay);
  }

  return { results, totalScanned };
}
