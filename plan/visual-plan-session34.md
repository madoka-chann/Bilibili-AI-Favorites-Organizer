# 视觉增强计划 — Session 34

## 目标

强化界面的"流畅连续感"——让滚动、状态切换、组件挂载等过渡时刻不再生硬。前 33 次 Session 已覆盖所有组件的入场/悬浮/状态动画，但存在 6 处"状态断裂"：Modal 长内容滚动无边界暗示、ProgressBar 瞬间出现/消失、设置面板 toggle 行悬浮反馈平淡、FolderSelector 滚动列表缺乏边缘呼吸、LiquidToggle 挂载时无入场感、Panel 长内容滚动无位置感知。本次聚焦"过渡间隙的补缝"。

**主题**: "Flow & Continuity — 流畅连续感"

**原则**：不新建组件文件，仅在已有文件中添加 CSS + 少量 GSAP 逻辑，填补过渡断裂。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件 contentStagger/pressEffect
- **visual-plan-session28.md** 已完成 4 个面板主界面组件视觉增强
- **visual-plan-session29.md** 已完成 5 个设置面板组件动画增强
- **visual-plan-session30.md** 已完成 PreviewConfirm 深度视觉 + 全局滚动条/焦点环
- **visual-plan-session31.md** 已完成 tilt/glowTrack 激活 + Modal 统一增强 + FloatButton 回场
- **visual-plan-session32.md** 已完成 ripple 扩展 + Header 文字流光 + Toast 图标动画
- **visual-plan-session33.md** 已完成对话框细节打磨 (UndoDialog/HistoryTimeline/HelpDialog 等)
- 本次聚焦：**Modal 滚动边缘渐隐 + ProgressBar 入场/退场 + SettingsPanel 行悬浮微滑 + FolderSelector 滚动边缘 + LiquidToggle 入场 + Panel 滚动指示器**

---

## 具体改动

### 1. Modal.svelte — 滚动内容边缘渐隐

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 顶部/底部渐隐遮罩 | CSS `::before` + `::after` 伪元素 on `.modal-body` with `pointer-events: none` | 当内容可滚动时，顶部/底部出现 16px 渐隐带，暗示内容延伸；通过 JS scroll 事件动态控制 class (`.scrolled-top` / `.scrolled-bottom`) 决定显隐 |
| 滚动状态检测 | `onscroll` + `onMount` 检测 scrollTop/scrollHeight | 初始状态只显示底部渐隐（内容在下方），滚动到底只显示顶部渐隐，中间两端都显示 |

### 2. ProgressBar.svelte — 入场/退场过渡

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 容器入场 | CSS `@keyframes progressEnter` (opacity 0→1, translateY 8→0, scaleY 0.8→1) | `$isRunning` 变为 true 时进度条从底部浮入，避免瞬间出现 |
| 完成后退场 | CSS `@keyframes progressExit` (opacity 1→0, translateY 0→-8, scaleY 1→0.8) 配合延迟 | 完成庆祝后延迟消失而非瞬间移除 |

### 3. SettingsPanel.svelte — toggle-row 悬浮微滑 + 标签颜色过渡

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| toggle-row 悬浮右移 | CSS `:hover` 添加 `transform: translateX(3px)` | 悬浮时行向右轻移 3px，暗示可操作，与 PromptEditor preset-row 统一 |
| toggle-row 标签悬浮变色 | CSS `:hover span` color 从 `--ai-text-secondary` 变为 `--ai-text` | 悬浮时文字加深，增强可读性 |

### 4. FolderSelector.svelte — 列表悬浮发光 + 滚动边缘渐隐

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| folder-list 滚动边缘渐隐 | CSS mask-image linear-gradient 上下渐隐 | 长列表滚动时上下边缘渐隐，暗示内容延伸 |
| selectable-item 悬浮发光 | CSS `:hover` 增强 box-shadow 内发光 | 悬浮时项目边框轻柔内发光，比单纯 border-color 变化更有深度 |

### 5. LiquidToggle.svelte — 挂载入场动画

**文件**: `src/components/LiquidToggle.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 挂载缩放入场 | GSAP `gsap.from(trackEl, { scale: 0.6, opacity: 0, ... })` on mount | 开关首次渲染时从小弹入，与 SettingsGroup 子元素交错配合产生级联效果 |

### 6. Panel.svelte — 滚动进度指示条

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 顶部极细进度条 | CSS `.scroll-indicator` (height 2px, background primary gradient) + JS scroll 事件 | panel-content 滚动时顶部出现 2px 宽的进度条，宽度 = scrollTop / (scrollHeight - clientHeight)，从左到右增长 |
| 渐现/渐隐 | CSS `opacity` transition | 未滚动时隐藏（opacity 0），开始滚动后显现 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-33 组件动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~100 行 CSS + ~40 行 JS (6 个文件)，无新文件
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 重点体验提升：长内容滚动的"边界感知" + 状态切换的"平滑过渡"
