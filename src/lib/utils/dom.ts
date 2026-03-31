/** HTML 实体转义 (XSS 防护) */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c] ?? c);
}

/** 格式化时长 (秒 → 分:秒 或 时:分:秒) */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** 格式化数字 (万/亿) */
export function formatCount(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + '亿';
  if (n >= 10_000) return (n / 10_000).toFixed(1) + '万';
  return String(n);
}

/** 相对时间 */
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp * 1000;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(months / 12)}年前`;
}

/** 检测是否为失效视频 */
export function isDeadVideo(video: { attr?: number; title?: string }): boolean {
  return video.attr === 9 || video.title === '已失效视频';
}
