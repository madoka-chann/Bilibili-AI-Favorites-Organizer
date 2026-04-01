import { get } from 'svelte/store';
import type { BiliData } from '$lib/types';
import { cancelRequested, logs } from '$lib/stores/state';
import { lightFetchJson, scanAllFolderVideos } from '$lib/api/bilibili';
import { getErrorMessage } from '$lib/utils/errors';
import { formatNow } from '$lib/utils/timing';
import { triggerDownload } from '$lib/utils/download';
import { withRunningState } from '$lib/utils/running-state';

interface BackupVideoEntry {
  id: number;
  type: number;
  title: string;
  bvid: string;
  folderId: number;
  folderTitle: string;
  folderMediaCount: number;
}

export interface BackupData {
  version: string;
  time: string;
  timeLocal: string;
  mid: string;
  folders: Array<{
    id: number;
    title: string;
    media_count: number;
    videos: Array<{ id: number; type: number; title: string; bvid: string }>;
  }>;
}

/** 备份所有收藏夹 */
export async function backupFavorites(
  biliData: BiliData,
  fetchDelay: number,
): Promise<BackupData | null> {
  logs.add('正在备份收藏夹结构...', 'info');

  return withRunningState(async () => {
    try {
      const { results: videoEntries } = await scanAllFolderVideos<BackupVideoEntry>({
        biliData,
        fetchDelay,
        cancelCheck: () => get(cancelRequested),
        fetchFn: lightFetchJson,
        logPrefix: '备份',
        onVideo: (v, folder) => ({
          id: v.id,
          type: v.type,
          title: v.title,
          bvid: v.bvid || '',
          folderId: folder.id,
          folderTitle: folder.title,
          folderMediaCount: folder.media_count,
        }),
      });

      if (get(cancelRequested)) {
        logs.add('用户取消了备份', 'warning');
        return null;
      }

      // 按收藏夹分组
      const folderMap = new Map<number, BackupData['folders'][0]>();
      for (const entry of videoEntries) {
        let folderData = folderMap.get(entry.folderId);
        if (!folderData) {
          folderData = {
            id: entry.folderId,
            title: entry.folderTitle,
            media_count: entry.folderMediaCount,
            videos: [],
          };
          folderMap.set(entry.folderId, folderData);
        }
        folderData.videos.push({
          id: entry.id, type: entry.type, title: entry.title, bvid: entry.bvid,
        });
      }

      const { time, timeLocal } = formatNow();
      const backup: BackupData = {
        version: '1.0',
        time,
        timeLocal,
        mid: biliData.mid,
        folders: Array.from(folderMap.values()),
      };

      const totalVideos = backup.folders.reduce((s, f) => s + f.videos.length, 0);
      logs.add(`备份完成！${backup.folders.length} 个收藏夹，${totalVideos} 个视频`, 'success');
      return backup;
    } catch (err: unknown) {
      logs.add(`备份失败: ${getErrorMessage(err)}`, 'error');
      return null;
    }
  });
}

/** 下载备份文件 */
export function downloadBackupFile(backup: BackupData): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `bilibili-favorites-backup-${new Date().toISOString().slice(0, 10)}.json`);
}
