import { get } from 'svelte/store';
import type { BiliData } from '$types/index';
import { cancelRequested, logs } from '$stores/state';
import {
  getMyFolders, createFolder,
  moveVideos, batchDeleteVideos, scanAllFolderVideos,
} from '$api/bilibili';
import { humanDelay } from '$utils/timing';
import { isDeadVideo } from '$utils/dom';
import { groupBy } from '$utils/collections';
import { DEAD_ARCHIVE_FOLDER, DEFAULT_VIDEO_TYPE } from '$utils/constants';

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
  logs.add('正在扫描所有收藏夹中的失效视频...', 'info');

  const { results: deadVideos, totalScanned } = await scanAllFolderVideos<DeadVideoEntry>({
    biliData,
    fetchDelay,
    cancelCheck: () => get(cancelRequested),
    logPrefix: '扫描',
    onVideo: (v, folder) => {
      if (isDeadVideo(v)) {
        return {
          id: v.id,
          type: v.type ?? DEFAULT_VIDEO_TYPE,
          title: v.title || `ID:${v.id}`,
          folderId: folder.id,
          folderTitle: folder.title,
        };
      }
      return undefined;
    },
  });

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
  let targetFolderId = existingFolders[DEAD_ARCHIVE_FOLDER];
  if (!targetFolderId) {
    targetFolderId = await createFolder(DEAD_ARCHIVE_FOLDER, biliData);
    logs.add(`已创建专用收藏夹「${DEAD_ARCHIVE_FOLDER}」`, 'info');
    await humanDelay(writeDelay);
  }

  // 按来源收藏夹分组
  const bySource = groupBy(deadVideos, (v) => v.folderId);

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
  const bySource = groupBy(deadVideos, (v) => v.folderId);

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
