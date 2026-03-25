// ==UserScript==
// @name         B站 AI 收藏夹自动细化整理 (V1.0 增强版)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  支持所有AI智能分类B站收藏夹视频 | 自定义模板/增量整理/定时自动整理/AI费用估算/分类导出CSV&JSON&HTML报告/收藏夹健康报告/置信度可视化&低置信度筛选/失效视频批量归档/抓取缓存/动态System Prompt/Token用量追踪/标题栏进度/智能碎片合并/跨收藏夹去重/分类合并/AI自动重试/遗漏检测/全局防风控冷却/可拖拽按钮/XSS安全/撤销历史栈/备份/自适应限速
// @author       B站-是小圆_喲 & 感谢b站某不知名的根号三提供的最初模板
// @match        *://space.bilibili.com/*
// @include      https://space.bilibili.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     customCSS https://raw.githubusercontent.com/madoka-chann/Bilibili-Favorites-AI-Organizer/refs/heads/main/bilibili-favorites-ai-organizer.css
// @connect      generativelanguage.googleapis.com
// @connect      api.openai.com
// @connect      api.deepseek.com
// @connect      api.siliconflow.cn
// @connect      dashscope.aliyuncs.com
// @connect      api.moonshot.cn
// @connect      open.bigmodel.cn
// @connect      api.groq.com
// @connect      api.anthropic.com
// @connect      models.github.ai
// @connect      localhost
// @connect      openrouter.ai
// @connect      *
// @require      https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js
// ==/UserScript==

(function() {
    'use strict';

    // ================= 加载 CSS =================
    // 优先从 @resource 加载，失败则用内联 fallback
    let _cssLoaded = false;
    try {
        const css = GM_getResourceText('customCSS');
        console.log('[AI整理] GM_getResourceText 返回:', typeof css, css ? css.length + '字符' : 'null/undefined', css ? css.substring(0, 100) : '');
        if (css && css.length > 100) { GM_addStyle(css); _cssLoaded = true; console.log('[AI整理] ✅ @resource CSS 加载成功'); }
        else { console.warn('[AI整理] @resource CSS 内容为空或过短'); }
    } catch(e) { console.error('[AI整理] @resource CSS 加载异常:', e.message); }

    if (!_cssLoaded) {
        // Fallback: 直接注入关键 CSS（确保 z-index 和基本布局正常）
        const fallbackCSS = document.createElement('style');
        fallbackCSS.textContent = `
            :root{--ai-primary:#fb7299;--ai-primary-dark:#e5668a;--ai-primary-light:#ff9cb5;--ai-primary-bg:#fff0f5;--ai-primary-shadow:rgba(251,114,153,0.3);--ai-success:#4CAF50;--ai-error:#e74c3c;--ai-info:#3498db;--ai-warning:#f39c12;--ai-text:#333;--ai-text-secondary:#555;--ai-text-muted:#999;--ai-text-light:#ccc;--ai-border:#ddd;--ai-border-light:#eee;--ai-border-lighter:#f0f0f0;--ai-bg:#fff;--ai-bg-secondary:#fafafa;--ai-bg-tertiary:#f8f8f8;--ai-bg-hover:#fef6f8;--ai-header-gradient:linear-gradient(135deg,#fb7299,#ff9cb5);--ai-modal-backdrop:rgba(0,0,0,0.45);--ai-input-bg:#fff;--ai-font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--ai-z-float:2147483640;--ai-z-panel:2147483641;--ai-z-modal:2147483645;--ai-z-particle:2147483646;--ai-radius-xs:4px;--ai-radius-sm:6px;--ai-radius-md:8px;--ai-radius-lg:12px;--ai-radius-xl:16px;--ai-transition:0.2s ease;--ai-transition-slow:0.35s cubic-bezier(0.4,0,0.2,1);--ai-scrollbar:#ddd;--ai-scrollbar-hover:#ccc;--ai-cat-detail-bg:#f9f9fb;--ai-separator:#eaeaea;--ai-glow-color:rgba(251,114,153,0.08);--ai-badge-new-bg:#ff6b6b;--ai-badge-existing-bg:#52c41a;--ai-vid-odd-bg:rgba(0,0,0,0.015);--ai-vid-hover-bg:#f0f0f5;}
            #ai-float-btn{position:fixed;bottom:30px;left:30px;z-index:var(--ai-z-float);background:var(--ai-primary);color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px var(--ai-primary-shadow);}
            #ai-float-btn [data-lucide]{width:22px;height:22px;}
            #ai-sort-wrapper{position:fixed;bottom:30px;left:30px;z-index:var(--ai-z-panel);width:min(380px,calc(100vw - 60px));flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.15);border-radius:var(--ai-radius-xl);overflow:hidden;max-height:85vh;font-family:var(--ai-font);}
            #ai-sort-wrapper [data-lucide]{width:16px;height:16px;stroke-width:2;vertical-align:middle;display:inline-block;}
            .ai-panel-content{background:var(--ai-bg)!important;padding:0;overflow-y:auto;max-height:calc(85vh - 46px);border-bottom-left-radius:var(--ai-radius-xl);border-bottom-right-radius:var(--ai-radius-xl);}
            .ai-header{background:var(--ai-header-gradient);color:#fff;padding:10px 15px;font-weight:bold;font-size:14px;display:flex;justify-content:space-between;align-items:center;position:relative;overflow:hidden;}
            .ai-header-title{display:flex;align-items:center;gap:6px;}
            .ai-header-actions{display:flex;gap:8px;align-items:center;position:relative;z-index:1;}
            .ai-header-btn{padding:4px;border:none;background:rgba(255,255,255,0.2);color:#fff;border-radius:var(--ai-radius-sm);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--ai-transition);}
            .ai-header-btn:hover{background:rgba(255,255,255,0.35);}
            .ai-settings{display:none;padding:10px 15px 12px;background:var(--ai-bg-secondary)!important;border-bottom:1px solid var(--ai-border-light);}
            .ai-group-header{display:flex;align-items:center;gap:8px;padding:8px 10px;margin:4px -10px;cursor:pointer;font-size:12px;font-weight:bold;color:var(--ai-text-secondary);user-select:none;border-radius:var(--ai-radius-md);transition:all var(--ai-transition);}
            .ai-group-header:hover{background:var(--ai-primary-bg);color:var(--ai-primary);}
            .ai-group-icon{width:22px;height:22px;border-radius:var(--ai-radius-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
            .ai-group-body{padding-left:2px;}
            .ai-input{padding:6px 8px;border:1px solid var(--ai-border);border-radius:var(--ai-radius-xs);font-size:12px;outline:none;box-sizing:border-box;background:var(--ai-input-bg)!important;color:var(--ai-text)!important;transition:all var(--ai-transition);}
            .ai-input:focus{border-color:var(--ai-primary);box-shadow:0 0 0 3px rgba(251,114,153,0.15);}
            .ai-select{padding:6px 8px;border:1px solid var(--ai-border);border-radius:var(--ai-radius-xs);font-size:12px;outline:none;background:var(--ai-input-bg)!important;color:var(--ai-text)!important;cursor:pointer;transition:all var(--ai-transition);}
            .ai-label{font-size:12px;color:var(--ai-text-secondary);display:block;margin-bottom:3px;}
            .ai-btn{transition:all var(--ai-transition);cursor:pointer;border:1px solid var(--ai-border);border-radius:var(--ai-radius-xs);background:var(--ai-bg);display:inline-flex;align-items:center;justify-content:center;gap:4px;}
            .ai-btn:hover{background:var(--ai-border-lighter);border-color:var(--ai-text-light);}
            .ai-btn:active{transform:scale(0.95);}
            .ai-btn:disabled{opacity:0.5;cursor:not-allowed;}
            .ai-btn-primary{background:linear-gradient(135deg,var(--ai-primary),#ff6b8a)!important;color:#fff!important;border:none;font-weight:bold;position:relative;overflow:hidden;}
            .ai-btn-primary:hover{box-shadow:0 4px 15px var(--ai-primary-shadow);}
            .ai-btn-tool{background:#f5f5f5;color:var(--ai-text-secondary);font-size:11px;}
            .ai-btn-tool:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,0.08);}
            .ai-status-log{margin-top:10px;background:var(--ai-bg-tertiary)!important;padding:6px;border-radius:var(--ai-radius-md);font-size:11px;color:var(--ai-text);height:120px;overflow-y:auto;word-break:break-all;border:1px solid var(--ai-border-light);scroll-behavior:smooth;display:flex;flex-direction:column;gap:2px;}
            .ai-log-entry{display:flex;align-items:flex-start;gap:6px;padding:3px 8px;border-radius:4px;background:var(--ai-bg-secondary);border-left:3px solid transparent;animation:ai-log-flash 0.6s ease-out;line-height:1.5;}
            .ai-log-time{flex-shrink:0;font-size:9px;color:var(--ai-text-muted);background:var(--ai-bg-tertiary);padding:1px 5px;border-radius:8px;line-height:16px;}
            .ai-log-msg{flex:1;min-width:0;word-break:break-word;}
            .ai-log-error{color:var(--ai-error);border-left-color:var(--ai-error);}
            .ai-log-warning{color:var(--ai-warning);border-left-color:var(--ai-warning);}
            .ai-log-success{color:#27ae60;border-left-color:var(--ai-success);}
            .ai-log-info{color:var(--ai-info);border-left-color:var(--ai-info);}
            .ai-modal-backdrop{position:fixed;inset:0;background:var(--ai-modal-backdrop)!important;z-index:var(--ai-z-modal);display:flex;align-items:center;justify-content:center;font-family:var(--ai-font);backdrop-filter:blur(4px);}
            .ai-modal{background:var(--ai-bg)!important;color:var(--ai-text)!important;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.25);width:min(600px,90vw);max-height:70vh;display:flex;flex-direction:column;overflow:hidden;}
            .ai-modal-header{padding:14px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--ai-border-light);background:var(--ai-header-gradient);color:#fff;position:relative;overflow:hidden;}
            .ai-modal-header h3{margin:0;font-size:15px;font-weight:bold;display:flex;align-items:center;gap:8px;position:relative;z-index:1;}
            .ai-modal-toolbar{padding:10px 20px;border-bottom:1px solid var(--ai-border-light);background:var(--ai-bg-secondary)!important;}
            .ai-modal-body{flex:1;overflow-y:auto;padding:0;min-height:0;}
            .ai-modal-footer{padding:12px 20px;border-top:1px solid var(--ai-border-light);display:flex;gap:10px;background:var(--ai-bg-secondary)!important;box-shadow:0 -4px 12px rgba(0,0,0,0.04);}
            .ai-modal-close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:var(--ai-radius-md);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;}
            .ai-modal-btn{flex:1;padding:10px;border:none;border-radius:var(--ai-radius-md);font-size:14px;font-weight:bold;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:6px;}
            .ai-modal-btn-confirm{background:linear-gradient(135deg,var(--ai-success),#66bb6a)!important;color:#fff;}
            .ai-modal-btn-cancel{background:var(--ai-border-lighter);color:var(--ai-text-muted);}
            .ai-cat-block{animation:ai-slide-in 0.4s ease-out both;animation-delay:calc(var(--i,0)*0.05s);}
            .ai-cat-row{display:flex;align-items:center;gap:10px;padding:10px 20px;border-bottom:1px solid var(--ai-border-lighter);border-left:3px solid var(--ai-primary);cursor:pointer;position:relative;overflow:hidden;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);}
            .ai-cat-row:hover{background:var(--ai-bg-hover);}
            .ai-cat-row.unchecked{opacity:0.4;transform:translateX(8px);border-left-color:var(--ai-border);}
            .ai-cat-row>*{position:relative;z-index:1;}
            .ai-cat-name{flex:1;font-size:13px;color:var(--ai-text);display:flex;align-items:center;gap:6px;}
            .ai-cat-count{font-size:12px;color:var(--ai-text-muted);white-space:nowrap;}
            .ai-cat-badge{font-size:10px;color:#fff;background:var(--ai-badge-new-bg);padding:1px 6px;border-radius:10px;}
            .ai-cat-existing{font-size:10px;color:#fff;background:var(--ai-badge-existing-bg);padding:1px 6px;border-radius:10px;}
            .ai-cat-detail{background:var(--ai-cat-detail-bg);border-bottom:1px solid var(--ai-border-lighter);overflow:hidden;max-height:0;opacity:0;transition:max-height var(--ai-transition-slow),opacity 0.25s ease,padding 0.3s ease;padding:0;}
            .ai-cat-detail.open{max-height:240px;opacity:1;padding:4px 0;}
            .ai-cat-detail-inner{max-height:232px;overflow-y:auto;scrollbar-width:thin;}
            .ai-vid-item{padding:7px 20px 7px 48px;font-size:12px;color:var(--ai-text-secondary);line-height:1.5;position:relative;transition:background 0.15s;}
            .ai-vid-item:hover{background:var(--ai-vid-hover-bg);}
            .ai-vid-up{color:var(--ai-text-muted);font-size:11px;}
            .ai-vid-rich{display:flex!important;align-items:flex-start;gap:10px;padding:8px 16px 8px 40px!important;}
            .ai-vid-cover{width:64px;height:36px;border-radius:var(--ai-radius-xs);object-fit:cover;flex-shrink:0;background:var(--ai-border-lighter);}
            .ai-vid-info{flex:1;min-width:0;overflow:hidden;}
            .ai-vid-title{font-size:12px;color:var(--ai-text);line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
            .ai-vid-title a{color:var(--ai-text);text-decoration:none;}
            .ai-vid-title a:hover{color:var(--ai-primary);}
            .ai-vid-meta{display:flex;gap:8px;margin-top:2px;font-size:10px;color:var(--ai-text-muted);flex-wrap:wrap;}
            .ai-filter-btn{padding:3px 10px;border-radius:var(--ai-radius-lg);font-size:11px;cursor:pointer;border:1px solid var(--ai-border);background:var(--ai-bg);color:var(--ai-text-muted);transition:all var(--ai-transition);}
            .ai-filter-btn:hover{border-color:var(--ai-primary);color:var(--ai-primary);}
            .ai-filter-btn.active{background:var(--ai-primary);color:#fff;border-color:var(--ai-primary);}
            .ai-modal-search{width:100%;padding:8px 12px 8px 32px!important;border:1px solid var(--ai-border);border-radius:var(--ai-radius-md);font-size:13px;outline:none;box-sizing:border-box;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:10px center;}
            .ai-ripple-dot{position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(251,114,153,0.3);pointer-events:none;z-index:2;}
            .ai-particle-dot{position:fixed;border-radius:50%;pointer-events:none;z-index:var(--ai-z-particle);}
            .ai-glow{position:absolute;width:150px;height:150px;background:radial-gradient(circle,var(--ai-glow-color),transparent 70%);pointer-events:none;transform:translate(-50%,-50%);transition:opacity 0.3s;opacity:0;z-index:0;}
            .ai-cat-row:hover .ai-glow{opacity:1;}
            #ai-sort-wrapper ::-webkit-scrollbar,.ai-modal ::-webkit-scrollbar{width:5px;}
            #ai-sort-wrapper ::-webkit-scrollbar-track,.ai-modal ::-webkit-scrollbar-track{background:transparent;}
            #ai-sort-wrapper ::-webkit-scrollbar-thumb,.ai-modal ::-webkit-scrollbar-thumb{background:var(--ai-scrollbar);border-radius:3px;}
            @keyframes ai-slide-in{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
            @keyframes ai-fade-in{from{opacity:0}to{opacity:1}}
            @keyframes ai-scale-in{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
            @keyframes ai-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
            @keyframes ai-ripple{0%{transform:scale(0);opacity:0.5}100%{transform:scale(2.5);opacity:0}}
            @keyframes ai-particle{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
            @keyframes ai-breathe{0%,100%{box-shadow:0 4px 12px var(--ai-primary-shadow)}50%{box-shadow:0 4px 20px rgba(251,114,153,0.6)}}
            @keyframes ai-panel-in{from{transform:translateY(20px) scale(0.97);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
            @keyframes ai-btn-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
            @keyframes ai-bubble-pop{0%{transform:translateX(-50%) scale(0);opacity:0}50%{transform:translateX(-50%) scale(1.1);opacity:1}100%{transform:translateX(-50%) scale(1);opacity:1}}
            @keyframes ai-bubble-pulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.08)}}
            .ai-btn-spin-icon{display:inline-flex;animation:ai-btn-spin 0.8s linear infinite;}
            .ai-btn.ai-btn-loading{position:relative;pointer-events:none;opacity:0.85;overflow:visible !important;}
            .ai-countdown-bubble{position:fixed;z-index:2147483647;background:linear-gradient(135deg,#fb7299,#ff9ab5);color:#fff;font-size:11px;font-weight:bold;padding:4px 12px;border-radius:14px;white-space:nowrap;pointer-events:none;animation:ai-bubble-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;box-shadow:0 3px 12px rgba(251,114,153,0.4),0 0 0 2px rgba(255,255,255,0.6);line-height:1.4;letter-spacing:0.5px;}
            .ai-countdown-bubble::after{content:'';position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#ff9ab5;}
            .ai-countdown-bubble .ai-cd-num{display:inline-block;min-width:16px;text-align:center;animation:ai-bubble-pulse 1s ease-in-out infinite;}
            #ai-sort-wrapper input,#ai-sort-wrapper textarea,#ai-sort-wrapper select,.ai-modal input,.ai-modal textarea,.ai-modal select{filter:none!important;-webkit-filter:none!important;background-color:var(--ai-input-bg)!important;color:var(--ai-text)!important;}
            #ai-sort-wrapper,#ai-sort-wrapper *:not(.ai-vid-cover):not([data-lucide]),#ai-float-btn,.ai-modal-backdrop,.ai-modal,.ai-modal *:not(.ai-vid-cover):not([data-lucide]){filter:none!important;-webkit-filter:none!important;}
        `;
        document.head.appendChild(fallbackCSS);
        console.warn('[AI整理] 使用内联 fallback CSS');
    }

    // (旧 CSS 已完全迁移到独立 CSS 文件，废弃代码已删除)

    // ================= 状态管理 =================
    // 会话级视频抓取缓存（取消后重新开始时复用，避免重复请求）
    const videoFetchCache = { mediaId: null, videos: [], timestamp: 0 };
    const VIDEO_CACHE_TTL = 300000; // 5分钟

    const state = {
        cancelRequested: false,
        isRunning: false,
        previewData: null,
        progressStartTime: 0,
        progressPhase: '', // 'fetch' | 'ai' | 'move'
        progressCurrent: 0,
        progressTotal: 0,
        // 自适应限速
        adaptive: {
            rateLimitHits: 0,       // 连续被限流次数
            successStreak: 0,       // 连续成功次数
            currentFetchDelay: 0,   // 当前实际使用的抓取延迟
            currentWriteDelay: 0,   // 当前实际使用的写操作延迟
        },
        // 撤销数据
        undoData: null, // { time, sourceMediaIds, moves: [{resources, fromMediaId, toMediaId}] }
        // 跨收藏夹选中的文件夹ID列表
        selectedFolderIds: null, // null=当前页面收藏夹, [id1,id2,...]=多选
        // 跨收藏夹去重
        cleanCrossFolderDups: false
    };

    // ================= 预设 Prompt =================
    const BUILTIN_PRESETS = [
        { label: '自由发挥', value: '' },
        { label: '按UP主分类', value: '请按UP主/创作者名字分类，同一个UP主的视频放在一起，收藏夹名用UP主的名字' },
        { label: '按内容类型分类', value: '请按视频内容类型分类，如游戏、音乐、教程、生活、科技、搞笑、影视等大类' },
        { label: '按时长分类', value: '请按视频时长分类：短视频(5分钟以内)、中等时长(5-30分钟)、长视频(30分钟以上)' },
        { label: '学习资料整理', value: '请将学习类视频按学科/技能分类，如编程、数学、英语、设计、考研、职场技能等。非学习类视频统一归入"休闲娱乐"' },
        { label: '按热度分类', value: '请按视频播放量分类：冷门宝藏(1万以下)、小众精品(1-10万)、热门视频(10-100万)、爆款视频(100万以上)' },
        { label: '精细分类 (多级)', value: '请尽量精细分类，同一大类下如果视频较多可拆分子类。例如"游戏"可细分为"单机游戏"、"网络游戏"、"手游"等。收藏夹名格式：大类-子类' },
        { label: '按语言/地区分类', value: '请按视频的语言或内容地区分类，如国产、日本动画、欧美、韩国等。同一地区内可按类型细分' },
        { label: '待看优先级', value: '请按视频的观看价值和紧迫程度分类为：必看精品、有空再看、背景音/BGM、已过时可清理。重点参考播放量和收藏时间判断' }
    ];

    // 自定义规则模板：持久化存储，支持增删改
    function loadCustomTemplates() {
        try { return JSON.parse(GM_getValue('bfao_customTemplates', '[]')); } catch(e) { return []; }
    }
    function saveCustomTemplates(templates) {
        GM_setValue('bfao_customTemplates', JSON.stringify(templates));
    }
    function getAllPresets() {
        const custom = loadCustomTemplates();
        const customPresets = custom.map(t => ({ label: '⭐ ' + t.name, value: t.prompt, isCustom: true, id: t.id }));
        return [...BUILTIN_PRESETS, ...customPresets];
    }

    // ================= 设置读写 =================
    // AI 单次请求数量预设：根据模型上下文能力选择
    const AI_CHUNK_PRESETS = [
        { label: '🧠 大上下文模型 (100个)', value: 100, desc: 'Gemini 2.5 Pro / GPT-4o 等' },
        { label: '📊 标准模型 (50个)', value: 50, desc: 'Gemini 2.5 Flash 等，推荐' },
        { label: '📱 小上下文模型 (25个)', value: 25, desc: '上下文窗口较小的模型' },
        { label: '🔬 超小模型 (10个)', value: 10, desc: '轻量模型或免费 API 额度紧张时' }
    ];

    // ================= AI 服务商预设 =================
    // format 决定 API 请求/响应格式: 'gemini' | 'openai' | 'github' | 'anthropic'
    const AI_PROVIDERS = {
        gemini:      { name: 'Google Gemini',        format: 'gemini',    baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-2.5-flash',             keyPlaceholder: '从 aistudio.google.com/apikey 获取',    apiUrl: 'https://aistudio.google.com/apikey' },
        openai:      { name: 'OpenAI',               format: 'openai',    baseUrl: 'https://api.openai.com/v1',                       defaultModel: 'gpt-4o-mini',                  keyPlaceholder: '从 platform.openai.com 获取',           apiUrl: 'https://platform.openai.com/api-keys' },
        deepseek:    { name: 'DeepSeek',             format: 'openai',    baseUrl: 'https://api.deepseek.com/v1',                     defaultModel: 'deepseek-chat',                keyPlaceholder: '从 platform.deepseek.com 获取',         apiUrl: 'https://platform.deepseek.com/api_keys' },
        siliconflow: { name: '硅基流动',              format: 'openai',    baseUrl: 'https://api.siliconflow.cn/v1',                   defaultModel: 'deepseek-ai/DeepSeek-V3',      keyPlaceholder: '从 cloud.siliconflow.cn 获取',          apiUrl: 'https://cloud.siliconflow.cn/account/ak' },
        qwen:        { name: '通义千问 (Qwen)',       format: 'openai',    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-plus',                 keyPlaceholder: '从 dashscope.aliyun.com 获取',          apiUrl: 'https://dashscope.console.aliyun.com/apikey' },
        moonshot:    { name: 'Moonshot (Kimi)',       format: 'openai',    baseUrl: 'https://api.moonshot.cn/v1',                      defaultModel: 'moonshot-v1-8k',               keyPlaceholder: '从 platform.moonshot.cn 获取',          apiUrl: 'https://platform.moonshot.cn/console/api-keys' },
        zhipu:       { name: '智谱 (GLM)',            format: 'openai',    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',            defaultModel: 'glm-4-flash',                  keyPlaceholder: '从 open.bigmodel.cn 获取',              apiUrl: 'https://open.bigmodel.cn/usercenter/apikeys' },
        groq:        { name: 'Groq',                 format: 'openai',    baseUrl: 'https://api.groq.com/openai/v1',                  defaultModel: 'llama-3.3-70b-versatile',      keyPlaceholder: '从 console.groq.com 获取',              apiUrl: 'https://console.groq.com/keys' },
        openrouter:  { name: 'OpenRouter',           format: 'openai',    baseUrl: 'https://openrouter.ai/api/v1',                    defaultModel: 'google/gemini-2.5-flash',      keyPlaceholder: '从 openrouter.ai/keys 获取',            apiUrl: 'https://openrouter.ai/keys' },
        ollama:      { name: 'Ollama (本地)',         format: 'openai',    baseUrl: 'http://localhost:11434/v1',                       defaultModel: 'llama3',                       keyPlaceholder: '本地运行无需 Key',                       apiUrl: '' },
        github:      { name: 'GitHub Models',        format: 'github',    baseUrl: 'https://models.github.ai',                        defaultModel: 'openai/gpt-4o-mini',           keyPlaceholder: '填入 GitHub Personal Access Token',     apiUrl: 'https://docs.github.com/zh/github-models/quickstart' },
        anthropic:   { name: 'Anthropic Claude',     format: 'anthropic', baseUrl: 'https://api.anthropic.com',                       defaultModel: 'claude-sonnet-4-6-20250627',   keyPlaceholder: '从 console.anthropic.com 获取',         apiUrl: 'https://console.anthropic.com/settings/keys' },
        custom:      { name: '自定义 (OpenAI 兼容)',  format: 'openai',    baseUrl: '',                                               defaultModel: '',                             keyPlaceholder: '填入 API Key',                          apiUrl: '', isCustom: true },
    };

    // 请求速度预设：值为每次请求间隔毫秒数
    const SPEED_PRESETS = [
        { label: '🐢 安全 (1.5s)', value: 1500, desc: '大收藏夹推荐，几乎不会触发风控' },
        { label: '🚶 稳健 (800ms)', value: 800, desc: '日常使用推荐，平衡速度与安全' },
        { label: '🏃 较快 (500ms)', value: 500, desc: '小收藏夹可用，有一定风控风险' }
    ];

    function loadSettings() {
        const provider = GM_getValue('bfao_provider', 'gemini');
        const apiKey = GM_getValue('bfao_apiKey_' + provider, '') || GM_getValue('bfao_apiKey', '');
        return {
            provider: provider,
            customBaseUrl: GM_getValue('bfao_customBaseUrl', ''),
            apiKey: apiKey,
            modelName: GM_getValue('bfao_modelName', 'gemini-2.5-flash'),
            aiChunkSize: GM_getValue('bfao_aiChunkSize', 50),
            aiConcurrency: GM_getValue('bfao_aiConcurrency', 2),
            limitEnabled: GM_getValue('bfao_limitEnabled', false),
            limitCount: GM_getValue('bfao_limitCount', 200),
            fetchDelay: GM_getValue('bfao_fetchDelay', 800),
            writeDelay: GM_getValue('bfao_writeDelay', 2500),
            moveChunkSize: GM_getValue('bfao_moveChunkSize', 20),
            skipDeadVideos: GM_getValue('bfao_skipDeadVideos', true),
            lastPrompt: GM_getValue('bfao_lastPrompt', ''),
            // 新功能开关
            adaptiveRate: GM_getValue('bfao_adaptiveRate', true),
            backupBeforeExecute: GM_getValue('bfao_backupBeforeExecute', true),
            notifyOnComplete: GM_getValue('bfao_notifyOnComplete', true),
            multiFolderEnabled: GM_getValue('bfao_multiFolderEnabled', false),
            // 动画效果开关
            animEnabled: GM_getValue('bfao_animEnabled', true),
            // 增量整理：仅处理上次整理后新增的视频
            incrementalMode: GM_getValue('bfao_incrementalMode', false),
            // 定时自动整理
            autoOrganizeEnabled: GM_getValue('bfao_autoOrganizeEnabled', false),
            autoOrganizeInterval: GM_getValue('bfao_autoOrganizeInterval', 60) // 分钟
        };
    }

    function saveSettings(s) {
        // 合并为单次 GM_setValue 调用，减少存储 API 开销
        const keys = ['provider','customBaseUrl','apiKey','modelName','aiChunkSize','aiConcurrency',
            'limitEnabled','limitCount','fetchDelay','writeDelay','moveChunkSize','skipDeadVideos',
            'lastPrompt','adaptiveRate','backupBeforeExecute','notifyOnComplete',
            'multiFolderEnabled','animEnabled','incrementalMode',
            'autoOrganizeEnabled','autoOrganizeInterval'];
        keys.forEach(k => { if (s[k] !== undefined) GM_setValue('bfao_' + k, s[k]); });
        // 按服务商保存 API Key，切换服务商时可自动恢复
        if (s.provider && s.apiKey !== undefined) GM_setValue('bfao_apiKey_' + s.provider, s.apiKey);
    }

    // ================= 多提供商 API 适配层 =================

    function getProviderBaseUrl(settings) {
        const config = AI_PROVIDERS[settings.provider];
        if (config && config.isCustom) {
            let url = (settings.customBaseUrl || '').trim().replace(/\/+$/, '');
            if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
            return url;
        }
        return config ? config.baseUrl : '';
    }

    // prompt 可以是字符串（旧格式/简单请求）或 { system, user } 对象
    // 新格式将分类规则放入 system message，数据放入 user message，显著提升分类质量
    const FALLBACK_SYSTEM = '你是一个逻辑严密的B站收藏夹视频分类专家。你只输出纯JSON，不输出任何其他内容。JSON格式为：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字}]}}';

    function buildGeminiRequest(prompt, s) {
        const base = AI_PROVIDERS.gemini.baseUrl;
        const userText = typeof prompt === 'string' ? prompt : prompt.user;
        const systemText = typeof prompt === 'string' ? FALLBACK_SYSTEM : prompt.system;
        return {
            url: `${base}/models/${s.modelName}:generateContent?key=${s.apiKey}`,
            headers: { 'Content-Type': 'application/json' },
            data: {
                systemInstruction: { parts: [{ text: systemText }] },
                contents: [{ parts: [{ text: userText }] }],
                generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
            }
        };
    }

    function buildOpenAIRequest(prompt, s) {
        const baseUrl = getProviderBaseUrl(s);
        const messages = [];
        if (typeof prompt === 'string') {
            messages.push({ role: 'system', content: FALLBACK_SYSTEM });
            messages.push({ role: 'user', content: prompt });
        } else {
            if (prompt.system) messages.push({ role: 'system', content: prompt.system });
            messages.push({ role: 'user', content: prompt.user });
        }
        return {
            url: `${baseUrl}/chat/completions`,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.apiKey}` },
            data: {
                model: s.modelName,
                messages,
                temperature: 0.1,
                response_format: { type: 'json_object' }
            }
        };
    }

    function buildAnthropicRequest(prompt, s) {
        const base = AI_PROVIDERS.anthropic.baseUrl;
        const userText = typeof prompt === 'string' ? prompt : prompt.user;
        const systemText = typeof prompt === 'string' ? FALLBACK_SYSTEM : prompt.system;
        return {
            url: `${base}/v1/messages`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': s.apiKey,
                'anthropic-version': '2025-04-14',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            data: {
                model: s.modelName,
                max_tokens: 8192,
                system: systemText,
                messages: [{ role: 'user', content: userText }],
                temperature: 0.1
            }
        };
    }

    // ================= Token 用量追踪 =================
    const tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0 };

    function resetTokenUsage() {
        tokenUsage.promptTokens = 0;
        tokenUsage.completionTokens = 0;
        tokenUsage.totalTokens = 0;
        tokenUsage.callCount = 0;
    }

    function trackTokenUsage(responseJson, format) {
        try {
            let usage = null;
            if (format === 'openai' || format === 'github') {
                usage = responseJson.usage;
            } else if (format === 'anthropic') {
                usage = responseJson.usage;
            } else if (format === 'gemini') {
                usage = responseJson.usageMetadata;
            }
            if (!usage) return;

            tokenUsage.callCount++;
            if (format === 'gemini') {
                tokenUsage.promptTokens += usage.promptTokenCount || 0;
                tokenUsage.completionTokens += usage.candidatesTokenCount || 0;
                tokenUsage.totalTokens += usage.totalTokenCount || 0;
            } else {
                tokenUsage.promptTokens += usage.prompt_tokens || usage.input_tokens || 0;
                tokenUsage.completionTokens += usage.completion_tokens || usage.output_tokens || 0;
                tokenUsage.totalTokens += usage.total_tokens || (usage.input_tokens || 0) + (usage.output_tokens || 0) || 0;
            }
        } catch (e) { /* 静默失败，不影响主流程 */ }
    }

    function formatTokenCount(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
    }

    // ================= AI 费用估算 =================
    // 价格单位: USD per 1M tokens [input, output]
    const MODEL_PRICING = {
        // Gemini
        'gemini-2.5-flash': [0.15, 0.60], 'gemini-2.5-pro': [1.25, 10.0],
        'gemini-2.0-flash': [0.10, 0.40], 'gemini-1.5-flash': [0.075, 0.30], 'gemini-1.5-pro': [1.25, 5.0],
        // OpenAI
        'gpt-4o': [2.50, 10.0], 'gpt-4o-mini': [0.15, 0.60], 'gpt-4.1': [2.0, 8.0], 'gpt-4.1-mini': [0.40, 1.60], 'gpt-4.1-nano': [0.10, 0.40],
        'o3-mini': [1.10, 4.40], 'o4-mini': [1.10, 4.40],
        // DeepSeek
        'deepseek-chat': [0.27, 1.10], 'deepseek-reasoner': [0.55, 2.19],
        // Anthropic Claude
        'claude-sonnet-4-6': [3.0, 15.0], 'claude-opus-4-6': [15.0, 75.0], 'claude-haiku-4-5': [0.80, 4.0],
        // Groq (free tier, minimal cost)
        'llama-3.3-70b-versatile': [0.59, 0.79],
    };

    function estimateCost(settings) {
        if (tokenUsage.totalTokens === 0) return null;
        const model = settings.modelName || '';
        // 精确匹配 → 前缀匹配
        let pricing = MODEL_PRICING[model];
        if (!pricing) {
            const key = Object.keys(MODEL_PRICING).find(k => model.startsWith(k));
            if (key) pricing = MODEL_PRICING[key];
        }
        if (!pricing) return null;
        const inputCost = (tokenUsage.promptTokens / 1000000) * pricing[0];
        const outputCost = (tokenUsage.completionTokens / 1000000) * pricing[1];
        const totalUSD = inputCost + outputCost;
        const totalCNY = totalUSD * 7.2; // 近似汇率
        if (totalUSD < 0.001) return '< $0.001 (≈ ¥0.01)';
        return `$${totalUSD.toFixed(4)} (≈ ¥${totalCNY.toFixed(3)})`;
    }

    function parseGeminiResponse(text) {
        const json = JSON.parse(text);
        trackTokenUsage(json, 'gemini');
        return json.candidates[0].content.parts[0].text;
    }

    function parseOpenAIResponse(text) {
        const json = JSON.parse(text);
        trackTokenUsage(json, 'openai');
        return json.choices[0].message.content;
    }

    function parseAnthropicResponse(text) {
        const json = JSON.parse(text);
        trackTokenUsage(json, 'anthropic');
        return json.content[0].text;
    }

    function buildGitHubRequest(prompt, s) {
        const messages = [];
        if (typeof prompt === 'string') {
            messages.push({ role: 'system', content: FALLBACK_SYSTEM });
            messages.push({ role: 'user', content: prompt });
        } else {
            if (prompt.system) messages.push({ role: 'system', content: prompt.system });
            messages.push({ role: 'user', content: prompt.user });
        }
        return {
            url: `${AI_PROVIDERS.github.baseUrl}/inference/chat/completions`,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.apiKey}` },
            data: {
                model: s.modelName,
                messages,
                temperature: 0.1,
                response_format: { type: 'json_object' }
            }
        };
    }

    const REQUEST_BUILDERS = { gemini: buildGeminiRequest, openai: buildOpenAIRequest, github: buildGitHubRequest, anthropic: buildAnthropicRequest };
    const RESPONSE_PARSERS = { gemini: parseGeminiResponse, openai: parseOpenAIResponse, github: parseOpenAIResponse, anthropic: parseAnthropicResponse };

    function callAISingle(prompt, settings) {
        const fmt = (AI_PROVIDERS[settings.provider] || {}).format || 'gemini';
        const builder = REQUEST_BUILDERS[fmt] || buildGeminiRequest;
        const parser = RESPONSE_PARSERS[fmt] || parseGeminiResponse;
        const { url, headers, data } = builder(prompt, settings);

        return new Promise((resolve, reject) => {
            // 120秒超时保护，防止请求挂起导致 Promise 永不 settle
            const timeoutId = setTimeout(() => reject({ retryable: true, message: 'AI 请求超时 (120秒)' }), 120000);

            GM_xmlhttpRequest({
                method: 'POST',
                url: url,
                headers: headers,
                data: JSON.stringify(data),
                timeout: 120000,
                onload: function(response) {
                    clearTimeout(timeoutId);
                    // 可重试的状态码：429(限流), 503(过载), 529(过载)
                    if (response.status === 429 || response.status === 503 || response.status === 529) {
                        reject({ retryable: true, message: `API 限流/过载 (${response.status})`, status: response.status });
                        return;
                    }
                    if (response.status !== 200) {
                        let errSnippet = (response.responseText || '').substring(0, 300);
                        // 隐藏可能泄露的 API Key
                        if (settings.apiKey && settings.apiKey.length > 8) {
                            errSnippet = errSnippet.replace(new RegExp(settings.apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '***');
                        }
                        reject(new Error(`API 报错 ${response.status}：${errSnippet}`));
                        return;
                    }
                    try {
                        let content = parser(response.responseText);
                        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                        // 用括号匹配提取第一个完整的 JSON 对象
                        const firstBrace = content.indexOf('{');
                        if (firstBrace !== -1) {
                            let depth = 0;
                            let inString = false;
                            let escape = false;
                            let endPos = -1;
                            for (let ci = firstBrace; ci < content.length; ci++) {
                                const ch = content[ci];
                                if (escape) { escape = false; continue; }
                                if (ch === '\\' && inString) { escape = true; continue; }
                                if (ch === '"') { inString = !inString; continue; }
                                if (inString) continue;
                                if (ch === '{') depth++;
                                else if (ch === '}') { depth--; if (depth === 0) { endPos = ci; break; } }
                            }
                            if (endPos > firstBrace) {
                                content = content.substring(firstBrace, endPos + 1);
                            } else {
                                // fallback: 取到最后一个 }
                                const lastBrace = content.lastIndexOf('}');
                                if (lastBrace > firstBrace) content = content.substring(firstBrace, lastBrace + 1);
                            }
                        }
                        // 尝试直接解析，失败则修复常见问题后重试
                        let parsed;
                        try {
                            parsed = JSON.parse(content);
                        } catch (parseErr) {
                            // 修复 trailing comma（如 [1,2,] 或 {"a":1,}）
                            const fixed = content.replace(/,\s*([\]}])/g, '$1');
                            parsed = JSON.parse(fixed);
                        }
                        resolve(parsed);
                    } catch (e) {
                        reject(new Error(`解析 AI 回复失败: ${e.message}`));
                    }
                },
                onerror: function(resp) {
                    clearTimeout(timeoutId);
                    const detail = (resp && resp.error) ? ` (${resp.error})` : '';
                    reject({ retryable: true, message: `网络请求失败${detail}，请检查网络或 API 地址` });
                },
                ontimeout: function() {
                    clearTimeout(timeoutId);
                    reject({ retryable: true, message: 'AI 请求超时' });
                }
            });
        });
    }

    // 带自动重试的 AI 调用（指数退避，最多重试3次，针对限流/超时/网络错误）
    async function callAI(prompt, settings, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await callAISingle(prompt, settings);
            } catch (err) {
                const isRetryable = err && err.retryable;
                const errMsg = err.message || String(err);
                if (isRetryable && attempt < maxRetries) {
                    const waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 16000);
                    logStatus(`⚠️ AI 请求失败 (${errMsg})，${(waitMs / 1000).toFixed(0)}秒后重试 (${attempt}/${maxRetries})...`);
                    await sleep(waitMs);
                    continue;
                }
                throw new Error(errMsg);
            }
        }
    }

    // ================= 模型列表获取 =================
    // GM_xmlhttpRequest 的 Promise 封装（用于模型列表获取）
    function gmFetch(url, headers) {
        return new Promise((resolve, reject) => {
            const TIMEOUT_MS = 30000;
            const timeoutId = setTimeout(() => reject(new Error('请求超时 (30秒)')), TIMEOUT_MS);

            GM_xmlhttpRequest({
                method: 'GET', url, headers: headers || {},
                timeout: TIMEOUT_MS,
                onload: r => {
                    clearTimeout(timeoutId);
                    if (r.status !== 200) {
                        const snippet = (r.responseText || '').substring(0, 300);
                        reject(new Error(`获取失败 (${r.status}): ${snippet}`));
                        return;
                    }
                    try {
                        resolve(JSON.parse(r.responseText));
                    } catch (e) {
                        reject(new Error('响应解析失败 (非JSON): ' + (r.responseText || '').substring(0, 200)));
                    }
                },
                onerror: (resp) => { clearTimeout(timeoutId); const detail = (resp && resp.error) ? ` (${resp.error})` : ''; reject(new Error(`网络请求失败${detail}`)); },
                ontimeout: () => { clearTimeout(timeoutId); reject(new Error('请求超时')); }
            });
        });
    }

    async function fetchModelList(settings) {
        const config = AI_PROVIDERS[settings.provider];
        if (!config) throw new Error('不支持的提供商');
        const fmt = config.format;

        if (fmt === 'gemini') {
            // Gemini 需要分页获取全部模型
            const allModels = [];
            let pageToken = '';
            do {
                const pageUrl = `${config.baseUrl}/models?key=${settings.apiKey}&pageSize=100${pageToken ? '&pageToken=' + pageToken : ''}`;
                const json = await gmFetch(pageUrl);
                const models = (json.models || [])
                    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
                allModels.push(...models);
                pageToken = json.nextPageToken || '';
            } while (pageToken);
            allModels.sort();
            return allModels;
        }

        let url, headers;
        if (fmt === 'openai') {
            url = `${getProviderBaseUrl(settings)}/models`;
            headers = { 'Authorization': `Bearer ${settings.apiKey}` };
        } else if (fmt === 'github') {
            url = `${config.baseUrl}/catalog/models`;
            headers = { 'Authorization': `Bearer ${settings.apiKey}` };
        } else if (fmt === 'anthropic') {
            url = `${config.baseUrl}/v1/models`;
            headers = { 'x-api-key': settings.apiKey, 'anthropic-version': '2024-10-22' };
        } else {
            throw new Error('不支持的提供商');
        }

        const json = await gmFetch(url, headers);
        let models = [];
        if (fmt === 'github') {
            models = (Array.isArray(json) ? json : json.data || json.models || [])
                .map(m => m.id || m.name || '').filter(Boolean);
        } else {
            models = (json.data || []).map(m => m.id).filter(Boolean);
        }
        models.sort();
        return models;
    }

    // ================= 工具函数 =================
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // HTML 转义：防止 XSS
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // 按钮加载动画 SVG（转圈弧线）
    const SPIN_SVG = '<svg class="ai-btn-spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

    /**
     * 统一的按钮加载动画 + 可选倒计时气泡 + 超时保护
     * @param {HTMLElement} btn 按钮元素
     * @param {Function} asyncFn 返回 Promise 的异步函数
     * @param {Object} opts 选项
     *   timeout: 超时毫秒数（0=不限）
     *   countdown: 是否显示倒计时气泡
     *   successText: 成功文本（emoji），默认 '✅'
     *   failText: 失败文本（emoji），默认 '❌'
     *   restoreDelay: 恢复原图标的延迟（ms），默认 2000
     */
    async function withLoadingAnimation(btn, asyncFn, opts = {}) {
        const { timeout = 0, countdown = false, successText = '✅', failText = '❌', restoreDelay = 2000 } = opts;
        const originalHTML = btn.innerHTML;
        const originalPosition = btn.style.position;

        // 设置按钮为加载态
        btn.classList.add('ai-btn-loading');
        btn.disabled = true;
        btn.style.position = 'relative';
        btn.innerHTML = SPIN_SVG;

        // 倒计时气泡（挂载到 body，用 fixed 定位跟随按钮）
        let bubble = null;
        let countdownInterval = null;
        let bubblePositionRAF = null;
        if (countdown && timeout > 0) {
            let remaining = Math.ceil(timeout / 1000);
            bubble = document.createElement('span');
            bubble.className = 'ai-countdown-bubble';
            bubble.innerHTML = `✨ <span class="ai-cd-num">${remaining}s</span>`;
            document.body.appendChild(bubble);
            // 用 fixed 定位让气泡浮在按钮上方
            const positionBubble = () => {
                const rect = btn.getBoundingClientRect();
                bubble.style.position = 'fixed';
                bubble.style.left = (rect.left + rect.width / 2) + 'px';
                bubble.style.top = (rect.top - 8) + 'px';
                bubble.style.transform = 'translate(-50%, -100%)';
                bubblePositionRAF = requestAnimationFrame(positionBubble);
            };
            positionBubble();
            countdownInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) { clearInterval(countdownInterval); return; }
                const numEl = bubble.querySelector('.ai-cd-num');
                if (numEl) numEl.textContent = remaining + 's';
            }, 1000);
        }

        const cleanup = () => {
            if (countdownInterval) clearInterval(countdownInterval);
            if (bubblePositionRAF) cancelAnimationFrame(bubblePositionRAF);
            if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
            btn.classList.remove('ai-btn-loading');
            btn.style.position = originalPosition;
        };

        const restore = (text) => {
            cleanup();
            btn.textContent = text;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
            }, restoreDelay);
        };

        try {
            let result;
            if (timeout > 0) {
                result = await Promise.race([
                    asyncFn(),
                    new Promise((_, rej) => setTimeout(() => rej(new Error(`操作超时 (${Math.ceil(timeout / 1000)}秒)`)), timeout))
                ]);
            } else {
                result = await asyncFn();
            }
            return { success: true, result, restore };
        } catch (err) {
            return { success: false, error: err, restore };
        }
    }

    // 简化版：仅添加转圈动画（不超时、不倒计时）给工具按钮
    function btnStartLoading(btn) {
        btn._origHTML = btn.innerHTML;
        btn.classList.add('ai-btn-loading');
        btn.innerHTML = SPIN_SVG + '<span style="margin-left:3px;">' + (btn.textContent.trim().replace(/^[\s\S]*?\s/, '') || '') + '</span>';
    }
    function btnStopLoading(btn) {
        btn.classList.remove('ai-btn-loading');
        if (btn._origHTML) { btn.innerHTML = btn._origHTML; delete btn._origHTML; }
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
    }

    // 防抖函数
    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // 并发控制器：限制最多同时运行 maxConcurrent 个异步任务
    function createConcurrencyLimiter(maxConcurrent) {
        let running = 0;
        const queue = [];
        function tryNext() {
            while (running < maxConcurrent && queue.length > 0) {
                running++;
                const { fn, resolve, reject } = queue.shift();
                try {
                    const p = fn();
                    // 确保是 Promise
                    Promise.resolve(p).then(resolve, reject).finally(() => { running--; tryNext(); });
                } catch (e) {
                    // fn() 同步抛异常时也要正确处理
                    running--;
                    reject(e);
                    tryNext();
                }
            }
        }
        return function(fn) {
            return new Promise((resolve, reject) => {
                queue.push({ fn, resolve, reject });
                tryNext();
            });
        };
    }

    // ================= 浏览器通知 =================
    async function requestNotificationPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;
        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    function sendNotification(title, body, icon) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            const n = new Notification(title, {
                body, icon: icon || 'https://www.bilibili.com/favicon.ico',
                tag: 'bfao-notify', requireInteraction: false
            });
            setTimeout(() => n.close(), 8000);
        } catch (e) { console.warn('[AI整理] 通知失败:', e); }
    }

    // ================= 自适应限速 =================
    // 全局冷却：被限流后强制等待，防止连续请求全部 412
    let _globalCooldownUntil = 0; // 时间戳，在此时间之前不发请求
    const RATE_LIMIT_COOLDOWN_BASE = 8000; // 首次被限流后冷却 8 秒
    const RATE_LIMIT_COOLDOWN_MAX = 60000; // 最大冷却 60 秒

    function setGlobalCooldown() {
        // 冷却时间随连续限流次数指数增长：8s, 16s, 32s, 最大 60s
        const hits = state.adaptive.rateLimitHits || 1;
        const cooldownMs = Math.min(RATE_LIMIT_COOLDOWN_MAX, RATE_LIMIT_COOLDOWN_BASE * Math.pow(2, Math.min(hits - 1, 3)));
        _globalCooldownUntil = Date.now() + cooldownMs;
        return cooldownMs;
    }

    async function waitForGlobalCooldown() {
        const remaining = _globalCooldownUntil - Date.now();
        if (remaining > 0) {
            logStatus(`🛡️ 全局冷却中，等待 ${(remaining / 1000).toFixed(1)} 秒后继续...`);
            await sleep(remaining);
        }
    }

    function adaptiveOnRateLimit(settings) {
        if (!settings.adaptiveRate) return;
        state.adaptive.rateLimitHits++;
        state.adaptive.successStreak = 0;
        // 每次被限流，延迟翻倍，上限为原始值的 8 倍
        const maxFetch = settings.fetchDelay * 8;
        const maxWrite = settings.writeDelay * 8;
        state.adaptive.currentFetchDelay = Math.min(maxFetch, Math.round(state.adaptive.currentFetchDelay * 2));
        state.adaptive.currentWriteDelay = Math.min(maxWrite, Math.round(state.adaptive.currentWriteDelay * 2));
        // 设置全局冷却
        const cooldownMs = setGlobalCooldown();
        logStatus(`⚡ 自适应限速：延迟提升至 ${state.adaptive.currentFetchDelay}ms，全局冷却 ${(cooldownMs / 1000).toFixed(0)}s (已被限流 ${state.adaptive.rateLimitHits} 次)`);
    }

    function adaptiveOnSuccess(settings) {
        if (!settings.adaptiveRate) return;
        state.adaptive.successStreak++;
        // 连续成功 5 次后，尝试降低延迟（最低到原始设定值）
        if (state.adaptive.successStreak >= 5 && state.adaptive.rateLimitHits > 0) {
            const minFetch = settings.fetchDelay;
            const minWrite = settings.writeDelay;
            state.adaptive.currentFetchDelay = Math.max(minFetch, Math.round(state.adaptive.currentFetchDelay * 0.85));
            state.adaptive.currentWriteDelay = Math.max(minWrite, Math.round(state.adaptive.currentWriteDelay * 0.85));
            state.adaptive.successStreak = 0;
        }
    }

    function getAdaptiveFetchDelay() {
        return state.adaptive.currentFetchDelay || loadSettings().fetchDelay;
    }

    function getAdaptiveWriteDelay() {
        return state.adaptive.currentWriteDelay || loadSettings().writeDelay;
    }

    function initAdaptiveState(settings) {
        state.adaptive.rateLimitHits = 0;
        state.adaptive.successStreak = 0;
        state.adaptive.currentFetchDelay = settings.fetchDelay;
        state.adaptive.currentWriteDelay = settings.writeDelay;
        _globalCooldownUntil = 0;
    }

    // 模拟真人行为的随机延迟：在 base 基础上加 ±30% 随机抖动
    function humanDelay(baseMs) {
        const jitter = baseMs * 0.3;
        const actual = baseMs + (Math.random() * 2 - 1) * jitter;
        return sleep(Math.max(100, Math.round(actual)));
    }

    // 安全的 B站 API 请求：处理 412 限流、非 JSON 响应，自动重试，含超时保护
    // 增强：全局冷却 + 指数退避 + 动态读取自适应延迟
    async function safeFetchJson(url, maxRetries = 4) {
        const settings = loadSettings();
        // 请求前先等待全局冷却（如果之前被限流过）
        await waitForGlobalCooldown();
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
            let res;
            try {
                res = await fetch(url, { credentials: 'include', signal: controller.signal });
            } catch (e) {
                clearTimeout(timeoutId);
                if (e.name === 'AbortError') throw new Error('B站 API 请求超时 (30秒)');
                throw e;
            }
            clearTimeout(timeoutId);
            if (res.status === 412 || res.status === 429) {
                adaptiveOnRateLimit(settings);
                // 指数退避：5s, 10s, 20s, 40s（比之前的 1.5s/3s/4.5s 大幅提升）
                const retryBaseMs = 5000;
                const waitMs = retryBaseMs * Math.pow(2, attempt - 1);
                logStatus(`⚠️ 被 B 站限流 (${res.status})，等待 ${(waitMs/1000).toFixed(0)} 秒后重试 (${attempt}/${maxRetries})...`);
                await sleep(waitMs);
                // 重试前再次等待全局冷却（adaptiveOnRateLimit 可能又设置了冷却）
                await waitForGlobalCooldown();
                continue;
            }
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const text = await res.text();
            try {
                const json = JSON.parse(text);
                adaptiveOnSuccess(settings);
                return json;
            } catch (e) {
                throw new Error(`响应不是 JSON: ${text.substring(0, 100)}`);
            }
        }
        throw new Error(`重试 ${maxRetries} 次仍被限流，请稍后再试`);
    }

    function formatDuration(seconds) {
        if (!seconds || seconds <= 0) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        return `${m}:${String(s).padStart(2,'0')}`;
    }

    function isDeadVideo(v) {
        return v.attr !== undefined && (v.attr & 2) !== 0;
    }

    const LOG_MAX_ENTRIES = 500; // 防止日志过多导致 DOM 膨胀
    function logStatus(msg) {
        console.log(msg);
        const logDiv = document.getElementById('ai-status-log');
        if (!logDiv) return;
        const div = document.createElement('div');
        div.className = 'ai-log-entry';
        // 根据内容自动着色
        if (msg.includes('❌') || msg.includes('失败')) div.classList.add('ai-log-error');
        else if (msg.includes('⚠️') || msg.includes('警告')) div.classList.add('ai-log-warning');
        else if (msg.includes('✅') || msg.includes('完成') || msg.includes('🎉')) div.classList.add('ai-log-success');
        else if (msg.includes('🧠') || msg.includes('📥') || msg.includes('🚚')) div.classList.add('ai-log-info');
        const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
        const safeMsg = escapeHtml(msg);
        div.innerHTML = `<span class="ai-log-time">${time}</span><span class="ai-log-msg">${safeMsg}</span>`;
        logDiv.appendChild(div);
        // 超过上限时移除最早的条目，防止内存泄漏
        while (logDiv.children.length > LOG_MAX_ENTRIES) logDiv.removeChild(logDiv.firstChild);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    // ================= 页面标题进度 =================
    // 后台标签页也能看到进度百分比
    let _originalTitle = '';
    function setTitleProgress(percent, phase) {
        if (!_originalTitle) _originalTitle = document.title;
        if (percent < 0) {
            document.title = _originalTitle;
        } else {
            const phaseNames = { fetch: '抓取', ai: 'AI', move: '移动' };
            document.title = `[${percent}% ${phaseNames[phase] || ''}] ${_originalTitle}`;
        }
    }

    // ================= 进度条 =================
    // 各阶段独立计时，用于更精确的 ETA 估算
    const phaseTimers = {};

    function updateProgress(phase, current, total) {
        state.progressPhase = phase;
        state.progressCurrent = current;
        state.progressTotal = total;

        const bar = document.getElementById('ai-progress-bar');
        const text = document.getElementById('ai-progress-text');
        if (!bar || !text) return;

        // 记录阶段首次调用时间
        if (!phaseTimers[phase]) phaseTimers[phase] = { start: Date.now(), lastCurrent: 0 };
        phaseTimers[phase].lastCurrent = current;

        // 三阶段权重: fetch=30%, ai=50%, move=20%
        let overallPercent = 0;
        if (phase === 'fetch') overallPercent = Math.round((current / Math.max(total, 1)) * 30);
        else if (phase === 'ai') overallPercent = 30 + Math.round((current / Math.max(total, 1)) * 50);
        else if (phase === 'move') overallPercent = 80 + Math.round((current / Math.max(total, 1)) * 20);

        bar.style.width = overallPercent + '%';
        setTitleProgress(overallPercent, phase);

        // 阶段内 ETA：基于当前阶段的实际速率，而非全局线性推算
        let eta = '';
        const pt = phaseTimers[phase];
        const phaseElapsed = (Date.now() - pt.start) / 1000;
        const phasePercent = current / Math.max(total, 1);
        if (phasePercent > 0.05 && phasePercent < 1 && phaseElapsed > 2) {
            const phaseRemaining = Math.max(0, (phaseElapsed / phasePercent) * (1 - phasePercent));
            if (phaseRemaining < 60) eta = `~${Math.ceil(phaseRemaining)}秒`;
            else eta = `~${Math.ceil(phaseRemaining / 60)}分钟`;
        }

        const phaseNames = { fetch: '抓取', ai: 'AI分析', move: '移动' };
        text.textContent = `${phaseNames[phase] || ''} ${current}/${total} (${overallPercent}%)${eta ? ' ' + eta : ''}`;

        document.getElementById('ai-progress-wrap').style.display = 'block';
    }

    function hideProgress() {
        const wrap = document.getElementById('ai-progress-wrap');
        if (wrap) wrap.style.display = 'none';
        setTitleProgress(-1);
    }

    // ================= Gemini API =================
    // callGeminiAPI 已被统一的 callAI() 替代（见上方 API 适配层）

    // ================= B站 API =================
    function getBiliData() {
        const midMatch = document.cookie.match(/DedeUserID=([^;]+)/);
        const csrfMatch = document.cookie.match(/bili_jct=([^;]+)/);
        return { mid: midMatch ? midMatch[1] : '', csrf: csrfMatch ? csrfMatch[1] : '' };
    }

    function getSourceMediaId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('fid') || params.get('media_id') || params.get('id');
    }

    function buildFormData(obj) {
        return new URLSearchParams(obj).toString();
    }

    // 文件夹列表缓存（避免同一会话内重复请求）
    let _folderListCache = null;
    let _folderListCacheTime = 0;
    const FOLDER_CACHE_TTL = 300000; // 5分钟缓存（长操作期间减少重复请求）

    async function getAllFoldersWithIds(biliData) {
        const now = Date.now();
        if (_folderListCache && (now - _folderListCacheTime) < FOLDER_CACHE_TTL) {
            return _folderListCache;
        }
        const url = `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${biliData.mid}`;
        const res = await lightFetchJson(url);
        if (res.code === 0 && res.data && res.data.list) {
            _folderListCache = res.data.list;
            _folderListCacheTime = now;
            return res.data.list;
        }
        return [];
    }

    function invalidateFolderCache() {
        _folderListCache = null;
        _folderListCacheTime = 0;
    }

    // 增量更新缓存：新建收藏夹时直接追加到缓存，避免重新请求完整列表
    function appendToFolderCache(newFolder) {
        if (_folderListCache && Array.isArray(_folderListCache)) {
            _folderListCache.push(newFolder);
        }
    }

    async function getMyFolders(biliData) {
        const allFolders = await getAllFoldersWithIds(biliData);
        const folderMap = {};
        allFolders.forEach(f => {
            if (f.title !== '默认收藏夹') folderMap[f.title] = f.id;
        });
        return folderMap;
    }

    async function createFolder(title, biliData) {
        logStatus(`📁 正在新建收藏夹：【${title}】`);
        const url = 'https://api.bilibili.com/x/v3/fav/folder/add';
        const data = buildFormData({ title: title, privacy: 1, csrf: biliData.csrf });

        await waitForGlobalCooldown();
        for (let attempt = 1; attempt <= 3; attempt++) {
            const res = await fetch(url, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data
            }).then(r => r.json());
            if (res.code === 0) {
                appendToFolderCache({ id: res.data.id, title: title, media_count: 0 });
                await humanDelay(1000); // 创建后等待，防止连续创建触发限流
                return res.data.id;
            }
            if (res.code === -412 || res.code === -429) {
                const settings = loadSettings();
                adaptiveOnRateLimit(settings);
                const waitMs = 3000 * Math.pow(2, attempt - 1);
                logStatus(`⚠️ 创建收藏夹被限流，等待 ${(waitMs/1000).toFixed(0)}s 后重试 (${attempt}/3)...`);
                await sleep(waitMs);
                await waitForGlobalCooldown();
                continue;
            }
            throw new Error(`新建失败: ${res.message}`);
        }
        throw new Error(`创建收藏夹重试 3 次仍被限流`);
    }

    async function moveVideos(sourceMediaId, tarMediaId, resourcesStr, biliData) {
        const url = 'https://api.bilibili.com/x/v3/fav/resource/move';
        const payload = {
            src_media_id: sourceMediaId, tar_media_id: tarMediaId, mid: biliData.mid, resources: resourcesStr, csrf: biliData.csrf
        };

        await waitForGlobalCooldown();
        for (let attempt = 1; attempt <= 4; attempt++) {
            const res = await fetch(url, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: buildFormData(payload)
            }).then(r => r.json());

            if (res.code === 0) return true;

            // 限流重试：指数退避
            if (res.code === -412 || res.code === -429) {
                const settings = loadSettings();
                adaptiveOnRateLimit(settings);
                const waitMs = 5000 * Math.pow(2, attempt - 1);
                logStatus(`⚠️ 移动操作被限流，等待 ${(waitMs/1000).toFixed(0)}s 后重试 (${attempt}/4)...`);
                await sleep(waitMs);
                await waitForGlobalCooldown();
                continue;
            }

            logStatus(`⚠️ 移动失败 (code ${res.code}): ${res.message || '未知错误'}`);
            console.error("移动失败：", res);
            if (attempt < 4) {
                await sleep(3000 * attempt);
            }
        }
        return false; // 4次重试均失败
    }

    async function batchDeleteVideos(mediaId, resources, biliData) {
        const url = 'https://api.bilibili.com/x/v3/fav/resource/batch-del';
        const data = buildFormData({
            media_id: mediaId, resources: resources, csrf: biliData.csrf
        });

        await waitForGlobalCooldown();
        for (let attempt = 1; attempt <= 3; attempt++) {
            const res = await fetch(url, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data
            }).then(r => r.json());
            if (res.code === 0) return true;
            if (res.code === -412 || res.code === -429) {
                const settings = loadSettings();
                adaptiveOnRateLimit(settings);
                const waitMs = 3000 * Math.pow(2, attempt - 1);
                logStatus(`⚠️ 删除操作被限流，等待 ${(waitMs/1000).toFixed(0)}s 后重试 (${attempt}/3)...`);
                await sleep(waitMs);
                await waitForGlobalCooldown();
                continue;
            }
            console.error("删除失败：", res.message);
            return false;
        }
        logStatus(`⚠️ 删除操作重试 3 次仍被限流`);
        return false;
    }

    async function fetchAllVideos(mediaId, onProgress) {
        const { fetchDelay } = loadSettings();
        let allVideos = [];
        let pn = 1;
        const ps = 40;
        let totalCount = 0;
        let totalPages = 0;

        while (true) {
            if (state.cancelRequested) break;
            if (pn <= 3 || pn % 10 === 0) {
                logStatus(`正在读取第 ${pn}${totalPages > 0 ? ` / ${totalPages}` : ''} 页...`);
            }
            const listUrl = `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${mediaId}&pn=${pn}&ps=${ps}&platform=web`;
            let listRes;
            try {
                listRes = await safeFetchJson(listUrl);
            } catch (e) {
                logStatus(`❌ 读取出错: ${e.message}`);
                break;
            }

            if (listRes.code !== 0) {
                logStatus(`❌ 读取出错: ${listRes.message}`);
                break;
            }

            if (pn === 1 && listRes.data && listRes.data.info) {
                totalCount = listRes.data.info.media_count || 0;
                totalPages = Math.ceil(totalCount / ps);
                logStatus(`📊 收藏夹共 ${totalCount} 个视频，约 ${totalPages} 页`);
            }

            const videos = (listRes.data && listRes.data.medias) ? listRes.data.medias : [];
            allVideos.push(...videos);

            if (onProgress) onProgress(pn, totalPages || pn);

            const hasMore = listRes.data && listRes.data.has_more;
            if (!hasMore || videos.length === 0) break;
            pn++;
            await humanDelay(fetchDelay);
        }
        return allVideos;
    }

    // ================= 收藏夹备份/恢复 =================
    // 轻量级只读请求：备份只读取数据，使用更短的重试延迟，不影响全局自适应状态
    async function lightFetchJson(url, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            let res;
            try {
                res = await fetch(url, { credentials: 'include', signal: controller.signal });
            } catch (e) {
                clearTimeout(timeoutId);
                if (e.name === 'AbortError') throw new Error('请求超时 (15秒)');
                throw e;
            }
            clearTimeout(timeoutId);
            if (res.status === 412 || res.status === 429) {
                const waitMs = 2000 * Math.pow(2, attempt - 1); // 2s, 4s, 8s
                logStatus(`⏳ 限流 (${res.status})，等待 ${(waitMs/1000).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`);
                await sleep(waitMs);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            try { return JSON.parse(text); }
            catch (e) { throw new Error(`响应不是 JSON: ${text.substring(0, 100)}`); }
        }
        throw new Error(`重试 ${maxRetries} 次仍被限流`);
    }

    async function backupFavorites(biliData, silent) {
        if (!silent) logStatus('💾 正在备份收藏夹结构...');
        const allFolders = await getAllFoldersWithIds(biliData);
        const backup = {
            version: '1.0',
            time: new Date().toISOString(),
            timeLocal: new Date().toLocaleString('zh-CN'),
            mid: biliData.mid,
            folders: []
        };

        for (let i = 0; i < allFolders.length; i++) {
            const folder = allFolders[i];
            const totalPages = Math.ceil((folder.media_count || 0) / 40) || 1;
            if (!silent) logStatus(`💾 备份 [${i + 1}/${allFolders.length}] ${folder.title} (约${totalPages}页)...`);
            const folderData = { id: folder.id, title: folder.title, media_count: folder.media_count, videos: [] };

            let pn = 1;
            while (true) {
                if (state.cancelRequested) break;
                try {
                    const res = await lightFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=40&platform=web`);
                    if (res.code !== 0) break;
                    const medias = (res.data && res.data.medias) || [];
                    medias.forEach(v => {
                        folderData.videos.push({ id: v.id, type: v.type, title: v.title, bvid: v.bvid || '' });
                    });
                    if (!silent && pn > 1) logStatus(`  📄 ${folder.title} 第 ${pn}/${totalPages} 页，已获取 ${folderData.videos.length} 个视频`);
                    if (!res.data.has_more || medias.length === 0) break;
                    pn++;
                    await humanDelay(1000); // 固定轻量延迟，不受自适应影响
                } catch (e) {
                    if (!silent) logStatus(`⚠️ 备份 ${folder.title} 第 ${pn} 页失败: ${e.message}，跳过后续页`);
                    break;
                }
            }
            backup.folders.push(folderData);
            if (!silent) logStatus(`  ✅ ${folder.title}: ${folderData.videos.length} 个视频`);
            await humanDelay(800); // 文件夹间固定短延迟
        }

        return backup;
    }

    function downloadBackupFile(backup) {
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bilibili-favorites-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    // ================= 设置导出/导入 =================
    function exportSettings() {
        const s = loadSettings();
        // 不导出 API Key（安全考虑），用户需手动填写
        const exported = { ...s, apiKey: '', _exportTime: new Date().toISOString(), _version: '1.0' };
        const json = JSON.stringify(exported, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bfao-settings-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        logStatus('✅ 设置已导出（不含 API Key）');
    }

    function importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const imported = JSON.parse(text);
                if (!imported._version) throw new Error('无效的设置文件');
                // 保留当前 API Key
                const currentSettings = loadSettings();
                imported.apiKey = currentSettings.apiKey;
                delete imported._exportTime;
                delete imported._version;
                saveSettings(imported);
                logStatus('✅ 设置已导入，请刷新面板查看');
                alert('设置导入成功！请关闭并重新打开面板查看新设置。');
            } catch (err) {
                alert('导入失败: ' + err.message);
            }
        };
        input.click();
    }

    // ================= 日志导出 =================
    function exportLogs() {
        const logDiv = document.getElementById('ai-status-log');
        if (!logDiv) return;
        const lines = [...logDiv.querySelectorAll('div')].map(d => d.textContent).join('\n');
        if (!lines.trim()) { alert('暂无日志'); return; }
        const blob = new Blob([lines], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bfao-log-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    // ================= 整理报告导出 =================
    function generateOrganizeReport(allCategories, videoIdMap, existingFoldersMap, elapsedStr, tokenInfo) {
        const catEntries = Object.entries(allCategories);
        const totalVids = catEntries.reduce((s, [, v]) => s + v.length, 0);
        const newCats = catEntries.filter(([name]) => !existingFoldersMap[name]);
        const existingCats = catEntries.filter(([name]) => existingFoldersMap[name]);

        // 置信度统计
        const allConfs = [];
        catEntries.forEach(([, vids]) => {
            vids.forEach(v => {
                if (v.conf !== undefined && v.conf !== null) allConfs.push(parseFloat(v.conf));
            });
        });
        const avgConf = allConfs.length > 0 ? (allConfs.reduce((a, b) => a + b, 0) / allConfs.length * 100).toFixed(1) : 'N/A';
        const lowConfCount = allConfs.filter(c => c < 0.7).length;

        // UP主统计
        const upCounter = {};
        catEntries.forEach(([, vids]) => {
            vids.forEach(v => {
                const info = videoIdMap[v.id];
                if (info && info.upper && info.upper.name) {
                    upCounter[info.upper.name] = (upCounter[info.upper.name] || 0) + 1;
                }
            });
        });
        const topUps = Object.entries(upCounter).sort((a, b) => b[1] - a[1]).slice(0, 10);

        const now = new Date().toLocaleString('zh-CN');

        // 每个分类的详情
        let catDetails = '';
        catEntries.sort((a, b) => b[1].length - a[1].length).forEach(([catName, vids]) => {
            const isNew = !existingFoldersMap[catName];
            const confs = vids.map(v => v.conf).filter(c => c !== undefined && c !== null).map(Number);
            const catAvg = confs.length > 0 ? (confs.reduce((a, b) => a + b, 0) / confs.length * 100).toFixed(0) : '-';
            catDetails += `<div style="margin-bottom:16px;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                <div style="padding:10px 14px;background:${isNew ? '#fff3e0' : '#e8f5e9'};display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:bold;font-size:14px;">${escapeHtml(catName)} <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${isNew ? '#ff9800' : '#4caf50'};color:#fff;">${isNew ? '新建' : '已有'}</span></span>
                    <span style="font-size:12px;color:#666;">${vids.length} 个视频 · 平均置信度 ${catAvg}%</span>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                    <thead><tr style="background:#f5f5f5;"><th style="padding:6px 10px;text-align:left;">视频标题</th><th style="padding:6px;width:80px;">UP主</th><th style="padding:6px;width:60px;">置信度</th></tr></thead>
                    <tbody>${vids.slice(0, 50).map(v => {
                        const info = videoIdMap[v.id];
                        const title = info ? escapeHtml(info.title) : `ID:${v.id}`;
                        const up = info && info.upper ? escapeHtml(info.upper.name) : '';
                        const conf = v.conf !== undefined ? (parseFloat(v.conf) * 100).toFixed(0) + '%' : '-';
                        const confColor = v.conf !== undefined ? (parseFloat(v.conf) >= 0.8 ? '#4caf50' : parseFloat(v.conf) >= 0.5 ? '#f39c12' : '#e74c3c') : '#999';
                        return `<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:5px 10px;">${title}</td><td style="padding:5px 6px;color:#666;">${up}</td><td style="padding:5px 6px;text-align:center;color:${confColor};font-weight:bold;">${conf}</td></tr>`;
                    }).join('')}${vids.length > 50 ? `<tr><td colspan="3" style="padding:6px 10px;color:#999;text-align:center;">...还有 ${vids.length - 50} 个视频</td></tr>` : ''}</tbody>
                </table>
            </div>`;
        });

        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>B站收藏夹整理报告 - ${now}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#333;background:#fafafa;}
h1{text-align:center;color:#fb7299;margin-bottom:4px;}
.subtitle{text-align:center;color:#999;font-size:13px;margin-bottom:30px;}
.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:30px;}
.summary-card{background:#fff;border-radius:10px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.summary-card .num{font-size:28px;font-weight:bold;color:#fb7299;}
.summary-card .label{font-size:11px;color:#999;margin-top:4px;}
.section{margin-bottom:30px;}
.section h2{font-size:16px;border-bottom:2px solid #fb7299;padding-bottom:6px;margin-bottom:12px;}
table{width:100%;border-collapse:collapse;}
@media print{body{background:#fff;}}
</style></head>
<body>
<h1>B站收藏夹整理报告</h1>
<div class="subtitle">${now} · 耗时 ${elapsedStr || 'N/A'}${tokenInfo ? ' · ' + tokenInfo : ''}</div>

<div class="summary">
    <div class="summary-card"><div class="num">${totalVids}</div><div class="label">处理视频数</div></div>
    <div class="summary-card"><div class="num">${catEntries.length}</div><div class="label">分类总数</div></div>
    <div class="summary-card"><div class="num">${newCats.length}</div><div class="label">新建分类</div></div>
    <div class="summary-card"><div class="num">${existingCats.length}</div><div class="label">已有分类</div></div>
    <div class="summary-card"><div class="num">${avgConf}%</div><div class="label">平均置信度</div></div>
    <div class="summary-card"><div class="num" style="color:${lowConfCount > 0 ? '#e74c3c' : '#4caf50'};">${lowConfCount}</div><div class="label">低置信度</div></div>
</div>

<div class="section">
    <h2>分类概览</h2>
    <table>
        <thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;">分类名称</th><th style="padding:8px;width:70px;">视频数</th><th style="padding:8px;width:60px;">状态</th></tr></thead>
        <tbody>${catEntries.sort((a, b) => b[1].length - a[1].length).map(([name, vids]) => {
            const isNew = !existingFoldersMap[name];
            return `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px 8px;">${escapeHtml(name)}</td><td style="padding:6px 8px;text-align:center;">${vids.length}</td><td style="padding:6px 8px;text-align:center;"><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${isNew ? '#fff3e0' : '#e8f5e9'};color:${isNew ? '#e65100' : '#2e7d32'};">${isNew ? '新建' : '已有'}</span></td></tr>`;
        }).join('')}</tbody>
    </table>
</div>

${topUps.length > 0 ? `<div class="section">
    <h2>TOP UP主</h2>
    <table><thead><tr style="background:#f5f5f5;"><th style="padding:6px 8px;text-align:left;">UP主</th><th style="padding:6px 8px;width:60px;">视频数</th></tr></thead>
    <tbody>${topUps.map(([name, count]) => `<tr style="border-bottom:1px solid #eee;"><td style="padding:5px 8px;">${escapeHtml(name)}</td><td style="padding:5px 8px;text-align:center;">${count}</td></tr>`).join('')}</tbody></table>
</div>` : ''}

<div class="section">
    <h2>分类详情</h2>
    ${catDetails}
</div>

<div style="text-align:center;color:#ccc;font-size:11px;margin-top:40px;">由 B站 AI 收藏夹整理助理 生成</div>
</body></html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bilibili-organize-report-${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        logStatus('📄 整理报告已导出');
    }

    // 快速备份：仅保存文件夹→视频ID映射（用于撤销前的保护）
    async function quickBackupStructure(biliData, mediaIds) {
        const structure = {};
        for (const mediaId of mediaIds) {
            structure[mediaId] = [];
            let pn = 1;
            while (true) {
                try {
                    const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${mediaId}&pn=${pn}&ps=40&platform=web`);
                    if (res.code !== 0) break;
                    const medias = (res.data && res.data.medias) || [];
                    medias.forEach(v => structure[mediaId].push({ id: v.id, type: v.type }));
                    if (!res.data.has_more || medias.length === 0) break;
                    pn++;
                    await humanDelay(getAdaptiveFetchDelay());
                } catch (e) { break; }
            }
        }
        return structure;
    }

    // ================= 撤销/回滚（支持历史栈，保留最近5次） =================
    const UNDO_HISTORY_MAX = 5;

    function saveUndoData(undoData) {
        try {
            const history = loadUndoHistory();
            history.unshift(undoData);
            GM_setValue('bfao_undoHistory', JSON.stringify(history.slice(0, UNDO_HISTORY_MAX)));
            // 兼容旧版
            GM_setValue('bfao_undoData', JSON.stringify(undoData));
        } catch (e) { console.error('[AI整理] 保存撤销数据失败:', e); }
    }

    function loadUndoHistory() {
        try {
            const raw = GM_getValue('bfao_undoHistory', null);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
            // 兼容旧版：从单条记录迁移
            const oldRaw = GM_getValue('bfao_undoData', null);
            if (oldRaw) {
                const oldData = JSON.parse(oldRaw);
                if (oldData && oldData.moves) return [oldData];
            }
            return [];
        } catch (e) { console.warn('[AI整理] 加载撤销历史失败:', e.message); return []; }
    }

    function loadUndoData() {
        const history = loadUndoHistory();
        return history.length > 0 ? history[0] : null;
    }

    function clearUndoData(index) {
        try {
            const history = loadUndoHistory();
            if (typeof index === 'number' && index >= 0 && index < history.length) {
                history.splice(index, 1);
            } else {
                history.shift();
            }
            GM_setValue('bfao_undoHistory', JSON.stringify(history));
            GM_setValue('bfao_undoData', history.length > 0 ? JSON.stringify(history[0]) : null);
        } catch (e) { console.error('[AI整理] 清除撤销数据失败:', e); }
    }

    async function undoLastOperation() {
        const history = loadUndoHistory();
        if (history.length === 0) {
            alert('没有可撤销的操作记录');
            return;
        }

        const biliData = getBiliData();
        if (!biliData.mid || !biliData.csrf) return alert('请确保你在 B 站已登录！');

        // 如果有多条历史，让用户选择
        let selectedIndex = 0;
        if (history.length > 1) {
            const options = history.map((h, i) => `${i + 1}. ${h.timeLocal || h.time} — ${h.totalVideos || '?'}个视频 → ${h.totalCategories || '?'}个分类`).join('\n');
            const choice = prompt(`有 ${history.length} 条撤销记录，请输入要撤销的序号（默认1=最近一次）：\n\n${options}`, '1');
            if (!choice) return;
            selectedIndex = Math.max(0, Math.min(history.length - 1, parseInt(choice) - 1));
            if (isNaN(selectedIndex)) selectedIndex = 0;
        }

        const undo = history[selectedIndex];
        if (!undo || !undo.moves || undo.moves.length === 0) {
            alert('该撤销记录数据异常');
            return;
        }

        const timeStr = undo.timeLocal || undo.time;
        const confirmed = confirm(`确定要撤销以下操作吗？\n\n时间：${timeStr}\n移动了 ${undo.totalVideos || '?'} 个视频到 ${undo.totalCategories || '?'} 个收藏夹\n\n撤销将把所有视频移回原收藏夹。`);
        if (!confirmed) return;

        state.isRunning = true;
        state.cancelRequested = false;
        setToolButtonsDisabled(true);
        document.getElementById('ai-status-log').innerHTML = '';
        logStatus('⏪ 正在撤销操作...');

        const settings = loadSettings();
        initAdaptiveState(settings);
        let restored = 0;

        try {
            for (let i = 0; i < undo.moves.length; i++) {
                if (state.cancelRequested) { logStatus('⏹ 用户已取消撤销'); break; }
                const move = undo.moves[i];
                logStatus(`⏪ [${i + 1}/${undo.moves.length}] 移回 ${move.count || '?'} 个视频到原收藏夹...`);

                await moveVideos(move.toMediaId, move.fromMediaId, move.resources, biliData);
                restored += move.count || 0;
                await humanDelay(getAdaptiveWriteDelay());
            }

            logStatus(`✅ 撤销完成！共恢复 ${restored} 个视频。请刷新页面。`);
            clearUndoData(selectedIndex);
            invalidateFolderCache();

            if (settings.notifyOnComplete) {
                sendNotification('撤销完成', `已恢复 ${restored} 个视频到原收藏夹`);
            }
        } catch (err) {
            logStatus(`❌ 撤销失败: ${err.message}`);
            console.error(err);
        }
        resetMainButton();
    }

    // ================= AI 模型性能测试 =================
    async function benchmarkAI() {
        const settings = loadSettings();
        if (!settings.apiKey && settings.provider !== 'ollama') {
            alert('请先在设置中填入 API Key');
            return;
        }

        state.isRunning = true;
        setToolButtonsDisabled(true);
        document.getElementById('ai-status-log').innerHTML = '';
        logStatus('🏁 开始 AI 模型性能测试...');

        const testPrompt = `你是一个文件整理专家。请把以下5个B站视频分类。
用户已有收藏夹：[ 游戏, 音乐, 教程 ]
请严格按步骤执行，输出纯 JSON：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":111,"type":2}]}}
以下是待处理的视频：
[{"id":1001,"type":2,"title":"Minecraft生存日记第10集","up":"游戏王","duration":"15:30","plays":50000},
{"id":1002,"type":2,"title":"钢琴演奏-月光奏鸣曲","up":"音乐家小明","duration":"8:20","plays":120000},
{"id":1003,"type":2,"title":"Python入门教程第1课","up":"编程老师","duration":"25:00","plays":80000},
{"id":1004,"type":2,"title":"LOL精彩操作集锦","up":"电竞解说","duration":"12:00","plays":200000},
{"id":1005,"type":2,"title":"吉他弹唱-晴天","up":"音乐达人","duration":"4:30","plays":95000}]`;

        const rounds = 3;
        const results = [];

        for (let i = 1; i <= rounds; i++) {
            logStatus(`🏁 第 ${i}/${rounds} 轮测试中...`);
            const start = performance.now();
            try {
                const result = await callAI(testPrompt, settings);
                const elapsed = Math.round(performance.now() - start);
                const catCount = result.categories ? Object.keys(result.categories).length : 0;
                const vidCount = result.categories ? Object.values(result.categories).reduce((s, v) => s + v.length, 0) : 0;
                results.push({ round: i, latency: elapsed, success: true, categories: catCount, videos: vidCount, hasThoughts: !!result.thoughts });
                logStatus(`✅ 第 ${i} 轮：${elapsed}ms，${catCount} 个分类，${vidCount} 个视频分配`);
            } catch (err) {
                const elapsed = Math.round(performance.now() - start);
                results.push({ round: i, latency: elapsed, success: false, error: err.message });
                logStatus(`❌ 第 ${i} 轮失败 (${elapsed}ms): ${err.message}`);
            }
            if (i < rounds) await sleep(1000);
        }

        // 汇总结果
        const successes = results.filter(r => r.success);
        const avgLatency = successes.length > 0 ? Math.round(successes.reduce((s, r) => s + r.latency, 0) / successes.length) : 0;
        const minLatency = successes.length > 0 ? Math.min(...successes.map(r => r.latency)) : 0;
        const maxLatency = successes.length > 0 ? Math.max(...successes.map(r => r.latency)) : 0;
        const allCorrect = successes.every(r => r.videos === 5);

        // 显示结果弹窗
        const providerName = (AI_PROVIDERS[settings.provider] || {}).name || settings.provider;
        const backdrop = document.createElement('div');
        backdrop.className = 'ai-modal-backdrop';
        backdrop.innerHTML = `
        <div class="ai-modal" style="width:min(500px,90vw);">
            <div class="ai-modal-header">
                <h3><i data-lucide="gauge" style="width:18px;height:18px;"></i> AI 模型性能报告</h3>
                <button class="ai-modal-close" id="ai-bench-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
            </div>
            <div class="ai-modal-body" style="padding:16px 20px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                        <div style="font-size:11px;color:var(--ai-text-muted);">服务商 / 模型</div>
                        <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-top:4px;">${providerName}</div>
                        <div style="font-size:11px;color:var(--ai-primary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${settings.modelName}">${settings.modelName}</div>
                    </div>
                    <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                        <div style="font-size:11px;color:var(--ai-text-muted);">成功率</div>
                        <div style="font-size:22px;font-weight:bold;color:${successes.length === rounds ? 'var(--ai-success)' : 'var(--ai-warning)'};">${successes.length}/${rounds}</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
                    <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:10px;text-align:center;border:1px solid var(--ai-border-lighter);">
                        <div style="font-size:11px;color:var(--ai-text-muted);">平均延迟</div>
                        <div style="font-size:18px;font-weight:bold;color:var(--ai-info);">${avgLatency}ms</div>
                    </div>
                    <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:10px;text-align:center;border:1px solid var(--ai-border-lighter);">
                        <div style="font-size:11px;color:var(--ai-text-muted);">最快</div>
                        <div style="font-size:18px;font-weight:bold;color:var(--ai-success);">${minLatency}ms</div>
                    </div>
                    <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:10px;text-align:center;border:1px solid var(--ai-border-lighter);">
                        <div style="font-size:11px;color:var(--ai-text-muted);">最慢</div>
                        <div style="font-size:18px;font-weight:bold;color:var(--ai-warning);">${maxLatency}ms</div>
                    </div>
                </div>
                <div style="margin-bottom:12px;">
                    <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-bottom:8px;">📊 各轮详情</div>
                    ${results.map(r => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--ai-border-lighter);font-size:12px;">
                        <span style="width:50px;color:var(--ai-text-muted);">第${r.round}轮</span>
                        <span style="color:${r.success ? 'var(--ai-success)' : 'var(--ai-error)'};">${r.success ? '✅' : '❌'}</span>
                        <div style="flex:1;height:14px;background:var(--ai-border-lighter);border-radius:7px;overflow:hidden;">
                            <div style="width:${r.success ? Math.min(100, Math.round(r.latency / (maxLatency || 1) * 100)) : 100}%;height:100%;background:${r.success ? 'var(--ai-primary)' : 'var(--ai-error)'};border-radius:7px;"></div>
                        </div>
                        <span style="width:70px;text-align:right;color:var(--ai-text-secondary);">${r.latency}ms</span>
                    </div>`).join('')}
                </div>
                <div style="font-size:12px;color:var(--ai-text-secondary);background:var(--ai-bg-secondary);padding:10px;border-radius:var(--ai-radius-md);">
                    <strong>评估：</strong>
                    ${successes.length === 0 ? '模型不可用，请检查 API Key 和模型名称。' :
                      avgLatency < 3000 ? '⚡ 响应速度优秀，适合大批量整理。' :
                      avgLatency < 8000 ? '🚶 响应速度适中，日常使用没问题。' :
                      '🐢 响应较慢，建议降低并发数或换用更快的模型。'}
                    ${allCorrect ? ' 分类准确度：所有测试视频均正确分配。' : ''}
                </div>
            </div>
            <div class="ai-modal-footer" style="justify-content:center;">
                <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-bench-ok" style="max-width:150px;"><i data-lucide="check" style="width:16px;height:16px;"></i> 关闭</button>
            </div>
        </div>`;

        document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

        const closeBench = () => backdrop.remove();
        backdrop.querySelector('#ai-bench-close').onclick = closeBench;
        backdrop.querySelector('#ai-bench-ok').onclick = closeBench;
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') { closeBench(); document.removeEventListener('keydown', onEsc); }
        });

        resetMainButton();
    }

    // ================= 跨收藏夹选择器 =================
    async function showFolderSelector(biliData) {
        return new Promise(async (resolve) => {
            logStatus('📂 正在获取收藏夹列表...');
            const allFolders = await getAllFoldersWithIds(biliData);

            const backdrop = document.createElement('div');
            backdrop.className = 'ai-modal-backdrop';

            let folderListHtml = '';
            allFolders.forEach((f, i) => {
                folderListHtml += `
                <div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--ai-border-lighter);cursor:pointer;transition:background 0.15s;" class="ai-folder-item">
                    <input type="checkbox" class="ai-folder-check" data-id="${f.id}" data-title="${escapeHtml(f.title)}" style="width:16px;height:16px;accent-color:var(--ai-primary);cursor:pointer;">
                    <span style="flex:1;font-size:13px;color:var(--ai-text);">${escapeHtml(f.title)}</span>
                    <span style="font-size:11px;color:var(--ai-text-muted);">${f.media_count} 个视频</span>
                </div>`;
            });

            backdrop.innerHTML = `
            <div class="ai-modal" style="width:min(500px,90vw);">
                <div class="ai-modal-header">
                    <h3><i data-lucide="folders" style="width:18px;height:18px;"></i> 选择要整理的收藏夹</h3>
                    <button class="ai-modal-close" id="ai-fs-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                </div>
                <div class="ai-modal-toolbar" style="display:flex;gap:8px;align-items:center;">
                    <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--ai-text-secondary);cursor:pointer;">
                        <input type="checkbox" id="ai-fs-selectall" style="accent-color:var(--ai-primary);"> 全选
                    </label>
                    <span id="ai-fs-count" style="font-size:11px;color:var(--ai-text-muted);margin-left:auto;">已选 0 个</span>
                </div>
                <div class="ai-modal-body" style="max-height:400px;">
                    ${folderListHtml}
                </div>
                <div class="ai-modal-footer">
                    <button class="ai-modal-btn ai-modal-btn-confirm" id="ai-fs-confirm"><i data-lucide="check" style="width:16px;height:16px;"></i> 开始整理选中的收藏夹</button>
                    <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-fs-cancel"><i data-lucide="x" style="width:16px;height:16px;"></i> 取消</button>
                </div>
            </div>`;

            document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

            function updateCount() {
                const checked = backdrop.querySelectorAll('.ai-folder-check:checked');
                backdrop.querySelector('#ai-fs-count').textContent = `已选 ${checked.length} 个`;
                backdrop.querySelector('#ai-fs-confirm').disabled = checked.length === 0;
            }

            // Row click toggles checkbox
            backdrop.querySelectorAll('.ai-folder-item').forEach(item => {
                item.onclick = (e) => {
                    if (e.target.type === 'checkbox') { updateCount(); return; }
                    const cb = item.querySelector('.ai-folder-check');
                    cb.checked = !cb.checked;
                    updateCount();
                };
            });

            backdrop.querySelector('#ai-fs-selectall').onchange = function() {
                backdrop.querySelectorAll('.ai-folder-check').forEach(cb => cb.checked = this.checked);
                updateCount();
            };

            const cleanup = () => backdrop.remove();

            backdrop.querySelector('#ai-fs-confirm').onclick = () => {
                const selected = [...backdrop.querySelectorAll('.ai-folder-check:checked')].map(cb => ({
                    id: cb.dataset.id, title: cb.dataset.title
                }));
                cleanup();
                resolve(selected);
            };

            backdrop.querySelector('#ai-fs-cancel').onclick = () => { cleanup(); resolve(null); };
            backdrop.querySelector('#ai-fs-close').onclick = () => { cleanup(); resolve(null); };
            document.addEventListener('keydown', function onEsc(e) {
                if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', onEsc); resolve(null); }
            });
        });
    }

    // ================= 预览渲染 =================
    function renderPreview(allCategories, existingFoldersMap, videoIdMap, sourceMediaId, biliData, crossFolderDups) {
        return new Promise(resolve => {
            const animSettings = loadSettings();
            const catEntries = Object.entries(allCategories);
            const totalVids = catEntries.reduce((s, [, v]) => s + v.length, 0);

            // 生成全部视频条目 HTML（放在可滚动容器里）
            // 格式化播放量
            function formatCount(n) {
                if (!n || n < 0) return '0';
                if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
                if (n >= 10000) return (n / 10000).toFixed(1) + '万';
                return String(n);
            }

            // 格式化时间差
            function timeAgo(timestamp) {
                if (!timestamp) return '';
                const diff = Math.floor(Date.now() / 1000) - timestamp;
                if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
                if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
                if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
                if (diff < 31536000) return Math.floor(diff / 2592000) + '个月前';
                return Math.floor(diff / 31536000) + '年前';
            }

            function confBadge(conf) {
                if (conf === undefined || conf === null) return '';
                const c = parseFloat(conf);
                if (isNaN(c)) return '';
                const color = c >= 0.8 ? '#4CAF50' : c >= 0.5 ? '#f39c12' : '#e74c3c';
                const label = c >= 0.8 ? '高' : c >= 0.5 ? '中' : '低';
                return `<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:${color}20;color:${color};font-weight:bold;white-space:nowrap;" title="分类置信度 ${(c * 100).toFixed(0)}%">${label} ${(c * 100).toFixed(0)}%</span>`;
            }

            function allVidItemsHtml(vids) {
                let h = '';
                for (let i = 0; i < vids.length; i++) {
                    const v = videoIdMap[vids[i].id];
                    const title = v ? escapeHtml(v.title) : `ID:${vids[i].id}`;
                    const up = v && v.upper ? escapeHtml(v.upper.name) : '';
                    const cover = v && v.cover ? v.cover : '';
                    const duration = v ? formatDuration(v.duration) : '';
                    const plays = v && v.cnt_info ? formatCount(v.cnt_info.play) : '';
                    const bvid = v && v.bvid ? v.bvid : '';
                    const pubdate = v && v.pubtime ? timeAgo(v.pubtime) : (v && v.fav_time ? timeAgo(v.fav_time) : '');
                    const conf = vids[i].conf;

                    h += `<div class="ai-vid-item ai-vid-rich">
                        ${cover ? `<img class="ai-vid-cover" src="${escapeHtml(cover)}@96w_54h_1c.webp" loading="lazy" alt="">` : '<div class="ai-vid-cover ai-vid-cover-empty"></div>'}
                        <div class="ai-vid-info">
                            <div class="ai-vid-title">${bvid ? `<a href="https://www.bilibili.com/video/${escapeHtml(bvid)}" target="_blank" title="${title}">${title}</a>` : title} ${confBadge(conf)}</div>
                            <div class="ai-vid-meta">
                                ${up ? `<span class="ai-vid-up">${up}</span>` : ''}
                                ${plays ? `<span class="ai-vid-plays">▶ ${plays}</span>` : ''}
                                ${duration ? `<span class="ai-vid-duration">${duration}</span>` : ''}
                                ${pubdate ? `<span class="ai-vid-date">${pubdate}</span>` : ''}
                            </div>
                        </div>
                    </div>`;
                }
                return h;
            }

            // 分类列表 HTML（带入场动画索引 + 光影元素）
            let catsHtml = '';
            let catIdx = 0;
            for (const [catName, vids] of catEntries) {
                const isNew = !existingFoldersMap[catName];
                const catId = 'mprev-' + Math.random().toString(36).slice(2, 8);
                const safeKey = catName.replace(/"/g, '&quot;');
                const badge = isNew
                    ? `<span class="ai-cat-badge">新建</span>`
                    : `<span class="ai-cat-existing">已有</span>`;

                // 计算该分类的置信度统计
                const confs = vids.map(v => v.conf).filter(c => c !== undefined && c !== null).map(Number);
                const avgConf = confs.length > 0 ? confs.reduce((a, b) => a + b, 0) / confs.length : -1;
                const lowConfCount = confs.filter(c => c < 0.7).length;
                let confSummary = '';
                if (confs.length > 0) {
                    const confColor = avgConf >= 0.8 ? '#4CAF50' : avgConf >= 0.6 ? '#f39c12' : '#e74c3c';
                    confSummary = `<span style="font-size:9px;padding:1px 5px;border-radius:8px;background:${confColor}15;color:${confColor};white-space:nowrap;" title="平均置信度 ${(avgConf * 100).toFixed(0)}%${lowConfCount > 0 ? '，' + lowConfCount + '个低置信度' : ''}">`;
                    confSummary += lowConfCount > 0 ? `⚠️${lowConfCount}` : `✓${(avgConf * 100).toFixed(0)}%`;
                    confSummary += '</span>';
                }

                catsHtml += `
                <div class="ai-cat-block" data-catname="${safeKey}" data-isnew="${isNew}" style="${animSettings.animEnabled ? '--i:' + catIdx : 'animation:none'}">
                    <div class="ai-cat-row">
                        <div class="ai-glow"></div>
                        <input type="checkbox" class="ai-mc-check" data-cat="${safeKey}" data-count="${vids.length}" checked style="width:16px;height:16px;cursor:pointer;accent-color:#fb7299;">
                        <span class="ai-cat-toggle" data-target="${catId}" style="cursor:pointer;color:#bbb;font-size:11px;width:16px;text-align:center;transition:transform 0.3s;">▶</span>
                        <span class="ai-cat-name">${escapeHtml(catName)} ${badge} ${confSummary}</span>
                        <span class="ai-cat-count">${vids.length} 个视频</span>
                        ${sourceMediaId ? `<button class="ai-btn-unfav" data-cat="${safeKey}" title="从当前收藏夹移出该分类下所有视频">🗑️ 移出</button>` : ''}
                    </div>
                    <div class="ai-cat-detail" id="${catId}">
                        <div class="ai-cat-detail-inner">
                            ${allVidItemsHtml(vids)}
                        </div>
                    </div>
                </div>`;
                catIdx++;
            }

            // 创建模态 DOM
            const backdrop = document.createElement('div');
            backdrop.className = 'ai-modal-backdrop';
            backdrop.innerHTML = `
            <div class="ai-modal">
                <div class="ai-modal-header">
                    <h3><i data-lucide="list-checks" style="width:18px;height:18px;"></i> 分类预览</h3>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span id="ai-mc-stats" style="font-size:13px;opacity:0.9;">已选 ${totalVids} / ${totalVids} 个视频</span>
                        <button class="ai-modal-close" id="ai-mc-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                    </div>
                </div>
                <div class="ai-modal-toolbar" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                    <input class="ai-modal-search" id="ai-mc-search" type="text" placeholder="搜索分类名..." style="flex:1;min-width:120px;">
                    <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#666;white-space:nowrap;cursor:pointer;">
                        <input type="checkbox" id="ai-mc-selectall" checked style="width:15px;height:15px;accent-color:#fb7299;"> 全选
                    </label>
                    <button class="ai-filter-btn" id="ai-mc-filter-existing" title="只勾选已有收藏夹">仅已有</button>
                    <button class="ai-filter-btn" id="ai-mc-filter-new" title="只勾选新建收藏夹">仅新建</button>
                    <button class="ai-filter-btn" id="ai-mc-filter-lowconf" title="仅显示包含低置信度(< 70%)视频的分类，方便审查">⚠️ 低置信度</button>
                    <button class="ai-filter-btn" id="ai-mc-merge" title="合并选中的分类（勾选2+个后可用）" disabled>合并分类</button>
                    ${sourceMediaId ? `<button class="ai-filter-btn ai-btn-unfav-batch" id="ai-mc-unfav-batch" title="从当前收藏夹移出已勾选分类的所有视频">🗑️ 批量移出</button>` : ''}
                    <span style="font-size:11px;color:#999;white-space:nowrap;">${catEntries.length} 个分类</span>
                </div>
                <div class="ai-modal-body">${catsHtml}</div>
                ${crossFolderDups && crossFolderDups.length > 0 ? `
                <div id="ai-mc-dup-section" style="padding:10px 20px;border-top:1px solid var(--ai-border-light);background:var(--ai-bg-secondary);">
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;font-weight:bold;color:var(--ai-warning);">
                        <input type="checkbox" id="ai-mc-dup-clean" style="width:15px;height:15px;accent-color:var(--ai-warning);">
                        🔍 同时清理 ${crossFolderDups.length} 个跨收藏夹重复视频
                    </label>
                    <div id="ai-mc-dup-list" style="display:none;margin-top:6px;max-height:120px;overflow-y:auto;font-size:11px;">
                        ${crossFolderDups.slice(0, 30).map(d => `<div style="padding:2px 0;border-bottom:1px solid var(--ai-border-lighter);">
                            <span style="color:var(--ai-text);">• ${escapeHtml(d.title)}</span>
                            <span style="color:var(--ai-text-muted);margin-left:6px;">出现在：${d.folders.map(f => escapeHtml(f.folderTitle)).join('、')}</span>
                        </div>`).join('')}
                        ${crossFolderDups.length > 30 ? `<div style="color:var(--ai-text-muted);padding:4px 0;">...及其他 ${crossFolderDups.length - 30} 个</div>` : ''}
                    </div>
                    <div style="font-size:10px;color:var(--ai-text-muted);margin-top:4px;cursor:pointer;" id="ai-mc-dup-toggle">▶ 展开详情</div>
                </div>` : ''}
                <div class="ai-modal-footer">
                    <button class="ai-modal-btn ai-modal-btn-confirm" id="ai-mc-confirm"><i data-lucide="check" style="width:16px;height:16px;"></i> 执行已勾选 (${totalVids}个)</button>
                    <button class="ai-modal-btn" id="ai-mc-copy" style="flex:0.3;background:var(--ai-bg-secondary);color:var(--ai-text-secondary);font-size:12px;" title="复制分类结果到剪贴板"><i data-lucide="copy" style="width:14px;height:14px;"></i></button>
                    <button class="ai-modal-btn" id="ai-mc-export" style="flex:0.3;background:var(--ai-bg-secondary);color:var(--ai-text-secondary);font-size:12px;" title="导出分类结果为文件"><i data-lucide="download" style="width:14px;height:14px;"></i></button>
                    <button class="ai-modal-btn" id="ai-mc-report" style="flex:0.3;background:var(--ai-bg-secondary);color:var(--ai-text-secondary);font-size:12px;" title="导出整理报告(HTML)"><i data-lucide="file-text" style="width:14px;height:14px;"></i></button>
                    <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-mc-cancel"><i data-lucide="x" style="width:16px;height:16px;"></i> 全部取消</button>
                </div>
            </div>`;

            document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

            // 根据设置禁用特定动画
            if (!animSettings.animEnabled) {
                const headerAfter = backdrop.querySelector('.ai-modal-header');
                if (headerAfter) headerAfter.style.setProperty('--shimmer', 'none');
            }
            if (!animSettings.animEnabled) backdrop.querySelector('.ai-modal').style.animation = 'none';

            // 跨收藏夹重复视频展开/折叠
            const dupToggle = backdrop.querySelector('#ai-mc-dup-toggle');
            if (dupToggle) {
                dupToggle.onclick = () => {
                    const list = backdrop.querySelector('#ai-mc-dup-list');
                    if (list.style.display === 'none') {
                        list.style.display = 'block';
                        dupToggle.textContent = '▼ 收起详情';
                    } else {
                        list.style.display = 'none';
                        dupToggle.textContent = '▶ 展开详情';
                    }
                };
            }

            const modal = backdrop.querySelector('.ai-modal');

            // 阻止模态框内滚轮穿透
            modal.addEventListener('wheel', function(e) {
                let target = e.target;
                while (target && target !== modal) {
                    if (target.scrollHeight > target.clientHeight) {
                        const atTop = target.scrollTop === 0 && e.deltaY < 0;
                        const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1 && e.deltaY > 0;
                        if (!atTop && !atBottom) return;
                    }
                    target = target.parentElement;
                }
                e.preventDefault();
            }, { passive: false });

            function cleanup() { backdrop.remove(); }

            // ===== 数字滚动动画 =====
            let currentChecked = totalVids;
            function animateCounter(el, from, to, duration) {
                const start = performance.now();
                function tick(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
                    el.textContent = Math.round(from + (to - from) * eased);
                    if (p < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            }

            // ===== Checkbox 波纹效果 =====
            function spawnRipple(checkbox) {
                if (!animSettings.animEnabled) return;
                const row = checkbox.closest('.ai-cat-row');
                if (!row) return;
                const rect = checkbox.getBoundingClientRect();
                const rowRect = row.getBoundingClientRect();
                const dot = document.createElement('div');
                dot.className = 'ai-ripple-dot';
                dot.style.left = (rect.left - rowRect.left + rect.width / 2 - 10) + 'px';
                dot.style.top = (rect.top - rowRect.top + rect.height / 2 - 10) + 'px';
                row.appendChild(dot);
                dot.addEventListener('animationend', () => dot.remove());
            }

            // ===== 粒子爆发 =====
            function spawnParticles(x, y) {
                if (!animSettings.animEnabled) return;
                const colors = ['#fb7299', '#ff9cb5', '#ffb7c5', '#ff6b8a', '#ffd1dc'];
                for (let i = 0; i < 25; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'ai-particle-dot';
                    const size = 4 + Math.random() * 6;
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 40 + Math.random() * 80;
                    dot.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist - 30}px;animation-duration:${0.6 + Math.random() * 0.4}s;`;
                    document.body.appendChild(dot);
                    dot.addEventListener('animationend', () => dot.remove());
                }
            }

            // ===== 更新统计（带数字滚动） =====
            function updateStats() {
                let checked = 0, total = 0;
                modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                    const c = parseInt(cb.dataset.count) || 0;
                    total += c;
                    if (cb.checked) checked += c;
                    cb.closest('.ai-cat-row').classList.toggle('unchecked', !cb.checked);
                });
                // 数字滚动动画
                const statsEl = modal.querySelector('#ai-mc-stats');
                const countSpan = statsEl.querySelector('.ai-counter') || (() => {
                    statsEl.innerHTML = `已选 <span class="ai-counter">${checked}</span> / ${total} 个视频`;
                    return statsEl.querySelector('.ai-counter');
                })();
                if (animSettings.animEnabled) animateCounter(countSpan, currentChecked, checked, 300);
                else countSpan.textContent = checked;
                currentChecked = checked;
                const confirmBtn = modal.querySelector('#ai-mc-confirm');
                confirmBtn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px;"></i> 执行已勾选 (${checked}个)`;
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [confirmBtn] });
            }

            // ===== checkbox 事件（波纹 + 更新） =====
            modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                cb.addEventListener('change', () => {
                    spawnRipple(cb);
                    updateStats();
                    const all = modal.querySelectorAll('.ai-mc-check');
                    modal.querySelector('#ai-mc-selectall').checked = [...all].every(c => c.checked);
                });
            });

            // ===== 全选/取消全选 =====
            modal.querySelector('#ai-mc-selectall').addEventListener('change', function() {
                modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                    if (cb.closest('.ai-cat-block').style.display !== 'none') cb.checked = this.checked;
                });
                updateStats();
            });

            // ===== 筛选按钮：仅已有 / 仅新建 =====
            function applyFilter(filterType) {
                const btn = modal.querySelector(`#ai-mc-filter-${filterType}`);
                const isActive = btn.classList.contains('active');
                // 重置所有筛选按钮
                modal.querySelectorAll('.ai-filter-btn').forEach(b => b.classList.remove('active'));
                if (isActive) {
                    // 取消筛选 → 全选
                    modal.querySelectorAll('.ai-mc-check').forEach(cb => { cb.checked = true; });
                    modal.querySelector('#ai-mc-selectall').checked = true;
                } else {
                    btn.classList.add('active');
                    modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                        const block = cb.closest('.ai-cat-block');
                        const isNew = block.dataset.isnew === 'true';
                        cb.checked = filterType === 'new' ? isNew : !isNew;
                    });
                    modal.querySelector('#ai-mc-selectall').checked = false;
                }
                updateStats();
            }
            modal.querySelector('#ai-mc-filter-existing').onclick = () => applyFilter('existing');
            modal.querySelector('#ai-mc-filter-new').onclick = () => applyFilter('new');

            // ===== 低置信度筛选 =====
            modal.querySelector('#ai-mc-filter-lowconf').onclick = () => {
                const btn = modal.querySelector('#ai-mc-filter-lowconf');
                const isActive = btn.classList.contains('active');
                // 重置所有筛选按钮
                modal.querySelectorAll('.ai-filter-btn').forEach(b => b.classList.remove('active'));
                if (isActive) {
                    // 取消筛选 → 显示全部
                    modal.querySelectorAll('.ai-cat-block').forEach(block => { block.style.display = ''; });
                    // 隐藏低置信度高亮
                    modal.querySelectorAll('.ai-vid-item').forEach(v => { v.classList.remove('ai-vid-lowconf-highlight'); });
                } else {
                    btn.classList.add('active');
                    const CONF_THRESHOLD = 0.7;
                    let lowConfCatCount = 0;
                    let lowConfVidCount = 0;
                    modal.querySelectorAll('.ai-cat-block').forEach(block => {
                        const catName = block.dataset.catname;
                        const vids = allCategories[catName] || [];
                        const hasLowConf = vids.some(v => v.conf !== undefined && v.conf !== null && parseFloat(v.conf) < CONF_THRESHOLD);
                        if (hasLowConf) {
                            block.style.display = '';
                            lowConfCatCount++;
                            // 高亮低置信度视频
                            const vidItems = block.querySelectorAll('.ai-vid-item');
                            vids.forEach((v, idx) => {
                                if (vidItems[idx]) {
                                    const isLow = v.conf !== undefined && v.conf !== null && parseFloat(v.conf) < CONF_THRESHOLD;
                                    vidItems[idx].classList.toggle('ai-vid-lowconf-highlight', isLow);
                                    if (isLow) lowConfVidCount++;
                                }
                            });
                            // 自动展开该分类以显示低置信度视频
                            const detail = block.querySelector('.ai-cat-detail');
                            const toggle = block.querySelector('.ai-cat-toggle');
                            if (detail && !detail.classList.contains('open')) {
                                detail.classList.add('open');
                                if (toggle) toggle.style.transform = 'rotate(90deg)';
                            }
                        } else {
                            block.style.display = 'none';
                        }
                    });
                    logStatus(`🔍 低置信度筛选：${lowConfCatCount} 个分类包含 ${lowConfVidCount} 个低置信度视频 (< ${CONF_THRESHOLD * 100}%)`);
                }
            };

            // ===== 合并分类 =====
            function updateMergeButton() {
                const checkedBoxes = modal.querySelectorAll('.ai-mc-check:checked');
                const mergeBtn = modal.querySelector('#ai-mc-merge');
                if (mergeBtn) {
                    mergeBtn.disabled = checkedBoxes.length < 2;
                    mergeBtn.title = checkedBoxes.length < 2 ? '勾选2个以上分类后可合并' : `合并 ${checkedBoxes.length} 个分类`;
                }
            }
            // 在 checkbox 变化时也更新合并按钮
            modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                cb.addEventListener('change', updateMergeButton);
            });

            modal.querySelector('#ai-mc-merge').onclick = () => {
                const checkedCats = [...modal.querySelectorAll('.ai-mc-check:checked')].map(cb => cb.dataset.cat);
                if (checkedCats.length < 2) return;

                const targetName = prompt(
                    `将以下 ${checkedCats.length} 个分类合并为一个：\n\n${checkedCats.join('\n')}\n\n请输入合并后的分类名：`,
                    checkedCats[0]
                );
                if (!targetName || !targetName.trim()) return;
                const mergedName = targetName.trim();

                // 合并视频列表
                const mergedVids = [];
                checkedCats.forEach(cat => {
                    if (allCategories[cat]) {
                        mergedVids.push(...allCategories[cat]);
                        if (cat !== mergedName) delete allCategories[cat];
                    }
                });
                allCategories[mergedName] = mergedVids;

                logStatus(`🔀 已合并 ${checkedCats.length} 个分类为【${mergedName}】(${mergedVids.length} 个视频)`);

                // 重新渲染预览
                cleanup();
                resolve('rerender');
            };

            // ===== 搜索过滤（防抖 + 支持搜视频标题/UP主） =====
            modal.querySelector('#ai-mc-search').addEventListener('input', debounce(function() {
                const kw = this.value.trim().toLowerCase();
                modal.querySelectorAll('.ai-cat-block').forEach(block => {
                    const name = block.dataset.catname.toLowerCase();
                    if (!kw || name.includes(kw)) {
                        block.style.display = '';
                        return;
                    }
                    // 也搜索分类内的视频标题和UP主名
                    const vidTexts = block.querySelectorAll('.ai-vid-title, .ai-vid-up');
                    let found = false;
                    for (const el of vidTexts) {
                        if (el.textContent.toLowerCase().includes(kw)) { found = true; break; }
                    }
                    block.style.display = found ? '' : 'none';
                });
            }, 150));

            // ===== 光影跟随 =====
            if (animSettings.animEnabled) {
                modal.querySelectorAll('.ai-cat-row').forEach(row => {
                    const glow = row.querySelector('.ai-glow');
                    if (glow) {
                        row.addEventListener('mousemove', e => {
                            const rect = row.getBoundingClientRect();
                            glow.style.left = (e.clientX - rect.left) + 'px';
                            glow.style.top = (e.clientY - rect.top) + 'px';
                        });
                    }
                });
            }

            // ===== 封面点击放大（安全创建 img 元素，避免 innerHTML XSS） =====
            modal.addEventListener('click', function(e) {
                if (e.target.classList.contains('ai-vid-cover') && e.target.tagName === 'IMG') {
                    const src = e.target.src.replace(/@\d+w_\d+h.*$/, '');
                    const zoom = document.createElement('div');
                    zoom.className = 'ai-cover-zoom-backdrop';
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = '';
                    zoom.appendChild(img);
                    zoom.onclick = () => zoom.remove();
                    document.documentElement.appendChild(zoom);
                    const onEscZoom = (ev) => { if (ev.key === 'Escape') { zoom.remove(); document.removeEventListener('keydown', onEscZoom); } };
                    document.addEventListener('keydown', onEscZoom);
                }
            });

            // ===== 分类展开/折叠（CSS 动画） =====
            function toggleCatDetail(toggle) {
                const detail = document.getElementById(toggle.dataset.target);
                if (!detail) return;
                const isOpen = detail.classList.contains('open');
                if (isOpen) {
                    detail.classList.remove('open');
                    toggle.style.transform = 'rotate(0deg)';
                } else {
                    detail.classList.add('open');
                    toggle.style.transform = 'rotate(90deg)';
                }
            }

            modal.querySelectorAll('.ai-cat-toggle').forEach(toggle => {
                toggle.addEventListener('click', function(e) { e.stopPropagation(); toggleCatDetail(this); });
            });

            modal.querySelectorAll('.ai-cat-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    if (e.target.type === 'checkbox' || e.target.closest('.ai-btn-unfav')) return;
                    const toggle = this.querySelector('.ai-cat-toggle');
                    if (toggle) toggleCatDetail(toggle);
                });
            });

            // ===== 移出收藏夹（单分类 + 批量） =====
            async function doUnfavorite(catName, vids, blockEl, btnEl) {
                if (!sourceMediaId || !biliData) return;
                const settings = loadSettings();
                const chunkSize = settings.moveChunkSize || 20;
                const resourcesList = vids.map(v => `${v.id}:${v.type}`);
                let success = 0, fail = 0;

                btnEl.disabled = true;
                btnEl.textContent = '处理中...';
                blockEl.style.opacity = '0.6';

                for (let i = 0; i < resourcesList.length; i += chunkSize) {
                    if (state.cancelRequested) break;
                    const chunk = resourcesList.slice(i, i + chunkSize);
                    const ok = await batchDeleteVideos(sourceMediaId, chunk.join(','), biliData);
                    if (ok) success += chunk.length;
                    else fail += chunk.length;
                    logStatus(`🗑️「${catName}」移出进度: ${Math.min(i + chunkSize, resourcesList.length)}/${resourcesList.length}`);
                    if (i + chunkSize < resourcesList.length) await humanDelay(settings.writeDelay || 2500);
                }

                if (fail === 0) {
                    blockEl.classList.add('unfav-done');
                    btnEl.textContent = '已移出';
                    logStatus(`✅「${catName}」${success} 个视频已从当前收藏夹移出`);
                } else {
                    blockEl.style.opacity = '';
                    btnEl.disabled = false;
                    btnEl.textContent = '🗑️ 移出';
                    logStatus(`⚠️「${catName}」成功 ${success} 个，失败 ${fail} 个`);
                }
                return { success, fail };
            }

            // 单分类移出按钮
            modal.querySelectorAll('.ai-btn-unfav').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const catName = btn.dataset.cat;
                    const vids = allCategories[catName];
                    if (!vids || vids.length === 0) return;
                    if (!confirm(`确定要从当前收藏夹移出「${catName}」下的 ${vids.length} 个视频？\n\n⚠️ 仅从当前收藏夹移出，不影响其他收藏夹。此操作不可撤销！`)) return;
                    const block = btn.closest('.ai-cat-block');
                    await doUnfavorite(catName, vids, block, btn);
                });
            });

            // 批量移出按钮
            const unfavBatchBtn = modal.querySelector('#ai-mc-unfav-batch');
            if (unfavBatchBtn) {
                unfavBatchBtn.addEventListener('click', async () => {
                    const checkedCats = [];
                    let totalCount = 0;
                    modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                        if (cb.checked && !cb.closest('.ai-cat-block').classList.contains('unfav-done')) {
                            const catName = cb.dataset.cat;
                            const vids = allCategories[catName];
                            if (vids && vids.length > 0) {
                                checkedCats.push({ catName, vids, block: cb.closest('.ai-cat-block'), btn: cb.closest('.ai-cat-block').querySelector('.ai-btn-unfav') });
                                totalCount += vids.length;
                            }
                        }
                    });
                    if (checkedCats.length === 0) return alert('没有可移出的已勾选分类');
                    if (!confirm(`确定要从当前收藏夹移出 ${checkedCats.length} 个分类下共 ${totalCount} 个视频？\n\n⚠️ 仅从当前收藏夹移出，不影响其他收藏夹。此操作不可撤销！`)) return;

                    unfavBatchBtn.disabled = true;
                    unfavBatchBtn.textContent = '批量处理中...';
                    let totalSuccess = 0, totalFail = 0;
                    for (const { catName, vids, block, btn } of checkedCats) {
                        if (state.cancelRequested) break;
                        const result = await doUnfavorite(catName, vids, block, btn);
                        totalSuccess += result.success;
                        totalFail += result.fail;
                    }
                    unfavBatchBtn.disabled = false;
                    unfavBatchBtn.textContent = '🗑️ 批量移出';
                    logStatus(`🏁 批量移出完成：成功 ${totalSuccess} 个，失败 ${totalFail} 个`);
                });
            }

            // ===== ESC 关闭 =====
            function onEsc(e) { if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', onEsc); resolve(false); } }
            document.addEventListener('keydown', onEsc);

            // ===== 确认（粒子爆发） =====
            modal.querySelector('#ai-mc-confirm').onclick = (e) => {
                // 粒子效果
                spawnParticles(e.clientX, e.clientY);
                // 删除未勾选
                modal.querySelectorAll('.ai-mc-check').forEach(cb => {
                    if (!cb.checked) delete allCategories[cb.dataset.cat];
                });
                // 记录跨收藏夹去重选择
                const dupCleanCheck = modal.querySelector('#ai-mc-dup-clean');
                state.cleanCrossFolderDups = dupCleanCheck ? dupCleanCheck.checked : false;
                // 延迟关闭让粒子可见
                setTimeout(() => {
                    cleanup();
                    document.removeEventListener('keydown', onEsc);
                    resolve(Object.keys(allCategories).length > 0);
                }, 400);
            };

            // ===== 复制分类结果 =====
            modal.querySelector('#ai-mc-copy').onclick = () => {
                let text = '分类结果：\n\n';
                for (const [catName, vids] of catEntries) {
                    const isNew = !existingFoldersMap[catName];
                    text += `【${catName}】${isNew ? '(新建)' : '(已有)'} - ${vids.length}个视频\n`;
                    vids.forEach(v => {
                        const info = videoIdMap[v.id];
                        const title = info ? info.title : `ID:${v.id}`;
                        const up = info && info.upper ? info.upper.name : '';
                        text += `  - ${title}${up ? ' (' + up + ')' : ''}\n`;
                    });
                    text += '\n';
                }
                navigator.clipboard.writeText(text).then(() => {
                    const btn = modal.querySelector('#ai-mc-copy');
                    btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                    setTimeout(() => {
                        btn.innerHTML = '<i data-lucide="copy" style="width:14px;height:14px;"></i>';
                        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                    }, 2000);
                }).catch(() => alert('复制失败，请手动复制'));
            };

            // ===== 导出分类结果 =====
            modal.querySelector('#ai-mc-export').onclick = () => {
                const format = window.prompt('导出格式：输入 csv 或 json（默认 csv）', 'csv');
                if (format === null) return;
                const isJson = format.trim().toLowerCase() === 'json';

                if (isJson) {
                    const data = {};
                    for (const [catName, vids] of catEntries) {
                        data[catName] = vids.map(v => {
                            const info = videoIdMap[v.id];
                            return {
                                id: v.id, type: v.type,
                                title: info ? info.title : '',
                                bvid: info && info.bvid ? info.bvid : '',
                                up: info && info.upper ? info.upper.name : '',
                                duration: info ? info.duration : 0,
                                plays: info && info.cnt_info ? info.cnt_info.play : 0,
                                isNewCategory: !existingFoldersMap[catName]
                            };
                        });
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url;
                    a.download = `bilibili-classification-${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a); a.click();
                    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
                } else {
                    const rows = [['收藏夹', '状态', '视频标题', 'UP主', 'BV号', '播放量', '时长(秒)']];
                    for (const [catName, vids] of catEntries) {
                        const status = existingFoldersMap[catName] ? '已有' : '新建';
                        vids.forEach(v => {
                            const info = videoIdMap[v.id];
                            rows.push([
                                catName, status,
                                info ? info.title : `ID:${v.id}`,
                                info && info.upper ? info.upper.name : '',
                                info && info.bvid ? info.bvid : '',
                                info && info.cnt_info ? info.cnt_info.play : 0,
                                info ? info.duration : 0
                            ]);
                        });
                    }
                    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                    const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
                    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url;
                    a.download = `bilibili-classification-${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a); a.click();
                    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
                }
                const btn = modal.querySelector('#ai-mc-export');
                btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                setTimeout(() => {
                    btn.innerHTML = '<i data-lucide="download" style="width:14px;height:14px;"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                }, 2000);
            };

            // ===== 报告导出 =====
            modal.querySelector('#ai-mc-report').onclick = () => {
                generateOrganizeReport(allCategories, videoIdMap, existingFoldersMap, null, null);
                const btn = modal.querySelector('#ai-mc-report');
                btn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                setTimeout(() => {
                    btn.innerHTML = '<i data-lucide="file-text" style="width:14px;height:14px;"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
                }, 2000);
            };

            // ===== 取消 / 关闭 =====
            const cancelAction = () => {
                if (animSettings.animEnabled) {
                    backdrop.classList.add('ai-modal-closing');
                    setTimeout(() => { cleanup(); resolve(false); }, 200);
                } else { cleanup(); resolve(false); }
                document.removeEventListener('keydown', onEsc);
            };
            modal.querySelector('#ai-mc-cancel').onclick = cancelAction;
            modal.querySelector('#ai-mc-close').onclick = cancelAction;
        });
    }

    // ================= 核心：整理流程 =================
    async function startProcess() {
        const settings = loadSettings();
        if (!settings.apiKey) {
            toggleSettings(true);
            if (settings.provider !== 'ollama') return alert('请先在设置中填入 API Key！');
        }

        const biliData = getBiliData();
        if (!biliData.mid || !biliData.csrf) return alert("请确保你在 B 站已登录！");

        // 通知权限
        if (settings.notifyOnComplete) requestNotificationPermission();

        // 跨收藏夹模式：弹出选择器
        let sourceMediaIds = [];
        let sourceMediaId;
        const folderTitleMap = {}; // mediaId -> folderTitle
        if (settings.multiFolderEnabled) {
            const selected = await showFolderSelector(biliData);
            if (!selected || selected.length === 0) return;
            sourceMediaIds = selected.map(f => f.id);
            selected.forEach(f => { folderTitleMap[f.id] = f.title; });
            sourceMediaId = sourceMediaIds[0]; // 主收藏夹用于 moveVideos 的 src
            logStatus(`📂 已选择 ${selected.length} 个收藏夹：${selected.map(f => f.title).join('、')}`);
        } else {
            sourceMediaId = getSourceMediaId();
            if (!sourceMediaId) return alert("未能识别当前页面的收藏夹 ID！请确保你在某个具体的收藏夹页面内。");
            sourceMediaIds = [sourceMediaId];
        }

        const btn = document.getElementById('ai-start-btn');
        const customPromptInput = document.getElementById('ai-custom-prompt');
        const userRequirement = customPromptInput.value.trim();

        // 保存最后使用的 prompt 并追加到历史
        GM_setValue('bfao_lastPrompt', userRequirement);
        if (userRequirement) {
            try {
                let hist = JSON.parse(GM_getValue('bfao_promptHistory', '[]'));
                hist = hist.filter(p => p !== userRequirement);
                hist.unshift(userRequirement);
                GM_setValue('bfao_promptHistory', JSON.stringify(hist.slice(0, 5)));
            } catch(e) { console.warn('[AI整理] Prompt历史保存失败:', e.message); }
        }

        // 切换到运行状态
        state.isRunning = true;
        state.cancelRequested = false;
        state.progressStartTime = Date.now();
        // 重置阶段计时器
        for (const k of Object.keys(phaseTimers)) delete phaseTimers[k];
        btn.innerHTML = '<i data-lucide="square" style="width:15px;height:15px;"></i> 停止';
        if (typeof lucide !== 'undefined') lucide.createIcons({nodes:[btn]});
        btn.style.background = '#e74c3c';
        btn.onclick = () => { state.cancelRequested = true; };
        document.getElementById('ai-status-log').innerHTML = '';
        document.querySelectorAll('.ai-modal-backdrop').forEach(el => el.remove());
        setToolButtonsDisabled(true);

        try {
            // 初始化自适应限速 & Token 计数器
            initAdaptiveState(settings);
            resetTokenUsage();

            // 1. 获取已有收藏夹
            logStatus('正在获取现有的收藏夹列表...');
            const existingFoldersMap = await getMyFolders(biliData);
            const existingFolderNames = Object.keys(existingFoldersMap);
            logStatus(`📦 发现 ${existingFolderNames.length} 个已有收藏夹`);

            // 1.5 备份（如果开启）
            if (settings.backupBeforeExecute) {
                logStatus('💾 正在自动备份当前收藏夹结构...');
                try {
                    const backupData = await quickBackupStructure(biliData, sourceMediaIds);
                    GM_setValue('bfao_quickBackup', JSON.stringify({ time: new Date().toISOString(), data: backupData }));
                    logStatus('💾 备份完成');
                } catch (e) {
                    logStatus(`⚠️ 备份失败（继续执行）: ${e.message}`);
                }
            }

            // 2. 流水线模式：边抓取边调 AI（并发）
            const { aiChunkSize, aiConcurrency, limitEnabled, limitCount } = settings;
            const videoLimit = limitEnabled ? limitCount : Infinity;
            // 增量整理：获取上次整理时间戳
            const lastRunTime = settings.incrementalMode ? GM_getValue('bfao_lastRunTime', 0) : 0;
            if (settings.incrementalMode && lastRunTime > 0) {
                logStatus(`📅 增量模式：仅处理 ${new Date(lastRunTime * 1000).toLocaleString('zh-CN')} 之后收藏的视频`);
            } else if (settings.incrementalMode) {
                logStatus('📅 增量模式：首次运行，将处理全部视频');
            }
            logStatus(limitEnabled ? `开始抓取视频 (限制 ${limitCount} 个)...` : '开始抓取全部视频...');

            const allCategories = {};
            const videoIdMap = {};
            let buffer = []; // 缓冲区：暂存已抓取但未发给 AI 的视频
            let allVideos = [];
            let aiCallIdx = 0;
            let totalProcessed = 0;
            let totalAiCalls = 0; // 动态更新
            let aiCompleted = 0;  // 已完成的 AI 请求数（含失败）
            const aiPromises = []; // 收集所有 AI Promise
            const limiter = createConcurrencyLimiter(aiConcurrency);

            const customRuleText = userRequirement ? `\n\n【用户特殊需求 (最高优先级)】\n用户的特别指示是："${userRequirement}"\n请你务必听从！如果用户指示中提到了分类名，请在已有收藏夹列表中寻找最匹配的准确名称，不允许凭空新建近义词分类！` : '';

            // 构造 AI prompt 并通过并发限制器发送
            function dispatchAIChunk(chunk) {
                aiCallIdx++;
                const idx = aiCallIdx;
                totalAiCalls++;
                const videoDataForAI = chunk.map(v => ({
                    id: v.id, type: v.type, title: v.title,
                    intro: v.intro ? v.intro.substring(0, 80) : '',
                    up: v.upper ? v.upper.name : '',
                    duration: formatDuration(v.duration),
                    plays: v.cnt_info ? v.cnt_info.play : 0
                }));
                logStatus(`🧠 [AI ${idx}] 发送 ${chunk.length} 个视频...`);

                // 使用 system + user 分离模式：将分类规则放入 system，数据放入 user
                // 所有 API 适配层已支持 { system, user } 对象格式
                const systemPrompt = `你是一个逻辑严密的文件整理专家，专门负责将 B 站视频分类到合适的收藏夹。

用户已有收藏夹：[ ${existingFolderNames.length > 0 ? existingFolderNames.join(', ') : '暂无'} ]

每个视频数据包含：title(标题), intro(简介), up(UP主名), duration(时长), plays(播放量)。
请综合利用这些信息进行分类，尤其是UP主名和时长对分类有重要参考价值。

请严格按以下步骤执行：
【步骤 1：存量强制匹配】只要视频内容沾边，必须一字不差使用已有收藏夹名称。
【步骤 2：谨慎新建】只有视频与所有已有收藏夹都毫不相干时，才创建涵盖面广的大类。绝不为单一视频建新分类。
【步骤 3：绝无遗漏】每一个视频都必须分配到分类中，不可遗漏！${customRuleText}

输出纯 JSON：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":111,"type":2,"conf":0.9}]}}
其中 conf 是你对该分类的置信度(0-1)，1表示非常确定，0.5表示不太确定。`;

                const combinedPrompt = {
                    system: systemPrompt,
                    user: `以下是待处理的 ${chunk.length} 个视频：\n${JSON.stringify(videoDataForAI)}`
                };

                // callAI 内部已有3次重试（指数退避），此处不再嵌套重试，避免 3×3=9 次无谓请求
                const p = limiter(async () => {
                    try {
                        const aiResult = await callAI(combinedPrompt, settings);
                        console.log(`AI ${idx} 思考：`, aiResult.thoughts);
                        if (!aiResult.categories || typeof aiResult.categories !== 'object') {
                            logStatus(`⚠️ [AI ${idx}] 返回格式异常（缺少categories字段），跳过此批次`);
                            aiCompleted++;
                            updateProgress('ai', aiCompleted, totalAiCalls);
                            return;
                        }
                        for (const [catName, vids] of Object.entries(aiResult.categories)) {
                            if (!vids || !Array.isArray(vids) || vids.length === 0) continue;
                            if (!allCategories[catName]) allCategories[catName] = [];
                            allCategories[catName].push(...vids);
                        }
                        for (const catName of Object.keys(aiResult.categories)) {
                            if (!existingFolderNames.includes(catName)) existingFolderNames.push(catName);
                        }
                        aiCompleted++;
                        updateProgress('ai', aiCompleted, totalAiCalls);
                        logStatus(`✅ [AI ${idx}] 完成 (${aiCompleted}/${totalAiCalls})`);
                    } catch (err) {
                        aiCompleted++;
                        updateProgress('ai', aiCompleted, totalAiCalls);
                        logStatus(`❌ [AI ${idx}] 失败: ${err.message}`);
                        console.error(`AI ${idx} 详细错误:`, err);
                    }
                });
                aiPromises.push(p);
            }

            // 从缓冲区取出满足 aiChunkSize 的批次并发送
            function flushBuffer(force) {
                while (buffer.length >= aiChunkSize) {
                    dispatchAIChunk(buffer.splice(0, aiChunkSize));
                }
                if (force && buffer.length > 0) {
                    dispatchAIChunk(buffer.splice(0, buffer.length));
                }
            }

            // 抓取循环（边抓边发给 AI）— 支持多收藏夹
            let fetchedTotal = 0;
            let totalInAllFolders = 0;
            let deadSkipped = 0;
            let incrementalSkipped = 0;
            const videoSourceMap = {}; // videoId -> sourceMediaId（用于撤销）
            const crossFolderDups = []; // 跨收藏夹重复视频 [{id, type, title, folders:[{id,title}]}]
            const videoSeenInFolders = {}; // videoId -> [{folderId, folderTitle}]

            // 检查会话缓存：单收藏夹模式下，取消后重新开始可复用上次抓取结果
            const cacheKey = sourceMediaIds.join(',');
            const cacheValid = videoFetchCache.mediaId === cacheKey
                && (Date.now() - videoFetchCache.timestamp) < VIDEO_CACHE_TTL
                && videoFetchCache.videos.length > 0;
            if (cacheValid && !settings.incrementalMode) {
                logStatus(`⚡ 复用上次抓取缓存 (${videoFetchCache.videos.length} 个视频，${Math.round((Date.now() - videoFetchCache.timestamp) / 1000)}秒前)`);
                for (const v of videoFetchCache.videos) {
                    if (fetchedTotal >= videoLimit) break;
                    buffer.push(v);
                    allVideos.push(v);
                    videoIdMap[v.id] = v;
                    videoSourceMap[v.id] = v._sourceMediaId || sourceMediaId;
                    fetchedTotal++;
                }
                flushBuffer(true);
            } else {

            for (const currentMediaId of sourceMediaIds) {
                if (state.cancelRequested) break;
                if (sourceMediaIds.length > 1) logStatus(`📂 正在抓取收藏夹 ${currentMediaId}...`);

                let pn = 1;
                const ps = 40;
                let totalInFolder = 0;

                while (!state.cancelRequested) {
                    if (pn <= 3 || pn % 10 === 0) {
                        logStatus(`📥 抓取第 ${pn} 页...${totalInFolder ? ` (已抓 ${fetchedTotal}/${Math.min(videoLimit, totalInAllFolders || fetchedTotal + 100)})` : ''}`);
                    }
                    let listRes;
                    try {
                        listRes = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${currentMediaId}&pn=${pn}&ps=${ps}&platform=web`);
                    } catch (e) {
                        logStatus(`❌ 抓取出错: ${e.message}`);
                        break;
                    }
                    if (listRes.code !== 0) { logStatus(`❌ 抓取出错: ${listRes.message}`); break; }

                    if (pn === 1 && listRes.data && listRes.data.info) {
                        totalInFolder = listRes.data.info.media_count || 0;
                        totalInAllFolders += totalInFolder;
                        logStatus(`📊 收藏夹共 ${totalInFolder} 个视频${limitEnabled ? `，本次处理前 ${Math.min(limitCount, totalInFolder)} 个` : ''}`);
                    }

                    const medias = (listRes.data && listRes.data.medias) || [];
                    for (const v of medias) {
                        if (fetchedTotal >= videoLimit) break;
                        if (settings.skipDeadVideos && isDeadVideo(v)) { deadSkipped++; continue; }
                        // 增量模式：跳过上次整理前已存在的视频（按收藏时间判断）
                        if (lastRunTime > 0 && v.fav_time && v.fav_time <= lastRunTime) { incrementalSkipped++; continue; }
                        // 跨收藏夹去重：记录视频出现的收藏夹
                        if (sourceMediaIds.length > 1) {
                            const folderInfo = { folderId: currentMediaId, folderTitle: folderTitleMap[currentMediaId] || currentMediaId };
                            if (!videoSeenInFolders[v.id]) {
                                videoSeenInFolders[v.id] = [folderInfo];
                            } else {
                                videoSeenInFolders[v.id].push(folderInfo);
                                continue; // 跳过重复添加，不重复发给 AI
                            }
                        }
                        buffer.push(v);
                        allVideos.push(v);
                        videoIdMap[v.id] = v;
                        videoSourceMap[v.id] = currentMediaId;
                        fetchedTotal++;
                    }

                    updateProgress('fetch', fetchedTotal, limitEnabled ? Math.min(limitCount, totalInAllFolders) : totalInAllFolders);
                    flushBuffer(false);

                    const hasMore = listRes.data && listRes.data.has_more;
                    if (!hasMore || medias.length === 0 || fetchedTotal >= videoLimit) break;
                    pn++;
                    await humanDelay(getAdaptiveFetchDelay());
                }
                if (fetchedTotal >= videoLimit) break;
            }

            // 抓取结束：缓冲区剩余全部发出
            flushBuffer(true);

            // 保存抓取缓存（供取消后复用）
            videoFetchCache.mediaId = cacheKey;
            videoFetchCache.videos = allVideos.map(v => ({ ...v, _sourceMediaId: videoSourceMap[v.id] }));
            videoFetchCache.timestamp = Date.now();

            } // end of cache else block

            if (deadSkipped > 0) logStatus(`🗑️ 已跳过 ${deadSkipped} 个失效视频`);
            if (incrementalSkipped > 0) logStatus(`📅 增量模式：跳过 ${incrementalSkipped} 个已整理过的视频`);

            // 跨收藏夹去重检测
            if (sourceMediaIds.length > 1) {
                for (const [vid, folders] of Object.entries(videoSeenInFolders)) {
                    if (folders.length >= 2) {
                        const info = videoIdMap[vid];
                        crossFolderDups.push({
                            id: vid,
                            type: info ? (info.type !== undefined ? info.type : 2) : 2,
                            title: info ? info.title : vid,
                            folders: folders
                        });
                    }
                }
                if (crossFolderDups.length > 0) {
                    logStatus(`🔍 检测到 ${crossFolderDups.length} 个跨收藏夹重复视频`);
                }
            }
            logStatus(`✅ 抓取完毕！共 ${allVideos.length} 个有效视频，${totalAiCalls} 个 AI 请求已发出 (并发 ${aiConcurrency})，等待全部完成...`);

            // 等待所有 AI 请求完成（支持取消中断，确保 interval 始终清理）
            const waitResult = await new Promise(resolve => {
                let settled = false;
                function settle(result) {
                    if (settled) return;
                    settled = true;
                    clearInterval(checkCancel);
                    clearTimeout(safetyTimeout);
                    resolve(result);
                }
                const checkCancel = setInterval(() => {
                    if (state.cancelRequested) settle('cancelled');
                }, 500);
                // 安全超时：30分钟后强制结束，防止 interval 泄漏
                const safetyTimeout = setTimeout(() => settle('timeout'), 30 * 60 * 1000);
                Promise.all(aiPromises).then(() => settle('done')).catch(() => settle('error'));
            });
            if (waitResult === 'timeout') {
                logStatus('⚠️ AI 处理超时（30分钟），请检查网络和 API 状态');
            }

            if (waitResult === 'cancelled' || state.cancelRequested) {
                logStatus('⏹ 用户已取消');
                resetMainButton();
                return;
            }

            if (Object.keys(allCategories).length === 0) {
                logStatus('⚠️ AI 未返回任何分类结果');
                resetMainButton();
                return;
            }

            // 去重：同一视频被分到多个分类时，保留第一个（防止 AI 重复分配）
            const seenVideoIds = new Set();
            let dupRemoved = 0;
            for (const [catName, vids] of Object.entries(allCategories)) {
                allCategories[catName] = vids.filter(v => {
                    const key = `${v.id}:${v.type}`;
                    if (seenVideoIds.has(key)) { dupRemoved++; return false; }
                    seenVideoIds.add(key);
                    return true;
                });
                if (allCategories[catName].length === 0) delete allCategories[catName];
            }
            if (dupRemoved > 0) logStatus(`🔄 去重：移除了 ${dupRemoved} 个重复分配的视频`);

            // 遗漏检测：找出 AI 未分配的视频，归入"未分类"
            const assignedIds = new Set(seenVideoIds);
            const missedVideos = allVideos.filter(v => !assignedIds.has(`${v.id}:${v.type}`));
            if (missedVideos.length > 0) {
                logStatus(`⚠️ AI 遗漏了 ${missedVideos.length} 个视频，已自动归入"未分类"收藏夹`);
                if (!allCategories['未分类']) allCategories['未分类'] = [];
                allCategories['未分类'].push(...missedVideos.map(v => ({ id: v.id, type: v.type })));
            }

            // 合并大小写或近似的分类名（如 "游戏" vs "游戏  "）
            const normalizedCats = {};
            for (const [catName, vids] of Object.entries(allCategories)) {
                const trimmed = catName.trim();
                // 查找已有分类中是否有仅大小写/空格不同的名称
                const existingKey = Object.keys(normalizedCats).find(k => k.trim().toLowerCase() === trimmed.toLowerCase());
                if (existingKey) {
                    normalizedCats[existingKey].push(...vids);
                    dupRemoved += vids.length;
                } else {
                    normalizedCats[trimmed] = vids;
                }
            }
            // 替换原始分类
            for (const key of Object.keys(allCategories)) delete allCategories[key];
            for (const [k, v] of Object.entries(normalizedCats)) allCategories[k] = v;

            // 智能小分类合并建议：将只有1个视频的新分类自动合并到"未分类"
            const tinyCats = Object.entries(allCategories).filter(
                ([name, vids]) => vids.length === 1 && !existingFoldersMap[name] && name !== '未分类'
            );
            if (tinyCats.length >= 3) {
                // 只有新建分类才合并（已有收藏夹不动）
                logStatus(`🔄 发现 ${tinyCats.length} 个仅含1个视频的新分类，自动合并到「未分类」以避免碎片化`);
                if (!allCategories['未分类']) allCategories['未分类'] = [];
                for (const [name, vids] of tinyCats) {
                    allCategories['未分类'].push(...vids);
                    delete allCategories[name];
                }
            }

            // 5. 预览确认（始终开启）
            logStatus('📋 请在下方预览分类结果，确认后执行移动');
            updateProgress('ai', totalAiCalls, totalAiCalls);
            let confirmed;
            // 循环处理合并操作后的重新渲染
            do {
                confirmed = await renderPreview(allCategories, existingFoldersMap, videoIdMap, sourceMediaId, biliData, crossFolderDups);
            } while (confirmed === 'rerender');
            if (!confirmed) {
                logStatus('❌ 用户取消了操作');
                resetMainButton();
                return;
            }

            // 6. 跨收藏夹去重（如果用户勾选了）
            if (state.cleanCrossFolderDups && crossFolderDups.length > 0) {
                logStatus(`🔍 正在清理 ${crossFolderDups.length} 个跨收藏夹重复视频...`);
                let dupRemoved2 = 0;
                for (let i = 0; i < crossFolderDups.length; i++) {
                    if (state.cancelRequested) { logStatus('⏹ 用户已取消去重'); break; }
                    const d = crossFolderDups[i];
                    // 保留第一个收藏夹，删除其他收藏夹中的副本
                    for (let fi = 1; fi < d.folders.length; fi++) {
                        const resource = `${d.id}:${d.type}`;
                        try {
                            await batchDeleteVideos(d.folders[fi].folderId, resource, biliData);
                            dupRemoved2++;
                        } catch (e) { logStatus(`⚠️ 去重删除失败: ${e.message}`); }
                        await humanDelay(getAdaptiveWriteDelay());
                    }
                    if ((i + 1) % 10 === 0 || i === crossFolderDups.length - 1) {
                        logStatus(`🗑️ 去重进度：${i + 1}/${crossFolderDups.length}（已删除 ${dupRemoved2} 个副本）`);
                    }
                }
                logStatus(`✅ 跨收藏夹去重完成，共删除 ${dupRemoved2} 个副本`);
                state.cleanCrossFolderDups = false;
            }

            // 7. 执行移动（记录撤销数据）
            logStatus('🏗️ 开始执行移动操作...');
            const categoryEntries = Object.entries(allCategories);
            const undoMoves = []; // 撤销记录

            for (let catIdx = 0; catIdx < categoryEntries.length; catIdx++) {
                if (state.cancelRequested) { logStatus('⏹ 用户已取消'); break; }
                const [categoryName, vids] = categoryEntries[catIdx];
                if (!vids || vids.length === 0) continue;

                // 精确匹配 → 忽略大小写/空格匹配 → 新建
                let targetFolderId = existingFoldersMap[categoryName];
                if (!targetFolderId) {
                    // 尝试模糊匹配已有收藏夹名（忽略大小写和首尾空格）
                    const fuzzyMatch = Object.keys(existingFoldersMap).find(
                        k => k.trim().toLowerCase() === categoryName.trim().toLowerCase()
                    );
                    if (fuzzyMatch) {
                        targetFolderId = existingFoldersMap[fuzzyMatch];
                        logStatus(`📌 分类【${categoryName}】匹配到已有收藏夹【${fuzzyMatch}】`);
                    } else {
                        targetFolderId = await createFolder(categoryName, biliData);
                        existingFoldersMap[categoryName] = targetFolderId;
                        await humanDelay(getAdaptiveWriteDelay());
                    }
                }

                logStatus(`🚚 [${catIdx + 1}/${categoryEntries.length}] 移动 ${vids.length} 个视频到【${categoryName}】...`);
                const mChunk = settings.moveChunkSize;
                for (let i = 0; i < vids.length; i += mChunk) {
                    if (state.cancelRequested) break;
                    const moveChunk = vids.slice(i, i + mChunk);

                    // 按来源收藏夹分组（多收藏夹模式下同一 chunk 可能包含不同来源的视频）
                    const bySource = {};
                    moveChunk.forEach(v => {
                        const src = videoSourceMap[v.id] || sourceMediaId;
                        if (!bySource[src]) bySource[src] = [];
                        bySource[src].push(v);
                    });

                    for (const [fromMediaId, subChunk] of Object.entries(bySource)) {
                        if (state.cancelRequested) break;
                        const resourcesStr = subChunk.map(v => `${v.id}:${v.type}`).join(',');
                        let moveSuccess = false;
                        try {
                            moveSuccess = await moveVideos(fromMediaId, targetFolderId, resourcesStr, biliData);
                        } catch (moveErr) {
                            logStatus(`⚠️ 移动出错: ${moveErr.message}`);
                        }
                        if (moveSuccess) {
                            undoMoves.push({
                                resources: resourcesStr,
                                fromMediaId: fromMediaId,
                                toMediaId: targetFolderId,
                                count: subChunk.length,
                                categoryName: categoryName
                            });
                        }
                        if (Object.keys(bySource).length > 1) await humanDelay(getAdaptiveWriteDelay());
                    }
                    await humanDelay(getAdaptiveWriteDelay());
                }
                totalProcessed += vids.length;
                updateProgress('move', catIdx + 1, categoryEntries.length);
            }

            // 保存撤销数据
            if (undoMoves.length > 0) {
                saveUndoData({
                    time: new Date().toISOString(),
                    timeLocal: new Date().toLocaleString('zh-CN'),
                    sourceMediaIds: sourceMediaIds,
                    totalVideos: totalProcessed,
                    totalCategories: Object.keys(allCategories).length,
                    moves: undoMoves
                });
            }

            // 抽样验证：检查最多3个目标收藏夹，确认视频是否成功移入
            if (undoMoves.length > 0 && !state.cancelRequested) {
                logStatus('🔍 正在验证移动结果...');
                const targetIds = [...new Set(undoMoves.map(m => m.toMediaId))];
                const sampleIds = targetIds.slice(0, 3);
                let verifyOk = 0, verifyFail = 0;
                for (const tid of sampleIds) {
                    try {
                        const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${tid}&pn=1&ps=1&platform=web`);
                        if (res.code === 0 && res.data && res.data.info && res.data.info.media_count > 0) {
                            verifyOk++;
                        } else {
                            verifyFail++;
                        }
                        await sleep(500);
                    } catch (e) { verifyFail++; }
                }
                if (verifyFail > 0) {
                    logStatus(`⚠️ 抽样验证：${verifyOk}/${sampleIds.length} 个收藏夹确认有内容，${verifyFail} 个异常`);
                } else {
                    logStatus(`✅ 抽样验证通过：${verifyOk} 个收藏夹已确认`);
                }
            }

            const elapsedSec = Math.round((Date.now() - state.progressStartTime) / 1000);
            const elapsedStr = elapsedSec >= 60 ? `${Math.floor(elapsedSec / 60)}分${elapsedSec % 60}秒` : `${elapsedSec}秒`;
            logStatus(`\n🎉 全部完成！共处理 ${totalProcessed} 个视频，分到 ${Object.keys(allCategories).length} 个收藏夹，耗时 ${elapsedStr}。请刷新页面！`);

            // 保存本次运行时间戳（用于增量模式）
            GM_setValue('bfao_lastRunTime', Math.floor(Date.now() / 1000));

            // Token 用量统计 & 费用估算
            if (tokenUsage.totalTokens > 0) {
                logStatus(`📊 Token 用量：输入 ${formatTokenCount(tokenUsage.promptTokens)} + 输出 ${formatTokenCount(tokenUsage.completionTokens)} = 总计 ${formatTokenCount(tokenUsage.totalTokens)} (${tokenUsage.callCount} 次调用)`);
                const costStr = estimateCost(settings);
                if (costStr) logStatus(`💰 预估费用：${costStr}`);
            }

            // 后台通知
            if (settings.notifyOnComplete) {
                sendNotification('整理完成！', `已将 ${totalProcessed} 个视频分到 ${Object.keys(allCategories).length} 个收藏夹`);
            }

            // 自适应限速统计
            if (settings.adaptiveRate && state.adaptive.rateLimitHits > 0) {
                logStatus(`⚡ 本次运行被限流 ${state.adaptive.rateLimitHits} 次，自适应延迟最终值：抓取=${state.adaptive.currentFetchDelay}ms 写入=${state.adaptive.currentWriteDelay}ms`);
            }

            // 保存整理历史
            try {
                const history = JSON.parse(GM_getValue('bfao_history', '[]'));
                history.unshift({
                    time: new Date().toLocaleString('zh-CN'),
                    videoCount: totalProcessed,
                    categoryCount: Object.keys(allCategories).length,
                    categories: Object.entries(allCategories).map(([k, v]) => `${k}(${v.length})`).slice(0, 8).join('、')
                });
                GM_setValue('bfao_history', JSON.stringify(history.slice(0, 10))); // 保留最近10次
            } catch(e) { console.warn('[AI整理] 整理历史保存失败:', e.message); }
            // 显示报告导出按钮
            const tokenInfo = tokenUsage.totalTokens > 0 ? `Token: ${formatTokenCount(tokenUsage.totalTokens)}` : null;
            const previewArea = document.getElementById('ai-preview-area');
            previewArea.innerHTML = `<div style="display:flex;gap:8px;align-items:center;">
                <button id="ai-post-report" class="ai-btn ai-btn-primary" style="padding:6px 14px;font-size:12px;border-radius:6px;">📄 导出整理报告</button>
                <span style="font-size:11px;color:var(--ai-text-muted);">导出本次整理的 HTML 格式报告</span>
            </div>`;
            previewArea.style.display = 'block';
            document.getElementById('ai-post-report').onclick = () => {
                generateOrganizeReport(allCategories, videoIdMap, existingFoldersMap, elapsedStr, tokenInfo);
            };

            btn.innerHTML = '<i data-lucide="check" style="width:15px;height:15px;"></i> 完成，点我刷新';
            if (typeof lucide !== 'undefined') lucide.createIcons({nodes:[btn]});
            btn.style.background = '#4CAF50';
            btn.disabled = false;
            btn.onclick = () => window.location.reload();
            state.isRunning = false;
            setToolButtonsDisabled(false);

        } catch (error) {
            logStatus(`❌ 发生未知错误，请看 F12 控制台`);
            console.error(error);
            resetMainButton();
        }
    }

    function resetMainButton() {
        const btn = document.getElementById('ai-start-btn');
        if (btn) {
            btn.innerHTML = '<i data-lucide="play" style="width:15px;height:15px;"></i> 开始深度整理';
            if (typeof lucide !== 'undefined') lucide.createIcons({nodes:[btn]});
            btn.style.background = '#fb7299';
            btn.disabled = false;
            btn.onclick = startProcess;
        }
        state.isRunning = false;
        state.cancelRequested = false;
        setToolButtonsDisabled(false);
        const stopBtn = document.getElementById('ai-tool-stop');
        if (stopBtn) stopBtn.style.display = 'none';
        hideProgress();
    }

    function setToolButtonsDisabled(disabled) {
        ['ai-tool-clean', 'ai-tool-dup', 'ai-tool-undo', 'ai-tool-backup', 'ai-tool-bench', 'ai-tool-log-export', 'ai-tool-health'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.disabled = disabled; el.style.opacity = disabled ? '0.5' : '1'; }
        });
    }

    // ================= 定时自动整理 =================
    let _autoOrganizeTimer = null;

    function setupAutoOrganize() {
        // 清除旧定时器
        if (_autoOrganizeTimer) { clearInterval(_autoOrganizeTimer); _autoOrganizeTimer = null; }

        const settings = loadSettings();
        if (!settings.autoOrganizeEnabled || !settings.apiKey) return;

        const intervalMs = (settings.autoOrganizeInterval || 60) * 60 * 1000;
        console.log(`[AI整理] ⏰ 定时整理已启用，间隔 ${settings.autoOrganizeInterval} 分钟`);

        _autoOrganizeTimer = setInterval(() => {
            if (state.isRunning) {
                console.log('[AI整理] ⏰ 定时整理跳过：当前有任务运行中');
                return;
            }
            autoOrganizeRun();
        }, intervalMs);

        // 页面加载后检查是否需要立即运行（距上次运行超过间隔时间）
        const lastRun = GM_getValue('bfao_lastRunTime', 0);
        const elapsed = Date.now() - lastRun * 1000;
        if (lastRun > 0 && elapsed > intervalMs) {
            // 延迟 10 秒后运行，避免页面加载时立即触发
            setTimeout(() => {
                if (!state.isRunning) autoOrganizeRun();
            }, 10000);
        }
    }

    async function autoOrganizeRun() {
        const settings = loadSettings();
        if (!settings.apiKey || state.isRunning) return;

        const biliData = getBiliData();
        if (!biliData.mid || !biliData.csrf) return;

        const sourceMediaId = getSourceMediaId();
        if (!sourceMediaId) {
            console.log('[AI整理] ⏰ 定时整理跳过：未在收藏夹页面');
            return;
        }

        logStatus('⏰ 定时自动整理开始（增量模式）...');

        // 强制使用增量模式，避免重复处理
        const origIncremental = settings.incrementalMode;
        GM_setValue('bfao_incrementalMode', true);

        try {
            await startProcess();
        } catch (e) {
            logStatus(`⏰ 定时整理出错: ${e.message}`);
        }

        // 恢复原始增量模式设置
        GM_setValue('bfao_incrementalMode', origIncremental);
    }

    // ================= 工具：失效视频批量移动到专用收藏夹 =================
    const DEAD_VIDEO_FOLDER_NAME = '失效视频归档';

    async function cleanDeadVideos() {
        const biliData = getBiliData();
        if (!biliData.mid || !biliData.csrf) return alert("请确保你在 B 站已登录！");

        document.getElementById('ai-status-log').innerHTML = '';
        state.isRunning = true;
        state.cancelRequested = false;
        setToolButtonsDisabled(true);
        const stopBtn = document.getElementById('ai-tool-stop');
        stopBtn.style.display = 'inline-flex';
        stopBtn.onclick = () => { state.cancelRequested = true; };

        const settings = loadSettings();
        initAdaptiveState(settings);
        logStatus('🔍 正在扫描所有收藏夹中的失效视频...');

        try {
            const allFolders = await getAllFoldersWithIds(biliData);
            logStatus(`📦 共 ${allFolders.length} 个收藏夹，开始逐个扫描...`);

            const deadVideos = []; // [{id, type, title, folderId, folderTitle}]
            let totalScanned = 0;

            for (let fi = 0; fi < allFolders.length; fi++) {
                if (state.cancelRequested) { logStatus('⏹ 用户已取消'); resetMainButton(); return; }
                const folder = allFolders[fi];
                logStatus(`🔍 扫描 [${fi + 1}/${allFolders.length}] ${folder.title}...`);

                let pn = 1;
                while (true) {
                    if (state.cancelRequested) break;
                    try {
                        const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=40&platform=web`);
                        if (res.code !== 0) break;
                        const medias = (res.data && res.data.medias) || [];
                        medias.forEach(v => {
                            totalScanned++;
                            if (isDeadVideo(v)) {
                                deadVideos.push({
                                    id: v.id, type: v.type !== undefined ? v.type : 2,
                                    title: v.title || `ID:${v.id}`,
                                    folderId: folder.id, folderTitle: folder.title
                                });
                            }
                        });
                        if (!res.data.has_more || medias.length === 0) break;
                        pn++;
                        await waitForGlobalCooldown();
                        await humanDelay(getAdaptiveFetchDelay());
                    } catch (e) {
                        logStatus(`⚠️ 扫描 ${folder.title} 出错: ${e.message}，跳过`);
                        break;
                    }
                }
                await waitForGlobalCooldown();
                await humanDelay(getAdaptiveFetchDelay());
            }

            logStatus(`📊 扫描完成，共扫描 ${totalScanned} 个视频`);

            if (deadVideos.length === 0) {
                logStatus('✅ 没有发现失效视频！你的收藏夹很健康！');
                resetMainButton();
                return;
            }

            logStatus(`🗑️ 发现 ${deadVideos.length} 个失效视频，分布在 ${new Set(deadVideos.map(v => v.folderId)).size} 个收藏夹中`);

            // 显示结果并提供操作按钮
            const previewDiv = document.getElementById('ai-preview-area');
            const showCount = Math.min(deadVideos.length, 50);
            // 按来源收藏夹分组
            const byFolder = {};
            deadVideos.forEach(v => {
                if (!byFolder[v.folderTitle]) byFolder[v.folderTitle] = [];
                byFolder[v.folderTitle].push(v);
            });
            let html = `<div style="font-size:13px;font-weight:bold;margin-bottom:8px;">🗑️ 发现 ${deadVideos.length} 个失效视频</div>`;
            for (const [folderName, vids] of Object.entries(byFolder)) {
                html += `<div style="font-size:11px;font-weight:bold;color:var(--ai-text-secondary);padding:4px 0;margin-top:4px;">📁 ${escapeHtml(folderName)} (${vids.length}个)</div>`;
                vids.slice(0, 10).forEach(v => {
                    html += `<div style="font-size:11px;padding:2px 0 2px 12px;border-bottom:1px solid var(--ai-border-lighter);color:var(--ai-text-muted);">• ${escapeHtml(v.title)}</div>`;
                });
                if (vids.length > 10) html += `<div style="font-size:10px;color:var(--ai-text-muted);padding:2px 0 2px 12px;">...及其他 ${vids.length - 10} 个</div>`;
            }
            html += `<div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button id="ai-dead-move" class="ai-btn ai-btn-primary" style="padding:6px 14px;font-size:12px;border-radius:6px;">📦 移动到「${DEAD_VIDEO_FOLDER_NAME}」</button>
                <button id="ai-dead-delete" class="ai-btn" style="padding:6px 14px;font-size:12px;border-radius:6px;background:#e74c3c;color:#fff;border:none;">🗑️ 直接删除</button>
                <span style="font-size:10px;color:var(--ai-text-muted);line-height:1.3;">移动到专用收藏夹便于日后查看；删除不可撤销</span>
            </div>`;
            previewDiv.innerHTML = html;
            previewDiv.style.display = 'block';

            // 移动到专用收藏夹
            const moveBtn = document.getElementById('ai-dead-move');
            if (moveBtn) {
                moveBtn.onclick = async () => {
                    moveBtn.disabled = true;
                    moveBtn.textContent = '正在处理...';
                    const delBtn = document.getElementById('ai-dead-delete');
                    if (delBtn) delBtn.disabled = true;
                    state.isRunning = true;
                    initAdaptiveState(loadSettings());

                    try {
                        // 创建或获取专用收藏夹
                        const existingFolders = await getMyFolders(biliData);
                        let targetFolderId = existingFolders[DEAD_VIDEO_FOLDER_NAME];
                        if (!targetFolderId) {
                            targetFolderId = await createFolder(DEAD_VIDEO_FOLDER_NAME, biliData);
                            logStatus(`📁 已创建专用收藏夹「${DEAD_VIDEO_FOLDER_NAME}」`);
                            await humanDelay(getAdaptiveWriteDelay());
                        }

                        // 按来源收藏夹分组移动
                        let moved = 0;
                        const moveChunkSize = loadSettings().moveChunkSize;
                        const sourceGroups = {};
                        deadVideos.forEach(v => {
                            if (!sourceGroups[v.folderId]) sourceGroups[v.folderId] = [];
                            sourceGroups[v.folderId].push(v);
                        });

                        for (const [srcId, vids] of Object.entries(sourceGroups)) {
                            if (state.cancelRequested) { logStatus('⏹ 用户已取消'); break; }
                            for (let i = 0; i < vids.length; i += moveChunkSize) {
                                if (state.cancelRequested) break;
                                const chunk = vids.slice(i, i + moveChunkSize);
                                const resourcesStr = chunk.map(v => `${v.id}:${v.type}`).join(',');
                                try {
                                    const success = await moveVideos(srcId, targetFolderId, resourcesStr, biliData);
                                    if (success) moved += chunk.length;
                                } catch (e) {
                                    logStatus(`⚠️ 移动出错: ${e.message}`);
                                }
                                await humanDelay(getAdaptiveWriteDelay());
                            }
                            logStatus(`📦 已从「${sourceGroups[srcId][0]?.folderTitle || srcId}」移动 ${vids.length} 个失效视频`);
                        }

                        logStatus(`✅ 完成！共 ${moved} 个失效视频已移动到「${DEAD_VIDEO_FOLDER_NAME}」。请刷新页面。`);
                        const s = loadSettings();
                        if (s.notifyOnComplete) sendNotification('失效视频清理完成', `${moved} 个视频已移动到「${DEAD_VIDEO_FOLDER_NAME}」`);
                        moveBtn.textContent = '已完成';
                    } catch (err) {
                        logStatus(`❌ 移动失败: ${err.message}`);
                    }
                    resetMainButton();
                };
            }

            // 直接删除（保留原有功能作为备选）
            const deleteBtn = document.getElementById('ai-dead-delete');
            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (!confirm(`确定要直接删除 ${deadVideos.length} 个失效视频吗？\n\n此操作不可撤销！`)) return;
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = '正在删除...';
                    if (moveBtn) moveBtn.disabled = true;
                    state.isRunning = true;
                    initAdaptiveState(loadSettings());

                    let deleted = 0;
                    const sourceGroups = {};
                    deadVideos.forEach(v => {
                        if (!sourceGroups[v.folderId]) sourceGroups[v.folderId] = [];
                        sourceGroups[v.folderId].push(v);
                    });

                    for (const [srcId, vids] of Object.entries(sourceGroups)) {
                        if (state.cancelRequested) { logStatus('⏹ 用户已取消'); break; }
                        const resources = vids.map(v => `${v.id}:${v.type}`).join(',');
                        try {
                            await batchDeleteVideos(srcId, resources, biliData);
                            deleted += vids.length;
                        } catch (e) { logStatus(`⚠️ 删除失败: ${e.message}`); }
                        await humanDelay(getAdaptiveWriteDelay());
                    }

                    logStatus(`✅ 删除完成！共删除 ${deleted} 个失效视频。请刷新页面。`);
                    deleteBtn.textContent = '已完成';
                    resetMainButton();
                };
            }

        } catch (err) {
            logStatus(`❌ 扫描失败: ${err.message}`);
            console.error(err);
        }
        resetMainButton();
    }

    // ================= 工具：重复检测 =================
    async function findDuplicates() {
        const biliData = getBiliData();
        if (!biliData.mid || !biliData.csrf) return alert("请确保你在 B 站已登录！");
        const settings = loadSettings();
        const { fetchDelay } = settings;
        initAdaptiveState(settings);

        state.isRunning = true;
        state.cancelRequested = false;
        setToolButtonsDisabled(true);
        const stopBtn = document.getElementById('ai-tool-stop');
        stopBtn.style.display = 'inline-flex';
        stopBtn.onclick = () => { state.cancelRequested = true; };
        document.getElementById('ai-status-log').innerHTML = '';
        logStatus('🔍 正在扫描所有收藏夹...');

        try {
            const allFolders = await getAllFoldersWithIds(biliData);
            logStatus(`📦 共 ${allFolders.length} 个收藏夹，开始逐个扫描...`);

            const videoFolderMap = {}; // videoId -> [{folderTitle, videoTitle}]
            let totalScanned = 0;

            for (let fi = 0; fi < allFolders.length; fi++) {
                if (state.cancelRequested) { logStatus('⏹ 用户已取消'); resetMainButton(); return; }

                const folder = allFolders[fi];
                logStatus(`🔍 扫描 [${fi + 1}/${allFolders.length}] ${folder.title}...`);

                let pn = 1;
                while (true) {
                    if (state.cancelRequested) break;
                    const listUrl = `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${folder.id}&pn=${pn}&ps=40&platform=web`;
                    let listRes;
                    try {
                        listRes = await safeFetchJson(listUrl);
                    } catch (e) {
                        logStatus(`⚠️ 扫描 ${folder.title} 出错: ${e.message}，跳过`);
                        break;
                    }
                    if (listRes.code !== 0) break;

                    const videos = (listRes.data && listRes.data.medias) ? listRes.data.medias : [];
                    videos.forEach(v => {
                        if (!videoFolderMap[v.id]) videoFolderMap[v.id] = [];
                        videoFolderMap[v.id].push({ folderTitle: folder.title, folderId: folder.id, videoTitle: v.title, videoType: v.type });
                    });
                    totalScanned += videos.length;

                    const hasMore = listRes.data && listRes.data.has_more;
                    if (!hasMore || videos.length === 0) break;
                    pn++;
                    if (pn > 2) logStatus(`🔍 扫描 [${fi + 1}/${allFolders.length}] ${folder.title} 第${pn}页 (已收集 ${totalScanned} 个视频)...`);
                    await waitForGlobalCooldown();
                    await humanDelay(getAdaptiveFetchDelay());
                }
                await waitForGlobalCooldown();
                await humanDelay(getAdaptiveFetchDelay());
            }
            logStatus(`📊 扫描完成，共收集 ${totalScanned} 条视频记录`);

            // 找重复
            const duplicates = [];
            for (const [vid, entries] of Object.entries(videoFolderMap)) {
                if (entries.length >= 2) duplicates.push({ id: vid, title: entries[0].videoTitle, folders: entries.map(e => e.folderTitle), folderIds: entries.map(e => e.folderId), type: entries[0].videoType !== undefined ? entries[0].videoType : 2 });
            }

            if (duplicates.length === 0) {
                logStatus('✅ 没有发现重复视频！');
                resetMainButton();
                return;
            }

            logStatus(`🔍 发现 ${duplicates.length} 个重复视频`);

            // 显示结果
            const previewDiv = document.getElementById('ai-preview-area');
            let html = `<div style="font-size:13px;font-weight:bold;margin-bottom:8px;">🔍 发现 ${duplicates.length} 个重复视频</div>`;
            const showCount = Math.min(duplicates.length, 50);
            for (let i = 0; i < showCount; i++) {
                const d = duplicates[i];
                html += `<div style="font-size:11px;padding:4px 0;border-bottom:1px solid var(--ai-border-lighter);">
                    <div style="color:var(--ai-text);">• ${escapeHtml(d.title)}</div>
                    <div style="color:var(--ai-text-muted);padding-left:12px;">出现在：${d.folders.map(f => escapeHtml(f)).join('、')}</div>
                </div>`;
            }
            if (duplicates.length > 50) html += `<div style="font-size:11px;color:var(--ai-text-muted);padding:4px 0;">...及其他 ${duplicates.length - 50} 个</div>`;
            html += `<div style="margin-top:10px;display:flex;gap:8px;align-items:center;">
                <button id="ai-dup-dedup" class="ai-btn ai-btn-primary" style="padding:6px 14px;font-size:12px;border-radius:6px;">一键去重</button>
                <span style="font-size:10px;color:var(--ai-text-muted);line-height:1.3;">保留首次出现的收藏夹，从其他收藏夹删除副本</span>
            </div>`;
            previewDiv.innerHTML = html;
            previewDiv.style.display = 'block';

            // 一键去重
            const dedupBtn = document.getElementById('ai-dup-dedup');
            if (dedupBtn) {
                dedupBtn.onclick = async () => {
                    if (!confirm(`确定要对 ${duplicates.length} 个重复视频执行去重吗？\n\n每个视频仅保留在第一个出现的收藏夹中，从其他收藏夹删除副本。`)) return;
                    dedupBtn.disabled = true;
                    dedupBtn.textContent = '正在去重...';
                    state.isRunning = true;
                    let removed = 0;
                    const s = loadSettings();
                    initAdaptiveState(s);
                    for (let i = 0; i < duplicates.length; i++) {
                        if (state.cancelRequested) { logStatus('⏹ 用户已取消去重'); break; }
                        const d = duplicates[i];
                        for (let fi = 1; fi < d.folderIds.length; fi++) {
                            const resource = `${d.id}:${d.type}`;
                            try {
                                await batchDeleteVideos(d.folderIds[fi], resource, biliData);
                                removed++;
                            } catch (e) { logStatus(`⚠️ 删除失败: ${e.message}`); }
                            await humanDelay(getAdaptiveWriteDelay());
                        }
                        if ((i + 1) % 10 === 0 || i === duplicates.length - 1) logStatus(`🗑️ 去重进度：${i + 1}/${duplicates.length}（已删除 ${removed} 个副本）`);
                    }
                    logStatus(`✅ 去重完成！共删除 ${removed} 个重复副本。请刷新页面。`);
                    if (s.notifyOnComplete) sendNotification('去重完成', `已删除 ${removed} 个重复副本`);
                    dedupBtn.textContent = '已完成';
                    resetMainButton();
                };
            }

        } catch (err) {
            logStatus(`❌ 扫描失败: ${err.message}`);
            console.error(err);
        }
        resetMainButton();
    }

    // ================= 设置区展开/折叠 =================
    function toggleSettings(forceOpen) {
        const area = document.getElementById('ai-settings-area');
        if (!area) return;
        // 用 computed style 判断，兼容 CSS class 设置的 display:none
        const isOpen = window.getComputedStyle(area).display !== 'none';
        area.style.display = (forceOpen === true || !isOpen) ? 'block' : 'none';
    }

    // ================= UI 构建 =================
    function initUI() {
        if (document.getElementById('ai-sort-wrapper')) return;

        const settings = loadSettings();

        // 悬浮按钮
        const floatBtn = document.createElement('div');
        floatBtn.id = 'ai-float-btn';
        floatBtn.innerHTML = '<i data-lucide="bot"></i>';
        floatBtn.style.zIndex = '2147483640';

        // 主面板
        const panel = document.createElement('div');
        panel.id = 'ai-sort-wrapper';
        panel.style.display = 'none';
        panel.style.zIndex = '2147483641';

        const providerConfig = AI_PROVIDERS[settings.provider] || AI_PROVIDERS.gemini;

        panel.innerHTML = `
            <!-- 标题栏 -->
            <div class="ai-header">
                <span class="ai-header-title"><i data-lucide="bot"></i> AI 收藏夹整理助理</span>
                <div class="ai-header-actions">
                    <span id="ai-theme-toggle" class="ai-header-btn" title="切换主题"><i data-lucide="moon"></i></span>
                    <span id="ai-settings-toggle" class="ai-header-btn" title="设置"><i data-lucide="settings"></i></span>
                    <span id="ai-close-btn" class="ai-header-btn" title="关闭"><i data-lucide="x"></i></span>
                </div>
            </div>

            <div class="ai-panel-content">
                <!-- ===== 设置区 (默认折叠) ===== -->
                <div id="ai-settings-area" class="ai-settings">

                    <!-- 分组1: AI 配置 (默认展开) -->
                    <div class="ai-group-header" data-group="ai-group-1">
                        <span class="ai-group-icon" style="background:#fff0f5;color:#fb7299;"><i data-lucide="cpu" style="width:13px;height:13px;"></i></span>
                        <span style="flex:1;">AI 配置</span>
                        <i data-lucide="chevron-down" style="width:14px;height:14px;color:#ccc;transition:transform 0.3s;"></i>
                    </div>
                    <div class="ai-group-body" id="ai-group-1">
                        <div style="margin-bottom:8px;">
                            <label class="ai-label">AI 服务商</label>
                            <div style="display:flex;gap:4px;">
                                <select id="ai-set-provider" class="ai-select" style="flex:1;">
                                    ${Object.entries(AI_PROVIDERS).map(([k, v]) => `<option value="${k}" ${k === settings.provider ? 'selected' : ''}>${v.name}</option>`).join('')}
                                </select>
                                <button id="ai-goto-api" class="ai-btn" style="padding:4px 8px;font-size:12px;white-space:nowrap;" title="申请 API Key"><i data-lucide="external-link" style="width:13px;height:13px;"></i> 申请</button>
                            </div>
                        </div>
                        <div id="ai-custom-url-row" style="margin-bottom:8px;display:${settings.provider === 'custom' ? 'block' : 'none'};">
                            <label class="ai-label">自定义 API 地址</label>
                            <input id="ai-set-base-url" class="ai-input" type="text" value="${settings.customBaseUrl}" placeholder="https://your-api.com/v1" style="width:100%;">
                        </div>
                        <div style="margin-bottom:8px;">
                            <label class="ai-label">API Key</label>
                            <div style="display:flex;gap:4px;">
                                <input id="ai-set-apikey" class="ai-input" type="password" value="${settings.apiKey}" placeholder="${providerConfig.keyPlaceholder}" style="flex:1;">
                                <button id="ai-set-eye" class="ai-btn" style="padding:4px 8px;" title="显示/隐藏"><i data-lucide="eye" style="width:14px;height:14px;"></i></button>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;margin-bottom:8px;">
                            <div style="flex:1;position:relative;">
                                <label class="ai-label">模型</label>
                                <div style="display:flex;gap:3px;">
                                    <div id="ai-model-trigger" style="flex:1;min-width:0;padding:6px 28px 6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;cursor:pointer;background:#fff;position:relative;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.4;" title="点击选择模型">
                                        <span id="ai-model-display">${settings.modelName || providerConfig.defaultModel || '选择模型...'}</span>
                                        <i data-lucide="chevron-down" style="width:14px;height:14px;position:absolute;right:6px;top:50%;transform:translateY(-50%);color:#999;pointer-events:none;"></i>
                                    </div>
                                    <input id="ai-set-model" type="hidden" value="${settings.modelName}">
                                    <button id="ai-fetch-models" class="ai-btn" style="padding:4px 6px;" title="获取可用模型列表"><i data-lucide="refresh-cw" style="width:13px;height:13px;"></i></button>
                                    <button id="ai-verify-model" class="ai-btn" style="padding:4px 6px;" title="验证模型可用性"><i data-lucide="check-circle" style="width:13px;height:13px;"></i></button>
                                </div>
                                <div id="ai-model-dropdown" style="display:none;position:absolute;left:0;right:0;top:100%;margin-top:4px;border:1px solid var(--ai-primary);border-radius:6px;background:var(--ai-bg);overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.15);z-index:10;">
                                    <div style="display:flex;border-bottom:1px solid #eee;">
                                        <input id="ai-model-custom-input" class="ai-input" type="text" placeholder="搜索或输入自定义模型名..." style="flex:1;border:none;border-radius:0;font-size:12px;">
                                        <button id="ai-model-custom-confirm" class="ai-btn" style="border:none;border-radius:0;padding:6px 10px;font-size:11px;color:#fb7299;">确定</button>
                                    </div>
                                    <select id="ai-model-select" multiple style="width:100%;border:none;outline:none;font-size:12px;max-height:200px;cursor:pointer;"></select>
                                </div>
                            </div>
                            <div style="width:60px;">
                                <label class="ai-label" style="cursor:help;" title="同时发送几个AI请求。1=串行安全 2-3=推荐 5+=高配额">并发 <i data-lucide="info" style="width:11px;height:11px;color:#999;"></i></label>
                                <input id="ai-set-concurrency" class="ai-input" type="number" value="${settings.aiConcurrency}" min="1" max="20" step="1" title="并发数=同时在飞的AI请求数" style="width:100%;">
                            </div>
                        </div>
                    </div>

                    <!-- 分组2: 请求参数 (默认折叠) -->
                    <div class="ai-group-header" data-group="ai-group-2">
                        <span class="ai-group-icon" style="background:#f0f5ff;color:#3498db;"><i data-lucide="sliders-horizontal" style="width:13px;height:13px;"></i></span>
                        <span style="flex:1;">请求参数</span>
                        <i data-lucide="chevron-right" style="width:14px;height:14px;color:#ccc;transition:transform 0.3s;"></i>
                    </div>
                    <div class="ai-group-body" id="ai-group-2" style="display:none;">
                        <div style="margin-bottom:8px;">
                            <label class="ai-label">AI 单次请求数量 <span style="font-size:10px;color:#999;">(每次发给 AI 多少个视频)</span></label>
                            <select id="ai-set-chunk" class="ai-select" style="width:100%;">
                                ${AI_CHUNK_PRESETS.map(p => `<option value="${p.value}" ${p.value === settings.aiChunkSize ? 'selected' : ''}>${p.label} — ${p.desc}</option>`).join('')}
                                <option value="custom" ${!AI_CHUNK_PRESETS.some(p => p.value === settings.aiChunkSize) ? 'selected' : ''}>⚙️ 自定义...</option>
                            </select>
                            <input id="ai-set-chunk-custom" class="ai-input" type="number" min="5" max="300" step="5" value="${settings.aiChunkSize}" placeholder="自定义数量" style="display:${AI_CHUNK_PRESETS.some(p => p.value === settings.aiChunkSize) ? 'none' : 'block'};width:100%;margin-top:4px;">
                        </div>
                        <div style="margin-bottom:8px;">
                            <label class="ai-label">抓取速度 <span style="font-size:10px;color:#999;">(大收藏夹建议用安全模式)</span></label>
                            <select id="ai-set-speed" class="ai-select" style="width:100%;">
                                ${SPEED_PRESETS.map(p => `<option value="${p.value}" ${p.value === settings.fetchDelay ? 'selected' : ''}>${p.label} — ${p.desc}</option>`).join('')}
                                <option value="custom" ${!SPEED_PRESETS.some(p => p.value === settings.fetchDelay) ? 'selected' : ''}>⚙️ 自定义...</option>
                            </select>
                            <input id="ai-set-speed-custom" class="ai-input" type="number" min="400" max="5000" step="100" value="${settings.fetchDelay}" placeholder="毫秒 (ms)" style="display:${SPEED_PRESETS.some(p => p.value === settings.fetchDelay) ? 'none' : 'block'};width:100%;margin-top:4px;">
                        </div>
                        <div style="display:flex;gap:8px;margin-bottom:8px;">
                            <div style="flex:1;">
                                <label class="ai-label">写操作间隔 <span style="font-size:10px;color:#999;">(ms ±30%)</span></label>
                                <input id="ai-set-write-delay" class="ai-input" type="number" value="${settings.writeDelay}" min="500" max="10000" step="500" style="width:100%;">
                            </div>
                            <div style="flex:1;">
                                <label class="ai-label">每次移动数量</label>
                                <input id="ai-set-move-chunk" class="ai-input" type="number" value="${settings.moveChunkSize}" min="1" max="100" step="1" style="width:100%;">
                            </div>
                        </div>
                    </div>

                    <!-- 分组3: 行为 (默认折叠) -->
                    <div class="ai-group-header" data-group="ai-group-3">
                        <span class="ai-group-icon" style="background:#f0fff4;color:#27ae60;"><i data-lucide="toggle-right" style="width:13px;height:13px;"></i></span>
                        <span style="flex:1;">行为</span>
                        <i data-lucide="chevron-right" style="width:14px;height:14px;color:#ccc;transition:transform 0.3s;"></i>
                    </div>
                    <div class="ai-group-body" id="ai-group-3" style="display:none;">
                        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;font-size:12px;">
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;">
                                <input id="ai-set-limit-enabled" type="checkbox" ${settings.limitEnabled ? 'checked' : ''}> 限制本次处理
                            </label>
                            <select id="ai-set-limit-count" class="ai-select" style="padding:4px 6px;${settings.limitEnabled ? '' : 'opacity:0.5;'}">
                                ${[50,100,200,500,1000,2000].map(n => `<option value="${n}" ${n === settings.limitCount ? 'selected' : ''}>${n} 个</option>`).join('')}
                            </select>
                            <span style="font-size:10px;color:#999;">不勾选=全部</span>
                        </div>
                        <div style="display:flex;gap:12px;margin-bottom:8px;font-size:12px;flex-wrap:wrap;">
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;">
                                <input id="ai-set-skipdead" type="checkbox" ${settings.skipDeadVideos ? 'checked' : ''}> 跳过失效视频
                            </label>
                        </div>
                        <div style="display:flex;gap:12px;margin-bottom:8px;font-size:12px;flex-wrap:wrap;">
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="根据B站API限流响应自动调整请求速度">
                                <input id="ai-set-adaptive" type="checkbox" ${settings.adaptiveRate ? 'checked' : ''}> 自适应限速
                            </label>
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="执行整理前自动保存当前收藏夹结构">
                                <input id="ai-set-backup" type="checkbox" ${settings.backupBeforeExecute ? 'checked' : ''}> 自动备份
                            </label>
                        </div>
                        <div style="display:flex;gap:12px;margin-bottom:8px;font-size:12px;flex-wrap:wrap;">
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="操作完成后发送浏览器通知（需要授权）">
                                <input id="ai-set-notify" type="checkbox" ${settings.notifyOnComplete ? 'checked' : ''}> 完成通知
                            </label>
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="整理多个收藏夹中的视频（开始时选择作用域）">
                                <input id="ai-set-multifolder" type="checkbox" ${settings.multiFolderEnabled ? 'checked' : ''}> 跨收藏夹
                            </label>
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="仅处理上次整理后新增的视频，跳过已整理过的内容">
                                <input id="ai-set-incremental" type="checkbox" ${settings.incrementalMode ? 'checked' : ''}> 增量整理
                            </label>
                        </div>
                        <div style="display:flex;gap:12px;margin-bottom:8px;font-size:12px;flex-wrap:wrap;align-items:center;">
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;" title="定时自动运行增量整理（需要页面保持打开）">
                                <input id="ai-set-auto-organize" type="checkbox" ${settings.autoOrganizeEnabled ? 'checked' : ''}> 定时整理
                            </label>
                            <div style="display:flex;align-items:center;gap:4px;">
                                <span style="font-size:11px;color:var(--ai-text-muted);">间隔</span>
                                <select id="ai-set-auto-interval" class="ai-select" style="font-size:11px;padding:2px 4px;">
                                    <option value="30" ${settings.autoOrganizeInterval === 30 ? 'selected' : ''}>30分钟</option>
                                    <option value="60" ${settings.autoOrganizeInterval === 60 ? 'selected' : ''}>1小时</option>
                                    <option value="120" ${settings.autoOrganizeInterval === 120 ? 'selected' : ''}>2小时</option>
                                    <option value="360" ${settings.autoOrganizeInterval === 360 ? 'selected' : ''}>6小时</option>
                                    <option value="720" ${settings.autoOrganizeInterval === 720 ? 'selected' : ''}>12小时</option>
                                </select>
                            </div>
                        </div>
                        <div id="ai-auto-organize-status" style="font-size:10px;color:var(--ai-text-muted);display:${settings.autoOrganizeEnabled ? 'block' : 'none'};margin-bottom:4px;">⏰ 定时整理已启用，将自动使用增量模式</div>
                    </div>

                    <!-- 分组4: 动画效果 (默认折叠) -->
                    <div class="ai-group-header" data-group="ai-group-4">
                        <span class="ai-group-icon" style="background:#fff8f0;color:#f39c12;"><i data-lucide="sparkles" style="width:13px;height:13px;"></i></span>
                        <span style="flex:1;">动画效果</span>
                        <i data-lucide="chevron-right" style="width:14px;height:14px;color:#ccc;transition:transform 0.3s;"></i>
                    </div>
                    <div class="ai-group-body" id="ai-group-4" style="display:none;">
                        <div style="font-size:11px;color:#999;margin-bottom:6px;">关闭动画可提升低性能设备的体验</div>
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;margin-bottom:8px;">
                            <input id="ai-set-anim-enabled" type="checkbox" ${settings.animEnabled ? 'checked' : ''}> 启用动画
                        </label>
                    </div>

                    <button id="ai-set-save" class="ai-btn ai-btn-primary" style="width:100%;padding:7px;font-size:12px;border-radius:6px;margin-top:4px;"><i data-lucide="save" style="width:13px;height:13px;"></i> 保存设置</button>
                    <div style="display:flex;gap:6px;margin-top:6px;">
                        <button id="ai-set-export" class="ai-btn ai-btn-tool" style="flex:1;padding:5px;font-size:11px;" title="导出设置为JSON文件"><i data-lucide="upload" style="width:11px;height:11px;"></i> 导出设置</button>
                        <button id="ai-set-import" class="ai-btn ai-btn-tool" style="flex:1;padding:5px;font-size:11px;" title="从JSON文件导入设置"><i data-lucide="download" style="width:11px;height:11px;"></i> 导入设置</button>
                    </div>
                    <div id="ai-set-msg" style="text-align:center;font-size:11px;color:#27ae60;margin-top:4px;display:none;">✓ 已保存</div>
                </div>

                <!-- ===== 主内容区 ===== -->
                <div style="padding:12px 15px 15px;">
                    <div style="margin-bottom:8px;">
                        <label class="ai-label">快捷策略</label>
                        <div style="display:flex;gap:4px;">
                            <select id="ai-preset-select" class="ai-select" style="flex:1;">
                                ${getAllPresets().map((p, i) => `<option value="${i}">${p.label}</option>`).join('')}
                            </select>
                            <button id="ai-tpl-save" class="ai-btn ai-btn-tool" style="padding:4px 8px;font-size:11px;" title="将当前 Prompt 保存为自定义模板"><i data-lucide="bookmark-plus" style="width:12px;height:12px;"></i></button>
                            <button id="ai-tpl-manage" class="ai-btn ai-btn-tool" style="padding:4px 8px;font-size:11px;" title="管理自定义模板"><i data-lucide="settings-2" style="width:12px;height:12px;"></i></button>
                        </div>
                    </div>

                    <textarea id="ai-custom-prompt" class="ai-input" placeholder="输入自定义整理要求 (可选)...\n例如：把所有 Vue 相关的放一个文件夹" style="width:100%;height:65px;resize:none;margin-bottom:4px;border-radius:6px;">${escapeHtml(settings.lastPrompt || '')}</textarea>
                    <div id="ai-prompt-history" style="display:none;margin-bottom:8px;"></div>

                    <button id="ai-start-btn" class="ai-btn ai-btn-primary" style="width:100%;padding:10px;font-size:14px;border-radius:8px;"><i data-lucide="play" style="width:15px;height:15px;"></i> 开始深度整理</button>

                    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                        <button id="ai-tool-clean" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:70px;"><i data-lucide="archive" style="width:12px;height:12px;"></i> 失效归档</button>
                        <button id="ai-tool-dup" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:70px;"><i data-lucide="search" style="width:12px;height:12px;"></i> 查找重复</button>
                        <button id="ai-tool-undo" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:60px;" title="撤销上次整理操作"><i data-lucide="undo-2" style="width:12px;height:12px;"></i> 撤销</button>
                        <button id="ai-tool-stop" class="ai-btn" style="display:none;flex:1;padding:7px;background:#e74c3c;color:#fff;border:none;font-size:11px;"><i data-lucide="square" style="width:12px;height:12px;"></i> 停止</button>
                    </div>
                    <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                        <button id="ai-tool-backup" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:60px;" title="备份/下载收藏夹结构"><i data-lucide="download" style="width:12px;height:12px;"></i> 备份</button>
                        <button id="ai-tool-bench" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:60px;" title="AI模型性能测试"><i data-lucide="gauge" style="width:12px;height:12px;"></i> 测试AI</button>
                        <button id="ai-tool-stats" class="ai-btn ai-btn-tool" style="flex:1;padding:7px;min-width:50px;" title="收藏夹数据统计"><i data-lucide="bar-chart-3" style="width:12px;height:12px;"></i> 统计</button>
                        <button id="ai-tool-health" class="ai-btn ai-btn-tool" style="padding:7px;" title="收藏夹健康检查"><i data-lucide="heart-pulse" style="width:12px;height:12px;"></i></button>
                        <button id="ai-tool-log-export" class="ai-btn ai-btn-tool" style="padding:7px;" title="导出日志"><i data-lucide="file-text" style="width:12px;height:12px;"></i></button>
                        <button id="ai-tool-help" class="ai-btn ai-btn-tool" style="padding:7px;" title="帮助与常见问题"><i data-lucide="help-circle" style="width:12px;height:12px;"></i></button>
                        <button id="ai-tool-preview-debug" class="ai-btn ai-btn-tool" style="padding:7px;font-size:10px;color:var(--ai-text-light);" title="预览界面调试"><i data-lucide="eye" style="width:12px;height:12px;"></i></button>
                    </div>

                    <div id="ai-progress-wrap" class="ai-progress-wrap">
                        <div class="ai-progress-container">
                            <div id="ai-progress-bar"></div>
                            <div id="ai-progress-text"></div>
                        </div>
                    </div>

                    <div id="ai-status-log" class="ai-status-log">
                        等待指令...
                    </div>

                    <!-- 工具结果区（清理失效/重复检测用） -->
                    <div id="ai-preview-area" style="display:none;margin-top:10px;background:var(--ai-bg);border:1px solid var(--ai-border-light);border-radius:8px;padding:10px;max-height:250px;overflow-y:auto;color:var(--ai-text);"></div>
                </div>
            </div>
        `;

        document.body.appendChild(floatBtn);
        document.body.appendChild(panel);

        // 悬浮按钮拖拽支持（区分拖拽和点击）
        let _dragState = { dragging: false, startX: 0, startY: 0, startLeft: 0, startBottom: 0, moved: false };
        // 恢复保存的位置
        const savedPos = GM_getValue('bfao_floatBtnPos', null);
        if (savedPos) {
            floatBtn.style.left = savedPos.left + 'px';
            floatBtn.style.bottom = savedPos.bottom + 'px';
            panel.style.left = savedPos.left + 'px';
            panel.style.bottom = savedPos.bottom + 'px';
        }

        floatBtn.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            _dragState = {
                dragging: true,
                startX: e.clientX,
                startY: e.clientY,
                startLeft: parseInt(floatBtn.style.left) || 30,
                startBottom: parseInt(floatBtn.style.bottom) || 30,
                moved: false
            };
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!_dragState.dragging) return;
            const dx = e.clientX - _dragState.startX;
            const dy = _dragState.startY - e.clientY; // bottom increases when mouse goes up
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) _dragState.moved = true;
            if (!_dragState.moved) return;
            const newLeft = Math.max(0, Math.min(window.innerWidth - 60, _dragState.startLeft + dx));
            const newBottom = Math.max(0, Math.min(window.innerHeight - 60, _dragState.startBottom + dy));
            floatBtn.style.left = newLeft + 'px';
            floatBtn.style.bottom = newBottom + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!_dragState.dragging) return;
            _dragState.dragging = false;
            if (_dragState.moved) {
                // 保存位置
                const pos = { left: parseInt(floatBtn.style.left), bottom: parseInt(floatBtn.style.bottom) };
                GM_setValue('bfao_floatBtnPos', pos);
                // 同步面板位置
                panel.style.left = pos.left + 'px';
                panel.style.bottom = pos.bottom + 'px';
            }
        });

        // 事件绑定（仅在没有拖拽时触发点击）
        floatBtn.onclick = (e) => {
            if (_dragState.moved) { _dragState.moved = false; return; }
            floatBtn.style.display = 'none';
            panel.style.display = 'flex';
        };

        document.getElementById('ai-close-btn').onclick = () => {
            panel.style.display = 'none';
            floatBtn.style.display = 'flex';
        };

        // 主题切换
        const savedTheme = GM_getValue('bfao_theme', 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        function updateThemeIcon() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const btn = document.getElementById('ai-theme-toggle');
            if (btn) {
                btn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
            }
        }
        updateThemeIcon();

        document.getElementById('ai-theme-toggle').onclick = () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            GM_setValue('bfao_theme', next);
            updateThemeIcon();
        };

        document.getElementById('ai-settings-toggle').onclick = () => {
            const btn = document.getElementById('ai-settings-toggle');
            btn.classList.add('spinning');
            setTimeout(() => btn.classList.remove('spinning'), 600);
            toggleSettings();
        };

        // 设置分组折叠/展开
        panel.querySelectorAll('.ai-group-header').forEach(header => {
            header.onclick = () => {
                const body = document.getElementById(header.dataset.group);
                // 最后一个 [data-lucide] 是箭头图标
                const icons = header.querySelectorAll('[data-lucide]');
                const chevron = icons[icons.length - 1];
                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    if (chevron) { chevron.setAttribute('data-lucide', 'chevron-down'); }
                } else {
                    body.style.display = 'none';
                    if (chevron) { chevron.setAttribute('data-lucide', 'chevron-right'); }
                }
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [header] });
            };
        });
        document.getElementById('ai-start-btn').onclick = startProcess;
        document.getElementById('ai-tool-clean').onclick = async function() { btnStartLoading(this); try { await cleanDeadVideos(); } finally { btnStopLoading(this); } };
        document.getElementById('ai-tool-dup').onclick = async function() { btnStartLoading(this); try { await findDuplicates(); } finally { btnStopLoading(this); } };
        document.getElementById('ai-tool-undo').onclick = undoLastOperation;
        document.getElementById('ai-tool-bench').onclick = async function() { btnStartLoading(this); try { await benchmarkAI(); } finally { btnStopLoading(this); } };
        document.getElementById('ai-tool-log-export').onclick = exportLogs;

        // ===== 收藏夹健康报告 =====
        document.getElementById('ai-tool-health').onclick = async function() {
            const healthBtn = this;
            const biliData = getBiliData();
            if (!biliData.mid) return alert('请先登录B站');

            btnStartLoading(healthBtn);
            logStatus('🩺 正在进行收藏夹健康检查...');
            state.isRunning = true;
            setToolButtonsDisabled(true);
            const settings = loadSettings();
            initAdaptiveState(settings);

            try {
                const foldersMap = await getMyFolders(biliData);
                const folderEntries = Object.entries(foldersMap);
                let totalVideos = 0, deadCount = 0, totalDuration = 0;
                const folderSizes = [];
                const allVideoIds = new Set();
                let dupCount = 0;
                let emptyFolders = [];

                for (let i = 0; i < folderEntries.length; i++) {
                    if (state.cancelRequested) break;
                    const [name, id] = folderEntries[i];
                    logStatus(`🩺 检查 [${i + 1}/${folderEntries.length}] ${name}...`);

                    try {
                        const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${id}&pn=1&ps=40&platform=web`);
                        if (res.code !== 0) continue;
                        const count = res.data && res.data.info ? res.data.info.media_count : 0;
                        folderSizes.push({ name, id, count });
                        totalVideos += count;
                        if (count === 0) emptyFolders.push(name);

                        const medias = (res.data && res.data.medias) || [];
                        medias.forEach(v => {
                            if (isDeadVideo(v)) deadCount++;
                            if (v.duration) totalDuration += v.duration;
                            const key = `${v.id}:${v.type}`;
                            if (allVideoIds.has(key)) dupCount++;
                            else allVideoIds.add(key);
                        });
                    } catch (e) { /* skip */ }
                    await waitForGlobalCooldown();
                    await humanDelay(getAdaptiveFetchDelay());
                }

                folderSizes.sort((a, b) => b.count - a.count);
                const maxFolder = folderSizes[0];
                const minFolder = folderSizes.filter(f => f.count > 0).pop();
                const avgSize = folderSizes.length > 0 ? Math.round(totalVideos / folderSizes.length) : 0;
                const deadRate = totalVideos > 0 ? (deadCount / totalVideos * 100).toFixed(1) : 0;
                const totalHours = Math.round(totalDuration / 3600);

                // 健康评分
                let score = 100;
                if (deadRate > 20) score -= 30; else if (deadRate > 10) score -= 15; else if (deadRate > 5) score -= 5;
                if (dupCount > totalVideos * 0.1) score -= 20; else if (dupCount > 10) score -= 10;
                if (emptyFolders.length > folderEntries.length * 0.3) score -= 15; else if (emptyFolders.length > 3) score -= 5;
                if (maxFolder && maxFolder.count > avgSize * 5) score -= 10;
                score = Math.max(0, score);

                const scoreColor = score >= 80 ? '#4CAF50' : score >= 60 ? '#f39c12' : '#e74c3c';
                const scoreEmoji = score >= 80 ? '💚' : score >= 60 ? '💛' : '❤️';

                let suggestions = [];
                if (deadCount > 0) suggestions.push(`清理 ${deadCount} 个失效视频（点击"失效归档"按钮）`);
                if (dupCount > 0) suggestions.push(`去除 ${dupCount} 个重复视频（点击"查找重复"按钮）`);
                if (emptyFolders.length > 0) suggestions.push(`${emptyFolders.length} 个空收藏夹可考虑删除：${emptyFolders.slice(0, 5).join('、')}${emptyFolders.length > 5 ? '...' : ''}`);
                if (maxFolder && maxFolder.count > 200) suggestions.push(`「${maxFolder.name}」有 ${maxFolder.count} 个视频，建议用 AI 整理拆分`);

                const backdrop = document.createElement('div');
                backdrop.className = 'ai-modal-backdrop';
                backdrop.innerHTML = `
                <div class="ai-modal" style="width:min(520px,90vw);">
                    <div class="ai-modal-header">
                        <h3><i data-lucide="heart-pulse" style="width:18px;height:18px;"></i> 收藏夹健康报告</h3>
                        <button class="ai-modal-close" id="ai-health-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                    </div>
                    <div class="ai-modal-body" style="padding:20px;">
                        <div style="text-align:center;margin-bottom:20px;">
                            <div style="font-size:48px;font-weight:bold;color:${scoreColor};">${scoreEmoji} ${score}</div>
                            <div style="font-size:13px;color:var(--ai-text-muted);">健康评分（满分100）</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                            <div style="background:var(--ai-bg-secondary);padding:12px;border-radius:8px;text-align:center;">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-text);">${folderEntries.length}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);">收藏夹数</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);padding:12px;border-radius:8px;text-align:center;">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-text);">${totalVideos}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);">总视频数</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);padding:12px;border-radius:8px;text-align:center;">
                                <div style="font-size:22px;font-weight:bold;color:${deadCount > 0 ? 'var(--ai-error)' : 'var(--ai-success)'};">${deadCount}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);">失效视频 (${deadRate}%)</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);padding:12px;border-radius:8px;text-align:center;">
                                <div style="font-size:22px;font-weight:bold;color:${dupCount > 0 ? 'var(--ai-warning)' : 'var(--ai-success)'};">${dupCount}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);">重复视频（首页抽样）</div>
                            </div>
                        </div>
                        <div style="background:var(--ai-bg-secondary);padding:12px;border-radius:8px;margin-bottom:16px;">
                            <div style="font-size:12px;color:var(--ai-text-secondary);line-height:1.8;">
                                📊 平均每个收藏夹 <strong>${avgSize}</strong> 个视频 · 总时长约 <strong>${totalHours}</strong> 小时<br>
                                📁 最大：「${escapeHtml(maxFolder ? maxFolder.name : '-')}」(${maxFolder ? maxFolder.count : 0}个)
                                ${minFolder ? ` · 最小：「${escapeHtml(minFolder.name)}」(${minFolder.count}个)` : ''}<br>
                                🗑️ 空收藏夹：${emptyFolders.length} 个
                            </div>
                        </div>
                        ${suggestions.length > 0 ? `
                        <div style="border-left:3px solid ${scoreColor};padding:8px 12px;background:var(--ai-bg-tertiary);border-radius:0 8px 8px 0;">
                            <div style="font-size:12px;font-weight:bold;color:var(--ai-text);margin-bottom:6px;">💡 优化建议</div>
                            ${suggestions.map(s => `<div style="font-size:11px;color:var(--ai-text-secondary);padding:2px 0;">• ${s}</div>`).join('')}
                        </div>` : '<div style="text-align:center;color:var(--ai-success);font-size:13px;">✨ 收藏夹状态良好，继续保持！</div>'}
                    </div>
                    <div class="ai-modal-footer">
                        <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-health-ok" style="flex:1;">关闭</button>
                    </div>
                </div>`;
                document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });
                const closeModal = () => backdrop.remove();
                backdrop.querySelector('#ai-health-close').onclick = closeModal;
                backdrop.querySelector('#ai-health-ok').onclick = closeModal;

                logStatus(`🩺 健康检查完成！评分：${score}/100`);
            } catch (err) {
                logStatus(`❌ 健康检查失败: ${err.message}`);
            }
            btnStopLoading(healthBtn);
            resetMainButton();
        };
        document.getElementById('ai-set-export').onclick = exportSettings;
        document.getElementById('ai-set-import').onclick = importSettings;

        // 备份工具
        document.getElementById('ai-tool-backup').onclick = async function() {
            const backupBtn = this;
            const biliData = getBiliData();
            if (!biliData.mid) return alert('请先登录B站');

            btnStartLoading(backupBtn);
            state.isRunning = true;
            setToolButtonsDisabled(true);
            document.getElementById('ai-status-log').innerHTML = '';
            const settings = loadSettings();
            initAdaptiveState(settings);

            try {
                const backup = await backupFavorites(biliData, false);
                downloadBackupFile(backup);
                const totalVids = backup.folders.reduce((s, f) => s + f.videos.length, 0);
                logStatus(`✅ 备份完成！${backup.folders.length} 个收藏夹，${totalVids} 个视频已导出`);

                if (settings.notifyOnComplete) {
                    sendNotification('备份完成', `${backup.folders.length} 个收藏夹已导出为JSON文件`);
                }
            } catch (err) {
                logStatus(`❌ 备份失败: ${err.message}`);
            }
            btnStopLoading(backupBtn);
            resetMainButton();
        };

        // 调试：预览界面模拟数据
        // ===== 帮助/FAQ =====
        document.getElementById('ai-tool-help').onclick = () => {
            const faqs = [
                { q: 'API Key 从哪获取？', a: '点击 AI 服务商旁边的"🔗 申请"按钮，会跳转到对应平台的 API Key 申请页面。Gemini 推荐从 aistudio.google.com 获取，免费额度充足。' },
                { q: '应该选哪个模型？', a: '推荐使用 gemini-2.5-flash（快速）或 gemini-2.5-pro（更精准）。点击模型输入框旁的 🔄 按钮可以获取所有可用模型列表。' },
                { q: '为什么报错 412？', a: 'B站的反爬风控。建议：1) 请求速度调到"安全模式"(1.5s)；2) 写操作间隔调到 3000ms 以上；3) 等几分钟后重试。' },
                { q: 'AI 并发数设多少？', a: '免费 API 建议设 1-2。付费 API 可以设 3-5。设太大会触发 API 限速(429错误)。' },
                { q: '处理 8000 个视频要多久？', a: '取决于 AI 模型速度和并发数。大约：抓取~3分钟 + AI处理~10分钟 + 移动~5分钟。建议先用"限制处理数量"测试小批量。' },
                { q: '可以撤销移动操作吗？', a: '可以！点击工具栏的"撤销"按钮即可撤销整理操作。系统保留最近5次操作的撤销记录，有多条记录时可选择撤销哪一次。' },
                { q: '自适应限速是什么？', a: '开启后，脚本会根据B站实际限流响应自动调整请求速度：被限流时延迟自动翻倍，并触发全局冷却（8-60秒），连续成功5次后逐步恢复。采用指数退避策略，有效避免连续412错误。' },
                { q: '跨收藏夹整理怎么用？', a: '在行为设置中勾选"跨收藏夹"，点击开始整理时会弹出收藏夹选择器，可以同时整理多个收藏夹中的视频。' },
                { q: '备份功能怎么用？', a: '点击"备份"按钮可导出所有收藏夹结构为JSON文件。勾选"自动备份"则每次整理前自动保存快照，支持撤销时恢复。' },
                { q: 'AI测试是什么？', a: '点击"测试AI"可测试当前模型的响应速度和分类准确度，帮你选择最优的AI模型配置。' },
                { q: '暗色模式怎么用？', a: '点击标题栏的 🌙 月亮图标即可切换亮色/暗色主题。会自动保存你的偏好。' },
                { q: '支持哪些 AI 服务商？', a: '支持 13 个：Google Gemini、OpenAI、DeepSeek、硅基流动、通义千问、Moonshot(Kimi)、智谱(GLM)、Groq、OpenRouter、Ollama(本地)、GitHub Models、Anthropic Claude、自定义 OpenAI 兼容接口。' },
                { q: 'Token 用量与费用估算', a: '整理完成后自动统计 Token 用量（输入+输出）并估算费用（支持 Gemini、OpenAI、DeepSeek、Claude 等主流模型定价），帮助你了解每次整理的 API 花费。' },
                { q: '增量整理是什么？', a: 'V1.0 新增。在行为设置中勾选"增量整理"，下次运行时只处理上次整理之后新收藏的视频，跳过已整理过的内容，大幅提高效率。' },
                { q: '自定义模板怎么用？', a: 'V1.0 新增。在 Prompt 输入框旁点击 ⭐ 保存当前规则为命名模板，⚙️ 管理已保存的模板。模板会持久化存储，随时调用。' },
                { q: '收藏夹健康检查', a: 'V1.0 新增。点击 ❤️ 按钮一键扫描所有收藏夹，生成健康评分（0-100）、失效率、重复率、分布均匀度等报告，并给出优化建议。' },
                { q: '导出分类结果', a: 'V1.0 新增。在预览界面点击 ⬇️ 按钮，可将分类结果导出为 CSV 或 JSON 文件，方便后续分析或分享。' },
                { q: '如何合并相似分类？', a: '在预览界面中，勾选2个以上分类后点击"合并分类"按钮，输入合并后的名称即可。适合 AI 生成了近义词分类（如"编程"和"Programming"）的情况。' },
                { q: '设置可以导出分享吗？', a: '可以！在设置区底部点击"导出设置"按钮即可导出为JSON文件（不含API Key）。其他人可以通过"导入设置"一键应用你的配置。' },
                { q: '日志可以导出吗？', a: '可以！点击工具栏的日志导出按钮（📄图标）即可将当前日志保存为文本文件，方便排查问题或分享。' },
                { q: 'AI 请求失败会自动重试吗？', a: '是的！V1.0 新增了自动重试机制，遇到网络超时、API限流(429)、服务过载(503)等错误会自动进行最多3次重试，采用指数退避策略（2秒、4秒、8秒）。' },
                { q: '重复视频可以一键清理吗？', a: '可以！点击"查找重复"扫描全部收藏夹后，可一键去重。跨收藏夹整理时，预览界面也会自动检测重复并提供清理选项。' },
                { q: '失效视频归档功能', a: 'V1.0 新增。点击"失效归档"按钮，扫描所有收藏夹中的失效视频，可选择移动到专用「失效视频归档」收藏夹或直接删除。移动到专用收藏夹便于日后查看是否恢复。' },
                { q: '低置信度筛选', a: 'V1.0 新增。在预览界面点击"⚠️ 低置信度"按钮，筛选出包含低置信度（< 70%）视频的分类，并高亮标记，方便逐一审查 AI 不确定的分类结果。' },
                { q: '定时自动整理', a: 'V1.0 新增。在行为设置中勾选"定时整理"并设置间隔，脚本会自动使用增量模式定期整理新收藏的视频。需要页面保持打开。' },
                { q: '整理报告导出', a: 'V1.0 新增。整理完成后或在预览界面点击 📄 按钮，可导出 HTML 格式的整理报告，包含分类概览、置信度统计、UP主排行等详细信息。' }
            ];

            let faqHtml = '';
            faqs.forEach((f, i) => {
                const faqId = 'faq-' + i;
                faqHtml += `<div style="border-bottom:1px solid var(--ai-border-lighter);">
                    <div class="ai-faq-q" data-target="${faqId}" style="padding:10px 16px;cursor:pointer;font-size:13px;color:var(--ai-text);display:flex;justify-content:space-between;align-items:center;transition:background 0.2s;">
                        <span>❓ ${f.q}</span>
                        <span style="color:var(--ai-text-light);font-size:11px;">▶</span>
                    </div>
                    <div id="${faqId}" style="display:none;padding:8px 16px 12px 36px;font-size:12px;color:var(--ai-text-secondary);line-height:1.6;background:var(--ai-bg-secondary);">
                        ${f.a}
                    </div>
                </div>`;
            });

            const backdrop = document.createElement('div');
            backdrop.className = 'ai-modal-backdrop';
            backdrop.innerHTML = `
            <div class="ai-modal" style="width:min(550px,90vw);">
                <div class="ai-modal-header">
                    <h3><i data-lucide="help-circle" style="width:18px;height:18px;"></i> 帮助与常见问题</h3>
                    <button class="ai-modal-close" id="ai-help-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                </div>
                <div class="ai-modal-body">
                    ${faqHtml}
                    <div style="padding:12px 16px;border-top:1px solid var(--ai-border-lighter);">
                        <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-bottom:8px;">📋 整理历史</div>
                        ${(() => {
                            try {
                                const h = JSON.parse(GM_getValue('bfao_history', '[]'));
                                if (h.length === 0) return '<div style="font-size:12px;color:var(--ai-text-muted);">暂无记录</div>';
                                return h.map(r => `<div style="font-size:11px;padding:6px 0;border-bottom:1px solid var(--ai-border-lighter);color:var(--ai-text-secondary);">
                                    <div><strong>${r.time}</strong> — ${r.videoCount} 个视频 → ${r.categoryCount} 个分类</div>
                                    <div style="color:var(--ai-text-muted);margin-top:2px;">${r.categories || ''}</div>
                                </div>`).join('');
                            } catch(e) { return ''; }
                        })()}
                    </div>
                </div>
                <div class="ai-modal-footer" style="justify-content:space-between;font-size:11px;color:var(--ai-text-muted);">
                    <span>快捷键：Alt+B 开关面板 · ESC 关闭 · Ctrl+Enter 开始</span>
                    <span>v1.0</span>
                </div>
            </div>`;

            document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

            // FAQ 展开/折叠
            backdrop.querySelectorAll('.ai-faq-q').forEach(q => {
                q.onclick = () => {
                    const a = document.getElementById(q.dataset.target);
                    const isOpen = a.style.display !== 'none';
                    a.style.display = isOpen ? 'none' : 'block';
                    q.querySelector('span:last-child').textContent = isOpen ? '▶' : '▼';
                    q.style.background = isOpen ? '' : 'var(--ai-primary-bg)';
                };
            });

            const closeHelp = () => backdrop.remove();
            backdrop.querySelector('#ai-help-close').onclick = closeHelp;
            document.addEventListener('keydown', function onEsc(e) {
                if (e.key === 'Escape') { closeHelp(); document.removeEventListener('keydown', onEsc); }
            });
        };

        // ===== 自动保存 Prompt（防抖 1 秒） =====
        let _promptSaveTimer = null;
        document.getElementById('ai-custom-prompt').addEventListener('input', function() {
            clearTimeout(_promptSaveTimer);
            _promptSaveTimer = setTimeout(() => {
                GM_setValue('bfao_lastPrompt', this.value.trim());
            }, 1000);
        });

        // ===== 键盘快捷键 =====
        document.addEventListener('keydown', (e) => {
            // Alt+B 切换面板显隐
            if (e.altKey && (e.key === 'b' || e.key === 'B')) {
                e.preventDefault();
                if (panel.style.display === 'flex') {
                    panel.style.display = 'none';
                    floatBtn.style.display = 'flex';
                } else {
                    floatBtn.style.display = 'none';
                    panel.style.display = 'flex';
                }
            }
            // Ctrl+Enter 开始整理
            if (e.ctrlKey && e.key === 'Enter') {
                const btn = document.getElementById('ai-start-btn');
                if (btn && !btn.disabled && panel.style.display === 'flex') btn.click();
            }
            // ESC 关闭面板（仅在没有模态框时）
            if (e.key === 'Escape' && panel.style.display === 'flex' && !document.querySelector('.ai-modal-backdrop')) {
                panel.style.display = 'none';
                floatBtn.style.display = 'flex';
            }
        });

        // ===== 统计仪表盘 =====
        document.getElementById('ai-tool-stats').onclick = async function() {
            const statsBtn = this;
            const biliData = getBiliData();
            if (!biliData.mid) return alert('请先登录B站');
            btnStartLoading(statsBtn);

            const settings = loadSettings();
            initAdaptiveState(settings);

            // --- 增量统计核心逻辑 ---
            // 持久化每个收藏夹的统计摘要，下次仅重扫 media_count 变化的收藏夹
            const STATS_DATA_KEY = 'bfao_statsFolderData'; // {folderId: {media_count, dead, upCounter, duration}}
            let folderStatsCache = {};
            try { folderStatsCache = JSON.parse(GM_getValue(STATS_DATA_KEY, '{}')); } catch(e) { folderStatsCache = {}; }

            // forceFullScan: 用户点"重新统计"时传入
            const forceFullScan = !GM_getValue('bfao_statsTime', 0);

            logStatus('📊 正在检查收藏夹变化...');

            try {
                const allFolders = await getAllFoldersWithIds(biliData);
                const currentFolderIds = new Set(allFolders.map(f => String(f.id)));

                // 清除已删除收藏夹的缓存
                for (const cachedId of Object.keys(folderStatsCache)) {
                    if (!currentFolderIds.has(cachedId)) delete folderStatsCache[cachedId];
                }

                // 分类收藏夹：跳过 / 增量抓新增 / 全量重扫
                const foldersIncremental = []; // media_count 增加，只抓新增部分
                const foldersFullScan = [];    // 新收藏夹 或 media_count 减少（有删除）
                let skippedCount = 0;
                for (const f of allFolders) {
                    if (f.title === '默认收藏夹') continue;
                    const fid = String(f.id);
                    const cached = folderStatsCache[fid];
                    if (forceFullScan || !cached) {
                        foldersFullScan.push(f);
                    } else if (cached.media_count === f.media_count) {
                        skippedCount++;
                    } else if (f.media_count > cached.media_count) {
                        // 新增了视频，只需增量抓取
                        foldersIncremental.push({ folder: f, diff: f.media_count - cached.media_count });
                    } else {
                        // media_count 减少了（删除/移走了视频），需要全量重扫
                        foldersFullScan.push(f);
                    }
                }

                const totalWork = foldersIncremental.length + foldersFullScan.length;
                if (totalWork === 0 && skippedCount > 0) {
                    logStatus('📊 所有收藏夹均无变化，使用缓存数据');
                } else {
                    const parts = [];
                    if (skippedCount > 0) parts.push(`${skippedCount} 个无变化`);
                    if (foldersIncremental.length > 0) parts.push(`${foldersIncremental.length} 个增量更新`);
                    if (foldersFullScan.length > 0) parts.push(`${foldersFullScan.length} 个全量扫描`);
                    logStatus(`📊 ${parts.join('，')}...`);
                }

                // 辅助：统计单个视频
                const statVideo = (v, stats) => {
                    if (isDeadVideo(v)) stats.dead++;
                    if (v.upper && v.upper.name) {
                        stats.upCounter[v.upper.name] = (stats.upCounter[v.upper.name] || 0) + 1;
                    }
                    if (v.duration) {
                        if (v.duration < 300) stats.duration.short++;
                        else if (v.duration < 1800) stats.duration.medium++;
                        else stats.duration.long++;
                    }
                };

                let workDone = 0;

                // 增量抓取：只抓前 N 页拿到新增视频，合并到已有缓存
                for (const { folder: f, diff } of foldersIncremental) {
                    if (state.cancelRequested) break;
                    const fid = String(f.id);
                    workDone++;
                    const pagesToFetch = Math.ceil(diff / 40);
                    logStatus(`📊 增量 [${workDone}/${totalWork}] ${f.title} (+${diff} 个视频, ${pagesToFetch} 页)...`);

                    const cached = folderStatsCache[fid];
                    let fetched = 0;
                    try {
                        for (let pn = 1; pn <= pagesToFetch; pn++) {
                            if (state.cancelRequested) break;
                            const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${f.id}&pn=${pn}&ps=40&platform=web`);
                            if (res.code !== 0) break;
                            const medias = res.data.medias || [];
                            for (const v of medias) {
                                if (fetched >= diff) break; // 只统计新增的部分
                                statVideo(v, cached);
                                fetched++;
                            }
                            if (fetched >= diff) break;
                            await waitForGlobalCooldown();
                            await humanDelay(getAdaptiveFetchDelay());
                        }
                    } catch (e) { /* skip failed */ }
                    cached.media_count = f.media_count;
                    folderStatsCache[fid] = cached;
                    await waitForGlobalCooldown();
                    await humanDelay(getAdaptiveFetchDelay());
                }

                // 全量扫描：新收藏夹 或 media_count 减少的
                for (const f of foldersFullScan) {
                    if (state.cancelRequested) break;
                    const fid = String(f.id);
                    workDone++;
                    logStatus(`📊 全扫 [${workDone}/${totalWork}] ${f.title}...`);

                    const folderStats = { media_count: f.media_count, dead: 0, upCounter: {}, duration: { short: 0, medium: 0, long: 0 } };
                    try {
                        let pn = 1;
                        while (true) {
                            if (state.cancelRequested) break;
                            const res = await safeFetchJson(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${f.id}&pn=${pn}&ps=40&platform=web`);
                            if (res.code !== 0) break;
                            const medias = res.data.medias || [];
                            medias.forEach(v => statVideo(v, folderStats));
                            if (!res.data.has_more || medias.length === 0) break;
                            pn++;
                            await waitForGlobalCooldown();
                            await humanDelay(getAdaptiveFetchDelay());
                        }
                    } catch (e) { /* skip failed folders */ }

                    folderStatsCache[fid] = folderStats;
                    await waitForGlobalCooldown();
                    await humanDelay(getAdaptiveFetchDelay());
                }

                // 即使取消也保存已扫描的部分（下次可续用）
                GM_setValue(STATS_DATA_KEY, JSON.stringify(folderStatsCache));

                // --- 合并所有收藏夹统计 ---
                let totalVideos = 0;
                let deadCount = 0;
                const upCounter = {};
                const durationBuckets = { short: 0, medium: 0, long: 0 };

                for (const f of allFolders) {
                    if (f.title === '默认收藏夹') continue;
                    totalVideos += f.media_count || 0;
                    const cached = folderStatsCache[String(f.id)];
                    if (!cached) continue;
                    deadCount += cached.dead || 0;
                    durationBuckets.short += (cached.duration && cached.duration.short) || 0;
                    durationBuckets.medium += (cached.duration && cached.duration.medium) || 0;
                    durationBuckets.long += (cached.duration && cached.duration.long) || 0;
                    if (cached.upCounter) {
                        for (const [name, count] of Object.entries(cached.upCounter)) {
                            upCounter[name] = (upCounter[name] || 0) + count;
                        }
                    }
                }

                // 排序 UP 主
                const topUps = Object.entries(upCounter).sort((a, b) => b[1] - a[1]).slice(0, 15);
                const maxUpCount = topUps.length > 0 ? topUps[0][1] : 1;

                // 收藏夹大小分布
                let folderSizes = '';
                const maxFolderSize = Math.max(...allFolders.map(f => f.media_count), 1);
                const sortedFolders = [...allFolders].sort((a, b) => b.media_count - a.media_count);
                sortedFolders.slice(0, 20).forEach(f => {
                    const pct = Math.round(f.media_count / maxFolderSize * 100);
                    folderSizes += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:12px;">
                        <span style="width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ai-text-secondary);">${f.title}</span>
                        <div style="flex:1;height:16px;background:var(--ai-border-lighter);border-radius:8px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--ai-primary),var(--ai-primary-light));border-radius:8px;transition:width 0.8s ease;"></div>
                        </div>
                        <span style="font-size:11px;color:var(--ai-text-muted);width:40px;text-align:right;">${f.media_count}</span>
                    </div>`;
                });

                // UP 主排行
                let upRanking = '';
                topUps.forEach(([name, count], i) => {
                    const pct = Math.round(count / maxUpCount * 100);
                    upRanking += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:12px;">
                        <span style="width:14px;color:var(--ai-text-muted);text-align:right;">${i + 1}</span>
                        <span style="width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ai-text);">${name}</span>
                        <div style="flex:1;height:14px;background:var(--ai-border-lighter);border-radius:7px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--ai-info),#64b5f6);border-radius:7px;"></div>
                        </div>
                        <span style="font-size:11px;color:var(--ai-text-muted);width:30px;text-align:right;">${count}</span>
                    </div>`;
                });

                // 时长分布
                const durTotal = durationBuckets.short + durationBuckets.medium + durationBuckets.long || 1;
                const durData = [
                    { label: '短视频 (<5分)', count: durationBuckets.short, color: 'var(--ai-success)' },
                    { label: '中等 (5-30分)', count: durationBuckets.medium, color: 'var(--ai-warning)' },
                    { label: '长视频 (>30分)', count: durationBuckets.long, color: 'var(--ai-primary)' }
                ];

                let durBars = '';
                durData.forEach(d => {
                    const pct = Math.round(d.count / durTotal * 100);
                    durBars += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;">
                        <span style="width:100px;color:var(--ai-text-secondary);">${d.label}</span>
                        <div style="flex:1;height:18px;background:var(--ai-border-lighter);border-radius:9px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:${d.color};border-radius:9px;transition:width 0.8s ease;"></div>
                        </div>
                        <span style="font-size:11px;color:var(--ai-text-muted);width:50px;text-align:right;">${pct}% (${d.count})</span>
                    </div>`;
                });

                // 统计覆盖率信息
                const scannedCount = Object.keys(folderStatsCache).length;
                const totalFolderCount = allFolders.filter(f => f.title !== '默认收藏夹').length;
                const coverageNote = scannedCount < totalFolderCount
                    ? `<div style="font-size:10px;color:var(--ai-warning);margin-bottom:12px;">⚠️ 已扫描 ${scannedCount}/${totalFolderCount} 个收藏夹，部分数据可能不完整</div>`
                    : '';

                // 构建模态框
                const backdrop = document.createElement('div');
                backdrop.className = 'ai-modal-backdrop';
                backdrop.innerHTML = `
                <div class="ai-modal" style="width:min(650px,90vw);">
                    <div class="ai-modal-header">
                        <h3><i data-lucide="bar-chart-3" style="width:18px;height:18px;"></i> 收藏夹数据统计</h3>
                        <button class="ai-modal-close" id="ai-stats-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                    </div>
                    <div class="ai-modal-body" style="padding:16px 20px;">
                        ${coverageNote}
                        <!-- 指标卡片 -->
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                            <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-primary);">${allFolders.length}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);margin-top:2px;">收藏夹</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-info);">${totalVideos}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);margin-top:2px;">总视频数</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-error);">${deadCount}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);margin-top:2px;">失效视频</div>
                            </div>
                            <div style="background:var(--ai-bg-secondary);border-radius:var(--ai-radius-md);padding:12px;text-align:center;border:1px solid var(--ai-border-lighter);">
                                <div style="font-size:22px;font-weight:bold;color:var(--ai-success);">${Object.keys(upCounter).length}</div>
                                <div style="font-size:11px;color:var(--ai-text-muted);margin-top:2px;">UP主数</div>
                            </div>
                        </div>

                        <!-- 收藏夹分布 -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-bottom:8px;">📁 收藏夹大小分布 (Top 20)</div>
                            ${folderSizes}
                        </div>

                        <!-- UP主排行 -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-bottom:4px;">👤 最常收藏的UP主 (Top 15)</div>
                            <div style="font-size:10px;color:var(--ai-text-muted);margin-bottom:8px;">基于${scannedCount < totalFolderCount ? '已扫描' : '所有'}收藏夹统计</div>
                            ${upRanking || '<div style="color:var(--ai-text-muted);font-size:12px;">暂无数据</div>'}
                        </div>

                        <!-- 时长分布 -->
                        <div>
                            <div style="font-size:13px;font-weight:bold;color:var(--ai-text);margin-bottom:8px;">⏱️ 视频时长分布</div>
                            ${durBars}
                        </div>
                    </div>
                    <div class="ai-modal-footer" style="justify-content:center;">
                        <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-stats-rescan" style="max-width:150px;"><i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> 全量重扫</button>
                        <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-stats-ok" style="max-width:150px;"><i data-lucide="check" style="width:16px;height:16px;"></i> 关闭</button>
                    </div>
                </div>`;

                document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
                if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

                GM_setValue('bfao_statsTime', Date.now());

                const closeStats = () => backdrop.remove();
                backdrop.querySelector('#ai-stats-close').onclick = closeStats;
                backdrop.querySelector('#ai-stats-ok').onclick = closeStats;
                backdrop.querySelector('#ai-stats-rescan').onclick = () => {
                    backdrop.remove();
                    GM_setValue(STATS_DATA_KEY, '{}');
                    GM_setValue('bfao_statsTime', 0);
                    document.getElementById('ai-tool-stats').click();
                };

                logStatus('📊 统计完成');
            } catch (err) {
                logStatus(`❌ 统计失败: ${err.message}`);
            }
            btnStopLoading(statsBtn);
            resetMainButton();
        };

        document.getElementById('ai-tool-preview-debug').onclick = async () => {
            const upNames = ['影视飓风', '老番茄', 'LKs', '何同学', '罗翔说刑法', '柴知道', '硬核的半佛仙人', '3Blue1Brown', 'Tim小哥', '绵羊料理'];
            const catNames = ['游戏实况', '音乐MV', '编程教程', '科技数码', '美食制作', '动画MAD', '影视解说', '搞笑日常', '知识科普', 'ASMR助眠'];
            const mockVideoIdMap = {};
            const mockCategories = {};
            const mockExisting = {};
            let vidId = 100000;

            // 5 个已有收藏夹
            for (let i = 0; i < 5; i++) mockExisting[catNames[i]] = 10000 + i;

            // 10 个分类，共 300 个视频
            for (let ci = 0; ci < 10; ci++) {
                const count = ci < 3 ? 50 : (ci < 6 ? 30 : 15); // 前3个50个，中间3个30个，后4个15个
                const vids = [];
                for (let vi = 0; vi < count; vi++) {
                    vidId++;
                    const up = upNames[Math.floor(Math.random() * upNames.length)];
                    const title = `【${catNames[ci]}】模拟视频标题第${vi + 1}集 - 这是一个用于测试预览界面的模拟视频`;
                    mockVideoIdMap[vidId] = { id: vidId, title, upper: { name: up } };
                    vids.push({ id: vidId, type: 2 });
                }
                mockCategories[catNames[ci]] = vids;
            }

            const result = await renderPreview(mockCategories, mockExisting, mockVideoIdMap, null, null, []);
            console.log('预览调试结果:', result, '剩余分类:', Object.keys(mockCategories));
        };

        // 密码显示/隐藏
        document.getElementById('ai-set-eye').onclick = () => {
            const input = document.getElementById('ai-set-apikey');
            input.type = input.type === 'password' ? 'text' : 'password';
        };

        // API Key 输入时自动保存（防抖）
        document.getElementById('ai-set-apikey').addEventListener('input', debounce(() => {
            const provider = document.getElementById('ai-set-provider').value;
            const key = document.getElementById('ai-set-apikey').value.trim();
            GM_setValue('bfao_apiKey_' + provider, key);
            GM_setValue('bfao_apiKey', key); // 兼容旧版全局 key
        }, 500));

        // 获取当前提供商的 API 申请链接
        function getCurrentApiUrl() {
            const provider = document.getElementById('ai-set-provider').value;
            return (AI_PROVIDERS[provider] || {}).apiUrl || '';
        }

        // 🔗 跳转 API 申请页
        document.getElementById('ai-goto-api').onclick = () => {
            const url = getCurrentApiUrl();
            if (url) window.open(url, '_blank');
            else alert('当前提供商没有申请链接');
        };

        // 设置模型显示值
        function setModelValue(name) {
            document.getElementById('ai-set-model').value = name;
            document.getElementById('ai-model-display').textContent = name || '选择模型...';
        }

        // 填充模型列表数据（不自动展开）
        function loadModelOptions(models) {
            const modelSelect = document.getElementById('ai-model-select');
            modelSelect.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
        }

        // 展开/收起模型下拉面板
        function toggleModelDropdown(show) {
            const dropdown = document.getElementById('ai-model-dropdown');
            const trigger = document.getElementById('ai-model-trigger');
            const arrow = trigger.querySelector('[data-lucide]');
            if (show && document.getElementById('ai-model-select').options.length > 0) {
                dropdown.style.display = 'block';
                if (arrow) { arrow.setAttribute('data-lucide', 'chevron-up'); }
            } else {
                dropdown.style.display = 'none';
                if (arrow) { arrow.setAttribute('data-lucide', 'chevron-down'); }
            }
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [trigger] });
        }

        // 页面加载时恢复缓存的模型列表（不展开）
        const cachedModels = GM_getValue('bfao_cachedModels_' + settings.provider, null);
        if (cachedModels && cachedModels.length > 0) loadModelOptions(cachedModels);

        // 🔄 获取模型列表（刷新缓存）
        document.getElementById('ai-fetch-models').onclick = async () => {
            const btn = document.getElementById('ai-fetch-models');
            const provider = document.getElementById('ai-set-provider').value;
            const apiKey = document.getElementById('ai-set-apikey').value.trim();

            if (!apiKey && provider !== 'ollama') { alert('请先填入 API Key'); return; }

            const { success, result, error, restore } = await withLoadingAnimation(btn, () => {
                const tempSettings = {
                    provider: provider,
                    apiKey: apiKey,
                    customBaseUrl: document.getElementById('ai-set-base-url').value.trim()
                };
                return fetchModelList(tempSettings);
            }, { timeout: 15000, countdown: true });

            if (success) {
                GM_setValue('bfao_cachedModels_' + provider, result);
                loadModelOptions(result); toggleModelDropdown(true);
                restore('✅');
            } else {
                alert('获取模型列表失败: ' + (error?.message || '未知错误'));
                restore('❌');
            }
        };

        // ✅ 验证模型可用性
        document.getElementById('ai-verify-model').onclick = async () => {
            const btn = document.getElementById('ai-verify-model');
            const provider = document.getElementById('ai-set-provider').value;
            const apiKey = document.getElementById('ai-set-apikey').value.trim();
            const modelName = document.getElementById('ai-set-model').value.trim();

            if (!modelName) { alert('请先填入模型名'); return; }
            if (!apiKey && provider !== 'ollama') { alert('请先填入 API Key'); return; }

            const { success, result, error, restore } = await withLoadingAnimation(btn, () => {
                const testSettings = {
                    provider: provider,
                    apiKey: apiKey,
                    modelName: modelName,
                    customBaseUrl: document.getElementById('ai-set-base-url').value.trim()
                };
                return callAI('请回复一个JSON：{"status":"ok"}', testSettings, 1);
            }, { timeout: 15000, countdown: true });

            if (success) {
                if (result && (result.status === 'ok' || Object.keys(result).length > 0)) {
                    restore('🟢');
                    alert(`✅ 模型验证成功！\n\n模型 "${modelName}" 可用。`);
                } else {
                    restore('🟡');
                    alert(`⚠️ 模型有响应但格式异常，可能仍可使用。`);
                }
            } else {
                restore('🔴');
                alert(`❌ 模型验证失败！\n\n模型 "${modelName}" 不可用。\n错误: ${error?.message || '未知错误'}`);
            }
        };

        // 阻止面板滚轮穿透到页面，但允许内部控件正常使用滚轮
        panel.addEventListener('wheel', function(e) {
            const tag = e.target.tagName;
            // input[number] 和 select 需要滚轮调值，放行
            if (tag === 'SELECT' || (tag === 'INPUT' && e.target.type === 'number' && e.target === document.activeElement)) {
                e.stopPropagation();
                return;
            }
            // 找最近的可滚动容器
            let target = e.target;
            while (target && target !== panel) {
                const { scrollHeight, clientHeight, scrollTop } = target;
                if (scrollHeight > clientHeight) {
                    const atTop = scrollTop === 0 && e.deltaY < 0;
                    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
                    if (!atTop && !atBottom) return; // 内部还能滚
                }
                target = target.parentElement;
            }
            e.preventDefault();
        }, { passive: false });

        // 点击触发器展开/收起模型下拉
        document.getElementById('ai-model-trigger').addEventListener('click', function() {
            const dropdown = document.getElementById('ai-model-dropdown');
            const isOpen = dropdown.style.display !== 'none';
            toggleModelDropdown(!isOpen);
        });

        // 从列表选择模型
        document.getElementById('ai-model-select').addEventListener('click', function(e) {
            const option = e.target.closest('option');
            if (option && option.value) {
                setModelValue(option.value);
                toggleModelDropdown(false);
            }
        });

        // 自定义输入确认
        document.getElementById('ai-model-custom-confirm').onclick = function() {
            const input = document.getElementById('ai-model-custom-input');
            const val = input.value.trim();
            if (val) {
                setModelValue(val);
                input.value = '';
                toggleModelDropdown(false);
            }
        };

        // 搜索/筛选 + 回车确认
        document.getElementById('ai-model-custom-input').addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase();
            const options = document.getElementById('ai-model-select').options;
            for (let i = 0; i < options.length; i++) {
                options[i].style.display = (!keyword || options[i].value.toLowerCase().includes(keyword)) ? '' : 'none';
            }
        });

        document.getElementById('ai-model-custom-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // 如果搜索结果只剩一个可见选项，直接选它
                const options = [...document.getElementById('ai-model-select').options].filter(o => o.style.display !== 'none');
                if (options.length === 1) {
                    setModelValue(options[0].value);
                    this.value = '';
                    toggleModelDropdown(false);
                } else {
                    document.getElementById('ai-model-custom-confirm').click();
                }
            }
        });

        // 服务商切换：动态更新 UI
        function updateProviderUI() {
            const provider = document.getElementById('ai-set-provider').value;
            const config = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;
            document.getElementById('ai-custom-url-row').style.display = config.isCustom ? 'block' : 'none';
            document.getElementById('ai-set-apikey').placeholder = config.keyPlaceholder || '';
            document.getElementById('ai-set-model').placeholder = config.defaultModel || '';
        }

        document.getElementById('ai-set-provider').onchange = function() {
            const newProvider = this.value;
            const config = AI_PROVIDERS[newProvider];
            // 保存当前服务商的 API Key
            const prevProvider = GM_getValue('bfao_provider', 'gemini');
            const prevKey = document.getElementById('ai-set-apikey').value.trim();
            if (prevKey) GM_setValue('bfao_apiKey_' + prevProvider, prevKey);
            // 立即保存当前选择的 provider
            GM_setValue('bfao_provider', newProvider);
            if (config) setModelValue(config.defaultModel);

            // 加载新服务商已保存的 API Key，无则清空
            const savedKey = GM_getValue('bfao_apiKey_' + newProvider, '');
            document.getElementById('ai-set-apikey').value = savedKey;

            // 切换时加载缓存但不展开
            const cached = GM_getValue('bfao_cachedModels_' + newProvider, null);
            if (cached && cached.length > 0) { loadModelOptions(cached); }
            else { document.getElementById('ai-model-select').innerHTML = ''; }
            toggleModelDropdown(false);
            updateProviderUI();
        };

        // 限制处理数量：勾选框切换下拉框可用状态
        document.getElementById('ai-set-limit-enabled').onchange = function() {
            document.getElementById('ai-set-limit-count').style.opacity = this.checked ? '1' : '0.5';
        };

        // AI请求数量选择器：切换自定义输入框
        document.getElementById('ai-set-chunk').onchange = function() {
            const customInput = document.getElementById('ai-set-chunk-custom');
            if (this.value === 'custom') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = this.value;
            }
        };

        // 速度选择器：切换自定义输入框
        document.getElementById('ai-set-speed').onchange = function() {
            const customInput = document.getElementById('ai-set-speed-custom');
            if (this.value === 'custom') {
                customInput.style.display = 'block';
                customInput.focus();
            } else {
                customInput.style.display = 'none';
                customInput.value = this.value;
            }
        };

        // 保存设置
        document.getElementById('ai-set-save').onclick = () => {
            const speedSelect = document.getElementById('ai-set-speed');
            const speedCustom = document.getElementById('ai-set-speed-custom');
            const fetchDelay = speedSelect.value === 'custom'
                ? Math.max(400, Math.min(5000, parseInt(speedCustom.value) || 800))
                : parseInt(speedSelect.value);

            const chunkSelect = document.getElementById('ai-set-chunk');
            const chunkCustom = document.getElementById('ai-set-chunk-custom');
            const aiChunkSize = chunkSelect.value === 'custom'
                ? Math.max(5, Math.min(300, parseInt(chunkCustom.value) || 50))
                : parseInt(chunkSelect.value);

            const provider = document.getElementById('ai-set-provider').value;
            const providerConfig = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

            saveSettings({
                provider: provider,
                customBaseUrl: document.getElementById('ai-set-base-url').value.trim(),
                apiKey: document.getElementById('ai-set-apikey').value.trim(),
                modelName: document.getElementById('ai-set-model').value.trim() || providerConfig.defaultModel,
                aiChunkSize: aiChunkSize,
                aiConcurrency: Math.max(1, Math.min(20, parseInt(document.getElementById('ai-set-concurrency').value) || 2)),
                limitEnabled: document.getElementById('ai-set-limit-enabled').checked,
                limitCount: parseInt(document.getElementById('ai-set-limit-count').value) || 200,
                fetchDelay: fetchDelay,
                writeDelay: Math.max(500, Math.min(10000, parseInt(document.getElementById('ai-set-write-delay').value) || 2500)),
                moveChunkSize: Math.max(1, Math.min(100, parseInt(document.getElementById('ai-set-move-chunk').value) || 20)),
                skipDeadVideos: document.getElementById('ai-set-skipdead').checked,
                // 新功能设置
                adaptiveRate: document.getElementById('ai-set-adaptive').checked,
                backupBeforeExecute: document.getElementById('ai-set-backup').checked,
                notifyOnComplete: document.getElementById('ai-set-notify').checked,
                multiFolderEnabled: document.getElementById('ai-set-multifolder').checked,
                // 动画设置
                animEnabled: document.getElementById('ai-set-anim-enabled').checked,
                // 增量整理
                incrementalMode: document.getElementById('ai-set-incremental').checked,
                // 定时整理
                autoOrganizeEnabled: document.getElementById('ai-set-auto-organize').checked,
                autoOrganizeInterval: parseInt(document.getElementById('ai-set-auto-interval').value) || 60
            });
            // 更新定时整理状态提示
            const autoStatus = document.getElementById('ai-auto-organize-status');
            if (autoStatus) autoStatus.style.display = document.getElementById('ai-set-auto-organize').checked ? 'block' : 'none';
            // 重新初始化定时器
            setupAutoOrganize();
            const saveBtn = document.getElementById('ai-set-save');
            saveBtn.classList.add('saved');
            setTimeout(() => saveBtn.classList.remove('saved'), 2000);
            const msg = document.getElementById('ai-set-msg');
            msg.style.display = 'block';
            msg.style.animation = 'none'; msg.offsetHeight; msg.style.animation = ''; // restart animation
            setTimeout(() => { msg.style.display = 'none'; }, 2000);
        };

        // 预设下拉
        document.getElementById('ai-preset-select').onchange = function() {
            const preset = getAllPresets()[parseInt(this.value)];
            if (preset) document.getElementById('ai-custom-prompt').value = preset.value;
        };

        // 刷新预设下拉列表
        function refreshPresetSelect() {
            const select = document.getElementById('ai-preset-select');
            const curVal = select.value;
            select.innerHTML = getAllPresets().map((p, i) => `<option value="${i}">${escapeHtml(p.label)}</option>`).join('');
            select.value = curVal;
        }

        // 保存当前 Prompt 为自定义模板
        document.getElementById('ai-tpl-save').onclick = () => {
            const prompt = document.getElementById('ai-custom-prompt').value.trim();
            if (!prompt) return alert('请先在输入框中填写整理要求');
            const name = window.prompt('请为此模板命名：', prompt.substring(0, 20));
            if (!name || !name.trim()) return;
            const templates = loadCustomTemplates();
            templates.push({ id: Date.now().toString(36), name: name.trim(), prompt: prompt, createdAt: new Date().toISOString() });
            saveCustomTemplates(templates);
            refreshPresetSelect();
            logStatus(`✅ 模板「${name.trim()}」已保存`);
        };

        // 管理自定义模板（弹窗）
        document.getElementById('ai-tpl-manage').onclick = () => {
            const templates = loadCustomTemplates();
            if (templates.length === 0) return alert('暂无自定义模板。\n\n在输入框填写整理要求后，点击 ⭐ 按钮即可保存为模板。');

            let listHtml = templates.map((t, i) => `
                <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid var(--ai-border-lighter);" data-tpl-idx="${i}">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:bold;color:var(--ai-text);">${escapeHtml(t.name)}</div>
                        <div style="font-size:11px;color:var(--ai-text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(t.prompt)}">${escapeHtml(t.prompt)}</div>
                    </div>
                    <button class="ai-btn ai-btn-tool ai-tpl-use" data-idx="${i}" style="padding:4px 10px;font-size:11px;">使用</button>
                    <button class="ai-btn ai-btn-tool ai-tpl-edit" data-idx="${i}" style="padding:4px 10px;font-size:11px;">编辑</button>
                    <button class="ai-btn ai-btn-tool ai-tpl-del" data-idx="${i}" style="padding:4px 10px;font-size:11px;color:var(--ai-error);">删除</button>
                </div>`).join('');

            const backdrop = document.createElement('div');
            backdrop.className = 'ai-modal-backdrop';
            backdrop.innerHTML = `
            <div class="ai-modal" style="width:min(520px,90vw);">
                <div class="ai-modal-header">
                    <h3><i data-lucide="bookmark" style="width:18px;height:18px;"></i> 自定义模板管理 (${templates.length})</h3>
                    <button class="ai-modal-close" id="ai-tpl-close"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                </div>
                <div class="ai-modal-body">${listHtml}</div>
                <div class="ai-modal-footer">
                    <button class="ai-modal-btn ai-modal-btn-cancel" id="ai-tpl-done" style="flex:1;">关闭</button>
                </div>
            </div>`;
            document.documentElement.appendChild(backdrop); backdrop.style.zIndex = '2147483645';
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [backdrop] });

            const closeModal = () => { backdrop.remove(); refreshPresetSelect(); };
            backdrop.querySelector('#ai-tpl-close').onclick = closeModal;
            backdrop.querySelector('#ai-tpl-done').onclick = closeModal;

            // 使用
            backdrop.querySelectorAll('.ai-tpl-use').forEach(btn => {
                btn.onclick = () => {
                    const t = loadCustomTemplates()[parseInt(btn.dataset.idx)];
                    if (t) document.getElementById('ai-custom-prompt').value = t.prompt;
                    closeModal();
                };
            });
            // 编辑
            backdrop.querySelectorAll('.ai-tpl-edit').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    const tpls = loadCustomTemplates();
                    const t = tpls[idx];
                    if (!t) return;
                    const newName = window.prompt('模板名称：', t.name);
                    if (!newName || !newName.trim()) return;
                    const newPrompt = window.prompt('模板内容：', t.prompt);
                    if (newPrompt === null) return;
                    tpls[idx] = { ...t, name: newName.trim(), prompt: newPrompt };
                    saveCustomTemplates(tpls);
                    // 刷新列表
                    backdrop.remove();
                    document.getElementById('ai-tpl-manage').click();
                };
            });
            // 删除
            backdrop.querySelectorAll('.ai-tpl-del').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    const tpls = loadCustomTemplates();
                    if (!confirm(`确定删除模板「${tpls[idx].name}」？`)) return;
                    tpls.splice(idx, 1);
                    saveCustomTemplates(tpls);
                    backdrop.remove();
                    if (tpls.length > 0) document.getElementById('ai-tpl-manage').click();
                    else refreshPresetSelect();
                };
            });
        };

        // ===== Prompt 历史 =====
        function renderPromptHistory() {
            const container = document.getElementById('ai-prompt-history');
            if (!container) return;
            let history;
            try { history = JSON.parse(GM_getValue('bfao_promptHistory', '[]')); } catch(e) { history = []; }
            if (history.length === 0) { container.style.display = 'none'; return; }
            container.style.display = 'block';
            container.innerHTML = '';
            const label = document.createElement('div');
            label.style.cssText = 'font-size:10px;color:var(--ai-text-muted);margin-bottom:3px;';
            label.textContent = '历史 Prompt：';
            container.appendChild(label);
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;';
            history.forEach((p, i) => {
                const chip = document.createElement('span');
                chip.style.cssText = 'font-size:10px;padding:2px 8px;border-radius:10px;background:var(--ai-bg-secondary);border:1px solid var(--ai-border);color:var(--ai-text-secondary);cursor:pointer;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:all 0.2s;';
                chip.textContent = p.length > 20 ? p.substring(0, 20) + '...' : p;
                chip.title = p;
                chip.onclick = () => { document.getElementById('ai-custom-prompt').value = p; };
                chip.onmouseover = () => { chip.style.borderColor = 'var(--ai-primary)'; chip.style.color = 'var(--ai-primary)'; };
                chip.onmouseout = () => { chip.style.borderColor = 'var(--ai-border)'; chip.style.color = 'var(--ai-text-secondary)'; };
                wrap.appendChild(chip);
            });
            container.appendChild(wrap);
        }
        renderPromptHistory();

        // 初始化 Lucide 图标
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // 首次使用提示
        if (!settings.apiKey) {
            setTimeout(() => {
                floatBtn.click();
                toggleSettings(true);
            }, 1500);
        }

        // 初始化定时自动整理
        setupAutoOrganize();
    }

    // ================= 启动 =================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }

})();
