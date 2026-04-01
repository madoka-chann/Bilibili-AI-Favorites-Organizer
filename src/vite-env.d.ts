/// <reference types="svelte" />
/// <reference types="vite/client" />

// GSAP 插件通过 CDN @require 加载，注册为 globalThis 全局变量
// 声明类型避免 `as any` 断言
declare const Flip: typeof import('gsap/Flip').Flip;
declare const Draggable: typeof import('gsap/Draggable').Draggable;
declare const CustomEase: typeof import('gsap/CustomEase').CustomEase;
