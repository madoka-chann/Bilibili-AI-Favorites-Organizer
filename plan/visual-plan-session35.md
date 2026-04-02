# 视觉增强计划 — Session 35

## 目标

强化"交互深度感"——让表单控件、按钮状态转换、数据展示区域具备更丰富的视觉反馈层次。前 34 次 Session 已覆盖所有组件的入场/悬浮/滚动动画，但存在以下未触及区域：表单输入框缺少 label 浮动动画、SettingsGroup 折叠时图标缺乏方向指引感、StatsDialog 数据卡片缺少分隔动态、ActionButtons 主按钮开始/停止状态切换无过渡、LogArea 缺少级别图标视觉区分、ProviderConfig 连通性测试结果无内联反馈。本次聚焦"控件交互深度"。

**主题**: "Depth of Interaction — 交互深度感"

**原则**：不新建组件文件，仅在已有文件中添加 CSS + 少量 JS 逻辑，增强控件交互的视觉层次。

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
- **visual-plan-session34.md** 已完成流畅连续感 (Modal/Panel 滚动渐隐 + ProgressBar 入场 + LiquidToggle 入场)
- 本次聚焦：**表单 label 浮动 + SettingsGroup 折叠指引 + StatsDialog 卡片分隔线动画 + ActionButtons 状态过渡 + LogArea 级别图标 + ProviderConfig 内联反馈**

---

## 具体改动

### 1. forms.css — 输入框聚焦 label 上浮 + 下划线扩展

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 聚焦时 label 颜色变化 | CSS `.bfao-field:focus-within .bfao-label` color 变为 `--ai-primary` | 聚焦时 label 高亮，明确当前操作的输入框 |
| 输入框聚焦下划线扩展 | CSS `::after` 伪元素在 `.bfao-input-row` 上，`scaleX(0→1)` transition | 聚焦时底部出现从中心扩展的主题色细线，替代单纯的 box-shadow |
| icon-btn 悬浮旋转微动 | CSS `.bfao-icon-btn:hover` 添加 `transform: rotate(8deg)` | 图标按钮悬浮时轻微旋转，暗示可交互 |

### 2. SettingsGroup.svelte — 折叠 header 聚焦线 + 打开时 icon 背景扩散

**文件**: `src/components/SettingsGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| header 打开时底部分隔线渐现 | CSS `.group.open .group-header::after` 伪元素，底部 1px 渐变线 | 展开时 header 和 body 之间出现渐变分隔线，加强层次感 |
| icon 背景在 open 状态扩大 | CSS `.group.open .group-icon` 添加 `transform: scale(1.15)` + `box-shadow` 发光 | 展开时图标容器略微放大并发出柔和光晕，暗示"激活" |

### 3. StatsDialog.svelte — stat-card 悬浮分隔线发光 + folder-row 悬浮高亮

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| stat-card 悬浮时边框渐变发光 | CSS `.stat-card:hover` 添加 `border-color` 渐变 + 微弱 `box-shadow` | 数据卡片悬浮时边框变为主题色，配合轻微发光，与 tilt 3D 效果叠加 |
| stat-value 颜色过渡 | CSS `.stat-card:hover .stat-value` color transition 到更亮色调 | 悬浮时数字颜色微变亮，增强数值的视觉吸引力 |
| folder-row 悬浮高亮 + 右移 | CSS `.folder-row:hover` 添加 background + `translateX(2px)` | 收藏夹分布行悬浮时右移+背景微亮，与 DeadVideosResult/DuplicatesResult 统一 |

### 4. ActionButtons.svelte — 主按钮状态切换过渡 + 工具按钮悬浮图标弹跳

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| btn-primary 图标切换弹跳 | CSS `@keyframes iconSwitch` (scale 0→1.15→1) 在 `.running` 和非 running 状态的 icon 上 | 点击开始/停止时，图标有弹入效果而非瞬间替换 |
| btn-tool 悬浮图标微弹 | CSS `.btn-tool:hover :global(svg)` 添加 `transform: scale(1.15)` 过渡 | 工具按钮悬浮时图标轻微放大，文字不变 |
| kbd 标签悬浮显现 | CSS `.btn-primary .kbd` 默认 `opacity: 0.4`，悬浮时 `opacity: 0.8` | 快捷键标签在悬浮时变清晰，非悬浮时淡化避免视觉干扰 |

### 5. LogArea.svelte — 级别指示图标 + 时间戳悬浮展开

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 日志级别左侧边框悬浮加粗 | CSS `.log-entry:hover` border-left-width `3px→4px` + 颜色加深 | 悬浮时左侧级别色带加宽加深，强化级别视觉区分 |
| 时间戳悬浮展开效果 | CSS `.log-entry:hover .log-time` 添加 `letter-spacing` 微增 + `background` 加深 | 悬浮时时间戳区域略微扩展变深，暗示可关注 |
| 日志区域空状态呼吸 | CSS `log-area:empty::after` 伪元素显示等待文字并 `readyPulse` | 无日志时显示等待提示并呼吸脉冲 |

### 6. ProviderConfig.svelte — 连通性测试按钮反馈 + 眼睛按钮切换动画

**文件**: `src/components/ProviderConfig.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 眼睛按钮图标切换过渡 | CSS `.bfao-icon-btn` 内 svg 添加 `transition: transform 0.2s` + 切换时 `scale(0.8→1)` | 显示/隐藏密码时图标有缩放过渡而非瞬间替换 |
| spinning 图标增强发光 | CSS `.spinning` 添加 `filter: drop-shadow()` 主题色光晕 | 旋转加载时图标发出柔和光晕，增强"处理中"的视觉感 |
| model-dropdown 滚动渐隐 | CSS `mask-image: linear-gradient()` 上下边缘渐隐 | 模型列表长时上下边缘渐隐，暗示内容延伸 (与 FolderSelector 统一) |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-34 组件动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~120 行 CSS + ~20 行 JS (6 个文件)，无新文件
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 重点体验提升：表单控件"聚焦深度感" + 按钮"状态切换连贯性" + 数据展示"悬浮层次感"
