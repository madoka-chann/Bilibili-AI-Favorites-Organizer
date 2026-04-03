/** 触发浏览器文件下载 (兼容 Tampermonkey 环境) */
export function triggerDownload(blob: Blob, filename: string): void {
  // Convert blob to data URL to avoid blob URL issues on bilibili
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  };

  // Add UTF-8 BOM for text files
  const isText = blob.type.startsWith('text/') || blob.type === 'application/json';
  if (isText) {
    reader.readAsDataURL(new Blob(['\uFEFF', blob], { type: blob.type + ';charset=utf-8' }));
  } else {
    reader.readAsDataURL(blob);
  }
}
