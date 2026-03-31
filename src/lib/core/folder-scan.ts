/**
 * 共享的收藏夹视频扫描逻辑
 * dead-videos.ts 和 duplicates.ts 都需要逐个扫描所有收藏夹的视频
 */

import { get } from 'svelte/store';
import type { BiliData, BiliFavResourceData, FavFolder, VideoResource } from '$lib/types';
import { cancelRequested, logs } from '$lib/stores/state';
import { getAllFoldersWithIds, safeFetchJson } from '$lib/api/bilibili';
import { humanDelay } from '$lib/utils/timing';
import { BILIBILI_PAGE_SIZE } from '$lib/utils/constants';

export interface FolderVideoVisit {
  video: VideoResource;
  folder: FavFolder;
}

/**
 * 扫描所有收藏夹中的视频，对每个视频调用 visitor 回调。
 * 返回扫描的视频总数。
 */
export async function scanAllFolderVideos(
  biliData: BiliData,
  fetchDelay: number,
  visitor: (visit: FolderVideoVisit) => void,
): Promise<number> {
  const isCancelled = () => get(cancelRequested);

  const allFolders = await getAllFoldersWithIds(biliData);
  logs.add(`共 ${allFolders.length} 个收藏夹，开始逐个扫描...`, 'info');

  let totalScanned = 0;

  for (let fi = 0; fi < allFolders.length; fi++) {
    if (isCancelled()) break;
    const folder = allFolders[fi];
    logs.add(`扫描 [${fi + 1}/${allFolders.length}] ${folder.title}...`, 'info');

    let pn = 1;
    while (true) {
      if (isCancelled()) break;
      try {
        const res = await safeFetchJson<BiliFavResourceData>(
          `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=${BILIBILI_PAGE_SIZE}&platform=web`,
        );
        if (res.code !== 0) break;
        const medias = res.data?.medias ?? [];
        for (const video of medias) {
          totalScanned++;
          visitor({ video, folder });
        }
        if (!res.data?.has_more || medias.length === 0) break;
        pn++;
        await humanDelay(fetchDelay);
      } catch (e) {
        logs.add(`扫描 ${folder.title} 出错: ${e instanceof Error ? e.message : String(e)}，跳过`, 'warning');
        break;
      }
    }
    await humanDelay(fetchDelay);
  }

  return totalScanned;
}
