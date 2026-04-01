import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import monkey, { cdn } from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    svelte(),
    monkey({
      entry: 'src/main.ts',
      server: {
        open: false,
      },
      userscript: {
        name: 'B站 AI 收藏夹自动分类整理',
        namespace: 'http://tampermonkey.net/',
        version: '2.0.0',
        description:
          '支持所有AI智能分类B站收藏夹视频 | Svelte + GSAP 极致动画 | 自定义模板/增量整理/AI费用估算/分类导出/收藏夹健康报告/置信度可视化/失效视频批量归档/缓存/Token追踪/跨收藏夹去重/撤销历史/备份/自适应限速/毛玻璃面板',
        author: 'B站-是小圆_喲 & 感谢b站某不知名的根号三提供的最初模板',
        match: ['*://*.bilibili.com/*'],
        'run-at': 'document-idle',
        grant: [
          'GM_xmlhttpRequest',
          'GM_getValue',
          'GM_setValue',
          'GM_addStyle',
        ],
        connect: [
          'generativelanguage.googleapis.com',
          'api.openai.com',
          'api.deepseek.com',
          'api.siliconflow.cn',
          'dashscope.aliyuncs.com',
          'api.moonshot.cn',
          'open.bigmodel.cn',
          'api.groq.com',
          'api.anthropic.com',
          'models.github.ai',
          'localhost',
          'openrouter.ai',
          '*',
        ],
      },
      build: {
        externalGlobals: {
          gsap: cdn.jsdelivr('gsap', 'dist/gsap.min.js'),
          'gsap/Flip': cdn.jsdelivr('gsap', 'dist/Flip.min.js'),
          'gsap/Draggable': cdn.jsdelivr('gsap', 'dist/Draggable.min.js'),
          'gsap/CustomEase': cdn.jsdelivr('gsap', 'dist/CustomEase.min.js'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      $lib: '/src/lib',
      $components: '/src/components',
      $animations: '/src/animations',
      $styles: '/src/styles',
      $actions: '/src/actions',
    },
  },
});
