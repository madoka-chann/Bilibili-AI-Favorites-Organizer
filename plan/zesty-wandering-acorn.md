# Bilibili AI Favorites Organizer - 全面重构计划

## Context

当前项目是一个 Tampermonkey 油猴脚本，用于 AI 智能分类 B 站收藏夹视频。现状：
- **单文件 JS 架构** (6,949 行)，无模块化，维护困难
- **巨大 CSS 文件** (22,072 行, 484 @keyframes, 79 主题色)，大量死代码
- **无构建系统**、无 TypeScript、无测试、无代码检查
- 核心函数过长：`initUI()` ~3,050 行，`startProcess()` ~640 行，`renderPreview()` ~700 行

**目标**：引入现代构建系统 + Svelte 框架重构，实现极致视觉与交互效果，同时大幅提升代码质量。

---

## Phase 0: 构建系统搭建

**创建文件：**
- `package.json` — 项目依赖 (Vite, Svelte, TypeScript, GSAP, vite-plugin-monkey)
- `vite.config.ts` — Vite 构建配置，使用 `vite-plugin-monkey` 生成 userscript
- `tsconfig.json` — TypeScript 配置 (strict mode)
- `svelte.config.js` — Svelte 编译器配置
- `.eslintrc.cjs` — ESLint + Svelte 插件

**关键选型：**
- **Vite** (非 Rollup) — 开发体验更好，HMR 热更新，Svelte 官方推荐
- **vite-plugin-monkey** — 自动处理 userscript 头部元数据、GM_* API 声明、外部资源
- **Svelte 5** — 最新版，runes 响应式系统，内置 transition/animate
- **TypeScript** — 严格模式，类型安全
- **GSAP via CDN** — 通过 `vite-plugin-monkey` 的 `externalGlobals` + `cdn.jsdelivr()` 外部化 GSAP，不打包进产物

**GSAP CDN 加载方案：**

`vite.config.ts` 中配置 `externalGlobals`，将 gsap 核心及插件通过 jsDelivr CDN 加载：

```ts
import monkey, { cdn } from 'vite-plugin-monkey';

// build.externalGlobals 配置:
externalGlobals: {
  gsap: cdn.jsdelivr('gsap', 'dist/gsap.min.js'),
  'gsap/Flip': cdn.jsdelivr('gsap', 'dist/Flip.min.js'),
  'gsap/Draggable': cdn.jsdelivr('gsap', 'dist/Draggable.min.js'),
  'gsap/CustomEase': cdn.jsdelivr('gsap', 'dist/CustomEase.min.js'),
},
```

- GSAP 核心 (~70 kB gzipped) + 插件从 CDN 加载，不计入 userscript 体积
- `@require` 标签由 vite-plugin-monkey 自动生成
- 开发模式 (vite dev) 仍从 node_modules 导入，不受影响
- gsap-config.ts 中的 `import gsap from 'gsap'` 等导入语句无需修改，构建时自动映射为全局变量

**构建产出：**
- `dist/bilibili-favorites-ai-organizer.user.js` — 单文件 userscript (IIFE)
- CSS 内联到 JS 中通过 `GM_addStyle` 注入

---

## Phase 1: Svelte 组件架构设计

```
src/
├── main.ts                          # 入口：挂载 Svelte app 到 body
├── App.svelte                       # 根组件：浮动按钮 + 面板
├── vite-env.d.ts                    # Vite 环境类型声明
├── stores/                          # → $stores/
│   ├── settings.ts                  # 设置 store (writable, 持久化到 GM_setValue)
│   ├── state.ts                     # 运行时状态 (isRunning, progress, logs, tokens)
│   ├── theme.ts                     # 主题/暗色模式 store + prefersReducedMotion
│   └── modal-bridge.ts              # Promise-based modal 通信 (folder select, preview confirm)
├── api/                             # → $api/
│   ├── bilibili.ts                  # B站 API 统一入口 (re-export)
│   ├── bilibili-http.ts             # B站 HTTP 请求层 (GM_xmlhttpRequest 封装)
│   ├── bilibili-auth.ts             # B站认证 (CSRF token, 用户信息)
│   ├── bilibili-folders.ts          # B站收藏夹操作 (列表/创建/移动)
│   ├── bilibili-videos.ts           # B站视频操作 (获取/删除/批量)
│   ├── bilibili-scanner.ts          # B站收藏夹分页扫描
│   ├── ai-client.ts                 # AI 统一调用层 (重试/限流/Token追踪)
│   ├── ai-providers.ts              # 多 Provider 适配器 (Gemini/OpenAI/Claude/...)
│   └── ai-prompt.ts                 # AI 提示词构建
├── core/                            # → $core/
│   ├── process.ts                   # 整理主流程 (拆分为子函数)
│   ├── dead-videos.ts               # 失效视频检测
│   ├── duplicates.ts                # 跨收藏夹去重
│   ├── backup.ts                    # 备份/恢复
│   ├── undo.ts                      # 撤销历史
│   ├── history.ts                   # 操作历史记录
│   ├── panel-actions.ts             # 面板操作包装 (认证校验 + isRunning 管理)
│   ├── export-logs.ts               # 日志导出
│   └── background-cache.ts          # 后台自动缓存
├── utils/                           # → $utils/
│   ├── constants/                   # 常量 (按领域分文件)
│   │   ├── index.ts                 # barrel export
│   │   ├── ai.ts                    # AI providers 注册表、预设、超时
│   │   ├── bilibili.ts              # B站 API URLs、页面大小、特殊文件夹
│   │   └── ui.ts                    # z-index 层级、颜色、限制
│   ├── dom.ts                       # escapeHtml, sanitize
│   ├── timing.ts                    # debounce, sleep, humanDelay
│   ├── errors.ts                    # 错误类型 + getErrorMessage
│   ├── gm.ts                        # GM_* API 类型安全封装
│   ├── collections.ts               # 数组/Map 工具函数
│   ├── download.ts                  # 文件下载工具
│   ├── json-extract.ts              # JSON 提取 (从 AI 响应中)
│   ├── progress.ts                  # 进度计算工具
│   └── running-state.ts             # isRunning 生命周期管理
├── types/                           # → $types/
│   ├── index.ts                     # barrel export
│   ├── settings.ts                  # Settings 接口 (23 个字段)
│   ├── video.ts                     # VideoResource, FavFolder, CategoryResult 等
│   └── ai.ts                        # AIProvider, AIResponse 等
├── components/                      # → $components/
│   ├── FloatButton.svelte           # 浮动按钮 (可拖拽, 磁性吸引, 极光呼吸)
│   ├── Panel.svelte                 # 主面板容器 (毛玻璃, 绽放/退场, B3交叉淡入)
│   ├── Header.svelte                # 面板头部 (极光渐变, 涟漪, 按压效果)
│   ├── SettingsPanel.svelte         # 设置区域 (4个可折叠分组, C5液态开关)
│   ├── SettingsGroup.svelte         # 单个设置分组 (B4弹簧手风琴)
│   ├── ProviderConfig.svelte        # AI Provider 配置 (模型选择, C4聚焦发光)
│   ├── LiquidToggle.svelte          # C5 液态开关 (GSAP thumb拉伸/滑动)
│   ├── PromptEditor.svelte          # 自定义提示词编辑器 (C4聚焦发光)
│   ├── LogArea.svelte               # AI 状态日志 (H1文字解码效果)
│   ├── ProgressBar.svelte           # 进度条 (D1-D6 粒子/阶段/庆祝/微光)
│   ├── ActionButtons.svelte         # 主操作按钮组 (C1/C2按压, C3光追踪)
│   ├── PreviewConfirm.svelte        # 分类预览+确认 (E2 FLIP展开, E3倾斜, E4缩放)
│   ├── FolderSelector.svelte        # 收藏夹选择器 (Modal)
│   ├── HistoryTimeline.svelte       # 历史时间线 (Modal)
│   ├── DeadVideosResult.svelte      # 失效视频结果 (Modal)
│   ├── DuplicatesResult.svelte      # 重复视频结果 (Modal)
│   ├── UndoDialog.svelte            # 撤销操作 (Modal)
│   ├── StatsDialog.svelte           # 统计/健康报告 (Modal, H2数字翻滚)
│   ├── Toast.svelte                 # Toast 通知 (G1-G5 弹性/FLIP/类型化)
│   └── Modal.svelte                 # 通用 Modal 容器 (F1绽放, F3物理退出)
├── animations/                      # → $animations/
│   ├── gsap-config.ts               # GSAP 插件注册 + 10品牌缓动 + 动画开关检测
│   ├── micro.ts                     # 微交互: pressEffect, focusGlow, checkBounce, staggerReveal, hoverScale 等
│   ├── progress.ts                  # 进度条: 轨迹粒子, 阶段切换, 胜利庆祝, 数字弹跳
│   └── text.ts                      # 文字特效: 解码效果, 数字翻滚
├── actions/                         # → $actions/
│   ├── magnetic.ts                  # use:magnetic — 磁性光标吸引
│   ├── tilt.ts                      # use:tilt — 3D 倾斜悬浮
│   ├── glow-track.ts                # use:glowTrack — 径向光追踪
│   └── ripple.ts                    # use:ripple — 点击涟漪
└── styles/                          # → $styles/
    ├── variables.css                # CSS 变量 (亮/暗主题, 颜色, 间距)
    ├── forms.css                    # 表单元素基础样式
    └── modal.css                    # Modal 通用样式
```

**路径别名** (tsconfig.json + vite.config.ts):
- `$api/`, `$core/`, `$stores/`, `$types/`, `$utils/` — 业务模块
- `$components/`, `$animations/`, `$actions/`, `$styles/` — UI/动画层

---

## Phase 2: GSAP + Svelte 极致动画系统

### 动画架构文件 (实际)

动画逻辑按"公共复用 vs 组件内联"原则拆分：复用度高的提取为公共模块/action，组件专属动画直接写在 `.svelte` 文件的 `onMount` 中。

```
src/animations/
  gsap-config.ts          # 插件注册 (Flip/Draggable/CustomEase) + 10品牌缓动 + 全局默认值 + 三级减弱检测
  micro.ts                # 可复用微交互: pressEffect, focusGlow, checkBounce, staggerReveal, contentStagger, listStaggerReveal, hoverScale
  progress.ts             # 进度条动画: 轨迹粒子, 阶段切换闪光, 胜利庆祝(纸屑), 数字弹跳
  text.ts                 # 文字特效: 解码效果(乱码→还原), 数字翻滚(0→目标值)
src/actions/
  magnetic.ts             # Svelte action: use:magnetic — 磁性光标吸引 (quickTo)
  tilt.ts                 # Svelte action: use:tilt — 3D 倾斜悬浮 (quickTo)
  glow-track.ts           # Svelte action: use:glowTrack — 径向光追踪 (CSS变量)
  ripple.ts               # Svelte action: use:ripple — Material 点击涟漪
```

组件内联动画 (不单独提取文件):
- FloatButton.svelte: A1磁性 + A2极光 + A3粒子爆发 + A6液态形变 + K1拖拽
- Panel.svelte: B1绽放入场 + B2帷幕退场 + B3交叉淡入
- Modal.svelte: F1绽放 + F3物理退出
- Toast.svelte: G1-G5 弹性/FLIP/类型化/退场
- SettingsGroup.svelte: B4弹簧手风琴
- PreviewConfirm.svelte: E2 FLIP展开折叠

### GSAP 全局配置 (gsap-config.ts)

- **GSAP 通过 CDN 加载** — `import gsap from 'gsap'` 在构建时映射为 jsDelivr CDN 的 `@require`，不打包进产物
- 注册所有插件: `Flip, Draggable, CustomEase` (均通过 CDN 各自独立 `@require`)
- 未来如需 `MotionPathPlugin, Physics2DPlugin, SplitText` 等付费/高级插件，同样添加到 `externalGlobals` CDN 配置中
- 全局默认: `gsap.defaults({ force3D: true, overwrite: 'auto' })`
- 每个 Svelte 组件用 `gsap.context()` 在 `onMount` 中创建，`onDestroy` 自动清理
- 三级减弱动画策略：OS `prefers-reduced-motion` → 用户 `animEnabled` 开关 → 全开

### 10 个品牌缓动曲线 (easings.ts)

替代现有 70+ CSS cubic-bezier 变量:

| 名称 | 用途 | 等效 |
|------|------|------|
| `velvetSpring` | 主 UI 弹性 (面板/模态框) | `--ai-spring-gentle` |
| `silkOut` | 平滑减速 (关闭/淡出) | `--ai-ease-ethereal` |
| `auroraFlow` | 环境循环动画 | 柔和正弦 |
| `prismBounce` | 按钮/复选框弹跳 | `--ai-spring-bouncy` |
| `liquidMorph` | 有机形状变形 | 自定义 |
| `nebulaDrift` | 超慢环境漂移 | 线性极慢 |
| `magneticPull` | 磁性吸附 (快起步，弹性安定) | 自定义 |
| `toastBounce` | Toast 滑入过冲 | `CustomBounce` |
| `confettiArc` | 自然重力弧线 | 自定义 |
| `rippleExpand` | 点击涟漪扩散 | 快速扩展淡出 |

---

### A. 浮动按钮 (极致浮动按钮) — FloatButton.svelte

| 效果 | 触发 | 实现 | 时长/缓动 | GPU属性 |
|------|------|------|-----------|---------|
| **A1 磁性光标吸引** | 鼠标进入120px范围 | `use:magnetic` + `gsap.quickTo()` 两轴吸引 | 0.4s `magneticPull` / 0.6s `elastic.out(1,0.4)` 回弹 | transform |
| **A2 极光呼吸光晕** | 持续 (空闲) | `gsap.timeline({repeat:-1, yoyo:true})` box-shadow 脉冲 | 6.5s `sine.inOut` | box-shadow |
| **A3 点击粒子爆发** | 点击 | 24个div, 随机角度/距离, `gsap.to()` 物理散射 | 0.5-0.9s `confettiArc` | transform, opacity |
| **A4 FLIP变形为面板** | 点击打开 | `Flip.getState(btn)` → 显示面板 → `Flip.from()` 形变 | 0.55s `velvetSpring` | transform, border-radius |
| **A5 星座轨道** | 持续 | 5个轨道球, `gsap.to({motionPath})` 圆形路径 + 闪烁 | 10-18s 轨道 / 1.5-3s 闪烁 | transform, opacity |
| **A6 液态形变** | 持续 | `gsap.timeline({repeat:-1})` 6步 border-radius 变形 | ~12s `liquidMorph` | border-radius |

---

### B. 面板过渡 (面板动效) — Panel.svelte

| 效果 | 触发 | 实现 | 时长/缓动 |
|------|------|------|-----------|
| **B1 丝绒绽放** (开启) | 按钮点击 | `gsap.fromTo(panel, {y:48, scale:0.86, rotation:-0.35, blur:14px}, {完整状态})` | 0.5s `velvetSpring` |
| **B2 帷幕退场** (关闭) | 关闭按钮 | `gsap.to(panel, {y:32, scale:0.90, rotation:0.5, blur:6px, opacity:0})` | 0.35s `silkOut` |
| **B3 标签交叉淡入** | Tab 切换 | 旧内容 `{opacity:0, x:-15}` + 新内容 `{opacity:1, x:0}` 重叠 | 0.4s 总 |
| **B4 弹簧手风琴** | 设置组点击 | 测量高度 → 动画 `height:0→auto` + 箭头旋转90° | 0.35s `velvetSpring` / 0.28s `silkOut` |
| **B5 深度视差** | 面板内滚动 | `use:parallax` + `gsap.quickTo()` 背景层不同速度偏移 | 连续 |

---

### C. 微交互 — 全局可复用

| 效果 | 组件 | 实现 | 时长 |
|------|------|------|------|
| **C1 磁性按钮** | 所有按钮 | `use:magnetic={{radius:40, strength:0.25}}` + `gsap.quickTo()` | 0.3s in / 0.5s `elastic` out |
| **C2 新拟态按压** | 所有按钮 | pointerdown: `{scale:0.95, inset-shadow}` / up: `{scale:1}` | 0.12s down / 0.35s `prismBounce` up |
| **C3 径向光追踪** | 所有按钮 | `use:glowTrack` → CSS `--mouse-x/y` → radial-gradient | 实时 (无GSAP) |
| **C4 聚焦发光** | 输入框 | focus: box-shadow + border-color 动画 | 0.3s `velvetSpring` |
| **C5 液态开关** | Toggle | thumb滑动 + scaleX:1.3 拉伸 → 1.0 安定 | 0.4s |
| **C6 勾选弹跳** | Checkbox | `gsap.fromTo({scale:0.7}, {scale:1})` | 0.4s `prismBounce` |
| **C7 交错下拉** | Select | 容器 scale:0.95→1 + 子项 stagger x:-10→0 | 0.25s + 0.03s/项 |

---

### D. 进度与加载 — ProgressBar.svelte

| 效果 | 触发 | 实现 | 备注 |
|------|------|------|------|
| **D1 平滑进度** | 进度变化 | Svelte `tweened()` store, 400ms `cubicOut` | 始终启用 |
| **D2 进度轨迹粒子** | 进度更新 | 在进度条前沿生成3个粒子, 向上飘散消失 | 0.5-0.8s |
| **D3 阶段切换** | fetch→AI→move | 闪光 `brightness:1.5` + 旧标签上飘 + 新标签入场 | 0.45s |
| **D4 胜利庆祝** | 完成100% | 面板微震 (-3,3,-2,1,0px) + Confetti + 成功 Toast | 0.25s 震动 |
| **D5 数字翻滚** | 数值变化 | Svelte `tweened()` + scale:1.15 弹跳 | 0.3s |
| **D6 骨架屏微光** | 加载中 | 纯CSS `@keyframes shimmer` (保留的3个之一) | 1.5s 循环 |

---

### E. 列表与卡片 — Preview/CategoryRow/VideoItem

| 效果 | 触发 | 实现 | 性能 |
|------|------|------|------|
| **E1 交错揭示** | 分类展开 | `gsap.fromTo(items, {x:36,scale:0.93,blur:2.5px}, {完整})` stagger:0.04s | 只动画可见项(前20个) |
| **E2 FLIP展开折叠** | 分类头点击 | `Flip.getState()` → toggle → `Flip.from()` | 0.4s `velvetSpring` |
| **E3 悬浮3D倾斜** | 鼠标悬停卡片 | `use:tilt={{maxDeg:3, perspective:800}}` + `gsap.quickTo()` | quickTo 零GC |
| **E4 缩略图缩放** | 鼠标悬停视频 | `gsap.to(thumb, {scale:1.08})` | 0.35s in / 0.3s out |

---

### F. 模态框系统 — Modal.svelte

| 效果 | 触发 | 实现 | 时长 |
|------|------|------|------|
| **F1 绽放入场** | 打开 | 背景 opacity:0→1 + 模态框 `{scale:0.78, y:40, rotation:-0.5, blur:16px}→完整` | 0.55s `velvetSpring` |
| **F2 深度背景** | 打开 | CSS `backdrop-filter: blur(16px) saturate(1.4)` + opacity 动画 | 跟随F1 |
| **F3 物理退出** | 关闭 | `{scale:0.88, y:24, blur:6px, opacity:0}` | 0.3s `power2.in` |
| **F4 内容交错** | F1完成后 | 子元素 `{opacity:0, y:15}→{完整}` stagger:0.05s | 0.3s `velvetSpring` |

---

### G. Toast 通知 — Toast.svelte

| 效果 | 触发 | 实现 |
|------|------|------|
| **G1 弹性滑入** | 创建 | `{x:140, scale:0.6, rotation:3, blur:12px}→{完整}` 0.55s `velvetSpring` |
| **G2 计时环** | 创建 | 纯CSS `@keyframes ai-toast-timer` width 100%→0% (保留的3个之一) |
| **G3 堆栈重排** | 增/删Toast | `Flip.getState()` → DOM变化 → `Flip.from()` 0.3s |
| **G4 类型化入场** | 类型参数 | success=弹跳scale / error=滑入+震动 / warning=从上方落下 / info=标准弹性滑 |
| **G5 滑出退场** | 超时/关闭 | `{x:140, scale:0.78, rotation:2, blur:4px, maxHeight:0}` 0.35s |

---

### H. 文字特效

| 效果 | 组件 | 实现 |
|------|------|------|
| **H1 文字解码** | LogArea | 方案a: 纯JS字符乱码25ms逐位解码 / 方案b: SplitText + stagger:0.015s |
| **H2 数字翻滚** | 统计显示 | Svelte `tweened()` + scale弹跳 |
| **H3 渐变流动标题** | Header | 保留CSS `@keyframes ai-aurora-flow` 18s循环 (保留的3个之一) |

---

### I. 粒子系统

| 效果 | 实现 | 性能 |
|------|------|------|
| **I1 极光画布** | 保留 Canvas2D 渲染器, 替换独立 RAF → `gsap.ticker.add()` 统一循环 | 50% 分辨率 |
| **I2 光标散射** | mousemove 80ms节流 30%生成率, 每粒子 `gsap.fromTo()` | 最多~5并发 |
| **I3 彩纸庆祝** | **Physics2D** 重力模拟: `{physics2D: {velocity:200-600, angle:-90±60, gravity:600-800}}` | 60粒子, 自移除 |
| **I4 星云漂移** | 保留CSS环境粒子, 交互部分同步到 gsap.ticker | 静态CSS |
| **I5 丝线网络** | 保留 Canvas2D (Lumen Drift), 同步到 gsap.ticker | 40% 分辨率 |

---

### J. 主题切换 — 全局

| 效果 | 触发 | 实现 |
|------|------|------|
| **J1 圆形揭示** | 主题Toggle点击 | 全屏遮罩 `clip-path: circle(0→maxRadius)` + 40%时切换data-theme | 0.6s `power2.out` |
| **J2 主题图标旋转** | 主题Toggle | `gsap.to(icon, {rotation:360, scale:0.3})` → `{rotation:720, scale:1}` | 0.25s+0.35s |
| **J3 色彩插值** | 主题色切换 | 动画 `{r,g,b}` 代理对象, onUpdate设置CSS变量 | 0.5s `power2.inOut` |

---

### K. 拖拽系统 — GSAP Draggable

| 效果 | 组件 | 实现 |
|------|------|------|
| **K1 按钮拖拽** | FloatButton | `Draggable.create(btn, {bounds:'body', edgeResistance:0.75, inertia:true})` + 拖拽中 scale:0.9 |
| **K2 面板拖拽** | Panel header | `Draggable.create(panel, {trigger:header, bounds:'body', inertia:false, cursor:'grab'})` |
| **K3 位置持久化** | 两者 | onDragEnd → `GM_setValue` 保存位置 / onMount → `GM_getValue` 恢复 |

---

### Svelte vs GSAP 分工原则

| 用 Svelte 内置 | 用 GSAP |
|----------------|---------|
| 简单进出场 (`transition:fly/fade/scale`) | 复杂多步时间线 (`gsap.timeline()`) |
| 列表重排 (`animate:flip`) | FLIP 布局变形 (`Flip.from()`) |
| 反应式数值插值 (`tweened()`, `spring()`) | 磁性/倾斜鼠标追踪 (`gsap.quickTo()`) |
| 组件挂载/卸载 | 粒子物理 (`Physics2D`) |
| | 路径动画 (`MotionPath`) |
| | 拖拽惯性 (`Draggable`) |
| | 文字拆分 (`SplitText`) |
| | 自定义缓动 (`CustomEase`, `CustomBounce`) |

### 性能预算

- **目标**: 中端硬件 60fps (i5 / Ryzen 5, 核显)
- **产物体积**: GSAP 通过 CDN `@require` 加载 (用户浏览器缓存)，userscript 自身体积大幅缩小
  - GSAP 核心 (~70 kB gz) + Flip (~8 kB) + Draggable (~12 kB) + CustomEase (~4 kB) = ~94 kB 由 CDN 承担
  - userscript 自身目标: <200 kB (不含 CDN 依赖)
- **最大并发 GSAP tween**: ~20 (`overwrite: 'auto'`)
- **最大 DOM 粒子**: ~80 (confetti 60 + scatter 5 + trail 3 + orbs 5 + dust 8)
- **Canvas**: 同时最多 1 个 (从当前 MAX=6 减少)
- **Canvas 分辨率**: 35-50% 面板尺寸
- **GSAP ticker 回调**: 最多 2 个 (1 canvas + 1 交互)
- **鼠标追踪**: 全部使用 `gsap.quickTo()` 或 RAF guard
- **CSS 迁移后**: 22,072行 → ~2,500行, 484 @keyframes → 3 个, 70+ 缓动变量 → 0

### 三级减弱动画策略

| 层级 | 触发条件 | 行为 |
|------|----------|------|
| **Tier 1 OS偏好** | `prefers-reduced-motion: reduce` | 所有动画禁用，瞬间状态切换 |
| **Tier 2 用户关闭** | `animEnabled === false` | 装饰性动画禁用，功能动画简化为淡入 |
| **Tier 3 全开** | `animEnabled === true` 且无OS偏好 | 所有效果启用 |

**始终启用** (功能性): D1进度条, D5数字, D6骨架屏, C4聚焦, C5开关, J1主题, K1-K3拖拽, G2计时, G3堆栈
**需 animEnabled** (装饰性): 所有A, B4-B5, C1-C3/C6-C7, D2-D4, 所有E, F4, G4, H1-H2, 所有I

---

## Phase 3: CSS 激进清理

**目标**：22,072 行 → ~2,500 行 (全局CSS), 484 @keyframes → 3 个

- **删除 481 个 @keyframes** — 所有动画迁移到 GSAP, 仅保留:
  - `shimmer` (骨架屏微光)
  - `ai-aurora-flow` (标题渐变流动)
  - `ai-toast-timer` (计时环)
- **删除 70+ 缓动 CSS 变量** — 全部迁移到 GSAP `CustomEase`
- **79 个主题色 → 10-15 个精选** + 自定义颜色选择器 (已有 `applyCustomAccent`)
- 大部分组件样式迁移到 Svelte `<style>` 块 (自动 scoped)
- 删除重复样式、过度 `!important` (Svelte scoped CSS 天然高特异性)
- 全局 CSS 仅保留: 变量定义、基础重置、Dark Reader 隔离、3 个 @keyframes

---

## Phase 4: 代码质量提升

### TypeScript 类型系统
- `Settings` 接口 (23 个字段)
- `AIProvider` 接口 (name, format, baseUrl, models)
- `VideoResource` 接口 (id, title, bvid, upper, etc.)
- `CategoryResult` 类型 (AI 分类结果)
- `FavFolder` 接口 (id, title, media_count)

### 安全加固
- 移除 `@connect *` 通配符
- 审查所有 innerHTML → 使用 Svelte 模板 (自动转义)
- 验证自定义 API URL 格式

### 常量提取
- 超时时间、页面大小、缓存 TTL、z-index 等 → `constants.ts`

### 错误处理
- 定义 `AIProviderError`, `BilibiliAPIError` 等错误类型
- 统一通过 Toast 和 LogArea 向用户展示错误

### 日志清理
- 移除 21 个 `console.log` → 开发模式条件日志

---

## Phase 5: 性能优化

- **设置读取**：17 次 `GM_getValue` → 单次读取 + 内存缓存
- **虚拟滚动**：Preview 中大量视频列表使用虚拟滚动
- **Canvas 效果**：面板隐藏时暂停 `requestAnimationFrame`
- **事件管理**：`AbortController` 管理生命周期

---

## 实施顺序

1. **Phase 0**: 搭建 Vite + Svelte + TypeScript 构建系统
2. **Phase 1**: 创建组件架构，逐步迁移功能
3. **Phase 2**: 在组件中实现极致动画效果
4. **Phase 3**: CSS 清理 (随 Phase 1 同步进行)
5. **Phase 4**: TypeScript 类型、安全加固、代码质量
6. **Phase 5**: 性能优化

---

## 验证方案

1. 构建产出检查：`npm run build` → 确认生成合法的 userscript
2. 在 Tampermonkey 中安装 `dist/*.user.js`，访问 `space.bilibili.com`
3. 验证：浮动按钮显示 → 点击打开面板 → 设置保存/加载 → AI 调用 → 视频整理
4. 对比原版功能完整性
5. 检查暗色模式、主题切换、动画效果

---

## 关键文件

- `bilibili-favorites-ai-organizer.user.js` (原始 JS, 6,949 行)
- `bilibili-favorites-ai-organizer.css` (原始 CSS, 22,072 行)
- `README.md` (文档)
- `dist/bilibili-ai-favorites-organizer.user.js` (构建产物, ~409 kB)
