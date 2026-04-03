/**
 * Svelte action: use:thumbPreview
 * 缩略图悬浮预览 — 纯 DOM 操作，不触发 Svelte 重渲染
 */
export function thumbPreview(node: HTMLElement) {
  let previewEl: HTMLDivElement | null = null;

  function onEnter() {
    const img = node.querySelector('img') as HTMLImageElement | null;
    if (!img?.src) return;

    const rect = node.getBoundingClientRect();
    previewEl = document.createElement('div');
    previewEl.style.cssText = `
      position: fixed;
      left: ${rect.right + 10}px;
      top: ${Math.max(10, rect.top - 60)}px;
      z-index: 2147483646;
      pointer-events: none;
      opacity: 0; transform: scale(0.92);
      transition: opacity 0.15s ease, transform 0.15s ease;
    `;
    requestAnimationFrame(() => {
      if (previewEl) { previewEl.style.opacity = '1'; previewEl.style.transform = 'scale(1)'; }
    });
    const previewImg = document.createElement('img');
    previewImg.src = img.src;
    previewImg.style.cssText = `
      width: 260px; height: auto;
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);
      display: block;
    `;
    previewEl.appendChild(previewImg);
    document.body.appendChild(previewEl);

    // Ensure preview stays within viewport
    requestAnimationFrame(() => {
      if (!previewEl) return;
      const pr = previewEl.getBoundingClientRect();
      if (pr.right > window.innerWidth - 10) {
        previewEl.style.left = (rect.left - pr.width - 10) + 'px';
      }
      if (pr.bottom > window.innerHeight - 10) {
        previewEl.style.top = (window.innerHeight - pr.height - 10) + 'px';
      }
    });
  }

  function onLeave() {
    previewEl?.remove();
    previewEl = null;
  }

  node.addEventListener('mouseenter', onEnter);
  node.addEventListener('mouseleave', onLeave);
  return {
    destroy() {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      previewEl?.remove();
    },
  };
}
