# 视觉增强计划 — Session 38

## 目标

赋予所有数据展示型 Modal（结果列表、统计、时间线、选择器）**触觉深度感**——让每一个列表项、卡片、时间线节点在悬浮/点击/入场时都有物理可感的层次变化，消灭最后的"扁平死区"，使整个面板从核心交互到数据展示全链路像素级精致。

**主题**: "Tactile Depth — 触觉深度"

**原则**：不新建文件，仅在已有文件中添加 CSS keyframes + transitions + 少量 GSAP 逻辑，使数据展示组件与核心交互组件齐平。

---

## 与已有视觉计划的关系

- **Session 27–37** 已完成核心面板、Modal 框架、设置面板、表单控件、预览区域、次级组件的动画增强
- 本次聚焦：**数据展示 Modal** (DeadVideosResult/DuplicatesResult/StatsDialog/HistoryTimeline/FolderSelector) + **共享 CSS** (modal.css/forms.css) 中的列表/卡片/按钮微交互

---

## 具体改动

### 1. DeadVideosResult.svelte — 列表深度 + 滚动渐隐 + 文件夹组入场

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| folder-list 滚动渐隐 | CSS `mask-image` 上下 12px 渐隐 | 与 FolderSelector/Modal 策略统一，暗示列表可滚动 |
| video-item 悬浮阴影提升 | CSS `:hover` 添加 `box-shadow` + `translateY(-1px)` | 悬浮时列表项"浮起"，增加物理触感 |
| folder-header 悬浮图标微放大 | CSS `.folder-header:hover` emoji 通过 `display:inline-block` + `transform: scale(1.15)` | 文件夹图标悬浮时微放大，增加交互暗示 |
| video-item 左侧主题色条 | CSS `.video-item:hover` 添加 `border-left: 2px solid var(--ai-primary)` 过渡 | 悬浮时左侧出现主题色标识线 |

### 2. DuplicatesResult.svelte — 列表提升 + 滚动渐隐 + 文件夹标签入场

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| dup-list 滚动渐隐 | CSS `mask-image` 上下 12px 渐隐 | 统一滚动可视暗示 |
| dup-item 悬浮阴影提升 | CSS `:hover` 添加 `box-shadow` + `translateY(-1px)` | 物理抬升感 |
| dup-folders 悬浮展开 | CSS `.dup-item:hover .dup-folders` 添加 `opacity 0.6→1` + `translateX(0→2px)` | 悬浮时子文件夹信息更醒目、微右移 |
| dup-title 悬浮主题色 | CSS `.dup-item:hover .dup-title` 颜色过渡到 `--ai-primary` | 悬浮时标题变主题色，引导视线 |

### 3. StatsDialog.svelte — 健康环发光 + 卡片入场弹跳 + 分布列表渐隐

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| health-ring 外发光 | CSS `.health-ring` 添加 `filter: drop-shadow(0 0 8px healthColor)` | 健康分数环有对应颜色的柔和光晕 |
| stat-card 入场弹入 | CSS `@keyframes cardPop` 配合 `:nth-child` 错位延迟 | 四个统计卡片依次弹入，避免整块瞬间出现 |
| folder-breakdown 滚动渐隐 | CSS `mask-image` 上下 12px | 长收藏夹列表边缘渐隐 |
| section-title 下划线渐展 | CSS `::after` + `scaleX(0→1)` 过渡 | 标题下方出现渐展主题色线 |
| folder-row 悬浮内发光 | CSS `:hover` 添加 `box-shadow: inset` | 悬浮时行内侧发出柔光 |

### 4. HistoryTimeline.svelte — 时间线绘入 + 卡片内发光 + 清空确认增强

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| timeline 轴线绘入 | CSS `::before` 添加 `@keyframes lineGrow` (scaleY 0→1) | 时间线垂直轴从上到下"画出"，配合 item slideIn |
| timeline-card 悬浮内发光 | CSS `:hover` 添加 `box-shadow: inset` 主题色 | 悬浮时卡片内部发出柔和主题色光 |
| timeline-cats 标签化 | CSS `.timeline-cats` 添加 `background` + `border-radius` + 悬浮展开 | 分类文字变为类标签样式，更有结构感 |
| clear-btn 悬浮危险光晕 | CSS `.clear-btn:hover` 添加 `box-shadow` 红色光晕 | 清空按钮悬浮时有红色警示光晕 |

### 5. FolderSelector.svelte — 全选按钮脉冲 + 选中态增强 + 计数弹入

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| toggle-all 点击脉冲 | CSS `.toggle-all:active` 添加 scale(0.95) + box-shadow 脉冲 | 点击全选时有按压回弹感 |
| selected folder-title 加粗+主题色 | CSS `.selected .folder-title` 颜色过渡 | 选中时文件夹名称变主题色+加粗，增强选中可见性 |
| count 数字弹入 | CSS `.count` 添加 `countPop` 动画 (复用 modal.css) | 计数文字入场弹入 |
| toggle-all icon 切换旋转 | CSS `toggle-all :global(svg)` 添加 transition rotate | 全选/取消全选图标切换时微旋转 |

### 6. modal.css — 动作栏入场 + 提示文字渐显 + "更多"省略号脉冲

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| action-bar 按钮图标弹入 | CSS `.bfao-btn :global(svg)` 入场 scale(0→1) | 动作栏按钮内图标弹入入场 |
| hint 文字渐显 | CSS `.bfao-modal-hint` 添加 `hintFadeIn` 动画 (opacity+translateY) | 提示文字从下方渐显，不与主内容争夺注意力 |
| modal-more 省略号呼吸 | CSS `.bfao-modal-more` 添加 `opacity` 脉冲动画 | "...及其他 N 个"文字有柔和呼吸效果，暗示还有更多 |
| btn 悬浮图标微移 | CSS `.bfao-btn:hover :global(svg)` 添加 `translateY(-1px)` | 按钮悬浮时图标微上浮 |

### 7. forms.css — select 箭头动画 + checkbox 悬浮光晕

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| select 聚焦箭头旋转 | CSS `.bfao-select:focus` 配合 `appearance` 自定义箭头旋转 | 下拉框聚焦时箭头微旋转暗示"已展开" |
| checkbox 悬浮光环 | CSS `input[type='checkbox']:hover` 添加 `box-shadow` | 复选框悬浮时有主题色光环 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-37 核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~200 行 CSS + ~10 行 JS (7 个文件)，无新文件
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 重点体验提升：数据展示 Modal 从"功能正确但视觉平淡"升级为"触觉可感的精致交互"
