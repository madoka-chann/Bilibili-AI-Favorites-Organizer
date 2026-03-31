import { get } from 'svelte/store';
import { logs } from '$lib/stores/state';

/** 导出日志为 .txt 文件下载 */
export function exportLogs(): void {
  const entries = get(logs);
  if (entries.length === 0) {
    logs.add('暂无日志', 'warning');
    return;
  }

  const lines = entries.map((e) => `[${e.time}] [${e.level}] ${e.message}`).join('\n');
  const blob = new Blob([lines], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bfao-log-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  logs.add('日志已导出', 'success');
}
