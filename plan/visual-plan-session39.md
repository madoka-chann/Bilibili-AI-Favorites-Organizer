# 视觉增强计划 — Session 39

## 目标

将预览区 (Preview Area) 从"功能正确但交互平淡"提升为"动感灵动的核心交互区"——预览区是用户操作最频繁的区域（筛选、展开分类、浏览视频、合并分类），却是动画密度最低的板块。本次补齐预览区三大组件的 GSAP 微交互，并顺带增强 ProgressBar、UndoDialog 的剩余视觉死角。

**主题**: "Kinetic Preview — 动感预览"

**原则**：不新建文件，复用已有 GSAP actions (`pressEffect`, `focusGlow`, `checkBounce`, `ripple`) + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。

---

## 与已有视觉计划的关系

- **Session 27–38** 已完成核心面板、Modal 框架、设置面板、表单、数据展示 Modal 的动画增强
- 本次聚焦：**预览区三大组件** (PreviewToolbar / CategoryGroup / VideoItem) + **ProgressBar** token 入场 + **UndoDialog** 滚动渐隐

---

## 具体改动

### 1. PreviewToolbar.svelte — 筛选按钮交互反馈 + 搜索框发光 + 合并模式视觉强化

**文件**: `src/components/preview/PreviewToolbar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| filter-btn 按压回弹 | 引入 `pressEffect` GSAP action (use:pressEffect) | 筛选按钮按下缩小松开弹回，增加物理触感 |
| filter-btn active 切换脉冲 | CSS `@keyframes filterActivate` (box-shadow 扩展+收缩) | 切换 active 时一次性脉冲反馈，比静态 scale 更生动 |
| search-input focusGlow | 引入 `focusGlow` GSAP action (use:focusGlow) | 搜索框聚焦时有 GSAP 品牌发光效果，替代纯 CSS box-shadow |
| merge-btn active 图标旋转 | CSS `.filter-btn.active :global(svg)` rotate(180deg) transition | 合并模式开启时 GitMerge 图标旋转180°，视觉暗示模式切换 |
| preview-stats 数字变色脉冲 | CSS `strong` transition color + scale(1.05) 微弹 | 选中数量变化时数字有微弹反馈 |
| filter-row 错位入场 | CSS `@keyframes filterSlideIn` + nth-child 延迟 | 筛选按钮依次滑入而非整排出现 |

### 2. CategoryGroup.svelte — checkbox 弹跳 + 分类名悬浮变色 + video-list 滚动渐隐 + badge 入场增强

**文件**: `src/components/preview/CategoryGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| checkbox 勾选弹跳 | 引入 `checkBounce` GSAP action (use:checkBounce) | 勾选/取消时 checkbox 有弹跳 + 父元素阴影闪烁 |
| category-name 悬浮变主题色 | CSS `.category-header:hover .category-name` color transition | 悬浮时分类名变主题色，引导视线到可点击区域 |
| video-list 滚动渐隐 | CSS `mask-image` 上下 12px 渐隐 | 与其他列表 (FolderSelector/Modal) 统一的滚动可视暗示 |
| category-count 悬浮弹入 | CSS `.category-header:hover .category-count` scale(1.05) + 主题色背景 | 悬浮时计数标签微放大+变色，增加信息层次 |
| expand-btn 悬浮发光 | CSS `.expand-btn:hover` 添加 box-shadow 主题色 | 展开箭头悬浮时有柔和光环 |
| conf-avg 低置信度脉冲 | CSS `.conf-avg.low` animation pulse (复用 confLowPulse 模式) | 低平均置信度有警告脉冲，与 VideoItem 的 confLowPulse 保持一致 |

### 3. VideoItem.svelte — 悬浮左侧主题色条 + 置信度 badge 入场弹入 + uploader 悬浮展开

**文件**: `src/components/preview/VideoItem.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 悬浮左侧主题色条 | CSS `.video-item:hover` border-left 2px solid var(--ai-primary) 过渡 | 与 DeadVideosResult 的 video-item 悬浮策略统一 |
| conf badge 入场弹入 | CSS `.conf` animation `confPop` (scale 0.5→1.1→1) | 置信度标签弹入入场而非直接出现 |
| uploader 悬浮展开 | CSS `.video-item:hover .video-uploader` opacity 0.7→1 + translateX(2px) | 悬浮时 UP 主名字更醒目并微右移 |
| duration badge 悬浮放大 | CSS `.video-item:hover .video-duration` scale(1.08) + 更亮背景 | 悬浮时时长标签微放大增加可读性 |
| placeholder 渐变流动 | CSS `.video-thumb-placeholder` 添加 `@keyframes placeholderShimmer` | 无封面时占位符有流动渐变，暗示加载中 |

### 4. ProgressBar.svelte — token 统计入场动画 + 阶段标签悬浮 tooltip 感

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| token-stats 入场渐显 | CSS `.token-stats` animation `tokenFadeIn` (opacity + translateY 4px) | Token 统计从下方渐显入场，不与进度条争夺注意力 |
| phase-label 切换微弹 | CSS `.phase-label` transition transform + 悬浮 scale(1.05) | 阶段标签切换时有微弹反馈 |
| progress-cat 悬浮放大 | CSS `.progress-cat:hover` scale(1.3) + filter brightness | 猫咪悬浮时放大+变亮，增加趣味性 (pointer-events: auto) |

### 5. UndoDialog.svelte — history-list 滚动渐隐 + hint 文字入场

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| history-list 滚动渐隐 | CSS `.history-list` mask-image 上下 12px | 列表滚动边缘渐隐，与全局策略一致 |
| hint 文字渐显 | CSS `.hint` animation `hintSlideIn` (opacity + translateY) | 提示文字从下方渐显入场 |
| selected item 内发光 | CSS `.bfao-selectable-item.selected` box-shadow inset | 选中项有持续内发光，增强选中态深度感 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-38 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~20 行 JS (5 个文件)，无新文件
- 预览区交互密度从"稀疏"提升到"与设置面板/Modal 齐平"
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 复用已有 GSAP actions (pressEffect/focusGlow/checkBounce)，零新 JS 函数
