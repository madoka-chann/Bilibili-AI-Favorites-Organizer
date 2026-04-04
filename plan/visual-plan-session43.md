# 视觉增强计划 — Session 43

## 目标

**Tactile Resonance — 触感共振**：让每个交互都有真实的物理回馈感。前 42 轮已完成全组件动画覆盖和纵深层次感，本轮聚焦于 **交互反馈的物理感**（图标翻转、脉冲扩散、弹性弹出）、**状态切换的流动性**（选中项光环迁移、下拉退场、字段入场弹性）、**结构化微细节**（文件夹分隔线、选中条、空状态增强）。

**主题**: "Tactile Resonance — 触感共振"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~200 行 CSS + ~15 行 JS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–42** 已完成所有组件的独立动画 + 微交互 + 感知表面 + 丝绒纵深
- 本次聚焦：**交互反馈物理感** + **状态切换流动性** + **结构化微细节**

---

## 具体改动

### 1. ProviderConfig.svelte — Eye 图标翻转 + link-btn 悬浮光环 + field-slide-in 弹性增强

**文件**: `src/components/ProviderConfig.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Eye 图标翻转 | CSS `.bfao-icon-btn :global(svg)` rotateY 过渡 (show→180deg→0deg 翻转感) | 切换显示/隐藏时图标有翻转的物理感 |
| link-btn 悬浮脉冲环 | CSS `.link-btn::after` 扩散脉冲 (scale 0→1.5 + opacity 1→0) | 外链按钮悬浮时有能量扩散暗示"跳转" |
| field-slide-in 弹性 | CSS `fieldSlideDown` 增加 overshoot (translateY 0→-2px→0) | 自定义 URL 字段入场有弹性回弹 |

### 2. ModelSelector.svelte — 测试成功扩散脉冲 + 下拉退场 + active 左条加粗

**文件**: `src/components/ModelSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 测试成功扩散脉冲 | CSS `.test-success::after` 扩散环 (testRadialPulse scale 0→2 + opacity 1→0) | 测试成功时按钮有向外扩散的成功脉冲 |
| 测试失败红色脉冲 | CSS `.test-error::after` 红色扩散环 (同上，error 色) | 测试失败时有错误色扩散 |
| active 项左条加粗过渡 | CSS `.model-item.active` inset box-shadow 过渡 (3px→4px 带 transition) | 选中模型的左侧色条有微妙加粗反馈 |

### 3. modal.css — 选中项脉冲环 + btn 悬浮图标微移增强 + hint 下划线

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 选中项内发光脉冲 | CSS `.bfao-selectable-item.selected` 持续内发光脉冲 (selectedGlow 2.5s) | 选中的单选/复选项有持续的品牌色内发光 |
| btn-muted 悬浮背景渐变 | CSS `.bfao-btn-muted:hover` background 渐变过渡 (向品牌色偏移) | 次要按钮悬浮时有更明显的品牌色暗示 |
| modal-hint 下划线渐展 | CSS `.bfao-modal-hint::after` scaleX(0→1) 下划线 | 提示文字有从左到右的品牌色下划线渐展 |

### 4. DeadVideosResult.svelte — 文件夹头悬浮图标弹跳 + 组间分隔线 + body 滚动渐隐

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| folder-header 悬浮图标弹跳 | CSS `.folder-header:hover` 📁 emoji translateY -2px 弹跳 | 文件夹头悬浮时图标有弹跳反馈 |
| folder-group 间分隔线 | CSS `.folder-group + .folder-group::before` 渐变分隔线 | 不同收藏夹之间有品牌色渐变分隔 |
| modal-body 滚动渐隐 | CSS `.folder-list` mask-image 上下渐隐 | 长列表上下渐隐暗示可滚动 |

### 5. UndoDialog.svelte — 选中项左侧主题色条 + hint 渐显下划线 + empty 增强摆动

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 选中项左侧色条 | CSS `.bfao-selectable-item.selected` box-shadow inset 3px 主题色 | 选中的撤销操作有左侧品牌色指示条 |
| hint 渐显 + 下划线 | CSS `.hint::after` scaleX(0→1) 品牌色下划线 | 提示文字有渐展下划线增强引导 |
| empty 摆动增强 | CSS `.bfao-modal-empty` emptyFloat 增加微旋转 (rotate ±1deg) | 空状态文字有更灵动的摆动 |

### 6. PreviewToolbar — 搜索框清空按钮旋转 + tab 切换弹性 + 计数徽章悬浮放大

**文件**: `src/components/preview/PreviewToolbar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 搜索清空按钮旋转 | CSS `.search-clear:hover svg` rotate(90deg) 过渡 | 清空按钮悬浮时 X 图标旋转增加动感 |
| tab 按钮切换弹性 | CSS `.filter-btn.active` scale 弹入 (0.95→1.02→1) | 切换 tab 时有弹性缩放反馈 |
| 计数徽章悬浮放大 | CSS `.filter-count:hover` scale(1.15) + 主题色强化 | 计数徽章悬浮时放大并强化颜色 |

### 7. variables.css — 扩散脉冲令牌 + 选中内发光令牌

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 扩散脉冲令牌 | `--ai-pulse-spread` 定义扩散脉冲的基础颜色和尺寸 | 统一的扩散脉冲样式供 ModelSelector/Toast 复用 |
| 选中内发光令牌 | `--ai-glow-selected` 选中项内发光样式 | 统一选中项内发光供 modal/UndoDialog 复用 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-42 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~200 行 CSS + ~15 行 JS (7 个文件)，1 个新计划文件
- ProviderConfig 切换 API Key 可见性时有翻转感，外链按钮有能量扩散
- ModelSelector 测试结果有扩散脉冲反馈，下拉列表选中更突出
- modal.css 选中项有持续内发光，按钮交互更丰富
- DeadVideosResult 文件夹组间有结构分隔，长列表有滚动暗示
- UndoDialog 选中项有品牌色指示条，空状态更灵动
- PreviewToolbar 搜索交互更有质感，tab 切换更弹性
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
