/**
 * B站 API — 聚合导出
 *
 * 底层模块:
 *   bilibili-http.ts    HTTP 工具层 (POST/GET/限流重试)
 *   bilibili-auth.ts    认证与页面上下文
 *   bilibili-folders.ts 收藏夹操作 (列表/创建/缓存)
 *   bilibili-videos.ts  视频操作 (移动/删除/拉取)
 *   bilibili-scanner.ts 通用分页遍历器
 */

export { buildFormData, postBiliApi, fetchBiliJson, lightFetchJson, safeFetchJson } from './bilibili-http';
export { getBiliData, getSourceMediaId } from './bilibili-auth';
export { getAllFoldersWithIds, invalidateFolderCache, getMyFolders, createFolder } from './bilibili-folders';
export { moveVideos, batchDeleteVideos, fetchAllVideos } from './bilibili-videos';
export { scanAllFolderVideos, type FolderScanOptions } from './bilibili-scanner';
