// ================= B站 API 常量 =================

/** B站 API 强制分页大小 */
export const BILIBILI_PAGE_SIZE = 40;

/** 默认收藏夹名称 (不参与分类) */
export const DEFAULT_FOLDER_TITLE = '默认收藏夹';

// ================= API URL 构建器 =================
const BILIBILI_API_BASE = 'https://api.bilibili.com/x/v3/fav';

export const BILIBILI_URLS = {
  /** 获取用户所有收藏夹列表 */
  folderList: (mid: string) =>
    `${BILIBILI_API_BASE}/folder/created/list-all?up_mid=${mid}`,
  /** 获取收藏夹内视频列表 (分页) */
  resourceList: (mediaId: number, pn: number, ps: number = BILIBILI_PAGE_SIZE) =>
    `${BILIBILI_API_BASE}/resource/list?media_id=${mediaId}&pn=${pn}&ps=${ps}&platform=web`,
  /** 创建收藏夹 */
  folderAdd: `${BILIBILI_API_BASE}/folder/add`,
  /** 移动视频 */
  resourceMove: `${BILIBILI_API_BASE}/resource/move`,
  /** 批量删除视频 */
  resourceBatchDel: `${BILIBILI_API_BASE}/resource/batch-del`,
} as const;

// ================= 时间常量 =================
export const VIDEO_CACHE_TTL = 300_000; // 5 分钟
export const FETCH_TIMEOUT_MS = 30_000; // 30 秒
export const SAFETY_TIMEOUT_MS = 30 * 60 * 1000; // 30 分钟
export const DEBOUNCE_DELAY_MS = 400;

// ================= 特殊收藏夹名称 =================
export const UNCATEGORIZED_FOLDER = '未分类';
export const DEAD_ARCHIVE_FOLDER = '失效视频归档';

// ================= 视频默认值 =================
export const DEFAULT_VIDEO_TYPE = 2;

// ================= 操作限制 =================
export const MAX_UNDO_HISTORY = 5;

/** 分页安全上限：500页 × 20条/页 = 10,000 视频 */
export const MAX_BILIBILI_PAGES = 500;
