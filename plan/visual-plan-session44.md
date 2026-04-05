# 视觉增强计划 — Session 44

## 目标

**Luminous Breath — 光韵呼吸**：让静态状态拥有生命感。前 43 轮已完成全组件动画覆盖、纵深层次感和触感共振，本轮聚焦于 **静态元素的微弱呼吸**（toggle 内光、badge 流光、timeline 最新条目光晕）、**状态过渡的丝滑感**（expand-btn 弹簧旋转、folder 选中态渐变迁移、category badge 微光扫过）、**交互反馈的完整闭环**（remove-btn 图标旋转退场、stat-card 数字悬浮放大、folder-row 序号渐显）。

**主题**: "Luminous Breath — 光韵呼吸"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~10 行 JS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–43** 已完成所有组件的独立动画 + 微交互 + 感知表面 + 丝绒纵深 + 触感共振
- 本次聚焦：**静态元素呼吸感** + **状态过渡丝滑感** + **交互反馈完整闭环**

---

## 具体改动

### 1. LiquidToggle.svelte — Thumb 内光 + Track 呼吸脉冲 + 悬浮预览微移

**文件**: `src/components/LiquidToggle.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Thumb ON 内光 | CSS `.liquid-toggle.on .thumb` 添加 `thumbGlow` 动画 (box-shadow 内发光 2.5s infinite) | ON 状态下拇指有微弱呼吸光，暗示"活跃" |
| Track 悬浮微光 | CSS `.liquid-toggle:hover` box-shadow 增强 (添加 0 0 16px 外光晕) | 悬浮时轨道有柔和外发光暗示可交互 |
| 悬浮 thumb 微移 | CSS `.liquid-toggle:hover .thumb` translateY(-0.5px) 微提升 | 悬浮时拇指有极微弱的提升感 |

### 2. CategoryGroup.svelte — Badge 流光扫过 + expand-btn 弹簧旋转 + remove-btn 图标旋转

**文件**: `src/components/preview/CategoryGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| badge-new 流光扫过 | CSS `.badge-new::after` shimmer 伪元素 (badgeShimmer translateX -100%→100% + 白色渐变) | "新建" 标签有流光扫过效果，吸引注意力 |
| expand-btn 弹簧旋转 | CSS `.expand-btn.expanded` 改用 cubic-bezier overshoot (rotate 90deg + bounce) | 展开箭头旋转时有弹簧过冲回弹感 |
| remove-btn 图标旋转 | CSS `.remove-btn:hover :global(svg)` rotate(-90deg) 过渡 | 移出按钮悬浮时 LogOut 图标有旋转退场暗示 |

### 3. HistoryTimeline.svelte — 最新条目光晕 + 时间戳悬浮展开 + 分类标签悬浮亮化

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 最新条目持续光晕 | CSS `.timeline-item:first-child .timeline-card` 添加 `latestGlow` 动画 (box-shadow 呼吸 3s) | 最新的整理记录有持续微弱光晕，暗示"刚刚发生" |
| 时间戳悬浮展开 | CSS `.timeline-item:hover .timeline-time` letter-spacing 0→0.03em + color 变主题色 | 悬浮时时间文字有排版展开感 |
| 分类标签悬浮提升 | CSS `.timeline-item:hover .timeline-cats` translateY(-1px) + 边框显现 | 分类标签悬浮时微提升并显现品牌色边框 |

### 4. FolderSelector.svelte — 选中文件夹标题加粗过渡 + toggle-all 图标动画 + 计数弹色

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 选中标题 font-weight 过渡 | CSS `.selected .folder-title` font-weight 600→700 过渡 (font-variation-settings 或直接 transition) | 选中文件夹标题有微妙加粗变化 |
| toggle-all 全选时脉冲 | CSS `.toggle-all:active` 扩散脉冲 (::after scale 1→1.4 + opacity 消失) | 点击全选时有交互确认脉冲 |
| folder-count 悬浮变色 | CSS `.folder-row:hover .folder-count` (在 :global(.bfao-selectable-item:hover) 内) color 变主题色 | 悬浮时视频计数变品牌色增强信息层次 |

### 5. StatsDialog.svelte — stat-value 悬浮放大 + folder-row 序号 + health-detail 渐显

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| stat-value 悬浮放大 | CSS `.stat-card:hover .stat-value` scale(1.08) + text-shadow 增强 | 悬浮统计卡片时数字有放大和光晕增强 |
| folder-row 序号渐显 | CSS `.folder-row` counter-reset + `::before` 序号 (counter-increment + 圆形徽章) | 收藏夹列表每行前有序号增强结构 |
| health-detail 渐显 | CSS `.health-detail` fadeSlideUp 入场动画 (opacity 0→1, translateY 6px→0) | 健康说明文字有向上渐显入场 |

### 6. forms.css — select 下拉箭头悬浮旋转 + 表单组间距呼吸 + textarea 聚焦边框渐变

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| select 箭头悬浮旋转 | CSS `select:hover` 背景中的 chevron SVG 添加 180deg 旋转暗示 (background-position 过渡) | 下拉框悬浮时箭头有微妙位移暗示可点击 |
| textarea 聚焦渐变边框 | CSS `textarea:focus` border-image 渐变 (primary→accent 渐变边框) | 文本域聚焦时边框变为品牌色渐变 |
| input 数字滚轮悬浮 | CSS `input[type="number"]:hover` 内凹阴影 (shadow-inset) | 数字输入框悬浮时有凹陷暗示可滚动调节 |

### 7. variables.css — 呼吸光晕令牌 + 流光扫过令牌

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 呼吸光晕令牌 | `--ai-glow-breath` 定义微弱呼吸光晕 (box-shadow 值, light/dark 各一) | 统一呼吸光晕供 LiquidToggle/HistoryTimeline 复用 |
| 流光扫过基色 | `--ai-shimmer-color` 定义流光扫过的白色/半透明色 (light/dark 各一) | 统一流光色供 CategoryGroup badge 等复用 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-43 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~10 行 JS (7 个文件)，1 个新计划文件
- LiquidToggle ON 状态拇指有呼吸内光，轨道悬浮有柔和外光
- CategoryGroup "新建" badge 有流光扫过，展开箭头有弹簧回弹
- HistoryTimeline 最新条目持续微光，悬浮时时间戳和分类标签有细腻反馈
- FolderSelector 选中标题有微妙加粗，全选按钮有脉冲确认
- StatsDialog 数字悬浮放大发光，收藏夹列表有序号结构
- forms.css 下拉/文本域聚焦更有质感
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
