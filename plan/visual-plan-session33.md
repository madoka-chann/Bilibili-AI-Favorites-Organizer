# 视觉增强计划 — Session 33

## 目标

打磨对话框组件群的最后一公里交互细节。前 32 次 Session 已覆盖所有核心组件的入场/悬浮/状态动画，但 5 个 Modal 子组件（UndoDialog、HistoryTimeline、DuplicatesResult、DeadVideosResult、HelpDialog）的列表项悬浮反馈和按钮触感仍存在缝隙。本次聚焦"对话框内的交互完整性"——让每一个可操作元素都有触感回应。

**主题**: "Detail Polish — 细节打磨"

**原则**：不新建文件/组件，仅在已有文件中添加已有 action 调用 + 少量 CSS，填补交互空白。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件 contentStagger/pressEffect 入场动画
- **visual-plan-session28.md** 已完成 4 个面板主界面组件视觉增强
- **visual-plan-session29.md** 已完成 5 个设置面板组件动画增强
- **visual-plan-session30.md** 已完成 PreviewConfirm 深度视觉 + 全局滚动条/焦点环
- **visual-plan-session31.md** 已完成 tilt/glowTrack 激活 + Modal 统一增强 + FloatButton 回场 + Panel 光追踪
- **visual-plan-session32.md** 已完成 ripple 扩展 + Header 文字流光/齿轮旋转 + Toast 图标动画 + LogArea 就绪脉冲
- 本次聚焦：**UndoDialog 全面补强 + HistoryTimeline 按钮触感 + DuplicatesResult/DeadVideosResult 列表项悬浮 + HelpDialog 快捷键区域 + modal.css 空状态动画统一**

---

## 具体改动

### 1. UndoDialog.svelte — checkBounce + 选中脉冲 + 悬浮背景

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Radio 选中弹跳 | `use:checkBounce` on `<input type="radio">` | 选中时 radio 弹跳反馈，与 FolderSelector checkbox 统一 |
| 选中项内发光脉冲 | CSS `@keyframes selectPulse` (box-shadow 脉冲 1 次) on `.selected` | 选中新项时边框发光脉冲一次，视觉确认 |
| 列表项悬浮背景 | CSS `:hover:not(.selected)` 背景微亮 | 悬浮时背景微亮便于定位 |

### 2. HistoryTimeline.svelte — 按钮 pressEffect + 清空抖动 + 最新条目高亮 + 圆点脉冲

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 清空/关闭按钮 pressEffect | `use:pressEffect` on 两个按钮 | 按下弹回触感 |
| 清空按钮悬浮抖动 | CSS `@keyframes clearShake` (margin-left 抖动) | 危险操作悬浮警示 |
| 最新条目高亮 | CSS `.timeline-item:first-child .timeline-card` border-left + bg | 最新记录左侧高亮 |
| 圆点入场脉冲 | CSS `@keyframes dotPulse` (box-shadow 脉冲) | 圆点入场后脉冲一次 |

### 3. DuplicatesResult.svelte — 列表项悬浮

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| dup-item 悬浮高亮 | CSS hover 背景微亮 + padding-left 右移 | 悬浮时条目背景微亮并轻微右移 |

### 4. DeadVideosResult.svelte — 列表项悬浮 + 标题悬浮

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| video-item 悬浮 | CSS hover 背景微亮 + padding-left 右移 | 悬浮时视频条目背景微亮 |
| folder-header 悬浮 | CSS hover 颜色加深 | 标题悬浮时颜色从 muted 到 text |

### 5. HelpDialog.svelte — 展开指示线 + footer 渐入

**文件**: `src/components/HelpDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| FAQ 展开项左边框 | CSS `border-left: 2px solid var(--ai-primary)` on `.faq-item.open` | 展开项左侧主题色指示线 |
| help-footer 渐入 | CSS `@keyframes footerFadeIn` with 0.6s delay | 快捷键提示延迟渐入 |

### 6. modal.css — 空状态浮动 + 摘要数字弹跳

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 空状态浮动 | CSS `@keyframes emptyFloat` on `.bfao-modal-empty` | 所有对话框空状态统一浮动 |
| 摘要数字弹跳 | CSS `@keyframes countPop` on `.bfao-modal-summary strong` | 所有对话框摘要数字弹跳入场 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-32 组件动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~80 行 CSS + ~10 行 JS (6 个文件)，无新文件
- 所有新增 @keyframes 在 prefers-reduced-motion 下禁用
