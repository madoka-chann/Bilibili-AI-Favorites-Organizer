# 视觉增强计划 — Session 37

## 目标

深化"流体深度感"——为剩余交互密度较低的次级组件补齐微交互层次，让整个面板从头到尾无死角地呈现灵动、有呼吸感的体验。重点攻克 PromptEditor 预设管理器、LogArea 滚动视觉、ModelSelector 下拉交互、HelpDialog 答案揭示、全局焦点环动画、以及运行态按钮呼吸光晕。

**主题**: "Fluid Depth — 流体深度"

**原则**：不新建组件文件，仅在已有文件中添加 CSS + 少量 JS/GSAP 逻辑，使次级组件的交互密度与核心组件齐平。

---

## 与已有视觉计划的关系

- **Session 27–36** 已完成核心面板、Modal、设置面板、表单控件、预览区域等主要区域的动画增强
- 本次聚焦：**次级交互组件** (PromptEditor/LogArea/ModelSelector/HelpDialog) + **全局视觉系统** (焦点环/主题过渡) + **运行态反馈**

---

## 具体改动

### 1. PromptEditor.svelte — 预设管理器开合动画 + textarea 聚焦呼吸

**文件**: `src/components/PromptEditor.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 预设管理器展开/折叠高度过渡 | GSAP `height: 0 → auto` + `opacity` 动画，替代瞬间 `{#if}` 显示 | 管理器面板平滑滑出而非瞬间出现，与 HelpDialog FAQ 展开统一 |
| textarea 聚焦微扩展 | CSS `.prompt-textarea:focus` 添加 `height: 72px` (基础 65px + 7px) 过渡 | 聚焦时编辑区轻微扩展，暗示"进入编辑模式"，失焦回缩 |
| 保存按钮成功反馈 | CSS `@keyframes saveFlash` 保存后按钮短暂绿色闪烁 | 保存预设后给用户明确的成功反馈 |
| 管理器标题入场 | CSS `.manager-title` 添加下划线渐展 (`::after scaleX 0→1`) | 标题下方出现主题色渐变线，增强层次感 |

### 2. LogArea.svelte — 滚动渐隐边缘 + 新条目发光 + 猫咪回场

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 上下滚动边缘渐隐 | CSS `mask-image: linear-gradient(...)` 上下 8% 渐隐 | 与 FolderSelector/Modal 滚动渐隐策略统一，暗示可滚动 |
| 新日志条目入场发光 | CSS `.log-entry:last-child` 添加短暂 `box-shadow` 脉冲 | 最新一条日志有柔和发光，引导视线到最新内容 |
| 猫咪回场弹入 | CSS `.log-cat:not(.away)` 添加 `catReturn` 动画 (scale+translateY 弹入) | 运行结束后猫咪从隐藏状态弹回，增加趣味性 |
| 日志区域聚焦指示 | CSS `.log-area:hover` 添加 `border-color` 变化 | 悬浮时边框微亮，暗示可交互区域 |

### 3. ModelSelector.svelte — 下拉项悬浮发光 + 搜索聚焦 + 空状态

**文件**: `src/components/ModelSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| model-item 悬浮内发光 | CSS `.model-item:hover` 添加 `box-shadow: inset` | 悬浮时内侧发出主题色柔光，与 FolderSelector 统一 |
| active item 左边框脉冲 | CSS `.model-item.active` 添加 `activePulse` box-shadow 动画 | 当前选中项左边框有呼吸脉冲，增强选中感 |
| model-search 聚焦下划线 | CSS `.model-search:focus` 添加 `::after` 或 `box-shadow` 展开 | 搜索框聚焦时底部出现主题色指示线 |
| model-list 滚动渐隐 | CSS `.model-list` 添加 `mask-image` 上下渐隐 | 长列表边缘渐隐，与整体滚动策略一致 |
| model-empty 浮动 | CSS `.model-empty` 添加 `floatIdle` 动画 | 空搜索结果轻微浮动，与 modal 空状态统一 |

### 4. HelpDialog.svelte — FAQ 悬浮缩进 + 答案文字渐显 + 问号图标旋转

**文件**: `src/components/HelpDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| FAQ item 悬浮缩进 | CSS `.faq-item:hover` 添加 `padding-left: 24px` 过渡 (基础 20px) | 悬浮时问题行向右微移，增加可操作暗示 |
| 展开项左侧主题色条 | CSS `.faq-item.open` 添加 `border-left: 3px solid var(--ai-primary)` | 展开的问题左侧出现主题色竖条，标识当前展开项 |
| 答案文字渐显 | CSS `.faq-a` 内容在展开时从 `opacity 0` 过渡到 `1`，配合已有 GSAP height 动画 | 答案文字随高度展开同时渐显，避免文字先出现再被高度裁剪 |
| 问号图标悬浮旋转 | CSS `.faq-icon` 悬浮时 `rotate(15deg)` + `scale(1.1)` | 问号圆圈悬浮时微旋放大，增加趣味性 |

### 5. variables.css — 焦点环入场动画 + 全局色彩过渡平滑

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| focus-visible 环扩展动画 | CSS `outline-offset` 从 `0px` 过渡到 `2px` + `@keyframes focusRingIn` | 键盘焦点环从紧贴元素逐渐扩展到 2px offset，比瞬间出现更优雅 |
| 全局 color/background 过渡 | `.bfao-app` 添加 `transition: color 0.3s, background-color 0.3s` 到通配规则 | 主题切换时所有文字和背景色平滑过渡而非瞬间跳变 |

### 6. ActionButtons.svelte — 运行态呼吸光晕

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| running 按钮边框呼吸光晕 | CSS `.btn-primary.running` 增强现有 `runningPulse` 添加 `border` 脉冲 | 运行中按钮不仅有 box-shadow 脉冲，边框也有微妙的亮度变化 |
| 停止图标持续微颤 | CSS `.btn-primary.running :global(svg)` 添加 `tremor` 动画 | 运行中的方块图标有持续微颤，暗示"正在工作中，点我可停止" |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-36 组件核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~160 行 CSS + ~30 行 JS/GSAP (6 个文件)，无新文件
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 重点体验提升：次级组件从"功能正确但视觉平淡"升级为"与核心组件同等精致"
