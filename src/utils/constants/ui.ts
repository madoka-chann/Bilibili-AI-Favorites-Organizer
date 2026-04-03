// ================= Z-Index =================
export const Z_INDEX = {
  FLOAT: 2147483640,
  PANEL: 2147483641,
  MODAL: 2147483645,
  PARTICLE: 2147483646,
  TOAST: 2147483647,
} as const;

// ================= Confetti 颜色 =================
export const CONFETTI_COLORS = [
  '#7C5CFC', '#FF6B8A', '#A855F7', '#06B6D4',
  '#10B981', '#F59E0B', '#F43F5E', '#D946EF',
  '#FB7185', '#FBBF24', '#B4A0FF', '#34D399',
];

// ================= 极光颜色 (用于粒子/Canvas) =================
export const AURORA_COLORS = [
  '#B4A0FF', '#FF6B8A', '#22D3EE', '#34D399', '#E879F9', '#FBBF24',
];

// ================= Toast/Canvas 限制 =================
export const MAX_TOAST_COUNT = 5;
export const MAX_CANVAS_FX = 1;

// ================= 位置持久化 =================
/** FloatButton 和 Panel 共享的拖拽位置 GM key */
export const POS_STORAGE_KEY = 'bfao_pos_v5';
