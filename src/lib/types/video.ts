/** B站视频资源 */
export interface VideoResource {
  id: number;
  type: number;
  title: string;
  bvid: string;
  intro: string;
  duration: number;
  pubtime: number;
  fav_time: number;
  cnt_info: {
    play: number;
    collect: number;
    danmaku: number;
    reply?: number;
  };
  upper: {
    mid: number;
    name: string;
    face: string;
  };
  cover: string;
  link: string;
  attr?: number; // 9 = 失效视频
}

/** 收藏夹文件夹 */
export interface FavFolder {
  id: number;
  fid: number;
  mid: number;
  title: string;
  media_count: number;
  attr?: number;
  fav_state?: number;
}

/** 视频缓存条目 */
export interface CachedFolder {
  title: string;
  media_count: number;
  videos: VideoResource[];
  cachedAt: number;
}

/** 全局视频缓存 */
export type GlobalVideoCache = Record<string, CachedFolder>;

/** 会话级视频抓取缓存 */
export interface VideoFetchCache {
  mediaId: number | null;
  videos: VideoResource[];
  timestamp: number;
}

/** 分类结果 (AI 返回) — 值类型引用 ClassifiedVideoEntry */
export type CategoryResult = Record<string, import('./ai').ClassifiedVideoEntry[]>;

/** B站认证数据 */
export interface BiliData {
  mid: string;
  csrf: string;
}

// ================= B站 API 响应类型 =================

/** B站 API 通用响应结构 */
export interface BiliApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

/** 收藏夹列表响应 data */
export interface BiliFolderListData {
  list: FavFolder[];
}

/** 收藏夹视频列表响应 data */
export interface BiliFavResourceData {
  info?: { media_count: number };
  medias: VideoResource[] | null;
  has_more: boolean;
}

/** 创建收藏夹响应 data */
export interface BiliCreateFolderData {
  id: number;
  fid?: number;
}

/** 视频属性枚举 */
export const VideoAttr = {
  DEAD: 9,
} as const;
