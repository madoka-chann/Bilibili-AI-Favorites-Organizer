# 视觉增强计划 — Session 28

## 目标

为 4 个动画覆盖较薄弱的核心面板组件注入交互微动画与视觉反馈，利用已有的 GSAP 微交互库和 CSS 过渡，让面板主界面的日常操作体验从"功能可用"升级为"灵动流畅"。

**原则**：复用现有动画基础设施（`$animations/micro.ts`、`$animations/text.ts`、`$animations/progress.ts`），不新建文件/组件，仅在原有组件中增加 CSS 动画和少量 GSAP 调用。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施 + 主组件 (Panel/FloatButton/Toast/Header/PreviewConfirm 等)
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件动画 (StatsDialog/HelpDialog/DeadVideosResult/DuplicatesResult/FolderSelector/UndoDialog)
- **REFACTOR_PLAN.md** Phase 10-15 聚焦代码质量，不涉及视觉
- 本次聚焦：**面板主界面中 4 个日常可见但动画薄弱的组件**

---

## 具体改动

### 1. LogArea — 日志条目滑入动画 + 级别边框发光

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 条目滑入 | CSS `@keyframes logSlideIn` (translateX(-8px)+opacity 0→1) | 新日志条目从左侧轻滑入场，配合已有 textDecode 效果 |
| 级别边框发光 | CSS `@keyframes borderGlow` 在 error/warning 级别 | error 条目左边框脉冲发光 2 次，吸引注意力；warning 级别较柔和 |
| 悬浮高亮 | CSS `transition: background 0.2s` on hover | 鼠标悬停条目时背景微亮，便于阅读定位 |

### 2. ActionButtons — 运行态呼吸脉冲 + 工具行交错入场

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 运行态呼吸 | CSS `@keyframes runningPulse` on `.btn-primary.running` | 停止按钮持续呼吸脉冲 (box-shadow 明暗交替)，强化运行状态感知 |
| 工具行交错入场 | CSS `@keyframes toolRowSlideIn` + `animation-delay` per row | 3 行工具按钮依次滑入 (0s/0.06s/0.12s)，面板打开时有节奏感 |
| 禁用态过渡 | CSS `transition: opacity 0.3s, filter 0.3s` + `filter: grayscale(0.5)` | 运行中禁用按钮平滑灰化，而非突然变灰 |

### 3. HistoryTimeline — 时间轴圆点悬浮光晕 + 卡片悬浮抬升

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 圆点悬浮光晕 | CSS `transition: box-shadow 0.3s, transform 0.3s` on hover | 悬浮时圆点放大 + 外发光环扩展，成为视觉焦点 |
| 卡片悬浮抬升 | CSS `transition: transform 0.25s, box-shadow 0.25s` on card hover | 悬浮时卡片上移 2px + 投影加深，增强层次感 |
| 时间轴线渐变 | CSS `linear-gradient` 替代纯色 background on `.timeline::before` | 时间轴线从主题色渐变到透明，顶部鲜明、底部消散 |

### 4. ProgressBar — 极光渐变流动 + Token 统计数字翻滚

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 极光渐变流动 | CSS `@keyframes auroraFlow` on `.progress-bar` background-position | 进度条渐变色持续流动，增强动态活力感 |
| Token 数字翻滚 | `numberRoll()` from `$animations/text` on token stats | Token 统计数字从 0 翻滚到当前值，而非瞬间显示 |
| 完成态呼吸 | CSS `@keyframes completeGlow` on `.progress-bar.complete` | 到达 100% 后进度条轻柔呼吸发光，配合已有 victoryCelebration |

---

## 不做的事

- **不新建动画文件/组件** — 全部复用已有基础设施 + CSS @keyframes
- **不修改已完成的 Modal 子组件** — Session 27 已覆盖
- **不重复 Panel/FloatButton/Toast 的已有动画** — 它们已非常丰富
- **不添加 Canvas/粒子效果** — 这些组件适合轻量 CSS 动画
- **不引入新的 GSAP 插件** — 仅用 CSS + 已有 text.ts 的 numberRoll

---

## 预期效果

- LogArea 日志条目从"瞬间出现"升级为"滑入 + 解码"双重效果
- ActionButtons 运行状态的视觉反馈显著增强 (呼吸脉冲 + 禁用灰化)
- HistoryTimeline 从"静态列表"升级为"可交互时间轴" (悬浮反馈)
- ProgressBar 进度条视觉动态感大幅提升 (极光流动 + 数字翻滚)
- 总改动量：~100 行 CSS + ~15 行 JS (4 个文件)，无新文件
