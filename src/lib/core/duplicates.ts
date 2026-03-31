import { get } from 'svelte/store';
import type { BiliData } from '$lib/types';
import { cancelRequested, logs } from '$lib/stores/state';
import { getAllFoldersWithIds, safeFetchJson, batchDeleteVideos } from '$lib/api/bilibili';
import { humanDelay } from '$lib/utils/timing';
import { BILIBILI_PAGE_SIZE } from '$lib/utils/constants';

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
  const isCancelled = () => get(cancelRequested);

  logs.add('正在扫描所有收藏夹...', 'info');
  const allFolders = await getAllFoldersWithIds(biliData);
  logs.add(`共 ${allFolders.length} 个收藏夹，开始逐个扫描...`, 'info');

  const videoFolderMap: Record<number, Array<{
    folderTitle: string;
    folderId: number;
    videoTitle: string;
    videoType: number;
  }>> = {};
  let totalScanned = 0;

  for (let fi = 0; fi < allFolders.length; fi++) {
    if (isCancelled()) break;
    const folder = allFolders[fi];
    logs.add(`扫描 [${fi + 1}/${allFolders.length}] ${folder.title}...`, 'info');

    let pn = 1;
    while (true) {
      if (isCancelled()) break;
      try {
        const res = await safeFetchJson(
          `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=${BILIBILI_PAGE_SIZE}&platform=web`,
        );
        if (res.code !== 0) break;
        const medias = res.data?.medias ?? [];
        for (const v of medias) {
          if (!videoFolderMap[v.id]) videoFolderMap[v.id] = [];
          videoFolderMap[v.id].push({
            folderTitle: folder.title,
            folderId: folder.id,
            videoTitle: v.title,
            videoType: v.type ?? 2,
          });
        }
        totalScanned += medias.length;
        if (!res.data?.has_more || medias.length === 0) break;
        pn++;
        await humanDelay(fetchDelay);
      } catch (e: any) {
        logs.add(`扫描 ${folder.title} 出错: ${e.message}，跳过`, 'warning');
        break;
      }
    }
    await humanDelay(fetchDelay);
  }

  logs.add(`扫描完成，共收集 ${totalScanned} 条视频记录`, 'info');

  // 找重复
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
