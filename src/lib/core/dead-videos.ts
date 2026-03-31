import { get } from 'svelte/store';
import type { BiliData, BiliFavResourceData } from '$lib/types';
import { isRunning, cancelRequested, logs } from '$lib/stores/state';
import {
  getAllFoldersWithIds, getMyFolders, createFolder,
  moveVideos, batchDeleteVideos, safeFetchJson,
} from '$lib/api/bilibili';
import { humanDelay } from '$lib/utils/timing';
import { isDeadVideo } from '$lib/utils/dom';
import { BILIBILI_PAGE_SIZE } from '$lib/utils/constants';

const DEAD_VIDEO_FOLDER_NAME = '失效视频归档';

export interface DeadVideoEntry {
  id: number;
  type: number;
  title: string;
  folderId: number;
  folderTitle: string;
}

/** 扫描所有收藏夹中的失效视频 */
export async function scanDeadVideos(
  biliData: BiliData,
  fetchDelay: number,
): Promise<DeadVideoEntry[]> {
  const isCancelled = () => get(cancelRequested);

  logs.add('正在扫描所有收藏夹中的失效视频...', 'info');
  const allFolders = await getAllFoldersWithIds(biliData);
  logs.add(`共 ${allFolders.length} 个收藏夹，开始逐个扫描...`, 'info');

  const deadVideos: DeadVideoEntry[] = [];
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
        for (const v of medias) {
          totalScanned++;
          if (isDeadVideo(v)) {
            deadVideos.push({
              id: v.id,
              type: v.type ?? 2,
              title: v.title || `ID:${v.id}`,
              folderId: folder.id,
              folderTitle: folder.title,
            });
          }
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

  logs.add(`扫描完成，共扫描 ${totalScanned} 个视频`, 'info');
  return deadVideos;
}

/** 将失效视频移动到专用归档收藏夹 */
export async function archiveDeadVideos(
  deadVideos: DeadVideoEntry[],
  biliData: BiliData,
  moveChunkSize: number,
  writeDelay: number,
): Promise<number> {
  const isCancelled = () => get(cancelRequested);

  // 获取或创建归档收藏夹
  const existingFolders = await getMyFolders(biliData);
  let targetFolderId = existingFolders[DEAD_VIDEO_FOLDER_NAME];
  if (!targetFolderId) {
    targetFolderId = await createFolder(DEAD_VIDEO_FOLDER_NAME, biliData);
    logs.add(`已创建专用收藏夹「${DEAD_VIDEO_FOLDER_NAME}」`, 'info');
    await humanDelay(writeDelay);
  }

  // 按来源收藏夹分组
  const bySource: Record<number, DeadVideoEntry[]> = {};
  for (const v of deadVideos) {
    if (!bySource[v.folderId]) bySource[v.folderId] = [];
    bySource[v.folderId].push(v);
  }

  let moved = 0;
  for (const [srcIdStr, vids] of Object.entries(bySource)) {
    if (isCancelled()) break;
    const srcId = Number(srcIdStr);
    for (let i = 0; i < vids.length; i += moveChunkSize) {
      if (isCancelled()) break;
      const chunk = vids.slice(i, i + moveChunkSize);
      const resourcesStr = chunk.map((v) => `${v.id}:${v.type}`).join(',');
      const success = await moveVideos(srcId, targetFolderId, resourcesStr, biliData);
      if (success) moved += chunk.length;
      await humanDelay(writeDelay);
    }
    logs.add(`已从「${vids[0]?.folderTitle || srcIdStr}」移动 ${vids.length} 个失效视频`, 'info');
  }

  return moved;
}

/** 直接删除失效视频 */
export async function deleteDeadVideos(
  deadVideos: DeadVideoEntry[],
  biliData: BiliData,
  writeDelay: number,
): Promise<number> {
  const isCancelled = () => get(cancelRequested);

  // 按来源收藏夹分组
  const bySource: Record<number, DeadVideoEntry[]> = {};
  for (const v of deadVideos) {
    if (!bySource[v.folderId]) bySource[v.folderId] = [];
    bySource[v.folderId].push(v);
  }

  let deleted = 0;
  for (const [srcIdStr, vids] of Object.entries(bySource)) {
    if (isCancelled()) break;
    const resources = vids.map((v) => `${v.id}:${v.type}`).join(',');
    const success = await batchDeleteVideos(Number(srcIdStr), resources, biliData);
    if (success) deleted += vids.length;
    await humanDelay(writeDelay);
  }

  return deleted;
}
