/**
 * B站视频操作 (移动 / 删除 / 拉取)
 */

import type { BiliData, VideoResource, BiliApiResponse, BiliFavResourceData } from '$types/index';
import { BILIBILI_PAGE_SIZE, BILIBILI_URLS, MAX_BILIBILI_PAGES } from '$utils/constants';
import { humanDelay } from '$utils/timing';
import { logs } from '$stores/state';
import { getErrorMessage } from '$utils/errors';
import { postBiliApi, buildFormData, safeFetchJson } from './bilibili-http';

// ================= 移动视频 =================

export async function moveVideos(
  sourceMediaId: number,
  tarMediaId: number,
  resourcesStr: string,
  biliData: BiliData,
): Promise<boolean> {
  try {
    const res = await postBiliApi(
      BILIBILI_URLS.resourceMove,
      buildFormData({
        src_media_id: sourceMediaId,
        tar_media_id: tarMediaId,
        mid: biliData.mid,
        resources: resourcesStr,
        csrf: biliData.csrf,
      }),
      { label: '移动操作', maxRetries: 4, baseWaitMs: 5000 },
    );

    if (res.code === 0) return true;
    logs.add(`移动失败 (code ${res.code}): ${res.message ?? '未知错误'}`, 'warning');
    return false;
  } catch (e: unknown) {
    logs.add(`移动操作异常: ${getErrorMessage(e)}`, 'error');
    return false;
  }
}

// ================= 批量删除 =================

export async function batchDeleteVideos(
  mediaId: number,
  resources: string,
  biliData: BiliData,
): Promise<boolean> {
  try {
    const res = await postBiliApi(
      BILIBILI_URLS.resourceBatchDel,
      buildFormData({ media_id: mediaId, resources, csrf: biliData.csrf }),
      { label: '删除操作', maxRetries: 3, baseWaitMs: 3000 },
    );
    return res.code === 0;
  } catch (e: unknown) {
    logs.add(`删除操作失败: ${getErrorMessage(e)}`, 'error');
    return false;
  }
}

// ================= 获取所有视频 =================

export async function fetchAllVideos(
  mediaId: number,
  fetchDelay: number,
  cancelCheck: () => boolean,
  onProgress?: (page: number, totalPages: number) => void,
  maxVideos?: number,
): Promise<VideoResource[]> {
  const allVideos: VideoResource[] = [];
  let pn = 1;
  let totalPages = 0;
  while (pn <= MAX_BILIBILI_PAGES) {
    if (cancelCheck()) break;
    if (maxVideos && allVideos.length >= maxVideos) break;

    if (pn <= 3 || pn % 10 === 0) {
      logs.add(
        `正在读取第 ${pn}${totalPages > 0 ? ` / ${totalPages}` : ''} 页...`,
        'info',
      );
    }

    const listUrl = BILIBILI_URLS.resourceList(mediaId, pn);
    let listRes: BiliApiResponse<BiliFavResourceData>;
    try {
      listRes = await safeFetchJson<BiliFavResourceData>(listUrl);
    } catch (e: unknown) {
      logs.add(`读取出错: ${getErrorMessage(e)}`, 'error');
      break;
    }

    if (listRes.code !== 0) {
      logs.add(`读取出错: ${listRes.message}`, 'error');
      break;
    }

    if (pn === 1 && listRes.data?.info) {
      const totalCount = listRes.data.info.media_count || 0;
      totalPages = Math.ceil(totalCount / BILIBILI_PAGE_SIZE);
      logs.add(`收藏夹共 ${totalCount} 个视频，约 ${totalPages} 页`, 'info');
    }

    const videos: VideoResource[] = listRes.data?.medias ?? [];
    allVideos.push(...videos);

    if (onProgress) onProgress(pn, totalPages || pn);

    if (!listRes.data?.has_more || videos.length === 0) break;
    pn++;
    await humanDelay(fetchDelay);
  }

  return maxVideos ? allVideos.slice(0, maxVideos) : allVideos;
}
