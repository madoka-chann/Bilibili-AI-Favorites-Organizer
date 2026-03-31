import { get } from 'svelte/store';
import type { BiliData, FavFolder } from '$lib/types';
import { isRunning, cancelRequested, logs } from '$lib/stores/state';
import { getAllFoldersWithIds, lightFetchJson } from '$lib/api/bilibili';
import { humanDelay } from '$lib/utils/timing';
import { BILIBILI_PAGE_SIZE } from '$lib/utils/constants';

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
  isRunning.set(true);
  cancelRequested.set(false);
  logs.add('正在备份收藏夹结构...', 'info');

  const isCancelled = () => get(cancelRequested);

  try {
    const allFolders = await getAllFoldersWithIds(biliData);
    const backup: BackupData = {
      version: '1.0',
      time: new Date().toISOString(),
      timeLocal: new Date().toLocaleString('zh-CN'),
      mid: biliData.mid,
      folders: [],
    };

    for (let i = 0; i < allFolders.length; i++) {
      if (isCancelled()) {
        logs.add('用户取消了备份', 'warning');
        return null;
      }

      const folder = allFolders[i];
      const totalPages = Math.ceil((folder.media_count || 0) / BILIBILI_PAGE_SIZE) || 1;
      const folderData: BackupData['folders'][0] = {
        id: folder.id,
        title: folder.title,
        media_count: folder.media_count,
        videos: [],
      };

      logs.add(`备份 [${i + 1}/${allFolders.length}] ${folder.title} (约${totalPages}页)...`, 'info');

      let pn = 1;
      while (true) {
        if (isCancelled()) break;
        try {
          const res = await lightFetchJson(
            `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=${BILIBILI_PAGE_SIZE}&platform=web`,
          );
          if (res.code !== 0) break;
          const medias = res.data?.medias ?? [];
          for (const v of medias) {
            folderData.videos.push({ id: v.id, type: v.type, title: v.title, bvid: v.bvid || '' });
          }
          if (pn > 1) {
            logs.add(`  ${folder.title} 第 ${pn}/${totalPages} 页，已获取 ${folderData.videos.length} 个视频`, 'info');
          }
          if (!res.data?.has_more || medias.length === 0) break;
          pn++;
          await humanDelay(fetchDelay);
        } catch (e: any) {
          logs.add(`备份 ${folder.title} 第 ${pn} 页失败: ${e.message}，跳过后续页`, 'warning');
          break;
        }
      }

      backup.folders.push(folderData);
      logs.add(`  ${folder.title}: ${folderData.videos.length} 个视频`, 'success');
      await humanDelay(fetchDelay);
    }

    const totalVideos = backup.folders.reduce((s, f) => s + f.videos.length, 0);
    logs.add(`备份完成！${backup.folders.length} 个收藏夹，${totalVideos} 个视频`, 'success');
    return backup;
  } catch (err: any) {
    logs.add(`备份失败: ${err.message}`, 'error');
    return null;
  } finally {
    isRunning.set(false);
    cancelRequested.set(false);
  }
}

/** 下载备份文件 */
export function downloadBackupFile(backup: BackupData): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bilibili-favorites-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
