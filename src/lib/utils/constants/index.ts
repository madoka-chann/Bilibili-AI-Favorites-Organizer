/**
 * Barrel re-export — 所有常量通过此文件统一导出
 * 可按需从子模块直接导入以获得更清晰的依赖关系
 */
export {
  AI_PROVIDERS, AI_TIMEOUT_MS,
  SPEED_PRESETS, AI_CHUNK_PRESETS, BUILTIN_PRESETS,
} from './ai';

export {
  Z_INDEX, CONFETTI_COLORS, AURORA_COLORS,
  MAX_TOAST_COUNT, MAX_CANVAS_FX,
} from './ui';

export {
  BILIBILI_PAGE_SIZE, BILIBILI_URLS, VIDEO_CACHE_TTL, FETCH_TIMEOUT_MS,
  SAFETY_TIMEOUT_MS, DEBOUNCE_DELAY_MS, MAX_UNDO_HISTORY,
} from './bilibili';
