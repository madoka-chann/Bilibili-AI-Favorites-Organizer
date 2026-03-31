import { get } from 'svelte/store';
import type { BiliData } from '$lib/types';
import { cancelRequested, logs } from '$lib/stores/state';
import { getMyFolders, createFolder, moveVideos, batchDeleteVideos } from '$lib/api/bilibili';
import { humanDelay } from '$lib/utils/timing';
import { isDeadVideo } from '$lib/utils/dom';
import { scanAllFolderVideos } from './folder-scan';

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
  logs.add('正在扫描所有收藏夹中的失效视频...', 'info');

  const deadVideos: DeadVideoEntry[] = [];
  const totalScanned = await scanAllFolderVideos(biliData, fetchDelay, ({ video, folder }) => {
    if (isDeadVideo(video)) {
      deadVideos.push({
        id: video.id,
        type: video.type ?? 2,
        title: video.title || `ID:${video.id}`,
        folderId: folder.id,
        folderTitle: folder.title,
      });
    }
  });

  logs.add(`扫描完成，共扫描 ${totalScanned} 个视频`, 'info');
  return deadVideos;
}

/** 按来源收藏夹分组 */
function groupBySource(deadVideos: DeadVideoEntry[]): Record<number, DeadVideoEntry[]> {
  const bySource: Record<number, DeadVideoEntry[]> = {};
  for (const v of deadVideos) {
    (bySource[v.folderId] ??= []).push(v);
  }
  return bySource;
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

  let moved = 0;
  for (const [srcIdStr, vids] of Object.entries(groupBySource(deadVideos))) {
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

  let deleted = 0;
  for (const [srcIdStr, vids] of Object.entries(groupBySource(deadVideos))) {
    if (isCancelled()) break;
    const resources = vids.map((v) => `${v.id}:${v.type}`).join(',');
    const success = await batchDeleteVideos(Number(srcIdStr), resources, biliData);
    if (success) deleted += vids.length;
    await humanDelay(writeDelay);
  }

  return deleted;
}
