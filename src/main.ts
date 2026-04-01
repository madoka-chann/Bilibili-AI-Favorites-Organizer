import { mount } from 'svelte';
import App from './App.svelte';
import { setupBackgroundCache } from '$core/background-cache';

// 仅在 B站个人空间页面注入完整 UI
const isSpacePage = /space\.bilibili\.com/.test(location.href);

if (isSpacePage) {
  // 创建挂载容器
  const container = document.createElement('div');
  container.id = 'bfao-root';
  document.body.appendChild(container);

  // 挂载 Svelte App
  mount(App, { target: container });
}

// 所有 B站页面都启动后台缓存扫描
setupBackgroundCache();
