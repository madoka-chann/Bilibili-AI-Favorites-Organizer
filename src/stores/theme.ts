import { writable, derived } from 'svelte/store';
import { gmGetValue, gmSetValue } from '$utils/gm';

export type ThemeMode = 'light' | 'dark' | 'auto';

/** 主题色预设 (从 79 个精简为 12 个) */
export const ACCENT_PRESETS = [
  { name: 'Indigo', value: '#7364FF' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Lime', value: '#84CC16' },
] as const;

/** 当前主题模式 */
export const themeMode = writable<ThemeMode>(
  gmGetValue('bfao_themeMode', 'auto') as ThemeMode
);

/** 当前主题色 */
export const accentColor = writable<string>(
  gmGetValue('bfao_accentColor', '#7364FF')
);

/** 系统是否偏好暗色 */
const systemPrefersDark = writable(
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
);

/** 集中管理 matchMedia 监听器的 AbortController */
const mediaAbort = typeof window !== 'undefined' ? new AbortController() : null;

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      systemPrefersDark.set(e.matches);
    }, { signal: mediaAbort!.signal });
}

/** 实际是否为暗色 (auto 模式跟随系统) */
export const isDark = derived(
  [themeMode, systemPrefersDark],
  ([$mode, $sysDark]) => {
    if ($mode === 'dark') return true;
    if ($mode === 'light') return false;
    return $sysDark;
  }
);

/** 切换主题模式 */
export function toggleTheme() {
  themeMode.update((current) => {
    const next: ThemeMode = current === 'light' ? 'dark' : 'light';
    gmSetValue('bfao_themeMode', next);
    return next;
  });
}

/** 设置主题色 */
export function setAccentColor(color: string) {
  accentColor.set(color);
  gmSetValue('bfao_accentColor', color);
}

/** 系统是否偏好减弱动画 */
export const prefersReducedMotion = writable(
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
);

if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', (e) => {
      prefersReducedMotion.set(e.matches);
    }, { signal: mediaAbort!.signal });
}

/** 清理所有 matchMedia 监听器 (脚本卸载时调用) */
export function destroyThemeListeners(): void {
  mediaAbort?.abort();
}
