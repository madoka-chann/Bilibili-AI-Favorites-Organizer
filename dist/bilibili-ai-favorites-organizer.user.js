// ==UserScript==
// @name         B站 AI 收藏夹自动分类整理
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @author       B站-是小圆_喲 & 感谢b站某不知名的根号三提供的最初模板
// @description  支持所有AI智能分类B站收藏夹视频 | Svelte + GSAP 极致动画 | 自定义模板/增量整理/AI费用估算/分类导出/收藏夹健康报告/置信度可视化/失效视频批量归档/缓存/Token追踪/跨收藏夹去重/撤销历史/备份/自适应限速/毛玻璃面板
// @match        *://*.bilibili.com/*
// @require      https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js
// @require      https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Flip.min.js
// @require      https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Draggable.min.js
// @require      https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/CustomEase.min.js
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
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(function (gsap) {
  'use strict';

  const d=new Set;const importCSS = async e=>{d.has(e)||(d.add(e),(t=>{typeof GM_addStyle=="function"?GM_addStyle(t):(document.head||document.documentElement).appendChild(document.createElement("style")).append(t);})(e));};

  importCSS(' .float-btn.svelte-ayaw0q{position:fixed;bottom:30px;left:30px;z-index:2147483640;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent),var(--ai-primary-light),var(--ai-primary));background-size:300% 300%;border:2px solid rgba(255,255,255,.28);box-shadow:0 0 14px rgba(var(--ai-primary-rgb),.18),0 0 28px #9b59f614;will-change:transform,box-shadow,border-radius;-webkit-user-select:none;user-select:none;touch-action:none}.float-btn.hidden.svelte-ayaw0q{visibility:hidden;opacity:0;pointer-events:none}.orbits.svelte-ayaw0q{position:absolute;top:50%;left:50%;width:0;height:0;pointer-events:none;overflow:visible}.header.svelte-oiwvqb{background:linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent),var(--ai-primary));background-size:400% 400%;animation:svelte-oiwvqb-aurora-flow 18s ease-in-out infinite;color:#fff;padding:16px 18px;font-weight:600;font-size:14px;display:flex;justify-content:space-between;align-items:center;position:relative;overflow:hidden;border-top-left-radius:28px;border-top-right-radius:28px;cursor:grab}.header.svelte-oiwvqb:active{cursor:grabbing}.header-title.svelte-oiwvqb{display:flex;align-items:center;gap:7px}.header-title.svelte-oiwvqb>span:where(.svelte-oiwvqb):first-child{background:linear-gradient(90deg,#fff,#fff 40%,#ffffff80,#fff 60%,#fff);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:svelte-oiwvqb-titleShimmer 6s ease-in-out infinite}.version.svelte-oiwvqb{font-size:10px;opacity:.7;background:#ffffff26;padding:1px 6px;border-radius:8px;animation:svelte-oiwvqb-versionPop .4s cubic-bezier(.2,1,.4,1) both}.header-actions.svelte-oiwvqb{display:flex;gap:8px;align-items:center;position:relative;z-index:1}.header-btn.svelte-oiwvqb{padding:5px;border:1px solid rgba(255,255,255,.08);background:#ffffff1f;color:#fff;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease}.header-btn.svelte-oiwvqb:hover{background:#ffffff4d}.header-btn.active.svelte-oiwvqb{background:#ffffff59}.settings-icon.svelte-oiwvqb{display:flex;align-items:center;justify-content:center;transition:transform .5s cubic-bezier(.2,1,.4,1)}.settings-icon.open.svelte-oiwvqb{transform:rotate(180deg)}@keyframes svelte-oiwvqb-aurora-flow{0%,to{background-position:0% 50%}25%{background-position:100% 25%}50%{background-position:50% 100%}75%{background-position:0% 75%}}@keyframes svelte-oiwvqb-titleShimmer{0%,to{background-position:200% 0}50%{background-position:-200% 0}}@keyframes svelte-oiwvqb-versionPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.1)}to{transform:scale(1);opacity:.7}}@media(prefers-reduced-motion:reduce){.header-title.svelte-oiwvqb>span:where(.svelte-oiwvqb):first-child{animation:none;-webkit-text-fill-color:#fff}.version.svelte-oiwvqb{animation:none}.settings-icon.svelte-oiwvqb{transition:none}}.group.svelte-w9qm3w{margin-bottom:2px;overflow:hidden}.group-header.svelte-w9qm3w{display:flex;align-items:center;gap:8px;padding:9px 10px;cursor:pointer;font-size:12px;font-weight:600;color:var(--ai-text-secondary);-webkit-user-select:none;user-select:none;border-radius:10px;transition:all .3s cubic-bezier(.2,.98,.28,1);background:transparent;border:none;width:100%;text-align:left;position:relative}.group-header.svelte-w9qm3w:hover{background:var(--ai-primary-bg);color:var(--ai-primary)}.group-header.svelte-w9qm3w:hover .group-icon:where(.svelte-w9qm3w){filter:brightness(1.2)}.group.open.svelte-w9qm3w .group-header:where(.svelte-w9qm3w):after{content:"";position:absolute;bottom:-1px;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,var(--ai-primary-light),transparent);opacity:.4}.group-icon.svelte-w9qm3w{width:22px;height:22px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:filter .25s ease,transform .3s ease,box-shadow .3s ease}.group.open.svelte-w9qm3w .group-icon:where(.svelte-w9qm3w){box-shadow:0 0 8px rgba(var(--ai-primary-rgb),.3)}.group-title.svelte-w9qm3w{flex:1}.chevron.svelte-w9qm3w{display:flex}.group-body.svelte-w9qm3w{padding:0 2px 8px;height:0;overflow:hidden}@media(prefers-reduced-motion:reduce){.group.open.svelte-w9qm3w .group-header:where(.svelte-w9qm3w):after{animation:none;opacity:.5}.group-icon.svelte-w9qm3w{transition:none}.group.open.svelte-w9qm3w .group-icon:where(.svelte-w9qm3w){transform:none;box-shadow:none}}.bfao-icon-btn.svelte-1rt0kwk svg{transition:transform .2s cubic-bezier(.2,.98,.28,1)}.bfao-icon-btn.svelte-1rt0kwk:active svg{transform:scale(.8)}.bfao-icon-btn.svelte-1rt0kwk .spinning{animation:svelte-1rt0kwk-spin .8s linear infinite;filter:drop-shadow(0 0 4px rgba(var(--ai-primary-rgb),.5))}@keyframes svelte-1rt0kwk-spin{to{transform:rotate(360deg)}}.bfao-icon-btn.test-success.svelte-1rt0kwk{color:var(--ai-success-dark);background:var(--ai-success-bg);border-color:var(--ai-success);animation:svelte-1rt0kwk-testPop .35s cubic-bezier(.2,1.2,.4,1) both}.bfao-icon-btn.test-error.svelte-1rt0kwk{color:var(--ai-error, #ef4444);background:var(--ai-error-bg, rgba(239, 68, 68, .1));border-color:var(--ai-error, #ef4444);animation:svelte-1rt0kwk-testShake .4s ease both}@keyframes svelte-1rt0kwk-testPop{0%{transform:scale(.5)}70%{transform:scale(1.2)}to{transform:scale(1)}}@keyframes svelte-1rt0kwk-testShake{0%,to{transform:translate(0)}20%{transform:translate(-3px)}40%{transform:translate(3px)}60%{transform:translate(-2px)}80%{transform:translate(1px)}}.model-dropdown.svelte-1rt0kwk{border:1px solid var(--ai-border);border-radius:10px;background:var(--ai-bg);box-shadow:var(--ai-shadow-md);margin-top:4px;animation:svelte-1rt0kwk-dropdownIn .2s cubic-bezier(.2,.98,.28,1) both;transform-origin:top center;padding:4px 0}.model-search.svelte-1rt0kwk{width:calc(100% - 16px);margin:4px 8px;padding:5px 8px;border:1px solid var(--ai-border);border-radius:6px;font-size:11px;background:var(--ai-bg-secondary);color:var(--ai-text);outline:none;box-sizing:border-box}.model-search.svelte-1rt0kwk:focus{border-color:var(--ai-primary);box-shadow:0 1px 0 0 var(--ai-primary)}.model-list.svelte-1rt0kwk{max-height:180px;overflow-y:auto;mask-image:linear-gradient(to bottom,transparent 0%,black 6%,black 94%,transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 6%,black 94%,transparent 100%)}.model-empty.svelte-1rt0kwk{padding:8px 12px;font-size:11px;color:var(--ai-text-muted);text-align:center;animation:svelte-1rt0kwk-floatIdle 3s ease-in-out infinite}@keyframes svelte-1rt0kwk-floatIdle{0%,to{transform:translateY(0)}50%{transform:translateY(-3px)}}@keyframes svelte-1rt0kwk-dropdownIn{0%{opacity:0;transform:scaleY(.92) scaleX(.98)}to{opacity:1;transform:scaleY(1) scaleX(1)}}.model-item.svelte-1rt0kwk{display:block;width:100%;padding:7px 12px;font-size:12px;text-align:left;border:none;background:transparent;color:var(--ai-text);cursor:pointer;transition:background .15s ease,transform .15s ease,box-shadow .2s ease;animation:svelte-1rt0kwk-modelItemSlideIn .2s cubic-bezier(.2,.98,.28,1) both}.model-item.svelte-1rt0kwk:nth-child(1){animation-delay:0s}.model-item.svelte-1rt0kwk:nth-child(2){animation-delay:.03s}.model-item.svelte-1rt0kwk:nth-child(3){animation-delay:.06s}.model-item.svelte-1rt0kwk:nth-child(4){animation-delay:.09s}.model-item.svelte-1rt0kwk:nth-child(5){animation-delay:.12s}.model-item.svelte-1rt0kwk:nth-child(n+6){animation-delay:.15s}@keyframes svelte-1rt0kwk-modelItemSlideIn{0%{opacity:0;transform:translate(8px)}to{opacity:1;transform:translate(0)}}.model-item.svelte-1rt0kwk:hover{background:var(--ai-bg-hover);transform:translate(2px);box-shadow:inset 0 0 12px rgba(var(--ai-primary-rgb),.06)}.model-item.active.svelte-1rt0kwk{background:var(--ai-primary-bg);color:var(--ai-primary);font-weight:600;box-shadow:inset 3px 0 0 var(--ai-primary);animation:svelte-1rt0kwk-activePulse 2.5s ease-in-out infinite}@keyframes svelte-1rt0kwk-activePulse{0%,to{box-shadow:inset 3px 0 0 var(--ai-primary)}50%{box-shadow:inset 3px 0 8px rgba(var(--ai-primary-rgb),.2),inset 3px 0 0 var(--ai-primary)}}@media(prefers-reduced-motion:reduce){.bfao-icon-btn.svelte-1rt0kwk svg{transition:none}.bfao-icon-btn.svelte-1rt0kwk .spinning{filter:none}.model-item.active.svelte-1rt0kwk,.model-empty.svelte-1rt0kwk{animation:none}.model-search.svelte-1rt0kwk:focus{box-shadow:none}}.provider-config.svelte-14s97jl{display:flex;flex-direction:column;gap:10px}.link-btn.svelte-14s97jl{padding:6px;border:1.5px solid var(--ai-border);border-radius:8px;background:var(--ai-bg);color:var(--ai-text-muted);display:flex;align-items:center;justify-content:center;transition:all .2s ease;text-decoration:none;flex-shrink:0}.link-btn.svelte-14s97jl:hover{border-color:var(--ai-primary);color:var(--ai-primary);box-shadow:0 0 8px rgba(var(--ai-primary-rgb),.25)}.bfao-icon-btn.svelte-14s97jl svg{transition:transform .2s cubic-bezier(.2,.98,.28,1)}.bfao-icon-btn.svelte-14s97jl:active svg{transform:scale(.8)}.field-slide-in.svelte-14s97jl{animation:svelte-14s97jl-fieldSlideDown .3s cubic-bezier(.2,.98,.28,1) both}@keyframes svelte-14s97jl-fieldSlideDown{0%{opacity:0;transform:translateY(-8px);max-height:0}to{opacity:1;transform:translateY(0);max-height:80px}}@media(prefers-reduced-motion:reduce){.bfao-icon-btn.svelte-14s97jl svg{transition:none}}.liquid-toggle.svelte-4afsks{position:relative;width:38px;height:20px;border-radius:12px;border:none;cursor:pointer;background:var(--ai-bg-tertiary);transition:background .3s ease,box-shadow .3s ease;padding:0;flex-shrink:0}.liquid-toggle.on.svelte-4afsks{background:var(--ai-primary);box-shadow:0 0 10px rgba(var(--ai-primary-rgb),.35)}.thumb.svelte-4afsks{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;will-change:transform;transition:box-shadow .3s ease}.liquid-toggle.on.svelte-4afsks .thumb:where(.svelte-4afsks){box-shadow:0 1px 3px #0003,0 0 6px #ffffff80}.settings-panel.svelte-182y78p{padding:10px 15px 12px;background:var(--ai-bg-secondary);border-bottom:1px solid var(--ai-border-light)}.settings-panel.svelte-182y78p>.group{animation:svelte-182y78p-groupSlideIn .3s cubic-bezier(.2,.98,.28,1) both}.settings-panel.svelte-182y78p>.group:nth-child(1){animation-delay:0s}.settings-panel.svelte-182y78p>.group:nth-child(2){animation-delay:.06s}.settings-panel.svelte-182y78p>.group:nth-child(3){animation-delay:.12s}.settings-panel.svelte-182y78p>.group:nth-child(4){animation-delay:.18s}@keyframes svelte-182y78p-groupSlideIn{0%{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.field-grid.svelte-182y78p{display:grid;grid-template-columns:1fr 1fr;gap:8px}.full.svelte-182y78p{grid-column:1 / -1;flex-direction:row;align-items:center;gap:8px}.toggle-list.svelte-182y78p{display:flex;flex-direction:column;gap:8px}.toggle-row.svelte-182y78p{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--ai-text-secondary);transition:background .2s ease,transform .25s cubic-bezier(.2,.98,.28,1);border-radius:6px;padding:4px 6px;margin:-4px -6px}.toggle-row.svelte-182y78p>span:where(.svelte-182y78p):first-child{transition:color .2s ease}.toggle-row.svelte-182y78p:hover{background:var(--ai-bg-hover);transform:translate(3px)}.toggle-row.svelte-182y78p:hover>span:where(.svelte-182y78p):first-child{color:var(--ai-text)}.sub-field.svelte-182y78p{display:flex;align-items:center;gap:8px;padding-left:23px}.sub-field-slide.svelte-182y78p{animation:svelte-182y78p-subFieldSlideIn .3s cubic-bezier(.2,.98,.28,1) both}@keyframes svelte-182y78p-subFieldSlideIn{0%{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}.hint-fade-in.svelte-182y78p{animation:svelte-182y78p-hintFadeIn .35s ease both}@keyframes svelte-182y78p-hintFadeIn{0%{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.anim-hint.svelte-182y78p{font-size:10px;line-height:1.4;color:var(--ai-warning-dark);background:var(--ai-warning-bg);padding:6px 10px;border-radius:6px;margin-top:4px}@media(prefers-reduced-motion:reduce){.toggle-row.svelte-182y78p:hover{transform:none}.sub-field-slide.svelte-182y78p,.hint-fade-in.svelte-182y78p{animation:none}.settings-panel.svelte-182y78p>.group{animation:none}}.prompt-editor.svelte-avw5xh{margin-top:10px}.prompt-header.svelte-avw5xh{margin-bottom:6px;display:flex;gap:4px;align-items:center}.prompt-header.svelte-avw5xh .bfao-select:where(.svelte-avw5xh){flex:1}.prompt-action-btn.svelte-avw5xh{padding:5px 8px;border:1.5px solid var(--ai-border);border-radius:6px;background:var(--ai-bg-secondary);color:var(--ai-text-muted);cursor:pointer;display:flex;align-items:center;transition:all .2s}.prompt-action-btn.svelte-avw5xh:hover:not(:disabled){border-color:var(--ai-primary-light);color:var(--ai-primary)}.prompt-action-btn.svelte-avw5xh:disabled{opacity:.4;cursor:not-allowed}.prompt-action-btn.save-flash.svelte-avw5xh{color:var(--ai-success-dark);border-color:var(--ai-success);animation:svelte-avw5xh-saveFlash .6s ease both}@keyframes svelte-avw5xh-saveFlash{0%{background:var(--ai-bg-secondary)}30%{background:var(--ai-success-bg);box-shadow:0 0 8px rgba(var(--ai-success-rgb),.3)}to{background:var(--ai-bg-secondary);box-shadow:none}}.prompt-textarea.svelte-avw5xh{width:100%;height:65px;padding:8px 10px;border:1.5px solid var(--ai-border);border-radius:8px;font-size:12px;outline:none;box-sizing:border-box;background:var(--ai-input-bg);color:var(--ai-text);resize:none;font-family:inherit;line-height:1.5;transition:border-color .3s ease,box-shadow .3s ease,height .3s cubic-bezier(.2,.98,.28,1)}.prompt-textarea.svelte-avw5xh:focus{border-color:var(--ai-primary);box-shadow:0 0 0 3px var(--ai-primary-shadow);height:72px}.custom-preset-row.svelte-avw5xh{display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:6px;background:var(--ai-bg-secondary);animation:svelte-avw5xh-presetSlideIn .25s cubic-bezier(.2,.98,.28,1) both;transition:background .2s ease,transform .15s ease}.custom-preset-row.svelte-avw5xh:nth-child(1){animation-delay:0s}.custom-preset-row.svelte-avw5xh:nth-child(2){animation-delay:.04s}.custom-preset-row.svelte-avw5xh:nth-child(3){animation-delay:.08s}.custom-preset-row.svelte-avw5xh:nth-child(4){animation-delay:.12s}.custom-preset-row.svelte-avw5xh:nth-child(n+5){animation-delay:.16s}@keyframes svelte-avw5xh-presetSlideIn{0%{opacity:0;transform:translate(-6px)}to{opacity:1;transform:translate(0)}}.custom-preset-row.svelte-avw5xh:hover{background:var(--ai-bg-hover);transform:translate(2px)}.preset-select.svelte-avw5xh{flex:1;background:none;border:none;color:var(--ai-text-secondary);font-size:11px;cursor:pointer;text-align:left;padding:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.preset-select.svelte-avw5xh:hover{color:var(--ai-primary)}.preset-icon-btn.svelte-avw5xh{padding:2px;background:none;border:none;color:var(--ai-text-muted);cursor:pointer;display:flex;transition:color .2s}.preset-icon-btn.svelte-avw5xh:hover{color:var(--ai-primary)}.preset-icon-btn.danger.svelte-avw5xh:hover{color:var(--ai-error, #ef4444);animation:svelte-avw5xh-deleteShake .3s ease}.preset-icon-btn.svelte-avw5xh .starred{color:var(--ai-warning-dark);fill:var(--ai-warning-dark);animation:svelte-avw5xh-starBounce .35s cubic-bezier(.2,.98,.28,1)}@keyframes svelte-avw5xh-starBounce{0%{transform:scale(.5)}60%{transform:scale(1.25)}to{transform:scale(1)}}@keyframes svelte-avw5xh-deleteShake{0%,to{transform:translate(0)}25%{transform:translate(-2px)}75%{transform:translate(2px)}}.preset-manager.svelte-avw5xh{margin-top:8px;padding:8px;border:1px solid var(--ai-border-light);border-radius:8px;background:var(--ai-bg-secondary)}.manager-title.svelte-avw5xh{font-size:11px;font-weight:600;color:var(--ai-text);margin-bottom:6px;position:relative;padding-bottom:4px}.manager-title.svelte-avw5xh:after{content:"";position:absolute;bottom:0;left:0;width:100%;height:1.5px;background:linear-gradient(90deg,var(--ai-primary),var(--ai-gradient-accent),transparent);transform:scaleX(0);transform-origin:left;animation:svelte-avw5xh-titleLineExpand .4s cubic-bezier(.2,.98,.28,1) .15s both}@keyframes svelte-avw5xh-titleLineExpand{to{transform:scaleX(1)}}.manager-section.svelte-avw5xh{font-size:10px;font-weight:600;color:var(--ai-text-muted);margin:6px 0 2px;text-transform:uppercase;letter-spacing:.05em}.hidden-preset.svelte-avw5xh{opacity:.4;text-decoration:line-through}@media(prefers-reduced-motion:reduce){.prompt-textarea.svelte-avw5xh{transition:border-color .3s ease,box-shadow .3s ease;height:65px!important}.prompt-action-btn.save-flash.svelte-avw5xh{animation:none}.manager-title.svelte-avw5xh:after{animation:none;transform:scaleX(1)}.custom-preset-row.svelte-avw5xh{animation:none}}.log-area.svelte-rc9h4j{margin-top:10px;background:var(--ai-bg-tertiary);padding:8px 10px;border-radius:10px;font-size:11px;color:var(--ai-text);height:120px;overflow-y:auto;overflow-wrap:break-word;word-break:break-word;border:1px solid var(--ai-border-light);scroll-behavior:smooth;display:flex;flex-direction:column;gap:2px;position:relative;mask-image:linear-gradient(to bottom,transparent 0%,black 8%,black 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 8%,black 100%);transition:border-color .3s ease}.log-area.svelte-rc9h4j:hover{border-color:var(--ai-border)}.log-entry.svelte-rc9h4j{display:flex;align-items:flex-start;gap:6px;padding:3px 8px;border-radius:6px;background:var(--ai-bg-secondary);border-left:3px solid transparent;line-height:1.5;animation:svelte-rc9h4j-logSlideIn .25s ease both;transition:background .2s ease}.log-entry.svelte-rc9h4j:last-child{animation:svelte-rc9h4j-logSlideIn .25s ease both,svelte-rc9h4j-newEntryGlow .8s ease .25s 1}.log-entry.svelte-rc9h4j:hover{background:var(--ai-bg-tertiary);border-left-width:4px;padding-left:7px}.log-time.svelte-rc9h4j{flex-shrink:0;font-size:9px;color:var(--ai-text-muted);background:var(--ai-bg-tertiary);padding:1px 5px;border-radius:8px;line-height:16px;transition:letter-spacing .2s ease,background .2s ease}.log-entry.svelte-rc9h4j:hover .log-time:where(.svelte-rc9h4j){letter-spacing:.04em;background:var(--ai-border-light)}.log-msg.svelte-rc9h4j{flex:1;min-width:0;word-break:break-word;font-family:Menlo,Monaco,Consolas,monospace;letter-spacing:.02em}.log-success.svelte-rc9h4j{color:var(--ai-success-dark);border-left-color:var(--ai-success)}.log-entry:first-child.log-success.svelte-rc9h4j{animation:svelte-rc9h4j-logSlideIn .25s ease both,svelte-rc9h4j-readyPulse 3s ease-in-out .5s infinite}.log-error.svelte-rc9h4j{color:var(--ai-error-alt);border-left-color:var(--ai-error-alt);animation:svelte-rc9h4j-logSlideIn .25s ease both,svelte-rc9h4j-borderGlow .6s ease .25s 2}.log-warning.svelte-rc9h4j{color:var(--ai-warning);border-left-color:var(--ai-warning);animation:svelte-rc9h4j-logSlideIn .25s ease both,svelte-rc9h4j-borderGlowWarn .8s ease .25s 1}.log-info.svelte-rc9h4j{color:var(--ai-info);border-left-color:var(--ai-info)}.log-cat.svelte-rc9h4j{position:absolute;bottom:4px;left:8px;right:8px;display:flex;align-items:center;gap:6px;padding:4px 10px;background:linear-gradient(to top,var(--ai-bg-tertiary) 70%,transparent);font-size:11px;color:var(--ai-primary);border-radius:0 0 8px 8px;transition:opacity .4s ease,transform .4s ease;pointer-events:none}.log-cat.svelte-rc9h4j:not(.away){animation:svelte-rc9h4j-catReturn .5s cubic-bezier(.2,.98,.28,1) both}.log-cat.away.svelte-rc9h4j{opacity:0;transform:translateY(-20px) scale(.5);pointer-events:none}.cat-emoji.svelte-rc9h4j{font-size:18px;animation:svelte-rc9h4j-catIdle 1s ease-in-out infinite alternate}.cat-text.svelte-rc9h4j{font-family:Menlo,Monaco,Consolas,monospace;letter-spacing:.03em}@keyframes svelte-rc9h4j-catIdle{0%{transform:translateY(0)}to{transform:translateY(-3px)}}@keyframes svelte-rc9h4j-logSlideIn{0%{opacity:0;transform:translate(-8px)}to{opacity:1;transform:translate(0)}}@keyframes svelte-rc9h4j-borderGlow{0%,to{box-shadow:none}50%{box-shadow:inset 3px 0 8px -2px var(--ai-error-alt)}}@keyframes svelte-rc9h4j-borderGlowWarn{0%,to{box-shadow:none}50%{box-shadow:inset 3px 0 6px -2px var(--ai-warning)}}@keyframes svelte-rc9h4j-readyPulse{0%,to{opacity:1}50%{opacity:.6}}@keyframes svelte-rc9h4j-newEntryGlow{0%,to{box-shadow:none}40%{box-shadow:0 0 6px rgba(var(--ai-primary-rgb),.2),inset 0 0 4px rgba(var(--ai-primary-rgb),.06)}}@keyframes svelte-rc9h4j-catReturn{0%{opacity:0;transform:translateY(-16px) scale(.5)}60%{opacity:1;transform:translateY(3px) scale(1.05)}to{opacity:1;transform:translateY(0) scale(1)}}@media(prefers-reduced-motion:reduce){.log-entry:first-child.log-success.svelte-rc9h4j{animation:none}.log-entry.svelte-rc9h4j:last-child{animation:none}.log-time.svelte-rc9h4j{transition:none}.log-entry.svelte-rc9h4j:hover{border-left-width:3px;padding-left:8px}.log-cat.svelte-rc9h4j:not(.away){animation:none}.log-area.svelte-rc9h4j{transition:none}}.progress-container.svelte-um4ua8{margin-top:10px;padding:8px 0;animation:svelte-um4ua8-progressEnter .4s cubic-bezier(.2,.98,.28,1) both;transform-origin:top center}@keyframes svelte-um4ua8-progressEnter{0%{opacity:0;transform:translateY(8px) scaleY(.8)}to{opacity:1;transform:translateY(0) scaleY(1)}}.progress-header.svelte-um4ua8{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.phase-label.svelte-um4ua8{font-size:11px;font-weight:600;color:var(--ai-primary);display:inline-block;transition:transform .25s cubic-bezier(.2,1.04,.42,1)}.phase-label.svelte-um4ua8:hover{transform:scale(1.05)}.progress-text.svelte-um4ua8{font-size:11px;font-weight:700;color:var(--ai-text-secondary);display:inline-block}.progress-track.svelte-um4ua8{height:6px;background:var(--ai-bg-tertiary);border-radius:3px;overflow:visible;position:relative}.progress-bar.svelte-um4ua8{height:100%;background:linear-gradient(90deg,var(--ai-primary),var(--ai-gradient-accent),#d946ef,var(--ai-primary));background-size:300% 100%;border-radius:3px;transition:width .4s cubic-bezier(.19,1,.22,1);position:relative;will-change:width;animation:svelte-um4ua8-auroraFlow 3s ease-in-out infinite}.progress-bar.svelte-um4ua8:after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.4) 50%,transparent 100%);background-size:200% 100%;animation:svelte-um4ua8-shimmer 1.5s ease-in-out infinite}.progress-bar.complete.svelte-um4ua8{background:linear-gradient(90deg,var(--ai-success),var(--ai-success-light),var(--ai-success-lighter));animation:svelte-um4ua8-completeGlow 2s ease-in-out infinite}.token-stats.svelte-um4ua8{font-size:10px;color:var(--ai-text-muted);margin-top:4px;text-align:right;animation:svelte-um4ua8-tokenFadeIn .4s cubic-bezier(.2,.98,.28,1) both}.progress-cat.svelte-um4ua8{position:absolute;top:-18px;font-size:16px;line-height:1;transform:translate(-50%);animation:svelte-um4ua8-catBounce .5s ease-in-out infinite alternate;filter:drop-shadow(0 1px 3px rgba(0,0,0,.2));pointer-events:auto;cursor:pointer;transition:left .8s cubic-bezier(.19,1,.22,1),filter .2s ease}.progress-cat.svelte-um4ua8:hover{filter:drop-shadow(0 2px 6px rgba(0,0,0,.3)) brightness(1.2)}@keyframes svelte-um4ua8-catBounce{0%{transform:translate(-50%) translateY(0)}to{transform:translate(-50%) translateY(-6px)}}@keyframes svelte-um4ua8-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}@keyframes svelte-um4ua8-auroraFlow{0%{background-position:0% 0}50%{background-position:100% 0}to{background-position:0% 0}}@keyframes svelte-um4ua8-completeGlow{0%,to{box-shadow:0 0 4px rgba(var(--ai-primary-rgb),.1)}50%{box-shadow:0 0 12px #10b98159}}@keyframes svelte-um4ua8-tokenFadeIn{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.progress-container.svelte-um4ua8,.progress-bar.svelte-um4ua8{animation:none}.progress-bar.svelte-um4ua8:after{animation:none}.progress-bar.complete.svelte-um4ua8,.token-stats.svelte-um4ua8{animation:none}}.actions.svelte-15t8ntb{margin-top:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden}.btn-primary.svelte-15t8ntb{width:100%;padding:12px;border:1.5px solid transparent;border-radius:14px;font-size:14px;font-weight:700;color:#fff;background:radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px),rgba(255,255,255,.2),transparent 60%),linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent),var(--ai-primary));background-size:auto,500% 500%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;position:relative;overflow:hidden;box-sizing:border-box;transition:all .3s cubic-bezier(.2,1.04,.42,1)}.btn-primary.svelte-15t8ntb:hover{box-shadow:0 12px 32px rgba(var(--ai-primary-rgb),.3),0 5px 16px #ff6b9d29;transform:translateY(-1px)}.btn-primary.svelte-15t8ntb:active{transform:scale(.97);transition-duration:.08s}.btn-primary.running.svelte-15t8ntb{background:linear-gradient(135deg,var(--ai-error),var(--ai-error-hover),var(--ai-error));animation:svelte-15t8ntb-runningPulse 2s ease-in-out infinite;border:1.5px solid rgba(var(--ai-error-rgb),.4)}.btn-primary.running.svelte-15t8ntb svg{animation:svelte-15t8ntb-iconSwitch .35s cubic-bezier(.22,1.42,.29,1) both,svelte-15t8ntb-runningTremor .8s ease-in-out .35s infinite}@keyframes svelte-15t8ntb-runningTremor{0%,to{transform:scale(1) rotate(0)}25%{transform:scale(1) rotate(-2deg)}75%{transform:scale(1) rotate(2deg)}}.btn-primary.svelte-15t8ntb:not(.running) svg{animation:svelte-15t8ntb-iconSwitch .35s cubic-bezier(.22,1.42,.29,1) both}@keyframes svelte-15t8ntb-iconSwitch{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}.kbd.svelte-15t8ntb{font-size:10px;opacity:.4;background:#ffffff26;padding:1px 5px;border-radius:4px;margin-left:4px;font-family:monospace;transition:opacity .25s ease}.btn-primary.svelte-15t8ntb:hover .kbd:where(.svelte-15t8ntb){opacity:.8}.tool-row.svelte-15t8ntb{display:flex;gap:6px;animation:svelte-15t8ntb-toolRowSlideIn .3s ease both}.tool-row.svelte-15t8ntb:nth-child(2){animation-delay:0s}.tool-row.svelte-15t8ntb:nth-child(3){animation-delay:.06s}.tool-row.svelte-15t8ntb:nth-child(4){animation-delay:.12s}.btn-tool.svelte-15t8ntb{flex:1;padding:8px 6px;border:1.5px solid var(--ai-border);border-radius:10px;background:radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px),rgba(var(--ai-primary-rgb),.12),transparent 60%),var(--ai-bg-tertiary);color:var(--ai-text-secondary);font-size:11px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .35s cubic-bezier(.22,1.42,.29,1)}.btn-tool.svelte-15t8ntb svg{transition:transform .25s cubic-bezier(.22,1.42,.29,1)}.btn-tool.svelte-15t8ntb:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(var(--ai-primary-rgb),.12);border-color:var(--ai-primary-light)}.btn-tool.svelte-15t8ntb:hover svg{transform:scale(1.2)}.btn-tool.svelte-15t8ntb:active{transform:scale(.92);transition-duration:.08s}.btn-tool.svelte-15t8ntb:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;filter:grayscale(.5);transition:opacity .3s ease,filter .3s ease}@keyframes svelte-15t8ntb-runningPulse{0%,to{box-shadow:0 4px 16px rgba(var(--ai-primary-rgb),.15);border-color:rgba(var(--ai-error-rgb),.3)}50%{box-shadow:0 8px 32px #ef444459,0 0 12px #ef444433;border-color:rgba(var(--ai-error-rgb),.6)}}@keyframes svelte-15t8ntb-toolRowSlideIn{0%{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.btn-primary.svelte-15t8ntb svg{animation:none}.btn-primary.running.svelte-15t8ntb svg{animation:none}.btn-primary.svelte-15t8ntb:not(.running) svg{animation:none}.kbd.svelte-15t8ntb{transition:none}.btn-tool.svelte-15t8ntb svg{transition:none}.btn-tool.svelte-15t8ntb:hover svg{transform:none}}.backdrop.svelte-1bxxaoh{position:fixed;top:0;right:0;bottom:0;left:0;background:var(--ai-backdrop);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4)}.modal.svelte-1bxxaoh{background:var(--ai-bg);color:var(--ai-text);border-radius:28px;box-shadow:var(--ai-shadow-modal);max-height:85vh;display:flex;flex-direction:column;overflow:hidden}.modal-header.svelte-1bxxaoh{padding:18px 22px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent),var(--ai-primary));background-size:400% 400%;animation:svelte-1bxxaoh-modal-aurora-flow 18s ease-in-out infinite;color:#fff;position:relative;overflow:hidden}.modal-header.svelte-1bxxaoh h3:where(.svelte-1bxxaoh){margin:0;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;position:relative;z-index:1}.close-btn.svelte-1bxxaoh{background:#fff3;border:none;color:#fff;width:28px;height:28px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;transition:background .2s ease,transform .25s cubic-bezier(.2,1,.4,1)}.close-btn.svelte-1bxxaoh:hover{background:#ffffff59;transform:rotate(90deg) scale(1.1)}.modal-body.svelte-1bxxaoh{flex:1;overflow-y:auto;overflow-x:hidden;padding:0;min-height:0;position:relative;background:radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px),rgba(var(--ai-primary-rgb, 115, 100, 255),.05) 0%,transparent 55%)}.modal-body.svelte-1bxxaoh:before,.modal-body.svelte-1bxxaoh:after{content:"";position:sticky;display:block;height:18px;pointer-events:none;z-index:2;opacity:0;transition:opacity .3s ease}.modal-body.svelte-1bxxaoh:before{top:0;background:linear-gradient(to bottom,var(--ai-bg),transparent);margin-bottom:-18px}.modal-body.svelte-1bxxaoh:after{bottom:0;background:linear-gradient(to top,var(--ai-bg),transparent);margin-top:-18px}.modal-body.fade-top.svelte-1bxxaoh:before{opacity:1}.modal-body.fade-bottom.svelte-1bxxaoh:after{opacity:1}.modal-footer.svelte-1bxxaoh{padding:14px 20px;border-top:1px solid var(--ai-border-light);display:flex;gap:12px;background:var(--ai-bg-secondary);box-shadow:0 -4px 12px #0000000a}.modal-btn.svelte-1bxxaoh{flex:1;padding:11px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .35s cubic-bezier(.2,1.04,.42,1);display:flex;align-items:center;justify-content:center;gap:6px}.modal-btn.confirm.svelte-1bxxaoh{background:linear-gradient(135deg,var(--ai-success-dark),var(--ai-success),var(--ai-success-light));color:#fff}.modal-btn.confirm.svelte-1bxxaoh:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 10px 28px var(--ai-success-bg)}.modal-btn.confirm.svelte-1bxxaoh:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}.modal-btn.cancel.svelte-1bxxaoh{background:var(--ai-border-lighter);color:var(--ai-text-muted)}.modal-btn.cancel.svelte-1bxxaoh:hover{background:var(--ai-bg-tertiary)}.modal-scroll-indicator.svelte-1bxxaoh{position:sticky;top:0;height:2px;background:linear-gradient(90deg,var(--ai-primary),var(--ai-gradient-accent));opacity:0;transition:opacity .3s ease,width .15s linear;z-index:3;border-radius:1px;flex-shrink:0}.modal-scroll-indicator.visible.svelte-1bxxaoh{opacity:1}@keyframes svelte-1bxxaoh-modal-aurora-flow{0%,to{background-position:0% 50%}25%{background-position:100% 25%}50%{background-position:50% 100%}75%{background-position:0% 75%}}@media(prefers-reduced-motion:reduce){.modal-header.svelte-1bxxaoh{animation:none}.close-btn.svelte-1bxxaoh:hover{transform:none}.modal-body.svelte-1bxxaoh:before,.modal-body.svelte-1bxxaoh:after{transition:none}}.folder-list.svelte-jk545l{max-height:280px;overflow-y:auto;margin-bottom:14px;mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);padding-top:4px;padding-bottom:4px}.folder-group.svelte-jk545l{margin-bottom:8px}.folder-header.svelte-jk545l{font-size:12px;font-weight:700;color:var(--ai-text-secondary);padding:4px 0;transition:color .2s ease}.folder-header.svelte-jk545l:hover{color:var(--ai-text)}.video-item.svelte-jk545l{font-size:11px;padding:2px 4px 2px 12px;border-bottom:1px solid var(--ai-border-lighter);border-left:2px solid transparent;color:var(--ai-text-muted);border-radius:4px;transition:background .2s ease,padding-left .2s ease,box-shadow .2s ease,transform .2s ease,border-left-color .2s ease}.video-item.svelte-jk545l:hover{background:var(--ai-bg-hover);padding-left:16px;transform:translateY(-1px);box-shadow:0 2px 8px rgba(var(--ai-primary-rgb),.08);border-left-color:var(--ai-primary)}@media(prefers-reduced-motion:reduce){.video-item.svelte-jk545l{transition:none}.video-item.svelte-jk545l:hover{transform:none}}.dup-list.svelte-xs3gcd{max-height:300px;overflow-y:auto;margin-bottom:14px;mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);padding-top:4px;padding-bottom:4px}.dup-item.svelte-xs3gcd{font-size:11px;padding:5px 4px;border-bottom:1px solid var(--ai-border-lighter);border-radius:4px;transition:background .2s ease,padding-left .2s ease,box-shadow .2s ease,transform .2s ease}.dup-item.svelte-xs3gcd:hover{background:var(--ai-bg-hover);padding-left:8px;transform:translateY(-1px);box-shadow:0 2px 8px rgba(var(--ai-primary-rgb),.08)}.dup-title.svelte-xs3gcd{color:var(--ai-text);transition:color .2s ease}.dup-item.svelte-xs3gcd:hover .dup-title:where(.svelte-xs3gcd){color:var(--ai-primary)}.dup-folders.svelte-xs3gcd{color:var(--ai-text-muted);padding-left:12px;font-size:10px;transition:opacity .2s ease,transform .2s ease;opacity:.7}.dup-item.svelte-xs3gcd:hover .dup-folders:where(.svelte-xs3gcd){opacity:1;transform:translate(2px)}@media(prefers-reduced-motion:reduce){.dup-item.svelte-xs3gcd{transition:none}.dup-item.svelte-xs3gcd:hover{transform:none}.dup-folders.svelte-xs3gcd{transition:none}.dup-item.svelte-xs3gcd:hover .dup-folders:where(.svelte-xs3gcd){transform:none}}.hint.svelte-1237wle{font-size:12px;color:var(--ai-text-secondary);margin-bottom:12px;animation:svelte-1237wle-hintSlideIn .3s cubic-bezier(.2,.98,.28,1) both}.history-list.svelte-1237wle{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto;mask-image:linear-gradient(to bottom,transparent 0%,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 12px,black calc(100% - 12px),transparent 100%)}.item-info.svelte-1237wle{flex:1}.item-time.svelte-1237wle{font-size:12px;font-weight:600;color:var(--ai-text)}.item-detail.svelte-1237wle{font-size:11px;color:var(--ai-text-muted);margin-top:2px}.bfao-selectable-item{transition:border-color .25s ease,background .25s ease,transform .2s cubic-bezier(.2,1.04,.42,1)!important}.bfao-selectable-item:hover:not(.selected){background:var(--ai-bg-hover)}.bfao-selectable-item.selected{transform:translate(2px);animation:svelte-1237wle-selectPulse .4s ease;box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.15)}@keyframes svelte-1237wle-selectPulse{0%{box-shadow:0 0 rgba(var(--ai-primary-rgb),.3)}50%{box-shadow:0 0 0 4px rgba(var(--ai-primary-rgb),.15)}to{box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.15)}}@keyframes svelte-1237wle-hintSlideIn{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.bfao-selectable-item.selected,.hint.svelte-1237wle{animation:none}}.timeline.svelte-qj4dz7{position:relative;padding-left:20px}.timeline.svelte-qj4dz7:before{content:"";position:absolute;left:7px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--ai-primary),var(--ai-border) 70%,transparent);transform-origin:top;animation:svelte-qj4dz7-lineGrow .6s cubic-bezier(.2,.98,.28,1) both}@keyframes svelte-qj4dz7-lineGrow{0%{transform:scaleY(0)}to{transform:scaleY(1)}}.timeline-item.svelte-qj4dz7{position:relative;margin-bottom:16px;animation:svelte-qj4dz7-slideIn .3s ease calc(var(--i) * .05s) both}.timeline-dot.svelte-qj4dz7{position:absolute;left:-17px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--ai-primary);border:2px solid var(--ai-bg);box-shadow:0 0 0 2px var(--ai-primary-light);transition:transform .3s ease,box-shadow .3s ease}.timeline-item.svelte-qj4dz7:hover .timeline-dot:where(.svelte-qj4dz7){transform:scale(1.4);box-shadow:0 0 0 3px var(--ai-primary-light),0 0 10px rgba(var(--ai-primary-rgb),.4)}.timeline-card.svelte-qj4dz7{padding:8px 12px;background:var(--ai-bg-tertiary);border-radius:10px;border:1px solid var(--ai-border-lighter);transition:transform .25s ease,box-shadow .25s ease}.timeline-item.svelte-qj4dz7:hover .timeline-card:where(.svelte-qj4dz7){transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.12),0 4px 12px rgba(var(--ai-primary-rgb),.1)}.timeline-time.svelte-qj4dz7{font-size:10px;color:var(--ai-text-muted);margin-bottom:4px}.timeline-detail.svelte-qj4dz7{font-size:12px;color:var(--ai-text)}.timeline-detail.svelte-qj4dz7 strong:where(.svelte-qj4dz7){color:var(--ai-primary)}.timeline-cats.svelte-qj4dz7{font-size:10px;color:var(--ai-text-muted);margin-top:4px;line-height:1.4;background:var(--ai-bg-hover);border-radius:4px;padding:3px 6px;transition:background .2s ease,color .2s ease}.timeline-item.svelte-qj4dz7:hover .timeline-cats:where(.svelte-qj4dz7){background:var(--ai-primary-bg);color:var(--ai-text-secondary)}.clear-btn.svelte-qj4dz7:hover{color:var(--ai-error);animation:svelte-qj4dz7-clearShake .4s ease;box-shadow:0 0 12px rgba(var(--ai-error-rgb),.2)}.timeline-item.svelte-qj4dz7:first-child .timeline-card:where(.svelte-qj4dz7){border-left:2px solid var(--ai-primary);background:var(--ai-bg-hover)}.timeline-dot.svelte-qj4dz7{animation:svelte-qj4dz7-dotPulse .6s ease calc(var(--i) * .05s + .3s)}@keyframes svelte-qj4dz7-slideIn{0%{opacity:0;transform:translate(-10px)}to{opacity:1;transform:translate(0)}}@keyframes svelte-qj4dz7-clearShake{0%,to{margin-left:0}20%{margin-left:-2px}40%{margin-left:2px}60%{margin-left:-1.5px}80%{margin-left:1px}}@keyframes svelte-qj4dz7-dotPulse{0%{box-shadow:0 0 0 2px var(--ai-primary-light)}50%{box-shadow:0 0 0 5px rgba(var(--ai-primary-rgb),.3),0 0 12px rgba(var(--ai-primary-rgb),.2)}to{box-shadow:0 0 0 2px var(--ai-primary-light)}}@media(prefers-reduced-motion:reduce){.clear-btn.svelte-qj4dz7:hover,.timeline-dot.svelte-qj4dz7{animation:none}.timeline-item.svelte-qj4dz7{animation:none;opacity:1}.timeline.svelte-qj4dz7:before{animation:none;transform:scaleY(1)}}.health-score.svelte-l1lb8j{position:relative;display:flex;align-items:center;justify-content:center;padding:16px 0 8px}.health-ring.svelte-l1lb8j{display:block;margin:0 auto;filter:drop-shadow(0 0 8px currentColor);transition:filter .3s ease}.score-overlay.svelte-l1lb8j{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:16px}.score-number.svelte-l1lb8j{font-size:36px;font-weight:800;line-height:1}.score-label.svelte-l1lb8j{font-size:12px;opacity:.7;margin-top:4px}.health-detail.svelte-l1lb8j{text-align:center;font-size:13px;color:var(--ai-text-secondary);margin-bottom:16px}.stats-grid.svelte-l1lb8j{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px}.stat-card.svelte-l1lb8j{padding:12px;background:var(--ai-bg-tertiary);border-radius:12px;text-align:center;border:1px solid var(--ai-border-lighter);transition:border-color .3s ease,box-shadow .3s ease,transform .3s cubic-bezier(.2,.98,.28,1);animation:svelte-l1lb8j-cardPop .35s cubic-bezier(.22,1.42,.29,1) both}.stats-grid.svelte-l1lb8j .stat-card:where(.svelte-l1lb8j):nth-child(1){animation-delay:.1s}.stats-grid.svelte-l1lb8j .stat-card:where(.svelte-l1lb8j):nth-child(2){animation-delay:.16s}.stats-grid.svelte-l1lb8j .stat-card:where(.svelte-l1lb8j):nth-child(3){animation-delay:.22s}.stats-grid.svelte-l1lb8j .stat-card:where(.svelte-l1lb8j):nth-child(4){animation-delay:.28s}@keyframes svelte-l1lb8j-cardPop{0%{opacity:0;transform:scale(.85) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.stat-card.svelte-l1lb8j:hover{border-color:var(--ai-primary-light);box-shadow:0 0 12px rgba(var(--ai-primary-rgb),.15)}.stat-value.svelte-l1lb8j{font-size:22px;font-weight:800;color:var(--ai-primary);transition:filter .25s ease}.stat-card.svelte-l1lb8j:hover .stat-value:where(.svelte-l1lb8j){filter:brightness(1.2)}.stat-value.danger.svelte-l1lb8j{color:var(--ai-error)}.stat-label.svelte-l1lb8j{font-size:11px;color:var(--ai-text-muted);margin-top:2px}.section-title.svelte-l1lb8j{font-size:12px;font-weight:600;color:var(--ai-text-secondary);margin-bottom:8px;position:relative;padding-bottom:6px}.section-title.svelte-l1lb8j:after{content:"";position:absolute;bottom:0;left:0;width:40px;height:2px;background:linear-gradient(90deg,var(--ai-primary),transparent);border-radius:1px;transform:scaleX(0);transform-origin:left;animation:svelte-l1lb8j-titleLineExpand .4s cubic-bezier(.2,.98,.28,1) .35s both}@keyframes svelte-l1lb8j-titleLineExpand{0%{transform:scaleX(0)}to{transform:scaleX(1)}}.folder-breakdown.svelte-l1lb8j{max-height:200px;overflow-y:auto;mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);padding-top:4px;padding-bottom:4px}.folder-row.svelte-l1lb8j{display:flex;justify-content:space-between;padding:4px;border-bottom:1px solid var(--ai-border-lighter);font-size:11px;border-radius:4px;transition:background .2s ease,transform .2s ease}.folder-row.svelte-l1lb8j:hover{background:var(--ai-bg-hover);transform:translate(2px);box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.1),0 0 6px rgba(var(--ai-primary-rgb),.06)}.folder-name.svelte-l1lb8j{color:var(--ai-text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px}.folder-count.svelte-l1lb8j{color:var(--ai-text-muted);white-space:nowrap}@media(prefers-reduced-motion:reduce){.stat-card.svelte-l1lb8j{transition:none;animation:none;opacity:1}.stat-value.svelte-l1lb8j,.folder-row.svelte-l1lb8j{transition:none}.folder-row.svelte-l1lb8j:hover{transform:none}.section-title.svelte-l1lb8j:after{animation:none;transform:scaleX(1)}}.selector-content.svelte-184y11r{padding:12px 20px 16px}.toolbar.svelte-184y11r{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.toggle-all.svelte-184y11r{display:flex;align-items:center;gap:6px;background:none;border:1.5px solid var(--ai-border);border-radius:8px;padding:6px 12px;font-size:12px;color:var(--ai-text-secondary);cursor:pointer;transition:all .2s ease}.toggle-all.svelte-184y11r:hover{border-color:var(--ai-primary-light);background:var(--ai-bg-tertiary)}.toggle-all.svelte-184y11r:active{transform:scale(.95);box-shadow:0 0 0 3px rgba(var(--ai-primary-rgb),.15)}.toggle-all.svelte-184y11r svg{transition:transform .25s cubic-bezier(.2,.98,.28,1)}.toggle-all.svelte-184y11r:active svg{transform:rotate(15deg)}.count.svelte-184y11r{font-size:12px;color:var(--ai-text-muted);display:inline-block;animation:svelte-184y11r-countPop .4s cubic-bezier(.22,1.42,.29,1) .2s both}@keyframes svelte-184y11r-countPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.1)}to{transform:scale(1);opacity:1}}.folder-list.svelte-184y11r{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black 12px,black calc(100% - 12px),transparent 100%);padding-top:4px;padding-bottom:4px}.folder-info.svelte-184y11r{flex:1}.bfao-selectable-item{transition:transform .2s cubic-bezier(.2,1.04,.42,1),box-shadow .2s ease!important}.bfao-selectable-item:hover:not(.selected){box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.15),0 0 8px rgba(var(--ai-primary-rgb),.08)}.bfao-selectable-item.selected{transform:translate(2px);box-shadow:inset 3px 0 0 var(--ai-primary)}.folder-title.svelte-184y11r{font-size:13px;font-weight:600;color:var(--ai-text);transition:color .2s ease}.bfao-selectable-item.selected .folder-title.svelte-184y11r{color:var(--ai-primary)}.folder-count.svelte-184y11r{font-size:11px;color:var(--ai-text-muted);margin-top:2px}.video-item.svelte-9tq2cj{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:8px;background:var(--ai-bg-secondary);font-size:12px;height:60px;border-left:2px solid transparent;transition:transform .2s ease,box-shadow .2s ease,background .2s ease,border-color .25s ease}.video-item.svelte-9tq2cj:hover{transform:translateY(-1px);box-shadow:0 2px 8px #00000014;background:var(--ai-bg-tertiary);border-left-color:var(--ai-primary)}.video-item.virtual-item.svelte-9tq2cj{position:absolute;left:0;right:0}.video-thumb-wrap.svelte-9tq2cj{position:relative;width:80px;height:45px;flex-shrink:0;border-radius:6px;overflow:hidden;background:var(--ai-bg-tertiary)}.video-thumb.svelte-9tq2cj{width:100%;height:100%;object-fit:cover;cursor:zoom-in;transition:filter .2s ease,transform .25s cubic-bezier(.2,.98,.28,1)}.video-thumb-wrap.svelte-9tq2cj:hover .video-thumb:where(.svelte-9tq2cj){filter:brightness(1.1);transform:scale(1.05)}.video-thumb-placeholder.svelte-9tq2cj{width:100%;height:100%;background:linear-gradient(90deg,var(--ai-bg-tertiary) 25%,var(--ai-border-lighter) 50%,var(--ai-bg-tertiary) 75%);background-size:200% 100%;animation:svelte-9tq2cj-placeholderShimmer 1.8s ease-in-out infinite}.video-duration.svelte-9tq2cj{position:absolute;bottom:2px;right:2px;font-size:10px;background:#000000b3;color:#fff;padding:1px 4px;border-radius:3px;line-height:1.2;transition:transform .2s cubic-bezier(.2,1.04,.42,1),background .2s ease}.video-item.svelte-9tq2cj:hover .video-duration:where(.svelte-9tq2cj){transform:scale(1.08);background:#000000d9}.video-info.svelte-9tq2cj{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.video-title.svelte-9tq2cj{color:var(--ai-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px}.video-uploader.svelte-9tq2cj{font-size:11px;color:var(--ai-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity .2s ease,transform .2s ease;opacity:.7}.video-item.svelte-9tq2cj:hover .video-uploader:where(.svelte-9tq2cj){opacity:1;transform:translate(2px)}.conf.svelte-9tq2cj{font-size:10px;font-weight:600;color:var(--ai-success-dark);background:var(--ai-success-bg);padding:1px 6px;border-radius:6px;white-space:nowrap;flex-shrink:0;animation:svelte-9tq2cj-confPop .35s cubic-bezier(.2,1.2,.4,1) both}.conf.low.svelte-9tq2cj{color:var(--ai-warning-dark);background:var(--ai-warning-bg);animation:svelte-9tq2cj-confLowPulse 2s ease-in-out infinite}.video-item.stagger-reveal.svelte-9tq2cj{animation:svelte-9tq2cj-itemReveal .3s cubic-bezier(.2,.98,.28,1) both}@keyframes svelte-9tq2cj-confLowPulse{0%,to{opacity:1;box-shadow:none}50%{opacity:.8;box-shadow:0 0 0 2px var(--ai-warning-bg)}}@keyframes svelte-9tq2cj-itemReveal{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes svelte-9tq2cj-confPop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.12)}to{transform:scale(1);opacity:1}}@keyframes svelte-9tq2cj-placeholderShimmer{0%{background-position:200% 0}to{background-position:-200% 0}}@media(prefers-reduced-motion:reduce){.video-item.svelte-9tq2cj{transition:none}.video-thumb.svelte-9tq2cj{transition:filter .15s}.video-item.stagger-reveal.svelte-9tq2cj,.conf.svelte-9tq2cj,.conf.low.svelte-9tq2cj,.video-thumb-placeholder.svelte-9tq2cj{animation:none}}.category-group.svelte-t28wkk{border:1.5px solid rgba(var(--ai-primary-rgb),.25);border-radius:10px;overflow:hidden;background:var(--ai-bg);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}.category-group.svelte-t28wkk:hover{transform:translateY(-1px);border-color:rgba(var(--ai-primary-rgb),.45);box-shadow:0 4px 16px rgba(var(--ai-primary-rgb),.1),0 4px 12px #00000014}.category-group.merge-source.svelte-t28wkk{border-color:var(--ai-primary);background:var(--ai-bg-tertiary);animation:svelte-t28wkk-mergeSourcePulse 2s ease-in-out infinite;box-shadow:none}.category-header.svelte-t28wkk{width:100%;display:flex;align-items:center;gap:8px;padding:10px 14px;min-height:44px;background:none;border:none;text-align:left;box-sizing:border-box}.category-header.svelte-t28wkk:hover{background:var(--ai-bg-tertiary)}.category-header.svelte-t28wkk input[type=checkbox]:where(.svelte-t28wkk){width:16px;height:16px;accent-color:var(--ai-primary);cursor:pointer;flex-shrink:0}.expand-btn.svelte-t28wkk{display:flex;color:var(--ai-text-muted);background:none;border:none;cursor:pointer;padding:2px;flex-shrink:0;border-radius:4px;transition:transform .25s ease,color .2s,box-shadow .25s ease}.expand-btn.svelte-t28wkk:hover{box-shadow:0 0 0 3px rgba(var(--ai-primary-rgb),.12)}.expand-btn.expanded.svelte-t28wkk{transform:rotate(90deg);color:var(--ai-primary)}.category-name.svelte-t28wkk{flex:1;font-size:13px;font-weight:600;color:var(--ai-text);cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .25s ease}.category-header.svelte-t28wkk:hover .category-name:where(.svelte-t28wkk){color:var(--ai-primary)}.badge.svelte-t28wkk{font-size:10px;padding:1px 6px;border-radius:6px;font-weight:600;flex-shrink:0;animation:svelte-t28wkk-badgePop .35s cubic-bezier(.2,1.2,.4,1) both}.badge-existing.svelte-t28wkk{background:var(--ai-success-bg);color:var(--ai-success-dark)}.badge-new.svelte-t28wkk{background:var(--ai-error-bg, rgba(239, 68, 68, .1));color:var(--ai-error, #ef4444)}.conf-avg.svelte-t28wkk{font-size:10px;font-weight:600;color:var(--ai-success-dark);flex-shrink:0}.conf-avg.low.svelte-t28wkk{color:var(--ai-warning-dark);animation:svelte-t28wkk-confAvgPulse 2s ease-in-out infinite}.category-count.svelte-t28wkk{font-size:11px;color:var(--ai-text-muted);background:var(--ai-bg-secondary);padding:2px 8px;border-radius:8px;flex-shrink:0;transition:transform .25s cubic-bezier(.2,1.04,.42,1),background .25s ease,color .25s ease}.category-header.svelte-t28wkk:hover .category-count:where(.svelte-t28wkk){transform:scale(1.05);background:rgba(var(--ai-primary-rgb),.1);color:var(--ai-primary)}.remove-btn.svelte-t28wkk{display:flex;align-items:center;gap:3px;padding:3px 8px;font-size:10px;font-weight:600;border-radius:6px;border:1px solid var(--ai-border);background:var(--ai-bg-secondary);color:var(--ai-text-muted);cursor:pointer;flex-shrink:0;transition:all .2s}.remove-btn.svelte-t28wkk:hover{border-color:var(--ai-error, #ef4444);color:var(--ai-error, #ef4444);background:var(--ai-error-bg, rgba(239, 68, 68, .1));animation:svelte-t28wkk-removeShake .4s ease-in-out}.video-list.svelte-t28wkk{padding:0 12px 10px;display:flex;flex-direction:column;gap:4px;max-height:408px;overflow-y:auto;mask-image:linear-gradient(to bottom,transparent 0%,black 12px,black calc(100% - 12px),transparent 100%);-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 12px,black calc(100% - 12px),transparent 100%)}.video-list.virtual-scroll.svelte-t28wkk{overflow-y:auto;position:relative;display:block}.virtual-spacer.svelte-t28wkk{position:relative}@keyframes svelte-t28wkk-badgePop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}@keyframes svelte-t28wkk-mergeSourcePulse{0%,to{border-color:var(--ai-primary);box-shadow:0 0 0 0 var(--ai-primary-shadow)}50%{border-color:var(--ai-gradient-accent);box-shadow:0 0 0 4px var(--ai-primary-shadow)}}@keyframes svelte-t28wkk-removeShake{0%,to{transform:translate(0)}20%{transform:translate(-2px)}40%{transform:translate(2px)}60%{transform:translate(-1.5px)}80%{transform:translate(1px)}}@keyframes svelte-t28wkk-confAvgPulse{0%,to{opacity:1}50%{opacity:.6}}@media(prefers-reduced-motion:reduce){.category-group.svelte-t28wkk,.expand-btn.svelte-t28wkk{transition:none}.conf-avg.low.svelte-t28wkk{animation:none}}.preview-toolbar.svelte-1wb2xl2{padding:10px 20px 12px;border-bottom:1px solid var(--ai-border-light)}.preview-stats.svelte-1wb2xl2{font-size:13px;font-weight:700;margin-bottom:8px}.preview-stats.svelte-1wb2xl2 strong:where(.svelte-1wb2xl2){color:var(--ai-primary);display:inline-block;transition:transform .25s cubic-bezier(.2,1.04,.42,1),color .2s}.search-wrap.svelte-1wb2xl2{position:relative;margin-bottom:8px}.search-wrap.svelte-1wb2xl2 .search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--ai-text-muted);pointer-events:none}.search-input.svelte-1wb2xl2{width:100%;padding:7px 10px 7px 30px;border-radius:8px;border:1.5px solid var(--ai-border);background:var(--ai-bg-secondary);color:var(--ai-text);font-size:12px;outline:none;box-sizing:border-box;transition:border-color .2s,box-shadow .3s cubic-bezier(.2,1,.4,1)}.search-input.svelte-1wb2xl2:focus{border-color:var(--ai-primary);box-shadow:0 0 0 3px var(--ai-primary-shadow)}.filter-row.svelte-1wb2xl2{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2){animation:svelte-1wb2xl2-filterSlideIn .3s cubic-bezier(.2,.98,.28,1) both}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2):nth-child(1){animation-delay:0s}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2):nth-child(2){animation-delay:.04s}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2):nth-child(3){animation-delay:.08s}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2):nth-child(4){animation-delay:.12s}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2):nth-child(5){animation-delay:.16s}.filter-btn.svelte-1wb2xl2{padding:4px 10px;font-size:11px;font-weight:600;border-radius:6px;border:1.5px solid var(--ai-border);background:var(--ai-border-lighter);color:var(--ai-text-muted);cursor:pointer;display:flex;align-items:center;gap:3px;transition:all .25s cubic-bezier(.2,1,.4,1)}.filter-btn.svelte-1wb2xl2:hover{border-color:var(--ai-primary-light);transform:translateY(-1px);box-shadow:inset 0 0 0 1px rgba(var(--ai-primary-rgb),.15),0 2px 6px #0000000f}.filter-btn.active.svelte-1wb2xl2{background:linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent));color:#fff;border-color:transparent;transform:scale(1.05);box-shadow:0 2px 8px var(--ai-primary-shadow);position:relative;animation:svelte-1wb2xl2-filterActivate .35s cubic-bezier(.2,1.04,.42,1)}.merge-btn.active.svelte-1wb2xl2 svg{transform:rotate(180deg);transition:transform .35s cubic-bezier(.2,1.04,.42,1)}.merge-btn.svelte-1wb2xl2 svg{transition:transform .35s cubic-bezier(.2,1.04,.42,1)}.filter-btn.active.svelte-1wb2xl2:after{content:"";position:absolute;bottom:-1px;left:15%;width:70%;height:2px;background:#fff;border-radius:1px;animation:svelte-1wb2xl2-tabUnderline .3s cubic-bezier(.2,.98,.28,1) both}.search-wrap.svelte-1wb2xl2 .search-icon{transition:color .25s ease,opacity .25s ease}.search-wrap.svelte-1wb2xl2:has(.search-input:where(.svelte-1wb2xl2):not(:placeholder-shown)) .search-icon{color:var(--ai-primary);opacity:1}.filter-count.svelte-1wb2xl2{font-size:11px;color:var(--ai-text-muted);animation:svelte-1wb2xl2-countPop .4s cubic-bezier(.2,1.2,.4,1) both}@keyframes svelte-1wb2xl2-tabUnderline{0%{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes svelte-1wb2xl2-countPop{0%{transform:scale(.8);opacity:0}70%{transform:scale(1.08)}to{transform:scale(1);opacity:1}}@keyframes svelte-1wb2xl2-filterActivate{0%{box-shadow:0 0 rgba(var(--ai-primary-rgb),.4)}50%{box-shadow:0 0 0 6px rgba(var(--ai-primary-rgb),.1)}to{box-shadow:0 2px 8px var(--ai-primary-shadow)}}@keyframes svelte-1wb2xl2-filterSlideIn{0%{opacity:0;transform:translateY(6px) scale(.92)}to{opacity:1;transform:translateY(0) scale(1)}}@media(prefers-reduced-motion:reduce){.filter-btn.active.svelte-1wb2xl2:after{animation:none}.filter-btn.active.svelte-1wb2xl2,.filter-count.svelte-1wb2xl2{animation:none}.filter-row.svelte-1wb2xl2 .filter-btn:where(.svelte-1wb2xl2){animation:none}}.lightbox-overlay.svelte-10n7vm8{position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483645;background:#000000d9;display:flex;align-items:center;justify-content:center;cursor:zoom-out;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);animation:svelte-10n7vm8-lightboxIn .25s ease both}.lightbox-img.svelte-10n7vm8{max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 20px 60px #00000080;animation:svelte-10n7vm8-lightboxZoom .3s cubic-bezier(.2,.98,.28,1) both}@keyframes svelte-10n7vm8-lightboxIn{0%{opacity:0}to{opacity:1}}@keyframes svelte-10n7vm8-lightboxZoom{0%{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}.preview-content.svelte-10n7vm8{padding:8px 20px 12px}.category-list.svelte-10n7vm8{display:flex;flex-direction:column;gap:10px;overflow-y:auto}.footer-custom.svelte-10n7vm8{display:flex;justify-content:space-between;align-items:center;width:100%;gap:12px}.footer-custom.svelte-10n7vm8 .modal-btn.confirm:where(.svelte-10n7vm8){flex:1;padding:11px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,var(--ai-success-dark),var(--ai-success),var(--ai-success-light));color:#fff;transition:all .35s cubic-bezier(.2,1.04,.42,1);display:flex;align-items:center;justify-content:center}.footer-custom.svelte-10n7vm8 .modal-btn.confirm:where(.svelte-10n7vm8):hover{transform:translateY(-2px) scale(1.015);box-shadow:0 10px 28px var(--ai-success-bg),0 0 0 3px #10b98126}.footer-custom.svelte-10n7vm8 .modal-btn.confirm:where(.svelte-10n7vm8):disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}.footer-icons.svelte-10n7vm8{display:flex;gap:6px;flex-shrink:0}.icon-btn.svelte-10n7vm8{width:32px;height:32px;border-radius:8px;border:none;background:var(--ai-border-lighter);color:var(--ai-text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease}.icon-btn.svelte-10n7vm8:hover{background:var(--ai-bg-tertiary);color:var(--ai-text);transform:translateY(-2px);box-shadow:0 4px 12px #00000014}.bfao-modal-empty.svelte-10n7vm8{animation:svelte-10n7vm8-emptyFloat 3s ease-in-out infinite}@keyframes svelte-10n7vm8-emptyFloat{0%,to{transform:translateY(0)}50%{transform:translateY(-4px)}}.help-body.svelte-1lxq9cp{padding:0;max-height:60vh;overflow-y:auto}.faq-item.svelte-1lxq9cp{width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 20px;border:none;border-bottom:1px solid var(--ai-border-light);border-left:3px solid transparent;background:none;cursor:pointer;transition:background .2s,padding-left .2s ease,border-left-color .2s ease;text-align:left}.faq-item.svelte-1lxq9cp:hover{background:var(--ai-bg-tertiary);padding-left:24px}.faq-item.open.svelte-1lxq9cp{border-left-color:var(--ai-primary);background:var(--ai-bg-secondary);padding-left:24px}.faq-q.svelte-1lxq9cp{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:500;color:var(--ai-text)}.faq-icon.svelte-1lxq9cp{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:var(--ai-error-bg, rgba(239, 68, 68, .1));color:var(--ai-error, #ef4444);font-size:12px;font-weight:700;flex-shrink:0;transition:transform .2s ease}.faq-item.svelte-1lxq9cp:hover .faq-icon:where(.svelte-1lxq9cp):not(.pulse){transform:rotate(15deg) scale(1.1)}.faq-item.svelte-1lxq9cp .faq-chevron{color:var(--ai-text-muted);transition:transform .2s;flex-shrink:0}.faq-item.open.svelte-1lxq9cp .faq-chevron{transform:rotate(90deg)}.faq-a.svelte-1lxq9cp{padding:6px 20px 10px 50px;font-size:12px;line-height:1.6;color:var(--ai-text-secondary);background:var(--ai-bg-secondary);box-sizing:border-box}.faq-icon.pulse.svelte-1lxq9cp{animation:svelte-1lxq9cp-iconPulse 1.5s ease-in-out infinite}@keyframes svelte-1lxq9cp-iconPulse{0%,to{box-shadow:0 0 #ef44444d}50%{box-shadow:0 0 0 5px #ef444400}}.help-footer.svelte-1lxq9cp{padding:12px 20px;font-size:11px;color:var(--ai-text-muted);text-align:center;animation:svelte-1lxq9cp-footerFadeIn .4s ease .6s both}@keyframes svelte-1lxq9cp-footerFadeIn{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.help-footer.svelte-1lxq9cp{animation:none;opacity:1}.faq-icon.pulse.svelte-1lxq9cp{animation:none}.faq-item.svelte-1lxq9cp{transition:background .2s}.faq-item.svelte-1lxq9cp:hover{padding-left:20px}.faq-icon.svelte-1lxq9cp{transition:none}.faq-item.svelte-1lxq9cp:hover .faq-icon:where(.svelte-1lxq9cp):not(.pulse){transform:none}}.panel.svelte-6jyhgm{position:fixed;bottom:30px;left:30px;z-index:2147483641;width:min(400px,calc(100vw - 60px));display:flex;flex-direction:column;background:var(--ai-bg);color:var(--ai-text);box-shadow:var(--ai-shadow-lg);border-radius:28px;overflow:visible;will-change:transform,opacity;-webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2)}.panel.svelte-6jyhgm:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:inherit;background:radial-gradient(ellipse at 30% 20%,rgba(var(--ai-primary-rgb, 115, 100, 255),.06) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(155,89,246,.04) 0%,transparent 50%);transform:translateY(var(--parallax-y, 0px));pointer-events:none;z-index:0;will-change:transform}.panel-content.svelte-6jyhgm{position:relative;z-index:1;flex:1 1 0%;min-height:0;max-height:60vh;overflow-y:auto;overflow-x:hidden;border-bottom-left-radius:26px;border-bottom-right-radius:26px;background:radial-gradient(circle at var(--glow-x, -100px) var(--glow-y, -100px),rgba(var(--ai-primary-rgb, 115, 100, 255),.04) 0%,transparent 50%)}.panel.svelte-6jyhgm .gsap-draggable{cursor:default}.scroll-indicator.svelte-6jyhgm{position:sticky;top:0;height:2px;min-height:2px;background:linear-gradient(90deg,var(--ai-primary),var(--ai-gradient-accent));border-radius:0 1px 1px 0;z-index:3;opacity:0;transition:opacity .3s ease,width .1s linear;pointer-events:none;margin-bottom:-2px}.scroll-indicator.visible.svelte-6jyhgm{opacity:1}.settings-wrapper.svelte-6jyhgm{will-change:transform,opacity}.main-area.svelte-6jyhgm{padding:0 15px 15px}.nebula-drift.svelte-6jyhgm{position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none;overflow:hidden;border-radius:inherit;z-index:0}.nebula-particle.svelte-6jyhgm{position:absolute;width:calc(3px + var(--i) * .5px);height:calc(3px + var(--i) * .5px);border-radius:50%;background:rgba(var(--ai-primary-rgb, 115, 100, 255),.12);box-shadow:0 0 6px rgba(var(--ai-primary-rgb, 115, 100, 255),.08);left:calc(10% + var(--i) * 10%);top:calc(15% + var(--i) * 8%);animation:svelte-6jyhgm-nebula-float calc(12s + var(--i) * 3s) ease-in-out calc(var(--i) * -2s) infinite alternate;opacity:.4}@keyframes svelte-6jyhgm-nebula-float{0%{transform:translate(0) scale(1)}33%{transform:translate(calc(8px - var(--i) * 2px),calc(-12px + var(--i) * 1.5px)) scale(1.1)}66%{transform:translate(calc(-6px + var(--i) * 1px),calc(8px - var(--i) * 1px)) scale(.9)}to{transform:translate(calc(4px - var(--i) * .5px),calc(-6px + var(--i) * .8px)) scale(1.05)}}@media(prefers-reduced-motion:reduce){.nebula-particle.svelte-6jyhgm{animation:none}.scroll-indicator.svelte-6jyhgm{transition:none}}.toast-container.svelte-1ig2a9j{position:fixed;top:20px;right:20px;display:flex;flex-direction:column;gap:8px;pointer-events:none}.toast.svelte-1ig2a9j{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:14px;font-size:13px;font-weight:500;cursor:pointer;-webkit-backdrop-filter:blur(12px) saturate(1.3);backdrop-filter:blur(12px) saturate(1.3);border:1px solid rgba(255,255,255,.15);box-shadow:0 8px 32px #0000001f,0 2px 8px #0000000f;position:relative;overflow:hidden;max-width:340px;will-change:transform,opacity;transition:box-shadow .2s ease}.toast.svelte-1ig2a9j:hover{box-shadow:0 12px 40px #0000002e,0 4px 12px #0000001a}.toast-success.svelte-1ig2a9j{background:rgba(var(--ai-success-rgb),.9);color:#fff}.toast-error.svelte-1ig2a9j{background:rgba(var(--ai-error-alt-rgb),.9);color:#fff}.toast-warning.svelte-1ig2a9j{background:rgba(var(--ai-warning-rgb),.9);color:#fff}.toast-info.svelte-1ig2a9j{background:rgba(var(--ai-primary-rgb),.9);color:#fff}.toast-icon.svelte-1ig2a9j{font-size:14px;flex-shrink:0;display:inline-block}.toast-success.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j){animation:svelte-1ig2a9j-toastIconBounce .5s cubic-bezier(.2,1,.4,1) .3s both}.toast-error.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j){animation:svelte-1ig2a9j-toastIconShake .4s ease .3s both}.toast-warning.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j){animation:svelte-1ig2a9j-toastIconWobble .5s ease .3s both}.toast-msg.svelte-1ig2a9j{flex:1;min-width:0;line-height:1.4}.toast-timer.svelte-1ig2a9j{position:absolute;bottom:0;left:0;height:2px;background:#ffffff80;animation:svelte-1ig2a9j-toast-timer linear forwards;border-radius:0 0 14px 14px}@keyframes svelte-1ig2a9j-toast-timer{0%{width:100%}to{width:0%}}@keyframes svelte-1ig2a9j-toastIconBounce{0%{transform:scale(0)}60%{transform:scale(1.3)}to{transform:scale(1)}}@keyframes svelte-1ig2a9j-toastIconShake{0%,to{transform:translate(0)}20%{transform:translate(-3px)}40%{transform:translate(3px)}60%{transform:translate(-2px)}80%{transform:translate(2px)}}@keyframes svelte-1ig2a9j-toastIconWobble{0%,to{transform:rotate(0)}25%{transform:rotate(-12deg)}50%{transform:rotate(8deg)}75%{transform:rotate(-4deg)}}@media(prefers-reduced-motion:reduce){.toast.svelte-1ig2a9j{transition:none}.toast.svelte-1ig2a9j:hover{box-shadow:0 8px 32px #0000001f,0 2px 8px #0000000f}.toast-success.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j),.toast-error.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j),.toast-warning.svelte-1ig2a9j .toast-icon:where(.svelte-1ig2a9j){animation:none}}.bfao-app.svelte-1n46o8q{all:initial;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:2147483640}.bfao-app.svelte-1n46o8q *{pointer-events:auto}.cursor-spotlight.svelte-1n46o8q{position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(var(--ai-primary-rgb, 115, 100, 255),.12) 0%,rgba(var(--ai-primary-rgb, 115, 100, 255),.05) 30%,transparent 65%);pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .3s ease;z-index:2147483647;will-change:left,top} ');

  var __defProp = Object.defineProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
  var _a, _commit_callbacks, _discard_callbacks, _pending, _blocking_pending, _deferred, _roots, _new_effects, _dirty_effects, _maybe_dirty_effects, _skipped_branches, _decrement_queued, _blockers, _Batch_instances, is_deferred_fn, is_blocked_fn, process_fn, traverse_fn, defer_effects_fn, commit_fn, _anchor, _hydrate_open, _props, _children, _effect, _main_effect, _pending_effect, _failed_effect, _offscreen_fragment, _local_pending_count, _pending_count, _pending_count_update_queued, _dirty_effects2, _maybe_dirty_effects2, _effect_pending, _effect_pending_subscriber, _Boundary_instances, render_fn, resolve_fn, run_fn, update_pending_count_fn, _b, _batches, _onscreen, _offscreen, _outroing, _transition, _commit, _discard, _c;
  const DEV = false;
  var is_array = Array.isArray;
  var index_of = Array.prototype.indexOf;
  var includes = Array.prototype.includes;
  var array_from = Array.from;
  var define_property = Object.defineProperty;
  var get_descriptor = Object.getOwnPropertyDescriptor;
  var get_descriptors = Object.getOwnPropertyDescriptors;
  var object_prototype = Object.prototype;
  var array_prototype = Array.prototype;
  var get_prototype_of = Object.getPrototypeOf;
  var is_extensible = Object.isExtensible;
  function is_function(thing) {
    return typeof thing === "function";
  }
  const noop = () => {
  };
  function run(fn) {
    return fn();
  }
  function run_all(arr) {
    for (var i = 0; i < arr.length; i++) {
      arr[i]();
    }
  }
  function deferred() {
    var resolve;
    var reject;
    var promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
  function to_array(value, n) {
    if (Array.isArray(value)) {
      return value;
    }
    if (!(Symbol.iterator in value)) {
      return Array.from(value);
    }
    const array = [];
    for (const element2 of value) {
      array.push(element2);
      if (array.length === n) break;
    }
    return array;
  }
  const DERIVED = 1 << 1;
  const EFFECT = 1 << 2;
  const RENDER_EFFECT = 1 << 3;
  const MANAGED_EFFECT = 1 << 24;
  const BLOCK_EFFECT = 1 << 4;
  const BRANCH_EFFECT = 1 << 5;
  const ROOT_EFFECT = 1 << 6;
  const BOUNDARY_EFFECT = 1 << 7;
  const CONNECTED = 1 << 9;
  const CLEAN = 1 << 10;
  const DIRTY = 1 << 11;
  const MAYBE_DIRTY = 1 << 12;
  const INERT = 1 << 13;
  const DESTROYED = 1 << 14;
  const REACTION_RAN = 1 << 15;
  const DESTROYING = 1 << 25;
  const EFFECT_TRANSPARENT = 1 << 16;
  const EAGER_EFFECT = 1 << 17;
  const HEAD_EFFECT = 1 << 18;
  const EFFECT_PRESERVED = 1 << 19;
  const USER_EFFECT = 1 << 20;
  const EFFECT_OFFSCREEN = 1 << 25;
  const WAS_MARKED = 1 << 16;
  const REACTION_IS_UPDATING = 1 << 21;
  const ASYNC = 1 << 22;
  const ERROR_VALUE = 1 << 23;
  const STATE_SYMBOL = Symbol("$state");
  const LEGACY_PROPS = Symbol("legacy props");
  const LOADING_ATTR_SYMBOL = Symbol("");
  const STALE_REACTION = new class StaleReactionError extends Error {
    constructor() {
      super(...arguments);
      __publicField(this, "name", "StaleReactionError");
      __publicField(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
    }
  }();
  const IS_XHTML = (
!!((_a = globalThis.document) == null ? void 0 : _a.contentType) && globalThis.document.contentType.includes("xml")
  );
  function lifecycle_outside_component(name) {
    {
      throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
    }
  }
  function async_derived_orphan() {
    {
      throw new Error(`https://svelte.dev/e/async_derived_orphan`);
    }
  }
  function each_key_duplicate(a, b, value) {
    {
      throw new Error(`https://svelte.dev/e/each_key_duplicate`);
    }
  }
  function effect_in_teardown(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_in_teardown`);
    }
  }
  function effect_in_unowned_derived() {
    {
      throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
    }
  }
  function effect_orphan(rune) {
    {
      throw new Error(`https://svelte.dev/e/effect_orphan`);
    }
  }
  function effect_update_depth_exceeded() {
    {
      throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
    }
  }
  function props_invalid_value(key) {
    {
      throw new Error(`https://svelte.dev/e/props_invalid_value`);
    }
  }
  function state_descriptors_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
    }
  }
  function state_prototype_fixed() {
    {
      throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
    }
  }
  function state_unsafe_mutation() {
    {
      throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
    }
  }
  function svelte_boundary_reset_onerror() {
    {
      throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
    }
  }
  const EACH_ITEM_REACTIVE = 1;
  const EACH_INDEX_REACTIVE = 1 << 1;
  const EACH_IS_CONTROLLED = 1 << 2;
  const EACH_IS_ANIMATED = 1 << 3;
  const EACH_ITEM_IMMUTABLE = 1 << 4;
  const PROPS_IS_IMMUTABLE = 1;
  const PROPS_IS_RUNES = 1 << 1;
  const PROPS_IS_UPDATED = 1 << 2;
  const PROPS_IS_BINDABLE = 1 << 3;
  const PROPS_IS_LAZY_INITIAL = 1 << 4;
  const TEMPLATE_FRAGMENT = 1;
  const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
  const UNINITIALIZED = Symbol();
  const NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
  const NAMESPACE_SVG = "http://www.w3.org/2000/svg";
  const ATTACHMENT_KEY = "@attach";
  function select_multiple_invalid_value() {
    {
      console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
    }
  }
  function svelte_boundary_reset_noop() {
    {
      console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
    }
  }
  function equals(value) {
    return value === this.v;
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
  }
  function safe_equals(value) {
    return !safe_not_equal(value, this.v);
  }
  let legacy_mode_flag = false;
  let tracing_mode_flag = false;
  function enable_legacy_mode_flag() {
    legacy_mode_flag = true;
  }
  let component_context = null;
  function set_component_context(context) {
    component_context = context;
  }
  function push(props, runes = false, fn) {
    component_context = {
      p: component_context,
      i: false,
      c: null,
      e: null,
      s: props,
      x: null,
      r: (
active_effect
      ),
      l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
    };
  }
  function pop(component2) {
    var context = (
component_context
    );
    var effects = context.e;
    if (effects !== null) {
      context.e = null;
      for (var fn of effects) {
        create_user_effect(fn);
      }
    }
    if (component2 !== void 0) {
      context.x = component2;
    }
    context.i = true;
    component_context = context.p;
    return component2 ??
{};
  }
  function is_runes() {
    return !legacy_mode_flag || component_context !== null && component_context.l === null;
  }
  let micro_tasks = [];
  function run_micro_tasks() {
    var tasks = micro_tasks;
    micro_tasks = [];
    run_all(tasks);
  }
  function queue_micro_task(fn) {
    if (micro_tasks.length === 0 && !is_flushing_sync) {
      var tasks = micro_tasks;
      queueMicrotask(() => {
        if (tasks === micro_tasks) run_micro_tasks();
      });
    }
    micro_tasks.push(fn);
  }
  function flush_tasks() {
    while (micro_tasks.length > 0) {
      run_micro_tasks();
    }
  }
  function handle_error(error) {
    var effect2 = active_effect;
    if (effect2 === null) {
      active_reaction.f |= ERROR_VALUE;
      return error;
    }
    if ((effect2.f & REACTION_RAN) === 0 && (effect2.f & EFFECT) === 0) {
      throw error;
    }
    invoke_error_boundary(error, effect2);
  }
  function invoke_error_boundary(error, effect2) {
    while (effect2 !== null) {
      if ((effect2.f & BOUNDARY_EFFECT) !== 0) {
        if ((effect2.f & REACTION_RAN) === 0) {
          throw error;
        }
        try {
          effect2.b.error(error);
          return;
        } catch (e) {
          error = e;
        }
      }
      effect2 = effect2.parent;
    }
    throw error;
  }
  const STATUS_MASK = -7169;
  function set_signal_status(signal, status) {
    signal.f = signal.f & STATUS_MASK | status;
  }
  function update_derived_status(derived2) {
    if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) {
      set_signal_status(derived2, CLEAN);
    } else {
      set_signal_status(derived2, MAYBE_DIRTY);
    }
  }
  function clear_marked(deps) {
    if (deps === null) return;
    for (const dep of deps) {
      if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
        continue;
      }
      dep.f ^= WAS_MARKED;
      clear_marked(
dep.deps
      );
    }
  }
  function defer_effect(effect2, dirty_effects, maybe_dirty_effects) {
    if ((effect2.f & DIRTY) !== 0) {
      dirty_effects.add(effect2);
    } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
      maybe_dirty_effects.add(effect2);
    }
    clear_marked(effect2.deps);
    set_signal_status(effect2, CLEAN);
  }
  function subscribe_to_store(store, run2, invalidate) {
    if (store == null) {
      run2(void 0);
      if (invalidate) invalidate(void 0);
      return noop;
    }
    const unsub = untrack(
      () => store.subscribe(
        run2,
invalidate
      )
    );
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  const subscriber_queue = [];
  function readable(value, start) {
    return {
      subscribe: writable(value, start).subscribe
    };
  }
  function writable(value, start = noop) {
    let stop = null;
    const subscribers = new Set();
    function set2(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set2(fn(
value
      ));
    }
    function subscribe(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set2, update2) || noop;
      }
      run2(
value
      );
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set: set2, update: update2, subscribe };
  }
  function derived$1(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single ? [stores] : stores;
    if (!stores_array.every(Boolean)) {
      throw new Error("derived() expects stores as input, got a falsy value");
    }
    const auto = fn.length < 2;
    return readable(initial_value, (set2, update2) => {
      let started = false;
      const values = [];
      let pending2 = 0;
      let cleanup = noop;
      const sync = () => {
        if (pending2) {
          return;
        }
        cleanup();
        const result = fn(single ? values[0] : values, set2, update2);
        if (auto) {
          set2(result);
        } else {
          cleanup = typeof result === "function" ? result : noop;
        }
      };
      const unsubscribers = stores_array.map(
        (store, i) => subscribe_to_store(
          store,
          (value) => {
            values[i] = value;
            pending2 &= ~(1 << i);
            if (started) {
              sync();
            }
          },
          () => {
            pending2 |= 1 << i;
          }
        )
      );
      started = true;
      sync();
      return function stop() {
        run_all(unsubscribers);
        cleanup();
        started = false;
      };
    });
  }
  function get$1(store) {
    let value;
    subscribe_to_store(store, (_) => value = _)();
    return value;
  }
  let is_store_binding = false;
  let IS_UNMOUNTED = Symbol();
  function store_get(store, store_name, stores) {
    const entry = stores[store_name] ?? (stores[store_name] = {
      store: null,
      source: mutable_source(void 0),
      unsubscribe: noop
    });
    if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
      entry.unsubscribe();
      entry.store = store ?? null;
      if (store == null) {
        entry.source.v = void 0;
        entry.unsubscribe = noop;
      } else {
        var is_synchronous_callback = true;
        entry.unsubscribe = subscribe_to_store(store, (v) => {
          if (is_synchronous_callback) {
            entry.source.v = v;
          } else {
            set(entry.source, v);
          }
        });
        is_synchronous_callback = false;
      }
    }
    if (store && IS_UNMOUNTED in stores) {
      return get$1(store);
    }
    return get(entry.source);
  }
  function setup_stores() {
    const stores = {};
    function cleanup() {
      teardown(() => {
        for (var store_name in stores) {
          const ref = stores[store_name];
          ref.unsubscribe();
        }
        define_property(stores, IS_UNMOUNTED, {
          enumerable: false,
          value: true
        });
      });
    }
    return [stores, cleanup];
  }
  function capture_store_binding(fn) {
    var previous_is_store_binding = is_store_binding;
    try {
      is_store_binding = false;
      return [fn(), is_store_binding];
    } finally {
      is_store_binding = previous_is_store_binding;
    }
  }
  const batches = new Set();
  let current_batch = null;
  let batch_values = null;
  let last_scheduled_effect = null;
  let is_flushing_sync = false;
  let is_processing = false;
  let collected_effects = null;
  let legacy_updates = null;
  var flush_count = 0;
  let uid = 1;
  const _Batch = class _Batch {
    constructor() {
      __privateAdd(this, _Batch_instances);
      __publicField(this, "id", uid++);
__publicField(this, "current", new Map());
__publicField(this, "previous", new Map());
__privateAdd(this, _commit_callbacks, new Set());
__privateAdd(this, _discard_callbacks, new Set());
__privateAdd(this, _pending, new Map());
__privateAdd(this, _blocking_pending, new Map());
__privateAdd(this, _deferred, null);
__privateAdd(this, _roots, []);
__privateAdd(this, _new_effects, []);
__privateAdd(this, _dirty_effects, new Set());
__privateAdd(this, _maybe_dirty_effects, new Set());
__privateAdd(this, _skipped_branches, new Map());
      __publicField(this, "is_fork", false);
      __privateAdd(this, _decrement_queued, false);
__privateAdd(this, _blockers, new Set());
    }
skip_effect(effect2) {
      if (!__privateGet(this, _skipped_branches).has(effect2)) {
        __privateGet(this, _skipped_branches).set(effect2, { d: [], m: [] });
      }
    }
unskip_effect(effect2) {
      var tracked = __privateGet(this, _skipped_branches).get(effect2);
      if (tracked) {
        __privateGet(this, _skipped_branches).delete(effect2);
        for (var e of tracked.d) {
          set_signal_status(e, DIRTY);
          this.schedule(e);
        }
        for (e of tracked.m) {
          set_signal_status(e, MAYBE_DIRTY);
          this.schedule(e);
        }
      }
    }
capture(source2, old_value, is_derived = false) {
      if (old_value !== UNINITIALIZED && !this.previous.has(source2)) {
        this.previous.set(source2, old_value);
      }
      if ((source2.f & ERROR_VALUE) === 0) {
        this.current.set(source2, [source2.v, is_derived]);
        batch_values == null ? void 0 : batch_values.set(source2, source2.v);
      }
    }
    activate() {
      current_batch = this;
    }
    deactivate() {
      current_batch = null;
      batch_values = null;
    }
    flush() {
      try {
        is_processing = true;
        current_batch = this;
        __privateMethod(this, _Batch_instances, process_fn).call(this);
      } finally {
        flush_count = 0;
        last_scheduled_effect = null;
        collected_effects = null;
        legacy_updates = null;
        is_processing = false;
        current_batch = null;
        batch_values = null;
        old_values.clear();
      }
    }
    discard() {
      for (const fn of __privateGet(this, _discard_callbacks)) fn(this);
      __privateGet(this, _discard_callbacks).clear();
      batches.delete(this);
    }
register_created_effect(effect2) {
      __privateGet(this, _new_effects).push(effect2);
    }
increment(blocking, effect2) {
      let pending_count = __privateGet(this, _pending).get(effect2) ?? 0;
      __privateGet(this, _pending).set(effect2, pending_count + 1);
      if (blocking) {
        let blocking_pending_count = __privateGet(this, _blocking_pending).get(effect2) ?? 0;
        __privateGet(this, _blocking_pending).set(effect2, blocking_pending_count + 1);
      }
    }
decrement(blocking, effect2, skip) {
      let pending_count = __privateGet(this, _pending).get(effect2) ?? 0;
      if (pending_count === 1) {
        __privateGet(this, _pending).delete(effect2);
      } else {
        __privateGet(this, _pending).set(effect2, pending_count - 1);
      }
      if (blocking) {
        let blocking_pending_count = __privateGet(this, _blocking_pending).get(effect2) ?? 0;
        if (blocking_pending_count === 1) {
          __privateGet(this, _blocking_pending).delete(effect2);
        } else {
          __privateGet(this, _blocking_pending).set(effect2, blocking_pending_count - 1);
        }
      }
      if (__privateGet(this, _decrement_queued) || skip) return;
      __privateSet(this, _decrement_queued, true);
      queue_micro_task(() => {
        __privateSet(this, _decrement_queued, false);
        this.flush();
      });
    }
transfer_effects(dirty_effects, maybe_dirty_effects) {
      for (const e of dirty_effects) {
        __privateGet(this, _dirty_effects).add(e);
      }
      for (const e of maybe_dirty_effects) {
        __privateGet(this, _maybe_dirty_effects).add(e);
      }
      dirty_effects.clear();
      maybe_dirty_effects.clear();
    }
oncommit(fn) {
      __privateGet(this, _commit_callbacks).add(fn);
    }
ondiscard(fn) {
      __privateGet(this, _discard_callbacks).add(fn);
    }
    settled() {
      return (__privateGet(this, _deferred) ?? __privateSet(this, _deferred, deferred())).promise;
    }
    static ensure() {
      if (current_batch === null) {
        const batch = current_batch = new _Batch();
        if (!is_processing) {
          batches.add(current_batch);
          if (!is_flushing_sync) {
            queue_micro_task(() => {
              if (current_batch !== batch) {
                return;
              }
              batch.flush();
            });
          }
        }
      }
      return current_batch;
    }
    apply() {
      {
        batch_values = null;
        return;
      }
    }
schedule(effect2) {
      var _a2;
      last_scheduled_effect = effect2;
      if (((_a2 = effect2.b) == null ? void 0 : _a2.is_pending) && (effect2.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (effect2.f & REACTION_RAN) === 0) {
        effect2.b.defer_effect(effect2);
        return;
      }
      var e = effect2;
      while (e.parent !== null) {
        e = e.parent;
        var flags2 = e.f;
        if (collected_effects !== null && e === active_effect) {
          if ((active_reaction === null || (active_reaction.f & DERIVED) === 0) && true) {
            return;
          }
        }
        if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
          if ((flags2 & CLEAN) === 0) {
            return;
          }
          e.f ^= CLEAN;
        }
      }
      __privateGet(this, _roots).push(e);
    }
  };
  _commit_callbacks = new WeakMap();
  _discard_callbacks = new WeakMap();
  _pending = new WeakMap();
  _blocking_pending = new WeakMap();
  _deferred = new WeakMap();
  _roots = new WeakMap();
  _new_effects = new WeakMap();
  _dirty_effects = new WeakMap();
  _maybe_dirty_effects = new WeakMap();
  _skipped_branches = new WeakMap();
  _decrement_queued = new WeakMap();
  _blockers = new WeakMap();
  _Batch_instances = new WeakSet();
  is_deferred_fn = function() {
    return this.is_fork || __privateGet(this, _blocking_pending).size > 0;
  };
  is_blocked_fn = function() {
    for (const batch of __privateGet(this, _blockers)) {
      for (const effect2 of __privateGet(batch, _blocking_pending).keys()) {
        var skipped = false;
        var e = effect2;
        while (e.parent !== null) {
          if (__privateGet(this, _skipped_branches).has(e)) {
            skipped = true;
            break;
          }
          e = e.parent;
        }
        if (!skipped) {
          return true;
        }
      }
    }
    return false;
  };
  process_fn = function() {
    var _a2, _b2;
    if (flush_count++ > 1e3) {
      batches.delete(this);
      infinite_loop_guard();
    }
    if (!__privateMethod(this, _Batch_instances, is_deferred_fn).call(this)) {
      for (const e of __privateGet(this, _dirty_effects)) {
        __privateGet(this, _maybe_dirty_effects).delete(e);
        set_signal_status(e, DIRTY);
        this.schedule(e);
      }
      for (const e of __privateGet(this, _maybe_dirty_effects)) {
        set_signal_status(e, MAYBE_DIRTY);
        this.schedule(e);
      }
    }
    const roots = __privateGet(this, _roots);
    __privateSet(this, _roots, []);
    this.apply();
    var effects = collected_effects = [];
    var render_effects = [];
    var updates = legacy_updates = [];
    for (const root2 of roots) {
      try {
        __privateMethod(this, _Batch_instances, traverse_fn).call(this, root2, effects, render_effects);
      } catch (e) {
        reset_all(root2);
        throw e;
      }
    }
    current_batch = null;
    if (updates.length > 0) {
      var batch = _Batch.ensure();
      for (const e of updates) {
        batch.schedule(e);
      }
    }
    collected_effects = null;
    legacy_updates = null;
    if (__privateMethod(this, _Batch_instances, is_deferred_fn).call(this) || __privateMethod(this, _Batch_instances, is_blocked_fn).call(this)) {
      __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, render_effects);
      __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, effects);
      for (const [e, t] of __privateGet(this, _skipped_branches)) {
        reset_branch(e, t);
      }
    } else {
      if (__privateGet(this, _pending).size === 0) {
        batches.delete(this);
      }
      __privateGet(this, _dirty_effects).clear();
      __privateGet(this, _maybe_dirty_effects).clear();
      for (const fn of __privateGet(this, _commit_callbacks)) fn(this);
      __privateGet(this, _commit_callbacks).clear();
      flush_queued_effects(render_effects);
      flush_queued_effects(effects);
      (_a2 = __privateGet(this, _deferred)) == null ? void 0 : _a2.resolve();
    }
    var next_batch = (

current_batch
    );
    if (__privateGet(this, _roots).length > 0) {
      const batch2 = next_batch ?? (next_batch = this);
      __privateGet(batch2, _roots).push(...__privateGet(this, _roots).filter((r2) => !__privateGet(batch2, _roots).includes(r2)));
    }
    if (next_batch !== null) {
      batches.add(next_batch);
      __privateMethod(_b2 = next_batch, _Batch_instances, process_fn).call(_b2);
    }
    if (!batches.has(this)) {
      __privateMethod(this, _Batch_instances, commit_fn).call(this);
    }
  };
traverse_fn = function(root2, effects, render_effects) {
    root2.f ^= CLEAN;
    var effect2 = root2.first;
    while (effect2 !== null) {
      var flags2 = effect2.f;
      var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags2 & INERT) !== 0 || __privateGet(this, _skipped_branches).has(effect2);
      if (!skip && effect2.fn !== null) {
        if (is_branch) {
          effect2.f ^= CLEAN;
        } else if ((flags2 & EFFECT) !== 0) {
          effects.push(effect2);
        } else if (is_dirty(effect2)) {
          if ((flags2 & BLOCK_EFFECT) !== 0) __privateGet(this, _maybe_dirty_effects).add(effect2);
          update_effect(effect2);
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      while (effect2 !== null) {
        var next = effect2.next;
        if (next !== null) {
          effect2 = next;
          break;
        }
        effect2 = effect2.parent;
      }
    }
  };
defer_effects_fn = function(effects) {
    for (var i = 0; i < effects.length; i += 1) {
      defer_effect(effects[i], __privateGet(this, _dirty_effects), __privateGet(this, _maybe_dirty_effects));
    }
  };
  commit_fn = function() {
    var _a2, _b2, _c2;
    for (const batch of batches) {
      var is_earlier = batch.id < this.id;
      var sources = [];
      for (const [source3, [value, is_derived]] of this.current) {
        if (batch.current.has(source3)) {
          var batch_value = (
batch.current.get(source3)[0]
          );
          if (is_earlier && value !== batch_value) {
            batch.current.set(source3, [value, is_derived]);
          } else {
            continue;
          }
        }
        sources.push(source3);
      }
      var others = [...batch.current.keys()].filter((s) => !this.current.has(s));
      if (others.length === 0) {
        if (is_earlier) {
          batch.discard();
        }
      } else if (sources.length > 0) {
        batch.activate();
        var marked = new Set();
        var checked = new Map();
        for (var source2 of sources) {
          mark_effects(source2, others, marked, checked);
        }
        checked = new Map();
        var current_unequal = [...batch.current.keys()].filter(
          (c) => this.current.has(c) ? (
this.current.get(c)[0] !== c
          ) : true
        );
        for (const effect2 of __privateGet(this, _new_effects)) {
          if ((effect2.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 && depends_on(effect2, current_unequal, checked)) {
            if ((effect2.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
              set_signal_status(effect2, DIRTY);
              batch.schedule(effect2);
            } else {
              __privateGet(batch, _dirty_effects).add(effect2);
            }
          }
        }
        if (__privateGet(batch, _roots).length > 0) {
          batch.apply();
          for (var root2 of __privateGet(batch, _roots)) {
            __privateMethod(_a2 = batch, _Batch_instances, traverse_fn).call(_a2, root2, [], []);
          }
          __privateSet(batch, _roots, []);
        }
        batch.deactivate();
      }
    }
    for (const batch of batches) {
      if (__privateGet(batch, _blockers).has(this)) {
        __privateGet(batch, _blockers).delete(this);
        if (__privateGet(batch, _blockers).size === 0 && !__privateMethod(_b2 = batch, _Batch_instances, is_deferred_fn).call(_b2)) {
          batch.activate();
          __privateMethod(_c2 = batch, _Batch_instances, process_fn).call(_c2);
        }
      }
    }
  };
  let Batch = _Batch;
  function flushSync(fn) {
    var was_flushing_sync = is_flushing_sync;
    is_flushing_sync = true;
    try {
      var result;
      if (fn) ;
      while (true) {
        flush_tasks();
        if (current_batch === null) {
          return (
result
          );
        }
        current_batch.flush();
      }
    } finally {
      is_flushing_sync = was_flushing_sync;
    }
  }
  function infinite_loop_guard() {
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      invoke_error_boundary(error, last_scheduled_effect);
    }
  }
  let eager_block_effects = null;
  function flush_queued_effects(effects) {
    var length = effects.length;
    if (length === 0) return;
    var i = 0;
    while (i < length) {
      var effect2 = effects[i++];
      if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
        eager_block_effects = new Set();
        update_effect(effect2);
        if (effect2.deps === null && effect2.first === null && effect2.nodes === null && effect2.teardown === null && effect2.ac === null) {
          unlink_effect(effect2);
        }
        if ((eager_block_effects == null ? void 0 : eager_block_effects.size) > 0) {
          old_values.clear();
          for (const e of eager_block_effects) {
            if ((e.f & (DESTROYED | INERT)) !== 0) continue;
            const ordered_effects = [e];
            let ancestor = e.parent;
            while (ancestor !== null) {
              if (eager_block_effects.has(ancestor)) {
                eager_block_effects.delete(ancestor);
                ordered_effects.push(ancestor);
              }
              ancestor = ancestor.parent;
            }
            for (let j = ordered_effects.length - 1; j >= 0; j--) {
              const e2 = ordered_effects[j];
              if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
              update_effect(e2);
            }
          }
          eager_block_effects.clear();
        }
      }
    }
    eager_block_effects = null;
  }
  function mark_effects(value, sources, marked, checked) {
    if (marked.has(value)) return;
    marked.add(value);
    if (value.reactions !== null) {
      for (const reaction of value.reactions) {
        const flags2 = reaction.f;
        if ((flags2 & DERIVED) !== 0) {
          mark_effects(
reaction,
            sources,
            marked,
            checked
          );
        } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
          set_signal_status(reaction, DIRTY);
          schedule_effect(
reaction
          );
        }
      }
    }
  }
  function depends_on(reaction, sources, checked) {
    const depends = checked.get(reaction);
    if (depends !== void 0) return depends;
    if (reaction.deps !== null) {
      for (const dep of reaction.deps) {
        if (includes.call(sources, dep)) {
          return true;
        }
        if ((dep.f & DERIVED) !== 0 && depends_on(
dep,
          sources,
          checked
        )) {
          checked.set(
dep,
            true
          );
          return true;
        }
      }
    }
    checked.set(reaction, false);
    return false;
  }
  function schedule_effect(effect2) {
    current_batch.schedule(effect2);
  }
  function reset_branch(effect2, tracked) {
    if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
      return;
    }
    if ((effect2.f & DIRTY) !== 0) {
      tracked.d.push(effect2);
    } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
      tracked.m.push(effect2);
    }
    set_signal_status(effect2, CLEAN);
    var e = effect2.first;
    while (e !== null) {
      reset_branch(e, tracked);
      e = e.next;
    }
  }
  function reset_all(effect2) {
    set_signal_status(effect2, CLEAN);
    var e = effect2.first;
    while (e !== null) {
      reset_all(e);
      e = e.next;
    }
  }
  function createSubscriber(start) {
    let subscribers = 0;
    let version = source(0);
    let stop;
    return () => {
      if (effect_tracking()) {
        get(version);
        render_effect(() => {
          if (subscribers === 0) {
            stop = untrack(() => start(() => increment(version)));
          }
          subscribers += 1;
          return () => {
            queue_micro_task(() => {
              subscribers -= 1;
              if (subscribers === 0) {
                stop == null ? void 0 : stop();
                stop = void 0;
                increment(version);
              }
            });
          };
        });
      }
    };
  }
  var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
  function boundary(node, props, children, transform_error) {
    new Boundary(node, props, children, transform_error);
  }
  class Boundary {
constructor(node, props, children, transform_error) {
      __privateAdd(this, _Boundary_instances);
__publicField(this, "parent");
      __publicField(this, "is_pending", false);
__publicField(this, "transform_error");
__privateAdd(this, _anchor);
__privateAdd(this, _hydrate_open, null);
__privateAdd(this, _props);
__privateAdd(this, _children);
__privateAdd(this, _effect);
__privateAdd(this, _main_effect, null);
__privateAdd(this, _pending_effect, null);
__privateAdd(this, _failed_effect, null);
__privateAdd(this, _offscreen_fragment, null);
      __privateAdd(this, _local_pending_count, 0);
      __privateAdd(this, _pending_count, 0);
      __privateAdd(this, _pending_count_update_queued, false);
__privateAdd(this, _dirty_effects2, new Set());
__privateAdd(this, _maybe_dirty_effects2, new Set());
__privateAdd(this, _effect_pending, null);
      __privateAdd(this, _effect_pending_subscriber, createSubscriber(() => {
        __privateSet(this, _effect_pending, source(__privateGet(this, _local_pending_count)));
        return () => {
          __privateSet(this, _effect_pending, null);
        };
      }));
      var _a2;
      __privateSet(this, _anchor, node);
      __privateSet(this, _props, props);
      __privateSet(this, _children, (anchor) => {
        var effect2 = (
active_effect
        );
        effect2.b = this;
        effect2.f |= BOUNDARY_EFFECT;
        children(anchor);
      });
      this.parent =
active_effect.b;
      this.transform_error = transform_error ?? ((_a2 = this.parent) == null ? void 0 : _a2.transform_error) ?? ((e) => e);
      __privateSet(this, _effect, block(() => {
        {
          __privateMethod(this, _Boundary_instances, render_fn).call(this);
        }
      }, flags));
    }
defer_effect(effect2) {
      defer_effect(effect2, __privateGet(this, _dirty_effects2), __privateGet(this, _maybe_dirty_effects2));
    }
is_rendered() {
      return !this.is_pending && (!this.parent || this.parent.is_rendered());
    }
    has_pending_snippet() {
      return !!__privateGet(this, _props).pending;
    }
update_pending_count(d, batch) {
      __privateMethod(this, _Boundary_instances, update_pending_count_fn).call(this, d, batch);
      __privateSet(this, _local_pending_count, __privateGet(this, _local_pending_count) + d);
      if (!__privateGet(this, _effect_pending) || __privateGet(this, _pending_count_update_queued)) return;
      __privateSet(this, _pending_count_update_queued, true);
      queue_micro_task(() => {
        __privateSet(this, _pending_count_update_queued, false);
        if (__privateGet(this, _effect_pending)) {
          internal_set(__privateGet(this, _effect_pending), __privateGet(this, _local_pending_count));
        }
      });
    }
    get_effect_pending() {
      __privateGet(this, _effect_pending_subscriber).call(this);
      return get(
__privateGet(this, _effect_pending)
      );
    }
error(error) {
      var onerror = __privateGet(this, _props).onerror;
      let failed = __privateGet(this, _props).failed;
      if (!onerror && !failed) {
        throw error;
      }
      if (__privateGet(this, _main_effect)) {
        destroy_effect(__privateGet(this, _main_effect));
        __privateSet(this, _main_effect, null);
      }
      if (__privateGet(this, _pending_effect)) {
        destroy_effect(__privateGet(this, _pending_effect));
        __privateSet(this, _pending_effect, null);
      }
      if (__privateGet(this, _failed_effect)) {
        destroy_effect(__privateGet(this, _failed_effect));
        __privateSet(this, _failed_effect, null);
      }
      var did_reset = false;
      var calling_on_error = false;
      const reset = () => {
        if (did_reset) {
          svelte_boundary_reset_noop();
          return;
        }
        did_reset = true;
        if (calling_on_error) {
          svelte_boundary_reset_onerror();
        }
        if (__privateGet(this, _failed_effect) !== null) {
          pause_effect(__privateGet(this, _failed_effect), () => {
            __privateSet(this, _failed_effect, null);
          });
        }
        __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
          __privateMethod(this, _Boundary_instances, render_fn).call(this);
        });
      };
      const handle_error_result = (transformed_error) => {
        try {
          calling_on_error = true;
          onerror == null ? void 0 : onerror(transformed_error, reset);
          calling_on_error = false;
        } catch (error2) {
          invoke_error_boundary(error2, __privateGet(this, _effect) && __privateGet(this, _effect).parent);
        }
        if (failed) {
          __privateSet(this, _failed_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
            try {
              return branch(() => {
                var effect2 = (
active_effect
                );
                effect2.b = this;
                effect2.f |= BOUNDARY_EFFECT;
                failed(
                  __privateGet(this, _anchor),
                  () => transformed_error,
                  () => reset
                );
              });
            } catch (error2) {
              invoke_error_boundary(
                error2,
__privateGet(this, _effect).parent
              );
              return null;
            }
          }));
        }
      };
      queue_micro_task(() => {
        var result;
        try {
          result = this.transform_error(error);
        } catch (e) {
          invoke_error_boundary(e, __privateGet(this, _effect) && __privateGet(this, _effect).parent);
          return;
        }
        if (result !== null && typeof result === "object" && typeof
result.then === "function") {
          result.then(
            handle_error_result,
(e) => invoke_error_boundary(e, __privateGet(this, _effect) && __privateGet(this, _effect).parent)
          );
        } else {
          handle_error_result(result);
        }
      });
    }
  }
  _anchor = new WeakMap();
  _hydrate_open = new WeakMap();
  _props = new WeakMap();
  _children = new WeakMap();
  _effect = new WeakMap();
  _main_effect = new WeakMap();
  _pending_effect = new WeakMap();
  _failed_effect = new WeakMap();
  _offscreen_fragment = new WeakMap();
  _local_pending_count = new WeakMap();
  _pending_count = new WeakMap();
  _pending_count_update_queued = new WeakMap();
  _dirty_effects2 = new WeakMap();
  _maybe_dirty_effects2 = new WeakMap();
  _effect_pending = new WeakMap();
  _effect_pending_subscriber = new WeakMap();
  _Boundary_instances = new WeakSet();
  render_fn = function() {
    try {
      this.is_pending = this.has_pending_snippet();
      __privateSet(this, _pending_count, 0);
      __privateSet(this, _local_pending_count, 0);
      __privateSet(this, _main_effect, branch(() => {
        __privateGet(this, _children).call(this, __privateGet(this, _anchor));
      }));
      if (__privateGet(this, _pending_count) > 0) {
        var fragment = __privateSet(this, _offscreen_fragment, document.createDocumentFragment());
        move_effect(__privateGet(this, _main_effect), fragment);
        const pending2 = (
__privateGet(this, _props).pending
        );
        __privateSet(this, _pending_effect, branch(() => pending2(__privateGet(this, _anchor))));
      } else {
        __privateMethod(this, _Boundary_instances, resolve_fn).call(
          this,
current_batch
        );
      }
    } catch (error) {
      this.error(error);
    }
  };
resolve_fn = function(batch) {
    this.is_pending = false;
    batch.transfer_effects(__privateGet(this, _dirty_effects2), __privateGet(this, _maybe_dirty_effects2));
  };
run_fn = function(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(__privateGet(this, _effect));
    set_active_reaction(__privateGet(this, _effect));
    set_component_context(__privateGet(this, _effect).ctx);
    try {
      Batch.ensure();
      return fn();
    } catch (e) {
      handle_error(e);
      return null;
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
    }
  };
update_pending_count_fn = function(d, batch) {
    var _a2;
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        __privateMethod(_a2 = this.parent, _Boundary_instances, update_pending_count_fn).call(_a2, d, batch);
      }
      return;
    }
    __privateSet(this, _pending_count, __privateGet(this, _pending_count) + d);
    if (__privateGet(this, _pending_count) === 0) {
      __privateMethod(this, _Boundary_instances, resolve_fn).call(this, batch);
      if (__privateGet(this, _pending_effect)) {
        pause_effect(__privateGet(this, _pending_effect), () => {
          __privateSet(this, _pending_effect, null);
        });
      }
      if (__privateGet(this, _offscreen_fragment)) {
        __privateGet(this, _anchor).before(__privateGet(this, _offscreen_fragment));
        __privateSet(this, _offscreen_fragment, null);
      }
    }
  };
  function flatten(blockers, sync, async, fn) {
    const d = is_runes() ? derived : derived_safe_equal;
    var pending2 = blockers.filter((b) => !b.settled);
    if (async.length === 0 && pending2.length === 0) {
      fn(sync.map(d));
      return;
    }
    var parent = (
active_effect
    );
    var restore = capture();
    var blocker_promise = pending2.length === 1 ? pending2[0].promise : pending2.length > 1 ? Promise.all(pending2.map((b) => b.promise)) : null;
    function finish(values) {
      restore();
      try {
        fn(values);
      } catch (error) {
        if ((parent.f & DESTROYED) === 0) {
          invoke_error_boundary(error, parent);
        }
      }
      unset_context();
    }
    if (async.length === 0) {
      blocker_promise.then(() => finish(sync.map(d)));
      return;
    }
    var decrement_pending = increment_pending();
    function run2() {
      Promise.all(async.map((expression) => async_derived(expression))).then((result) => finish([...sync.map(d), ...result])).catch((error) => invoke_error_boundary(error, parent)).finally(() => decrement_pending());
    }
    if (blocker_promise) {
      blocker_promise.then(() => {
        restore();
        run2();
        unset_context();
      });
    } else {
      run2();
    }
  }
  function capture() {
    var previous_effect = (
active_effect
    );
    var previous_reaction = active_reaction;
    var previous_component_context = component_context;
    var previous_batch = (
current_batch
    );
    return function restore(activate_batch = true) {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_component_context);
      if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
        previous_batch == null ? void 0 : previous_batch.activate();
        previous_batch == null ? void 0 : previous_batch.apply();
      }
    };
  }
  function unset_context(deactivate_batch = true) {
    set_active_effect(null);
    set_active_reaction(null);
    set_component_context(null);
    if (deactivate_batch) current_batch == null ? void 0 : current_batch.deactivate();
  }
  function increment_pending() {
    var effect2 = (
active_effect
    );
    var boundary2 = (
effect2.b
    );
    var batch = (
current_batch
    );
    var blocking = boundary2.is_rendered();
    boundary2.update_pending_count(1, batch);
    batch.increment(blocking, effect2);
    return (skip = false) => {
      boundary2.update_pending_count(-1, batch);
      batch.decrement(blocking, effect2, skip);
    };
  }
function derived(fn) {
    var flags2 = DERIVED | DIRTY;
    var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
active_reaction
    ) : null;
    if (active_effect !== null) {
      active_effect.f |= EFFECT_PRESERVED;
    }
    const signal = {
      ctx: component_context,
      deps: null,
      effects: null,
      equals,
      f: flags2,
      fn,
      reactions: null,
      rv: 0,
      v: (
UNINITIALIZED
      ),
      wv: 0,
      parent: parent_derived ?? active_effect,
      ac: null
    };
    return signal;
  }
function async_derived(fn, label, location2) {
    let parent = (
active_effect
    );
    if (parent === null) {
      async_derived_orphan();
    }
    var promise = (

void 0
    );
    var signal = source(
UNINITIALIZED
    );
    var should_suspend = !active_reaction;
    var deferreds = new Map();
    async_effect(() => {
      var _a2;
      var effect2 = (
active_effect
      );
      var d = deferred();
      promise = d.promise;
      try {
        Promise.resolve(fn()).then(d.resolve, d.reject).finally(unset_context);
      } catch (error) {
        d.reject(error);
        unset_context();
      }
      var batch = (
current_batch
      );
      if (should_suspend) {
        if ((effect2.f & REACTION_RAN) !== 0) {
          var decrement_pending = increment_pending();
        }
        if (
parent.b.is_rendered()
        ) {
          (_a2 = deferreds.get(batch)) == null ? void 0 : _a2.reject(STALE_REACTION);
          deferreds.delete(batch);
        } else {
          for (const d2 of deferreds.values()) {
            d2.reject(STALE_REACTION);
          }
          deferreds.clear();
        }
        deferreds.set(batch, d);
      }
      const handler = (value, error = void 0) => {
        if (decrement_pending) {
          var skip = error === STALE_REACTION;
          decrement_pending(skip);
        }
        if (error === STALE_REACTION || (effect2.f & DESTROYED) !== 0) {
          return;
        }
        batch.activate();
        if (error) {
          signal.f |= ERROR_VALUE;
          internal_set(signal, error);
        } else {
          if ((signal.f & ERROR_VALUE) !== 0) {
            signal.f ^= ERROR_VALUE;
          }
          internal_set(signal, value);
          for (const [b, d2] of deferreds) {
            deferreds.delete(b);
            if (b === batch) break;
            d2.reject(STALE_REACTION);
          }
        }
        batch.deactivate();
      };
      d.promise.then(handler, (e) => handler(null, e || "unknown"));
    });
    teardown(() => {
      for (const d of deferreds.values()) {
        d.reject(STALE_REACTION);
      }
    });
    return new Promise((fulfil) => {
      function next(p) {
        function go() {
          if (p === promise) {
            fulfil(signal);
          } else {
            next(promise);
          }
        }
        p.then(go, go);
      }
      next(promise);
    });
  }
function user_derived(fn) {
    const d = derived(fn);
    push_reaction_value(d);
    return d;
  }
function derived_safe_equal(fn) {
    const signal = derived(fn);
    signal.equals = safe_equals;
    return signal;
  }
  function destroy_derived_effects(derived2) {
    var effects = derived2.effects;
    if (effects !== null) {
      derived2.effects = null;
      for (var i = 0; i < effects.length; i += 1) {
        destroy_effect(
effects[i]
        );
      }
    }
  }
  function get_derived_parent_effect(derived2) {
    var parent = derived2.parent;
    while (parent !== null) {
      if ((parent.f & DERIVED) === 0) {
        return (parent.f & DESTROYED) === 0 ? (
parent
        ) : null;
      }
      parent = parent.parent;
    }
    return null;
  }
  function execute_derived(derived2) {
    var value;
    var prev_active_effect = active_effect;
    set_active_effect(get_derived_parent_effect(derived2));
    {
      try {
        derived2.f &= ~WAS_MARKED;
        destroy_derived_effects(derived2);
        value = update_reaction(derived2);
      } finally {
        set_active_effect(prev_active_effect);
      }
    }
    return value;
  }
  function update_derived(derived2) {
    var old_value = derived2.v;
    var value = execute_derived(derived2);
    if (!derived2.equals(value)) {
      derived2.wv = increment_write_version();
      if (!(current_batch == null ? void 0 : current_batch.is_fork) || derived2.deps === null) {
        derived2.v = value;
        current_batch == null ? void 0 : current_batch.capture(derived2, old_value, true);
        if (derived2.deps === null) {
          set_signal_status(derived2, CLEAN);
          return;
        }
      }
    }
    if (is_destroying_effect) {
      return;
    }
    if (batch_values !== null) {
      if (effect_tracking() || (current_batch == null ? void 0 : current_batch.is_fork)) {
        batch_values.set(derived2, value);
      }
    } else {
      update_derived_status(derived2);
    }
  }
  function freeze_derived_effects(derived2) {
    var _a2, _b2;
    if (derived2.effects === null) return;
    for (const e of derived2.effects) {
      if (e.teardown || e.ac) {
        (_a2 = e.teardown) == null ? void 0 : _a2.call(e);
        (_b2 = e.ac) == null ? void 0 : _b2.abort(STALE_REACTION);
        e.teardown = noop;
        e.ac = null;
        remove_reactions(e, 0);
        destroy_effect_children(e);
      }
    }
  }
  function unfreeze_derived_effects(derived2) {
    if (derived2.effects === null) return;
    for (const e of derived2.effects) {
      if (e.teardown) {
        update_effect(e);
      }
    }
  }
  let eager_effects = new Set();
  const old_values = new Map();
  let eager_effects_deferred = false;
  function source(v, stack) {
    var signal = {
      f: 0,
v,
      reactions: null,
      equals,
      rv: 0,
      wv: 0
    };
    return signal;
  }
function state(v, stack) {
    const s = source(v);
    push_reaction_value(s);
    return s;
  }
function mutable_source(initial_value, immutable = false, trackable = true) {
    var _a2;
    const s = source(initial_value);
    if (!immutable) {
      s.equals = safe_equals;
    }
    if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
      ((_a2 = component_context.l).s ?? (_a2.s = [])).push(s);
    }
    return s;
  }
  function set(source2, value, should_proxy = false) {
    if (active_reaction !== null &&

(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, source2))) {
      state_unsafe_mutation();
    }
    let new_value = should_proxy ? proxy(value) : value;
    return internal_set(source2, new_value, legacy_updates);
  }
  function internal_set(source2, value, updated_during_traversal = null) {
    if (!source2.equals(value)) {
      var old_value = source2.v;
      if (is_destroying_effect) {
        old_values.set(source2, value);
      } else {
        old_values.set(source2, old_value);
      }
      source2.v = value;
      var batch = Batch.ensure();
      batch.capture(source2, old_value);
      if ((source2.f & DERIVED) !== 0) {
        const derived2 = (
source2
        );
        if ((source2.f & DIRTY) !== 0) {
          execute_derived(derived2);
        }
        if (batch_values === null) {
          update_derived_status(derived2);
        }
      }
      source2.wv = increment_write_version();
      mark_reactions(source2, DIRTY, updated_during_traversal);
      if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
        if (untracked_writes === null) {
          set_untracked_writes([source2]);
        } else {
          untracked_writes.push(source2);
        }
      }
      if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
        flush_eager_effects();
      }
    }
    return value;
  }
  function flush_eager_effects() {
    eager_effects_deferred = false;
    for (const effect2 of eager_effects) {
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (is_dirty(effect2)) {
        update_effect(effect2);
      }
    }
    eager_effects.clear();
  }
  function update(source2, d = 1) {
    var value = get(source2);
    var result = d === 1 ? value++ : value--;
    set(source2, value);
    return result;
  }
  function increment(source2) {
    set(source2, source2.v + 1);
  }
  function mark_reactions(signal, status, updated_during_traversal) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    var runes = is_runes();
    var length = reactions.length;
    for (var i = 0; i < length; i++) {
      var reaction = reactions[i];
      var flags2 = reaction.f;
      if (!runes && reaction === active_effect) continue;
      var not_dirty = (flags2 & DIRTY) === 0;
      if (not_dirty) {
        set_signal_status(reaction, status);
      }
      if ((flags2 & DERIVED) !== 0) {
        var derived2 = (
reaction
        );
        batch_values == null ? void 0 : batch_values.delete(derived2);
        if ((flags2 & WAS_MARKED) === 0) {
          if (flags2 & CONNECTED) {
            reaction.f |= WAS_MARKED;
          }
          mark_reactions(derived2, MAYBE_DIRTY, updated_during_traversal);
        }
      } else if (not_dirty) {
        var effect2 = (
reaction
        );
        if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
          eager_block_effects.add(effect2);
        }
        if (updated_during_traversal !== null) {
          updated_during_traversal.push(effect2);
        } else {
          schedule_effect(effect2);
        }
      }
    }
  }
  function proxy(value) {
    if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
      return value;
    }
    const prototype = get_prototype_of(value);
    if (prototype !== object_prototype && prototype !== array_prototype) {
      return value;
    }
    var sources = new Map();
    var is_proxied_array = is_array(value);
    var version = state(0);
    var parent_version = update_version;
    var with_parent = (fn) => {
      if (update_version === parent_version) {
        return fn();
      }
      var reaction = active_reaction;
      var version2 = update_version;
      set_active_reaction(null);
      set_update_version(parent_version);
      var result = fn();
      set_active_reaction(reaction);
      set_update_version(version2);
      return result;
    };
    if (is_proxied_array) {
      sources.set("length", state(
value.length
      ));
    }
    return new Proxy(
value,
      {
        defineProperty(_, prop2, descriptor) {
          if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
            state_descriptors_fixed();
          }
          var s = sources.get(prop2);
          if (s === void 0) {
            with_parent(() => {
              var s2 = state(descriptor.value);
              sources.set(prop2, s2);
              return s2;
            });
          } else {
            set(s, descriptor.value, true);
          }
          return true;
        },
        deleteProperty(target, prop2) {
          var s = sources.get(prop2);
          if (s === void 0) {
            if (prop2 in target) {
              const s2 = with_parent(() => state(UNINITIALIZED));
              sources.set(prop2, s2);
              increment(version);
            }
          } else {
            set(s, UNINITIALIZED);
            increment(version);
          }
          return true;
        },
        get(target, prop2, receiver) {
          var _a2;
          if (prop2 === STATE_SYMBOL) {
            return value;
          }
          var s = sources.get(prop2);
          var exists = prop2 in target;
          if (s === void 0 && (!exists || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
            s = with_parent(() => {
              var p = proxy(exists ? target[prop2] : UNINITIALIZED);
              var s2 = state(p);
              return s2;
            });
            sources.set(prop2, s);
          }
          if (s !== void 0) {
            var v = get(s);
            return v === UNINITIALIZED ? void 0 : v;
          }
          return Reflect.get(target, prop2, receiver);
        },
        getOwnPropertyDescriptor(target, prop2) {
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor && "value" in descriptor) {
            var s = sources.get(prop2);
            if (s) descriptor.value = get(s);
          } else if (descriptor === void 0) {
            var source2 = sources.get(prop2);
            var value2 = source2 == null ? void 0 : source2.v;
            if (source2 !== void 0 && value2 !== UNINITIALIZED) {
              return {
                enumerable: true,
                configurable: true,
                value: value2,
                writable: true
              };
            }
          }
          return descriptor;
        },
        has(target, prop2) {
          var _a2;
          if (prop2 === STATE_SYMBOL) {
            return true;
          }
          var s = sources.get(prop2);
          var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
          if (s !== void 0 || active_effect !== null && (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
            if (s === void 0) {
              s = with_parent(() => {
                var p = has ? proxy(target[prop2]) : UNINITIALIZED;
                var s2 = state(p);
                return s2;
              });
              sources.set(prop2, s);
            }
            var value2 = get(s);
            if (value2 === UNINITIALIZED) {
              return false;
            }
          }
          return has;
        },
        set(target, prop2, value2, receiver) {
          var _a2;
          var s = sources.get(prop2);
          var has = prop2 in target;
          if (is_proxied_array && prop2 === "length") {
            for (var i = value2; i <
s.v; i += 1) {
              var other_s = sources.get(i + "");
              if (other_s !== void 0) {
                set(other_s, UNINITIALIZED);
              } else if (i in target) {
                other_s = with_parent(() => state(UNINITIALIZED));
                sources.set(i + "", other_s);
              }
            }
          }
          if (s === void 0) {
            if (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable)) {
              s = with_parent(() => state(void 0));
              set(s, proxy(value2));
              sources.set(prop2, s);
            }
          } else {
            has = s.v !== UNINITIALIZED;
            var p = with_parent(() => proxy(value2));
            set(s, p);
          }
          var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
          if (descriptor == null ? void 0 : descriptor.set) {
            descriptor.set.call(receiver, value2);
          }
          if (!has) {
            if (is_proxied_array && typeof prop2 === "string") {
              var ls = (
sources.get("length")
              );
              var n = Number(prop2);
              if (Number.isInteger(n) && n >= ls.v) {
                set(ls, n + 1);
              }
            }
            increment(version);
          }
          return true;
        },
        ownKeys(target) {
          get(version);
          var own_keys = Reflect.ownKeys(target).filter((key2) => {
            var source3 = sources.get(key2);
            return source3 === void 0 || source3.v !== UNINITIALIZED;
          });
          for (var [key, source2] of sources) {
            if (source2.v !== UNINITIALIZED && !(key in target)) {
              own_keys.push(key);
            }
          }
          return own_keys;
        },
        setPrototypeOf() {
          state_prototype_fixed();
        }
      }
    );
  }
  function get_proxied_value(value) {
    try {
      if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
        return value[STATE_SYMBOL];
      }
    } catch {
    }
    return value;
  }
  function is(a, b) {
    return Object.is(get_proxied_value(a), get_proxied_value(b));
  }
  var $window;
  var is_firefox;
  var first_child_getter;
  var next_sibling_getter;
  function init_operations() {
    if ($window !== void 0) {
      return;
    }
    $window = window;
    is_firefox = /Firefox/.test(navigator.userAgent);
    var element_prototype = Element.prototype;
    var node_prototype = Node.prototype;
    var text_prototype = Text.prototype;
    first_child_getter = get_descriptor(node_prototype, "firstChild").get;
    next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
    if (is_extensible(element_prototype)) {
      element_prototype.__click = void 0;
      element_prototype.__className = void 0;
      element_prototype.__attributes = null;
      element_prototype.__style = void 0;
      element_prototype.__e = void 0;
    }
    if (is_extensible(text_prototype)) {
      text_prototype.__t = void 0;
    }
  }
  function create_text(value = "") {
    return document.createTextNode(value);
  }
function get_first_child(node) {
    return (
first_child_getter.call(node)
    );
  }
function get_next_sibling(node) {
    return (
next_sibling_getter.call(node)
    );
  }
  function child(node, is_text) {
    {
      return get_first_child(node);
    }
  }
  function first_child(node, is_text = false) {
    {
      var first = get_first_child(node);
      if (first instanceof Comment && first.data === "") return get_next_sibling(first);
      return first;
    }
  }
  function sibling(node, count = 1, is_text = false) {
    let next_sibling = node;
    while (count--) {
      next_sibling =

get_next_sibling(next_sibling);
    }
    {
      return next_sibling;
    }
  }
  function clear_text_content(node) {
    node.textContent = "";
  }
  function create_element(tag, namespace, is2) {
    let options = void 0;
    return (
document.createElementNS(namespace ?? NAMESPACE_HTML, tag, options)
    );
  }
  function autofocus(dom, value) {
    if (value) {
      const body = document.body;
      dom.autofocus = true;
      queue_micro_task(() => {
        if (document.activeElement === body) {
          dom.focus();
        }
      });
    }
  }
  let listening_to_form_reset = false;
  function add_form_reset_listener() {
    if (!listening_to_form_reset) {
      listening_to_form_reset = true;
      document.addEventListener(
        "reset",
        (evt) => {
          Promise.resolve().then(() => {
            var _a2;
            if (!evt.defaultPrevented) {
              for (
                const e of
evt.target.elements
              ) {
                (_a2 = e.__on_r) == null ? void 0 : _a2.call(e);
              }
            }
          });
        },
{ capture: true }
      );
    }
  }
  function without_reactive_context(fn) {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return fn();
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  function listen_to_event_and_reset_event(element2, event2, handler, on_reset = handler) {
    element2.addEventListener(event2, () => without_reactive_context(handler));
    const prev = element2.__on_r;
    if (prev) {
      element2.__on_r = () => {
        prev();
        on_reset(true);
      };
    } else {
      element2.__on_r = () => on_reset(true);
    }
    add_form_reset_listener();
  }
  function validate_effect(rune) {
    if (active_effect === null) {
      if (active_reaction === null) {
        effect_orphan();
      }
      effect_in_unowned_derived();
    }
    if (is_destroying_effect) {
      effect_in_teardown();
    }
  }
  function push_effect(effect2, parent_effect) {
    var parent_last = parent_effect.last;
    if (parent_last === null) {
      parent_effect.last = parent_effect.first = effect2;
    } else {
      parent_last.next = effect2;
      effect2.prev = parent_last;
      parent_effect.last = effect2;
    }
  }
  function create_effect(type, fn) {
    var parent = active_effect;
    if (parent !== null && (parent.f & INERT) !== 0) {
      type |= INERT;
    }
    var effect2 = {
      ctx: component_context,
      deps: null,
      nodes: null,
      f: type | DIRTY | CONNECTED,
      first: null,
      fn,
      last: null,
      next: null,
      parent,
      b: parent && parent.b,
      prev: null,
      teardown: null,
      wv: 0,
      ac: null
    };
    current_batch == null ? void 0 : current_batch.register_created_effect(effect2);
    var e = effect2;
    if ((type & EFFECT) !== 0) {
      if (collected_effects !== null) {
        collected_effects.push(effect2);
      } else {
        Batch.ensure().schedule(effect2);
      }
    } else if (fn !== null) {
      try {
        update_effect(effect2);
      } catch (e2) {
        destroy_effect(effect2);
        throw e2;
      }
      if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last &&
(e.f & EFFECT_PRESERVED) === 0) {
        e = e.first;
        if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
          e.f |= EFFECT_TRANSPARENT;
        }
      }
    }
    if (e !== null) {
      e.parent = parent;
      if (parent !== null) {
        push_effect(e, parent);
      }
      if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
        var derived2 = (
active_reaction
        );
        (derived2.effects ?? (derived2.effects = [])).push(e);
      }
    }
    return effect2;
  }
  function effect_tracking() {
    return active_reaction !== null && !untracking;
  }
  function teardown(fn) {
    const effect2 = create_effect(RENDER_EFFECT, null);
    set_signal_status(effect2, CLEAN);
    effect2.teardown = fn;
    return effect2;
  }
  function user_effect(fn) {
    validate_effect();
    var flags2 = (
active_effect.f
    );
    var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && (flags2 & REACTION_RAN) === 0;
    if (defer) {
      var context = (
component_context
      );
      (context.e ?? (context.e = [])).push(fn);
    } else {
      return create_user_effect(fn);
    }
  }
  function create_user_effect(fn) {
    return create_effect(EFFECT | USER_EFFECT, fn);
  }
  function user_pre_effect(fn) {
    validate_effect();
    return create_effect(RENDER_EFFECT | USER_EFFECT, fn);
  }
  function component_root(fn) {
    Batch.ensure();
    const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
    return (options = {}) => {
      return new Promise((fulfil) => {
        if (options.outro) {
          pause_effect(effect2, () => {
            destroy_effect(effect2);
            fulfil(void 0);
          });
        } else {
          destroy_effect(effect2);
          fulfil(void 0);
        }
      });
    };
  }
  function effect(fn) {
    return create_effect(EFFECT, fn);
  }
  function async_effect(fn) {
    return create_effect(ASYNC | EFFECT_PRESERVED, fn);
  }
  function render_effect(fn, flags2 = 0) {
    return create_effect(RENDER_EFFECT | flags2, fn);
  }
  function template_effect(fn, sync = [], async = [], blockers = []) {
    flatten(blockers, sync, async, (values) => {
      create_effect(RENDER_EFFECT, () => fn(...values.map(get)));
    });
  }
  function block(fn, flags2 = 0) {
    var effect2 = create_effect(BLOCK_EFFECT | flags2, fn);
    return effect2;
  }
  function managed(fn, flags2 = 0) {
    var effect2 = create_effect(MANAGED_EFFECT | flags2, fn);
    return effect2;
  }
  function branch(fn) {
    return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
  }
  function execute_effect_teardown(effect2) {
    var teardown2 = effect2.teardown;
    if (teardown2 !== null) {
      const previously_destroying_effect = is_destroying_effect;
      const previous_reaction = active_reaction;
      set_is_destroying_effect(true);
      set_active_reaction(null);
      try {
        teardown2.call(null);
      } finally {
        set_is_destroying_effect(previously_destroying_effect);
        set_active_reaction(previous_reaction);
      }
    }
  }
  function destroy_effect_children(signal, remove_dom = false) {
    var effect2 = signal.first;
    signal.first = signal.last = null;
    while (effect2 !== null) {
      const controller = effect2.ac;
      if (controller !== null) {
        without_reactive_context(() => {
          controller.abort(STALE_REACTION);
        });
      }
      var next = effect2.next;
      if ((effect2.f & ROOT_EFFECT) !== 0) {
        effect2.parent = null;
      } else {
        destroy_effect(effect2, remove_dom);
      }
      effect2 = next;
    }
  }
  function destroy_block_effect_children(signal) {
    var effect2 = signal.first;
    while (effect2 !== null) {
      var next = effect2.next;
      if ((effect2.f & BRANCH_EFFECT) === 0) {
        destroy_effect(effect2);
      }
      effect2 = next;
    }
  }
  function destroy_effect(effect2, remove_dom = true) {
    var removed = false;
    if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
      remove_effect_dom(
        effect2.nodes.start,
effect2.nodes.end
      );
      removed = true;
    }
    set_signal_status(effect2, DESTROYING);
    destroy_effect_children(effect2, remove_dom && !removed);
    remove_reactions(effect2, 0);
    var transitions = effect2.nodes && effect2.nodes.t;
    if (transitions !== null) {
      for (const transition of transitions) {
        transition.stop();
      }
    }
    execute_effect_teardown(effect2);
    effect2.f ^= DESTROYING;
    effect2.f |= DESTROYED;
    var parent = effect2.parent;
    if (parent !== null && parent.first !== null) {
      unlink_effect(effect2);
    }
    effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = effect2.b = null;
  }
  function remove_effect_dom(node, end) {
    while (node !== null) {
      var next = node === end ? null : get_next_sibling(node);
      node.remove();
      node = next;
    }
  }
  function unlink_effect(effect2) {
    var parent = effect2.parent;
    var prev = effect2.prev;
    var next = effect2.next;
    if (prev !== null) prev.next = next;
    if (next !== null) next.prev = prev;
    if (parent !== null) {
      if (parent.first === effect2) parent.first = next;
      if (parent.last === effect2) parent.last = prev;
    }
  }
  function pause_effect(effect2, callback, destroy = true) {
    var transitions = [];
    pause_children(effect2, transitions, true);
    var fn = () => {
      if (destroy) destroy_effect(effect2);
      if (callback) callback();
    };
    var remaining = transitions.length;
    if (remaining > 0) {
      var check = () => --remaining || fn();
      for (var transition of transitions) {
        transition.out(check);
      }
    } else {
      fn();
    }
  }
  function pause_children(effect2, transitions, local) {
    if ((effect2.f & INERT) !== 0) return;
    effect2.f ^= INERT;
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition of t) {
        if (transition.is_global || local) {
          transitions.push(transition);
        }
      }
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 ||


(child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
      child2 = sibling2;
    }
  }
  function resume_effect(effect2) {
    resume_children(effect2, true);
  }
  function resume_children(effect2, local) {
    if ((effect2.f & INERT) === 0) return;
    effect2.f ^= INERT;
    if ((effect2.f & CLEAN) === 0) {
      set_signal_status(effect2, DIRTY);
      Batch.ensure().schedule(effect2);
    }
    var child2 = effect2.first;
    while (child2 !== null) {
      var sibling2 = child2.next;
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
      resume_children(child2, transparent ? local : false);
      child2 = sibling2;
    }
    var t = effect2.nodes && effect2.nodes.t;
    if (t !== null) {
      for (const transition of t) {
        if (transition.is_global || local) {
          transition.in();
        }
      }
    }
  }
  function move_effect(effect2, fragment) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    while (node !== null) {
      var next = node === end ? null : get_next_sibling(node);
      fragment.append(node);
      node = next;
    }
  }
  let is_updating_effect = false;
  let is_destroying_effect = false;
  function set_is_destroying_effect(value) {
    is_destroying_effect = value;
  }
  let active_reaction = null;
  let untracking = false;
  function set_active_reaction(reaction) {
    active_reaction = reaction;
  }
  let active_effect = null;
  function set_active_effect(effect2) {
    active_effect = effect2;
  }
  let current_sources = null;
  function push_reaction_value(value) {
    if (active_reaction !== null && true) {
      if (current_sources === null) {
        current_sources = [value];
      } else {
        current_sources.push(value);
      }
    }
  }
  let new_deps = null;
  let skipped_deps = 0;
  let untracked_writes = null;
  function set_untracked_writes(value) {
    untracked_writes = value;
  }
  let write_version = 1;
  let read_version = 0;
  let update_version = read_version;
  function set_update_version(value) {
    update_version = value;
  }
  function increment_write_version() {
    return ++write_version;
  }
  function is_dirty(reaction) {
    var flags2 = reaction.f;
    if ((flags2 & DIRTY) !== 0) {
      return true;
    }
    if (flags2 & DERIVED) {
      reaction.f &= ~WAS_MARKED;
    }
    if ((flags2 & MAYBE_DIRTY) !== 0) {
      var dependencies = (
reaction.deps
      );
      var length = dependencies.length;
      for (var i = 0; i < length; i++) {
        var dependency = dependencies[i];
        if (is_dirty(
dependency
        )) {
          update_derived(
dependency
          );
        }
        if (dependency.wv > reaction.wv) {
          return true;
        }
      }
      if ((flags2 & CONNECTED) !== 0 &&

batch_values === null) {
        set_signal_status(reaction, CLEAN);
      }
    }
    return false;
  }
  function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
    var reactions = signal.reactions;
    if (reactions === null) return;
    if (current_sources !== null && includes.call(current_sources, signal)) {
      return;
    }
    for (var i = 0; i < reactions.length; i++) {
      var reaction = reactions[i];
      if ((reaction.f & DERIVED) !== 0) {
        schedule_possible_effect_self_invalidation(
reaction,
          effect2,
          false
        );
      } else if (effect2 === reaction) {
        if (root2) {
          set_signal_status(reaction, DIRTY);
        } else if ((reaction.f & CLEAN) !== 0) {
          set_signal_status(reaction, MAYBE_DIRTY);
        }
        schedule_effect(
reaction
        );
      }
    }
  }
  function update_reaction(reaction) {
    var _a2;
    var previous_deps = new_deps;
    var previous_skipped_deps = skipped_deps;
    var previous_untracked_writes = untracked_writes;
    var previous_reaction = active_reaction;
    var previous_sources = current_sources;
    var previous_component_context = component_context;
    var previous_untracking = untracking;
    var previous_update_version = update_version;
    var flags2 = reaction.f;
    new_deps =
null;
    skipped_deps = 0;
    untracked_writes = null;
    active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
    current_sources = null;
    set_component_context(reaction.ctx);
    untracking = false;
    update_version = ++read_version;
    if (reaction.ac !== null) {
      without_reactive_context(() => {
        reaction.ac.abort(STALE_REACTION);
      });
      reaction.ac = null;
    }
    try {
      reaction.f |= REACTION_IS_UPDATING;
      var fn = (
reaction.fn
      );
      var result = fn();
      reaction.f |= REACTION_RAN;
      var deps = reaction.deps;
      var is_fork = current_batch == null ? void 0 : current_batch.is_fork;
      if (new_deps !== null) {
        var i;
        if (!is_fork) {
          remove_reactions(reaction, skipped_deps);
        }
        if (deps !== null && skipped_deps > 0) {
          deps.length = skipped_deps + new_deps.length;
          for (i = 0; i < new_deps.length; i++) {
            deps[skipped_deps + i] = new_deps[i];
          }
        } else {
          reaction.deps = deps = new_deps;
        }
        if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
          for (i = skipped_deps; i < deps.length; i++) {
            ((_a2 = deps[i]).reactions ?? (_a2.reactions = [])).push(reaction);
          }
        }
      } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
        remove_reactions(reaction, skipped_deps);
        deps.length = skipped_deps;
      }
      if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
        for (i = 0; i <
untracked_writes.length; i++) {
          schedule_possible_effect_self_invalidation(
            untracked_writes[i],
reaction
          );
        }
      }
      if (previous_reaction !== null && previous_reaction !== reaction) {
        read_version++;
        if (previous_reaction.deps !== null) {
          for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
            previous_reaction.deps[i2].rv = read_version;
          }
        }
        if (previous_deps !== null) {
          for (const dep of previous_deps) {
            dep.rv = read_version;
          }
        }
        if (untracked_writes !== null) {
          if (previous_untracked_writes === null) {
            previous_untracked_writes = untracked_writes;
          } else {
            previous_untracked_writes.push(...
untracked_writes);
          }
        }
      }
      if ((reaction.f & ERROR_VALUE) !== 0) {
        reaction.f ^= ERROR_VALUE;
      }
      return result;
    } catch (error) {
      return handle_error(error);
    } finally {
      reaction.f ^= REACTION_IS_UPDATING;
      new_deps = previous_deps;
      skipped_deps = previous_skipped_deps;
      untracked_writes = previous_untracked_writes;
      active_reaction = previous_reaction;
      current_sources = previous_sources;
      set_component_context(previous_component_context);
      untracking = previous_untracking;
      update_version = previous_update_version;
    }
  }
  function remove_reaction(signal, dependency) {
    let reactions = dependency.reactions;
    if (reactions !== null) {
      var index2 = index_of.call(reactions, signal);
      if (index2 !== -1) {
        var new_length = reactions.length - 1;
        if (new_length === 0) {
          reactions = dependency.reactions = null;
        } else {
          reactions[index2] = reactions[new_length];
          reactions.pop();
        }
      }
    }
    if (reactions === null && (dependency.f & DERIVED) !== 0 &&


(new_deps === null || !includes.call(new_deps, dependency))) {
      var derived2 = (
dependency
      );
      if ((derived2.f & CONNECTED) !== 0) {
        derived2.f ^= CONNECTED;
        derived2.f &= ~WAS_MARKED;
      }
      update_derived_status(derived2);
      freeze_derived_effects(derived2);
      remove_reactions(derived2, 0);
    }
  }
  function remove_reactions(signal, start_index) {
    var dependencies = signal.deps;
    if (dependencies === null) return;
    for (var i = start_index; i < dependencies.length; i++) {
      remove_reaction(signal, dependencies[i]);
    }
  }
  function update_effect(effect2) {
    var flags2 = effect2.f;
    if ((flags2 & DESTROYED) !== 0) {
      return;
    }
    set_signal_status(effect2, CLEAN);
    var previous_effect = active_effect;
    var was_updating_effect = is_updating_effect;
    active_effect = effect2;
    is_updating_effect = true;
    try {
      if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
        destroy_block_effect_children(effect2);
      } else {
        destroy_effect_children(effect2);
      }
      execute_effect_teardown(effect2);
      var teardown2 = update_reaction(effect2);
      effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
      effect2.wv = write_version;
      var dep;
      if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) ;
    } finally {
      is_updating_effect = was_updating_effect;
      active_effect = previous_effect;
    }
  }
  async function tick() {
    await Promise.resolve();
    flushSync();
  }
  function get(signal) {
    var flags2 = signal.f;
    var is_derived = (flags2 & DERIVED) !== 0;
    if (active_reaction !== null && !untracking) {
      var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
      if (!destroyed && (current_sources === null || !includes.call(current_sources, signal))) {
        var deps = active_reaction.deps;
        if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
          if (signal.rv < read_version) {
            signal.rv = read_version;
            if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
              skipped_deps++;
            } else if (new_deps === null) {
              new_deps = [signal];
            } else {
              new_deps.push(signal);
            }
          }
        } else {
          (active_reaction.deps ?? (active_reaction.deps = [])).push(signal);
          var reactions = signal.reactions;
          if (reactions === null) {
            signal.reactions = [active_reaction];
          } else if (!includes.call(reactions, active_reaction)) {
            reactions.push(active_reaction);
          }
        }
      }
    }
    if (is_destroying_effect && old_values.has(signal)) {
      return old_values.get(signal);
    }
    if (is_derived) {
      var derived2 = (
signal
      );
      if (is_destroying_effect) {
        var value = derived2.v;
        if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
          value = execute_derived(derived2);
        }
        old_values.set(derived2, value);
        return value;
      }
      var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
      var is_new = (derived2.f & REACTION_RAN) === 0;
      if (is_dirty(derived2)) {
        if (should_connect) {
          derived2.f |= CONNECTED;
        }
        update_derived(derived2);
      }
      if (should_connect && !is_new) {
        unfreeze_derived_effects(derived2);
        reconnect(derived2);
      }
    }
    if (batch_values == null ? void 0 : batch_values.has(signal)) {
      return batch_values.get(signal);
    }
    if ((signal.f & ERROR_VALUE) !== 0) {
      throw signal.v;
    }
    return signal.v;
  }
  function reconnect(derived2) {
    derived2.f |= CONNECTED;
    if (derived2.deps === null) return;
    for (const dep of derived2.deps) {
      (dep.reactions ?? (dep.reactions = [])).push(derived2);
      if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
        unfreeze_derived_effects(
dep
        );
        reconnect(
dep
        );
      }
    }
  }
  function depends_on_old_values(derived2) {
    if (derived2.v === UNINITIALIZED) return true;
    if (derived2.deps === null) return false;
    for (const dep of derived2.deps) {
      if (old_values.has(dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
dep
      )) {
        return true;
      }
    }
    return false;
  }
  function untrack(fn) {
    var previous_untracking = untracking;
    try {
      untracking = true;
      return fn();
    } finally {
      untracking = previous_untracking;
    }
  }
  function deep_read_state(value) {
    if (typeof value !== "object" || !value || value instanceof EventTarget) {
      return;
    }
    if (STATE_SYMBOL in value) {
      deep_read(value);
    } else if (!Array.isArray(value)) {
      for (let key in value) {
        const prop2 = value[key];
        if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
          deep_read(prop2);
        }
      }
    }
  }
  function deep_read(value, visited = new Set()) {
    if (typeof value === "object" && value !== null &&
!(value instanceof EventTarget) && !visited.has(value)) {
      visited.add(value);
      if (value instanceof Date) {
        value.getTime();
      }
      for (let key in value) {
        try {
          deep_read(value[key], visited);
        } catch (e) {
        }
      }
      const proto = get_prototype_of(value);
      if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
        const descriptors = get_descriptors(proto);
        for (let key in descriptors) {
          const get2 = descriptors[key].get;
          if (get2) {
            try {
              get2.call(value);
            } catch (e) {
            }
          }
        }
      }
    }
  }
  function is_capture_event(name) {
    return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
  }
  const DELEGATED_EVENTS = [
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart"
  ];
  function can_delegate_event(event_name) {
    return DELEGATED_EVENTS.includes(event_name);
  }
  const ATTRIBUTE_ALIASES = {
formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    playsinline: "playsInline",
    readonly: "readOnly",
    defaultvalue: "defaultValue",
    defaultchecked: "defaultChecked",
    srcobject: "srcObject",
    novalidate: "noValidate",
    allowfullscreen: "allowFullscreen",
    disablepictureinpicture: "disablePictureInPicture",
    disableremoteplayback: "disableRemotePlayback"
  };
  function normalize_attribute(name) {
    name = name.toLowerCase();
    return ATTRIBUTE_ALIASES[name] ?? name;
  }
  const PASSIVE_EVENTS = ["touchstart", "touchmove"];
  function is_passive_event(name) {
    return PASSIVE_EVENTS.includes(name);
  }
  const event_symbol = Symbol("events");
  const all_registered_events = new Set();
  const root_event_handles = new Set();
  function create_event(event_name, dom, handler, options = {}) {
    function target_handler(event2) {
      if (!options.capture) {
        handle_event_propagation.call(dom, event2);
      }
      if (!event2.cancelBubble) {
        return without_reactive_context(() => {
          return handler == null ? void 0 : handler.call(this, event2);
        });
      }
    }
    if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
      queue_micro_task(() => {
        dom.addEventListener(event_name, target_handler, options);
      });
    } else {
      dom.addEventListener(event_name, target_handler, options);
    }
    return target_handler;
  }
  function event(event_name, dom, handler, capture2, passive) {
    var options = { capture: capture2, passive };
    var target_handler = create_event(event_name, dom, handler, options);
    if (dom === document.body ||
dom === window ||
dom === document ||
dom instanceof HTMLMediaElement) {
      teardown(() => {
        dom.removeEventListener(event_name, target_handler, options);
      });
    }
  }
  function delegated(event_name, element2, handler) {
    (element2[event_symbol] ?? (element2[event_symbol] = {}))[event_name] = handler;
  }
  function delegate(events) {
    for (var i = 0; i < events.length; i++) {
      all_registered_events.add(events[i]);
    }
    for (var fn of root_event_handles) {
      fn(events);
    }
  }
  let last_propagated_event = null;
  function handle_event_propagation(event2) {
    var _a2, _b2;
    var handler_element = this;
    var owner_document = (
handler_element.ownerDocument
    );
    var event_name = event2.type;
    var path = ((_a2 = event2.composedPath) == null ? void 0 : _a2.call(event2)) || [];
    var current_target = (
path[0] || event2.target
    );
    last_propagated_event = event2;
    var path_idx = 0;
    var handled_at = last_propagated_event === event2 && event2[event_symbol];
    if (handled_at) {
      var at_idx = path.indexOf(handled_at);
      if (at_idx !== -1 && (handler_element === document || handler_element ===
window)) {
        event2[event_symbol] = handler_element;
        return;
      }
      var handler_idx = path.indexOf(handler_element);
      if (handler_idx === -1) {
        return;
      }
      if (at_idx <= handler_idx) {
        path_idx = at_idx;
      }
    }
    current_target =
path[path_idx] || event2.target;
    if (current_target === handler_element) return;
    define_property(event2, "currentTarget", {
      configurable: true,
      get() {
        return current_target || owner_document;
      }
    });
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      var throw_error;
      var other_errors = [];
      while (current_target !== null) {
        var parent_element = current_target.assignedSlot || current_target.parentNode ||
current_target.host || null;
        try {
          var delegated2 = (_b2 = current_target[event_symbol]) == null ? void 0 : _b2[event_name];
          if (delegated2 != null && (!
current_target.disabled ||

event2.target === current_target)) {
            delegated2.call(current_target, event2);
          }
        } catch (error) {
          if (throw_error) {
            other_errors.push(error);
          } else {
            throw_error = error;
          }
        }
        if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
          break;
        }
        current_target = parent_element;
      }
      if (throw_error) {
        for (let error of other_errors) {
          queueMicrotask(() => {
            throw error;
          });
        }
        throw throw_error;
      }
    } finally {
      event2[event_symbol] = handler_element;
      delete event2.currentTarget;
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  const policy = (
((_b = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : _b.trustedTypes) && globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
createHTML: (html) => {
        return html;
      }
    })
  );
  function create_trusted_html(html) {
    return (
(policy == null ? void 0 : policy.createHTML(html)) ?? html
    );
  }
  function create_fragment_from_html(html) {
    var elem = create_element("template");
    elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
    return elem.content;
  }
  function assign_nodes(start, end) {
    var effect2 = (
active_effect
    );
    if (effect2.nodes === null) {
      effect2.nodes = { start, end, a: null, t: null };
    }
  }
function from_html(content, flags2) {
    var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
    var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
    var node;
    var has_start = !content.startsWith("<!>");
    return () => {
      if (node === void 0) {
        node = create_fragment_from_html(has_start ? content : "<!>" + content);
        if (!is_fragment) node =

get_first_child(node);
      }
      var clone = (
use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
      );
      if (is_fragment) {
        var start = (

get_first_child(clone)
        );
        var end = (
clone.lastChild
        );
        assign_nodes(start, end);
      } else {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
function from_namespace(content, flags2, ns = "svg") {
    var has_start = !content.startsWith("<!>");
    var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
    var node;
    return () => {
      if (!node) {
        var fragment = (
create_fragment_from_html(wrapped)
        );
        var root2 = (

get_first_child(fragment)
        );
        {
          node =

get_first_child(root2);
        }
      }
      var clone = (
node.cloneNode(true)
      );
      {
        assign_nodes(clone, clone);
      }
      return clone;
    };
  }
function from_svg(content, flags2) {
    return from_namespace(content, flags2, "svg");
  }
  function text(value = "") {
    {
      var t = create_text(value + "");
      assign_nodes(t, t);
      return t;
    }
  }
  function comment() {
    var frag = document.createDocumentFragment();
    var start = document.createComment("");
    var anchor = create_text();
    frag.append(start, anchor);
    assign_nodes(start, anchor);
    return frag;
  }
  function append(anchor, dom) {
    if (anchor === null) {
      return;
    }
    anchor.before(
dom
    );
  }
  function set_text(text2, value) {
    var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
    if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
      text2.__t = str;
      text2.nodeValue = `${str}`;
    }
  }
  function mount(component2, options) {
    return _mount(component2, options);
  }
  const listeners = new Map();
  function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
    init_operations();
    var component2 = void 0;
    var unmount = component_root(() => {
      var anchor_node = anchor ?? target.appendChild(create_text());
      boundary(
anchor_node,
        {
          pending: () => {
          }
        },
        (anchor_node2) => {
          push({});
          var ctx = (
component_context
          );
          if (context) ctx.c = context;
          if (events) {
            props.$$events = events;
          }
          component2 = Component(anchor_node2, props) || {};
          pop();
        },
        transformError
      );
      var registered_events = new Set();
      var event_handle = (events2) => {
        for (var i = 0; i < events2.length; i++) {
          var event_name = events2[i];
          if (registered_events.has(event_name)) continue;
          registered_events.add(event_name);
          var passive = is_passive_event(event_name);
          for (const node of [target, document]) {
            var counts = listeners.get(node);
            if (counts === void 0) {
              counts = new Map();
              listeners.set(node, counts);
            }
            var count = counts.get(event_name);
            if (count === void 0) {
              node.addEventListener(event_name, handle_event_propagation, { passive });
              counts.set(event_name, 1);
            } else {
              counts.set(event_name, count + 1);
            }
          }
        }
      };
      event_handle(array_from(all_registered_events));
      root_event_handles.add(event_handle);
      return () => {
        var _a2;
        for (var event_name of registered_events) {
          for (const node of [target, document]) {
            var counts = (
listeners.get(node)
            );
            var count = (
counts.get(event_name)
            );
            if (--count == 0) {
              node.removeEventListener(event_name, handle_event_propagation);
              counts.delete(event_name);
              if (counts.size === 0) {
                listeners.delete(node);
              }
            } else {
              counts.set(event_name, count);
            }
          }
        }
        root_event_handles.delete(event_handle);
        if (anchor_node !== anchor) {
          (_a2 = anchor_node.parentNode) == null ? void 0 : _a2.removeChild(anchor_node);
        }
      };
    });
    mounted_components.set(component2, unmount);
    return component2;
  }
  let mounted_components = new WeakMap();
  class BranchManager {
constructor(anchor, transition = true) {
__publicField(this, "anchor");
__privateAdd(this, _batches, new Map());
__privateAdd(this, _onscreen, new Map());
__privateAdd(this, _offscreen, new Map());
__privateAdd(this, _outroing, new Set());
__privateAdd(this, _transition, true);
__privateAdd(this, _commit, (batch) => {
        if (!__privateGet(this, _batches).has(batch)) return;
        var key = (
__privateGet(this, _batches).get(batch)
        );
        var onscreen = __privateGet(this, _onscreen).get(key);
        if (onscreen) {
          resume_effect(onscreen);
          __privateGet(this, _outroing).delete(key);
        } else {
          var offscreen = __privateGet(this, _offscreen).get(key);
          if (offscreen) {
            __privateGet(this, _onscreen).set(key, offscreen.effect);
            __privateGet(this, _offscreen).delete(key);
            offscreen.fragment.lastChild.remove();
            this.anchor.before(offscreen.fragment);
            onscreen = offscreen.effect;
          }
        }
        for (const [b, k] of __privateGet(this, _batches)) {
          __privateGet(this, _batches).delete(b);
          if (b === batch) {
            break;
          }
          const offscreen2 = __privateGet(this, _offscreen).get(k);
          if (offscreen2) {
            destroy_effect(offscreen2.effect);
            __privateGet(this, _offscreen).delete(k);
          }
        }
        for (const [k, effect2] of __privateGet(this, _onscreen)) {
          if (k === key || __privateGet(this, _outroing).has(k)) continue;
          const on_destroy = () => {
            const keys = Array.from(__privateGet(this, _batches).values());
            if (keys.includes(k)) {
              var fragment = document.createDocumentFragment();
              move_effect(effect2, fragment);
              fragment.append(create_text());
              __privateGet(this, _offscreen).set(k, { effect: effect2, fragment });
            } else {
              destroy_effect(effect2);
            }
            __privateGet(this, _outroing).delete(k);
            __privateGet(this, _onscreen).delete(k);
          };
          if (__privateGet(this, _transition) || !onscreen) {
            __privateGet(this, _outroing).add(k);
            pause_effect(effect2, on_destroy, false);
          } else {
            on_destroy();
          }
        }
      });
__privateAdd(this, _discard, (batch) => {
        __privateGet(this, _batches).delete(batch);
        const keys = Array.from(__privateGet(this, _batches).values());
        for (const [k, branch2] of __privateGet(this, _offscreen)) {
          if (!keys.includes(k)) {
            destroy_effect(branch2.effect);
            __privateGet(this, _offscreen).delete(k);
          }
        }
      });
      this.anchor = anchor;
      __privateSet(this, _transition, transition);
    }
ensure(key, fn) {
      var batch = (
current_batch
      );
      if (fn && !__privateGet(this, _onscreen).has(key) && !__privateGet(this, _offscreen).has(key)) {
        {
          __privateGet(this, _onscreen).set(
            key,
            branch(() => fn(this.anchor))
          );
        }
      }
      __privateGet(this, _batches).set(batch, key);
      {
        __privateGet(this, _commit).call(this, batch);
      }
    }
  }
  _batches = new WeakMap();
  _onscreen = new WeakMap();
  _offscreen = new WeakMap();
  _outroing = new WeakMap();
  _transition = new WeakMap();
  _commit = new WeakMap();
  _discard = new WeakMap();
  function if_block(node, fn, elseif = false) {
    var branches = new BranchManager(node);
    var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
    function update_branch(key, fn2) {
      branches.ensure(key, fn2);
    }
    block(() => {
      var has_branch = false;
      fn((fn2, key = 0) => {
        has_branch = true;
        update_branch(key, fn2);
      });
      if (!has_branch) {
        update_branch(-1, null);
      }
    }, flags2);
  }
  function index(_, i) {
    return i;
  }
  function pause_effects(state2, to_destroy, controlled_anchor) {
    var transitions = [];
    var length = to_destroy.length;
    var group;
    var remaining = to_destroy.length;
    for (var i = 0; i < length; i++) {
      let effect2 = to_destroy[i];
      pause_effect(
        effect2,
        () => {
          if (group) {
            group.pending.delete(effect2);
            group.done.add(effect2);
            if (group.pending.size === 0) {
              var groups = (
state2.outrogroups
              );
              destroy_effects(state2, array_from(group.done));
              groups.delete(group);
              if (groups.size === 0) {
                state2.outrogroups = null;
              }
            }
          } else {
            remaining -= 1;
          }
        },
        false
      );
    }
    if (remaining === 0) {
      var fast_path = transitions.length === 0 && controlled_anchor !== null;
      if (fast_path) {
        var anchor = (
controlled_anchor
        );
        var parent_node = (
anchor.parentNode
        );
        clear_text_content(parent_node);
        parent_node.append(anchor);
        state2.items.clear();
      }
      destroy_effects(state2, to_destroy, !fast_path);
    } else {
      group = {
        pending: new Set(to_destroy),
        done: new Set()
      };
      (state2.outrogroups ?? (state2.outrogroups = new Set())).add(group);
    }
  }
  function destroy_effects(state2, to_destroy, remove_dom = true) {
    var preserved_effects;
    if (state2.pending.size > 0) {
      preserved_effects = new Set();
      for (const keys of state2.pending.values()) {
        for (const key of keys) {
          preserved_effects.add(
state2.items.get(key).e
          );
        }
      }
    }
    for (var i = 0; i < to_destroy.length; i++) {
      var e = to_destroy[i];
      if (preserved_effects == null ? void 0 : preserved_effects.has(e)) {
        e.f |= EFFECT_OFFSCREEN;
        const fragment = document.createDocumentFragment();
        move_effect(e, fragment);
      } else {
        destroy_effect(to_destroy[i], remove_dom);
      }
    }
  }
  var offscreen_anchor;
  function each(node, flags2, get_collection, get_key, render_fn2, fallback_fn = null) {
    var anchor = node;
    var items = new Map();
    var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
    if (is_controlled) {
      var parent_node = (
node
      );
      anchor = parent_node.appendChild(create_text());
    }
    var fallback = null;
    var each_array = derived_safe_equal(() => {
      var collection = get_collection();
      return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
    });
    var array;
    var pending2 = new Map();
    var first_run = true;
    function commit(batch) {
      if ((state2.effect.f & DESTROYED) !== 0) {
        return;
      }
      state2.pending.delete(batch);
      state2.fallback = fallback;
      reconcile(state2, array, anchor, flags2, get_key);
      if (fallback !== null) {
        if (array.length === 0) {
          if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
            resume_effect(fallback);
          } else {
            fallback.f ^= EFFECT_OFFSCREEN;
            move(fallback, null, anchor);
          }
        } else {
          pause_effect(fallback, () => {
            fallback = null;
          });
        }
      }
    }
    var effect2 = block(() => {
      array =
get(each_array);
      var length = array.length;
      var keys = new Set();
      var batch = (
current_batch
      );
      for (var index2 = 0; index2 < length; index2 += 1) {
        var value = array[index2];
        var key = get_key(value, index2);
        var item = first_run ? null : items.get(key);
        if (item) {
          if (item.v) internal_set(item.v, value);
          if (item.i) internal_set(item.i, index2);
        } else {
          item = create_item(
            items,
            first_run ? anchor : offscreen_anchor ?? (offscreen_anchor = create_text()),
            value,
            key,
            index2,
            render_fn2,
            flags2,
            get_collection
          );
          if (!first_run) {
            item.e.f |= EFFECT_OFFSCREEN;
          }
          items.set(key, item);
        }
        keys.add(key);
      }
      if (length === 0 && fallback_fn && !fallback) {
        if (first_run) {
          fallback = branch(() => fallback_fn(anchor));
        } else {
          fallback = branch(() => fallback_fn(offscreen_anchor ?? (offscreen_anchor = create_text())));
          fallback.f |= EFFECT_OFFSCREEN;
        }
      }
      if (length > keys.size) {
        {
          each_key_duplicate();
        }
      }
      if (!first_run) {
        pending2.set(batch, keys);
        {
          commit(batch);
        }
      }
      get(each_array);
    });
    var state2 = { effect: effect2, items, pending: pending2, outrogroups: null, fallback };
    first_run = false;
  }
  function skip_to_branch(effect2) {
    while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
      effect2 = effect2.next;
    }
    return effect2;
  }
  function reconcile(state2, array, anchor, flags2, get_key) {
    var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i;
    var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
    var length = array.length;
    var items = state2.items;
    var current = skip_to_branch(state2.effect.first);
    var seen;
    var prev = null;
    var to_animate;
    var matched = [];
    var stashed = [];
    var value;
    var key;
    var effect2;
    var i;
    if (is_animated) {
      for (i = 0; i < length; i += 1) {
        value = array[i];
        key = get_key(value, i);
        effect2 =
items.get(key).e;
        if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
          (_b2 = (_a2 = effect2.nodes) == null ? void 0 : _a2.a) == null ? void 0 : _b2.measure();
          (to_animate ?? (to_animate = new Set())).add(effect2);
        }
      }
    }
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      effect2 =
items.get(key).e;
      if (state2.outrogroups !== null) {
        for (const group of state2.outrogroups) {
          group.pending.delete(effect2);
          group.done.delete(effect2);
        }
      }
      if ((effect2.f & INERT) !== 0) {
        resume_effect(effect2);
        if (is_animated) {
          (_d = (_c2 = effect2.nodes) == null ? void 0 : _c2.a) == null ? void 0 : _d.unfix();
          (to_animate ?? (to_animate = new Set())).delete(effect2);
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
        effect2.f ^= EFFECT_OFFSCREEN;
        if (effect2 === current) {
          move(effect2, null, anchor);
        } else {
          var next = prev ? prev.next : current;
          if (effect2 === state2.effect.last) {
            state2.effect.last = effect2.prev;
          }
          if (effect2.prev) effect2.prev.next = effect2.next;
          if (effect2.next) effect2.next.prev = effect2.prev;
          link(state2, prev, effect2);
          link(state2, effect2, next);
          move(effect2, next, anchor);
          prev = effect2;
          matched = [];
          stashed = [];
          current = skip_to_branch(prev.next);
          continue;
        }
      }
      if (effect2 !== current) {
        if (seen !== void 0 && seen.has(effect2)) {
          if (matched.length < stashed.length) {
            var start = stashed[0];
            var j;
            prev = start.prev;
            var a = matched[0];
            var b = matched[matched.length - 1];
            for (j = 0; j < matched.length; j += 1) {
              move(matched[j], start, anchor);
            }
            for (j = 0; j < stashed.length; j += 1) {
              seen.delete(stashed[j]);
            }
            link(state2, a.prev, b.next);
            link(state2, prev, a);
            link(state2, b, start);
            current = start;
            prev = b;
            i -= 1;
            matched = [];
            stashed = [];
          } else {
            seen.delete(effect2);
            move(effect2, current, anchor);
            link(state2, effect2.prev, effect2.next);
            link(state2, effect2, prev === null ? state2.effect.first : prev.next);
            link(state2, prev, effect2);
            prev = effect2;
          }
          continue;
        }
        matched = [];
        stashed = [];
        while (current !== null && current !== effect2) {
          (seen ?? (seen = new Set())).add(current);
          stashed.push(current);
          current = skip_to_branch(current.next);
        }
        if (current === null) {
          continue;
        }
      }
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        matched.push(effect2);
      }
      prev = effect2;
      current = skip_to_branch(effect2.next);
    }
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        if (group.pending.size === 0) {
          destroy_effects(state2, array_from(group.done));
          (_e = state2.outrogroups) == null ? void 0 : _e.delete(group);
        }
      }
      if (state2.outrogroups.size === 0) {
        state2.outrogroups = null;
      }
    }
    if (current !== null || seen !== void 0) {
      var to_destroy = [];
      if (seen !== void 0) {
        for (effect2 of seen) {
          if ((effect2.f & INERT) === 0) {
            to_destroy.push(effect2);
          }
        }
      }
      while (current !== null) {
        if ((current.f & INERT) === 0 && current !== state2.fallback) {
          to_destroy.push(current);
        }
        current = skip_to_branch(current.next);
      }
      var destroy_length = to_destroy.length;
      if (destroy_length > 0) {
        var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
        if (is_animated) {
          for (i = 0; i < destroy_length; i += 1) {
            (_g = (_f = to_destroy[i].nodes) == null ? void 0 : _f.a) == null ? void 0 : _g.measure();
          }
          for (i = 0; i < destroy_length; i += 1) {
            (_i = (_h = to_destroy[i].nodes) == null ? void 0 : _h.a) == null ? void 0 : _i.fix();
          }
        }
        pause_effects(state2, to_destroy, controlled_anchor);
      }
    }
    if (is_animated) {
      queue_micro_task(() => {
        var _a3, _b3;
        if (to_animate === void 0) return;
        for (effect2 of to_animate) {
          (_b3 = (_a3 = effect2.nodes) == null ? void 0 : _a3.a) == null ? void 0 : _b3.apply();
        }
      });
    }
  }
  function create_item(items, anchor, value, key, index2, render_fn2, flags2, get_collection) {
    var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
    var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
    return {
      v,
      i,
      e: branch(() => {
        render_fn2(anchor, v ?? value, i ?? index2, get_collection);
        return () => {
          items.delete(key);
        };
      })
    };
  }
  function move(effect2, next, anchor) {
    if (!effect2.nodes) return;
    var node = effect2.nodes.start;
    var end = effect2.nodes.end;
    var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? (
next.nodes.start
    ) : anchor;
    while (node !== null) {
      var next_node = (

get_next_sibling(node)
      );
      dest.before(node);
      if (node === end) {
        return;
      }
      node = next_node;
    }
  }
  function link(state2, prev, next) {
    if (prev === null) {
      state2.effect.first = next;
    } else {
      prev.next = next;
    }
    if (next === null) {
      state2.effect.last = prev;
    } else {
      next.prev = prev;
    }
  }
  function slot(anchor, $$props, name, slot_props, fallback_fn) {
    var _a2;
    var slot_fn = (_a2 = $$props.$$slots) == null ? void 0 : _a2[name];
    var is_interop = false;
    if (slot_fn === true) {
      slot_fn = $$props["children"];
      is_interop = true;
    }
    if (slot_fn === void 0) ;
    else {
      slot_fn(anchor, is_interop ? () => slot_props : slot_props);
    }
  }
  function snippet(node, get_snippet, ...args) {
    var branches = new BranchManager(node);
    block(() => {
      const snippet2 = get_snippet() ?? null;
      branches.ensure(snippet2, snippet2 && ((anchor) => snippet2(anchor, ...args)));
    }, EFFECT_TRANSPARENT);
  }
  function component(node, get_component, render_fn2) {
    var branches = new BranchManager(node);
    block(() => {
      var component2 = get_component() ?? null;
      branches.ensure(component2, component2 && ((target) => render_fn2(target, component2)));
    }, EFFECT_TRANSPARENT);
  }
  const now = () => performance.now();
  const raf = {


tick: (
(_) => requestAnimationFrame(_)
    ),
    now: () => now(),
    tasks: new Set()
  };
  function run_tasks() {
    const now2 = raf.now();
    raf.tasks.forEach((task) => {
      if (!task.c(now2)) {
        raf.tasks.delete(task);
        task.f();
      }
    });
    if (raf.tasks.size !== 0) {
      raf.tick(run_tasks);
    }
  }
  function loop(callback) {
    let task;
    if (raf.tasks.size === 0) {
      raf.tick(run_tasks);
    }
    return {
      promise: new Promise((fulfill) => {
        raf.tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        raf.tasks.delete(task);
      }
    };
  }
  function element(node, get_tag, is_svg, render_fn2, get_namespace, location2) {
    var element2 = null;
    var anchor = (
node
    );
    var branches = new BranchManager(anchor, false);
    block(() => {
      const next_tag = get_tag() || null;
      var ns = NAMESPACE_SVG;
      if (next_tag === null) {
        branches.ensure(null, null);
        return;
      }
      branches.ensure(next_tag, (anchor2) => {
        if (next_tag) {
          element2 = create_element(next_tag, ns);
          assign_nodes(element2, element2);
          if (render_fn2) {
            var child_anchor = element2.appendChild(create_text());
            render_fn2(element2, child_anchor);
          }
          active_effect.nodes.end = element2;
          anchor2.before(element2);
        }
      });
      return () => {
      };
    }, EFFECT_TRANSPARENT);
    teardown(() => {
    });
  }
  function action(dom, action2, get_value) {
    effect(() => {
      var payload = untrack(() => action2(dom, get_value == null ? void 0 : get_value()) || {});
      if (get_value && (payload == null ? void 0 : payload.update)) {
        var inited = false;
        var prev = (
{}
        );
        render_effect(() => {
          var value = get_value();
          deep_read_state(value);
          if (inited && safe_not_equal(prev, value)) {
            prev = value;
            payload.update(value);
          }
        });
        inited = true;
      }
      if (payload == null ? void 0 : payload.destroy) {
        return () => (
payload.destroy()
        );
      }
    });
  }
  function attach(node, get_fn) {
    var fn = void 0;
    var e;
    managed(() => {
      if (fn !== (fn = get_fn())) {
        if (e) {
          destroy_effect(e);
          e = null;
        }
        if (fn) {
          e = branch(() => {
            effect(() => (
fn(node)
            ));
          });
        }
      }
    });
  }
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx$1() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }
  function clsx(value) {
    if (typeof value === "object") {
      return clsx$1(value);
    } else {
      return value ?? "";
    }
  }
  const whitespace = [..." 	\n\r\f \v\uFEFF"];
  function to_class(value, hash, directives) {
    var classname = value == null ? "" : "" + value;
    if (hash) {
      classname = classname ? classname + " " + hash : hash;
    }
    if (directives) {
      for (var key of Object.keys(directives)) {
        if (directives[key]) {
          classname = classname ? classname + " " + key : key;
        } else if (classname.length) {
          var len = key.length;
          var a = 0;
          while ((a = classname.indexOf(key, a)) >= 0) {
            var b = a + len;
            if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
              classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
            } else {
              a = b;
            }
          }
        }
      }
    }
    return classname === "" ? null : classname;
  }
  function append_styles(styles, important = false) {
    var separator = important ? " !important;" : ";";
    var css = "";
    for (var key of Object.keys(styles)) {
      var value = styles[key];
      if (value != null && value !== "") {
        css += " " + key + ": " + value + separator;
      }
    }
    return css;
  }
  function to_css_name(name) {
    if (name[0] !== "-" || name[1] !== "-") {
      return name.toLowerCase();
    }
    return name;
  }
  function to_style(value, styles) {
    if (styles) {
      var new_style = "";
      var normal_styles;
      var important_styles;
      if (Array.isArray(styles)) {
        normal_styles = styles[0];
        important_styles = styles[1];
      } else {
        normal_styles = styles;
      }
      if (value) {
        value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
        var in_str = false;
        var in_apo = 0;
        var in_comment = false;
        var reserved_names = [];
        if (normal_styles) {
          reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
        }
        if (important_styles) {
          reserved_names.push(...Object.keys(important_styles).map(to_css_name));
        }
        var start_index = 0;
        var name_index = -1;
        const len = value.length;
        for (var i = 0; i < len; i++) {
          var c = value[i];
          if (in_comment) {
            if (c === "/" && value[i - 1] === "*") {
              in_comment = false;
            }
          } else if (in_str) {
            if (in_str === c) {
              in_str = false;
            }
          } else if (c === "/" && value[i + 1] === "*") {
            in_comment = true;
          } else if (c === '"' || c === "'") {
            in_str = c;
          } else if (c === "(") {
            in_apo++;
          } else if (c === ")") {
            in_apo--;
          }
          if (!in_comment && in_str === false && in_apo === 0) {
            if (c === ":" && name_index === -1) {
              name_index = i;
            } else if (c === ";" || i === len - 1) {
              if (name_index !== -1) {
                var name = to_css_name(value.substring(start_index, name_index).trim());
                if (!reserved_names.includes(name)) {
                  if (c !== ";") {
                    i++;
                  }
                  var property = value.substring(start_index, i).trim();
                  new_style += " " + property + ";";
                }
              }
              start_index = i + 1;
              name_index = -1;
            }
          }
        }
      }
      if (normal_styles) {
        new_style += append_styles(normal_styles);
      }
      if (important_styles) {
        new_style += append_styles(important_styles, true);
      }
      new_style = new_style.trim();
      return new_style === "" ? null : new_style;
    }
    return value == null ? null : String(value);
  }
  function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
    var prev = dom.__className;
    if (prev !== value || prev === void 0) {
      var next_class_name = to_class(value, hash, next_classes);
      {
        if (next_class_name == null) {
          dom.removeAttribute("class");
        } else if (is_html) {
          dom.className = next_class_name;
        } else {
          dom.setAttribute("class", next_class_name);
        }
      }
      dom.__className = value;
    } else if (next_classes && prev_classes !== next_classes) {
      for (var key in next_classes) {
        var is_present = !!next_classes[key];
        if (prev_classes == null || is_present !== !!prev_classes[key]) {
          dom.classList.toggle(key, is_present);
        }
      }
    }
    return next_classes;
  }
  function update_styles(dom, prev = {}, next, priority) {
    for (var key in next) {
      var value = next[key];
      if (prev[key] !== value) {
        if (next[key] == null) {
          dom.style.removeProperty(key);
        } else {
          dom.style.setProperty(key, value, priority);
        }
      }
    }
  }
  function set_style(dom, value, prev_styles, next_styles) {
    var prev = dom.__style;
    if (prev !== value) {
      var next_style_attr = to_style(value, next_styles);
      {
        if (next_style_attr == null) {
          dom.removeAttribute("style");
        } else {
          dom.style.cssText = next_style_attr;
        }
      }
      dom.__style = value;
    } else if (next_styles) {
      if (Array.isArray(next_styles)) {
        update_styles(dom, prev_styles == null ? void 0 : prev_styles[0], next_styles[0]);
        update_styles(dom, prev_styles == null ? void 0 : prev_styles[1], next_styles[1], "important");
      } else {
        update_styles(dom, prev_styles, next_styles);
      }
    }
    return next_styles;
  }
  function select_option(select, value, mounting = false) {
    if (select.multiple) {
      if (value == void 0) {
        return;
      }
      if (!is_array(value)) {
        return select_multiple_invalid_value();
      }
      for (var option of select.options) {
        option.selected = value.includes(get_option_value(option));
      }
      return;
    }
    for (option of select.options) {
      var option_value = get_option_value(option);
      if (is(option_value, value)) {
        option.selected = true;
        return;
      }
    }
    if (!mounting || value !== void 0) {
      select.selectedIndex = -1;
    }
  }
  function init_select(select) {
    var observer = new MutationObserver(() => {
      select_option(select, select.__value);
    });
    observer.observe(select, {
childList: true,
      subtree: true,



attributes: true,
      attributeFilter: ["value"]
    });
    teardown(() => {
      observer.disconnect();
    });
  }
  function get_option_value(option) {
    if ("__value" in option) {
      return option.__value;
    } else {
      return option.value;
    }
  }
  const CLASS = Symbol("class");
  const STYLE = Symbol("style");
  const IS_CUSTOM_ELEMENT = Symbol("is custom element");
  const IS_HTML = Symbol("is html");
  const OPTION_TAG = IS_XHTML ? "option" : "OPTION";
  const SELECT_TAG = IS_XHTML ? "select" : "SELECT";
  const PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
  function set_value(element2, value) {
    var attributes = get_attributes(element2);
    if (attributes.value === (attributes.value =
value ?? void 0) ||

element2.value === value && (value !== 0 || element2.nodeName !== PROGRESS_TAG)) {
      return;
    }
    element2.value = value ?? "";
  }
  function set_checked(element2, checked) {
    var attributes = get_attributes(element2);
    if (attributes.checked === (attributes.checked =
checked ?? void 0)) {
      return;
    }
    element2.checked = checked;
  }
  function set_selected(element2, selected) {
    if (selected) {
      if (!element2.hasAttribute("selected")) {
        element2.setAttribute("selected", "");
      }
    } else {
      element2.removeAttribute("selected");
    }
  }
  function set_attribute(element2, attribute, value, skip_warning) {
    var attributes = get_attributes(element2);
    if (attributes[attribute] === (attributes[attribute] = value)) return;
    if (attribute === "loading") {
      element2[LOADING_ATTR_SYMBOL] = value;
    }
    if (value == null) {
      element2.removeAttribute(attribute);
    } else if (typeof value !== "string" && get_setters(element2).includes(attribute)) {
      element2[attribute] = value;
    } else {
      element2.setAttribute(attribute, value);
    }
  }
  function set_attributes(element2, prev, next, css_hash, should_remove_defaults = false, skip_warning = false) {
    var attributes = get_attributes(element2);
    var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
    var preserve_attribute_case = !attributes[IS_HTML];
    var current = prev || {};
    var is_option_element = element2.nodeName === OPTION_TAG;
    for (var key in prev) {
      if (!(key in next)) {
        next[key] = null;
      }
    }
    if (next.class) {
      next.class = clsx(next.class);
    } else if (next[CLASS]) {
      next.class = null;
    }
    if (next[STYLE]) {
      next.style ?? (next.style = null);
    }
    var setters = get_setters(element2);
    for (const key2 in next) {
      let value = next[key2];
      if (is_option_element && key2 === "value" && value == null) {
        element2.value = element2.__value = "";
        current[key2] = value;
        continue;
      }
      if (key2 === "class") {
        var is_html = element2.namespaceURI === "http://www.w3.org/1999/xhtml";
        set_class(element2, is_html, value, css_hash, prev == null ? void 0 : prev[CLASS], next[CLASS]);
        current[key2] = value;
        current[CLASS] = next[CLASS];
        continue;
      }
      if (key2 === "style") {
        set_style(element2, value, prev == null ? void 0 : prev[STYLE], next[STYLE]);
        current[key2] = value;
        current[STYLE] = next[STYLE];
        continue;
      }
      var prev_value = current[key2];
      if (value === prev_value && !(value === void 0 && element2.hasAttribute(key2))) {
        continue;
      }
      current[key2] = value;
      var prefix = key2[0] + key2[1];
      if (prefix === "$$") continue;
      if (prefix === "on") {
        const opts = {};
        const event_handle_key = "$$" + key2;
        let event_name = key2.slice(2);
        var is_delegated = can_delegate_event(event_name);
        if (is_capture_event(event_name)) {
          event_name = event_name.slice(0, -7);
          opts.capture = true;
        }
        if (!is_delegated && prev_value) {
          if (value != null) continue;
          element2.removeEventListener(event_name, current[event_handle_key], opts);
          current[event_handle_key] = null;
        }
        if (is_delegated) {
          delegated(event_name, element2, value);
          delegate([event_name]);
        } else if (value != null) {
          let handle = function(evt) {
            current[key2].call(this, evt);
          };
          current[event_handle_key] = create_event(event_name, element2, handle, opts);
        }
      } else if (key2 === "style") {
        set_attribute(element2, key2, value);
      } else if (key2 === "autofocus") {
        autofocus(
element2,
          Boolean(value)
        );
      } else if (!is_custom_element && (key2 === "__value" || key2 === "value" && value != null)) {
        element2.value = element2.__value = value;
      } else if (key2 === "selected" && is_option_element) {
        set_selected(
element2,
          value
        );
      } else {
        var name = key2;
        if (!preserve_attribute_case) {
          name = normalize_attribute(name);
        }
        var is_default = name === "defaultValue" || name === "defaultChecked";
        if (value == null && !is_custom_element && !is_default) {
          attributes[key2] = null;
          if (name === "value" || name === "checked") {
            let input = (
element2
            );
            const use_default = prev === void 0;
            if (name === "value") {
              let previous = input.defaultValue;
              input.removeAttribute(name);
              input.defaultValue = previous;
              input.value = input.__value = use_default ? previous : null;
            } else {
              let previous = input.defaultChecked;
              input.removeAttribute(name);
              input.defaultChecked = previous;
              input.checked = use_default ? previous : false;
            }
          } else {
            element2.removeAttribute(key2);
          }
        } else if (is_default || setters.includes(name) && (is_custom_element || typeof value !== "string")) {
          element2[name] = value;
          if (name in attributes) attributes[name] = UNINITIALIZED;
        } else if (typeof value !== "function") {
          set_attribute(element2, name, value);
        }
      }
    }
    return current;
  }
  function attribute_effect(element2, fn, sync = [], async = [], blockers = [], css_hash, should_remove_defaults = false, skip_warning = false) {
    flatten(blockers, sync, async, (values) => {
      var prev = void 0;
      var effects = {};
      var is_select = element2.nodeName === SELECT_TAG;
      var inited = false;
      managed(() => {
        var next = fn(...values.map(get));
        var current = set_attributes(
          element2,
          prev,
          next,
          css_hash,
          should_remove_defaults,
          skip_warning
        );
        if (inited && is_select && "value" in next) {
          select_option(
element2,
            next.value
          );
        }
        for (let symbol of Object.getOwnPropertySymbols(effects)) {
          if (!next[symbol]) destroy_effect(effects[symbol]);
        }
        for (let symbol of Object.getOwnPropertySymbols(next)) {
          var n = next[symbol];
          if (symbol.description === ATTACHMENT_KEY && (!prev || n !== prev[symbol])) {
            if (effects[symbol]) destroy_effect(effects[symbol]);
            effects[symbol] = branch(() => attach(element2, () => n));
          }
          current[symbol] = n;
        }
        prev = current;
      });
      if (is_select) {
        var select = (
element2
        );
        effect(() => {
          select_option(
            select,
prev.value,
            true
          );
          init_select(select);
        });
      }
      inited = true;
    });
  }
  function get_attributes(element2) {
    return (

element2.__attributes ?? (element2.__attributes = {
        [IS_CUSTOM_ELEMENT]: element2.nodeName.includes("-"),
        [IS_HTML]: element2.namespaceURI === NAMESPACE_HTML
      })
    );
  }
  var setters_cache = new Map();
  function get_setters(element2) {
    var cache_key = element2.getAttribute("is") || element2.nodeName;
    var setters = setters_cache.get(cache_key);
    if (setters) return setters;
    setters_cache.set(cache_key, setters = []);
    var descriptors;
    var proto = element2;
    var element_proto = Element.prototype;
    while (element_proto !== proto) {
      descriptors = get_descriptors(proto);
      for (var key in descriptors) {
        if (descriptors[key].set) {
          setters.push(key);
        }
      }
      proto = get_prototype_of(proto);
    }
    return setters;
  }
  function bind_value(input, get2, set2 = get2) {
    var batches2 = new WeakSet();
    listen_to_event_and_reset_event(input, "input", async (is_reset) => {
      var value = is_reset ? input.defaultValue : input.value;
      value = is_numberlike_input(input) ? to_number(value) : value;
      set2(value);
      if (current_batch !== null) {
        batches2.add(current_batch);
      }
      await tick();
      if (value !== (value = get2())) {
        var start = input.selectionStart;
        var end = input.selectionEnd;
        var length = input.value.length;
        input.value = value ?? "";
        if (end !== null) {
          var new_length = input.value.length;
          if (start === end && end === length && new_length > length) {
            input.selectionStart = new_length;
            input.selectionEnd = new_length;
          } else {
            input.selectionStart = start;
            input.selectionEnd = Math.min(end, new_length);
          }
        }
      }
    });
    if (



untrack(get2) == null && input.value
    ) {
      set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
      if (current_batch !== null) {
        batches2.add(current_batch);
      }
    }
    render_effect(() => {
      var value = get2();
      if (input === document.activeElement) {
        var batch = (
current_batch
        );
        if (batches2.has(batch)) {
          return;
        }
      }
      if (is_numberlike_input(input) && value === to_number(input.value)) {
        return;
      }
      if (input.type === "date" && !value && !input.value) {
        return;
      }
      if (value !== input.value) {
        input.value = value ?? "";
      }
    });
  }
  const pending = new Set();
  function bind_group(inputs, group_index, input, get2, set2 = get2) {
    var is_checkbox = input.getAttribute("type") === "checkbox";
    var binding_group = inputs;
    if (group_index !== null) {
      for (var index2 of group_index) {
        binding_group = binding_group[index2] ?? (binding_group[index2] = []);
      }
    }
    binding_group.push(input);
    listen_to_event_and_reset_event(
      input,
      "change",
      () => {
        var value = input.__value;
        if (is_checkbox) {
          value = get_binding_group_value(binding_group, value, input.checked);
        }
        set2(value);
      },
() => set2(is_checkbox ? [] : null)
    );
    render_effect(() => {
      var value = get2();
      if (is_checkbox) {
        value = value || [];
        input.checked = value.includes(input.__value);
      } else {
        input.checked = is(input.__value, value);
      }
    });
    teardown(() => {
      var index3 = binding_group.indexOf(input);
      if (index3 !== -1) {
        binding_group.splice(index3, 1);
      }
    });
    if (!pending.has(binding_group)) {
      pending.add(binding_group);
      queue_micro_task(() => {
        binding_group.sort((a, b) => a.compareDocumentPosition(b) === 4 ? -1 : 1);
        pending.delete(binding_group);
      });
    }
    queue_micro_task(() => {
    });
  }
  function get_binding_group_value(group, __value, checked) {
    var value = new Set();
    for (var i = 0; i < group.length; i += 1) {
      if (group[i].checked) {
        value.add(group[i].__value);
      }
    }
    if (!checked) {
      value.delete(__value);
    }
    return Array.from(value);
  }
  function is_numberlike_input(input) {
    var type = input.type;
    return type === "number" || type === "range";
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function bind_prop(props, prop2, value) {
    var desc = get_descriptor(props, prop2);
    if (desc && desc.set) {
      props[prop2] = value;
      teardown(() => {
        props[prop2] = null;
      });
    }
  }
  function is_bound_this(bound_value, element_or_component) {
    return bound_value === element_or_component || (bound_value == null ? void 0 : bound_value[STATE_SYMBOL]) === element_or_component;
  }
  function bind_this(element_or_component = {}, update2, get_value, get_parts) {
    var component_effect = (
component_context.r
    );
    var parent = (
active_effect
    );
    effect(() => {
      var old_parts;
      var parts;
      render_effect(() => {
        old_parts = parts;
        parts = (get_parts == null ? void 0 : get_parts()) || [];
        untrack(() => {
          if (element_or_component !== get_value(...parts)) {
            update2(element_or_component, ...parts);
            if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
              update2(null, ...old_parts);
            }
          }
        });
      });
      return () => {
        let p = parent;
        while (p !== component_effect && p.parent !== null && p.parent.f & DESTROYING) {
          p = p.parent;
        }
        const teardown2 = () => {
          if (parts && is_bound_this(get_value(...parts), element_or_component)) {
            update2(null, ...parts);
          }
        };
        const original_teardown = p.teardown;
        p.teardown = () => {
          teardown2();
          original_teardown == null ? void 0 : original_teardown();
        };
      };
    });
    return element_or_component;
  }
  function init(immutable = false) {
    const context = (
component_context
    );
    const callbacks = context.l.u;
    if (!callbacks) return;
    let props = () => deep_read_state(context.s);
    if (immutable) {
      let version = 0;
      let prev = (
{}
      );
      const d = derived(() => {
        let changed = false;
        const props2 = context.s;
        for (const key in props2) {
          if (props2[key] !== prev[key]) {
            prev[key] = props2[key];
            changed = true;
          }
        }
        if (changed) version++;
        return version;
      });
      props = () => get(d);
    }
    if (callbacks.b.length) {
      user_pre_effect(() => {
        observe_all(context, props);
        run_all(callbacks.b);
      });
    }
    user_effect(() => {
      const fns = untrack(() => callbacks.m.map(run));
      return () => {
        for (const fn of fns) {
          if (typeof fn === "function") {
            fn();
          }
        }
      };
    });
    if (callbacks.a.length) {
      user_effect(() => {
        observe_all(context, props);
        run_all(callbacks.a);
      });
    }
  }
  function observe_all(context, props) {
    if (context.l.s) {
      for (const signal of context.l.s) get(signal);
    }
    props();
  }
  const legacy_rest_props_handler = {
    get(target, key) {
      if (target.exclude.includes(key)) return;
      get(target.version);
      return key in target.special ? target.special[key]() : target.props[key];
    },
    set(target, key, value) {
      if (!(key in target.special)) {
        var previous_effect = active_effect;
        try {
          set_active_effect(target.parent_effect);
          target.special[key] = prop(
            {
              get [key]() {
                return target.props[key];
              }
            },
key,
            PROPS_IS_UPDATED
          );
        } finally {
          set_active_effect(previous_effect);
        }
      }
      target.special[key](value);
      update(target.version);
      return true;
    },
    getOwnPropertyDescriptor(target, key) {
      if (target.exclude.includes(key)) return;
      if (key in target.props) {
        return {
          enumerable: true,
          configurable: true,
          value: target.props[key]
        };
      }
    },
    deleteProperty(target, key) {
      if (target.exclude.includes(key)) return true;
      target.exclude.push(key);
      update(target.version);
      return true;
    },
    has(target, key) {
      if (target.exclude.includes(key)) return false;
      return key in target.props;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
    }
  };
  function legacy_rest_props(props, exclude) {
    return new Proxy(
      {
        props,
        exclude,
        special: {},
        version: source(0),


parent_effect: (
active_effect
        )
      },
      legacy_rest_props_handler
    );
  }
  const spread_props_handler = {
    get(target, key) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        if (typeof p === "object" && p !== null && key in p) return p[key];
      }
    },
    set(target, key, value) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        const desc = get_descriptor(p, key);
        if (desc && desc.set) {
          desc.set(value);
          return true;
        }
      }
      return false;
    },
    getOwnPropertyDescriptor(target, key) {
      let i = target.props.length;
      while (i--) {
        let p = target.props[i];
        if (is_function(p)) p = p();
        if (typeof p === "object" && p !== null && key in p) {
          const descriptor = get_descriptor(p, key);
          if (descriptor && !descriptor.configurable) {
            descriptor.configurable = true;
          }
          return descriptor;
        }
      }
    },
    has(target, key) {
      if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
      for (let p of target.props) {
        if (is_function(p)) p = p();
        if (p != null && key in p) return true;
      }
      return false;
    },
    ownKeys(target) {
      const keys = [];
      for (let p of target.props) {
        if (is_function(p)) p = p();
        if (!p) continue;
        for (const key in p) {
          if (!keys.includes(key)) keys.push(key);
        }
        for (const key of Object.getOwnPropertySymbols(p)) {
          if (!keys.includes(key)) keys.push(key);
        }
      }
      return keys;
    }
  };
  function spread_props(...props) {
    return new Proxy({ props }, spread_props_handler);
  }
  function prop(props, key, flags2, fallback) {
    var _a2;
    var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
    var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
    var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
    var fallback_value = (
fallback
    );
    var fallback_dirty = true;
    var get_fallback = () => {
      if (fallback_dirty) {
        fallback_dirty = false;
        fallback_value = lazy ? untrack(
fallback
        ) : (
fallback
        );
      }
      return fallback_value;
    };
    let setter;
    if (bindable) {
      var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
      setter = ((_a2 = get_descriptor(props, key)) == null ? void 0 : _a2.set) ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
    }
    var initial_value;
    var is_store_sub = false;
    if (bindable) {
      [initial_value, is_store_sub] = capture_store_binding(() => (
props[key]
      ));
    } else {
      initial_value =
props[key];
    }
    if (initial_value === void 0 && fallback !== void 0) {
      initial_value = get_fallback();
      if (setter) {
        if (runes) props_invalid_value();
        setter(initial_value);
      }
    }
    var getter;
    if (runes) {
      getter = () => {
        var value = (
props[key]
        );
        if (value === void 0) return get_fallback();
        fallback_dirty = true;
        return value;
      };
    } else {
      getter = () => {
        var value = (
props[key]
        );
        if (value !== void 0) {
          fallback_value =
void 0;
        }
        return value === void 0 ? fallback_value : value;
      };
    }
    if (runes && (flags2 & PROPS_IS_UPDATED) === 0) {
      return getter;
    }
    if (setter) {
      var legacy_parent = props.$$legacy;
      return (
(function(value, mutation) {
          if (arguments.length > 0) {
            if (!runes || !mutation || legacy_parent || is_store_sub) {
              setter(mutation ? getter() : value);
            }
            return value;
          }
          return getter();
        })
      );
    }
    var overridden = false;
    var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
      overridden = false;
      return getter();
    });
    if (bindable) get(d);
    var parent_effect = (
active_effect
    );
    return (
(function(value, mutation) {
        if (arguments.length > 0) {
          const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
          set(d, new_value);
          overridden = true;
          if (fallback_value !== void 0) {
            fallback_value = new_value;
          }
          return value;
        }
        if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
          return d.v;
        }
        return get(d);
      })
    );
  }
  function onMount(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    if (legacy_mode_flag && component_context.l !== null) {
      init_update_callbacks(component_context).m.push(fn);
    } else {
      user_effect(() => {
        const cleanup = untrack(fn);
        if (typeof cleanup === "function") return (
cleanup
        );
      });
    }
  }
  function onDestroy(fn) {
    if (component_context === null) {
      lifecycle_outside_component();
    }
    onMount(() => () => untrack(fn));
  }
  function init_update_callbacks(context) {
    var l = (
context.l
    );
    return l.u ?? (l.u = { a: [], b: [], m: [] });
  }
  const PUBLIC_VERSION = "5";
  if (typeof window !== "undefined") {
    ((_c = window.__svelte ?? (window.__svelte = {})).v ?? (_c.v = new Set())).add(PUBLIC_VERSION);
  }
  enable_legacy_mode_flag();
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };
  var root$j = from_svg(`<svg><!><!></svg>`);
  function Icon($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    const $$restProps = legacy_rest_props($$sanitized_props, [
      "name",
      "color",
      "size",
      "strokeWidth",
      "absoluteStrokeWidth",
      "iconNode"
    ]);
    push($$props, false);
    let name = prop($$props, "name", 8, void 0);
    let color = prop($$props, "color", 8, "currentColor");
    let size = prop($$props, "size", 8, 24);
    let strokeWidth = prop($$props, "strokeWidth", 8, 2);
    let absoluteStrokeWidth = prop($$props, "absoluteStrokeWidth", 8, false);
    let iconNode = prop($$props, "iconNode", 24, () => []);
    const mergeClasses = (...classes) => classes.filter((className, index2, array) => {
      return Boolean(className) && array.indexOf(className) === index2;
    }).join(" ");
    init();
    var svg = root$j();
    attribute_effect(
      svg,
      ($0, $1) => ({
        ...defaultAttributes,
        ...$$restProps,
        width: size(),
        height: size(),
        stroke: color(),
        "stroke-width": $0,
        class: $1
      }),
      [
        () => (deep_read_state(absoluteStrokeWidth()), deep_read_state(strokeWidth()), deep_read_state(size()), untrack(() => absoluteStrokeWidth() ? Number(strokeWidth()) * 24 / Number(size()) : strokeWidth())),
        () => (deep_read_state(name()), deep_read_state($$sanitized_props), untrack(() => mergeClasses("lucide-icon", "lucide", name() ? `lucide-${name()}` : "", $$sanitized_props.class)))
      ]
    );
    var node = child(svg);
    each(node, 1, iconNode, index, ($$anchor2, $$item) => {
      var $$array = user_derived(() => to_array(get($$item), 2));
      let tag = () => get($$array)[0];
      let attrs = () => get($$array)[1];
      var fragment = comment();
      var node_1 = first_child(fragment);
      element(node_1, tag, true, ($$element, $$anchor3) => {
        attribute_effect($$element, () => ({ ...attrs() }));
      });
      append($$anchor2, fragment);
    });
    var node_2 = sibling(node);
    slot(node_2, $$props, "default", {});
    append($$anchor, svg);
    pop();
  }
  function Archive($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        { "width": "20", "height": "5", "x": "2", "y": "3", "rx": "1" }
      ],
      ["path", { "d": "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }],
      ["path", { "d": "M10 12h4" }]
    ];
    Icon($$anchor, spread_props({ name: "archive" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Bot($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M12 8V4H8" }],
      [
        "rect",
        { "width": "16", "height": "12", "x": "4", "y": "8", "rx": "2" }
      ],
      ["path", { "d": "M2 14h2" }],
      ["path", { "d": "M20 14h2" }],
      ["path", { "d": "M15 13v2" }],
      ["path", { "d": "M9 13v2" }]
    ];
    Icon($$anchor, spread_props({ name: "bot" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Chart_column($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M3 3v16a2 2 0 0 0 2 2h16" }],
      ["path", { "d": "M18 17V9" }],
      ["path", { "d": "M13 17V5" }],
      ["path", { "d": "M8 17v-3" }]
    ];
    Icon($$anchor, spread_props({ name: "chart-column" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Chevron_right($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
    Icon($$anchor, spread_props({ name: "chevron-right" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Circle_check_big($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M21.801 10A10 10 0 1 1 17 3.335" }],
      ["path", { "d": "m9 11 3 3L22 4" }]
    ];
    Icon($$anchor, spread_props({ name: "circle-check-big" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Circle_help($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "10" }],
      ["path", { "d": "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
      ["path", { "d": "M12 17h.01" }]
    ];
    Icon($$anchor, spread_props({ name: "circle-help" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Circle_x($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "10" }],
      ["path", { "d": "m15 9-6 6" }],
      ["path", { "d": "m9 9 6 6" }]
    ];
    Icon($$anchor, spread_props({ name: "circle-x" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Clipboard($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        {
          "width": "8",
          "height": "4",
          "x": "8",
          "y": "2",
          "rx": "1",
          "ry": "1"
        }
      ],
      [
        "path",
        {
          "d": "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "clipboard" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Clock($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "10" }],
      ["polyline", { "points": "12 6 12 12 16 14" }]
    ];
    Icon($$anchor, spread_props({ name: "clock" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Copy($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        {
          "width": "14",
          "height": "14",
          "x": "8",
          "y": "8",
          "rx": "2",
          "ry": "2"
        }
      ],
      [
        "path",
        {
          "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "copy" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Cpu($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        { "width": "16", "height": "16", "x": "4", "y": "4", "rx": "2" }
      ],
      [
        "rect",
        { "width": "6", "height": "6", "x": "9", "y": "9", "rx": "1" }
      ],
      ["path", { "d": "M15 2v2" }],
      ["path", { "d": "M15 20v2" }],
      ["path", { "d": "M2 15h2" }],
      ["path", { "d": "M2 9h2" }],
      ["path", { "d": "M20 15h2" }],
      ["path", { "d": "M20 9h2" }],
      ["path", { "d": "M9 2v2" }],
      ["path", { "d": "M9 20v2" }]
    ];
    Icon($$anchor, spread_props({ name: "cpu" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Download($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
      ["polyline", { "points": "7 10 12 15 17 10" }],
      ["line", { "x1": "12", "x2": "12", "y1": "15", "y2": "3" }]
    ];
    Icon($$anchor, spread_props({ name: "download" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function External_link($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M15 3h6v6" }],
      ["path", { "d": "M10 14 21 3" }],
      [
        "path",
        {
          "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "external-link" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Eye_off($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
        }
      ],
      ["path", { "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
      [
        "path",
        {
          "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
        }
      ],
      ["path", { "d": "m2 2 20 20" }]
    ];
    Icon($$anchor, spread_props({ name: "eye-off" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Eye($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        }
      ],
      ["circle", { "cx": "12", "cy": "12", "r": "3" }]
    ];
    Icon($$anchor, spread_props({ name: "eye" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function File_text($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
        }
      ],
      ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
      ["path", { "d": "M10 9H8" }],
      ["path", { "d": "M16 13H8" }],
      ["path", { "d": "M16 17H8" }]
    ];
    Icon($$anchor, spread_props({ name: "file-text" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Folder_open($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "folder-open" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Git_merge($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "18", "cy": "18", "r": "3" }],
      ["circle", { "cx": "6", "cy": "6", "r": "3" }],
      ["path", { "d": "M6 21V9a9 9 0 0 0 9 9" }]
    ];
    Icon($$anchor, spread_props({ name: "git-merge" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Heart($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "heart" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function History($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        { "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }
      ],
      ["path", { "d": "M3 3v5h5" }],
      ["path", { "d": "M12 7v5l4 2" }]
    ];
    Icon($$anchor, spread_props({ name: "history" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Log_out($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
      ["polyline", { "points": "16 17 21 12 16 7" }],
      ["line", { "x1": "21", "x2": "9", "y1": "12", "y2": "12" }]
    ];
    Icon($$anchor, spread_props({ name: "log-out" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Moon($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [["path", { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]];
    Icon($$anchor, spread_props({ name: "moon" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Play($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [["polygon", { "points": "6 3 20 12 6 21 6 3" }]];
    Icon($$anchor, spread_props({ name: "play" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Refresh_cw($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        { "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }
      ],
      ["path", { "d": "M21 3v5h-5" }],
      [
        "path",
        { "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }
      ],
      ["path", { "d": "M8 16H3v5" }]
    ];
    Icon($$anchor, spread_props({ name: "refresh-cw" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Save($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
        }
      ],
      ["path", { "d": "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }],
      ["path", { "d": "M7 3v4a1 1 0 0 0 1 1h7" }]
    ];
    Icon($$anchor, spread_props({ name: "save" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Search($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "11", "cy": "11", "r": "8" }],
      ["path", { "d": "m21 21-4.3-4.3" }]
    ];
    Icon($$anchor, spread_props({ name: "search" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Settings_2($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M20 7h-9" }],
      ["path", { "d": "M14 17H5" }],
      ["circle", { "cx": "17", "cy": "17", "r": "3" }],
      ["circle", { "cx": "7", "cy": "7", "r": "3" }]
    ];
    Icon($$anchor, spread_props({ name: "settings-2" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Settings($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        }
      ],
      ["circle", { "cx": "12", "cy": "12", "r": "3" }]
    ];
    Icon($$anchor, spread_props({ name: "settings" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Sliders_horizontal($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["line", { "x1": "21", "x2": "14", "y1": "4", "y2": "4" }],
      ["line", { "x1": "10", "x2": "3", "y1": "4", "y2": "4" }],
      ["line", { "x1": "21", "x2": "12", "y1": "12", "y2": "12" }],
      ["line", { "x1": "8", "x2": "3", "y1": "12", "y2": "12" }],
      ["line", { "x1": "21", "x2": "16", "y1": "20", "y2": "20" }],
      ["line", { "x1": "12", "x2": "3", "y1": "20", "y2": "20" }],
      ["line", { "x1": "14", "x2": "14", "y1": "2", "y2": "6" }],
      ["line", { "x1": "8", "x2": "8", "y1": "10", "y2": "14" }],
      ["line", { "x1": "16", "x2": "16", "y1": "18", "y2": "22" }]
    ];
    Icon($$anchor, spread_props({ name: "sliders-horizontal" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Sparkles($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        }
      ],
      ["path", { "d": "M20 3v4" }],
      ["path", { "d": "M22 5h-4" }],
      ["path", { "d": "M4 17v2" }],
      ["path", { "d": "M5 18H3" }]
    ];
    Icon($$anchor, spread_props({ name: "sparkles" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Square_check_big($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"
        }
      ],
      ["path", { "d": "m9 11 3 3L22 4" }]
    ];
    Icon($$anchor, spread_props({ name: "square-check-big" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Square($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
      ]
    ];
    Icon($$anchor, spread_props({ name: "square" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Star($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "star" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Sun($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "4" }],
      ["path", { "d": "M12 2v2" }],
      ["path", { "d": "M12 20v2" }],
      ["path", { "d": "m4.93 4.93 1.41 1.41" }],
      ["path", { "d": "m17.66 17.66 1.41 1.41" }],
      ["path", { "d": "M2 12h2" }],
      ["path", { "d": "M20 12h2" }],
      ["path", { "d": "m6.34 17.66-1.41 1.41" }],
      ["path", { "d": "m19.07 4.93-1.41 1.41" }]
    ];
    Icon($$anchor, spread_props({ name: "sun" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Toggle_right($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "rect",
        {
          "width": "20",
          "height": "12",
          "x": "2",
          "y": "6",
          "rx": "6",
          "ry": "6"
        }
      ],
      ["circle", { "cx": "16", "cy": "12", "r": "2" }]
    ];
    Icon($$anchor, spread_props({ name: "toggle-right" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Trash_2($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M3 6h18" }],
      ["path", { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
      ["path", { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
      ["line", { "x1": "10", "x2": "10", "y1": "11", "y2": "17" }],
      ["line", { "x1": "14", "x2": "14", "y1": "11", "y2": "17" }]
    ];
    Icon($$anchor, spread_props({ name: "trash-2" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Undo_2($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M9 14 4 9l5-5" }],
      [
        "path",
        {
          "d": "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "undo-2" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function X($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      ["path", { "d": "M18 6 6 18" }],
      ["path", { "d": "m6 6 12 12" }]
    ];
    Icon($$anchor, spread_props({ name: "x" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  function Zap($$anchor, $$props) {
    const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
    /**
     * @license lucide-svelte v0.468.0 - ISC
     *
     * This source code is licensed under the ISC license.
     * See the LICENSE file in the root directory of this source tree.
     */
    const iconNode = [
      [
        "path",
        {
          "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        }
      ]
    ];
    Icon($$anchor, spread_props({ name: "zap" }, () => $$sanitized_props, {
      get iconNode() {
        return iconNode;
      },
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        slot(node, $$props, "default", {});
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    }));
  }
  const gmCache = new Map();
  const gmGetValue = (key, defaultValue) => {
    if (gmCache.has(key)) return gmCache.get(key);
    const val = GM_getValue(key, defaultValue);
    gmCache.set(key, val);
    return val;
  };
  const gmSetValue = (key, value) => {
    gmCache.set(key, value);
    GM_setValue(key, value);
  };
  const gmXmlHttpRequest = (details) => {
    GM_xmlhttpRequest(details);
  };
  function gmFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: options.method ?? "GET",
        url,
        headers: options.headers,
        data: options.body,
        timeout: options.timeout ?? 3e4,
        onload: resolve,
        onerror: reject,
        ontimeout: () => reject(new Error(`Request timeout: ${url}`))
      });
    });
  }
  const VALID_THEMES = ["light", "dark", "auto"];
  function validThemeMode(value) {
    return VALID_THEMES.includes(value) ? value : "auto";
  }
  const themeMode = writable(
    validThemeMode(gmGetValue("bfao_themeMode", "auto"))
  );
  const accentColor = writable(
    gmGetValue("bfao_accentColor", "#7364FF")
  );
  const systemPrefersDark = writable(
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );
  const mediaAbort = typeof window !== "undefined" ? new AbortController() : null;
  if (typeof window !== "undefined" && mediaAbort) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      systemPrefersDark.set(e.matches);
    }, { signal: mediaAbort.signal });
  }
  const isDark = derived$1(
    [themeMode, systemPrefersDark],
    ([$mode, $sysDark]) => {
      if ($mode === "dark") return true;
      if ($mode === "light") return false;
      return $sysDark;
    }
  );
  function toggleTheme() {
    themeMode.update((current) => {
      const next = current === "light" ? "dark" : "light";
      gmSetValue("bfao_themeMode", next);
      return next;
    });
  }
  const prefersReducedMotion = writable(
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  if (typeof window !== "undefined" && mediaAbort) {
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      prefersReducedMotion.set(e.matches);
    }, { signal: mediaAbort.signal });
  }
  function destroyThemeListeners() {
    mediaAbort == null ? void 0 : mediaAbort.abort();
  }
  const DEFAULT_SETTINGS = {
    provider: "gemini",
    customBaseUrl: "",
    apiKey: "",
    modelName: "gemini-2.5-flash",
    aiChunkSize: 50,
    aiConcurrency: 2,
    limitEnabled: false,
    limitCount: 200,
    fetchDelay: 800,
    writeDelay: 2500,
    moveChunkSize: 20,
    skipDeadVideos: true,
    adaptiveRate: true,
    notifyOnComplete: true,
    multiFolderEnabled: false,
    animEnabled: true,
    incrementalMode: false,
    batchRestInterval: 100,
    batchRestMinutes: 1,
    bgCacheEnabled: false,
    cacheScanInterval: 15,
    lastPrompt: ""
  };
  const VideoAttr = {
    DEAD: 9
  };
  const AI_PROVIDERS = {
    gemini: {
      name: "Google Gemini",
      format: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: "gemini-2.5-flash",
      keyPlaceholder: "从 aistudio.google.com/apikey 获取",
      apiUrl: "https://aistudio.google.com/apikey"
    },
    openai: {
      name: "OpenAI",
      format: "openai",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o-mini",
      keyPlaceholder: "从 platform.openai.com 获取",
      apiUrl: "https://platform.openai.com/api-keys"
    },
    deepseek: {
      name: "DeepSeek",
      format: "openai",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-chat",
      keyPlaceholder: "从 platform.deepseek.com 获取",
      apiUrl: "https://platform.deepseek.com/api_keys"
    },
    siliconflow: {
      name: "硅基流动",
      format: "openai",
      baseUrl: "https://api.siliconflow.cn/v1",
      defaultModel: "deepseek-ai/DeepSeek-V3",
      keyPlaceholder: "从 cloud.siliconflow.cn 获取",
      apiUrl: "https://cloud.siliconflow.cn/account/ak"
    },
    qwen: {
      name: "通义千问 (Qwen)",
      format: "openai",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "qwen-plus",
      keyPlaceholder: "从 dashscope.aliyun.com 获取",
      apiUrl: "https://dashscope.console.aliyun.com/apikey"
    },
    moonshot: {
      name: "Moonshot (Kimi)",
      format: "openai",
      baseUrl: "https://api.moonshot.cn/v1",
      defaultModel: "moonshot-v1-8k",
      keyPlaceholder: "从 platform.moonshot.cn 获取",
      apiUrl: "https://platform.moonshot.cn/console/api-keys"
    },
    zhipu: {
      name: "智谱 (GLM)",
      format: "openai",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      defaultModel: "glm-4-flash",
      keyPlaceholder: "从 open.bigmodel.cn 获取",
      apiUrl: "https://open.bigmodel.cn/usercenter/apikeys"
    },
    groq: {
      name: "Groq",
      format: "openai",
      baseUrl: "https://api.groq.com/openai/v1",
      defaultModel: "llama-3.3-70b-versatile",
      keyPlaceholder: "从 console.groq.com 获取",
      apiUrl: "https://console.groq.com/keys"
    },
    openrouter: {
      name: "OpenRouter",
      format: "openai",
      baseUrl: "https://openrouter.ai/api/v1",
      defaultModel: "google/gemini-2.5-flash",
      keyPlaceholder: "从 openrouter.ai/keys 获取",
      apiUrl: "https://openrouter.ai/keys"
    },
    ollama: {
      name: "Ollama (本地)",
      format: "openai",
      baseUrl: "http://localhost:11434/v1",
      defaultModel: "llama3",
      keyPlaceholder: "本地运行无需 Key",
      apiUrl: ""
    },
    github: {
      name: "GitHub Models",
      format: "github",
      baseUrl: "https://models.github.ai",
      defaultModel: "openai/gpt-4o-mini",
      keyPlaceholder: "填入 GitHub Personal Access Token",
      apiUrl: "https://docs.github.com/zh/github-models/quickstart"
    },
    anthropic: {
      name: "Anthropic Claude",
      format: "anthropic",
      baseUrl: "https://api.anthropic.com",
      defaultModel: "claude-sonnet-4-6-20250627",
      keyPlaceholder: "从 console.anthropic.com 获取",
      apiUrl: "https://console.anthropic.com/settings/keys"
    },
    custom: {
      name: "自定义 (OpenAI 兼容)",
      format: "openai",
      baseUrl: "",
      defaultModel: "",
      keyPlaceholder: "填入 API Key",
      apiUrl: "",
      isCustom: true
    }
  };
  const AI_TIMEOUT_MS = 12e4;
  const SPEED_PRESETS = [
    { label: "○  安全 (1.5s)", value: 1500, desc: "大收藏夹推荐，几乎不会触发风控" },
    { label: "◐  稳健 (800ms)", value: 800, desc: "日常使用推荐，平衡速度与安全" },
    { label: "●  较快 (500ms)", value: 500, desc: "小收藏夹可用，有一定风控风险" }
  ];
  const AI_CHUNK_PRESETS = [
    { label: "50个", value: 50, desc: "少量精细分类" },
    { label: "100个", value: 100, desc: "常规批次" },
    { label: "200个", value: 200, desc: "大批量处理" },
    { label: "300个", value: 300, desc: "大批量处理" },
    { label: "400个", value: 400, desc: "大批量处理" },
    { label: "500个", value: 500, desc: "超大批量处理" }
  ];
  const BUILTIN_PRESETS = [
    { label: "自由发挥", value: "" },
    { label: "按UP主分类", value: "请按UP主/创作者名字分类，同一个UP主的视频放在一起，收藏夹名用UP主的名字" },
    { label: "按内容类型分类", value: "请按视频内容类型分类，如游戏、音乐、教程、生活、科技、搞笑、影视等大类" },
    { label: "按时长分类", value: "请按视频时长分类：短视频(5分钟以内)、中等时长(5-30分钟)、长视频(30分钟以上)" },
    { label: "学习资料整理", value: '请将学习类视频按学科/技能分类，如编程、数学、英语、设计、考研、职场技能等。非学习类视频统一归入"休闲娱乐"' },
    { label: "按热度分类", value: "请按视频播放量分类：冷门宝藏(1万以下)、小众精品(1-10万)、热门视频(10-100万)、爆款视频(100万以上)" },
    { label: "精细分类 (多级)", value: '请尽量精细分类，同一大类下如果视频较多可拆分子类。例如"游戏"可细分为"单机游戏"、"网络游戏"、"手游"等。收藏夹名格式：大类-子类' },
    { label: "按语言/地区分类", value: "请按视频的语言或内容地区分类，如国产、日本动画、欧美、韩国等。同一地区内可按类型细分" },
    { label: "待看优先级", value: "请按视频的观看价值和紧迫程度分类为：必看精品、有空再看、背景音/BGM、已过时可清理。重点参考播放量和收藏时间判断" }
  ];
  const Z_INDEX = {
    MODAL: 2147483645,
    PARTICLE: 2147483646,
    TOAST: 2147483647
  };
  const CONFETTI_COLORS = [
    "#7C5CFC",
    "#FF6B8A",
    "#A855F7",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#F43F5E",
    "#D946EF",
    "#FB7185",
    "#FBBF24",
    "#B4A0FF",
    "#34D399"
  ];
  const AURORA_COLORS = [
    "#B4A0FF",
    "#FF6B8A",
    "#22D3EE",
    "#34D399",
    "#E879F9",
    "#FBBF24"
  ];
  const MAX_TOAST_COUNT = 5;
  const POS_STORAGE_KEY = "bfao_pos_v5";
  const BILIBILI_PAGE_SIZE = 40;
  const DEFAULT_FOLDER_TITLE = "默认收藏夹";
  const BILIBILI_API_BASE = "https://api.bilibili.com/x/v3/fav";
  const BILIBILI_URLS = {
folderList: (mid) => `${BILIBILI_API_BASE}/folder/created/list-all?up_mid=${mid}`,
resourceList: (mediaId, pn, ps = BILIBILI_PAGE_SIZE) => `${BILIBILI_API_BASE}/resource/list?media_id=${mediaId}&pn=${pn}&ps=${ps}&platform=web`,
folderAdd: `${BILIBILI_API_BASE}/folder/add`,
resourceMove: `${BILIBILI_API_BASE}/resource/move`,
resourceBatchDel: `${BILIBILI_API_BASE}/resource/batch-del`
  };
  const UNCATEGORIZED_FOLDER = "未分类";
  const DEAD_ARCHIVE_FOLDER = "失效视频归档";
  const DEFAULT_VIDEO_TYPE = 2;
  const MAX_UNDO_HISTORY = 5;
  const MAX_BILIBILI_PAGES = 500;
  const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);
  function isValidProvider(id) {
    return typeof id === "string" && id in AI_PROVIDERS;
  }
  const NUMERIC_BOUNDS = {
    aiChunkSize: [1, 200],
    aiConcurrency: [1, 10],
    limitCount: [1, 1e4],
    fetchDelay: [0, 3e4],
    writeDelay: [0, 3e4],
    moveChunkSize: [1, 100],
    batchRestInterval: [1, 1e4],
    batchRestMinutes: [0.1, 60],
    cacheScanInterval: [1, 120]
  };
  function sanitizeValue(key, value) {
    const def = DEFAULT_SETTINGS[key];
    if (typeof value !== typeof def) return def;
    const bounds = NUMERIC_BOUNDS[key];
    if (bounds && typeof value === "number") {
      if (!Number.isFinite(value)) return def;
      return Math.max(bounds[0], Math.min(bounds[1], value));
    }
    return value;
  }
  function loadFromStorage() {
    const entries = SETTINGS_KEYS.map(
      (key) => [key, sanitizeValue(key, gmGetValue("bfao_" + key, DEFAULT_SETTINGS[key]))]
    );
    const result = Object.fromEntries(entries);
    if (!isValidProvider(result.provider)) {
      result.provider = DEFAULT_SETTINGS.provider;
    }
    const providerKey = gmGetValue("bfao_apiKey_" + result.provider, "");
    result.apiKey = providerKey;
    return result;
  }
  function saveToStorage(s) {
    for (const k of SETTINGS_KEYS) {
      if (s[k] !== void 0) {
        gmSetValue("bfao_" + k, s[k]);
      }
    }
    if (s.provider && s.apiKey !== void 0) {
      gmSetValue("bfao_apiKey_" + s.provider, s.apiKey);
    }
  }
  function createSettingsStore() {
    const store = writable(loadFromStorage());
    return {
      subscribe: store.subscribe,
update(partial) {
        store.update((current) => {
          const next = { ...current, ...partial };
          saveToStorage(next);
          return next;
        });
      },
reset() {
        store.set({ ...DEFAULT_SETTINGS });
        saveToStorage(DEFAULT_SETTINGS);
      },
get() {
        return get$1(store);
      },
reload() {
        store.set(loadFromStorage());
      }
    };
  }
  const settings = createSettingsStore();
  let gsapAvailable = true;
  if (typeof globalThis.gsap === "undefined") {
    console.warn("[BFAO] GSAP CDN 未加载，动画功能将被禁用");
    gsapAvailable = false;
  }
  if (typeof Flip === "undefined" || typeof Draggable === "undefined" || typeof CustomEase === "undefined") {
    console.warn("[BFAO] GSAP 插件 (Flip/Draggable/CustomEase) CDN 未加载");
  }
  const _Flip = typeof Flip !== "undefined" ? Flip : {};
  const _Draggable = typeof Draggable !== "undefined" ? Draggable : {};
  if (gsapAvailable && typeof Flip !== "undefined") {
    gsap.registerPlugin(Flip, Draggable, CustomEase);
  }
  gsap.defaults({
    force3D: true,
    overwrite: "auto"
  });
  CustomEase.create("velvetSpring", "0.20, 1.04, 0.42, 1");
  CustomEase.create("silkOut", "0.08, 0.92, 0.16, 1");
  CustomEase.create("prismBounce", "0.22, 1.42, 0.29, 1");
  CustomEase.create("liquidMorph", "0.08, 0.82, 0.17, 1");
  CustomEase.create("magneticPull", "0.18, 0.88, 0.28, 1.08");
  CustomEase.create("rippleExpand", "0.14, 1, 0.28, 1");
  const EASINGS = {
    velvetSpring: "velvetSpring",
    silkOut: "silkOut",
    prismBounce: "prismBounce",
    liquidMorph: "liquidMorph",
    rippleExpand: "rippleExpand",
    confettiArc: "power2.out"
  };
  function shouldAnimate() {
    if (!gsapAvailable) return false;
    if (get$1(prefersReducedMotion)) return false;
    if (!get$1(settings).animEnabled) return false;
    return true;
  }
  function shouldAnimateFunctional() {
    if (!gsapAvailable) return false;
    return !get$1(prefersReducedMotion);
  }
  const DEFAULTS$5 = {
    radius: 100,
    strength: 0.4,
    enabled: true
  };
  function magnetic(node, opts = {}) {
    const cfg = { ...DEFAULTS$5, ...opts };
    let currentX = 0;
    let currentY = 0;
    let pulseTl = null;
    let shimmerEl = null;
    function onMouseMove(e) {
      if (!shouldAnimate() || !cfg.enabled) return;
      const rect = node.getBoundingClientRect();
      const naturalCx = rect.left + rect.width / 2 - currentX;
      const naturalCy = rect.top + rect.height / 2 - currentY;
      const dx = e.clientX - naturalCx;
      const dy = e.clientY - naturalCy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cfg.radius) {
        const pull = 1 - dist / cfg.radius;
        currentX = dx * cfg.strength * pull;
        currentY = dy * cfg.strength * pull;
      } else {
        currentX = 0;
        currentY = 0;
      }
      gsap.to(node, { x: currentX, y: currentY, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    }
    function onEnter() {
      if (!shouldAnimate() || !cfg.enabled) return;
      startShimmer();
    }
    function onLeave() {
      stopShimmer();
      currentX = 0;
      currentY = 0;
      gsap.to(node, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
    }
    function startShimmer() {
      stopShimmer();
      shimmerEl = document.createElement("span");
      shimmerEl.style.cssText = "position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;z-index:1;";
      const shine = document.createElement("span");
      shine.style.cssText = "position:absolute;top:0;left:-100%;width:70%;height:100%;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.5) 45%,rgba(255,255,255,0.6) 50%,rgba(255,255,255,0.5) 55%,transparent 100%);transform:skewX(-15deg);";
      shimmerEl.appendChild(shine);
      if (getComputedStyle(node).position === "static") node.style.position = "relative";
      node.appendChild(shimmerEl);
      pulseTl = gsap.timeline({ repeat: -1, repeatDelay: 2 }).fromTo(shine, { left: "-120%" }, { left: "220%", duration: 1.2, ease: "power1.inOut" });
    }
    function stopShimmer() {
      if (pulseTl) {
        pulseTl.kill();
        pulseTl = null;
      }
      if (shimmerEl) {
        shimmerEl.remove();
        shimmerEl = null;
      }
    }
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    return {
      update(newOpts) {
        Object.assign(cfg, DEFAULTS$5, newOpts);
      },
      destroy() {
        stopShimmer();
        document.removeEventListener("mousemove", onMouseMove);
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf(node);
        gsap.set(node, { x: 0, y: 0 });
      }
    };
  }
  var root$i = from_html(`<button aria-label="打开 AI 收藏夹整理器"><!> <div class="orbits svelte-ayaw0q"></div></button>`);
  function FloatButton($$anchor, $$props) {
    push($$props, true);
    let visible = prop($$props, "visible", 3, true);
    let btnEl = state(void 0);
    let orbitsContainer = state(void 0);
    let ctx;
    let pDown = 0;
    let pX = 0;
    let pY = 0;
    function onPDown(e) {
      pDown = Date.now();
      pX = e.clientX;
      pY = e.clientY;
    }
    function onPUp(e) {
      var _a2;
      if (Date.now() - pDown < 300 && Math.abs(e.clientX - pX) < 8 && Math.abs(e.clientY - pY) < 8) {
        if (shouldAnimate() && get(btnEl)) spawnParticles(get(btnEl));
        (_a2 = $$props.onclick) == null ? void 0 : _a2.call($$props);
      }
    }
    let draggableInstance;
    let wasHidden = !visible();
    user_effect(() => {
      var _a2;
      if (visible() && wasHidden && get(btnEl)) {
        const saved = gmGetValue(POS_STORAGE_KEY, null);
        if (saved) {
          gsap.set(get(btnEl), { x: saved.tx, y: saved.ty });
        }
        (_a2 = draggableInstance == null ? void 0 : draggableInstance[0]) == null ? void 0 : _a2.update();
        if (shouldAnimate()) {
          gsap.from(get(btnEl), {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: EASINGS.prismBounce
          });
        }
      }
      wasHidden = !visible();
    });
    onMount(() => {
      if (!get(btnEl)) return;
      const saved = gmGetValue(POS_STORAGE_KEY, null);
      if (saved) {
        gsap.set(get(btnEl), { x: saved.tx, y: saved.ty });
      }
      draggableInstance = _Draggable.create(get(btnEl), {
        bounds: document.body,
        edgeResistance: 0.75,
        inertia: false,
        minimumMovement: 8,
        onDragEnd() {
          gmSetValue(POS_STORAGE_KEY, {
            tx: gsap.getProperty(get(btnEl), "x"),
            ty: gsap.getProperty(get(btnEl), "y")
          });
        }
      });
      ctx = gsap.context(
        () => {
          if (shouldAnimate()) {
            const rgb = getComputedStyle(get(btnEl)).getPropertyValue("--ai-primary-rgb").trim() || "115, 100, 255";
            gsap.timeline({ repeat: -1, yoyo: true }).fromTo(
              get(btnEl),
              {
                boxShadow: `0 0 14px rgba(${rgb},0.18), 0 0 28px rgba(155,89,246,0.08)`
              },
              {
                boxShadow: `0 0 24px rgba(${rgb},0.35), 0 0 48px rgba(155,89,246,0.15)`,
                duration: 3,
                ease: "sine.inOut"
              }
            );
            gsap.timeline({
              repeat: -1,
              defaults: { duration: 1, ease: EASINGS.liquidMorph }
            }).to(get(btnEl), { borderRadius: "42% 58% 62% 38% / 48% 52% 48% 52%" }).to(get(btnEl), { borderRadius: "58% 42% 38% 62% / 52% 48% 52% 48%" }).to(get(btnEl), { borderRadius: "45% 55% 52% 48% / 60% 40% 55% 45%" }).to(get(btnEl), { borderRadius: "55% 45% 48% 52% / 40% 60% 45% 55%" }).to(get(btnEl), { borderRadius: "50%" });
          }
          if (shouldAnimate() && get(orbitsContainer)) {
            const colors = [
              "var(--ai-primary)",
              "#9b59f6",
              "var(--ai-gradient-accent)",
              "#6ec1ff",
              "#ff6b9d"
            ];
            const sizes = [5, 4, 3.5, 4.5, 3];
            const durations = [5, 7, 8, 6, 9];
            const blinkDurations = [1.5, 2.2, 1.8, 2.8, 2];
            for (let i = 0; i < 5; i++) {
              const orb = document.createElement("div");
              const sz = sizes[i];
              orb.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${colors[i]};box-shadow:0 0 ${sz * 2}px ${colors[i]};pointer-events:none;will-change:transform,opacity;`;
              get(orbitsContainer).appendChild(orb);
              const sa = Math.PI * 2 * i / 5;
              const proxy2 = { angle: sa };
              gsap.to(proxy2, {
                angle: sa + Math.PI * 2,
                duration: durations[i],
                repeat: -1,
                ease: "none",
                onUpdate() {
                  orb.style.transform = `translate(${Math.cos(proxy2.angle) * 42}px,${Math.sin(proxy2.angle) * 42}px)`;
                }
              });
              gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.4 }).to(orb, {
                opacity: 0.2,
                duration: blinkDurations[i],
                ease: "sine.inOut"
              }).to(orb, {
                opacity: 1,
                duration: blinkDurations[i] * 0.6,
                ease: "sine.inOut"
              });
            }
          }
        },
        get(btnEl)
      );
    });
    onDestroy(() => {
      var _a2;
      (_a2 = draggableInstance == null ? void 0 : draggableInstance[0]) == null ? void 0 : _a2.kill();
      ctx == null ? void 0 : ctx.revert();
    });
    function spawnParticles(origin) {
      const rect = origin.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      for (let i = 0; i < 24; i++) {
        const dot = document.createElement("div");
        const angle = Math.PI * 2 * i / 24 + (Math.random() - 0.5) * 0.4;
        const dist = 40 + Math.random() * 50;
        const size = 3 + Math.random() * 4;
        dot.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:var(--ai-primary,#7364FF);pointer-events:none;z-index:${Z_INDEX.TOAST};`;
        document.body.appendChild(dot);
        gsap.to(dot, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: 0,
          duration: 0.5 + Math.random() * 0.4,
          ease: EASINGS.confettiArc,
          onComplete: () => dot.remove()
        });
      }
    }
    var button = root$i();
    let classes;
    var node = child(button);
    Bot(node, { size: 24 });
    var div = sibling(node, 2);
    bind_this(div, ($$value) => set(orbitsContainer, $$value), () => get(orbitsContainer));
    bind_this(button, ($$value) => set(btnEl, $$value), () => get(btnEl));
    action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 120, strength: 0.4 }));
    template_effect(() => classes = set_class(button, 1, "float-btn svelte-ayaw0q", null, classes, { hidden: !visible() }));
    delegated("pointerdown", button, onPDown);
    delegated("pointerup", button, onPUp);
    append($$anchor, button);
    pop();
  }
  delegate(["pointerdown", "pointerup"]);
  const DEFAULTS$4 = {
    speed: 0.3,
    maxOffset: 40
  };
  function parallax(node, opts = {}) {
    const cfg = { ...DEFAULTS$4, ...opts };
    const target = node.parentElement ?? node;
    target.style.setProperty("--parallax-y", "0px");
    function onScroll() {
      if (!shouldAnimate()) return;
      const offset = Math.min(node.scrollTop * cfg.speed, cfg.maxOffset);
      target.style.setProperty("--parallax-y", `${-offset}px`);
    }
    node.addEventListener("scroll", onScroll, { passive: true });
    return {
      update(newOpts) {
        Object.assign(cfg, DEFAULTS$4, newOpts);
      },
      destroy() {
        node.removeEventListener("scroll", onScroll);
        target.style.removeProperty("--parallax-y");
      }
    };
  }
  const DEFAULTS$3 = {
    mode: "aurora"
  };
  function panelCanvas(node, opts = {}) {
    const cfg = { ...DEFAULTS$3, ...opts };
    if (!shouldAnimate()) return { update() {
    }, destroy() {
    } };
    const canvas = document.createElement("canvas");
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return { update() {
    }, destroy() {
    } };
    const ctx2d = maybeCtx;
    canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    opacity: 0.85;
  `;
    node.insertBefore(canvas, node.firstChild);
    let w = 0;
    let h = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let time = 0;
    function getScale() {
      return cfg.mode === "aurora" ? 0.65 : 0.55;
    }
    let threads = [];
    function resize() {
      const rect = node.getBoundingClientRect();
      const s = getScale();
      w = Math.floor(rect.width * s);
      h = Math.floor(rect.height * s);
      canvas.width = w;
      canvas.height = h;
    }
    function initThreads() {
      const count = 30;
      threads = [];
      for (let i = 0; i < count; i++) {
        threads.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 1.5 + Math.random() * 2,
          hue: 240 + Math.random() * 80
        });
      }
    }
    function renderAurora() {
      ctx2d.clearRect(0, 0, w, h);
      if (w === 0 || h === 0) return;
      for (let layer = 0; layer < 3; layer++) {
        const speed = 0.3 + layer * 0.15;
        const amplitude = h * (0.15 + layer * 0.05);
        const yBase = h * (0.25 + layer * 0.2);
        const color = AURORA_COLORS[layer % AURORA_COLORS.length];
        ctx2d.beginPath();
        ctx2d.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const nx = x / w;
          const wave1 = Math.sin(nx * 3 + time * speed) * amplitude * 0.6;
          const wave2 = Math.sin(nx * 5 - time * speed * 0.7 + layer) * amplitude * 0.3;
          const wave3 = Math.sin(nx * 1.5 + time * speed * 0.4 + layer * 2) * amplitude * 0.1;
          const y = yBase + wave1 + wave2 + wave3;
          ctx2d.lineTo(x, y);
        }
        ctx2d.lineTo(w, h);
        ctx2d.closePath();
        const gradient = ctx2d.createLinearGradient(0, yBase - amplitude, 0, yBase + amplitude);
        gradient.addColorStop(0, hexToRgba(color, 0));
        gradient.addColorStop(0.4, hexToRgba(color, 0.15 - layer * 0.02));
        gradient.addColorStop(1, hexToRgba(color, 0));
        ctx2d.fillStyle = gradient;
        ctx2d.fill();
      }
      const mx = mouseX * w;
      const my = mouseY * h;
      const radGrad = ctx2d.createRadialGradient(mx, my, 0, mx, my, w * 0.3);
      radGrad.addColorStop(0, "rgba(180, 160, 255, 0.04)");
      radGrad.addColorStop(1, "rgba(180, 160, 255, 0)");
      ctx2d.fillStyle = radGrad;
      ctx2d.fillRect(0, 0, w, h);
    }
    function renderLumen() {
      ctx2d.clearRect(0, 0, w, h);
      if (w === 0 || h === 0) return;
      const connectionDist = w * 0.25;
      const mx = mouseX * w;
      const my = mouseY * h;
      const dr = gsap.ticker.deltaRatio();
      for (const t of threads) {
        const dmx = mx - t.x;
        const dmy = my - t.y;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distMouse < connectionDist) {
          const force = 3e-3 * (1 - distMouse / connectionDist) * dr;
          t.vx += dmx * force;
          t.vy += dmy * force;
        }
        t.x += t.vx * dr;
        t.y += t.vy * dr;
        if (t.x < 0 || t.x > w) t.vx *= -1;
        if (t.y < 0 || t.y > h) t.vy *= -1;
        t.x = Math.max(0, Math.min(w, t.x));
        t.y = Math.max(0, Math.min(h, t.y));
        t.vx *= Math.pow(0.998, dr);
        t.vy *= Math.pow(0.998, dr);
      }
      for (let i = 0; i < threads.length; i++) {
        for (let j = i + 1; j < threads.length; j++) {
          const a = threads[i];
          const b = threads[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.28;
            ctx2d.beginPath();
            ctx2d.moveTo(a.x, a.y);
            ctx2d.lineTo(b.x, b.y);
            ctx2d.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 60%, 70%, ${alpha})`;
            ctx2d.lineWidth = 0.5;
            ctx2d.stroke();
          }
        }
      }
      for (const t of threads) {
        const distMouse = Math.sqrt((mx - t.x) ** 2 + (my - t.y) ** 2);
        const glow = distMouse < connectionDist ? (1 - distMouse / connectionDist) * 0.4 : 0;
        const alpha = 0.3 + glow;
        ctx2d.beginPath();
        ctx2d.arc(t.x, t.y, t.radius * (1 + glow), 0, Math.PI * 2);
        ctx2d.fillStyle = `hsla(${t.hue}, 65%, 75%, ${alpha})`;
        ctx2d.fill();
      }
    }
    function tick2() {
      time += 8e-3 * gsap.ticker.deltaRatio();
      if (cfg.mode === "aurora") {
        renderAurora();
      } else {
        renderLumen();
      }
    }
    let lastMouseTime = 0;
    function onMouseMove(e) {
      const now2 = Date.now();
      if (now2 - lastMouseTime < 50) return;
      lastMouseTime = now2;
      const rect = node.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    }
    const ro = new ResizeObserver(() => {
      resize();
      if (cfg.mode === "lumen" && threads.length === 0) {
        initThreads();
      }
    });
    let paused = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && paused) {
          paused = false;
          gsap.ticker.add(tick2);
        } else if (!entry.isIntersecting && !paused) {
          paused = true;
          gsap.ticker.remove(tick2);
        }
      },
      { threshold: 0 }
    );
    resize();
    if (cfg.mode === "lumen") initThreads();
    ro.observe(node);
    io.observe(node);
    gsap.ticker.add(tick2);
    node.addEventListener("mousemove", onMouseMove, { passive: true });
    return {
      update(newOpts) {
        const prevMode = cfg.mode;
        Object.assign(cfg, DEFAULTS$3, newOpts);
        if (cfg.mode !== prevMode) {
          resize();
          if (cfg.mode === "lumen") initThreads();
        }
      },
      destroy() {
        gsap.ticker.remove(tick2);
        ro.disconnect();
        io.disconnect();
        node.removeEventListener("mousemove", onMouseMove);
        canvas.remove();
      }
    };
  }
  function hexToRgba(hex, alpha) {
    const r2 = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r2}, ${g}, ${b}, ${alpha})`;
  }
  const DEFAULTS$2 = {
    throttle: 80,
    spawnRate: 0.3,
    maxParticles: 5
  };
  function cursorScatter(node, opts = {}) {
    const cfg = { ...DEFAULTS$2, ...opts };
    let lastTime = 0;
    let activeCount = 0;
    const activeParticles = new Set();
    function onMouseMove(e) {
      if (!shouldAnimate()) return;
      const now2 = Date.now();
      if (now2 - lastTime < cfg.throttle) return;
      lastTime = now2;
      if (Math.random() > cfg.spawnRate) return;
      if (activeCount >= cfg.maxParticles) return;
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnParticle(x, y);
    }
    function spawnParticle(x, y) {
      const dot = document.createElement("div");
      const size = 3 + Math.random() * 3;
      const color = AURORA_COLORS[Math.floor(Math.random() * AURORA_COLORS.length)];
      const rect = node.getBoundingClientRect();
      dot.style.cssText = `
      position: fixed;
      left: ${rect.left + x}px;
      top: ${rect.top + y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      pointer-events: none;
      will-change: transform, opacity;
      z-index: 1;
    `;
      document.body.appendChild(dot);
      activeCount++;
      activeParticles.add(dot);
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 25;
      gsap.fromTo(
        dot,
        { scale: 1, opacity: 0.8 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 10,
scale: 0,
          opacity: 0,
          duration: 0.6 + Math.random() * 0.4,
          ease: EASINGS.confettiArc,
          onComplete() {
            dot.remove();
            activeCount--;
            activeParticles.delete(dot);
          }
        }
      );
    }
    node.addEventListener("mousemove", onMouseMove, { passive: true });
    return {
      update(newOpts) {
        Object.assign(cfg, DEFAULTS$2, newOpts);
      },
      destroy() {
        node.removeEventListener("mousemove", onMouseMove);
        for (const dot of activeParticles) {
          gsap.killTweensOf(dot);
          dot.remove();
        }
        activeParticles.clear();
        activeCount = 0;
      }
    };
  }
  function glowTrack(node, opts = {}) {
    let enabled = opts.enabled ?? true;
    function onMouseMove(e) {
      if (!enabled || !shouldAnimate()) return;
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      node.style.setProperty("--glow-x", x + "px");
      node.style.setProperty("--glow-y", y + "px");
    }
    function onMouseLeave() {
      node.style.removeProperty("--glow-x");
      node.style.removeProperty("--glow-y");
    }
    node.addEventListener("mousemove", onMouseMove);
    node.addEventListener("mouseleave", onMouseLeave);
    return {
      update(newOpts) {
        enabled = newOpts.enabled ?? true;
      },
      destroy() {
        node.removeEventListener("mousemove", onMouseMove);
        node.removeEventListener("mouseleave", onMouseLeave);
        node.style.removeProperty("--glow-x");
        node.style.removeProperty("--glow-y");
      }
    };
  }
  const DEFAULTS$1 = {
    color: "rgba(255, 255, 255, 0.25)",
    duration: 0.55
  };
  function ripple(node, opts = {}) {
    const cfg = { ...DEFAULTS$1, ...opts };
    const originalPosition = getComputedStyle(node).position;
    if (originalPosition === "static") {
      node.style.position = "relative";
    }
    node.style.overflow = "hidden";
    function onClick(e) {
      if (!shouldAnimate()) return;
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;
      const circle = document.createElement("span");
      circle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${cfg.color};
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
    `;
      node.appendChild(circle);
      activeCircles.add(circle);
      gsap.to(circle, {
        scale: 1,
        opacity: 0,
        duration: cfg.duration,
        ease: EASINGS.rippleExpand,
        onComplete: () => {
          circle.remove();
          activeCircles.delete(circle);
        }
      });
    }
    const activeCircles = new Set();
    node.addEventListener("click", onClick);
    return {
      update(newOpts) {
        Object.assign(cfg, DEFAULTS$1, newOpts);
      },
      destroy() {
        node.removeEventListener("click", onClick);
        for (const circle of activeCircles) {
          gsap.killTweensOf(circle);
          circle.remove();
        }
        activeCircles.clear();
      }
    };
  }
  function pressEffect(node) {
    function onDown() {
      if (!shouldAnimate()) return;
      gsap.to(node, {
        scale: 0.95,
        duration: 0.12,
        ease: "power2.out"
      });
    }
    function onUp() {
      if (!shouldAnimate()) return;
      gsap.to(node, {
        scale: 1,
        duration: 0.35,
        ease: EASINGS.prismBounce
      });
    }
    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointerleave", onUp);
    return {
      destroy() {
        node.removeEventListener("pointerdown", onDown);
        node.removeEventListener("pointerup", onUp);
        node.removeEventListener("pointerleave", onUp);
      }
    };
  }
  function focusGlow(node, opts = {}) {
    const color = opts.color ?? "var(--ai-primary)";
    const spread = opts.spread ?? 8;
    function onFocus() {
      if (!shouldAnimate()) return;
      gsap.to(node, {
        boxShadow: `0 0 0 2px ${color}, 0 0 ${spread}px ${color}40`,
        duration: 0.3,
        ease: EASINGS.velvetSpring
      });
    }
    function onBlur() {
      if (!shouldAnimate()) {
        gsap.set(node, { boxShadow: "none" });
        return;
      }
      gsap.to(node, {
        boxShadow: "0 0 0 0px transparent, 0 0 0px transparent",
        duration: 0.25,
        ease: EASINGS.silkOut
      });
    }
    node.addEventListener("focus", onFocus);
    node.addEventListener("blur", onBlur);
    return {
      destroy() {
        node.removeEventListener("focus", onFocus);
        node.removeEventListener("blur", onBlur);
        gsap.set(node, { clearProps: "boxShadow" });
      }
    };
  }
  function checkBounce(node) {
    function onChange() {
      if (!shouldAnimate()) return;
      gsap.fromTo(
        node,
        { scale: 0.5 },
        { scale: 1, duration: 0.5, ease: EASINGS.prismBounce }
      );
      const parent = node.parentElement;
      if (parent) {
        gsap.fromTo(
          parent,
          { boxShadow: "0 0 0 2px var(--ai-primary)" },
          { boxShadow: "0 0 0 0px transparent", duration: 0.6, ease: EASINGS.silkOut }
        );
      }
    }
    node.addEventListener("change", onChange);
    return {
      destroy() {
        node.removeEventListener("change", onChange);
      }
    };
  }
  function contentStagger(container, opts = {}) {
    const delay = opts.delay ?? 0.15;
    const stagger = opts.stagger ?? 0.05;
    if (!shouldAnimate()) return { destroy() {
    } };
    const children = container.children;
    if (children.length === 0) return { destroy() {
    } };
    gsap.fromTo(
      children,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger,
        delay,
        ease: EASINGS.velvetSpring
      }
    );
    return { destroy() {
    } };
  }
  function listStaggerReveal(items, opts = {}) {
    const maxItems = opts.maxItems ?? 20;
    if (!shouldAnimate() || !items.length) return;
    const targets = Array.from(items).slice(0, maxItems);
    gsap.fromTo(
      targets,
      { x: 36, scale: 0.93, opacity: 0, filter: "blur(2.5px)" },
      {
        x: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.35,
        stagger: 0.04,
        ease: EASINGS.velvetSpring
      }
    );
  }
  var root$h = from_html(`<div class="header svelte-oiwvqb"><div class="header-title svelte-oiwvqb"><span class="svelte-oiwvqb">AI 收藏夹整理器</span> <span class="version svelte-oiwvqb">v2.0</span></div> <div class="header-actions svelte-oiwvqb"><button class="header-btn svelte-oiwvqb"><!></button> <button title="设置"><span><!></span></button> <button class="header-btn svelte-oiwvqb" title="关闭"><!></button></div></div>`);
  function Header($$anchor, $$props) {
    push($$props, true);
    const $isDark = () => store_get(isDark, "$isDark", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    const headerMagnetic = { radius: 60, strength: 0.4 };
    let settingsOpen = prop($$props, "settingsOpen", 15, false);
    let themeIconEl = state(void 0);
    let headerTitleEl = state(void 0);
    let headerActionsEl = state(void 0);
    let themeIconTween = null;
    let entranceTweens = [];
    let transitionTimer = null;
    onMount(() => {
      if (!shouldAnimate()) return;
      if (get(headerTitleEl)) {
        entranceTweens.push(gsap.fromTo(get(headerTitleEl), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }));
      }
      if (get(headerActionsEl)) {
        const btns = get(headerActionsEl).querySelectorAll(".header-btn");
        if (btns.length) {
          entranceTweens.push(gsap.fromTo(btns, { opacity: 0, scale: 0.8, y: 4 }, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.08,
            ease: EASINGS.prismBounce,
            delay: 0.15
          }));
        }
      }
    });
    onDestroy(() => {
      if (transitionTimer) clearTimeout(transitionTimer);
      themeIconTween == null ? void 0 : themeIconTween.kill();
      entranceTweens.forEach((t) => t.kill());
    });
    function handleThemeToggle(e) {
      if (!shouldAnimate()) {
        toggleTheme();
        return;
      }
      const appEl = document.querySelector(".bfao-app");
      const oldBg = appEl ? getComputedStyle(appEl).getPropertyValue("--ai-bg").trim() : "";
      toggleTheme();
      if (get(themeIconEl)) {
        themeIconTween == null ? void 0 : themeIconTween.kill();
        themeIconTween = gsap.fromTo(get(themeIconEl), { rotation: 0, scale: 1 }, {
          rotation: 360,
          scale: 1,
          duration: 0.5,
          ease: EASINGS.prismBounce
        });
      }
      if (!appEl || !oldBg) return;
      const overlay = document.createElement("div");
      overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: ${Z_INDEX.PARTICLE};
      background: ${oldBg};
      pointer-events: none;
    `;
      document.body.appendChild(overlay);
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => overlay.remove()
      });
      const panelEl = appEl.querySelector(".panel");
      if (panelEl) {
        panelEl.style.transition = "background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease";
        if (transitionTimer) clearTimeout(transitionTimer);
        transitionTimer = setTimeout(
          () => {
            panelEl.style.transition = "";
            transitionTimer = null;
          },
          600
        );
      }
    }
    var div = root$h();
    var div_1 = child(div);
    bind_this(div_1, ($$value) => set(headerTitleEl, $$value), () => get(headerTitleEl));
    var div_2 = sibling(div_1, 2);
    var button = child(div_2);
    var node = child(button);
    {
      var consequent = ($$anchor2) => {
        Sun($$anchor2, { size: 16 });
      };
      var alternate = ($$anchor2) => {
        Moon($$anchor2, { size: 16 });
      };
      if_block(node, ($$render) => {
        if ($isDark()) $$render(consequent);
        else $$render(alternate, -1);
      });
    }
    bind_this(button, ($$value) => set(themeIconEl, $$value), () => get(themeIconEl));
    action(button, ($$node, $$action_arg) => ripple == null ? void 0 : ripple($$node, $$action_arg), () => ({ color: "rgba(255,255,255,0.25)" }));
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => headerMagnetic);
    var button_1 = sibling(button, 2);
    let classes;
    var span = child(button_1);
    let classes_1;
    var node_1 = child(span);
    Settings(node_1, { size: 16 });
    action(button_1, ($$node, $$action_arg) => ripple == null ? void 0 : ripple($$node, $$action_arg), () => ({ color: "rgba(255,255,255,0.25)" }));
    action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_1, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => headerMagnetic);
    var button_2 = sibling(button_1, 2);
    var node_2 = child(button_2);
    X(node_2, { size: 16 });
    action(button_2, ($$node, $$action_arg) => ripple == null ? void 0 : ripple($$node, $$action_arg), () => ({ color: "rgba(255,255,255,0.25)" }));
    action(button_2, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_2, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => headerMagnetic);
    bind_this(div_2, ($$value) => set(headerActionsEl, $$value), () => get(headerActionsEl));
    template_effect(() => {
      set_attribute(button, "title", $isDark() ? "切换到亮色模式" : "切换到暗色模式");
      classes = set_class(button_1, 1, "header-btn svelte-oiwvqb", null, classes, { active: settingsOpen() });
      classes_1 = set_class(span, 1, "settings-icon svelte-oiwvqb", null, classes_1, { open: settingsOpen() });
    });
    delegated("click", button, handleThemeToggle);
    delegated("click", button_1, () => settingsOpen(!settingsOpen()));
    delegated("click", button_2, () => {
      var _a2;
      return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  const formsCss = '.bfao-field{display:flex;flex-direction:column;gap:4px}.bfao-label{font-size:12px;color:var(--ai-text-secondary);font-weight:500;transition:color .25s ease}.bfao-field:focus-within .bfao-label{color:var(--ai-primary)}.bfao-input,.bfao-select{padding:7px 10px;border:1.5px solid var(--ai-border);border-radius:8px;font-size:12px;outline:none;box-sizing:border-box;background:var(--ai-input-bg);color:var(--ai-text);transition:all .3s cubic-bezier(.2,.98,.28,1)}.bfao-input:focus,.bfao-select:focus{border-color:var(--ai-primary);box-shadow:0 0 0 3px var(--ai-primary-shadow)}.bfao-select{cursor:pointer;width:100%}.bfao-input-row{display:flex;gap:6px;align-items:center;position:relative}.bfao-input-row:after{content:"";position:absolute;bottom:0;left:10%;width:80%;height:1.5px;background:linear-gradient(90deg,transparent,var(--ai-primary),transparent);transform:scaleX(0);transition:transform .3s cubic-bezier(.2,.98,.28,1);pointer-events:none;border-radius:1px}.bfao-input-row:focus-within:after{transform:scaleX(1)}.bfao-input-flex{flex:1}.bfao-input-small{width:80px}.bfao-icon-btn{padding:6px;border:1.5px solid var(--ai-border);border-radius:8px;background:var(--ai-bg);color:var(--ai-text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .25s cubic-bezier(.2,.98,.28,1);flex-shrink:0}.bfao-icon-btn:hover{border-color:var(--ai-primary);color:var(--ai-primary);background:var(--ai-primary-bg);box-shadow:0 2px 8px var(--ai-primary-shadow)}.bfao-icon-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;filter:grayscale(.3);box-shadow:none;transition:opacity .3s ease,filter .3s ease,box-shadow .3s ease}.bfao-icon-btn:disabled:hover{transform:none;border-color:var(--ai-border);color:var(--ai-text-secondary)}.bfao-checkbox-label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--ai-text-secondary);cursor:pointer;-webkit-user-select:none;user-select:none}.bfao-checkbox-label input[type=checkbox]{accent-color:var(--ai-primary);width:15px;height:15px;cursor:pointer;transition:box-shadow .2s ease;border-radius:3px}.bfao-checkbox-label input[type=checkbox]:hover{box-shadow:0 0 0 3px rgba(var(--ai-primary-rgb),.15)}@media(prefers-reduced-motion:reduce){.bfao-label{transition:none}.bfao-input-row:after{transition:none}.bfao-icon-btn:hover{transform:none}.bfao-icon-btn:disabled{transition:none;filter:none}.bfao-checkbox-label input[type=checkbox]{transition:none}}';
  importCSS(formsCss);
  var root_1$9 = from_html(`<span class="group-icon svelte-w9qm3w"><!></span>`);
  var root$g = from_html(`<div><button class="group-header svelte-w9qm3w"><!> <span class="group-title svelte-w9qm3w"> </span> <span><!></span></button> <div class="group-body svelte-w9qm3w"><!></div></div>`);
  function SettingsGroup($$anchor, $$props) {
    push($$props, true);
    let icon = prop($$props, "icon", 3, null), iconColor = prop($$props, "iconColor", 3, "#7C5CFC"), defaultOpen = prop($$props, "defaultOpen", 3, false);
    let open = state(proxy(defaultOpen()));
    let bodyEl = state(void 0);
    let chevronEl = state(void 0);
    let iconEl = state(void 0);
    onMount(() => {
      if (get(open) && get(bodyEl)) {
        get(bodyEl).style.height = "auto";
        get(bodyEl).style.overflow = "visible";
      } else if (get(bodyEl)) {
        get(bodyEl).style.height = "0px";
        get(bodyEl).style.overflow = "hidden";
        get(bodyEl).style.paddingTop = "0";
        get(bodyEl).style.paddingBottom = "0";
      }
      if (get(open) && get(chevronEl)) {
        gsap.set(get(chevronEl), { rotation: 90 });
      }
    });
    onDestroy(() => {
      if (get(bodyEl)) gsap.killTweensOf(get(bodyEl));
      if (get(chevronEl)) gsap.killTweensOf(get(chevronEl));
      if (get(iconEl)) gsap.killTweensOf(get(iconEl));
    });
    function hexToRgba2(hex, alpha) {
      const h = hex.replace("#", "");
      const r2 = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `rgba(${r2}, ${g}, ${b}, ${alpha})`;
    }
    function toggle() {
      set(open, !get(open));
      if (!get(bodyEl)) return;
      if (shouldAnimate()) {
        if (get(open)) {
          gsap.set(get(bodyEl), {
            height: "auto",
            overflow: "hidden",
            opacity: 1,
            paddingTop: "",
            paddingBottom: ""
          });
          const h = get(bodyEl).scrollHeight || get(bodyEl).offsetHeight;
          gsap.set(get(bodyEl), { height: 0, opacity: 0 });
          if (h <= 0) {
            get(bodyEl).style.height = "auto";
            get(bodyEl).style.overflow = "";
            get(bodyEl).style.opacity = "1";
            get(bodyEl).style.paddingTop = "";
            get(bodyEl).style.paddingBottom = "";
          } else {
            gsap.to(get(bodyEl), {
              height: h,
              opacity: 1,
              paddingTop: "",
              paddingBottom: "",
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => {
                get(bodyEl).style.height = "auto";
                get(bodyEl).style.overflow = "";
                get(bodyEl).scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            });
          }
          if (get(iconEl)) {
            gsap.fromTo(get(iconEl), { scale: 1 }, {
              scale: 1.25,
              duration: 0.15,
              yoyo: true,
              repeat: 1,
              ease: "power2.out"
            });
          }
        } else {
          gsap.to(get(bodyEl), {
            height: 0,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.28,
            ease: EASINGS.silkOut,
            overflow: "hidden"
          });
        }
        if (get(chevronEl)) {
          gsap.to(get(chevronEl), {
            rotation: get(open) ? 90 : 0,
            duration: 0.3,
            ease: EASINGS.velvetSpring
          });
        }
      } else {
        get(bodyEl).style.height = get(open) ? "auto" : "0px";
        get(bodyEl).style.overflow = get(open) ? "" : "hidden";
        get(bodyEl).style.paddingTop = get(open) ? "" : "0";
        get(bodyEl).style.paddingBottom = get(open) ? "" : "0";
      }
    }
    var div = root$g();
    let classes;
    var button = child(div);
    var node = child(button);
    {
      var consequent = ($$anchor2) => {
        const Icon2 = user_derived(icon);
        var span = root_1$9();
        let styles;
        var node_1 = child(span);
        component(node_1, () => get(Icon2), ($$anchor3, Icon_1) => {
          Icon_1($$anchor3, { size: 14 });
        });
        bind_this(span, ($$value) => set(iconEl, $$value), () => get(iconEl));
        template_effect(($0) => styles = set_style(span, "", styles, $0), [
          () => ({ background: hexToRgba2(iconColor(), 0.1), color: iconColor() })
        ]);
        append($$anchor2, span);
      };
      if_block(node, ($$render) => {
        if (icon()) $$render(consequent);
      });
    }
    var span_1 = sibling(node, 2);
    var text2 = child(span_1);
    var span_2 = sibling(span_1, 2);
    let classes_1;
    var node_2 = child(span_2);
    Chevron_right(node_2, { size: 14 });
    bind_this(span_2, ($$value) => set(chevronEl, $$value), () => get(chevronEl));
    var div_1 = sibling(button, 2);
    var node_3 = child(div_1);
    {
      var consequent_1 = ($$anchor2) => {
        var fragment = comment();
        var node_4 = first_child(fragment);
        snippet(node_4, () => $$props.children);
        append($$anchor2, fragment);
      };
      if_block(node_3, ($$render) => {
        if ($$props.children) $$render(consequent_1);
      });
    }
    bind_this(div_1, ($$value) => set(bodyEl, $$value), () => get(bodyEl));
    template_effect(() => {
      classes = set_class(div, 1, "group svelte-w9qm3w", null, classes, { open: get(open) });
      set_attribute(button, "aria-expanded", get(open));
      set_text(text2, $$props.title);
      classes_1 = set_class(span_2, 1, "chevron svelte-w9qm3w", null, classes_1, { open: get(open) });
    });
    delegated("click", button, toggle);
    append($$anchor, div);
    pop();
  }
  delegate(["click"]);
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function humanDelay(baseMs) {
    const jitter = baseMs * 0.3;
    const delay = baseMs + (Math.random() * 2 - 1) * jitter;
    return sleep(Math.max(0, Math.round(delay)));
  }
  function debounce(fn, delayMs) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delayMs);
    };
  }
  function formatNow() {
    const now2 = new Date();
    return {
      time: now2.toISOString(),
      timeLocal: now2.toLocaleString("zh-CN")
    };
  }
  function backoffMs(attempt, baseMs, maxMs = Infinity) {
    return Math.min(baseMs * Math.pow(2, attempt - 1), maxMs);
  }
  function createConcurrencyLimiter(maxConcurrent) {
    let running = 0;
    const queue = [];
    async function run2(fn) {
      if (running >= maxConcurrent) {
        await new Promise((resolve) => queue.push(resolve));
      }
      running++;
      try {
        return await fn();
      } finally {
        running--;
        const next = queue.shift();
        if (next) next();
      }
    }
    return { run: run2 };
  }
  const panelOpen = writable(false);
  const isRunning = writable(false);
  const cancelRequested = writable(false);
  const progressPhase = writable("");
  const progressCurrent = writable(0);
  const progressTotal = writable(0);
  const progressStartTime = writable(0);
  derived$1(
    [progressCurrent, progressTotal],
    ([$current, $total]) => $total > 0 ? Math.min(100, Math.round($current / $total * 100)) : 0
  );
  let logIdCounter = 0;
  const MAX_LOG_ENTRIES = 500;
  function createLogStore() {
    const store = writable([]);
    return {
      subscribe: store.subscribe,
      add(message, level = "info") {
        const now2 = new Date();
        const time = `${String(now2.getHours()).padStart(2, "0")}:${String(now2.getMinutes()).padStart(2, "0")}:${String(now2.getSeconds()).padStart(2, "0")}`;
        store.update((entries) => {
          const updated = [...entries, { id: ++logIdCounter, time, message, level }];
          return updated.length > MAX_LOG_ENTRIES ? updated.slice(-MAX_LOG_ENTRIES) : updated;
        });
      },
      clear() {
        store.set([]);
      }
    };
  }
  const logs = createLogStore();
  const tokenUsage = writable({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    callCount: 0
  });
  function resetTokenUsage() {
    tokenUsage.set({ promptTokens: 0, completionTokens: 0, totalTokens: 0, callCount: 0 });
  }
  function getErrorMessage(error) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    return String(error);
  }
  function extractJsonObject(raw) {
    let content = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = content.indexOf("{");
    if (firstBrace !== -1) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let endPos = -1;
      for (let i = firstBrace; i < content.length; i++) {
        const ch = content[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\" && inString) {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            endPos = i;
            break;
          }
        }
      }
      if (endPos > firstBrace) {
        content = content.substring(firstBrace, endPos + 1);
      } else {
        const lastBrace = content.lastIndexOf("}");
        if (lastBrace > firstBrace) {
          content = content.substring(firstBrace, lastBrace + 1);
        }
      }
    }
    try {
      return JSON.parse(content);
    } catch (firstErr) {
      const fixed = content.replace(/,\s*([\]}])/g, "$1");
      try {
        return JSON.parse(fixed);
      } catch {
        throw firstErr;
      }
    }
  }
  const FALLBACK_SYSTEM = '你是一个逻辑严密的B站收藏夹视频分类专家。你只输出纯JSON，不输出任何其他内容。JSON格式为：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字}]}}';
  const ANTHROPIC_API_VERSION = "2025-04-14";
  function isPrivateHost(hostname) {
    const PRIVATE_PATTERNS = [
      /^127\./,
/^10\./,
/^172\.(1[6-9]|2\d|3[01])\./,
/^192\.168\./,
/^0\./,
/^169\.254\./,
/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./
];
    if (/^(localhost|0\.0\.0\.0)$/i.test(hostname)) return true;
    const bare = hostname.replace(/^\[|\]$/g, "");
    if (/^(::1?|0{1,4}(:{1,2}0{1,4}){0,6}:?:?0{0,3}1?)$/i.test(bare)) return true;
    if (/^::ffff:(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i.test(bare)) return true;
    return PRIVATE_PATTERNS.some((p) => p.test(hostname));
  }
  function getProviderBaseUrl(settings2) {
    const config = AI_PROVIDERS[settings2.provider];
    if (config == null ? void 0 : config.isCustom) {
      let url = (settings2.customBaseUrl || "").trim().replace(/\/+$/, "");
      if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
      if (url) {
        try {
          const parsed = new URL(url);
          if (isPrivateHost(parsed.hostname)) {
            throw new Error("自定义 API 地址指向内网地址，已拒绝 (SSRF 防护)");
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "自定义 API 地址格式无效";
          logs.add(msg, "error");
          throw new Error(msg);
        }
        if (/^http:\/\//i.test(url)) {
          logs.add("自定义 API 地址使用了 HTTP 而非 HTTPS，存在中间人攻击风险", "warning");
        }
      }
      return url;
    }
    return (config == null ? void 0 : config.baseUrl) ?? "";
  }
  function resolvePrompt(prompt) {
    if (typeof prompt === "string") {
      return { system: FALLBACK_SYSTEM, user: prompt };
    }
    return { system: prompt.system ?? FALLBACK_SYSTEM, user: prompt.user };
  }
  function buildGeminiRequest(prompt, s) {
    const base = AI_PROVIDERS.gemini.baseUrl;
    const { system: systemText, user: userText } = resolvePrompt(prompt);
    return {
      url: `${base}/models/${s.modelName}:generateContent?key=${s.apiKey}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: [{ parts: [{ text: userText }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    };
  }
  function buildChatMessages(prompt) {
    const { system, user } = resolvePrompt(prompt);
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: user });
    return messages;
  }
  function buildChatCompletionRequest(prompt, s, baseUrl, endpoint) {
    return {
      url: `${baseUrl}${endpoint}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.apiKey}`
      },
      body: JSON.stringify({
        model: s.modelName,
        messages: buildChatMessages(prompt),
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    };
  }
  function buildOpenAIRequest(prompt, s) {
    return buildChatCompletionRequest(prompt, s, getProviderBaseUrl(s), "/chat/completions");
  }
  function buildAnthropicRequest(prompt, s) {
    const base = AI_PROVIDERS.anthropic.baseUrl;
    const { system: systemText, user: userText } = resolvePrompt(prompt);
    return {
      url: `${base}/v1/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": s.apiKey,
        "anthropic-version": ANTHROPIC_API_VERSION,
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: s.modelName,
        max_tokens: 8192,
        system: systemText,
        messages: [{ role: "user", content: userText }],
        temperature: 0.1
      })
    };
  }
  function buildGitHubRequest(prompt, s) {
    return buildChatCompletionRequest(
      prompt,
      s,
      AI_PROVIDERS.github.baseUrl,
      "/inference/chat/completions"
    );
  }
  function trackUsage(input, output, total) {
    tokenUsage.update((u) => ({
      ...u,
      callCount: u.callCount + 1,
      promptTokens: u.promptTokens + input,
      completionTokens: u.completionTokens + output,
      totalTokens: u.totalTokens + (total ?? input + output)
    }));
  }
  function parseGeminiResponse(text2) {
    var _a2, _b2, _c2, _d, _e;
    const json = JSON.parse(text2);
    if (json.usageMetadata) {
      const u = json.usageMetadata;
      trackUsage(u.promptTokenCount ?? 0, u.candidatesTokenCount ?? 0, u.totalTokenCount);
    }
    const content = (_e = (_d = (_c2 = (_b2 = (_a2 = json.candidates) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.content) == null ? void 0 : _c2.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text;
    if (!content) throw new Error("Gemini 响应结构异常: 未找到有效内容");
    return content;
  }
  function parseOpenAIResponse(text2) {
    var _a2, _b2, _c2;
    const json = JSON.parse(text2);
    if (json.usage) {
      const u = json.usage;
      trackUsage(u.prompt_tokens ?? u.input_tokens ?? 0, u.completion_tokens ?? u.output_tokens ?? 0, u.total_tokens);
    }
    const content = (_c2 = (_b2 = (_a2 = json.choices) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.message) == null ? void 0 : _c2.content;
    if (!content) throw new Error("OpenAI 响应结构异常: 未找到有效内容");
    return content;
  }
  function parseAnthropicResponse(text2) {
    var _a2, _b2;
    const json = JSON.parse(text2);
    if (json.usage) {
      const u = json.usage;
      trackUsage(u.prompt_tokens ?? u.input_tokens ?? 0, u.completion_tokens ?? u.output_tokens ?? 0, u.total_tokens);
    }
    const content = (_b2 = (_a2 = json.content) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.text;
    if (!content) throw new Error("Anthropic 响应结构异常: 未找到有效内容");
    return content;
  }
  const REQUEST_BUILDERS = {
    gemini: buildGeminiRequest,
    openai: buildOpenAIRequest,
    github: buildGitHubRequest,
    anthropic: buildAnthropicRequest
  };
  const RESPONSE_PARSERS = {
    gemini: parseGeminiResponse,
    openai: parseOpenAIResponse,
    github: parseOpenAIResponse,
    anthropic: parseAnthropicResponse
  };
  function formatTokenCount(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }
  const MODEL_PRICING = {
    "gemini-2.5-flash": [0.15, 0.6],
    "gemini-2.5-pro": [1.25, 10],
    "gemini-2.0-flash": [0.1, 0.4],
    "gemini-1.5-flash": [0.075, 0.3],
    "gemini-1.5-pro": [1.25, 5],
    "gpt-4o": [2.5, 10],
    "gpt-4o-mini": [0.15, 0.6],
    "gpt-4.1": [2, 8],
    "gpt-4.1-mini": [0.4, 1.6],
    "gpt-4.1-nano": [0.1, 0.4],
    "o3-mini": [1.1, 4.4],
    "o4-mini": [1.1, 4.4],
    "deepseek-chat": [0.27, 1.1],
    "deepseek-reasoner": [0.55, 2.19],
    "claude-sonnet-4-6": [3, 15],
    "claude-opus-4-6": [15, 75],
    "claude-haiku-4-5": [0.8, 4],
    "llama-3.3-70b-versatile": [0.59, 0.79]
  };
  function estimateCost(modelName) {
    const usage = get$1(tokenUsage);
    if (usage.totalTokens === 0) return null;
    let pricing = MODEL_PRICING[modelName];
    if (!pricing) {
      const key = Object.keys(MODEL_PRICING).sort((a, b) => b.length - a.length).find((k) => modelName.startsWith(k));
      if (key) pricing = MODEL_PRICING[key];
    }
    if (!pricing) return null;
    const inputCost = usage.promptTokens / 1e6 * pricing[0];
    const outputCost = usage.completionTokens / 1e6 * pricing[1];
    const totalUSD = inputCost + outputCost;
    const totalCNY = totalUSD * 7.2;
    if (totalUSD < 1e-3) return "< $0.001 (≈ ¥0.01)";
    return `$${totalUSD.toFixed(4)} (≈ ¥${totalCNY.toFixed(3)})`;
  }
  function validateAIResult(parsed) {
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("AI 返回的 JSON 不是对象");
    }
    const obj = parsed;
    if (obj.categories !== void 0) {
      if (typeof obj.categories !== "object" || obj.categories === null || Array.isArray(obj.categories)) {
        throw new Error("AI 返回的 categories 字段格式错误（应为对象）");
      }
      for (const [catName, entries] of Object.entries(obj.categories)) {
        if (!Array.isArray(entries)) {
          throw new Error(`分类「${catName}」的值不是数组`);
        }
        for (const entry of entries) {
          if (typeof entry !== "object" || entry === null) {
            throw new Error(`分类「${catName}」中包含非对象条目`);
          }
          const e = entry;
          if (typeof e.id !== "number" || typeof e.type !== "number") {
            throw new Error(`分类「${catName}」中条目缺少有效的 id/type 字段`);
          }
        }
      }
    }
    return parsed;
  }
  class RetryableError extends Error {
    constructor(message) {
      super(message);
      this.name = "RetryableError";
    }
  }
  function redactApiKey(text2, apiKey) {
    if (!apiKey || apiKey.length < 4) return text2;
    try {
      return text2.replace(
        new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        "***"
      );
    } catch {
      return text2.replaceAll(apiKey, "***");
    }
  }
  function callAISingle(prompt, settings2) {
    var _a2;
    const fmt = ((_a2 = AI_PROVIDERS[settings2.provider]) == null ? void 0 : _a2.format) ?? "gemini";
    const builder = REQUEST_BUILDERS[fmt] ?? REQUEST_BUILDERS.gemini;
    const parser = RESPONSE_PARSERS[fmt] ?? RESPONSE_PARSERS.gemini;
    const { url, headers, body } = builder(prompt, settings2);
    return new Promise((resolve, reject) => {
      gmXmlHttpRequest({
        method: "POST",
        url,
        headers,
        data: body,
        timeout: AI_TIMEOUT_MS,
        onload(response) {
          if ([429, 503, 529].includes(response.status)) {
            reject(new RetryableError(`API 限流/过载 (${response.status})`));
            return;
          }
          if (response.status !== 200) {
            const errSnippet = redactApiKey(
              response.responseText || "",
              settings2.apiKey
            ).substring(0, 300);
            reject(new Error(`API 报错 ${response.status}：${errSnippet}`));
            return;
          }
          try {
            const content = parser(response.responseText);
            const parsed = extractJsonObject(content);
            const result = validateAIResult(parsed);
            resolve(result);
          } catch (e) {
            const snippet2 = redactApiKey(
              response.responseText || "",
              settings2.apiKey
            ).substring(0, 120);
            reject(new Error(`解析 AI 回复失败: ${getErrorMessage(e)}
响应片段: ${snippet2}`));
          }
        },
        onerror(resp) {
          const detail = resp && typeof resp === "object" && "error" in resp ? ` (${String(resp.error)})` : "";
          reject(new RetryableError(`网络请求失败${detail}，请检查网络或 API 地址`));
        },
        ontimeout() {
          reject(new RetryableError("AI 请求超时"));
        }
      });
    });
  }
  async function callAI(prompt, settings2, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callAISingle(prompt, settings2);
      } catch (err) {
        const isRetryable = err instanceof RetryableError;
        const errMsg = getErrorMessage(err);
        if (isRetryable && attempt < maxRetries) {
          const waitMs = backoffMs(attempt, 2e3, 16e3);
          logs.add(
            `AI 请求失败 (${errMsg})，${(waitMs / 1e3).toFixed(0)}秒后重试 (${attempt}/${maxRetries})...`,
            "warning"
          );
          await sleep(waitMs);
          continue;
        }
        throw new Error(errMsg);
      }
    }
    throw new Error(`AI 请求 ${maxRetries} 次均失败`);
  }
  async function fetchModelList(settings2) {
    const config = AI_PROVIDERS[settings2.provider];
    if (!config) throw new Error("不支持的提供商");
    const fmt = config.format;
    if (fmt === "gemini") {
      const allModels = [];
      let pageToken = "";
      const MAX_PAGES = 20;
      let page = 0;
      do {
        if (++page > MAX_PAGES) break;
        const params = new URLSearchParams({ key: settings2.apiKey, pageSize: "100" });
        if (pageToken) params.set("pageToken", pageToken);
        const pageUrl = `${config.baseUrl}/models?${params}`;
        const resp2 = await gmFetch(pageUrl);
        let json2;
        try {
          json2 = JSON.parse(resp2.responseText);
        } catch {
          throw new Error(`Gemini 模型列表返回了无效 JSON: ${resp2.responseText.substring(0, 120)}`);
        }
        const models2 = (json2.models ?? []).filter((m) => {
          var _a2;
          return (_a2 = m.supportedGenerationMethods) == null ? void 0 : _a2.includes("generateContent");
        }).map((m) => m.name.replace("models/", ""));
        allModels.push(...models2);
        pageToken = json2.nextPageToken ?? "";
      } while (pageToken);
      allModels.sort();
      return allModels;
    }
    let url;
    let headers = {};
    if (fmt === "openai") {
      url = `${getProviderBaseUrl(settings2)}/models`;
      headers = { Authorization: `Bearer ${settings2.apiKey}` };
    } else if (fmt === "github") {
      url = `${config.baseUrl}/catalog/models`;
      headers = { Authorization: `Bearer ${settings2.apiKey}` };
    } else if (fmt === "anthropic") {
      url = `${config.baseUrl}/v1/models`;
      headers = {
        "x-api-key": settings2.apiKey,
        "anthropic-version": "2024-10-22"
};
    } else {
      throw new Error("不支持的提供商");
    }
    const resp = await gmFetch(url, { headers });
    let json;
    try {
      json = JSON.parse(resp.responseText);
    } catch {
      throw new Error(`模型列表返回了无效 JSON: ${resp.responseText.substring(0, 120)}`);
    }
    let models;
    if (fmt === "github") {
      const list = Array.isArray(json) ? json : json.data ?? json.models ?? [];
      models = list.map((m) => m.id ?? m.name ?? "").filter(Boolean);
    } else {
      const obj = json;
      const list = obj.data ?? [];
      models = list.map((m) => m.id ?? "").filter(Boolean);
    }
    models.sort();
    return models;
  }
  var root_5$9 = from_html(`<input class="model-search svelte-1rt0kwk" type="text" placeholder="搜索模型..."/>`);
  var root_6$5 = from_html(`<button> </button>`);
  var root_7$4 = from_html(`<div class="model-empty svelte-1rt0kwk">无匹配模型</div>`);
  var root_4$b = from_html(`<div class="model-dropdown svelte-1rt0kwk"><!> <div class="model-list svelte-1rt0kwk"><!> <!></div></div>`);
  var root$f = from_html(`<div class="bfao-field svelte-1rt0kwk"><label class="bfao-label svelte-1rt0kwk" for="bfao-model">模型</label> <div class="bfao-input-row svelte-1rt0kwk"><input id="bfao-model" class="bfao-input bfao-input-flex svelte-1rt0kwk" type="text" placeholder="输入或搜索模型名称"/> <button class="bfao-icon-btn svelte-1rt0kwk" title="获取模型列表"><!></button> <button title="测试连通性"><!></button></div> <!></div>`);
  function ModelSelector($$anchor, $$props) {
    push($$props, true);
    const $settings = () => store_get(settings, "$settings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let modelLoading = state(false);
    let modelList = state(proxy([]));
    let showModelDropdown = state(false);
    let modelSearchQuery = state("");
    let testStatus = state("idle");
    user_effect(() => {
      const provider = $settings().provider;
      const cached = gmGetValue(`bfao_modelList_${provider}`, []);
      set(modelList, cached.length > 0 ? cached : [], true);
    });
    let filteredModels = user_derived(() => (() => {
      const q = get(modelSearchQuery).trim().toLowerCase();
      if (!q) return get(modelList);
      return get(modelList).filter((m) => m.toLowerCase().includes(q));
    })());
    async function handleFetchModels() {
      set(modelLoading, true);
      try {
        const s = $settings();
        set(modelList, await fetchModelList(s), true);
        set(showModelDropdown, true);
        gmSetValue(`bfao_modelList_${s.provider}`, get(modelList));
        logs.add(`获取到 ${get(modelList).length} 个模型`, "success");
      } catch (e) {
        logs.add(`获取模型列表失败: ${getErrorMessage(e)}`, "error");
      } finally {
        set(modelLoading, false);
      }
    }
    function selectModel(model) {
      settings.update({ modelName: model });
      set(showModelDropdown, false);
      set(modelSearchQuery, "");
    }
    function handleDocClick(e) {
      const target = e.target;
      if (!target.closest(".bfao-field") || !target.closest("#bfao-model, .model-dropdown, .model-search")) {
        set(showModelDropdown, false);
      }
    }
    user_effect(() => {
      if (get(showModelDropdown)) {
        document.addEventListener("click", handleDocClick, true);
        return () => document.removeEventListener("click", handleDocClick, true);
      }
    });
    async function handleTestConnectivity() {
      set(testStatus, "loading");
      try {
        const s = $settings();
        if (!s.apiKey) {
          logs.add("请先填写 API Key", "warning");
          set(testStatus, "idle");
          return;
        }
        await fetchModelList(s);
        set(testStatus, "success");
        logs.add("连通性测试成功 ✓", "success");
      } catch (e) {
        set(testStatus, "error");
        logs.add(`连通性测试失败: ${getErrorMessage(e)}`, "error");
      }
      setTimeout(
        () => {
          set(testStatus, "idle");
        },
        2e3
      );
    }
    var div = root$f();
    var div_1 = sibling(child(div), 2);
    var input = child(div_1);
    action(input, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
    var button = sibling(input, 2);
    var node = child(button);
    {
      let $0 = user_derived(() => get(modelLoading) ? "spinning" : "");
      Refresh_cw(node, {
        size: 14,
        get class() {
          return get($0);
        }
      });
    }
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_1 = sibling(button, 2);
    let classes;
    var node_1 = child(button_1);
    {
      var consequent = ($$anchor2) => {
        Circle_check_big($$anchor2, { size: 14 });
      };
      var consequent_1 = ($$anchor2) => {
        Circle_x($$anchor2, { size: 14 });
      };
      var alternate = ($$anchor2) => {
        {
          let $0 = user_derived(() => get(testStatus) === "loading" ? "spinning" : "");
          Zap($$anchor2, {
            size: 14,
            get class() {
              return get($0);
            }
          });
        }
      };
      if_block(node_1, ($$render) => {
        if (get(testStatus) === "success") $$render(consequent);
        else if (get(testStatus) === "error") $$render(consequent_1, 1);
        else $$render(alternate, -1);
      });
    }
    action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var node_2 = sibling(div_1, 2);
    {
      var consequent_4 = ($$anchor2) => {
        var div_2 = root_4$b();
        var node_3 = child(div_2);
        {
          var consequent_2 = ($$anchor3) => {
            var input_1 = root_5$9();
            bind_value(input_1, () => get(modelSearchQuery), ($$value) => set(modelSearchQuery, $$value));
            append($$anchor3, input_1);
          };
          if_block(node_3, ($$render) => {
            if (get(modelList).length > 5) $$render(consequent_2);
          });
        }
        var div_3 = sibling(node_3, 2);
        var node_4 = child(div_3);
        each(node_4, 17, () => get(filteredModels), index, ($$anchor3, model) => {
          var button_2 = root_6$5();
          let classes_1;
          var text2 = child(button_2);
          template_effect(() => {
            classes_1 = set_class(button_2, 1, "model-item svelte-1rt0kwk", null, classes_1, { active: get(model) === $settings().modelName });
            set_text(text2, get(model));
          });
          delegated("click", button_2, () => selectModel(get(model)));
          append($$anchor3, button_2);
        });
        var node_5 = sibling(node_4, 2);
        {
          var consequent_3 = ($$anchor3) => {
            var div_4 = root_7$4();
            append($$anchor3, div_4);
          };
          if_block(node_5, ($$render) => {
            if (get(filteredModels).length === 0) $$render(consequent_3);
          });
        }
        append($$anchor2, div_2);
      };
      if_block(node_2, ($$render) => {
        if (get(showModelDropdown) && get(modelList).length > 0) $$render(consequent_4);
      });
    }
    template_effect(() => {
      set_value(input, $settings().modelName);
      button.disabled = get(modelLoading);
      classes = set_class(button_1, 1, "bfao-icon-btn svelte-1rt0kwk", null, classes, {
        "test-success": get(testStatus) === "success",
        "test-error": get(testStatus) === "error"
      });
      button_1.disabled = get(testStatus) === "loading";
    });
    delegated("input", input, (e) => settings.update({ modelName: e.target.value }));
    event("focus", input, () => {
      if (get(modelList).length > 0) set(showModelDropdown, true);
    });
    delegated("click", input, () => {
      if (get(modelList).length > 0) set(showModelDropdown, !get(showModelDropdown));
    });
    delegated("click", button, handleFetchModels);
    delegated("click", button_1, handleTestConnectivity);
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["input", "click"]);
  var root_1$8 = from_html(`<option> </option>`);
  var root_2$c = from_html(`<a target="_blank" rel="noopener noreferrer" class="link-btn svelte-14s97jl" title="申请 API Key"><!></a>`);
  var root_3$b = from_html(`<div class="bfao-field field-slide-in svelte-14s97jl"><label class="bfao-label" for="bfao-custom-url">API 地址</label> <input id="bfao-custom-url" class="bfao-input" type="text" placeholder="https://your-api.com/v1"/></div>`);
  var root$e = from_html(`<div class="provider-config svelte-14s97jl"><div class="bfao-field"><label class="bfao-label" for="bfao-provider">AI 服务商</label> <div class="bfao-input-row"><select id="bfao-provider" class="bfao-select"></select> <!></div></div> <!> <div class="bfao-field"><label class="bfao-label" for="bfao-api-key">API Key</label> <div class="bfao-input-row"><input id="bfao-api-key" class="bfao-input bfao-input-flex"/> <button class="bfao-icon-btn svelte-14s97jl"><!></button></div></div> <!> <div class="bfao-field"><label class="bfao-label" for="bfao-concurrency">AI 并发数</label> <input id="bfao-concurrency" class="bfao-input bfao-input-small" type="number" min="1" max="20"/></div></div>`);
  function ProviderConfig($$anchor, $$props) {
    push($$props, true);
    const $settings = () => store_get(settings, "$settings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let showApiKey = state(false);
    let providerConfig = user_derived(() => AI_PROVIDERS[$settings().provider]);
    let isCustomProvider = user_derived(() => {
      var _a2;
      return ((_a2 = get(providerConfig)) == null ? void 0 : _a2.isCustom) ?? false;
    });
    function handleProviderChange(e) {
      const value = e.target.value;
      const config = AI_PROVIDERS[value];
      settings.update({
        provider: value,
        modelName: (config == null ? void 0 : config.defaultModel) ?? "",
        apiKey: ""
      });
      settings.reload();
    }
    var div = root$e();
    var div_1 = child(div);
    var div_2 = sibling(child(div_1), 2);
    var select = child(div_2);
    each(select, 21, () => Object.entries(AI_PROVIDERS), index, ($$anchor2, $$item) => {
      var $$array = user_derived(() => to_array(get($$item), 2));
      let key = () => get($$array)[0];
      let config = () => get($$array)[1];
      var option = root_1$8();
      var text2 = child(option);
      var option_value = {};
      template_effect(() => {
        set_text(text2, config().name);
        if (option_value !== (option_value = key())) {
          option.value = (option.__value = key()) ?? "";
        }
      });
      append($$anchor2, option);
    });
    var select_value;
    init_select(select);
    var node = sibling(select, 2);
    {
      var consequent = ($$anchor2) => {
        var a = root_2$c();
        var node_1 = child(a);
        External_link(node_1, { size: 14 });
        template_effect(() => set_attribute(a, "href", get(providerConfig).apiUrl));
        append($$anchor2, a);
      };
      if_block(node, ($$render) => {
        var _a2;
        if ((_a2 = get(providerConfig)) == null ? void 0 : _a2.apiUrl) $$render(consequent);
      });
    }
    var node_2 = sibling(div_1, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var div_3 = root_3$b();
        var input = sibling(child(div_3), 2);
        action(input, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
        template_effect(() => set_value(input, $settings().customBaseUrl));
        delegated("input", input, (e) => settings.update({ customBaseUrl: e.target.value }));
        append($$anchor2, div_3);
      };
      if_block(node_2, ($$render) => {
        if (get(isCustomProvider)) $$render(consequent_1);
      });
    }
    var div_4 = sibling(node_2, 2);
    var div_5 = sibling(child(div_4), 2);
    var input_1 = child(div_5);
    action(input_1, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
    var button = sibling(input_1, 2);
    var node_3 = child(button);
    {
      var consequent_2 = ($$anchor2) => {
        Eye_off($$anchor2, { size: 14 });
      };
      var alternate = ($$anchor2) => {
        Eye($$anchor2, { size: 14 });
      };
      if_block(node_3, ($$render) => {
        if (get(showApiKey)) $$render(consequent_2);
        else $$render(alternate, -1);
      });
    }
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var node_4 = sibling(div_4, 2);
    ModelSelector(node_4, {});
    var div_6 = sibling(node_4, 2);
    var input_2 = sibling(child(div_6), 2);
    action(input_2, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
    template_effect(() => {
      var _a2;
      if (select_value !== (select_value = $settings().provider)) {
        select.value = (select.__value = $settings().provider) ?? "", select_option(select, $settings().provider);
      }
      set_attribute(input_1, "type", get(showApiKey) ? "text" : "password");
      set_attribute(input_1, "placeholder", ((_a2 = get(providerConfig)) == null ? void 0 : _a2.keyPlaceholder) ?? "填入 API Key");
      set_value(input_1, $settings().apiKey);
      set_attribute(button, "title", get(showApiKey) ? "隐藏" : "显示");
      set_value(input_2, $settings().aiConcurrency);
    });
    delegated("change", select, handleProviderChange);
    delegated("input", input_1, (e) => settings.update({ apiKey: e.target.value }));
    delegated("click", button, () => set(showApiKey, !get(showApiKey)));
    delegated("input", input_2, (e) => settings.update({ aiConcurrency: Number(e.target.value) || 2 }));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["change", "input", "click"]);
  var root$d = from_html(`<button role="switch"><span class="thumb svelte-4afsks"></span></button>`);
  function LiquidToggle($$anchor, $$props) {
    push($$props, true);
    let checked = prop($$props, "checked", 3, false), label = prop($$props, "label", 3, "");
    let thumbEl = state(void 0);
    let trackEl = state(void 0);
    let mounted = false;
    let activeTl = null;
    onMount(() => {
      if (checked() && get(thumbEl)) {
        gsap.set(get(thumbEl), { x: 18 });
      }
      if (get(trackEl) && shouldAnimate()) {
        gsap.fromTo(get(trackEl), { scale: 0.6, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: EASINGS.velvetSpring,
          clearProps: "opacity,transform"
        });
      }
      mounted = true;
    });
    onDestroy(() => {
      activeTl == null ? void 0 : activeTl.kill();
      if (get(thumbEl)) gsap.killTweensOf(get(thumbEl));
      if (get(trackEl)) gsap.killTweensOf(get(trackEl));
    });
    function toggle() {
      var _a2;
      const newChecked = !checked();
      (_a2 = $$props.onchange) == null ? void 0 : _a2.call($$props, newChecked);
      if (!mounted || !get(thumbEl) || !get(trackEl)) return;
      if (!shouldAnimateFunctional()) {
        gsap.set(get(thumbEl), { x: newChecked ? 18 : 0 });
        return;
      }
      activeTl == null ? void 0 : activeTl.kill();
      const tl = gsap.timeline();
      activeTl = tl;
      if (shouldAnimate()) {
        tl.to(get(thumbEl), { scaleX: 1.3, scaleY: 0.85, duration: 0.12, ease: "power2.in" });
      }
      tl.to(get(thumbEl), {
        x: newChecked ? 18 : 0,
        scaleX: 1,
        scaleY: 1,
        duration: shouldAnimate() ? 0.28 : 0.15,
        ease: shouldAnimate() ? EASINGS.velvetSpring : "power2.out"
      });
      if (!shouldAnimate()) return;
      gsap.to(get(trackEl), {
        scale: 1.06,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    }
    var button = root$d();
    let classes;
    var span = child(button);
    bind_this(span, ($$value) => set(thumbEl, $$value), () => get(thumbEl));
    bind_this(button, ($$value) => set(trackEl, $$value), () => get(trackEl));
    template_effect(() => {
      classes = set_class(button, 1, "liquid-toggle svelte-4afsks", null, classes, { on: checked() });
      set_attribute(button, "aria-checked", checked());
      set_attribute(button, "aria-label", label() || void 0);
    });
    delegated("click", button, toggle);
    append($$anchor, button);
    pop();
  }
  delegate(["click"]);
  var root_3$a = from_html(`<option> </option>`);
  var root_4$a = from_html(`<option> </option>`);
  var root_5$8 = from_html(`<input class="bfao-input bfao-input-small sub-field-slide svelte-182y78p" type="number" min="10" max="5000"/>`);
  var root_2$b = from_html(`<div class="field-grid svelte-182y78p"><div class="bfao-field"><label class="bfao-label" for="bfao-chunk-size">AI 批次大小</label> <input id="bfao-chunk-size" class="bfao-input" type="number" min="1" max="9999" list="bfao-chunk-presets"/> <datalist id="bfao-chunk-presets"></datalist></div> <div class="bfao-field"><label class="bfao-label" for="bfao-fetch-delay">请求速度</label> <select id="bfao-fetch-delay" class="bfao-select"></select></div> <div class="bfao-field"><label class="bfao-label" for="bfao-write-delay">写操作间隔 (ms)</label> <input id="bfao-write-delay" class="bfao-input" type="number" min="500" max="10000" step="100"/></div> <div class="bfao-field"><label class="bfao-label" for="bfao-move-chunk">每次移动视频数</label> <input id="bfao-move-chunk" class="bfao-input" type="number" min="1" max="100"/></div> <div class="bfao-field full svelte-182y78p"><label class="bfao-checkbox-label"><input type="checkbox"/> <span>限制处理数量</span></label> <!></div> <div class="bfao-field"><label class="bfao-label" for="bfao-rest-interval">批量休息间隔</label> <select id="bfao-rest-interval" class="bfao-select"><option>50次</option><option>80次</option><option>100次</option><option>150次</option><option>200次</option><option>300次</option></select></div> <div class="bfao-field"><label class="bfao-label" for="bfao-rest-minutes">休息时长 (分)</label> <select id="bfao-rest-minutes" class="bfao-select"><option>0.5分钟</option><option>1分钟</option><option>1.5分钟</option><option>2分钟</option><option>3分钟</option><option>5分钟</option></select></div></div>`);
  var root_7$3 = from_html(`<div class="sub-field sub-field-slide svelte-182y78p"><label class="bfao-label" for="bfao-cache-interval">缓存间隔 (分)</label> <select id="bfao-cache-interval" class="bfao-select bfao-input-small"><option>5</option><option>15</option><option>30</option><option>60</option></select></div>`);
  var root_6$4 = from_html(`<div class="toggle-list svelte-182y78p"><div class="toggle-row svelte-182y78p"><span class="svelte-182y78p">自适应限速</span> <!></div> <div class="toggle-row svelte-182y78p"><span class="svelte-182y78p">完成后通知</span> <!></div> <div class="toggle-row svelte-182y78p"><span class="svelte-182y78p">增量整理 (仅新增)</span> <!></div> <div class="toggle-row svelte-182y78p"><span class="svelte-182y78p">后台自动缓存</span> <!></div> <!></div>`);
  var root_9$2 = from_html(`<div class="anim-hint hint-fade-in svelte-182y78p">系统已开启「减少动画」，动画被自动禁用。</div>`);
  var root_8$1 = from_html(`<div class="toggle-row svelte-182y78p"><span class="svelte-182y78p">启用极致动画效果</span> <!></div> <!>`, 1);
  var root$c = from_html(`<div class="settings-panel svelte-182y78p"><!> <!> <!> <!></div>`);
  function SettingsPanel($$anchor, $$props) {
    push($$props, false);
    const $settings = () => store_get(settings, "$settings", $$stores);
    const $prefersReducedMotion = () => store_get(prefersReducedMotion, "$prefersReducedMotion", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    init();
    var div = root$c();
    var node = child(div);
    SettingsGroup(node, {
      title: "AI 服务配置",
      get icon() {
        return Cpu;
      },
      iconColor: "#7C5CFC",
      children: ($$anchor2, $$slotProps) => {
        ProviderConfig($$anchor2, {});
      },
      $$slots: { default: true }
    });
    var node_1 = sibling(node, 2);
    SettingsGroup(node_1, {
      title: "请求参数",
      get icon() {
        return Sliders_horizontal;
      },
      iconColor: "#6366f1",
      children: ($$anchor2, $$slotProps) => {
        var div_1 = root_2$b();
        var div_2 = child(div_1);
        var input = sibling(child(div_2), 2);
        var datalist = sibling(input, 2);
        each(datalist, 5, () => AI_CHUNK_PRESETS, index, ($$anchor3, preset) => {
          var option = root_3$a();
          var text2 = child(option);
          var option_value = {};
          template_effect(() => {
            set_text(text2, get(preset).label);
            if (option_value !== (option_value = get(preset).value)) {
              option.value = (option.__value = get(preset).value) ?? "";
            }
          });
          append($$anchor3, option);
        });
        var div_3 = sibling(div_2, 2);
        var select = sibling(child(div_3), 2);
        each(select, 5, () => SPEED_PRESETS, index, ($$anchor3, preset) => {
          var option_1 = root_4$a();
          var text_1 = child(option_1);
          var option_1_value = {};
          template_effect(() => {
            set_text(text_1, get(preset).label);
            if (option_1_value !== (option_1_value = get(preset).value)) {
              option_1.value = (option_1.__value = get(preset).value) ?? "";
            }
          });
          append($$anchor3, option_1);
        });
        var select_value;
        init_select(select);
        var div_4 = sibling(div_3, 2);
        var input_1 = sibling(child(div_4), 2);
        action(input_1, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
        var div_5 = sibling(div_4, 2);
        var input_2 = sibling(child(div_5), 2);
        action(input_2, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
        var div_6 = sibling(div_5, 2);
        var label = child(div_6);
        var input_3 = child(label);
        var node_2 = sibling(label, 2);
        {
          var consequent = ($$anchor3) => {
            var input_4 = root_5$8();
            action(input_4, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
            template_effect(() => set_value(input_4, $settings().limitCount));
            delegated("input", input_4, (e) => settings.update({ limitCount: Number(e.target.value) || 200 }));
            append($$anchor3, input_4);
          };
          if_block(node_2, ($$render) => {
            if ($settings().limitEnabled) $$render(consequent);
          });
        }
        var div_7 = sibling(div_6, 2);
        var select_1 = sibling(child(div_7), 2);
        var option_2 = child(select_1);
        option_2.value = option_2.__value = 50;
        var option_3 = sibling(option_2);
        option_3.value = option_3.__value = 80;
        var option_4 = sibling(option_3);
        option_4.value = option_4.__value = 100;
        var option_5 = sibling(option_4);
        option_5.value = option_5.__value = 150;
        var option_6 = sibling(option_5);
        option_6.value = option_6.__value = 200;
        var option_7 = sibling(option_6);
        option_7.value = option_7.__value = 300;
        var select_1_value;
        init_select(select_1);
        var div_8 = sibling(div_7, 2);
        var select_2 = sibling(child(div_8), 2);
        var option_8 = child(select_2);
        option_8.value = option_8.__value = 0.5;
        var option_9 = sibling(option_8);
        option_9.value = option_9.__value = 1;
        var option_10 = sibling(option_9);
        option_10.value = option_10.__value = 1.5;
        var option_11 = sibling(option_10);
        option_11.value = option_11.__value = 2;
        var option_12 = sibling(option_11);
        option_12.value = option_12.__value = 3;
        var option_13 = sibling(option_12);
        option_13.value = option_13.__value = 5;
        var select_2_value;
        init_select(select_2);
        template_effect(() => {
          set_value(input, $settings().aiChunkSize);
          if (select_value !== (select_value = $settings().fetchDelay)) {
            select.value = (select.__value = $settings().fetchDelay) ?? "", select_option(select, $settings().fetchDelay);
          }
          set_value(input_1, $settings().writeDelay);
          set_value(input_2, $settings().moveChunkSize);
          set_checked(input_3, $settings().limitEnabled);
          if (select_1_value !== (select_1_value = $settings().batchRestInterval)) {
            select_1.value = (select_1.__value = $settings().batchRestInterval) ?? "", select_option(select_1, $settings().batchRestInterval);
          }
          if (select_2_value !== (select_2_value = $settings().batchRestMinutes)) {
            select_2.value = (select_2.__value = $settings().batchRestMinutes) ?? "", select_option(select_2, $settings().batchRestMinutes);
          }
        });
        delegated("change", input, (e) => {
          const v = Math.max(1, Number(e.target.value) || 50);
          settings.update({ aiChunkSize: v });
        });
        delegated("change", select, (e) => settings.update({ fetchDelay: Number(e.target.value) }));
        delegated("input", input_1, (e) => settings.update({ writeDelay: Number(e.target.value) || 2500 }));
        delegated("input", input_2, (e) => settings.update({ moveChunkSize: Number(e.target.value) || 20 }));
        delegated("change", input_3, (e) => settings.update({ limitEnabled: e.target.checked }));
        delegated("change", select_1, (e) => settings.update({ batchRestInterval: Number(e.target.value) }));
        delegated("change", select_2, (e) => settings.update({ batchRestMinutes: Number(e.target.value) }));
        append($$anchor2, div_1);
      },
      $$slots: { default: true }
    });
    var node_3 = sibling(node_1, 2);
    SettingsGroup(node_3, {
      title: "行为设置",
      get icon() {
        return Toggle_right;
      },
      iconColor: "#10b981",
      children: ($$anchor2, $$slotProps) => {
        var div_9 = root_6$4();
        var div_10 = child(div_9);
        var node_4 = sibling(child(div_10), 2);
        LiquidToggle(node_4, {
          label: "自适应限速",
          get checked() {
            return $settings().adaptiveRate;
          },
          onchange: (v) => settings.update({ adaptiveRate: v })
        });
        var div_11 = sibling(div_10, 2);
        var node_5 = sibling(child(div_11), 2);
        LiquidToggle(node_5, {
          label: "完成后通知",
          get checked() {
            return $settings().notifyOnComplete;
          },
          onchange: (v) => settings.update({ notifyOnComplete: v })
        });
        var div_12 = sibling(div_11, 2);
        var node_6 = sibling(child(div_12), 2);
        LiquidToggle(node_6, {
          label: "增量整理",
          get checked() {
            return $settings().incrementalMode;
          },
          onchange: (v) => settings.update({ incrementalMode: v })
        });
        var div_13 = sibling(div_12, 2);
        var node_7 = sibling(child(div_13), 2);
        LiquidToggle(node_7, {
          label: "后台自动缓存",
          get checked() {
            return $settings().bgCacheEnabled;
          },
          onchange: (v) => settings.update({ bgCacheEnabled: v })
        });
        var node_8 = sibling(div_13, 2);
        {
          var consequent_1 = ($$anchor3) => {
            var div_14 = root_7$3();
            var select_3 = sibling(child(div_14), 2);
            var option_14 = child(select_3);
            option_14.value = option_14.__value = 5;
            var option_15 = sibling(option_14);
            option_15.value = option_15.__value = 15;
            var option_16 = sibling(option_15);
            option_16.value = option_16.__value = 30;
            var option_17 = sibling(option_16);
            option_17.value = option_17.__value = 60;
            var select_3_value;
            init_select(select_3);
            template_effect(() => {
              if (select_3_value !== (select_3_value = $settings().cacheScanInterval)) {
                select_3.value = (select_3.__value = $settings().cacheScanInterval) ?? "", select_option(select_3, $settings().cacheScanInterval);
              }
            });
            delegated("change", select_3, (e) => settings.update({ cacheScanInterval: Number(e.target.value) }));
            append($$anchor3, div_14);
          };
          if_block(node_8, ($$render) => {
            if ($settings().bgCacheEnabled) $$render(consequent_1);
          });
        }
        append($$anchor2, div_9);
      },
      $$slots: { default: true }
    });
    var node_9 = sibling(node_3, 2);
    SettingsGroup(node_9, {
      title: "动画效果",
      get icon() {
        return Sparkles;
      },
      iconColor: "#f59e0b",
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = root_8$1();
        var div_15 = first_child(fragment_1);
        var node_10 = sibling(child(div_15), 2);
        LiquidToggle(node_10, {
          label: "启用极致动画效果",
          get checked() {
            return $settings().animEnabled;
          },
          onchange: (v) => settings.update({ animEnabled: v })
        });
        var node_11 = sibling(div_15, 2);
        {
          var consequent_2 = ($$anchor3) => {
            var div_16 = root_9$2();
            append($$anchor3, div_16);
          };
          if_block(node_11, ($$render) => {
            if ($prefersReducedMotion()) $$render(consequent_2);
          });
        }
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["change", "input"]);
  var root_2$a = from_html(`<option class="svelte-avw5xh"> </option>`);
  var root_1$7 = from_html(`<optgroup label="自定义预设" class="svelte-avw5xh"></optgroup>`);
  var root_3$9 = from_html(`<option class="svelte-avw5xh"> </option>`);
  var root_6$3 = from_html(`<div class="custom-preset-row svelte-avw5xh"><button class="preset-select svelte-avw5xh"> </button> <button class="preset-icon-btn svelte-avw5xh" title="重命名">✎</button> <button class="preset-icon-btn svelte-avw5xh"><!></button> <button class="preset-icon-btn danger svelte-avw5xh" title="删除"><!></button></div>`);
  var root_5$7 = from_html(`<div class="manager-section svelte-avw5xh">自定义</div> <!>`, 1);
  var root_8 = from_html(`<button class="preset-icon-btn svelte-avw5xh" title="恢复显示">↩</button>`);
  var root_9$1 = from_html(`<button class="preset-icon-btn danger svelte-avw5xh" title="隐藏"><!></button>`);
  var root_7$2 = from_html(`<div class="custom-preset-row svelte-avw5xh"><button> </button> <!></div>`);
  var root_4$9 = from_html(`<div class="preset-manager svelte-avw5xh"><div class="manager-title svelte-avw5xh">预设管理</div> <!> <div class="manager-section svelte-avw5xh">内置</div> <!></div>`);
  var root$b = from_html(`<div class="prompt-editor svelte-avw5xh"><div class="prompt-header svelte-avw5xh"><select class="bfao-select svelte-avw5xh"><!><optgroup label="内置预设" class="svelte-avw5xh"></optgroup></select> <button title="保存为自定义预设"><!></button> <button class="prompt-action-btn svelte-avw5xh" title="管理预设"><!></button></div> <textarea class="prompt-textarea svelte-avw5xh" placeholder="输入自定义整理规则（留空则 AI 自动判断最佳分类方式）  示例：按游戏类型分类，如 MOBA、FPS、RPG..."></textarea> <!></div>`);
  function PromptEditor($$anchor, $$props) {
    push($$props, true);
    const $settings = () => store_get(settings, "$settings", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let promptValue = state(proxy($settings().lastPrompt));
    let customPresets = state(proxy(gmGetValue("bfao_customPromptPresets", [])));
    let defaultPresetId = state(proxy(gmGetValue("bfao_defaultPromptPreset", "")));
    let hiddenBuiltins = state(proxy(gmGetValue("bfao_hiddenPresets", [])));
    let showManager = state(false);
    let managerEl = state(void 0);
    let saveFlash = state(false);
    let visibleBuiltins = user_derived(() => BUILTIN_PRESETS.filter((p) => !get(hiddenBuiltins).includes(p.label)));
    const savePrompt = debounce(
      (value) => {
        settings.update({ lastPrompt: value });
      },
      1e3
    );
    function handleInput(e) {
      set(promptValue, e.target.value, true);
      savePrompt(get(promptValue));
    }
    function handlePresetChange(e) {
      const value = e.target.value;
      set(promptValue, value, true);
      settings.update({ lastPrompt: value });
    }
    function saveAsCustom() {
      if (!get(promptValue).trim()) return;
      const defaultName = get(promptValue).trim().slice(0, 20) + (get(promptValue).trim().length > 20 ? "..." : "");
      const name = window.prompt("预设名称:", defaultName);
      if (!name) return;
      const id = "custom_" + Date.now();
      const preset = { label: name, value: get(promptValue), isCustom: true, id };
      set(customPresets, [...get(customPresets), preset], true);
      gmSetValue("bfao_customPromptPresets", get(customPresets));
      set(saveFlash, true);
      setTimeout(
        () => {
          set(saveFlash, false);
        },
        600
      );
    }
    function toggleManager() {
      if (get(showManager)) {
        if (get(managerEl) && shouldAnimate()) {
          get(managerEl).style.overflow = "hidden";
          gsap.to(get(managerEl), {
            height: 0,
            opacity: 0,
            duration: 0.22,
            ease: EASINGS.silkOut,
            onComplete: () => {
              set(showManager, false);
            }
          });
        } else {
          set(showManager, false);
        }
      } else {
        set(showManager, true);
      }
    }
    function managerExpand(node) {
      set(managerEl, node, true);
      if (!shouldAnimate()) return;
      node.style.overflow = "hidden";
      gsap.fromTo(node, { height: 0, opacity: 0 }, {
        height: "auto",
        opacity: 1,
        duration: 0.3,
        ease: EASINGS.velvetSpring,
        onComplete: () => {
          node.style.overflow = "";
        }
      });
    }
    function hideBuiltin(label) {
      set(hiddenBuiltins, [...get(hiddenBuiltins), label], true);
      gmSetValue("bfao_hiddenPresets", get(hiddenBuiltins));
    }
    function restoreBuiltin(label) {
      set(hiddenBuiltins, get(hiddenBuiltins).filter((l) => l !== label), true);
      gmSetValue("bfao_hiddenPresets", get(hiddenBuiltins));
    }
    function renameCustom(id) {
      const preset = get(customPresets).find((p) => p.id === id);
      if (!preset) return;
      const name = window.prompt("重命名预设:", preset.label);
      if (!name) return;
      preset.label = name;
      set(customPresets, [...get(customPresets)], true);
      gmSetValue("bfao_customPromptPresets", get(customPresets));
    }
    function deleteCustom(id) {
      set(customPresets, get(customPresets).filter((p) => p.id !== id), true);
      gmSetValue("bfao_customPromptPresets", get(customPresets));
      if (get(defaultPresetId) === id) {
        set(defaultPresetId, "");
        gmSetValue("bfao_defaultPromptPreset", "");
      }
    }
    function setAsDefault(id) {
      if (get(defaultPresetId) === id) {
        set(defaultPresetId, "");
      } else {
        set(defaultPresetId, id, true);
      }
      gmSetValue("bfao_defaultPromptPreset", get(defaultPresetId));
    }
    var div = root$b();
    var div_1 = child(div);
    var select = child(div_1);
    var node_1 = child(select);
    {
      var consequent = ($$anchor2) => {
        var optgroup = root_1$7();
        each(optgroup, 21, () => get(customPresets), index, ($$anchor3, preset) => {
          var option = root_2$a();
          var text2 = child(option);
          var option_value = {};
          template_effect(() => {
            set_text(text2, `${get(preset).label ?? ""}${get(defaultPresetId) === get(preset).id ? " ★" : ""}`);
            if (option_value !== (option_value = get(preset).value)) {
              option.value = (option.__value = get(preset).value) ?? "";
            }
          });
          append($$anchor3, option);
        });
        append($$anchor2, optgroup);
      };
      if_block(node_1, ($$render) => {
        if (get(customPresets).length > 0) $$render(consequent);
      });
    }
    var optgroup_1 = sibling(node_1);
    each(optgroup_1, 21, () => get(visibleBuiltins), index, ($$anchor2, preset) => {
      var option_1 = root_3$9();
      var text_1 = child(option_1);
      var option_1_value = {};
      template_effect(() => {
        set_text(text_1, get(preset).label);
        if (option_1_value !== (option_1_value = get(preset).value)) {
          option_1.value = (option_1.__value = get(preset).value) ?? "";
        }
      });
      append($$anchor2, option_1);
    });
    var select_value;
    init_select(select);
    var button = sibling(select, 2);
    let classes;
    var node_2 = child(button);
    Save(node_2, { size: 12 });
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_1 = sibling(button, 2);
    var node_3 = child(button_1);
    Settings_2(node_3, { size: 12 });
    action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var textarea = sibling(div_1, 2);
    action(textarea, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
    var node_4 = sibling(textarea, 2);
    {
      var consequent_3 = ($$anchor2) => {
        var div_2 = root_4$9();
        var node_5 = sibling(child(div_2), 2);
        {
          var consequent_1 = ($$anchor3) => {
            var fragment = root_5$7();
            var node_6 = sibling(first_child(fragment), 2);
            each(node_6, 17, () => get(customPresets), (preset) => preset.id, ($$anchor4, preset) => {
              var div_3 = root_6$3();
              var button_2 = child(div_3);
              var text_2 = child(button_2);
              var button_3 = sibling(button_2, 2);
              var button_4 = sibling(button_3, 2);
              var node_7 = child(button_4);
              {
                let $0 = user_derived(() => get(defaultPresetId) === get(preset).id ? "starred" : "");
                Star(node_7, {
                  size: 11,
                  get class() {
                    return get($0);
                  }
                });
              }
              var button_5 = sibling(button_4, 2);
              var node_8 = child(button_5);
              Trash_2(node_8, { size: 11 });
              template_effect(() => {
                set_text(text_2, get(preset).label);
                set_attribute(button_4, "title", get(defaultPresetId) === get(preset).id ? "取消默认" : "设为默认");
              });
              delegated("click", button_2, () => {
                set(promptValue, get(preset).value, true);
                settings.update({ lastPrompt: get(preset).value });
              });
              delegated("click", button_3, () => renameCustom(get(preset).id ?? ""));
              delegated("click", button_4, () => setAsDefault(get(preset).id ?? ""));
              delegated("click", button_5, () => deleteCustom(get(preset).id ?? ""));
              append($$anchor4, div_3);
            });
            append($$anchor3, fragment);
          };
          if_block(node_5, ($$render) => {
            if (get(customPresets).length > 0) $$render(consequent_1);
          });
        }
        var node_9 = sibling(node_5, 4);
        each(node_9, 17, () => BUILTIN_PRESETS, index, ($$anchor3, preset) => {
          var div_4 = root_7$2();
          var button_6 = child(div_4);
          let classes_1;
          var text_3 = child(button_6);
          var node_10 = sibling(button_6, 2);
          {
            var consequent_2 = ($$anchor4) => {
              var button_7 = root_8();
              delegated("click", button_7, () => restoreBuiltin(get(preset).label));
              append($$anchor4, button_7);
            };
            var d = user_derived(() => get(hiddenBuiltins).includes(get(preset).label));
            var alternate = ($$anchor4) => {
              var button_8 = root_9$1();
              var node_11 = child(button_8);
              Trash_2(node_11, { size: 11 });
              delegated("click", button_8, () => hideBuiltin(get(preset).label));
              append($$anchor4, button_8);
            };
            if_block(node_10, ($$render) => {
              if (get(d)) $$render(consequent_2);
              else $$render(alternate, -1);
            });
          }
          template_effect(
            ($0) => {
              classes_1 = set_class(button_6, 1, "preset-select svelte-avw5xh", null, classes_1, $0);
              set_text(text_3, get(preset).label);
            },
            [
              () => ({
                "hidden-preset": get(hiddenBuiltins).includes(get(preset).label)
              })
            ]
          );
          delegated("click", button_6, () => {
            set(promptValue, get(preset).value, true);
            settings.update({ lastPrompt: get(preset).value });
          });
          append($$anchor3, div_4);
        });
        action(div_2, ($$node) => managerExpand == null ? void 0 : managerExpand($$node));
        append($$anchor2, div_2);
      };
      if_block(node_4, ($$render) => {
        if (get(showManager)) $$render(consequent_3);
      });
    }
    template_effect(
      ($0) => {
        if (select_value !== (select_value = get(promptValue))) {
          select.value = (select.__value = get(promptValue)) ?? "", select_option(select, get(promptValue));
        }
        classes = set_class(button, 1, "prompt-action-btn svelte-avw5xh", null, classes, { "save-flash": get(saveFlash) });
        button.disabled = $0;
        set_value(textarea, get(promptValue));
      },
      [() => !get(promptValue).trim()]
    );
    delegated("change", select, handlePresetChange);
    delegated("click", button, saveAsCustom);
    delegated("click", button_1, toggleManager);
    delegated("input", textarea, handleInput);
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["change", "click", "input"]);
  const DECODE_CHARS = "█▓▒░!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFabcdefΣΩπλΔ";
  function textDecode(el, opts = {}) {
    if (!shouldAnimate()) return { destroy() {
    } };
    const finalText = el.textContent ?? "";
    if (!finalText) return { destroy() {
    } };
    const charDelay = opts.charDelay ?? 15;
    const totalChars = finalText.length;
    let resolved = 0;
    let rafId = null;
    let destroyed = false;
    el.textContent = scramble(finalText, 0);
    let lastTime = performance.now();
    function step(now2) {
      if (destroyed) return;
      if (now2 - lastTime >= charDelay) {
        resolved++;
        lastTime = now2;
        if (resolved >= totalChars) {
          el.textContent = finalText;
          return;
        }
        el.textContent = scramble(finalText, resolved);
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
    return {
      destroy() {
        destroyed = true;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.textContent = finalText;
      }
    };
  }
  function scramble(text2, resolved) {
    let result = "";
    for (let i = 0; i < text2.length; i++) {
      if (i < resolved || text2[i] === " ") {
        result += text2[i];
      } else {
        result += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      }
    }
    return result;
  }
  function textDecodeLoop(el, opts = {}) {
    if (!shouldAnimate()) return { destroy() {
    } };
    const messages = opts.messages ?? [el.textContent ?? ""];
    const charDelay = opts.charDelay ?? 20;
    const pauseMs = opts.pauseMs ?? 2500;
    let destroyed = false;
    let rafId = null;
    let timeoutId = null;
    let msgIdx = 0;
    function runOnce() {
      if (destroyed) return;
      const text2 = messages[msgIdx % messages.length];
      msgIdx++;
      let resolved = 0;
      let lastTime = performance.now();
      el.textContent = scramble(text2, 0);
      function step(now2) {
        if (destroyed) return;
        if (now2 - lastTime >= charDelay) {
          resolved++;
          lastTime = now2;
          if (resolved >= text2.length) {
            el.textContent = text2;
            timeoutId = setTimeout(runOnce, pauseMs);
            return;
          }
          el.textContent = scramble(text2, resolved);
        }
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }
    runOnce();
    return {
      destroy() {
        destroyed = true;
        if (rafId != null) cancelAnimationFrame(rafId);
        if (timeoutId != null) clearTimeout(timeoutId);
      }
    };
  }
  function numberRoll(el, targetValue, opts = {}) {
    if (!shouldAnimate()) {
      el.textContent = formatNumber(targetValue, opts.suffix, opts.useLocale);
      return { destroy() {
      } };
    }
    const duration = opts.duration ?? 800;
    const startTime = performance.now();
    let rafId = null;
    let destroyed = false;
    function step(now2) {
      if (destroyed) return;
      const elapsed = now2 - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetValue * eased);
      el.textContent = formatNumber(current, opts.suffix, opts.useLocale);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
    return {
      destroy() {
        destroyed = true;
        if (rafId != null) cancelAnimationFrame(rafId);
        el.textContent = formatNumber(targetValue, opts.suffix, opts.useLocale);
      }
    };
  }
  function formatNumber(value, suffix, useLocale) {
    const formatted = useLocale ? value.toLocaleString() : String(value);
    return suffix ? formatted + suffix : formatted;
  }
  var root_1$6 = from_html(`<div><span class="log-time svelte-rc9h4j"> </span> <span class="log-msg svelte-rc9h4j"> </span></div>`);
  var root$a = from_html(`<div class="log-area svelte-rc9h4j"><!> <div><span class="cat-emoji svelte-rc9h4j">🐱</span> <span class="cat-text svelte-rc9h4j">喵~ 准备好了吗？</span></div></div>`);
  function LogArea($$anchor, $$props) {
    push($$props, true);
    const $logs = () => store_get(logs, "$logs", $$stores);
    const $isRunning = () => store_get(isRunning, "$isRunning", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let logEl = state(void 0);
    let decodedIds = new Set();
    user_effect(() => {
      if ($logs().length && get(logEl)) {
        if (decodedIds.size > $logs().length * 2) {
          const currentIds = new Set($logs().map((l) => l.id));
          decodedIds = new Set([...decodedIds].filter((id) => currentIds.has(id)));
        }
        tick().then(() => {
          get(logEl).scrollTop = get(logEl).scrollHeight;
        });
      }
    });
    function decodeEntry(node) {
      const msgEl = node.querySelector(".log-msg");
      if (!msgEl) return;
      const id = Number(node.dataset.logId);
      if (decodedIds.has(id)) return;
      decodedIds.add(id);
      const { destroy } = textDecode(msgEl, { charDelay: 20 });
      return { destroy };
    }
    let catTextEl = state(void 0);
    let catCleanup = null;
    onMount(() => {
      if ($logs().length === 0) {
        logs.add("AI 收藏夹整理器 v2.0 就绪", "success");
      }
      if (get(catTextEl)) {
        catCleanup = textDecodeLoop(get(catTextEl), {
          charDelay: 18,
          pauseMs: 3e3,
          messages: ["喵~ 准备好了吗？", "点击「开始整理」吧~", "收藏夹需要整理喵！", "我来帮你分类~"]
        });
      }
    });
    onDestroy(() => {
      catCleanup == null ? void 0 : catCleanup.destroy();
    });
    var div = root$a();
    var node_1 = child(div);
    each(node_1, 1, $logs, (entry) => entry.id, ($$anchor2, entry) => {
      var div_1 = root_1$6();
      var span = child(div_1);
      var text2 = child(span);
      var span_1 = sibling(span, 2);
      var text_1 = child(span_1);
      action(div_1, ($$node) => decodeEntry == null ? void 0 : decodeEntry($$node));
      template_effect(() => {
        set_class(div_1, 1, `log-entry log-${get(entry).level ?? ""}`, "svelte-rc9h4j");
        set_attribute(div_1, "data-log-id", get(entry).id);
        set_text(text2, get(entry).time);
        set_text(text_1, get(entry).message);
      });
      append($$anchor2, div_1);
    });
    var div_2 = sibling(node_1, 2);
    let classes;
    var span_2 = sibling(child(div_2), 2);
    bind_this(span_2, ($$value) => set(catTextEl, $$value), () => get(catTextEl));
    bind_this(div, ($$value) => set(logEl, $$value), () => get(logEl));
    template_effect(() => classes = set_class(div_2, 1, "log-cat svelte-rc9h4j", null, classes, { away: $isRunning() }));
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  function is_date(obj) {
    return Object.prototype.toString.call(obj) === "[object Date]";
  }
  function linear(t) {
    return t;
  }
  function cubicOut(t) {
    const f = t - 1;
    return f * f * f + 1;
  }
  function get_interpolator(a, b) {
    if (a === b || a !== a) return () => a;
    const type = typeof a;
    if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
      throw new Error("Cannot interpolate values of different type");
    }
    if (Array.isArray(a)) {
      const arr = (
b.map((bi, i) => {
          return get_interpolator(
a[i],
            bi
          );
        })
      );
      return (t) => arr.map((fn) => fn(t));
    }
    if (type === "object") {
      if (!a || !b) {
        throw new Error("Object cannot be null");
      }
      if (is_date(a) && is_date(b)) {
        const an = a.getTime();
        const bn = b.getTime();
        const delta = bn - an;
        return (t) => new Date(an + t * delta);
      }
      const keys = Object.keys(b);
      const interpolators = {};
      keys.forEach((key) => {
        interpolators[key] = get_interpolator(a[key], b[key]);
      });
      return (t) => {
        const result = {};
        keys.forEach((key) => {
          result[key] = interpolators[key](t);
        });
        return result;
      };
    }
    if (type === "number") {
      const delta = (
b -
a
      );
      return (t) => a + t * delta;
    }
    return () => b;
  }
  function tweened(value, defaults = {}) {
    const store = writable(value);
    let task;
    let target_value = value;
    function set2(new_value, opts) {
      target_value = new_value;
      if (value == null) {
        store.set(value = new_value);
        return Promise.resolve();
      }
      let previous_task = task;
      let started = false;
      let {
        delay = 0,
        duration = 400,
        easing = linear,
        interpolate = get_interpolator
      } = { ...defaults, ...opts };
      if (duration === 0) {
        if (previous_task) {
          previous_task.abort();
          previous_task = null;
        }
        store.set(value = target_value);
        return Promise.resolve();
      }
      const start = raf.now() + delay;
      let fn;
      task = loop((now2) => {
        if (now2 < start) return true;
        if (!started) {
          fn = interpolate(
value,
            new_value
          );
          if (typeof duration === "function")
            duration = duration(
value,
              new_value
            );
          started = true;
        }
        if (previous_task) {
          previous_task.abort();
          previous_task = null;
        }
        const elapsed = now2 - start;
        if (elapsed >
duration) {
          store.set(value = new_value);
          return false;
        }
        store.set(value = fn(easing(elapsed / duration)));
        return true;
      });
      return task.promise;
    }
    return {
      set: set2,
      update: (fn, opts) => set2(fn(
target_value,
value
      ), opts),
      subscribe: store.subscribe
    };
  }
  const PHASE_WEIGHTS = {
    fetch: { offset: 0, weight: 30 },
    ai: { offset: 30, weight: 50 },
    move: { offset: 80, weight: 20 }
  };
  let originalTitle = "";
  function updateProgress(phase, current, total) {
    if (!originalTitle) originalTitle = document.title;
    progressPhase.set(phase);
    progressCurrent.set(current);
    progressTotal.set(total);
    const pw = PHASE_WEIGHTS[phase];
    const phasePercent = total > 0 ? current / total : 0;
    const continuousPercent = pw ? Math.round(pw.offset + phasePercent * pw.weight) : 0;
    document.title = `[${phase} ${continuousPercent}%] ${originalTitle}`;
  }
  function getContinuousPercent(phase, current, total) {
    const pw = PHASE_WEIGHTS[phase];
    if (!pw) return 0;
    const phasePercent = total > 0 ? current / total : 0;
    return Math.min(100, Math.round(pw.offset + phasePercent * pw.weight));
  }
  function resetProgress() {
    progressPhase.set("");
    progressCurrent.set(0);
    progressTotal.set(0);
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = "";
    }
  }
  function spawnTrailParticles(trackEl, progressPercent) {
    if (!shouldAnimate() || progressPercent <= 0) return;
    const rect = trackEl.getBoundingClientRect();
    const leadX = progressPercent / 100 * rect.width;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      dot.className = "progress-particle";
      dot.style.cssText = `
      position: absolute;
      left: ${leadX}px;
      top: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 6px ${color};
      pointer-events: none;
      will-change: transform, opacity;
    `;
      trackEl.appendChild(dot);
      gsap.fromTo(
        dot,
        { x: 0, y: 0, scale: 1.2, opacity: 1 },
        {
          x: (Math.random() - 0.5) * 30,
          y: -(14 + Math.random() * 22),
          scale: 0,
          opacity: 0,
          duration: 0.6 + Math.random() * 0.4,
          ease: EASINGS.confettiArc,
          onComplete: () => dot.remove()
        }
      );
    }
  }
  function phaseTransition(labelEl, barEl, newText) {
    if (!shouldAnimateFunctional()) {
      labelEl.textContent = newText;
      return;
    }
    const tl = gsap.timeline();
    tl.to(barEl, {
      filter: "brightness(1.5)",
      duration: 0.15,
      ease: "power2.in"
    });
    tl.to(barEl, {
      filter: "brightness(1)",
      duration: 0.3,
      ease: "power2.out"
    });
    tl.to(
      labelEl,
      {
        y: -12,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          labelEl.textContent = newText;
        }
      },
      0
    );
    tl.fromTo(
      labelEl,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.25, ease: EASINGS.velvetSpring }
    );
    return tl;
  }
  function victoryCelebration(containerEl) {
    if (!shouldAnimate()) return void 0;
    gsap.to(containerEl, {
      keyframes: [
        { x: -3, duration: 0.05 },
        { x: 3, duration: 0.05 },
        { x: -2, duration: 0.05 },
        { x: 1, duration: 0.05 },
        { x: 0, duration: 0.05 }
      ],
      ease: "none"
    });
    const rect = containerEl.getBoundingClientRect();
    const PARTICLE_COUNT = 60;
    const GRAVITY = 700;
    const DRAG = 0.98;
    const MAX_LIFE = 2.5;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const piece = document.createElement("span");
      const size = 4 + Math.random() * 4;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const isCircle = Math.random() > 0.5;
      piece.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${isCircle ? size : size * 0.5}px;
      background: ${color};
      border-radius: ${isCircle ? "50%" : "1px"};
      pointer-events: none;
      z-index: ${Z_INDEX.PARTICLE};
      will-change: transform, opacity;
    `;
      document.body.appendChild(piece);
      const angle = -90 + (Math.random() - 0.5) * 120;
      const speed = 200 + Math.random() * 400;
      const rad = angle * Math.PI / 180;
      const maxLife = 1.2 + Math.random() * (MAX_LIFE - 1.2);
      particles.push({
        el: piece,
        x: rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4,
        y: rect.top + rect.height * 0.3,
        vx: Math.cos(rad) * speed,
        vy: Math.sin(rad) * speed,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 600,
life: 0,
        maxLife
      });
    }
    function tickPhysics() {
      const dr = gsap.ticker.deltaRatio();
      const dt = dr / 60;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        p.vy += GRAVITY * dt;
        const dragFactor = Math.pow(DRAG, dr);
        p.vx *= dragFactor;
        p.vy *= dragFactor;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotSpeed * dt;
        const lifeRatio = p.life / p.maxLife;
        const opacity = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
        p.el.style.opacity = String(opacity);
        if (p.life >= p.maxLife) {
          p.el.remove();
          particles.splice(i, 1);
        }
      }
      if (particles.length === 0) {
        gsap.ticker.remove(tickPhysics);
      }
    }
    gsap.ticker.add(tickPhysics);
    return () => {
      gsap.ticker.remove(tickPhysics);
      for (const p of particles) p.el.remove();
      particles.length = 0;
    };
  }
  function numberBounce(el) {
    if (!shouldAnimateFunctional()) return;
    gsap.fromTo(
      el,
      { scale: 1.15 },
      { scale: 1, duration: 0.3, ease: EASINGS.prismBounce }
    );
  }
  var root_2$9 = from_html(`<div class="token-stats svelte-um4ua8">Token: <span class="svelte-um4ua8"> </span> </div>`);
  var root_1$5 = from_html(`<div class="progress-container svelte-um4ua8"><div class="progress-header svelte-um4ua8"><span class="phase-label svelte-um4ua8"> </span> <span class="progress-text svelte-um4ua8"> </span></div> <div class="progress-track svelte-um4ua8"><div></div> <span class="progress-cat svelte-um4ua8">🐱</span></div> <!></div>`);
  function ProgressBar($$anchor, $$props) {
    push($$props, true);
    const $progressPhase = () => store_get(progressPhase, "$progressPhase", $$stores);
    const $progressCurrent = () => store_get(progressCurrent, "$progressCurrent", $$stores);
    const $progressTotal = () => store_get(progressTotal, "$progressTotal", $$stores);
    const $smoothProgress = () => store_get(smoothProgress, "$smoothProgress", $$stores);
    const $tokenUsage = () => store_get(tokenUsage, "$tokenUsage", $$stores);
    const $isRunning = () => store_get(isRunning, "$isRunning", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let continuousPercent = user_derived(() => getContinuousPercent($progressPhase(), $progressCurrent(), $progressTotal()));
    const smoothProgress = tweened(0, { duration: 800, easing: cubicOut });
    user_effect(() => {
      smoothProgress.set(get(continuousPercent));
    });
    const PHASE_LABELS = { fetch: "抓取视频", ai: "AI 分类", move: "移动视频" };
    let trackEl = state(void 0);
    let barEl = state(void 0);
    let labelEl = state(void 0);
    let percentEl = state(void 0);
    let containerEl = state(void 0);
    let tokenEl = state(void 0);
    let lastParticlePercent = 0;
    user_effect(() => {
      if (get(trackEl) && get(continuousPercent) > lastParticlePercent + 4) {
        spawnTrailParticles(get(trackEl), $smoothProgress());
        lastParticlePercent = get(continuousPercent);
      }
    });
    let prevPhase = "";
    user_effect(() => {
      if (get(labelEl) && get(barEl) && $progressPhase() && $progressPhase() !== prevPhase) {
        const newLabel = PHASE_LABELS[$progressPhase()] ?? "准备中";
        if (prevPhase) {
          phaseTransition(get(labelEl), get(barEl), newLabel);
        }
        prevPhase = $progressPhase();
      }
    });
    let celebrated = false;
    let cleanupCelebration;
    user_effect(() => {
      if (get(containerEl) && get(continuousPercent) >= 100 && !celebrated) {
        celebrated = true;
        cleanupCelebration = victoryCelebration(get(containerEl));
      }
    });
    let prevPercent = 0;
    user_effect(() => {
      if (get(percentEl) && get(continuousPercent) !== prevPercent) {
        if (get(continuousPercent) > prevPercent) {
          numberBounce(get(percentEl));
        }
        prevPercent = get(continuousPercent);
      }
    });
    let prevTokens = 0;
    let cleanupTokenRoll;
    user_effect(() => {
      const tokens = $tokenUsage().totalTokens;
      if (get(tokenEl) && tokens > 0 && tokens !== prevTokens) {
        cleanupTokenRoll == null ? void 0 : cleanupTokenRoll();
        cleanupTokenRoll = numberRoll(get(tokenEl), tokens, { useLocale: true }).destroy;
        prevTokens = tokens;
      }
    });
    user_effect(() => {
      if (!$isRunning()) {
        lastParticlePercent = 0;
        celebrated = false;
        prevPhase = "";
        prevPercent = 0;
        prevTokens = 0;
        cleanupCelebration == null ? void 0 : cleanupCelebration();
        cleanupCelebration = void 0;
        cleanupTokenRoll == null ? void 0 : cleanupTokenRoll();
        cleanupTokenRoll = void 0;
      }
    });
    onDestroy(() => {
      cleanupCelebration == null ? void 0 : cleanupCelebration();
      cleanupTokenRoll == null ? void 0 : cleanupTokenRoll();
    });
    var fragment = comment();
    var node = first_child(fragment);
    {
      var consequent_1 = ($$anchor2) => {
        var div = root_1$5();
        var div_1 = child(div);
        var span = child(div_1);
        var text2 = child(span);
        bind_this(span, ($$value) => set(labelEl, $$value), () => get(labelEl));
        var span_1 = sibling(span, 2);
        var text_1 = child(span_1);
        bind_this(span_1, ($$value) => set(percentEl, $$value), () => get(percentEl));
        var div_2 = sibling(div_1, 2);
        var div_3 = child(div_2);
        let classes;
        let styles;
        bind_this(div_3, ($$value) => set(barEl, $$value), () => get(barEl));
        var span_2 = sibling(div_3, 2);
        let styles_1;
        bind_this(div_2, ($$value) => set(trackEl, $$value), () => get(trackEl));
        var node_1 = sibling(div_2, 2);
        {
          var consequent = ($$anchor3) => {
            var div_4 = root_2$9();
            var span_3 = sibling(child(div_4));
            var text_2 = child(span_3);
            bind_this(span_3, ($$value) => set(tokenEl, $$value), () => get(tokenEl));
            var text_3 = sibling(span_3);
            template_effect(
              ($0) => {
                set_text(text_2, $0);
                set_text(text_3, ` (${$tokenUsage().callCount ?? ""} 次调用)`);
              },
              [() => $tokenUsage().totalTokens.toLocaleString()]
            );
            append($$anchor3, div_4);
          };
          if_block(node_1, ($$render) => {
            if ($tokenUsage().totalTokens > 0) $$render(consequent);
          });
        }
        bind_this(div, ($$value) => set(containerEl, $$value), () => get(containerEl));
        template_effect(() => {
          set_text(text2, PHASE_LABELS[$progressPhase()] ?? "准备中");
          set_text(text_1, `${get(continuousPercent) ?? ""}%`);
          classes = set_class(div_3, 1, "progress-bar svelte-um4ua8", null, classes, { complete: get(continuousPercent) >= 100 });
          styles = set_style(div_3, "", styles, { width: `${$smoothProgress() ?? ""}%` });
          styles_1 = set_style(span_2, "", styles_1, { left: `${$smoothProgress() ?? ""}%` });
        });
        append($$anchor2, div);
      };
      if_block(node, ($$render) => {
        if ($isRunning()) $$render(consequent_1);
      });
    }
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  var root_1$4 = from_html(`<!><span class="svelte-15t8ntb">停止整理</span><kbd class="kbd svelte-15t8ntb">Esc</kbd>`, 1);
  var root_2$8 = from_html(`<!><span class="svelte-15t8ntb">开始整理</span><kbd class="kbd svelte-15t8ntb">Ctrl+↵</kbd>`, 1);
  var root$9 = from_html(`<div class="actions svelte-15t8ntb"><button><!></button> <div class="tool-row svelte-15t8ntb"><button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">失效归档</span></button> <button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">查重</span></button> <button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">撤销</span></button></div> <div class="tool-row svelte-15t8ntb"><button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">备份</span></button> <button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">统计</span></button> <button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">健康</span></button></div> <div class="tool-row svelte-15t8ntb"><button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">日志</span></button> <button class="btn-tool svelte-15t8ntb" title="Ctrl+点击: 调试预览"><!><span class="svelte-15t8ntb">帮助</span></button> <button class="btn-tool svelte-15t8ntb"><!><span class="svelte-15t8ntb">历史</span></button></div></div>`);
  function ActionButtons($$anchor, $$props) {
    push($$props, true);
    const $isRunning = () => store_get(isRunning, "$isRunning", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    const magneticSmall = { radius: 60, strength: 0.3 };
    const magneticPrimary = { radius: 80, strength: 0.15 };
    function handleStartStop() {
      var _a2, _b2;
      if ($isRunning()) {
        cancelRequested.set(true);
        (_a2 = $$props.onstop) == null ? void 0 : _a2.call($$props);
      } else {
        (_b2 = $$props.onstart) == null ? void 0 : _b2.call($$props);
      }
    }
    var div = root$9();
    var button = child(div);
    let classes;
    var node = child(button);
    {
      var consequent = ($$anchor2) => {
        var fragment = root_1$4();
        var node_1 = first_child(fragment);
        Square(node_1, { size: 16 });
        append($$anchor2, fragment);
      };
      var alternate = ($$anchor2) => {
        var fragment_1 = root_2$8();
        var node_2 = first_child(fragment_1);
        Play(node_2, { size: 16 });
        append($$anchor2, fragment_1);
      };
      if_block(node, ($$render) => {
        if ($isRunning()) $$render(consequent);
        else $$render(alternate, -1);
      });
    }
    action(button, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticPrimary);
    action(button, ($$node, $$action_arg) => ripple == null ? void 0 : ripple($$node, $$action_arg), () => ({ color: "rgba(255,255,255,0.3)" }));
    var div_1 = sibling(button, 2);
    var button_1 = child(div_1);
    var node_3 = child(button_1);
    Archive(node_3, { size: 14 });
    action(button_1, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_1, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_1, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_2 = sibling(button_1, 2);
    var node_4 = child(button_2);
    Copy(node_4, { size: 14 });
    action(button_2, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_2, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_2, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_2, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_3 = sibling(button_2, 2);
    var node_5 = child(button_3);
    Undo_2(node_5, { size: 14 });
    action(button_3, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_3, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_3, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_3, ($$node) => ripple == null ? void 0 : ripple($$node));
    var div_2 = sibling(div_1, 2);
    var button_4 = child(div_2);
    var node_6 = child(button_4);
    Download(node_6, { size: 14 });
    action(button_4, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_4, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_4, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_4, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_5 = sibling(button_4, 2);
    var node_7 = child(button_5);
    Chart_column(node_7, { size: 14 });
    action(button_5, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_5, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_5, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_5, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_6 = sibling(button_5, 2);
    var node_8 = child(button_6);
    Heart(node_8, { size: 14 });
    action(button_6, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_6, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_6, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_6, ($$node) => ripple == null ? void 0 : ripple($$node));
    var div_3 = sibling(div_2, 2);
    var button_7 = child(div_3);
    var node_9 = child(button_7);
    File_text(node_9, { size: 14 });
    action(button_7, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_7, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_7, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_7, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_8 = sibling(button_7, 2);
    var node_10 = child(button_8);
    Circle_help(node_10, { size: 14 });
    action(button_8, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_8, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_8, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_8, ($$node) => ripple == null ? void 0 : ripple($$node));
    var button_9 = sibling(button_8, 2);
    var node_11 = child(button_9);
    History(node_11, { size: 14 });
    action(button_9, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    action(button_9, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    action(button_9, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => magneticSmall);
    action(button_9, ($$node) => ripple == null ? void 0 : ripple($$node));
    template_effect(() => {
      classes = set_class(button, 1, "btn-primary svelte-15t8ntb", null, classes, { running: $isRunning() });
      button_1.disabled = $isRunning();
      button_2.disabled = $isRunning();
      button_3.disabled = $isRunning();
      button_4.disabled = $isRunning();
      button_6.disabled = $isRunning();
    });
    delegated("click", button, handleStartStop);
    delegated("click", button_1, () => {
      var _a2;
      return (_a2 = $$props.oncleandead) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_2, () => {
      var _a2;
      return (_a2 = $$props.onfinddups) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_3, () => {
      var _a2;
      return (_a2 = $$props.onundo) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_4, () => {
      var _a2;
      return (_a2 = $$props.onbackup) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_5, () => {
      var _a2;
      return (_a2 = $$props.onstats) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_6, () => {
      var _a2;
      return (_a2 = $$props.onhealth) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_7, () => {
      var _a2;
      return (_a2 = $$props.onexportlogs) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_8, (e) => {
      var _a2, _b2;
      if (e.ctrlKey || e.metaKey) (_a2 = $$props.ondebugpreview) == null ? void 0 : _a2.call($$props);
      else (_b2 = $$props.onhelp) == null ? void 0 : _b2.call($$props);
    });
    delegated("click", button_9, () => {
      var _a2;
      return (_a2 = $$props.onhistory) == null ? void 0 : _a2.call($$props);
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  delegate(["click"]);
  var root_6$2 = from_html(`<button class="modal-btn cancel svelte-1bxxaoh"> </button> <button class="modal-btn confirm svelte-1bxxaoh"> </button>`, 1);
  var root_4$8 = from_html(`<div class="modal-footer svelte-1bxxaoh"><!></div>`);
  var root$8 = from_html(`<div class="backdrop svelte-1bxxaoh"><div class="modal svelte-1bxxaoh" role="dialog" aria-modal="true"><div class="modal-header svelte-1bxxaoh"><h3 class="svelte-1bxxaoh"><!> </h3> <button class="close-btn svelte-1bxxaoh" aria-label="关闭"><!></button></div> <!> <div><div></div> <!></div> <!></div></div>`);
  function Modal($$anchor, $$props) {
    push($$props, true);
    let title = prop($$props, "title", 3, ""), showFooter = prop($$props, "showFooter", 3, true), confirmText = prop($$props, "confirmText", 3, "确认"), cancelText = prop($$props, "cancelText", 3, "取消"), confirmDisabled = prop($$props, "confirmDisabled", 3, false), width = prop($$props, "width", 3, "min(600px, 90vw)");
    let backdropEl = state(void 0);
    let modalEl = state(void 0);
    let bodyEl = state(void 0);
    let ctx;
    let abortCtrl;
    let scrolledTop = state(false);
    let scrolledBottom = state(false);
    let scrollProgress = state(0);
    let showScrollBar = state(false);
    function updateScrollFade() {
      if (!get(bodyEl)) return;
      const { scrollTop, scrollHeight, clientHeight } = get(bodyEl);
      const isScrollable = scrollHeight > clientHeight + 2;
      set(scrolledTop, isScrollable && scrollTop > 4, true);
      set(scrolledBottom, isScrollable && scrollTop < scrollHeight - clientHeight - 4, true);
      const maxScroll = scrollHeight - clientHeight;
      set(showScrollBar, maxScroll > 10);
      set(scrollProgress, maxScroll > 0 ? scrollTop / maxScroll : 0, true);
    }
    onMount(() => {
      ctx = gsap.context(() => {
        if (shouldAnimateFunctional()) {
          gsap.fromTo(get(backdropEl), { opacity: 0 }, { opacity: 1, duration: 0.2 });
          gsap.fromTo(get(modalEl), { scale: 0.88, y: 24, opacity: 0, filter: "blur(8px)" }, {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.35,
            ease: EASINGS.velvetSpring,
            clearProps: "transform,filter"
          });
        }
      });
      requestAnimationFrame(() => updateScrollFade());
      abortCtrl = new AbortController();
      document.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Escape") handleClose();
        },
        { signal: abortCtrl.signal }
      );
    });
    onDestroy(() => {
      ctx == null ? void 0 : ctx.revert();
      abortCtrl == null ? void 0 : abortCtrl.abort();
    });
    function handleClose() {
      var _a2;
      if (shouldAnimateFunctional() && get(modalEl) && get(backdropEl)) {
        gsap.to(get(modalEl), {
          scale: 0.92,
          y: 16,
          opacity: 0,
          filter: "blur(4px)",
          duration: 0.2,
          ease: "power2.in"
        });
        gsap.to(get(backdropEl), {
          opacity: 0,
          duration: 0.2,
          delay: 0.03,
          onComplete: () => {
            var _a3;
            return (_a3 = $$props.onclose) == null ? void 0 : _a3.call($$props);
          }
        });
      } else {
        (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
      }
    }
    var div = root$8();
    let styles;
    var div_1 = child(div);
    let styles_1;
    var div_2 = child(div_1);
    var h3 = child(div_2);
    var node = child(h3);
    {
      var consequent = ($$anchor2) => {
        var fragment = comment();
        var node_1 = first_child(fragment);
        snippet(node_1, () => $$props.icon);
        append($$anchor2, fragment);
      };
      if_block(node, ($$render) => {
        if ($$props.icon) $$render(consequent);
      });
    }
    var text2 = sibling(node);
    var button = sibling(h3, 2);
    var node_2 = child(button);
    X(node_2, { size: 16 });
    var node_3 = sibling(div_2, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var fragment_1 = comment();
        var node_4 = first_child(fragment_1);
        snippet(node_4, () => $$props.toolbar);
        append($$anchor2, fragment_1);
      };
      if_block(node_3, ($$render) => {
        if ($$props.toolbar) $$render(consequent_1);
      });
    }
    var div_3 = sibling(node_3, 2);
    let classes;
    var div_4 = child(div_3);
    let classes_1;
    let styles_2;
    var node_5 = sibling(div_4, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var fragment_2 = comment();
        var node_6 = first_child(fragment_2);
        snippet(node_6, () => $$props.children);
        append($$anchor2, fragment_2);
      };
      if_block(node_5, ($$render) => {
        if ($$props.children) $$render(consequent_2);
      });
    }
    bind_this(div_3, ($$value) => set(bodyEl, $$value), () => get(bodyEl));
    action(div_3, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    var node_7 = sibling(div_3, 2);
    {
      var consequent_4 = ($$anchor2) => {
        var div_5 = root_4$8();
        var node_8 = child(div_5);
        {
          var consequent_3 = ($$anchor3) => {
            var fragment_3 = comment();
            var node_9 = first_child(fragment_3);
            snippet(node_9, () => $$props.footer);
            append($$anchor3, fragment_3);
          };
          var alternate = ($$anchor3) => {
            var fragment_4 = root_6$2();
            var button_1 = first_child(fragment_4);
            var text_1 = child(button_1);
            action(button_1, ($$node) => ripple == null ? void 0 : ripple($$node));
            action(button_1, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 60, strength: 0.4 }));
            var button_2 = sibling(button_1, 2);
            var text_2 = child(button_2);
            action(button_2, ($$node, $$action_arg) => ripple == null ? void 0 : ripple($$node, $$action_arg), () => ({ color: "rgba(255,255,255,0.3)" }));
            action(button_2, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 60, strength: 0.4 }));
            template_effect(() => {
              set_text(text_1, cancelText());
              button_2.disabled = confirmDisabled();
              set_text(text_2, confirmText());
            });
            delegated("click", button_1, handleClose);
            delegated("click", button_2, () => {
              var _a2;
              return (_a2 = $$props.onconfirm) == null ? void 0 : _a2.call($$props);
            });
            append($$anchor3, fragment_4);
          };
          if_block(node_8, ($$render) => {
            if ($$props.footer) $$render(consequent_3);
            else $$render(alternate, -1);
          });
        }
        append($$anchor2, div_5);
      };
      if_block(node_7, ($$render) => {
        if (showFooter()) $$render(consequent_4);
      });
    }
    bind_this(div_1, ($$value) => set(modalEl, $$value), () => get(modalEl));
    bind_this(div, ($$value) => set(backdropEl, $$value), () => get(backdropEl));
    template_effect(() => {
      styles = set_style(div, "", styles, { "z-index": Z_INDEX.MODAL });
      styles_1 = set_style(div_1, "", styles_1, { width: width() });
      set_text(text2, ` ${title() ?? ""}`);
      classes = set_class(div_3, 1, "modal-body svelte-1bxxaoh", null, classes, {
        "fade-top": get(scrolledTop),
        "fade-bottom": get(scrolledBottom)
      });
      classes_1 = set_class(div_4, 1, "modal-scroll-indicator svelte-1bxxaoh", null, classes_1, { visible: get(showScrollBar) });
      styles_2 = set_style(div_4, "", styles_2, { width: `${get(scrollProgress) * 100}%` });
    });
    delegated("mousedown", div, (e) => {
      if (e.target === e.currentTarget) handleClose();
    });
    delegated("click", button, handleClose);
    event("scroll", div_3, updateScrollFade);
    append($$anchor, div);
    pop();
  }
  delegate(["mousedown", "click"]);
  var root_4$7 = from_html(`<div class="video-item svelte-jk545l"> </div>`);
  var root_5$6 = from_html(`<div class="bfao-modal-more"> </div>`);
  var root_3$8 = from_html(`<div class="folder-group svelte-jk545l"><div class="folder-header svelte-jk545l"> </div> <!> <!></div>`);
  var root_2$7 = from_html(`<div class="bfao-modal-body"><div class="bfao-modal-summary">发现 <strong> </strong> 个失效视频，分布在 <strong> </strong> 个收藏夹中</div> <div class="folder-list svelte-jk545l"></div> <div class="bfao-action-bar"><button class="bfao-btn bfao-btn-primary"><!> </button> <button class="bfao-btn bfao-btn-danger"><!> </button> <span class="bfao-modal-hint">移动到专用收藏夹便于日后查看；删除不可撤销</span></div></div>`);
  function DeadVideosResult($$anchor, $$props) {
    push($$props, true);
    let processing = prop($$props, "processing", 3, false);
    let byFolder = user_derived(() => $$props.deadVideos.reduce(
      (acc, v) => {
        if (!acc[v.folderTitle]) acc[v.folderTitle] = [];
        acc[v.folderTitle].push(v);
        return acc;
      },
      {}
    ));
    {
      const icon = ($$anchor2) => {
        Archive($$anchor2, { size: 18 });
      };
      Modal($$anchor, {
        title: "失效视频扫描结果",
        showFooter: false,
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_2$7();
          var div_1 = child(div);
          var strong = sibling(child(div_1));
          var text2 = child(strong);
          var strong_1 = sibling(strong, 2);
          var text_1 = child(strong_1);
          var div_2 = sibling(div_1, 2);
          each(div_2, 21, () => Object.entries(get(byFolder)), index, ($$anchor3, $$item) => {
            var $$array = user_derived(() => to_array(get($$item), 2));
            let folderName = () => get($$array)[0];
            let vids = () => get($$array)[1];
            var div_3 = root_3$8();
            var div_4 = child(div_3);
            var text_2 = child(div_4);
            var node = sibling(div_4, 2);
            each(node, 17, () => vids().slice(0, 10), index, ($$anchor4, v) => {
              var div_5 = root_4$7();
              var text_3 = child(div_5);
              template_effect(() => set_text(text_3, `• ${get(v).title ?? ""}`));
              append($$anchor4, div_5);
            });
            var node_1 = sibling(node, 2);
            {
              var consequent = ($$anchor4) => {
                var div_6 = root_5$6();
                var text_4 = child(div_6);
                template_effect(() => set_text(text_4, `...及其他 ${vids().length - 10} 个`));
                append($$anchor4, div_6);
              };
              if_block(node_1, ($$render) => {
                if (vids().length > 10) $$render(consequent);
              });
            }
            template_effect(() => set_text(text_2, `📁 ${folderName() ?? ""} (${vids().length ?? ""}个)`));
            append($$anchor3, div_3);
          });
          action(div_2, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ stagger: 0.04, delay: 0.2 }));
          var div_7 = sibling(div_2, 2);
          var button = child(div_7);
          var node_2 = child(button);
          Archive(node_2, { size: 14 });
          var text_5 = sibling(node_2);
          action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
          action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
          var button_1 = sibling(button, 2);
          var node_3 = child(button_1);
          Trash_2(node_3, { size: 14 });
          var text_6 = sibling(node_3);
          action(button_1, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
          action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
          action(div, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ delay: 0.1, stagger: 0.06 }));
          template_effect(
            ($0) => {
              set_text(text2, $$props.deadVideos.length);
              set_text(text_1, $0);
              button.disabled = processing();
              set_text(text_5, ` ${processing() ? "处理中..." : "移动到「失效视频归档」"}`);
              button_1.disabled = processing();
              set_text(text_6, ` ${processing() ? "处理中..." : "直接删除"}`);
            },
            [() => Object.keys(get(byFolder)).length]
          );
          delegated("click", button, () => {
            var _a2;
            return (_a2 = $$props.onarchive) == null ? void 0 : _a2.call($$props);
          });
          delegated("click", button_1, () => {
            var _a2;
            return (_a2 = $$props.ondelete) == null ? void 0 : _a2.call($$props);
          });
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  delegate(["click"]);
  var root_3$7 = from_html(`<div class="dup-item svelte-xs3gcd"><div class="dup-title svelte-xs3gcd"> </div> <div class="dup-folders svelte-xs3gcd"> </div></div>`);
  var root_4$6 = from_html(`<div class="bfao-modal-more"> </div>`);
  var root_2$6 = from_html(`<div class="bfao-modal-body"><div class="bfao-modal-summary">发现 <strong> </strong> 个重复视频</div> <div class="dup-list svelte-xs3gcd"><!> <!></div> <div class="bfao-action-bar"><button class="bfao-btn bfao-btn-primary"> </button> <span class="bfao-modal-hint">保留首次出现的收藏夹，从其他收藏夹删除副本</span></div></div>`);
  function DuplicatesResult($$anchor, $$props) {
    push($$props, true);
    let processing = prop($$props, "processing", 3, false);
    let showCount = user_derived(() => Math.min($$props.duplicates.length, 50));
    {
      const icon = ($$anchor2) => {
        Copy($$anchor2, { size: 18 });
      };
      Modal($$anchor, {
        title: "重复视频扫描结果",
        showFooter: false,
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_2$6();
          var div_1 = child(div);
          var strong = sibling(child(div_1));
          var text2 = child(strong);
          var div_2 = sibling(div_1, 2);
          var node = child(div_2);
          each(node, 17, () => $$props.duplicates.slice(0, get(showCount)), index, ($$anchor3, d) => {
            var div_3 = root_3$7();
            var div_4 = child(div_3);
            var text_1 = child(div_4);
            var div_5 = sibling(div_4, 2);
            var text_2 = child(div_5);
            template_effect(
              ($0) => {
                set_text(text_1, `• ${get(d).title ?? ""}`);
                set_text(text_2, `出现在：${$0 ?? ""}`);
              },
              [() => get(d).folders.join("、")]
            );
            append($$anchor3, div_3);
          });
          var node_1 = sibling(node, 2);
          {
            var consequent = ($$anchor3) => {
              var div_6 = root_4$6();
              var text_3 = child(div_6);
              template_effect(() => set_text(text_3, `...及其他 ${$$props.duplicates.length - 50} 个`));
              append($$anchor3, div_6);
            };
            if_block(node_1, ($$render) => {
              if ($$props.duplicates.length > 50) $$render(consequent);
            });
          }
          action(div_2, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ stagger: 0.03, delay: 0.2 }));
          var div_7 = sibling(div_2, 2);
          var button = child(div_7);
          var text_4 = child(button);
          action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
          action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
          action(div, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ delay: 0.1, stagger: 0.06 }));
          template_effect(() => {
            set_text(text2, $$props.duplicates.length);
            button.disabled = processing();
            set_text(text_4, processing() ? "正在去重..." : "一键去重");
          });
          delegated("click", button, () => {
            var _a2;
            return (_a2 = $$props.ondedup) == null ? void 0 : _a2.call($$props);
          });
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  delegate(["click"]);
  var root_3$6 = from_html(`<div class="bfao-modal-empty svelte-1237wle">没有可撤销的操作记录</div>`);
  var root_5$5 = from_html(`<label><input type="radio" class="svelte-1237wle"/> <div class="item-info svelte-1237wle"><div class="item-time svelte-1237wle"> </div> <div class="item-detail svelte-1237wle"> </div></div></label>`);
  var root_4$5 = from_html(`<div class="hint svelte-1237wle">选择要撤销的操作，撤销将把所有视频移回原收藏夹：</div> <div class="history-list svelte-1237wle"></div>`, 1);
  var root_2$5 = from_html(`<div class="bfao-modal-body svelte-1237wle"><!></div>`);
  function UndoDialog($$anchor, $$props) {
    push($$props, true);
    const binding_group = [];
    let processing = prop($$props, "processing", 3, false);
    let selectedIndex = state(0);
    {
      const icon = ($$anchor2) => {
        Undo_2($$anchor2, { size: 18 });
      };
      let $0 = user_derived(() => processing() || $$props.history.length === 0);
      Modal($$anchor, {
        title: "撤销操作",
        confirmText: "执行撤销",
        get confirmDisabled() {
          return get($0);
        },
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        onconfirm: () => {
          var _a2;
          return (_a2 = $$props.onundo) == null ? void 0 : _a2.call($$props, get(selectedIndex));
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_2$5();
          var node = child(div);
          {
            var consequent = ($$anchor3) => {
              var div_1 = root_3$6();
              append($$anchor3, div_1);
            };
            var alternate = ($$anchor3) => {
              var fragment_2 = root_4$5();
              var div_2 = sibling(first_child(fragment_2), 2);
              each(div_2, 21, () => $$props.history, index, ($$anchor4, record, i) => {
                var label = root_5$5();
                let classes;
                var input = child(label);
                effect(() => bind_group(
                  binding_group,
                  [],
                  input,
                  () => {
                    return get(selectedIndex);
                  },
                  ($$value) => set(selectedIndex, $$value)
                ));
                action(input, ($$node) => checkBounce == null ? void 0 : checkBounce($$node));
                input.value = input.__value = i;
                var div_3 = sibling(input, 2);
                var div_4 = child(div_3);
                var text2 = child(div_4);
                var div_5 = sibling(div_4, 2);
                var text_1 = child(div_5);
                template_effect(() => {
                  classes = set_class(label, 1, "bfao-selectable-item svelte-1237wle", null, classes, { selected: get(selectedIndex) === i });
                  input.disabled = processing();
                  set_text(text2, get(record).timeLocal || get(record).time);
                  set_text(text_1, `${get(record).totalVideos ?? "?" ?? ""} 个视频 → ${get(record).totalCategories ?? "?" ?? ""} 个分类
                (${get(record).moves.length ?? ""} 步操作)`);
                });
                append($$anchor4, label);
              });
              action(div_2, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ stagger: 0.04, delay: 0.1 }));
              append($$anchor3, fragment_2);
            };
            if_block(node, ($$render) => {
              if ($$props.history.length === 0) $$render(consequent);
              else $$render(alternate, -1);
            });
          }
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  var root_2$4 = from_html(`<button class="bfao-btn bfao-btn-muted clear-btn svelte-qj4dz7"><!> 清空</button> <button class="bfao-btn bfao-btn-muted svelte-qj4dz7">关闭</button>`, 1);
  var root_4$4 = from_html(`<div class="bfao-modal-empty svelte-qj4dz7">暂无整理历史记录</div>`);
  var root_7$1 = from_html(`<div class="timeline-cats svelte-qj4dz7"> </div>`);
  var root_6$1 = from_html(`<div class="timeline-item svelte-qj4dz7"><div class="timeline-dot svelte-qj4dz7"></div> <div class="timeline-card svelte-qj4dz7"><div class="timeline-time svelte-qj4dz7"> </div> <div class="timeline-detail svelte-qj4dz7">整理了 <strong class="svelte-qj4dz7"> </strong> 个视频 → <strong class="svelte-qj4dz7"> </strong> 个分类</div> <!></div></div>`);
  var root_5$4 = from_html(`<div class="timeline svelte-qj4dz7"></div>`);
  var root_3$5 = from_html(`<div class="bfao-modal-body svelte-qj4dz7"><!></div>`);
  function HistoryTimeline($$anchor, $$props) {
    push($$props, true);
    {
      const icon = ($$anchor2) => {
        Clock($$anchor2, { size: 18 });
      };
      const footer = ($$anchor2) => {
        var fragment_2 = root_2$4();
        var button = first_child(fragment_2);
        var node = child(button);
        Trash_2(node, { size: 14 });
        action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
        action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        var button_1 = sibling(button, 2);
        action(button_1, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
        action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        delegated("click", button, () => {
          var _a2;
          return (_a2 = $$props.onclear) == null ? void 0 : _a2.call($$props);
        });
        delegated("click", button_1, () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        });
        append($$anchor2, fragment_2);
      };
      Modal($$anchor, {
        title: "整理历史",
        showFooter: true,
        cancelText: "关闭",
        confirmText: "",
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        footer,
        children: ($$anchor2, $$slotProps) => {
          var div = root_3$5();
          var node_1 = child(div);
          {
            var consequent = ($$anchor3) => {
              var div_1 = root_4$4();
              append($$anchor3, div_1);
            };
            var alternate = ($$anchor3) => {
              var div_2 = root_5$4();
              each(div_2, 21, () => $$props.history, index, ($$anchor4, entry, i) => {
                var div_3 = root_6$1();
                set_style(div_3, `--i: ${i}`);
                var div_4 = sibling(child(div_3), 2);
                var div_5 = child(div_4);
                var text2 = child(div_5);
                var div_6 = sibling(div_5, 2);
                var strong = sibling(child(div_6));
                var text_1 = child(strong);
                var strong_1 = sibling(strong, 2);
                var text_2 = child(strong_1);
                var node_2 = sibling(div_6, 2);
                {
                  var consequent_1 = ($$anchor5) => {
                    var div_7 = root_7$1();
                    var text_3 = child(div_7);
                    template_effect(() => set_text(text_3, get(entry).categories));
                    append($$anchor5, div_7);
                  };
                  if_block(node_2, ($$render) => {
                    if (get(entry).categories) $$render(consequent_1);
                  });
                }
                template_effect(() => {
                  set_text(text2, get(entry).time);
                  set_text(text_1, get(entry).videoCount);
                  set_text(text_2, get(entry).categoryCount);
                });
                append($$anchor4, div_3);
              });
              append($$anchor3, div_2);
            };
            if_block(node_1, ($$render) => {
              if ($$props.history.length === 0) $$render(consequent);
              else $$render(alternate, -1);
            });
          }
          append($$anchor2, div);
        },
        $$slots: { icon: true, footer: true, default: true }
      });
    }
    pop();
  }
  delegate(["click"]);
  const DEFAULTS = {
    maxDeg: 3,
    perspective: 800,
    scale: 1.02
  };
  function tilt(node, opts = {}) {
    const cfg = { ...DEFAULTS, ...opts };
    let qRotX;
    let qRotY;
    function setup() {
      node.style.transformStyle = "preserve-3d";
      node.style.perspective = cfg.perspective + "px";
      qRotX = gsap.quickTo(node, "rotationX", { duration: 0.3, ease: "power2.out" });
      qRotY = gsap.quickTo(node, "rotationY", { duration: 0.3, ease: "power2.out" });
    }
    function onMouseMove(e) {
      if (!shouldAnimate()) return;
      const rect = node.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      qRotX(-ny * cfg.maxDeg * 2);
      qRotY(nx * cfg.maxDeg * 2);
    }
    function onMouseEnter() {
      if (!shouldAnimate()) return;
      gsap.to(node, { scale: cfg.scale, duration: 0.3, ease: "power2.out" });
    }
    function onMouseLeave() {
      gsap.to(node, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      });
    }
    setup();
    node.addEventListener("mousemove", onMouseMove);
    node.addEventListener("mouseenter", onMouseEnter);
    node.addEventListener("mouseleave", onMouseLeave);
    return {
      update(newOpts) {
        Object.assign(cfg, DEFAULTS, newOpts);
        node.style.perspective = cfg.perspective + "px";
      },
      destroy() {
        node.removeEventListener("mousemove", onMouseMove);
        node.removeEventListener("mouseenter", onMouseEnter);
        node.removeEventListener("mouseleave", onMouseLeave);
        gsap.killTweensOf(node);
        gsap.set(node, { rotationX: 0, rotationY: 0, scale: 1 });
      }
    };
  }
  var root_5$3 = from_html(`<div class="health-score svelte-l1lb8j"><svg class="health-ring svelte-l1lb8j" viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--ai-border-lighter)" stroke-width="7" class="svelte-l1lb8j"></circle><circle cx="60" cy="60" r="54" fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(-90 60 60)" class="svelte-l1lb8j"></circle></svg> <div class="score-overlay svelte-l1lb8j"><div class="score-number svelte-l1lb8j"> </div> <div class="score-label svelte-l1lb8j">健康评分</div></div></div> <div class="health-detail svelte-l1lb8j"><!></div>`, 1);
  var root_10 = from_html(`<div class="folder-row svelte-l1lb8j"><span class="folder-name svelte-l1lb8j"> </span> <span class="folder-count svelte-l1lb8j"> </span></div>`);
  var root_9 = from_html(`<div class="folder-breakdown svelte-l1lb8j"><div class="section-title svelte-l1lb8j">收藏夹分布</div> <!></div>`);
  var root_4$3 = from_html(`<div class="bfao-modal-body svelte-l1lb8j"><!> <div class="stats-grid svelte-l1lb8j"><div class="stat-card svelte-l1lb8j"><div class="stat-value svelte-l1lb8j"> </div> <div class="stat-label svelte-l1lb8j">收藏夹</div></div> <div class="stat-card svelte-l1lb8j"><div class="stat-value svelte-l1lb8j" data-locale="true"> </div> <div class="stat-label svelte-l1lb8j">视频总数</div></div> <div class="stat-card svelte-l1lb8j"><div> </div> <div class="stat-label svelte-l1lb8j">失效视频</div></div> <div class="stat-card svelte-l1lb8j"><div class="stat-value svelte-l1lb8j"> </div> <div class="stat-label svelte-l1lb8j">失效率</div></div></div> <!></div>`);
  function StatsDialog($$anchor, $$props) {
    push($$props, true);
    let mode = prop($$props, "mode", 3, "stats");
    let healthScore = user_derived(() => $$props.totalVideos > 0 ? Math.max(0, Math.round(100 - $$props.deadCount / $$props.totalVideos * 100)) : 100);
    let healthColor = user_derived(() => get(healthScore) >= 80 ? "var(--ai-success)" : get(healthScore) >= 60 ? "var(--ai-warning)" : "var(--ai-error)");
    let deadRate = user_derived(() => $$props.totalVideos > 0 ? ($$props.deadCount / $$props.totalVideos * 100).toFixed(1) : "0");
    function rollNumber(node, value) {
      const suffix = node.dataset.suffix;
      const useLocale = node.dataset.locale === "true";
      const { destroy } = numberRoll(node, value, { duration: 800, suffix, useLocale });
      return { destroy };
    }
    function healthRing(node, score) {
      const circumference = 2 * Math.PI * 54;
      const target = circumference * (1 - score / 100);
      node.style.strokeDasharray = `${circumference}`;
      node.style.strokeDashoffset = `${circumference}`;
      if (shouldAnimate()) {
        gsap.to(node, {
          strokeDashoffset: target,
          duration: 1.2,
          delay: 0.3,
          ease: EASINGS.velvetSpring
        });
      } else {
        node.style.strokeDashoffset = `${target}`;
      }
      return { destroy() {
      } };
    }
    {
      const icon = ($$anchor2) => {
        var fragment_1 = comment();
        var node_1 = first_child(fragment_1);
        {
          var consequent = ($$anchor3) => {
            Heart($$anchor3, { size: 18 });
          };
          var alternate = ($$anchor3) => {
            Chart_column($$anchor3, { size: 18 });
          };
          if_block(node_1, ($$render) => {
            if (mode() === "health") $$render(consequent);
            else $$render(alternate, -1);
          });
        }
        append($$anchor2, fragment_1);
      };
      let $0 = user_derived(() => mode() === "health" ? "收藏夹健康检查" : "收藏夹统计");
      Modal($$anchor, {
        get title() {
          return get($0);
        },
        showFooter: true,
        cancelText: "",
        confirmText: "关闭",
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        onconfirm: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_4$3();
          var node_2 = child(div);
          {
            var consequent_3 = ($$anchor3) => {
              var fragment_4 = root_5$3();
              var div_1 = first_child(fragment_4);
              let styles;
              var svg = child(div_1);
              var circle = sibling(child(svg));
              action(circle, ($$node, $$action_arg) => healthRing == null ? void 0 : healthRing($$node, $$action_arg), () => get(healthScore));
              var div_2 = sibling(svg, 2);
              var div_3 = child(div_2);
              var text$1 = child(div_3);
              action(div_3, ($$node, $$action_arg) => rollNumber == null ? void 0 : rollNumber($$node, $$action_arg), () => get(healthScore));
              var div_4 = sibling(div_1, 2);
              var node_3 = child(div_4);
              {
                var consequent_1 = ($$anchor4) => {
                  var text_1 = text("收藏夹状态良好！");
                  append($$anchor4, text_1);
                };
                var consequent_2 = ($$anchor4) => {
                  var text_2 = text("收藏夹有一些失效视频需要清理");
                  append($$anchor4, text_2);
                };
                var alternate_1 = ($$anchor4) => {
                  var text_3 = text("收藏夹有较多失效视频，建议及时清理");
                  append($$anchor4, text_3);
                };
                if_block(node_3, ($$render) => {
                  if (get(healthScore) >= 80) $$render(consequent_1);
                  else if (get(healthScore) >= 60) $$render(consequent_2, 1);
                  else $$render(alternate_1, -1);
                });
              }
              template_effect(() => {
                styles = set_style(div_1, "", styles, { color: get(healthColor) });
                set_attribute(circle, "stroke", get(healthColor));
                set_text(text$1, get(healthScore));
              });
              append($$anchor3, fragment_4);
            };
            if_block(node_2, ($$render) => {
              if (mode() === "health") $$render(consequent_3);
            });
          }
          var div_5 = sibling(node_2, 2);
          var div_6 = child(div_5);
          var div_7 = child(div_6);
          var text_4 = child(div_7);
          action(div_7, ($$node, $$action_arg) => rollNumber == null ? void 0 : rollNumber($$node, $$action_arg), () => $$props.folders.length);
          action(div_6, ($$node, $$action_arg) => tilt == null ? void 0 : tilt($$node, $$action_arg), () => ({ maxDeg: 4, scale: 1.03 }));
          var div_8 = sibling(div_6, 2);
          var div_9 = child(div_8);
          var text_5 = child(div_9);
          action(div_9, ($$node, $$action_arg) => rollNumber == null ? void 0 : rollNumber($$node, $$action_arg), () => $$props.totalVideos);
          action(div_8, ($$node, $$action_arg) => tilt == null ? void 0 : tilt($$node, $$action_arg), () => ({ maxDeg: 4, scale: 1.03 }));
          var div_10 = sibling(div_8, 2);
          var div_11 = child(div_10);
          let classes;
          var text_6 = child(div_11);
          action(div_11, ($$node, $$action_arg) => rollNumber == null ? void 0 : rollNumber($$node, $$action_arg), () => $$props.deadCount);
          action(div_10, ($$node, $$action_arg) => tilt == null ? void 0 : tilt($$node, $$action_arg), () => ({ maxDeg: 4, scale: 1.03 }));
          var div_12 = sibling(div_10, 2);
          var div_13 = child(div_12);
          var text_7 = child(div_13);
          action(div_12, ($$node, $$action_arg) => tilt == null ? void 0 : tilt($$node, $$action_arg), () => ({ maxDeg: 4, scale: 1.03 }));
          var node_4 = sibling(div_5, 2);
          {
            var consequent_4 = ($$anchor3) => {
              var div_14 = root_9();
              var node_5 = sibling(child(div_14), 2);
              each(node_5, 17, () => $$props.folders, index, ($$anchor4, f) => {
                var div_15 = root_10();
                var span = child(div_15);
                var text_8 = child(span);
                var span_1 = sibling(span, 2);
                var text_9 = child(span_1);
                template_effect(() => {
                  set_text(text_8, get(f).title);
                  set_text(text_9, `${get(f).media_count ?? ""} 个视频`);
                });
                append($$anchor4, div_15);
              });
              action(div_14, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ delay: 0.25, stagger: 0.03 }));
              append($$anchor3, div_14);
            };
            if_block(node_4, ($$render) => {
              if ($$props.folders.length > 0) $$render(consequent_4);
            });
          }
          action(div, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ delay: 0.1, stagger: 0.06 }));
          template_effect(
            ($02) => {
              set_text(text_4, $$props.folders.length);
              set_text(text_5, $02);
              classes = set_class(div_11, 1, "stat-value svelte-l1lb8j", null, classes, { danger: $$props.deadCount > 0 });
              set_text(text_6, $$props.deadCount);
              set_text(text_7, `${get(deadRate) ?? ""}%`);
            },
            [() => $$props.totalVideos.toLocaleString()]
          );
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  var root_3$4 = from_html(`<!> 取消全选`, 1);
  var root_4$2 = from_html(`<!> 全选`, 1);
  var root_5$2 = from_html(`<label><input type="checkbox" class="svelte-184y11r"/> <div class="folder-info svelte-184y11r"><div class="folder-title svelte-184y11r"> </div> <div class="folder-count svelte-184y11r"> </div></div></label>`);
  var root_2$3 = from_html(`<div class="selector-content svelte-184y11r"><div class="toolbar svelte-184y11r"><button class="toggle-all svelte-184y11r"><!></button> <span class="count svelte-184y11r"> </span></div> <div class="folder-list svelte-184y11r"></div></div>`);
  function FolderSelector($$anchor, $$props) {
    push($$props, true);
    let folders = prop($$props, "folders", 19, () => []);
    let selected = state(proxy( new Set()));
    function toggle(id) {
      if (get(selected).has(id)) {
        get(selected).delete(id);
      } else {
        get(selected).add(id);
      }
      set(selected, new Set(get(selected)), true);
    }
    function toggleAll() {
      if (get(selected).size === folders().length) {
        set(selected, new Set(), true);
      } else {
        set(selected, new Set(folders().map((f) => f.id)), true);
      }
    }
    let allSelected = user_derived(() => get(selected).size === folders().length && folders().length > 0);
    {
      const icon = ($$anchor2) => {
        Folder_open($$anchor2, { size: 18 });
      };
      let $0 = user_derived(() => get(selected).size === 0);
      Modal($$anchor, {
        title: "选择收藏夹",
        get confirmText() {
          return `确认选择 (${get(selected).size ?? ""})`;
        },
        get confirmDisabled() {
          return get($0);
        },
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        onconfirm: () => {
          var _a2;
          return (_a2 = $$props.onconfirm) == null ? void 0 : _a2.call($$props, [...get(selected)]);
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_2$3();
          var div_1 = child(div);
          var button = child(div_1);
          var node = child(button);
          {
            var consequent = ($$anchor3) => {
              var fragment_2 = root_3$4();
              var node_1 = first_child(fragment_2);
              Square_check_big(node_1, { size: 14 });
              append($$anchor3, fragment_2);
            };
            var alternate = ($$anchor3) => {
              var fragment_3 = root_4$2();
              var node_2 = first_child(fragment_3);
              Square(node_2, { size: 14 });
              append($$anchor3, fragment_3);
            };
            if_block(node, ($$render) => {
              if (get(allSelected)) $$render(consequent);
              else $$render(alternate, -1);
            });
          }
          action(button, ($$node, $$action_arg) => magnetic == null ? void 0 : magnetic($$node, $$action_arg), () => ({ radius: 80, strength: 0.45 }));
          var span = sibling(button, 2);
          var text2 = child(span);
          var div_2 = sibling(div_1, 2);
          each(div_2, 21, folders, (folder) => folder.id, ($$anchor3, folder) => {
            var label = root_5$2();
            let classes;
            var input = child(label);
            action(input, ($$node) => checkBounce == null ? void 0 : checkBounce($$node));
            var div_3 = sibling(input, 2);
            var div_4 = child(div_3);
            var text_1 = child(div_4);
            var div_5 = sibling(div_4, 2);
            var text_2 = child(div_5);
            template_effect(
              ($02, $1) => {
                classes = set_class(label, 1, "bfao-selectable-item svelte-184y11r", null, classes, $02);
                set_checked(input, $1);
                set_text(text_1, get(folder).title);
                set_text(text_2, `${get(folder).media_count ?? ""} 个视频`);
              },
              [
                () => ({ selected: get(selected).has(get(folder).id) }),
                () => get(selected).has(get(folder).id)
              ]
            );
            delegated("change", input, () => toggle(get(folder).id));
            append($$anchor3, label);
          });
          action(div_2, ($$node, $$action_arg) => contentStagger == null ? void 0 : contentStagger($$node, $$action_arg), () => ({ stagger: 0.025, delay: 0.15 }));
          template_effect(() => set_text(text2, `共 ${folders().length ?? ""} 个收藏夹`));
          delegated("click", button, toggleAll);
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  delegate(["click", "change"]);
  function triggerDownload(blob, filename) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1e3);
    };
    const isText = blob.type.startsWith("text/") || blob.type === "application/json";
    if (isText) {
      reader.readAsDataURL(new Blob(["\uFEFF", blob], { type: blob.type + ";charset=utf-8" }));
    } else {
      reader.readAsDataURL(blob);
    }
  }
  function thumbPreview(node) {
    let previewEl = null;
    function onEnter() {
      const img = node.querySelector("img");
      if (!(img == null ? void 0 : img.src)) return;
      const rect = node.getBoundingClientRect();
      previewEl = document.createElement("div");
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
        if (previewEl) {
          previewEl.style.opacity = "1";
          previewEl.style.transform = "scale(1)";
        }
      });
      const previewImg = document.createElement("img");
      previewImg.src = img.src;
      previewImg.style.cssText = `
      width: 260px; height: auto;
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);
      display: block;
    `;
      previewEl.appendChild(previewImg);
      document.body.appendChild(previewEl);
      requestAnimationFrame(() => {
        if (!previewEl) return;
        const pr = previewEl.getBoundingClientRect();
        if (pr.right > window.innerWidth - 10) {
          previewEl.style.left = rect.left - pr.width - 10 + "px";
        }
        if (pr.bottom > window.innerHeight - 10) {
          previewEl.style.top = window.innerHeight - pr.height - 10 + "px";
        }
      });
    }
    function onLeave() {
      previewEl == null ? void 0 : previewEl.remove();
      previewEl = null;
    }
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    return {
      destroy() {
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
        previewEl == null ? void 0 : previewEl.remove();
      }
    };
  }
  function formatDuration(seconds) {
    if (!seconds || seconds < 0) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  function isDeadVideo(video) {
    return video.attr === VideoAttr.DEAD || video.title === "已失效视频";
  }
  var root_1$3 = from_html(`<img class="video-thumb svelte-9tq2cj" alt="" loading="lazy"/>`);
  var root_2$2 = from_html(`<div class="video-thumb-placeholder svelte-9tq2cj"></div>`);
  var root_3$3 = from_html(`<span class="video-duration svelte-9tq2cj"> </span>`);
  var root_4$1 = from_html(`<span class="video-uploader svelte-9tq2cj"> </span>`);
  var root_5$1 = from_html(`<span> </span>`);
  var root$7 = from_html(`<div><div class="video-thumb-wrap svelte-9tq2cj"><!> <!></div> <div class="video-info svelte-9tq2cj"><span class="video-title svelte-9tq2cj"> </span> <!></div> <!></div>`);
  function VideoItem($$anchor, $$props) {
    push($$props, true);
    let virtual = prop($$props, "virtual", 3, false), top = prop($$props, "top", 3, 0);
    var div = root$7();
    let classes;
    let styles;
    var div_1 = child(div);
    var node = child(div_1);
    {
      var consequent = ($$anchor2) => {
        var img = root_1$3();
        template_effect(() => set_attribute(img, "src", $$props.info.cover));
        delegated("click", img, (e) => {
          var _a2, _b2;
          e.stopPropagation();
          if ((_a2 = $$props.info) == null ? void 0 : _a2.cover) (_b2 = $$props.onlightbox) == null ? void 0 : _b2.call($$props, $$props.info.cover);
        });
        append($$anchor2, img);
      };
      var alternate = ($$anchor2) => {
        var div_2 = root_2$2();
        append($$anchor2, div_2);
      };
      if_block(node, ($$render) => {
        var _a2;
        if ((_a2 = $$props.info) == null ? void 0 : _a2.cover) $$render(consequent);
        else $$render(alternate, -1);
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var span = root_3$3();
        var text2 = child(span);
        template_effect(($0) => set_text(text2, $0), [() => formatDuration($$props.info.duration)]);
        append($$anchor2, span);
      };
      if_block(node_1, ($$render) => {
        var _a2;
        if ((_a2 = $$props.info) == null ? void 0 : _a2.duration) $$render(consequent_1);
      });
    }
    action(div_1, ($$node) => thumbPreview == null ? void 0 : thumbPreview($$node));
    var div_3 = sibling(div_1, 2);
    var span_1 = child(div_3);
    var text_1 = child(span_1);
    var node_2 = sibling(span_1, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var span_2 = root_4$1();
        var text_2 = child(span_2);
        template_effect(() => set_text(text_2, $$props.info.upper.name));
        append($$anchor2, span_2);
      };
      if_block(node_2, ($$render) => {
        var _a2, _b2;
        if ((_b2 = (_a2 = $$props.info) == null ? void 0 : _a2.upper) == null ? void 0 : _b2.name) $$render(consequent_2);
      });
    }
    var node_3 = sibling(div_3, 2);
    {
      var consequent_3 = ($$anchor2) => {
        var span_3 = root_5$1();
        let classes_1;
        var text_3 = child(span_3);
        template_effect(
          ($0) => {
            classes_1 = set_class(span_3, 1, "conf svelte-9tq2cj", null, classes_1, { low: $$props.vid.conf < 0.6 });
            set_text(text_3, `${$0 ?? ""}%`);
          },
          [() => Math.round($$props.vid.conf * 100)]
        );
        append($$anchor2, span_3);
      };
      if_block(node_3, ($$render) => {
        if ($$props.vid.conf != null) $$render(consequent_3);
      });
    }
    template_effect(() => {
      var _a2, _b2;
      classes = set_class(div, 1, "video-item svelte-9tq2cj", null, classes, {
        "virtual-item": virtual(),
        "stagger-reveal": $$props.staggerIndex != null
      });
      styles = set_style(div, "", styles, {
        top: virtual() ? `${top()}px` : void 0,
        "animation-delay": $$props.staggerIndex != null ? `${$$props.staggerIndex * 0.04}s` : void 0
      });
      set_attribute(span_1, "title", ((_a2 = $$props.info) == null ? void 0 : _a2.title) ?? `av${$$props.vid.id}`);
      set_text(text_1, ((_b2 = $$props.info) == null ? void 0 : _b2.title) ?? `av${$$props.vid.id}`);
    });
    event("animationend", div, (e) => {
      if (e.animationName === "itemReveal") e.currentTarget.classList.remove("stagger-reveal");
    });
    append($$anchor, div);
    pop();
  }
  delegate(["click"]);
  var root_1$2 = from_html(`<span> </span>`);
  var root_3$2 = from_html(`<div class="video-list-wrap svelte-t28wkk"><div class="video-list virtual-scroll svelte-t28wkk"><div class="virtual-spacer svelte-t28wkk"></div></div></div>`);
  var root_5 = from_html(`<div class="video-list-wrap svelte-t28wkk"><div class="video-list svelte-t28wkk"></div></div>`);
  var root$6 = from_html(`<div><div class="category-header svelte-t28wkk"><input type="checkbox" class="svelte-t28wkk"/> <button><!></button>  <span class="category-name svelte-t28wkk"> </span> <span> </span> <!> <span class="category-count svelte-t28wkk"> </span> <button class="remove-btn svelte-t28wkk" title="从当前收藏夹移出该分类下所有视频"><!> <span class="svelte-t28wkk">移出</span></button></div> <!></div>`);
  function CategoryGroup($$anchor, $$props) {
    push($$props, true);
    let virtualThreshold = prop($$props, "virtualThreshold", 3, 40), visibleRows = prop($$props, "visibleRows", 3, 6), rowHeight = prop($$props, "rowHeight", 3, 68);
    let needsVirtual = user_derived(() => $$props.vids.length > virtualThreshold());
    let avgConf = user_derived(() => $$props.vids.some((v) => v.conf != null) ? $$props.vids.reduce((s, v) => s + (v.conf ?? 1), 0) / $$props.vids.length : null);
    function slideAction(node) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const h = node.scrollHeight;
      node.style.maxHeight = "0px";
      node.style.overflow = "hidden";
      node.style.transition = "max-height 0.35s cubic-bezier(0.2, 0.98, 0.28, 1), opacity 0.3s ease";
      node.style.opacity = "0";
      requestAnimationFrame(() => {
        node.style.maxHeight = h + "px";
        node.style.opacity = "1";
      });
      const cleanup = () => {
        node.style.maxHeight = "";
        node.style.overflow = "";
        node.style.transition = "";
        node.style.opacity = "";
      };
      node.addEventListener("transitionend", cleanup, { once: true });
      return {
        destroy() {
          node.removeEventListener("transitionend", cleanup);
        }
      };
    }
    var div = root$6();
    let classes;
    var div_1 = child(div);
    var input = child(div_1);
    action(input, ($$node) => checkBounce == null ? void 0 : checkBounce($$node));
    var button = sibling(input, 2);
    let classes_1;
    var node_1 = child(button);
    Chevron_right(node_1, { size: 14 });
    var span = sibling(button, 2);
    var text2 = child(span);
    var span_1 = sibling(span, 2);
    let classes_2;
    var text_1 = child(span_1);
    var node_2 = sibling(span_1, 2);
    {
      var consequent = ($$anchor2) => {
        var span_2 = root_1$2();
        let classes_3;
        var text_2 = child(span_2);
        template_effect(
          ($0) => {
            classes_3 = set_class(span_2, 1, "conf-avg svelte-t28wkk", null, classes_3, { low: get(avgConf) < 0.6 });
            set_text(text_2, `√${$0 ?? ""}%`);
          },
          [() => Math.round(get(avgConf) * 100)]
        );
        append($$anchor2, span_2);
      };
      if_block(node_2, ($$render) => {
        if (get(avgConf) !== null) $$render(consequent);
      });
    }
    var span_3 = sibling(node_2, 2);
    var text_3 = child(span_3);
    var button_1 = sibling(span_3, 2);
    var node_3 = child(button_1);
    Log_out(node_3, { size: 12 });
    var node_4 = sibling(div_1, 2);
    {
      var consequent_2 = ($$anchor2) => {
        var fragment = comment();
        var node_5 = first_child(fragment);
        {
          var consequent_1 = ($$anchor3) => {
            var div_2 = root_3$2();
            var div_3 = child(div_2);
            let styles;
            var div_4 = child(div_3);
            let styles_1;
            each(div_4, 23, () => $$props.vids.slice($$props.visibleRange.start, $$props.visibleRange.end), (vid) => vid.id, ($$anchor4, vid, i) => {
              {
                let $0 = user_derived(() => $$props.videoMap.get(get(vid).id));
                let $1 = user_derived(() => ($$props.visibleRange.start + get(i)) * rowHeight());
                VideoItem($$anchor4, {
                  get vid() {
                    return get(vid);
                  },
                  get info() {
                    return get($0);
                  },
                  virtual: true,
                  get top() {
                    return get($1);
                  },
                  get onlightbox() {
                    return $$props.onlightbox;
                  }
                });
              }
            });
            action(div_2, ($$node) => slideAction == null ? void 0 : slideAction($$node));
            template_effect(() => {
              styles = set_style(div_3, "", styles, { height: `${visibleRows() * rowHeight()}px` });
              styles_1 = set_style(div_4, "", styles_1, { height: `${$$props.vids.length * rowHeight()}px` });
            });
            event("scroll", div_3, (e) => {
              var _a2;
              return (_a2 = $$props.onvirtualscroll) == null ? void 0 : _a2.call($$props, e);
            });
            append($$anchor3, div_2);
          };
          var alternate = ($$anchor3) => {
            var div_5 = root_5();
            var div_6 = child(div_5);
            each(div_6, 23, () => $$props.vids, (vid) => vid.id, ($$anchor4, vid, i) => {
              {
                let $0 = user_derived(() => $$props.videoMap.get(get(vid).id));
                let $1 = user_derived(() => get(i) < 5 ? get(i) : void 0);
                VideoItem($$anchor4, {
                  get vid() {
                    return get(vid);
                  },
                  get info() {
                    return get($0);
                  },
                  get onlightbox() {
                    return $$props.onlightbox;
                  },
                  get staggerIndex() {
                    return get($1);
                  }
                });
              }
            });
            action(div_5, ($$node) => slideAction == null ? void 0 : slideAction($$node));
            append($$anchor3, div_5);
          };
          if_block(node_5, ($$render) => {
            if (get(needsVirtual) && $$props.visibleRange) $$render(consequent_1);
            else $$render(alternate, -1);
          });
        }
        append($$anchor2, fragment);
      };
      if_block(node_4, ($$render) => {
        if ($$props.isExpanded) $$render(consequent_2);
      });
    }
    template_effect(() => {
      classes = set_class(div, 1, "category-group svelte-t28wkk", null, classes, { "merge-source": $$props.isMergeSource });
      set_attribute(div, "data-category", $$props.name);
      set_checked(input, $$props.isSelected);
      classes_1 = set_class(button, 1, "expand-btn svelte-t28wkk", null, classes_1, { expanded: $$props.isExpanded });
      set_text(text2, $$props.name);
      classes_2 = set_class(span_1, 1, "badge svelte-t28wkk", null, classes_2, {
        "badge-existing": $$props.isExisting,
        "badge-new": !$$props.isExisting
      });
      set_text(text_1, $$props.isExisting ? "已有" : "新建");
      set_text(text_3, `${$$props.vids.length ?? ""} 个视频`);
    });
    delegated("change", input, () => {
      var _a2;
      return (_a2 = $$props.ontoggleselect) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button, () => {
      var _a2;
      return (_a2 = $$props.ontoggleexpand) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", span, () => {
      var _a2, _b2;
      return $$props.mergeMode ? (_a2 = $$props.onmergeclick) == null ? void 0 : _a2.call($$props) : (_b2 = $$props.ontoggleexpand) == null ? void 0 : _b2.call($$props);
    });
    delegated("click", button_1, () => {
      var _a2;
      return (_a2 = $$props.onremove) == null ? void 0 : _a2.call($$props);
    });
    append($$anchor, div);
    pop();
  }
  delegate(["change", "click"]);
  var root$5 = from_html(`<div class="preview-toolbar svelte-1wb2xl2"><div class="preview-stats svelte-1wb2xl2">已选 <strong class="svelte-1wb2xl2"> </strong> </div> <div class="search-wrap svelte-1wb2xl2"><!> <input type="text" class="search-input svelte-1wb2xl2" placeholder="搜索分类名..."/></div> <div class="filter-row svelte-1wb2xl2"><button><!> 全选</button> <button>仅已有</button> <button>仅新建</button> <button>低置信度</button> <button><!> 合并分类</button></div> <div class="filter-count svelte-1wb2xl2"> </div></div>`);
  function PreviewToolbar($$anchor, $$props) {
    push($$props, true);
    var div = root$5();
    var div_1 = child(div);
    var strong = sibling(child(div_1));
    var text2 = child(strong);
    var text_1 = sibling(strong);
    var div_2 = sibling(div_1, 2);
    var node = child(div_2);
    Search(node, { size: 14, class: "search-icon" });
    var input = sibling(node, 2);
    action(input, ($$node) => focusGlow == null ? void 0 : focusGlow($$node));
    var div_3 = sibling(div_2, 2);
    var button = child(div_3);
    let classes;
    var node_1 = child(button);
    {
      var consequent = ($$anchor2) => {
        Square_check_big($$anchor2, { size: 12 });
      };
      var alternate = ($$anchor2) => {
        Square($$anchor2, { size: 12 });
      };
      if_block(node_1, ($$render) => {
        if ($$props.allSelected) $$render(consequent);
        else $$render(alternate, -1);
      });
    }
    action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_1 = sibling(button, 2);
    let classes_1;
    action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_2 = sibling(button_1, 2);
    let classes_2;
    action(button_2, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_3 = sibling(button_2, 2);
    let classes_3;
    action(button_3, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var button_4 = sibling(button_3, 2);
    let classes_4;
    var node_2 = child(button_4);
    Git_merge(node_2, { size: 12 });
    action(button_4, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
    var div_4 = sibling(div_3, 2);
    var text_2 = child(div_4);
    template_effect(() => {
      set_text(text2, $$props.selectedVideoCount);
      set_text(text_1, ` / ${$$props.totalVideos ?? ""} 个视频`);
      set_value(input, $$props.searchQuery);
      classes = set_class(button, 1, "filter-btn svelte-1wb2xl2", null, classes, { active: $$props.allSelected });
      classes_1 = set_class(button_1, 1, "filter-btn svelte-1wb2xl2", null, classes_1, { active: $$props.activeFilter === "existing" });
      classes_2 = set_class(button_2, 1, "filter-btn svelte-1wb2xl2", null, classes_2, { active: $$props.activeFilter === "new" });
      classes_3 = set_class(button_3, 1, "filter-btn svelte-1wb2xl2", null, classes_3, { active: $$props.activeFilter === "low-conf" });
      classes_4 = set_class(button_4, 1, "filter-btn merge-btn svelte-1wb2xl2", null, classes_4, { active: $$props.mergeMode });
      set_text(text_2, `${$$props.filteredCount ?? ""} 个分类`);
    });
    delegated("input", input, (e) => {
      var _a2;
      return (_a2 = $$props.onsearchchange) == null ? void 0 : _a2.call($$props, e.currentTarget.value);
    });
    delegated("click", button, () => {
      var _a2;
      return (_a2 = $$props.ontoggleall) == null ? void 0 : _a2.call($$props);
    });
    delegated("click", button_1, () => {
      var _a2;
      return (_a2 = $$props.onfilter) == null ? void 0 : _a2.call($$props, "existing");
    });
    delegated("click", button_2, () => {
      var _a2;
      return (_a2 = $$props.onfilter) == null ? void 0 : _a2.call($$props, "new");
    });
    delegated("click", button_3, () => {
      var _a2;
      return (_a2 = $$props.onfilter) == null ? void 0 : _a2.call($$props, "low-conf");
    });
    delegated("click", button_4, () => {
      var _a2;
      return (_a2 = $$props.ontogglemerge) == null ? void 0 : _a2.call($$props);
    });
    append($$anchor, div);
    pop();
  }
  delegate(["input", "click"]);
  var root_3$1 = from_html(`<div class="footer-custom svelte-10n7vm8"><button class="modal-btn confirm svelte-10n7vm8"> </button> <div class="footer-icons svelte-10n7vm8"><button class="icon-btn svelte-10n7vm8" title="复制到剪贴板"><!></button> <button class="icon-btn svelte-10n7vm8" title="下载 JSON"><!></button> <button class="icon-btn svelte-10n7vm8" title="导出 Markdown"><!></button> <button class="icon-btn svelte-10n7vm8" title="取消"><!></button></div></div>`);
  var root_6 = from_html(`<div class="bfao-modal-empty svelte-10n7vm8">无匹配分类</div>`);
  var root_4 = from_html(`<div class="preview-content svelte-10n7vm8"><div class="category-list svelte-10n7vm8"><!> <!></div></div>`);
  var root_7 = from_html(`<div class="lightbox-overlay svelte-10n7vm8"><img class="lightbox-img svelte-10n7vm8" alt=""/></div>`);
  var root$4 = from_html(`<!> <!>`, 1);
  function PreviewConfirm($$anchor, $$props) {
    push($$props, true);
    let categories = prop($$props, "categories", 19, () => ({})), videos = prop($$props, "videos", 19, () => []), existingFolderNames = prop($$props, "existingFolderNames", 19, () => []);
    let videoMap = user_derived(() => new Map(videos().map((v) => [v.id, v])));
    let existingSet = user_derived(() => new Set(existingFolderNames()));
    let localCategories = state(proxy(Object.fromEntries(Object.entries(categories()).map(([k, v]) => [k, [...v]]))));
    let selectedCategories = state(proxy(new Set(Object.keys(categories()))));
    let searchQuery = state("");
    let activeFilter = state("all");
    let mergeMode = state(false);
    let mergeSource = state(null);
    let expanded = state(proxy( new Set()));
    let categoryListEl = state(void 0);
    let lightboxSrc = state(null);
    function openLightbox(src) {
      set(lightboxSrc, src, true);
    }
    function closeLightbox() {
      set(lightboxSrc, null);
    }
    const ITEM_H = 64;
    const GAP = 4;
    const ROW = ITEM_H + GAP;
    const VIRTUAL_THRESHOLD = 40;
    const VISIBLE_ROWS = 6;
    const OVERSCAN = 3;
    let scrollTops = proxy({});
    let allEntries = user_derived(() => Object.entries(get(localCategories)).sort((a, b) => b[1].length - a[1].length));
    let filteredEntries = user_derived(() => (() => {
      let entries = get(allEntries);
      const q = get(searchQuery).trim().toLowerCase();
      if (q) entries = entries.filter(([name]) => name.toLowerCase().includes(q));
      return entries;
    })());
    let totalVideos = user_derived(() => get(allEntries).reduce((sum, [, vids]) => sum + vids.length, 0));
    let selectedVideoCount = user_derived(() => get(allEntries).filter(([name]) => get(selectedCategories).has(name)).reduce((sum, [, vids]) => sum + vids.length, 0));
    function toggleCategory(name) {
      if (get(selectedCategories).has(name)) get(selectedCategories).delete(name);
      else get(selectedCategories).add(name);
      set(selectedCategories, new Set(get(selectedCategories)), true);
    }
    function toggleSelectAll() {
      if (get(selectedCategories).size === get(allEntries).length) {
        set(selectedCategories, new Set(), true);
      } else {
        set(selectedCategories, new Set(get(allEntries).map(([name]) => name)), true);
      }
    }
    function selectByFilter(mode) {
      let matching;
      switch (mode) {
        case "existing":
          matching = get(allEntries).filter(([name]) => get(existingSet).has(name)).map(([n]) => n);
          break;
        case "new":
          matching = get(allEntries).filter(([name]) => !get(existingSet).has(name)).map(([n]) => n);
          break;
        case "low-conf":
          matching = get(allEntries).filter(([, vids]) => vids.some((v) => v.conf != null && v.conf < 0.6)).map(([n]) => n);
          break;
        default:
          matching = get(allEntries).map(([n]) => n);
      }
      if (get(activeFilter) === mode) {
        for (const name of matching) get(selectedCategories).delete(name);
        set(activeFilter, "all");
      } else {
        set(selectedCategories, new Set(matching), true);
        set(activeFilter, mode, true);
      }
      set(selectedCategories, new Set(get(selectedCategories)), true);
    }
    function toggleMergeMode() {
      set(mergeMode, !get(mergeMode));
      set(mergeSource, null);
    }
    function handleMergeClick(name) {
      if (!get(mergeMode)) return;
      if (get(mergeSource) === null) {
        set(mergeSource, name, true);
        return;
      }
      if (get(mergeSource) === name) {
        set(mergeSource, null);
        return;
      }
      const sourceVids = get(localCategories)[get(mergeSource)] ?? [];
      if (!get(localCategories)[name]) get(localCategories)[name] = [];
      get(localCategories)[name] = [...get(localCategories)[name], ...sourceVids];
      delete get(localCategories)[get(mergeSource)];
      get(selectedCategories).delete(get(mergeSource));
      set(selectedCategories, new Set(get(selectedCategories)), true);
      set(mergeSource, null);
      set(localCategories, { ...get(localCategories) }, true);
    }
    function removeCategory(name) {
      delete get(localCategories)[name];
      get(selectedCategories).delete(name);
      get(expanded).delete(name);
      set(selectedCategories, new Set(get(selectedCategories)), true);
      set(expanded, new Set(get(expanded)), true);
      set(localCategories, { ...get(localCategories) }, true);
    }
    function handleConfirm() {
      var _a2;
      const result = {};
      for (const [name, vids] of Object.entries(get(localCategories))) {
        if (get(selectedCategories).has(name)) result[name] = vids;
      }
      (_a2 = $$props.onconfirm) == null ? void 0 : _a2.call($$props, result);
    }
    async function copyToClipboard() {
      const lines = [];
      for (const [name, vids] of Object.entries(get(localCategories))) {
        if (!get(selectedCategories).has(name)) continue;
        const badge = get(existingSet).has(name) ? "[已有]" : "[新建]";
        lines.push(`${badge} ${name} (${vids.length} 个视频)`);
        for (const vid of vids) {
          const info = get(videoMap).get(vid.id);
          const conf = vid.conf != null ? ` [${Math.round(vid.conf * 100)}%]` : "";
          lines.push(`  - ${(info == null ? void 0 : info.title) ?? `av${vid.id}`}${conf}`);
        }
        lines.push("");
      }
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
      } catch {
      }
    }
    function downloadJSON() {
      const data = Object.fromEntries(Object.entries(get(localCategories)).filter(([name]) => get(selectedCategories).has(name)));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      triggerDownload(blob, `bfao-categories-${Date.now()}.json`);
    }
    function exportMarkdown() {
      const lines = ["# 分类结果\n"];
      for (const [name, vids] of Object.entries(get(localCategories))) {
        if (!get(selectedCategories).has(name)) continue;
        const badge = get(existingSet).has(name) ? "已有" : "新建";
        lines.push(`## ${name} (${badge}, ${vids.length} 个视频)
`);
        for (const vid of vids) {
          const info = get(videoMap).get(vid.id);
          const conf = vid.conf != null ? ` (${Math.round(vid.conf * 100)}%)` : "";
          lines.push(`- ${(info == null ? void 0 : info.title) ?? `av${vid.id}`}${conf}`);
        }
        lines.push("");
      }
      const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
      triggerDownload(blob, `bfao-categories-${Date.now()}.md`);
    }
    function onVirtualScroll(name, e) {
      const el = e.currentTarget;
      scrollTops[name] = el.scrollTop;
    }
    function getVisibleRange(name, total) {
      const st = scrollTops[name] ?? 0;
      const start = Math.max(0, Math.floor(st / ROW) - OVERSCAN);
      const end = Math.min(total, start + VISIBLE_ROWS + OVERSCAN * 2);
      return { start, end };
    }
    async function toggleExpand(name) {
      const wasExpanded = get(expanded).has(name);
      const useFlip = shouldAnimate() && get(categoryListEl);
      const flipState = useFlip ? _Flip.getState(get(categoryListEl).querySelectorAll(".category-group")) : null;
      if (wasExpanded) {
        get(expanded).clear();
        delete scrollTops[name];
      } else {
        for (const prev of get(expanded)) delete scrollTops[prev];
        get(expanded).clear();
        get(expanded).add(name);
      }
      set(expanded, new Set(get(expanded)), true);
      await tick();
      if (!wasExpanded && get(categoryListEl)) {
        const videoItems = get(categoryListEl).querySelectorAll(`[data-category="${CSS.escape(name)}"] .video-item`);
        if (videoItems.length > 0) {
          gsap.set(videoItems, { opacity: 0, x: 36, scale: 0.93 });
        }
      }
      if (!wasExpanded && get(categoryListEl)) {
        const listEl = get(categoryListEl).querySelector(`[data-category="${CSS.escape(name)}"] .video-list`);
        if (listEl) {
          setTimeout(() => listStaggerReveal(listEl.querySelectorAll(".video-item")), 100);
        }
      }
      if (flipState) {
        _Flip.from(flipState, {
          duration: 0.35,
          ease: "power2.out",
          nested: true,
          onComplete: () => {
          }
        });
      } else if (!wasExpanded && get(categoryListEl)) {
        const listEl = get(categoryListEl).querySelector(`[data-category="${CSS.escape(name)}"] .video-list`);
        if (listEl) listStaggerReveal(listEl.querySelectorAll(".video-item"));
      }
    }
    var fragment = root$4();
    var node = first_child(fragment);
    {
      const icon = ($$anchor2) => {
        Eye($$anchor2, { size: 18 });
      };
      const toolbar = ($$anchor2) => {
        {
          let $0 = user_derived(() => get(selectedCategories).size === get(allEntries).length);
          PreviewToolbar($$anchor2, {
            get selectedVideoCount() {
              return get(selectedVideoCount);
            },
            get totalVideos() {
              return get(totalVideos);
            },
            get totalCategories() {
              return get(allEntries).length;
            },
            get filteredCount() {
              return get(filteredEntries).length;
            },
            get allSelected() {
              return get($0);
            },
            get activeFilter() {
              return get(activeFilter);
            },
            get mergeMode() {
              return get(mergeMode);
            },
            get searchQuery() {
              return get(searchQuery);
            },
            onsearchchange: (q) => {
              set(searchQuery, q, true);
            },
            ontoggleall: toggleSelectAll,
            onfilter: selectByFilter,
            ontogglemerge: toggleMergeMode
          });
        }
      };
      const footer = ($$anchor2) => {
        var div = root_3$1();
        var button = child(div);
        var text2 = child(button);
        action(button, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        var div_1 = sibling(button, 2);
        var button_1 = child(div_1);
        var node_1 = child(button_1);
        Clipboard(node_1, { size: 14 });
        action(button_1, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        var button_2 = sibling(button_1, 2);
        var node_2 = child(button_2);
        Download(node_2, { size: 14 });
        action(button_2, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        var button_3 = sibling(button_2, 2);
        var node_3 = child(button_3);
        File_text(node_3, { size: 14 });
        action(button_3, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        var button_4 = sibling(button_3, 2);
        var node_4 = child(button_4);
        X(node_4, { size: 14 });
        action(button_4, ($$node) => pressEffect == null ? void 0 : pressEffect($$node));
        template_effect(() => {
          button.disabled = get(selectedCategories).size === 0;
          set_text(text2, `执行已勾选 (${get(selectedCategories).size ?? ""} 个)`);
        });
        delegated("click", button, handleConfirm);
        delegated("click", button_1, copyToClipboard);
        delegated("click", button_2, downloadJSON);
        delegated("click", button_3, exportMarkdown);
        delegated("click", button_4, () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        });
        append($$anchor2, div);
      };
      Modal(node, {
        title: "分类预览",
        showFooter: true,
        width: "min(780px, 92vw)",
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        toolbar,
        footer,
        children: ($$anchor2, $$slotProps) => {
          var div_2 = root_4();
          var div_3 = child(div_2);
          var node_5 = child(div_3);
          each(node_5, 17, () => get(filteredEntries), ([name, vids]) => name, ($$anchor3, $$item) => {
            var $$array = user_derived(() => to_array(get($$item), 2));
            let name = () => get($$array)[0];
            let vids = () => get($$array)[1];
            {
              let $0 = user_derived(() => get(expanded).has(name()));
              let $1 = user_derived(() => get(selectedCategories).has(name()));
              let $2 = user_derived(() => get(existingSet).has(name()));
              let $3 = user_derived(() => get(mergeMode) && get(mergeSource) === name());
              let $4 = user_derived(() => getVisibleRange(name(), vids().length));
              CategoryGroup($$anchor3, {
                get name() {
                  return name();
                },
                get vids() {
                  return vids();
                },
                get videoMap() {
                  return get(videoMap);
                },
                get isExpanded() {
                  return get($0);
                },
                get isSelected() {
                  return get($1);
                },
                get isExisting() {
                  return get($2);
                },
                get isMergeSource() {
                  return get($3);
                },
                get mergeMode() {
                  return get(mergeMode);
                },
                virtualThreshold: VIRTUAL_THRESHOLD,
                visibleRows: VISIBLE_ROWS,
                rowHeight: ROW,
                get visibleRange() {
                  return get($4);
                },
                ontoggleselect: () => toggleCategory(name()),
                ontoggleexpand: () => toggleExpand(name()),
                onmergeclick: () => handleMergeClick(name()),
                onremove: () => removeCategory(name()),
                onvirtualscroll: (e) => onVirtualScroll(name(), e),
                onlightbox: openLightbox
              });
            }
          });
          var node_6 = sibling(node_5, 2);
          {
            var consequent = ($$anchor3) => {
              var div_4 = root_6();
              append($$anchor3, div_4);
            };
            if_block(node_6, ($$render) => {
              if (get(filteredEntries).length === 0) $$render(consequent);
            });
          }
          bind_this(div_3, ($$value) => set(categoryListEl, $$value), () => get(categoryListEl));
          append($$anchor2, div_2);
        },
        $$slots: { icon: true, toolbar: true, footer: true, default: true }
      });
    }
    var node_7 = sibling(node, 2);
    {
      var consequent_1 = ($$anchor2) => {
        var div_5 = root_7();
        var img = child(div_5);
        template_effect(() => set_attribute(img, "src", get(lightboxSrc)));
        delegated("click", div_5, closeLightbox);
        delegated("keydown", div_5, (e) => {
          if (e.key === "Escape") closeLightbox();
        });
        append($$anchor2, div_5);
      };
      if_block(node_7, ($$render) => {
        if (get(lightboxSrc)) $$render(consequent_1);
      });
    }
    append($$anchor, fragment);
    pop();
  }
  delegate(["click", "keydown"]);
  var root_3 = from_html(`<button><span class="faq-q svelte-1lxq9cp"><span>?</span> </span> <!></button> <div class="faq-a svelte-1lxq9cp"> </div>`, 1);
  var root_2$1 = from_html(`<div class="help-body svelte-1lxq9cp"><!> <div class="help-footer svelte-1lxq9cp">快捷键: Alt+B 开关面板 · ESC 关闭 · Ctrl+Enter 开始</div></div>`);
  function HelpDialog($$anchor, $$props) {
    push($$props, true);
    let expandedIdx = state(null);
    let helpBodyEl = state(void 0);
    let answerEls = {};
    onMount(() => {
      if (!shouldAnimate() || !get(helpBodyEl)) return;
      const items = get(helpBodyEl).querySelectorAll(".faq-item");
      if (items.length > 0) {
        gsap.fromTo(items, { opacity: 0, y: 15 }, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.02,
          delay: 0.1,
          ease: EASINGS.velvetSpring
        });
      }
    });
    function toggle(idx) {
      const prevIdx = get(expandedIdx);
      if (prevIdx === idx) {
        collapseAnswer(idx);
        set(expandedIdx, null);
      } else {
        if (prevIdx !== null) collapseAnswer(prevIdx);
        set(expandedIdx, idx, true);
        expandAnswer(idx);
      }
    }
    function expandAnswer(idx) {
      const node = answerEls[idx];
      if (!node) return;
      if (!shouldAnimate()) {
        node.style.height = "auto";
        node.style.opacity = "1";
        return;
      }
      node.style.overflow = "hidden";
      gsap.fromTo(node, { height: 0, opacity: 0 }, {
        height: "auto",
        opacity: 1,
        duration: 0.3,
        ease: EASINGS.velvetSpring,
        onComplete: () => {
          node.style.overflow = "";
        }
      });
    }
    function collapseAnswer(idx) {
      const node = answerEls[idx];
      if (!node) return;
      if (!shouldAnimate()) {
        node.style.height = "0";
        node.style.opacity = "0";
        return;
      }
      node.style.overflow = "hidden";
      gsap.to(node, { height: 0, opacity: 0, duration: 0.22, ease: EASINGS.silkOut });
    }
    const FAQ = [
      {
        q: "API Key 从哪获取？",
        a: "在对应 AI 服务商的开发者控制台创建 API Key。例如 Gemini 在 ai.google.dev，OpenAI 在 platform.openai.com，DeepSeek 在 platform.deepseek.com 等。"
      },
      {
        q: "应该选哪个模型？",
        a: "推荐 Gemini 2.5 Flash (免费)、DeepSeek V3 (便宜)、GPT-4o-mini (稳定)。模型越大分类越精准但更贵更慢。"
      },
      { q: "为什么报错 412？", a: "B站反爬限制。增大「写操作间隔」和「批量休息间隔」，或开启「自适应限速」。" },
      { q: "AI 并发数设多少？", a: "2-3 为稳定值。过高会触发 AI 服务商限频，过低则速度慢。" },
      {
        q: "处理 8000 个视频要多久？",
        a: "取决于 AI 服务商速度和并发数。Gemini Flash 约 5-15 分钟，DeepSeek 约 10-20 分钟。"
      },
      {
        q: "可以撤销移动操作吗？",
        a: "可以。整理完成后点击「撤销」按钮，将还原本次所有移动操作。撤销数据保存在本地。"
      },
      { q: "自适应限速是什么？", a: "当检测到 B 站 API 返回限频错误时，自动增加请求间隔，避免被封。" },
      { q: "备份功能怎么用？", a: "点击「备份」按钮导出当前所有收藏夹的视频列表为 JSON 文件。可用于灾难恢复。" },
      {
        q: "AI 测试是什么？",
        a: "Ctrl+点击「帮助」按钮可打开预览界面调试模式，使用假数据测试分类预览的 UI 和交互。"
      },
      { q: "暗色模式怎么用？", a: "点击面板顶部的月亮/太阳图标切换亮色/暗色主题。支持跟随系统设置。" },
      {
        q: "支持哪些 AI 服务商？",
        a: "Gemini、OpenAI、DeepSeek、硅基流动、通义千问、Moonshot、智谱、Groq、Anthropic、GitHub Models、OpenRouter、Ollama 本地、以及任何 OpenAI 兼容端点。"
      },
      {
        q: "Token 用量与费用估算",
        a: "处理过程中进度条下方实时显示 Token 消耗。完成后日志中会显示总用量和预估费用。"
      },
      { q: "增量整理是什么？", a: "开启后只处理上次整理之后新收藏的视频，避免重复处理已分类的视频。" },
      {
        q: "自定义模板怎么用？",
        a: "在 Prompt 编辑器中输入自定义规则，点击保存按钮可保存为预设。可设为默认预设。"
      },
      { q: "收藏夹健康检查", a: "点击「健康」按钮检测各收藏夹的失效视频数量、重复视频等问题。" },
      {
        q: "导出分类结果",
        a: "在预览界面底部点击复制/下载/导出按钮，可将分类结果以文本/JSON/Markdown 格式导出。"
      },
      { q: "如何合并相似分类？", a: "在预览界面点击「合并分类」按钮，先点选源分类，再点选目标分类即可合并。" },
      { q: "设置可以导出分享吗？", a: "暂不支持。设置保存在 Tampermonkey 的本地存储中。" },
      { q: "日志可以导出吗？", a: "可以。点击「日志」按钮导出为 .txt 文件。" },
      { q: "AI 请求失败会自动重试吗？", a: "会。单次请求失败后最多重试 2 次，间隔递增。" },
      { q: "重复视频可以一键清理吗？", a: "可以。点击「查重」按钮扫描后，选择要清理的重复项执行即可。" },
      { q: "失效视频归档功能", a: "失效视频会被自动检测并归入「失效视频归档」收藏夹，不会浪费 AI Token。" },
      {
        q: "低置信度筛选",
        a: "在预览界面点击「低置信度」按钮可筛选出 AI 分类置信度低于 60% 的视频，方便人工确认。"
      }
    ];
    {
      const icon = ($$anchor2) => {
        Circle_help($$anchor2, { size: 18 });
      };
      Modal($$anchor, {
        title: "帮助与常见问题",
        showFooter: false,
        width: "min(600px, 92vw)",
        onclose: () => {
          var _a2;
          return (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        },
        icon,
        children: ($$anchor2, $$slotProps) => {
          var div = root_2$1();
          var node_1 = child(div);
          each(node_1, 17, () => FAQ, index, ($$anchor3, item, idx) => {
            var fragment_2 = root_3();
            var button = first_child(fragment_2);
            let classes;
            var span = child(button);
            var span_1 = child(span);
            let classes_1;
            var text2 = sibling(span_1);
            var node_2 = sibling(span, 2);
            Chevron_right(node_2, { size: 14, class: "faq-chevron" });
            var div_1 = sibling(button, 2);
            set_style(div_1, "", {}, { height: "0", opacity: "0", overflow: "hidden" });
            var text_1 = child(div_1);
            bind_this(div_1, ($$value, idx2) => answerEls[idx2] = $$value, (idx2) => answerEls == null ? void 0 : answerEls[idx2], () => [idx]);
            template_effect(() => {
              classes = set_class(button, 1, "faq-item svelte-1lxq9cp", null, classes, { open: get(expandedIdx) === idx });
              classes_1 = set_class(span_1, 1, "faq-icon svelte-1lxq9cp", null, classes_1, { pulse: get(expandedIdx) === idx });
              set_text(text2, ` ${get(item).q ?? ""}`);
              set_text(text_1, get(item).a);
            });
            delegated("click", button, () => toggle(idx));
            append($$anchor3, fragment_2);
          });
          bind_this(div, ($$value) => set(helpBodyEl, $$value), () => get(helpBodyEl));
          append($$anchor2, div);
        },
        $$slots: { icon: true, default: true }
      });
    }
    pop();
  }
  delegate(["click"]);
  function createModalBridge() {
    const store = writable(null);
    function request(input) {
      const pending2 = get$1(store);
      if (pending2) pending2.reject(new Error("被新请求覆盖"));
      return new Promise((resolve2, reject2) => {
        store.set({ input, resolve: resolve2, reject: reject2 });
      });
    }
    function resolve(value) {
      const req = get$1(store);
      if (req) {
        store.set(null);
        req.resolve(value);
      }
    }
    function reject() {
      const req = get$1(store);
      if (req) {
        store.set(null);
        req.reject(new Error("用户取消"));
      }
    }
    return { subscribe: store.subscribe, request, resolve, reject };
  }
  const folderSelect = createModalBridge();
  const previewConfirm = createModalBridge();
  function requestPreviewConfirm(categories, videos, existingFolderNames = []) {
    return previewConfirm.request({ categories, videos, existingFolderNames });
  }
  function rejectAllModals() {
    folderSelect.reject();
    previewConfirm.reject();
  }
  function buildFormData(obj) {
    const entries = Object.entries(obj).map(([k, v]) => [k, String(v)]);
    return new URLSearchParams(entries).toString();
  }
  const RATE_LIMIT_CODES = [-412, -429];
  function isRateLimited(json) {
    return RATE_LIMIT_CODES.includes(json.code);
  }
  async function postBiliApi(url, formData, opts) {
    const { label, maxRetries = 3, baseWaitMs = 3e3 } = opts;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let res;
      try {
        const resp = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData
        });
        res = await resp.json();
      } catch (e) {
        if (attempt < maxRetries) {
          const waitMs = backoffMs(attempt, baseWaitMs);
          logs.add(
            `${label}网络异常，${(waitMs / 1e3).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
            "warning"
          );
          await sleep(waitMs);
          continue;
        }
        throw e;
      }
      if (res.code === 0) return res;
      if (isRateLimited(res)) {
        const waitMs = backoffMs(attempt, baseWaitMs);
        logs.add(
          `${label}被限流，等待 ${(waitMs / 1e3).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
          "warning"
        );
        await sleep(waitMs);
        continue;
      }
      return res;
    }
    throw new Error(`${label}重试 ${maxRetries} 次仍失败`);
  }
  async function fetchBiliJson(url, opts = {}) {
    const {
      timeoutMs = 3e4,
      maxRetries = 4,
      handleRateLimit = true
    } = opts;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          credentials: "include",
          signal: controller.signal
        });
        if (!handleRateLimit) {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (handleRateLimit && isRateLimited(json)) {
          const waitMs = backoffMs(attempt, 5e3);
          logs.add(
            `请求被限流，等待 ${(waitMs / 1e3).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
            "warning"
          );
          await sleep(waitMs);
          continue;
        }
        return json;
      } catch (e) {
        if (attempt < maxRetries) {
          const waitMs = handleRateLimit ? 2e3 * attempt : 1e3 * attempt;
          if (handleRateLimit) {
            logs.add(
              `请求异常，${(waitMs / 1e3).toFixed(0)}s 后重试 (${attempt}/${maxRetries})...`,
              "warning"
            );
          }
          await sleep(waitMs);
          continue;
        }
        throw e;
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(`请求 ${maxRetries} 次均失败`);
  }
  async function lightFetchJson(url, maxRetries = 3) {
    return fetchBiliJson(url, { timeoutMs: 15e3, maxRetries, handleRateLimit: false });
  }
  async function safeFetchJson(url, maxRetries = 4) {
    return fetchBiliJson(url, { timeoutMs: 3e4, maxRetries, handleRateLimit: true });
  }
  function getMidFromCookie() {
    const match = document.cookie.match(/DedeUserID=([^;]+)/);
    return match ? match[1] : "";
  }
  function getBiliData() {
    const csrfMatch = document.cookie.match(/bili_jct=([^;]+)/);
    return {
      mid: getMidFromCookie(),
      csrf: csrfMatch ? csrfMatch[1] : ""
    };
  }
  let _folderListCache = null;
  let _folderListCacheTime = 0;
  const FOLDER_CACHE_TTL = 3e5;
  async function getAllFoldersWithIds(biliData) {
    var _a2;
    const now2 = Date.now();
    if (_folderListCache && now2 - _folderListCacheTime < FOLDER_CACHE_TTL) {
      return _folderListCache;
    }
    const url = BILIBILI_URLS.folderList(biliData.mid);
    const res = await lightFetchJson(url);
    if (res.code === 0 && ((_a2 = res.data) == null ? void 0 : _a2.list)) {
      _folderListCache = res.data.list;
      _folderListCacheTime = now2;
      return res.data.list;
    }
    return [];
  }
  function invalidateFolderCache() {
    _folderListCache = null;
    _folderListCacheTime = 0;
  }
  async function getMyFolders(biliData) {
    const allFolders = await getAllFoldersWithIds(biliData);
    const folderMap = {};
    for (const f of allFolders) {
      if (f.title !== DEFAULT_FOLDER_TITLE) folderMap[f.title] = f.id;
    }
    return folderMap;
  }
  async function createFolder(title, biliData) {
    logs.add(`正在新建收藏夹：【${title}】`, "info");
    const res = await postBiliApi(
      BILIBILI_URLS.folderAdd,
      buildFormData({ title, privacy: 1, csrf: biliData.csrf }),
      { label: "创建收藏夹", maxRetries: 3, baseWaitMs: 3e3 }
    );
    if (res.code !== 0 || !res.data) {
      throw new Error(`新建失败: ${res.message}`);
    }
    if (_folderListCache) {
      _folderListCache.push({
        id: res.data.id,
        fid: res.data.fid ?? res.data.id,
        mid: Number(biliData.mid),
        title,
        media_count: 0
      });
    }
    await humanDelay(1e3);
    return res.data.id;
  }
  async function moveVideos(sourceMediaId, tarMediaId, resourcesStr, biliData) {
    try {
      const res = await postBiliApi(
        BILIBILI_URLS.resourceMove,
        buildFormData({
          src_media_id: sourceMediaId,
          tar_media_id: tarMediaId,
          mid: biliData.mid,
          resources: resourcesStr,
          csrf: biliData.csrf
        }),
        { label: "移动操作", maxRetries: 4, baseWaitMs: 5e3 }
      );
      if (res.code === 0) return true;
      logs.add(`移动失败 (code ${res.code}): ${res.message ?? "未知错误"}`, "warning");
      return false;
    } catch (e) {
      logs.add(`移动操作异常: ${getErrorMessage(e)}`, "error");
      return false;
    }
  }
  async function batchDeleteVideos(mediaId, resources, biliData) {
    try {
      const res = await postBiliApi(
        BILIBILI_URLS.resourceBatchDel,
        buildFormData({ media_id: mediaId, resources, csrf: biliData.csrf }),
        { label: "删除操作", maxRetries: 3, baseWaitMs: 3e3 }
      );
      return res.code === 0;
    } catch (e) {
      logs.add(`删除操作失败: ${getErrorMessage(e)}`, "error");
      return false;
    }
  }
  async function fetchAllVideos(mediaId, fetchDelay, cancelCheck, onProgress, maxVideos) {
    var _a2, _b2, _c2;
    const allVideos = [];
    let pn = 1;
    let displayPages = 0;
    let totalCount = 0;
    while (pn <= MAX_BILIBILI_PAGES) {
      if (cancelCheck()) break;
      if (maxVideos && allVideos.length >= maxVideos) break;
      logs.add(
        `正在读取第 ${pn}${displayPages > 0 ? ` / ${displayPages}` : ""} 页...`,
        "info"
      );
      const listUrl = BILIBILI_URLS.resourceList(mediaId, pn);
      let listRes;
      try {
        listRes = await safeFetchJson(listUrl);
      } catch (e) {
        logs.add(`读取出错: ${getErrorMessage(e)}`, "error");
        break;
      }
      if (listRes.code !== 0) {
        logs.add(`读取出错: ${listRes.message}`, "error");
        break;
      }
      if (pn === 1 && ((_a2 = listRes.data) == null ? void 0 : _a2.info)) {
        totalCount = listRes.data.info.media_count || 0;
        const effectiveCount = maxVideos ? Math.min(maxVideos, totalCount) : totalCount;
        displayPages = Math.ceil(effectiveCount / BILIBILI_PAGE_SIZE);
        logs.add(`收藏夹共 ${totalCount} 个视频${maxVideos ? `，限制 ${maxVideos} 个` : ""}，约 ${displayPages} 页`, "info");
      }
      const videos = ((_b2 = listRes.data) == null ? void 0 : _b2.medias) ?? [];
      allVideos.push(...videos);
      if (onProgress) {
        const effectiveTotal = maxVideos ? Math.min(maxVideos, totalCount || allVideos.length) : totalCount || allVideos.length;
        onProgress(Math.min(allVideos.length, effectiveTotal), effectiveTotal);
      }
      if (!((_c2 = listRes.data) == null ? void 0 : _c2.has_more) || videos.length === 0) break;
      pn++;
      await humanDelay(fetchDelay);
    }
    return maxVideos ? allVideos.slice(0, maxVideos) : allVideos;
  }
  async function scanAllFolderVideos(opts) {
    const {
      biliData,
      fetchDelay,
      cancelCheck,
      fetchFn = safeFetchJson,
      onVideo,
      logPrefix = "扫描"
    } = opts;
    const allFolders = await getAllFoldersWithIds(biliData);
    logs.add(`共 ${allFolders.length} 个收藏夹，开始逐个${logPrefix}...`, "info");
    const results = [];
    let totalScanned = 0;
    for (let fi = 0; fi < allFolders.length; fi++) {
      if (cancelCheck()) break;
      const folder = allFolders[fi];
      logs.add(`${logPrefix} [${fi + 1}/${allFolders.length}] ${folder.title}...`, "info");
      let pn = 1;
      while (pn <= MAX_BILIBILI_PAGES) {
        if (cancelCheck()) break;
        try {
          const res = await fetchFn(
            BILIBILI_URLS.resourceList(folder.id, pn)
          );
          if (res.code !== 0 || !res.data) break;
          const medias = res.data.medias ?? [];
          if (medias.length === 0) break;
          for (const v of medias) {
            totalScanned++;
            const item = onVideo(v, folder);
            if (item !== void 0) results.push(item);
          }
          if (!res.data.has_more) break;
          pn++;
          await humanDelay(fetchDelay);
        } catch (e) {
          logs.add(
            `${logPrefix} ${folder.title} 出错: ${getErrorMessage(e)}，跳过`,
            "warning"
          );
          break;
        }
      }
      if (fi < allFolders.length - 1) await humanDelay(fetchDelay);
    }
    return { results, totalScanned };
  }
  async function withRunningState(fn, opts = {}) {
    const { trackCancel = false } = opts;
    isRunning.set(true);
    if (trackCancel) cancelRequested.set(false);
    try {
      return await fn();
    } finally {
      isRunning.set(false);
      if (trackCancel) cancelRequested.set(false);
    }
  }
  const UNDO_KEY = "bfao_undoHistory";
  function isValidMove(val) {
    if (typeof val !== "object" || val === null) return false;
    const m = val;
    return typeof m.fromMediaId === "number" && typeof m.toMediaId === "number" && typeof m.resources === "string" && m.resources.length > 0;
  }
  function isValidUndoRecord(val) {
    if (typeof val !== "object" || val === null) return false;
    const obj = val;
    return Array.isArray(obj.moves) && obj.moves.length > 0 && obj.moves.every(isValidMove);
  }
  function loadUndoHistory() {
    try {
      const raw = gmGetValue(UNDO_KEY, null);
      if (typeof raw === "string") {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(isValidUndoRecord);
      }
      const oldRaw = gmGetValue("bfao_undoData", null);
      if (typeof oldRaw === "string") {
        const oldData = JSON.parse(oldRaw);
        if (isValidUndoRecord(oldData)) return [oldData];
      }
      return [];
    } catch {
      return [];
    }
  }
  function saveUndoData(record) {
    try {
      const history = loadUndoHistory();
      history.unshift(record);
      gmSetValue(UNDO_KEY, JSON.stringify(history.slice(0, MAX_UNDO_HISTORY)));
      gmSetValue("bfao_undoData", JSON.stringify(record));
    } catch (e) {
      logs.add(`保存撤销数据失败: ${getErrorMessage(e)}`, "warning");
    }
  }
  function clearUndoRecord(index2) {
    try {
      const history = loadUndoHistory();
      if (index2 >= 0 && index2 < history.length) {
        history.splice(index2, 1);
      }
      gmSetValue(UNDO_KEY, JSON.stringify(history));
      gmSetValue("bfao_undoData", history.length > 0 ? JSON.stringify(history[0]) : null);
    } catch (e) {
      logs.add(`清除撤销数据失败: ${getErrorMessage(e)}`, "warning");
    }
  }
  async function undoOperation(selectedIndex, biliData, writeDelay) {
    var _a2;
    const history = loadUndoHistory();
    const undo = history[selectedIndex];
    if (!((_a2 = undo == null ? void 0 : undo.moves) == null ? void 0 : _a2.length)) {
      logs.add("撤销记录数据异常", "error");
      return;
    }
    logs.add("正在撤销操作...", "info");
    await withRunningState(async () => {
      let restored = 0;
      try {
        for (let i = 0; i < undo.moves.length; i++) {
          if (get$1(cancelRequested)) {
            logs.add("用户已取消撤销", "warning");
            break;
          }
          const move2 = undo.moves[i];
          logs.add(`[${i + 1}/${undo.moves.length}] 移回 ${move2.count} 个视频到原收藏夹...`, "info");
          const ok = await moveVideos(move2.toMediaId, move2.fromMediaId, move2.resources, biliData);
          if (ok) {
            restored += move2.count;
          } else {
            logs.add(`第 ${i + 1} 批移回失败，跳过`, "warning");
          }
          await humanDelay(writeDelay);
        }
        if (restored === 0 && !get$1(cancelRequested)) {
          logs.add("撤销失败：所有移动操作均未成功，撤销记录已保留", "error");
        } else {
          logs.add(`撤销完成！共恢复 ${restored} 个视频。请刷新页面。`, "success");
          clearUndoRecord(selectedIndex);
        }
        invalidateFolderCache();
      } catch (err) {
        logs.add(`撤销失败: ${getErrorMessage(err)}`, "error");
      }
    }, { trackCancel: true });
  }
  const HISTORY_KEY = "bfao_history";
  const MAX_HISTORY = 20;
  function loadHistory() {
    try {
      const raw = gmGetValue(HISTORY_KEY, "[]");
      const parsed = JSON.parse(typeof raw === "string" ? raw : "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  function saveHistoryEntry(entry) {
    const history = loadHistory();
    history.unshift(entry);
    gmSetValue(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }
  function clearHistory() {
    gmSetValue(HISTORY_KEY, "[]");
  }
  function buildSystemPrompt(existingFolderNames, customPrompt) {
    const existingPart = existingFolderNames.length > 0 ? `

【已有收藏夹列表】
${existingFolderNames.map((n) => `• ${n}`).join("\n")}

必须优先使用以上已有收藏夹名！只有当视频完全不适合任何已有分类时，才可新建。` : "";
    const customPart = customPrompt ? `

【用户自定义规则（最高优先级）】
${customPrompt}` : "";
    return `你是逻辑严密的B站收藏夹视频分类专家。

【任务】
将以下视频分类到合适的收藏夹。

【规则】
1. 每个视频必须且只能属于一个分类
2. 输出纯JSON，格式：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字,"conf":置信度0-1}]}}
3. conf 表示分类置信度，1.0=非常确定，0.5=不太确定
4. 绝不遗漏任何视频${existingPart}${customPart}`.trim();
  }
  function groupBy(items, keyFn) {
    const result = new Map();
    for (const item of items) {
      const key = keyFn(item);
      let group = result.get(key);
      if (!group) {
        group = [];
        result.set(key, group);
      }
      group.push(item);
    }
    return result;
  }
  async function resolveSourceFolders(biliData) {
    const allFolders = await getAllFoldersWithIds(biliData);
    logs.add("请在弹出的面板中选择要整理的收藏夹...", "info");
    const ids = await folderSelect.request(allFolders);
    if (ids.length === 0) throw new Error("未选择任何收藏夹");
    return ids;
  }
  async function fetchSourceVideos(sourceMediaIds, settings2, isCancelled) {
    const allVideos = [];
    const videoSourceMap = new Map();
    const maxVideos = settings2.limitEnabled ? settings2.limitCount : void 0;
    let previouslyFetched = 0;
    for (const mediaId of sourceMediaIds) {
      if (isCancelled()) break;
      if (maxVideos && allVideos.length >= maxVideos) break;
      const remaining = maxVideos ? maxVideos - allVideos.length : void 0;
      logs.add(`正在抓取收藏夹 ${mediaId}...`, "info");
      const videos = await fetchAllVideos(
        mediaId,
        settings2.fetchDelay,
        isCancelled,
        (fetchedInFolder, totalInFolder) => {
          updateProgress(
            "fetch",
            previouslyFetched + fetchedInFolder,
            previouslyFetched + totalInFolder
          );
        },
        remaining
      );
      let validVideos = videos;
      if (settings2.incrementalMode) {
        const lastRunTime = gmGetValue("bfao_lastRunTime", 0);
        if (lastRunTime > 0) {
          const before = validVideos.length;
          validVideos = validVideos.filter((v) => v.fav_time > lastRunTime);
          logs.add(`增量模式：${before} → ${validVideos.length} 个新视频`, "info");
        }
      }
      for (const v of validVideos) {
        videoSourceMap.set(v.id, mediaId);
      }
      allVideos.push(...validVideos);
      previouslyFetched = allVideos.length;
    }
    updateProgress("fetch", allVideos.length, allVideos.length);
    return { allVideos, videoSourceMap };
  }
  async function classifyWithAI(allVideos, existingFolderNames, settings2, isCancelled) {
    const allCategories = {};
    const systemPrompt = buildSystemPrompt(existingFolderNames, settings2.lastPrompt);
    const concurrency = Math.max(1, Math.min(10, settings2.aiConcurrency));
    const chunkSize = Math.max(1, settings2.aiChunkSize);
    const limiter = createConcurrencyLimiter(concurrency);
    const chunks = [];
    for (let i = 0; i < allVideos.length; i += chunkSize) {
      chunks.push(allVideos.slice(i, i + chunkSize));
    }
    const totalAiCalls = chunks.length;
    let aiCompleted = 0;
    let aiFailed = 0;
    updateProgress("ai", 0, totalAiCalls);
    logs.add(`分为 ${totalAiCalls} 批次，并发 ${concurrency}`, "info");
    const aiPromises = [];
    for (let ci = 0; ci < chunks.length; ci++) {
      if (isCancelled()) break;
      const chunk = chunks[ci];
      const idx = ci + 1;
      const videoData = chunk.map((v) => {
        var _a2, _b2;
        return {
          id: v.id,
          type: v.type ?? DEFAULT_VIDEO_TYPE,
          title: v.title,
          up: ((_a2 = v.upper) == null ? void 0 : _a2.name) ?? "",
          play: ((_b2 = v.cnt_info) == null ? void 0 : _b2.play) ?? 0,
          duration: v.duration ?? 0
        };
      });
      const combinedPrompt = {
        system: systemPrompt,
        user: `以下是待处理的 ${chunk.length} 个视频：
${JSON.stringify(videoData)}`
      };
      const p = limiter.run(async () => {
        try {
          logs.add(`AI 批次 ${idx}/${totalAiCalls} 处理中...`, "info");
          const aiResult = await callAI(combinedPrompt, settings2);
          if ((aiResult == null ? void 0 : aiResult.categories) && Object.keys(aiResult.categories).length > 0) {
            for (const [catName, vids] of Object.entries(aiResult.categories)) {
              if (!allCategories[catName]) allCategories[catName] = [];
              allCategories[catName].push(...vids);
            }
          } else {
            logs.add(`AI 批次 ${idx} 返回空分类结果 (${chunk.length} 个视频未被分类)`, "warning");
          }
          aiCompleted++;
          updateProgress("ai", aiCompleted, totalAiCalls);
          logs.add(`AI 批次 ${idx} 完成`, "success");
        } catch (err) {
          aiCompleted++;
          aiFailed++;
          updateProgress("ai", aiCompleted, totalAiCalls);
          logs.add(`AI 批次 ${idx} 失败: ${getErrorMessage(err)}`, "error");
        }
      });
      aiPromises.push(p);
    }
    await Promise.all(aiPromises);
    if (aiFailed > 0) {
      logs.add(`AI 分类汇总: ${totalAiCalls - aiFailed}/${totalAiCalls} 批次成功，${aiFailed} 批次失败`, aiFailed === totalAiCalls ? "error" : "warning");
    }
    return allCategories;
  }
  function postProcessCategories(allCategories, allVideos, existingFoldersMap) {
    const assignedIds = new Set();
    for (const catName of Object.keys(allCategories)) {
      const vids = allCategories[catName];
      const seen = new Set();
      allCategories[catName] = vids.filter((v) => {
        const key = `${v.id}:${v.type}`;
        if (seen.has(key) || assignedIds.has(key)) return false;
        seen.add(key);
        assignedIds.add(key);
        return true;
      });
    }
    const missedVideos = allVideos.filter(
      (v) => !assignedIds.has(`${v.id}:${v.type}`)
    );
    if (missedVideos.length > 0) {
      logs.add(`发现 ${missedVideos.length} 个遗漏视频，归入「未分类」`, "warning");
      allCategories[UNCATEGORIZED_FOLDER] = missedVideos.map((v) => ({
        id: v.id,
        type: v.type,
        conf: 0.3
      }));
    }
    const tinyCats = Object.entries(allCategories).filter(
      ([name, vids]) => vids.length === 1 && !existingFoldersMap[name] && name !== UNCATEGORIZED_FOLDER
    );
    if (tinyCats.length >= 3) {
      logs.add(`合并 ${tinyCats.length} 个碎片分类`, "info");
      if (!allCategories[UNCATEGORIZED_FOLDER]) allCategories[UNCATEGORIZED_FOLDER] = [];
      for (const [name, vids] of tinyCats) {
        allCategories[UNCATEGORIZED_FOLDER].push(...vids);
        delete allCategories[name];
      }
    }
    return allCategories;
  }
  async function moveVideosToFolders(allCategories, existingFoldersMap, videoSourceMap, sourceMediaIds, allVideos, settings2, biliData, isCancelled) {
    invalidateFolderCache();
    const entries = Object.entries(allCategories);
    const totalMoveVideos = Object.values(allCategories).reduce((s, v) => s + v.length, 0);
    let moveIdx = 0;
    let failedCount = 0;
    const undoMoves = [];
    updateProgress("move", 0, totalMoveVideos);
    for (const [categoryName, vids] of entries) {
      if (isCancelled()) break;
      let targetFolderId = existingFoldersMap[categoryName];
      if (!targetFolderId) {
        const fuzzyKey = Object.keys(existingFoldersMap).find(
          (k) => k.trim().toLowerCase() === categoryName.trim().toLowerCase()
        );
        if (fuzzyKey) targetFolderId = existingFoldersMap[fuzzyKey];
      }
      if (!targetFolderId) {
        try {
          targetFolderId = await createFolder(categoryName, biliData);
          existingFoldersMap[categoryName] = targetFolderId;
        } catch (e) {
          logs.add(`创建收藏夹「${categoryName}」失败: ${getErrorMessage(e)}`, "error");
          continue;
        }
      }
      const moveChunk = Math.max(1, settings2.moveChunkSize);
      for (let i = 0; i < vids.length; i += moveChunk) {
        if (isCancelled()) break;
        const chunk = vids.slice(i, i + moveChunk);
        const bySource = groupBy(chunk, (v) => videoSourceMap.get(v.id) ?? sourceMediaIds[0]);
        for (const [from, subChunk] of bySource) {
          const resourcesStr = subChunk.map((v) => `${v.id}:${v.type}`).join(",");
          const success = await moveVideos(from, targetFolderId, resourcesStr, biliData);
          if (success) {
            moveIdx += subChunk.length;
            updateProgress("move", moveIdx, allVideos.length);
            undoMoves.push({
              fromMediaId: from,
              toMediaId: targetFolderId,
              resources: resourcesStr,
              count: subChunk.length
            });
          } else {
            failedCount += subChunk.length;
            logs.add(
              `移动到「${categoryName}」部分失败 (${subChunk.length} 个视频)`,
              "warning"
            );
          }
          await humanDelay(settings2.writeDelay);
        }
      }
    }
    return { undoMoves, failedCount };
  }
  function emitFinalReport(allVideos, allCategories, sourceMediaIds, undoMoves, failedCount, settings2) {
    const elapsed = Date.now() - get$1(progressStartTime);
    const elapsedStr = elapsed > 6e4 ? `${(elapsed / 6e4).toFixed(1)} 分钟` : `${(elapsed / 1e3).toFixed(1)} 秒`;
    logs.add(
      `整理完成！共处理 ${allVideos.length} 个视频，${Object.keys(allCategories).length} 个分类，耗时 ${elapsedStr}`,
      "success"
    );
    if (failedCount > 0) {
      logs.add(`${failedCount} 个视频移动失败，请检查日志`, "warning");
    }
    const usage = get$1(tokenUsage);
    if (usage.totalTokens > 0) {
      logs.add(
        `Token 用量: ${formatTokenCount(usage.promptTokens)} 输入 + ${formatTokenCount(usage.completionTokens)} 输出`,
        "info"
      );
      const cost = estimateCost(settings2.modelName);
      if (cost) logs.add(`预估费用: ${cost}`, "info");
    }
    if (undoMoves.length > 0) {
      const { time, timeLocal } = formatNow();
      saveUndoData({
        time,
        timeLocal,
        totalVideos: allVideos.length,
        totalCategories: Object.keys(allCategories).length,
        sourceMediaIds,
        moves: undoMoves
      });
    }
    saveHistoryEntry({
      time: formatNow().timeLocal,
      videoCount: allVideos.length,
      categoryCount: Object.keys(allCategories).length,
      categories: Object.keys(allCategories).join(", ")
    });
    gmSetValue("bfao_lastRunTime", Math.floor(Date.now() / 1e3));
  }
  async function startProcess(settings2, biliData) {
    if (get$1(isRunning)) {
      logs.add("已有整理任务在运行中", "warning");
      return;
    }
    isRunning.set(true);
    cancelRequested.set(false);
    resetTokenUsage();
    progressStartTime.set(Date.now());
    const isCancelled = () => get$1(cancelRequested);
    try {
      const sourceMediaIds = await resolveSourceFolders(biliData);
      logs.add(`开始整理 ${sourceMediaIds.length} 个收藏夹`, "info");
      const existingFoldersMap = await getMyFolders(biliData);
      const existingFolderNames = Object.keys(existingFoldersMap);
      logs.add(`已有 ${existingFolderNames.length} 个收藏夹`, "info");
      const { allVideos, videoSourceMap } = await fetchSourceVideos(
        sourceMediaIds,
        settings2,
        isCancelled
      );
      if (isCancelled()) {
        logs.add("用户取消了操作", "warning");
        return;
      }
      if (allVideos.length === 0) {
        logs.add("没有需要整理的视频", "info");
        return;
      }
      const videosToProcess = settings2.limitEnabled && allVideos.length > settings2.limitCount ? allVideos.slice(0, settings2.limitCount) : allVideos;
      const deadVideos = videosToProcess.filter((v) => isDeadVideo(v));
      const liveVideos = videosToProcess.filter((v) => !isDeadVideo(v));
      if (deadVideos.length > 0) {
        logs.add(`检测到 ${deadVideos.length} 个失效视频，将自动归档`, "info");
      }
      logs.add(`共 ${liveVideos.length} 个视频待分类`, "success");
      let allCategories = await classifyWithAI(
        liveVideos,
        existingFolderNames,
        settings2,
        isCancelled
      );
      if (deadVideos.length > 0) {
        allCategories[DEAD_ARCHIVE_FOLDER] = [
          ...allCategories[DEAD_ARCHIVE_FOLDER] ?? [],
          ...deadVideos.map((v) => ({ id: v.id, type: v.type }))
        ];
      }
      if (isCancelled()) {
        logs.add("用户取消了操作", "warning");
        return;
      }
      if (Object.keys(allCategories).length === 0) {
        logs.add("AI 未返回任何分类结果", "error");
        return;
      }
      allCategories = postProcessCategories(allCategories, liveVideos, existingFoldersMap);
      logs.add(
        `AI 分类完成: ${Object.keys(allCategories).length} 个分类，${videosToProcess.length} 个视频`,
        "success"
      );
      logs.add(
        `分类结果: ${Object.entries(allCategories).map(([k, v]) => `${k}(${v.length})`).join(", ")}`,
        "info"
      );
      logs.add("请在弹出的面板中确认分类结果...", "info");
      allCategories = await requestPreviewConfirm(allCategories, videosToProcess, existingFolderNames);
      if (isCancelled()) throw new Error("用户取消操作");
      const { undoMoves, failedCount } = await moveVideosToFolders(
        allCategories,
        existingFoldersMap,
        videoSourceMap,
        sourceMediaIds,
        allVideos,
        settings2,
        biliData,
        isCancelled
      );
      emitFinalReport(allVideos, allCategories, sourceMediaIds, undoMoves, failedCount, settings2);
    } finally {
      isRunning.set(false);
      cancelRequested.set(false);
      resetProgress();
    }
  }
  async function backupFavorites(biliData, fetchDelay) {
    logs.add("正在备份收藏夹结构...", "info");
    return withRunningState(async () => {
      try {
        const { results: videoEntries } = await scanAllFolderVideos({
          biliData,
          fetchDelay,
          cancelCheck: () => get$1(cancelRequested),
          fetchFn: lightFetchJson,
          logPrefix: "备份",
          onVideo: (v, folder) => ({
            id: v.id,
            type: v.type ?? DEFAULT_VIDEO_TYPE,
            title: v.title,
            bvid: v.bvid || "",
            folderId: folder.id,
            folderTitle: folder.title,
            folderMediaCount: folder.media_count
          })
        });
        if (get$1(cancelRequested)) {
          logs.add("用户取消了备份", "warning");
          return null;
        }
        const folderMap = new Map();
        for (const entry of videoEntries) {
          let folderData = folderMap.get(entry.folderId);
          if (!folderData) {
            folderData = {
              id: entry.folderId,
              title: entry.folderTitle,
              media_count: entry.folderMediaCount,
              videos: []
            };
            folderMap.set(entry.folderId, folderData);
          }
          folderData.videos.push({
            id: entry.id,
            type: entry.type,
            title: entry.title,
            bvid: entry.bvid
          });
        }
        const { time, timeLocal } = formatNow();
        const backup = {
          version: "1.0",
          time,
          timeLocal,
          mid: biliData.mid,
          folders: Array.from(folderMap.values())
        };
        const totalVideos = backup.folders.reduce((s, f) => s + f.videos.length, 0);
        logs.add(`备份完成！${backup.folders.length} 个收藏夹，${totalVideos} 个视频`, "success");
        return backup;
      } catch (err) {
        logs.add(`备份失败: ${getErrorMessage(err)}`, "error");
        return null;
      }
    });
  }
  function downloadBackupFile(backup) {
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const ts = ( new Date()).toISOString().slice(0, 16).replace(/:/g, "-");
    triggerDownload(blob, `bilibili-favorites-backup-${ts}.json`);
  }
  async function scanDeadVideos(biliData, fetchDelay) {
    logs.add("正在扫描所有收藏夹中的失效视频...", "info");
    const { results: deadVideos, totalScanned } = await scanAllFolderVideos({
      biliData,
      fetchDelay,
      cancelCheck: () => get$1(cancelRequested),
      logPrefix: "扫描",
      onVideo: (v, folder) => {
        if (isDeadVideo(v)) {
          return {
            id: v.id,
            type: v.type ?? DEFAULT_VIDEO_TYPE,
            title: v.title || `ID:${v.id}`,
            folderId: folder.id,
            folderTitle: folder.title
          };
        }
        return void 0;
      }
    });
    logs.add(`扫描完成，共扫描 ${totalScanned} 个视频`, "info");
    return deadVideos;
  }
  async function archiveDeadVideos(deadVideos, biliData, moveChunkSize, writeDelay) {
    var _a2;
    const isCancelled = () => get$1(cancelRequested);
    const existingFolders = await getMyFolders(biliData);
    let targetFolderId = existingFolders[DEAD_ARCHIVE_FOLDER];
    if (!targetFolderId) {
      targetFolderId = await createFolder(DEAD_ARCHIVE_FOLDER, biliData);
      logs.add(`已创建专用收藏夹「${DEAD_ARCHIVE_FOLDER}」`, "info");
      await humanDelay(writeDelay);
    }
    const bySource = groupBy(deadVideos, (v) => v.folderId);
    let moved = 0;
    for (const [srcId, vids] of bySource) {
      if (isCancelled()) break;
      let folderMoved = 0;
      for (let i = 0; i < vids.length; i += moveChunkSize) {
        if (isCancelled()) break;
        const chunk = vids.slice(i, i + moveChunkSize);
        const resourcesStr = chunk.map((v) => `${v.id}:${v.type}`).join(",");
        const success = await moveVideos(srcId, targetFolderId, resourcesStr, biliData);
        if (success) {
          moved += chunk.length;
          folderMoved += chunk.length;
        }
        await humanDelay(writeDelay);
      }
      logs.add(`已从「${((_a2 = vids[0]) == null ? void 0 : _a2.folderTitle) || srcId}」移动 ${folderMoved}/${vids.length} 个失效视频`, "info");
    }
    return moved;
  }
  async function deleteDeadVideos(deadVideos, biliData, writeDelay) {
    var _a2;
    const isCancelled = () => get$1(cancelRequested);
    const bySource = groupBy(deadVideos, (v) => v.folderId);
    const DELETE_CHUNK_SIZE = 50;
    let deleted = 0;
    for (const [srcId, vids] of bySource) {
      if (isCancelled()) break;
      let folderDeleted = 0;
      for (let i = 0; i < vids.length; i += DELETE_CHUNK_SIZE) {
        if (isCancelled()) break;
        const chunk = vids.slice(i, i + DELETE_CHUNK_SIZE);
        const resources = chunk.map((v) => `${v.id}:${v.type}`).join(",");
        const success = await batchDeleteVideos(srcId, resources, biliData);
        if (success) {
          deleted += chunk.length;
          folderDeleted += chunk.length;
        }
        await humanDelay(writeDelay);
      }
      logs.add(`已从「${((_a2 = vids[0]) == null ? void 0 : _a2.folderTitle) || srcId}」删除 ${folderDeleted}/${vids.length} 个失效视频`, "info");
    }
    return deleted;
  }
  async function scanDuplicates(biliData, fetchDelay) {
    logs.add("正在扫描所有收藏夹...", "info");
    const videoFolderMap = {};
    const { totalScanned } = await scanAllFolderVideos({
      biliData,
      fetchDelay,
      cancelCheck: () => get$1(cancelRequested),
      logPrefix: "扫描",
      onVideo: (v, folder) => {
        if (!videoFolderMap[v.id]) videoFolderMap[v.id] = [];
        videoFolderMap[v.id].push({
          folderTitle: folder.title,
          folderId: folder.id,
          videoTitle: v.title,
          videoType: v.type ?? DEFAULT_VIDEO_TYPE
        });
        return void 0;
      }
    });
    logs.add(`扫描完成，共收集 ${totalScanned} 条视频记录`, "info");
    const duplicates = [];
    for (const [vidStr, entries] of Object.entries(videoFolderMap)) {
      if (entries.length >= 2) {
        duplicates.push({
          id: Number(vidStr),
          type: entries[0].videoType,
          title: entries[0].videoTitle,
          folders: entries.map((e) => e.folderTitle),
          folderIds: entries.map((e) => e.folderId)
        });
      }
    }
    return duplicates;
  }
  async function deduplicateVideos(duplicates, biliData, writeDelay) {
    const isCancelled = () => get$1(cancelRequested);
    let removed = 0;
    for (let i = 0; i < duplicates.length; i++) {
      if (isCancelled()) break;
      const d = duplicates[i];
      for (let fi = 1; fi < d.folderIds.length; fi++) {
        const resource = `${d.id}:${d.type}`;
        try {
          const success = await batchDeleteVideos(d.folderIds[fi], resource, biliData);
          if (success) removed++;
        } catch (err) {
          logs.add(`删除副本失败 (视频 ${d.id}, 收藏夹 ${d.folderIds[fi]}): ${getErrorMessage(err)}`, "warning");
        }
        await humanDelay(writeDelay);
      }
      if ((i + 1) % 10 === 0 || i === duplicates.length - 1) {
        logs.add(`去重进度：${i + 1}/${duplicates.length}（已删除 ${removed} 个副本）`, "info");
      }
    }
    return removed;
  }
  function ensureBiliData() {
    const biliData = getBiliData();
    if (!biliData.mid || !biliData.csrf) {
      logs.add("请先登录 B站", "error");
      return null;
    }
    return biliData;
  }
  async function withAuthAndRunning(fallback, action2, opts) {
    const biliData = ensureBiliData();
    if (!biliData) return fallback;
    const s = get$1(settings);
    return withRunningState(async () => {
      try {
        return await action2(biliData, s);
      } catch (e) {
        logs.add(`操作失败: ${getErrorMessage(e)}`, "error");
        return fallback;
      }
    }, opts);
  }
  async function handleStart(callbacks) {
    const s = get$1(settings);
    if (!s.apiKey && s.provider !== "ollama") {
      callbacks.openSettings();
      logs.add("请先配置 API Key", "warning");
      return;
    }
    const biliData = ensureBiliData();
    if (!biliData) return;
    try {
      await startProcess(s, biliData);
    } catch (e) {
      logs.add(`整理流程出错: ${getErrorMessage(e)}`, "error");
    }
  }
  async function handleCleanDead(state2) {
    return withAuthAndRunning(state2, async (biliData, s) => {
      const deadVideos = await scanDeadVideos(biliData, s.fetchDelay);
      if (deadVideos.length === 0) {
        logs.add("没有发现失效视频！收藏夹很健康！", "success");
        return { ...state2, deadVideos, showDeadResult: false };
      }
      logs.add(`发现 ${deadVideos.length} 个失效视频`, "warning");
      return { ...state2, deadVideos, showDeadResult: true };
    }, { trackCancel: true });
  }
  async function handleArchiveDead(deadVideos) {
    return withAuthAndRunning(false, async (biliData, s) => {
      const moved = await archiveDeadVideos(deadVideos, biliData, s.moveChunkSize, s.writeDelay);
      logs.add(`完成！共 ${moved} 个失效视频已归档。请刷新页面。`, "success");
      return true;
    });
  }
  async function handleDeleteDead(deadVideos) {
    return withAuthAndRunning(false, async (biliData, s) => {
      const deleted = await deleteDeadVideos(deadVideos, biliData, s.writeDelay);
      logs.add(`删除完成！共删除 ${deleted} 个失效视频。请刷新页面。`, "success");
      return true;
    });
  }
  async function handleFindDups(state2) {
    return withAuthAndRunning(state2, async (biliData, s) => {
      const duplicates = await scanDuplicates(biliData, s.fetchDelay);
      if (duplicates.length === 0) {
        logs.add("没有发现重复视频！", "success");
        return { ...state2, duplicates, showDupResult: false };
      }
      logs.add(`发现 ${duplicates.length} 个重复视频`, "warning");
      return { ...state2, duplicates, showDupResult: true };
    }, { trackCancel: true });
  }
  async function handleDedup(duplicates) {
    return withAuthAndRunning(false, async (biliData, s) => {
      const removed = await deduplicateVideos(duplicates, biliData, s.writeDelay);
      logs.add(`去重完成！共删除 ${removed} 个重复副本。请刷新页面。`, "success");
      return true;
    }, { trackCancel: true });
  }
  async function handleUndoConfirm(index2) {
    const biliData = ensureBiliData();
    if (!biliData) return;
    const s = get$1(settings);
    await undoOperation(index2, biliData, s.writeDelay);
  }
  async function handleBackup() {
    return withAuthAndRunning(void 0, async (biliData, s) => {
      const backup = await backupFavorites(biliData, s.fetchDelay);
      if (backup) {
        downloadBackupFile(backup);
        logs.add("备份文件已下载", "success");
      }
    });
  }
  async function handleStats(mode) {
    logs.add("正在统计收藏夹信息...", "info");
    return withAuthAndRunning(null, async (biliData) => {
      const statsFolders = await getAllFoldersWithIds(biliData);
      const statsTotalVideos = statsFolders.reduce((s, f) => s + (f.media_count || 0), 0);
      logs.add(`统计完成：${statsFolders.length} 个收藏夹，${statsTotalVideos} 个视频`, "success");
      return {
        showStats: true,
        statsMode: mode,
        statsFolders,
        statsTotalVideos,
        statsDeadCount: 0
      };
    });
  }
  function handleHistoryClear() {
    clearHistory();
    logs.add("整理历史已清空", "success");
  }
  const modals = proxy({
    showDeadResult: false,
    deadVideos: [],
    deadProcessing: false,
    showDupResult: false,
    duplicates: [],
    dupProcessing: false,
    showUndo: false,
    showHistory: false,
    showStats: false,
    statsMode: "stats",
    statsFolders: [],
    statsTotalVideos: 0,
    statsDeadCount: 0,
    showHelp: false
  });
  async function onCleanDead() {
    const result = await handleCleanDead({
      deadVideos: modals.deadVideos,
      showDeadResult: modals.showDeadResult,
      deadProcessing: modals.deadProcessing
    });
    modals.deadVideos = result.deadVideos;
    modals.showDeadResult = result.showDeadResult;
  }
  async function onArchiveDead() {
    modals.deadProcessing = true;
    const ok = await handleArchiveDead(modals.deadVideos);
    modals.deadProcessing = false;
    if (ok) modals.showDeadResult = false;
  }
  async function onDeleteDead() {
    modals.deadProcessing = true;
    const ok = await handleDeleteDead(modals.deadVideos);
    modals.deadProcessing = false;
    if (ok) modals.showDeadResult = false;
  }
  async function onFindDups() {
    const result = await handleFindDups({
      duplicates: modals.duplicates,
      showDupResult: modals.showDupResult,
      dupProcessing: modals.dupProcessing
    });
    modals.duplicates = result.duplicates;
    modals.showDupResult = result.showDupResult;
  }
  async function onDedup() {
    modals.dupProcessing = true;
    const ok = await handleDedup(modals.duplicates);
    modals.dupProcessing = false;
    if (ok) modals.showDupResult = false;
  }
  function openUndo() {
    modals.showUndo = true;
  }
  function closeUndo() {
    modals.showUndo = false;
  }
  async function onUndoConfirm(index2) {
    modals.showUndo = false;
    await handleUndoConfirm(index2);
  }
  async function onStatsClick(mode) {
    const result = await handleStats(mode);
    if (result) {
      modals.showStats = result.showStats;
      modals.statsMode = result.statsMode;
      modals.statsFolders = result.statsFolders;
      modals.statsTotalVideos = result.statsTotalVideos;
      modals.statsDeadCount = result.statsDeadCount;
    }
  }
  function onHistoryClear() {
    handleHistoryClear();
    modals.showHistory = false;
  }
  function openHelp() {
    modals.showHelp = true;
  }
  function closeHelp() {
    modals.showHelp = false;
  }
  function openHistory() {
    modals.showHistory = true;
  }
  function closeHistory() {
    modals.showHistory = false;
  }
  function closeDeadResult() {
    modals.showDeadResult = false;
  }
  function closeDupResult() {
    modals.showDupResult = false;
  }
  function closeStats() {
    modals.showStats = false;
  }
  var root$3 = from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
  function PanelModals($$anchor, $$props) {
    push($$props, false);
    const $folderSelect = () => store_get(folderSelect, "$folderSelect", $$stores);
    const $previewConfirm = () => store_get(previewConfirm, "$previewConfirm", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    init();
    var fragment = root$3();
    var node = first_child(fragment);
    {
      var consequent = ($$anchor2) => {
        DeadVideosResult($$anchor2, {
          get deadVideos() {
            return modals.deadVideos;
          },
          get processing() {
            return modals.deadProcessing;
          },
          get onarchive() {
            return onArchiveDead;
          },
          get ondelete() {
            return onDeleteDead;
          },
          get onclose() {
            return closeDeadResult;
          }
        });
      };
      if_block(node, ($$render) => {
        if (modals.showDeadResult) $$render(consequent);
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent_1 = ($$anchor2) => {
        DuplicatesResult($$anchor2, {
          get duplicates() {
            return modals.duplicates;
          },
          get processing() {
            return modals.dupProcessing;
          },
          get ondedup() {
            return onDedup;
          },
          get onclose() {
            return closeDupResult;
          }
        });
      };
      if_block(node_1, ($$render) => {
        if (modals.showDupResult) $$render(consequent_1);
      });
    }
    var node_2 = sibling(node_1, 2);
    {
      var consequent_2 = ($$anchor2) => {
        {
          let $0 = derived_safe_equal(loadUndoHistory);
          UndoDialog($$anchor2, {
            get history() {
              return get($0);
            },
            get onundo() {
              return onUndoConfirm;
            },
            get onclose() {
              return closeUndo;
            }
          });
        }
      };
      if_block(node_2, ($$render) => {
        if (modals.showUndo) $$render(consequent_2);
      });
    }
    var node_3 = sibling(node_2, 2);
    {
      var consequent_3 = ($$anchor2) => {
        {
          let $0 = derived_safe_equal(loadHistory);
          HistoryTimeline($$anchor2, {
            get history() {
              return get($0);
            },
            get onclear() {
              return onHistoryClear;
            },
            get onclose() {
              return closeHistory;
            }
          });
        }
      };
      if_block(node_3, ($$render) => {
        if (modals.showHistory) $$render(consequent_3);
      });
    }
    var node_4 = sibling(node_3, 2);
    {
      var consequent_4 = ($$anchor2) => {
        StatsDialog($$anchor2, {
          get folders() {
            return modals.statsFolders;
          },
          get totalVideos() {
            return modals.statsTotalVideos;
          },
          get deadCount() {
            return modals.statsDeadCount;
          },
          get mode() {
            return modals.statsMode;
          },
          get onclose() {
            return closeStats;
          }
        });
      };
      if_block(node_4, ($$render) => {
        if (modals.showStats) $$render(consequent_4);
      });
    }
    var node_5 = sibling(node_4, 2);
    {
      var consequent_5 = ($$anchor2) => {
        FolderSelector($$anchor2, {
          get folders() {
            return $folderSelect().input;
          },
          onconfirm: (ids) => folderSelect.resolve(ids),
          onclose: () => folderSelect.reject()
        });
      };
      if_block(node_5, ($$render) => {
        if ($folderSelect()) $$render(consequent_5);
      });
    }
    var node_6 = sibling(node_5, 2);
    {
      var consequent_6 = ($$anchor2) => {
        PreviewConfirm($$anchor2, {
          get categories() {
            return $previewConfirm().input.categories;
          },
          get videos() {
            return $previewConfirm().input.videos;
          },
          get existingFolderNames() {
            return $previewConfirm().input.existingFolderNames;
          },
          onconfirm: (data) => previewConfirm.resolve(data),
          onclose: () => previewConfirm.reject()
        });
      };
      if_block(node_6, ($$render) => {
        if ($previewConfirm()) $$render(consequent_6);
      });
    }
    var node_7 = sibling(node_6, 2);
    {
      var consequent_7 = ($$anchor2) => {
        HelpDialog($$anchor2, {
          get onclose() {
            return closeHelp;
          }
        });
      };
      if_block(node_7, ($$render) => {
        if (modals.showHelp) $$render(consequent_7);
      });
    }
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  function exportLogs() {
    const entries = get$1(logs);
    if (entries.length === 0) {
      logs.add("暂无日志", "warning");
      return;
    }
    const lines = entries.map((e) => `[${e.time}] [${e.level}] ${e.message}`).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const filename = `bfao-log-${( new Date()).toISOString().slice(0, 16).replace(/:/g, "-")}.txt`;
    triggerDownload(blob, filename);
    logs.add("日志已导出", "success");
  }
  var root_1$1 = from_html(`<span class="nebula-particle svelte-6jyhgm"></span>`);
  var root_2 = from_html(`<div class="settings-wrapper svelte-6jyhgm"><!></div>`);
  var root$2 = from_html(`<div class="panel svelte-6jyhgm"><div class="nebula-drift svelte-6jyhgm" aria-hidden="true"></div> <div class="svelte-6jyhgm"><!></div> <div class="panel-content svelte-6jyhgm"><div aria-hidden="true"></div> <!> <div class="main-area svelte-6jyhgm"><!> <!> <!> <!></div></div></div> <!>`, 1);
  function Panel($$anchor, $$props) {
    push($$props, true);
    const $isRunning = () => store_get(isRunning, "$isRunning", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let flipState = prop($$props, "flipState", 3, null);
    let panelEl = state(void 0);
    let headerEl = state(void 0);
    let settingsEl = state(void 0);
    let contentEl = state(void 0);
    let ctx;
    let settingsOpen = state(false);
    let settingsVisible = state(false);
    let abortCtrl;
    let scrollProgress = state(0);
    let showScrollIndicator = state(false);
    function updateScrollIndicator() {
      if (!get(contentEl)) return;
      const { scrollTop, scrollHeight, clientHeight } = get(contentEl);
      const maxScroll = scrollHeight - clientHeight;
      set(showScrollIndicator, maxScroll > 10);
      set(scrollProgress, maxScroll > 0 ? scrollTop / maxScroll : 0, true);
    }
    async function debugPreview() {
      const fakeCategories = [
        "游戏实况",
        "音乐MV",
        "编程教程",
        "科技数码",
        "美食制作",
        "动画MAD",
        "影视解说",
        "搞笑日常"
      ].reduce(
        (acc, name, i) => {
          const count = [50, 50, 50, 30, 30, 30, 15, 15][i];
          acc[name] = Array.from({ length: count }, (_, j) => ({
            id: i * 100 + j + 1,
            type: 2,
            conf: 0.5 + Math.random() * 0.5
          }));
          return acc;
        },
        {}
      );
      const fakeVideos = Object.entries(fakeCategories).flatMap(([cat, vids]) => vids.map((v) => ({
        id: v.id,
        type: v.type,
        title: `【${cat}】模拟视频标题第${v.id}集 - 这是一个用于测试预览界面的模拟视频`,
        bvid: `BV1test${v.id}`,
        intro: "",
        duration: Math.floor(60 + Math.random() * 600),
        pubtime: Date.now() / 1e3,
        fav_time: Date.now() / 1e3,
        cnt_info: {
          play: Math.floor(Math.random() * 1e5),
          collect: 0,
          danmaku: 0
        },
        upper: {
          mid: 1e3 + v.id % 10,
          name: ["何同学", "3Blue1Brown", "LKs", "罗翔说刑法", "老番茄"][v.id % 5],
          face: ""
        },
        cover: "",
        link: ""
      })));
      const existingNames = ["游戏实况", "音乐MV", "编程教程", "科技数码", "美食制作"];
      try {
        await requestPreviewConfirm(fakeCategories, fakeVideos, existingNames);
        logs.add("[调试] 预览确认完成", "success");
      } catch {
        logs.add("[调试] 预览已取消", "info");
      }
    }
    function savePosition() {
      if (!get(panelEl)) return;
      gmSetValue(POS_STORAGE_KEY, {
        tx: gsap.getProperty(get(panelEl), "x"),
        ty: gsap.getProperty(get(panelEl), "y")
      });
    }
    onMount(() => {
      const saved = gmGetValue(POS_STORAGE_KEY, null);
      if (saved) {
        gsap.set(get(panelEl), { x: saved.tx, y: saved.ty });
      }
      let draggableInstance;
      if (get(headerEl)) {
        draggableInstance = _Draggable.create(get(panelEl), {
          trigger: get(headerEl),
          bounds: document.body,
          edgeResistance: 0.65,
          inertia: false,
          minimumMovement: 8,
          cursor: "grab",
          activeCursor: "grabbing",
          onDragStart() {
            if (shouldAnimate()) {
              gsap.to(get(panelEl), {
                scale: 0.98,
                boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
                duration: 0.2
              });
            }
          },
          onDragEnd() {
            if (shouldAnimate()) {
              gsap.to(get(panelEl), {
                scale: 1,
                boxShadow: "",
                duration: 0.35,
                ease: EASINGS.prismBounce
              });
            }
            savePosition();
          }
        });
      }
      const onEntryDone = () => {
        var _a2;
        return (_a2 = draggableInstance == null ? void 0 : draggableInstance[0]) == null ? void 0 : _a2.update();
      };
      ctx = gsap.context(
        () => {
          if (flipState() && shouldAnimateFunctional()) {
            const btnPos = flipState();
            const panelRect = get(panelEl).getBoundingClientRect();
            const dx = btnPos.btnX - panelRect.left;
            const dy = btnPos.btnY - panelRect.top;
            gsap.from(get(panelEl), {
              x: `+=${dx}`,
              y: `+=${dy}`,
              scale: 0.15,
              opacity: 0,
              filter: "blur(10px)",
              duration: 0.45,
              ease: EASINGS.velvetSpring,
              onComplete: onEntryDone
            });
          } else if (shouldAnimateFunctional()) {
            gsap.from(get(panelEl), {
              scale: 0.86,
              opacity: 0,
              filter: "blur(14px)",
              duration: 0.5,
              ease: EASINGS.velvetSpring,
              onComplete: onEntryDone
            });
          }
        },
        get(panelEl)
      );
      abortCtrl = new AbortController();
      document.addEventListener(
        "keydown",
        (e) => {
          if (e.ctrlKey && e.key === "Enter" && !$isRunning()) onStart();
        },
        { signal: abortCtrl.signal }
      );
    });
    onDestroy(() => {
      var _a2;
      (_a2 = _Draggable.get(get(panelEl))) == null ? void 0 : _a2.kill();
      ctx == null ? void 0 : ctx.revert();
      abortCtrl == null ? void 0 : abortCtrl.abort();
      if (get(settingsEl)) gsap.killTweensOf(get(settingsEl));
      rejectAllModals();
    });
    function doClose() {
      var _a2, _b2;
      savePosition();
      if (!get(panelEl)) {
        (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props);
        return;
      }
      if (shouldAnimateFunctional()) {
        gsap.to(get(panelEl), {
          scale: 0.9,
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.35,
          ease: EASINGS.silkOut,
          onComplete: () => {
            var _a3;
            return (_a3 = $$props.onclose) == null ? void 0 : _a3.call($$props);
          }
        });
      } else {
        (_b2 = $$props.onclose) == null ? void 0 : _b2.call($$props);
      }
    }
    let prevSettingsOpen = false;
    user_effect(() => {
      if (get(settingsOpen) !== prevSettingsOpen) {
        const opening = get(settingsOpen);
        prevSettingsOpen = get(settingsOpen);
        animateSettingsToggle(opening);
      }
    });
    async function animateSettingsToggle(open) {
      if (!shouldAnimate()) {
        set(settingsVisible, open, true);
        return;
      }
      if (open) {
        set(settingsVisible, true);
        await tick();
        if (get(settingsEl)) {
          gsap.fromTo(get(settingsEl), { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.3, ease: EASINGS.velvetSpring });
        }
      } else {
        if (get(settingsEl)) {
          gsap.to(get(settingsEl), {
            opacity: 0,
            x: -15,
            duration: 0.2,
            ease: EASINGS.silkOut,
            onComplete: () => {
              set(settingsVisible, false);
            }
          });
        } else {
          set(settingsVisible, false);
        }
      }
    }
    function onStart() {
      handleStart({
        openSettings: () => {
          set(settingsOpen, true);
        }
      });
    }
    function handleBackupClick() {
      handleBackup();
    }
    var fragment = root$2();
    var div = first_child(fragment);
    var div_1 = child(div);
    each(div_1, 20, () => Array(8), index, ($$anchor2, _, i) => {
      var span = root_1$1();
      set_style(span, `--i: ${i}`);
      append($$anchor2, span);
    });
    var div_2 = sibling(div_1, 2);
    var node = child(div_2);
    Header(node, {
      onclose: doClose,
      get settingsOpen() {
        return get(settingsOpen);
      },
      set settingsOpen($$value) {
        set(settingsOpen, $$value, true);
      }
    });
    bind_this(div_2, ($$value) => set(headerEl, $$value), () => get(headerEl));
    var div_3 = sibling(div_2, 2);
    var div_4 = child(div_3);
    let classes;
    let styles;
    var node_1 = sibling(div_4, 2);
    {
      var consequent = ($$anchor2) => {
        var div_5 = root_2();
        var node_2 = child(div_5);
        SettingsPanel(node_2, {});
        bind_this(div_5, ($$value) => set(settingsEl, $$value), () => get(settingsEl));
        append($$anchor2, div_5);
      };
      if_block(node_1, ($$render) => {
        if (get(settingsVisible)) $$render(consequent);
      });
    }
    var div_6 = sibling(node_1, 2);
    var node_3 = child(div_6);
    PromptEditor(node_3, {});
    var node_4 = sibling(node_3, 2);
    LogArea(node_4, {});
    var node_5 = sibling(node_4, 2);
    ProgressBar(node_5, {});
    var node_6 = sibling(node_5, 2);
    ActionButtons(node_6, {
      onstart: onStart,
      onstop: () => {
        cancelRequested.set(true);
        rejectAllModals();
        logs.add("正在停止...", "warning");
      },
      get oncleandead() {
        return onCleanDead;
      },
      get onfinddups() {
        return onFindDups;
      },
      get onundo() {
        return openUndo;
      },
      onbackup: handleBackupClick,
      onstats: () => onStatsClick("stats"),
      onhealth: () => onStatsClick("health"),
      get onexportlogs() {
        return exportLogs;
      },
      get onhelp() {
        return openHelp;
      },
      ondebugpreview: debugPreview,
      get onhistory() {
        return openHistory;
      }
    });
    bind_this(div_3, ($$value) => set(contentEl, $$value), () => get(contentEl));
    action(div_3, ($$node, $$action_arg) => parallax == null ? void 0 : parallax($$node, $$action_arg), () => ({ speed: 0.6, maxOffset: 80 }));
    action(div_3, ($$node) => cursorScatter == null ? void 0 : cursorScatter($$node));
    action(div_3, ($$node) => glowTrack == null ? void 0 : glowTrack($$node));
    bind_this(div, ($$value) => set(panelEl, $$value), () => get(panelEl));
    action(div, ($$node, $$action_arg) => panelCanvas == null ? void 0 : panelCanvas($$node, $$action_arg), () => ({ mode: "aurora" }));
    var node_7 = sibling(div, 2);
    PanelModals(node_7, {});
    template_effect(() => {
      classes = set_class(div_4, 1, "scroll-indicator svelte-6jyhgm", null, classes, { visible: get(showScrollIndicator) });
      styles = set_style(div_4, "", styles, { width: `${get(scrollProgress) * 100}%` });
    });
    event("scroll", div_3, updateScrollIndicator);
    append($$anchor, fragment);
    pop();
    $$cleanup();
  }
  var root_1 = from_html(`<button aria-label="关闭通知"><span class="toast-icon svelte-1ig2a9j"><!></span> <span class="toast-msg svelte-1ig2a9j"> </span> <div class="toast-timer svelte-1ig2a9j"></div></button>`);
  var root$1 = from_html(`<div class="toast-container svelte-1ig2a9j"></div>`);
  function Toast($$anchor, $$props) {
    push($$props, false);
    let toasts = mutable_source([]);
    let nextId = 0;
    let containerEl = mutable_source();
    const toastTimeouts = new Map();
    function addToast(message, type = "info", duration = 3500) {
      const id = nextId++;
      let flipState = null;
      if (shouldAnimate() && get(containerEl)) {
        const existing = get(containerEl).querySelectorAll(".toast");
        if (existing.length > 0) {
          flipState = _Flip.getState(existing);
        }
      }
      set(toasts, [...get(toasts), { id, message, type, duration }]);
      if (get(toasts).length > MAX_TOAST_COUNT) {
        const discarded = get(toasts).slice(0, -MAX_TOAST_COUNT);
        for (const t of discarded) {
          const tid = toastTimeouts.get(t.id);
          if (tid) {
            clearTimeout(tid);
            toastTimeouts.delete(t.id);
          }
        }
        set(toasts, get(toasts).slice(-MAX_TOAST_COUNT));
      }
      if (flipState) {
        tick().then(() => {
          var _a2;
          const current = (_a2 = get(containerEl)) == null ? void 0 : _a2.querySelectorAll(".toast");
          if (current && current.length > 1) {
            _Flip.from(flipState, {
              duration: 0.3,
              ease: EASINGS.velvetSpring,
              targets: Array.from(current).slice(0, -1)
});
          }
        });
      }
      toastTimeouts.set(id, setTimeout(() => removeToast(id), duration));
    }
    function removeToast(id) {
      const tid = toastTimeouts.get(id);
      if (tid) {
        clearTimeout(tid);
        toastTimeouts.delete(id);
      }
      const el = document.querySelector(`[data-toast-id="${id}"]`);
      if (!el) {
        set(toasts, get(toasts).filter((t) => t.id !== id));
        return;
      }
      if (shouldAnimateFunctional()) {
        gsap.to(el, {
          x: 140,
          scale: 0.78,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            let flipState = null;
            if (shouldAnimate() && get(containerEl)) {
              const remaining = get(containerEl).querySelectorAll(".toast");
              if (remaining.length > 1) {
                flipState = _Flip.getState(remaining);
              }
            }
            set(toasts, get(toasts).filter((t) => t.id !== id));
            if (flipState) {
              tick().then(() => {
                var _a2;
                const current = (_a2 = get(containerEl)) == null ? void 0 : _a2.querySelectorAll(".toast");
                if (current && current.length > 0) {
                  _Flip.from(flipState, { duration: 0.3, ease: EASINGS.velvetSpring });
                }
              });
            }
          }
        });
      } else {
        set(toasts, get(toasts).filter((t) => t.id !== id));
      }
    }
    function animateIn(node) {
      if (!shouldAnimateFunctional()) return;
      const type = node.dataset.toastType;
      switch (type) {
        case "success":
          gsap.fromTo(node, { x: 140, scale: 0.4, opacity: 0 }, {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.55,
            ease: EASINGS.prismBounce
          });
          break;
        case "error":
          gsap.fromTo(node, { x: 140, scale: 0.6, opacity: 0 }, {
            x: 0,
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: EASINGS.velvetSpring,
            onComplete: () => {
              gsap.to(node, {
                keyframes: [
                  { x: -4, duration: 0.04 },
                  { x: 4, duration: 0.04 },
                  { x: -3, duration: 0.04 },
                  { x: 2, duration: 0.04 },
                  { x: 0, duration: 0.04 }
                ],
                ease: "none"
              });
            }
          });
          break;
        case "warning":
          gsap.fromTo(node, { y: -60, x: 0, scale: 0.8, opacity: 0 }, {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: EASINGS.prismBounce
          });
          break;
        default:
          gsap.fromTo(
            node,
            {
              x: 140,
              scale: 0.6,
              rotation: 3,
              opacity: 0,
              filter: "blur(12px)"
            },
            {
              x: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.55,
              ease: EASINGS.velvetSpring
            }
          );
      }
    }
    onMount(() => {
      window.__bfao_toast = addToast;
    });
    onDestroy(() => {
      toastTimeouts.forEach((tid) => clearTimeout(tid));
      toastTimeouts.clear();
    });
    var $$exports = { show: addToast };
    init();
    var div = root$1();
    let styles;
    each(div, 5, () => get(toasts), (toast) => toast.id, ($$anchor2, toast) => {
      var button = root_1();
      var span = child(button);
      var node_1 = child(span);
      {
        var consequent = ($$anchor3) => {
          var text$1 = text("✓");
          append($$anchor3, text$1);
        };
        var consequent_1 = ($$anchor3) => {
          var text_1 = text("✕");
          append($$anchor3, text_1);
        };
        var consequent_2 = ($$anchor3) => {
          var text_2 = text("⚠");
          append($$anchor3, text_2);
        };
        var alternate = ($$anchor3) => {
          var text_3 = text("ℹ");
          append($$anchor3, text_3);
        };
        if_block(node_1, ($$render) => {
          if (get(toast).type === "success") $$render(consequent);
          else if (get(toast).type === "error") $$render(consequent_1, 1);
          else if (get(toast).type === "warning") $$render(consequent_2, 2);
          else $$render(alternate, -1);
        });
      }
      var span_1 = sibling(span, 2);
      var text_4 = child(span_1);
      var div_1 = sibling(span_1, 2);
      let styles_1;
      action(button, ($$node) => animateIn == null ? void 0 : animateIn($$node));
      template_effect(() => {
        set_class(button, 1, `toast toast-${get(toast).type ?? ""}`, "svelte-1ig2a9j");
        set_attribute(button, "data-toast-id", get(toast).id);
        set_attribute(button, "data-toast-type", get(toast).type);
        set_attribute(button, "data-flip-id", `toast-${get(toast).id ?? ""}`);
        set_text(text_4, get(toast).message);
        styles_1 = set_style(div_1, "", styles_1, { "animation-duration": `${get(toast).duration ?? ""}ms` });
      });
      delegated("click", button, () => removeToast(get(toast).id));
      append($$anchor2, button);
    });
    bind_this(div, ($$value) => set(containerEl, $$value), () => get(containerEl));
    template_effect(() => styles = set_style(div, "", styles, { "z-index": Z_INDEX.TOAST }));
    append($$anchor, div);
    bind_prop($$props, "show", addToast);
    return pop($$exports);
  }
  delegate(["click"]);
  const variablesCss = ".bfao-app{--ai-bg: #fff;--ai-bg-secondary: #f9f7ff;--ai-bg-tertiary: #f0eafa;--ai-bg-hover: rgba(115, 100, 255, .04);--ai-input-bg: #fff;--ai-text: #181233;--ai-text-secondary: #38305a;--ai-text-muted: #868199;--ai-border: #e4ddf5;--ai-border-light: #f0eafa;--ai-border-lighter: #f9f7ff;--ai-primary: #7364ff;--ai-primary-light: #b0a8ff;--ai-primary-bg: rgba(115, 100, 255, .06);--ai-primary-rgb: 115, 100, 255;--ai-primary-shadow: rgba(115, 100, 255, .12);--ai-gradient-accent: #9b59f6;--ai-success: #10b981;--ai-success-rgb: 16, 185, 129;--ai-success-dark: #059669;--ai-success-light: #34d399;--ai-success-lighter: #6ee7b7;--ai-success-bg: rgba(5, 150, 105, .1);--ai-error: #e74c3c;--ai-error-rgb: 231, 76, 60;--ai-error-alt: #f43f5e;--ai-error-alt-rgb: 244, 63, 94;--ai-error-hover: #ef5757;--ai-warning: #f59e0b;--ai-warning-rgb: 245, 158, 11;--ai-warning-dark: #d97706;--ai-warning-bg: rgba(217, 119, 6, .1);--ai-info: #818cf8;--ai-backdrop: rgba(24, 18, 51, .58);--ai-shadow-md: 0 8px 32px rgba(0, 0, 0, .12);--ai-shadow-lg: 0 24px 68px rgba(0, 0, 0, .11), 0 10px 28px rgba(0, 0, 0, .07);--ai-shadow-modal: 0 44px 110px rgba(0, 0, 0, .2), 0 18px 44px rgba(0, 0, 0, .11)}.bfao-app[data-theme=dark]{--ai-bg: #1a1130;--ai-bg-secondary: #221845;--ai-bg-tertiary: #2a1f50;--ai-bg-hover: rgba(115, 100, 255, .08);--ai-input-bg: #221845;--ai-text: #e8e4f0;--ai-text-secondary: #c4bdd5;--ai-text-muted: #8a82a0;--ai-border: #3d3260;--ai-border-light: #332a55;--ai-border-lighter: #2a1f50;--ai-primary: #8b7fff;--ai-primary-light: #a89eff;--ai-primary-bg: rgba(139, 127, 255, .1);--ai-primary-rgb: 139, 127, 255;--ai-primary-shadow: rgba(139, 127, 255, .2);--ai-gradient-accent: #a87bf5;--ai-success: #34d399;--ai-success-rgb: 52, 211, 153;--ai-success-dark: #10b981;--ai-success-light: #6ee7b7;--ai-success-lighter: #a7f3d0;--ai-success-bg: rgba(16, 185, 129, .15);--ai-error: #f87171;--ai-error-rgb: 248, 113, 113;--ai-error-alt: #fb7185;--ai-error-alt-rgb: 251, 113, 133;--ai-error-hover: #fca5a5;--ai-warning: #fbbf24;--ai-warning-rgb: 251, 191, 36;--ai-warning-dark: #f59e0b;--ai-warning-bg: rgba(245, 158, 11, .15);--ai-info: #a5b4fc;--ai-backdrop: rgba(10, 6, 20, .72);--ai-shadow-md: 0 8px 32px rgba(0, 0, 0, .3);--ai-shadow-lg: 0 24px 68px rgba(0, 0, 0, .35), 0 10px 28px rgba(0, 0, 0, .2);--ai-shadow-modal: 0 44px 110px rgba(0, 0, 0, .5), 0 18px 44px rgba(0, 0, 0, .3)}.bfao-app *::-webkit-scrollbar{width:0;height:0}.bfao-app *{scrollbar-width:none}.bfao-app[data-theme]{transition:background-color .3s ease}.bfao-app button:focus-visible,.bfao-app [role=button]:focus-visible{outline:2px solid var(--ai-primary);outline-offset:2px;animation:focusRingIn .2s cubic-bezier(.2,.98,.28,1) both}.bfao-app button:focus:not(:focus-visible),.bfao-app [role=button]:focus:not(:focus-visible){outline:none}@keyframes focusRingIn{0%{outline-offset:0px;outline-color:transparent}to{outline-offset:2px;outline-color:var(--ai-primary)}}@media(prefers-reduced-motion:reduce){.bfao-app[data-theme]{transition:none}.bfao-app button:focus-visible,.bfao-app [role=button]:focus-visible{animation:none}}";
  importCSS(variablesCss);
  const modalCss = ".bfao-modal-body{padding:16px 20px}.bfao-modal-summary{font-size:13px;font-weight:700;margin-bottom:12px}.bfao-modal-summary strong{color:var(--ai-primary);display:inline-block;animation:countPop .4s cubic-bezier(.22,1.42,.29,1) .3s both}@keyframes countPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}.bfao-modal-empty{text-align:center;color:var(--ai-text-muted);padding:24px 0;font-size:13px;animation:emptyFloat 3s ease-in-out infinite}@keyframes emptyFloat{0%,to{transform:translateY(0)}50%{transform:translateY(-6px)}}.bfao-modal-more{font-size:10px;color:var(--ai-text-muted);padding:4px 0;animation:morePulse 2.5s ease-in-out infinite}@keyframes morePulse{0%,to{opacity:.6}50%{opacity:1}}.bfao-modal-hint{font-size:10px;color:var(--ai-text-muted);line-height:1.3;display:inline-block;animation:hintFadeUp .4s ease .3s both}@keyframes hintFadeUp{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.bfao-action-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.bfao-btn{padding:8px 14px;font-size:12px;font-weight:600;border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .2s ease}.bfao-btn svg{transition:transform .2s cubic-bezier(.2,.98,.28,1)}.bfao-btn:hover:not(:disabled) svg{transform:translateY(-1px)}.bfao-btn:disabled{opacity:.5;cursor:not-allowed;filter:grayscale(.3);box-shadow:none;transition:opacity .3s ease,filter .3s ease,box-shadow .3s ease}.bfao-btn-primary{background:linear-gradient(135deg,var(--ai-primary),var(--ai-gradient-accent));color:#fff}.bfao-btn-primary:hover:not(:disabled){box-shadow:0 4px 12px rgba(var(--ai-primary-rgb),.3)}.bfao-btn-danger{background:var(--ai-error);color:#fff}.bfao-btn-danger:hover:not(:disabled){box-shadow:0 4px 12px rgba(var(--ai-error-rgb),.3)}.bfao-btn-muted{background:var(--ai-border-lighter);color:var(--ai-text-muted);font-size:12px}.bfao-btn-muted:hover{background:var(--ai-bg-tertiary)}.bfao-selectable-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1.5px solid var(--ai-border);border-radius:10px;cursor:pointer;transition:all .2s ease;background:var(--ai-bg)}.bfao-selectable-item:hover{border-color:var(--ai-primary-light)}.bfao-selectable-item.selected{border-color:var(--ai-primary);background:var(--ai-bg-tertiary)}@media(prefers-reduced-motion:reduce){.bfao-modal-empty{animation:none}.bfao-modal-summary strong{animation:none;opacity:1;transform:none}.bfao-btn:disabled{transition:none;filter:none}.bfao-modal-hint{animation:none;opacity:1}.bfao-modal-more{animation:none;opacity:.6}.bfao-btn svg{transition:none}}";
  importCSS(modalCss);
  var root = from_html(`<div class="bfao-app svelte-1n46o8q"><!> <!> <!> <div class="cursor-spotlight svelte-1n46o8q"></div></div>`);
  function App($$anchor, $$props) {
    push($$props, true);
    const $isDark = () => store_get(isDark, "$isDark", $$stores);
    const $accentColor = () => store_get(accentColor, "$accentColor", $$stores);
    const $panelOpen = () => store_get(panelOpen, "$panelOpen", $$stores);
    const [$$stores, $$cleanup] = setup_stores();
    let flipState = null;
    let spotlightEl = state(void 0);
    onDestroy(destroyThemeListeners);
    onMount(() => {
      if (!shouldAnimate()) return;
      function onMove(e) {
        if (get(spotlightEl)) {
          get(spotlightEl).style.left = e.clientX + "px";
          get(spotlightEl).style.top = e.clientY + "px";
          get(spotlightEl).style.opacity = "1";
        }
      }
      function onLeave() {
        if (get(spotlightEl)) get(spotlightEl).style.opacity = "0";
      }
      document.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      return () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
      };
    });
    function openPanel() {
      const btn = document.querySelector(".bfao-app .float-btn");
      if (btn) {
        const rect = btn.getBoundingClientRect();
        flipState = { btnX: rect.left, btnY: rect.top };
      }
      panelOpen.set(true);
    }
    function closePanel() {
      flipState = null;
      panelOpen.set(false);
    }
    var div = root();
    let styles;
    var node = child(div);
    {
      let $0 = user_derived(() => !$panelOpen());
      FloatButton(node, {
        onclick: openPanel,
        get visible() {
          return get($0);
        }
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent = ($$anchor2) => {
        Panel($$anchor2, {
          onclose: closePanel,
          get flipState() {
            return flipState;
          }
        });
      };
      if_block(node_1, ($$render) => {
        if ($panelOpen()) $$render(consequent);
      });
    }
    var node_2 = sibling(node_1, 2);
    Toast(node_2, {});
    var div_1 = sibling(node_2, 2);
    bind_this(div_1, ($$value) => set(spotlightEl, $$value), () => get(spotlightEl));
    template_effect(() => {
      set_attribute(div, "data-theme", $isDark() ? "dark" : "light");
      styles = set_style(div, "", styles, { "--ai-accent": $accentColor() });
    });
    append($$anchor, div);
    pop();
    $$cleanup();
  }
  const CACHE_KEY = "bfao_bg_folder_cache";
  const CACHE_TTL = 10 * 60 * 1e3;
  const SCAN_INTERVAL = 15 * 60 * 1e3;
  async function fetchJson(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1e4);
    try {
      const res = await fetch(url, {
        credentials: "include",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }
  async function fetchFolderList(mid) {
    var _a2;
    const url = BILIBILI_URLS.folderList(mid);
    const res = await fetchJson(url);
    if ((res == null ? void 0 : res.code) === 0 && ((_a2 = res.data) == null ? void 0 : _a2.list)) {
      return res.data.list;
    }
    return [];
  }
  async function scanAndCache() {
    const mid = getMidFromCookie();
    if (!mid) return;
    const existing = gmGetValue(CACHE_KEY, {});
    const folders = await fetchFolderList(mid);
    if (folders.length === 0) return;
    const now2 = Date.now();
    for (const folder of folders) {
      const key = String(folder.id);
      const cached = existing[key];
      if (cached && now2 - cached.cachedAt < CACHE_TTL) continue;
      existing[key] = {
        title: folder.title,
        media_count: folder.media_count,
        videos: (cached == null ? void 0 : cached.videos) ?? [],
        cachedAt: now2
      };
    }
    gmSetValue(CACHE_KEY, existing);
  }
  let intervalId = null;
  let initialTimeoutId = null;
  let scanInProgress = false;
  async function safeScan() {
    if (scanInProgress) return;
    scanInProgress = true;
    try {
      await scanAndCache();
    } catch (e) {
    } finally {
      scanInProgress = false;
    }
  }
  function setupBackgroundCache() {
    if (intervalId !== null) return;
    initialTimeoutId = setTimeout(safeScan, 5e3);
    intervalId = setInterval(safeScan, SCAN_INTERVAL);
    window.addEventListener("beforeunload", stopBackgroundCache);
  }
  function stopBackgroundCache() {
    window.removeEventListener("beforeunload", stopBackgroundCache);
    if (initialTimeoutId !== null) {
      clearTimeout(initialTimeoutId);
      initialTimeoutId = null;
    }
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    scanInProgress = false;
  }
  const isSpacePage = /space\.bilibili\.com/.test(location.href);
  if (isSpacePage) {
    const container = document.createElement("div");
    container.id = "bfao-root";
    document.body.appendChild(container);
    mount(App, { target: container });
  }
  setupBackgroundCache();

})(gsap);