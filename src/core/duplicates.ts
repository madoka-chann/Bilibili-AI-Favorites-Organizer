import { get } from 'svelte/store';
import type { BiliData } from '$types/index';
import { cancelRequested, logs } from '$stores/state';
import { batchDeleteVideos, scanAllFolderVideos } from '$api/bilibili';
import { humanDelay } from '$utils/timing';
import { DEFAULT_VIDEO_TYPE } from '$utils/constants';

interface VideoFolderRecord {
  folderTitle: string;
  folderId: number;
  videoTitle: string;
  videoType: number;
}

export interface DuplicateEntry {
  id: number;
  type: number;
  title: string;
  folders: string[];
  folderIds: number[];
}

/** 扫描所有收藏夹查找重复视频 */
export async function scanDuplicates(
  biliData: BiliData,
  fetchDelay: number,
): Promise<DuplicateEntry[]> {
  logs.add('正在扫描所有收藏夹...', 'info');

  const videoFolderMap: Record<number, VideoFolderRecord[]> = {};

  const { totalScanned } = await scanAllFolderVideos<void>({
    biliData,
    fetchDelay,
    cancelCheck: () => get(cancelRequested),
    logPrefix: '扫描',
    onVideo: (v, folder) => {
      if (!videoFolderMap[v.id]) videoFolderMap[v.id] = [];
      videoFolderMap[v.id].push({
        folderTitle: folder.title,
        folderId: folder.id,
        videoTitle: v.title,
        videoType: v.type ?? DEFAULT_VIDEO_TYPE,
      });
      return undefined;
    },
  });

  logs.add(`扫描完成，共收集 ${totalScanned} 条视频记录`, 'info');

  const duplicates: DuplicateEntry[] = [];
  for (const [vidStr, entries] of Object.entries(videoFolderMap)) {
    if (entries.length >= 2) {
      duplicates.push({
        id: Number(vidStr),
        type: entries[0].videoType,
        title: entries[0].videoTitle,
        folders: entries.map((e) => e.folderTitle),
        folderIds: entries.map((e) => e.folderId),
      });
    }
  }

  return duplicates;
}

/** 执行去重：保留首次出现，删除其余副本 */
export async function deduplicateVideos(
  duplicates: DuplicateEntry[],
  biliData: BiliData,
  writeDelay: number,
): Promise<number> {
  const isCancelled = () => get(cancelRequested);

  let removed = 0;
  for (let i = 0; i < duplicates.length; i++) {
    if (isCancelled()) break;
    const d = duplicates[i];
    // 保留第一个收藏夹，从其余收藏夹删除
    for (let fi = 1; fi < d.folderIds.length; fi++) {
      const resource = `${d.id}:${d.type}`;
      const success = await batchDeleteVideos(d.folderIds[fi], resource, biliData);
      if (success) removed++;
      await humanDelay(writeDelay);
    }
    if ((i + 1) % 10 === 0 || i === duplicates.length - 1) {
      logs.add(`去重进度：${i + 1}/${duplicates.length}（已删除 ${removed} 个副本）`, 'info');
    }
  }

  return removed;
}
