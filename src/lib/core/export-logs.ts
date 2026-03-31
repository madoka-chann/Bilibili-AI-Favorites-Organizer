import { get } from 'svelte/store';
import { logs } from '$lib/stores/state';
import { downloadAsFile } from '$lib/utils/dom';

/** 导出日志为 .txt 文件下载 */
export function exportLogs(): void {
  const entries = get(logs);
  if (entries.length === 0) {
    logs.add('暂无日志', 'warning');
    return;
  }

  const lines = entries.map((e) => `[${e.time}] [${e.level}] ${e.message}`).join('\n');
  const filename = `bfao-log-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.txt`;
  downloadAsFile(lines, filename, 'text/plain');

  logs.add('日志已导出', 'success');
}
