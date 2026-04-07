# 视觉增强计划 — Session 52

## 目标

**Narrative Flow — 叙事流动**：为对话框、编辑器、手风琴注入叙事性动画——每个交互都有"起承转合"的微叙事弧线。HelpDialog FAQ 回答渐现光帘、PromptEditor 预设选择器角标动态、SettingsGroup 展开内容项依次浮现、UndoDialog 撤销图标回溯旋转、FolderSelector 文件夹视频数动态计数、Modal 确认按钮按压纵深波纹、全局焦点环升级。前 51 轮已覆盖全组件核心动画 + 环境共振 + 微观动力学 + 触觉纵深，本轮聚焦于 **对话框与编辑器的叙事性微交互** ——让每个展开、选择、确认都有一个起始→发展→结尾的完整故事。

**主题**: "Narrative Flow — 叙事流动"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~15 行 Svelte/TS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–51** 已完成全组件动画 + 微交互 + 弹性状态 + 流体纵深 + 物理投影 + 动感纵深 + 环境共振 + 微观动力学 + 触觉纵深
- 本次聚焦：**HelpDialog 回答渐现** + **PromptEditor 管理器章节光扫** + **SettingsGroup 子项逐帧浮现** + **UndoDialog 回溯旋转** + **FolderSelector 计数滚动** + **Modal 按压纵深波纹** + **全局焦点环光晕升级**

---

## 具体改动

### 1. HelpDialog.svelte — FAQ 回答渐现光帘 + 快捷键徽章弹出 + 滚动进度微光

**文件**: `src/components/HelpDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 回答文字渐现光帘 | `.faq-a` 添加 `answerReveal` 动画 (clip-path inset 从 0 100% 0 0 → 0 0 0 0, 0.4s) | 展开答案时文字从左到右"揭幕"渐现——叙事弧线的"展开"阶段 |
| 快捷键徽章弹出 | `.help-footer` 内 `kbd` 样式化为徽章 + `kbdPop` 逐个弹出 (scale 0→1.15→1, stagger nth-child 0.08s) | 底部快捷键 Alt+B、ESC、Ctrl+Enter 各自弹出——叙事弧线的"尾声" |
| 问题图标序号计数 | `.faq-icon` 改为显示序号 (CSS counter) + 展开时数字旋转 (rotateY 180deg) | 用 CSS counter 替代静态 "?" 为序号，展开时数字翻转暗示"答案在背面" |

### 2. PromptEditor.svelte — 预设管理器章节标题光扫 + 预设行悬浮光底

**文件**: `src/components/PromptEditor.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 管理器分区标题光扫 | `.manager-section::after` 添加 `sectionSweep` 动画 (translateX -100%→100% 6s infinite) | 分区标题有持续微弱光泽扫过——叙事"章节分隔"视觉暗示 |
| 预设行悬浮光底条 | `.custom-preset-row::after` 添加底部渐变光条 scaleX 0→1 on hover | 悬浮预设行时底部有品牌色光条从左展开——叙事"聚光灯" |
| Textarea 滚动渐隐边缘 | `.prompt-textarea` 添加 mask-image 上下渐隐 (当内容溢出时) | 长文本输入时上下边缘有渐隐效果——叙事"延伸感" |

### 3. SettingsGroup.svelte — 展开内容子项逐帧浮现 + 折叠时图标回弹

**文件**: `src/components/SettingsGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 子项逐帧浮现 | 展开时 GSAP stagger children: opacity 0→1, translateY 8→0, stagger 0.03s | 手风琴展开后，内部子元素从上到下依次浮入——叙事"逐步揭示" |
| 折叠图标回弹 | 折叠时 chevron 弹性增强: 先 overshoot rotate(-15deg) 再归位 0deg | 折叠图标收回时有回弹——叙事"收束" |
| 展开计数微弹 | `.group-header:hover` 时 title 后的 count 有 scale bounce | 标题悬浮时内容计数微弹提示"里面有内容" |

### 4. UndoDialog.svelte — 选中项回溯图标旋转 + 处理中叠加微光

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 回溯图标旋转 | `.bfao-selectable-item.selected` radio 选中时旁边添加 `::before` 回溯箭头图标 CSS 旋转 (rotate -360deg 0.5s) | 选中撤销项时有"时光倒流"旋转暗示 |
| 时间戳悬浮发光 | `.item-time:hover` 添加 text-shadow primary glow + translateX(1px) | 悬浮时间戳时有品牌色文字光晕——叙事"时间聚焦" |
| 处理中行叠加微光 | 当 `processing` 时 `.history-list` 叠加 `::after` shimmer overlay (translateX loop) | 执行撤销时列表有光帘扫过——叙事"正在进行" |

### 5. FolderSelector.svelte — 视频计数动态递增 + 选中项文件夹图标摆动

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 视频计数微弹 | `.folder-count` 选中时添加 `countFlash` (color 变亮 + translateY -1px 0.25s) | 选中文件夹时视频计数微弹高亮——叙事"选中确认" |
| 全选图标翻转 | `.toggle-all` 切换时 SVG 添加 `rotateX(180deg)` transition 0.3s | 全选/取消全选时图标绕 X 轴翻转——叙事"状态翻转" |
| 空列表呼吸 | 添加 `.folder-list:empty::after` 内容"无收藏夹"+ breathe 动画 | 如果收藏夹列表为空有呼吸动画提示 |

### 6. Modal.svelte — 确认按钮按压涟漪 + 取消按钮悬浮退让

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 确认按钮按压涟漪 | `.modal-btn.confirm:active::after` 添加 `confirmRipple` (scale 0→2, opacity 1→0, radial) | 按下确认按钮时从中心扩散涟漪——叙事"决定的扩散效果" |
| 取消按钮悬浮退让 | `.modal-btn.cancel:hover` 添加 `translateX(-2px) + opacity 0.85` | 悬浮取消按钮时向左退让——叙事"后退/犹豫"的肢体语言 |
| Footer 分隔线渐变展开 | `.modal-footer` border-top 改为 `::before` gradient scaleX 0→1 动画 0.4s delay 0.2s | Footer 分隔线从中心向两端展开——叙事"舞台帷幕拉开" |

### 7. variables.css — 新增设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 (light / dark) | 用途 |
|------|-------------------|------|
| `--ai-glow-text-hover` | `0 0 8px rgba(primary, 0.2)` / `0 0 8px rgba(primary, 0.3)` | 文字悬浮光晕统一令牌 (UndoDialog 时间戳, HelpDialog 答案) |
| `--ai-shimmer-overlay` | `rgba(255,255,255,0.08)` / `rgba(255,255,255,0.05)` | 处理中叠加微光色 (UndoDialog, ProgressBar 复用) |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-51 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~15 行 Svelte/TS (7 个文件)，1 个新计划文件
- HelpDialog FAQ 回答有左到右光帘揭幕——展开叙事
- PromptEditor 管理器有章节光扫——分隔叙事
- SettingsGroup 子项逐帧浮现——逐步揭示叙事
- UndoDialog 选中项有回溯旋转——时光倒流叙事
- FolderSelector 选中时计数微弹——确认叙事
- Modal 确认按钮有按压涟漪——决定叙事
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
