# 视觉增强计划 — Session 27

## 目标

为 6 个动画覆盖较弱的 Modal 子组件注入交互微动画，利用已有的 GSAP 微交互库（`contentStagger`、`listStaggerReveal`、`hoverScale`、`checkBounce`、`pressEffect`）和 CSS 过渡，让所有对话框的打开体验从"静态弹出"升级为"灵动入场"。

**原则**：复用现有动画基础设施，不新建文件/组件，仅在原有组件中增加 action 调用和少量 CSS。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施（GSAP config、micro.ts、progress.ts、text.ts、7 个 Svelte actions）
- **REFACTOR_PLAN.md** Phase 10-15 聚焦代码质量，不涉及视觉
- 本次聚焦：**将已建好的动画基础设施"铺"到 6 个尚未充分使用的 Modal 子组件**

---

## 具体改动

### 1. StatsDialog — 统计卡片交错入场 + 悬浮缩放 + 健康分数环形动画

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 内容交错入场 | `use:contentStagger` on `.bfao-modal-body` | Modal 打开后子元素依次浮现 |
| 统计卡片悬浮 | `use:hoverScale={{ scale: 1.05 }}` on `.stat-card` | 鼠标悬停卡片微放大 |
| 健康分数环形进度 | SVG circle `stroke-dashoffset` + GSAP tween | 健康模式下分数以环形进度条动画呈现 |
| 收藏夹行交错 | `use:contentStagger` on `.folder-breakdown` | 收藏夹列表交错滑入 |

### 2. HelpDialog — FAQ 手风琴 GSAP 高度动画 + 交错入场

**文件**: `src/components/HelpDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| FAQ 列表交错入场 | `use:contentStagger={{ stagger: 0.03 }}` on `.help-body` | 23 个 FAQ 项快速交错滑入 |
| 答案展开动画 | GSAP `height: auto` + `opacity` tween | 替代原始的瞬间显示/隐藏，平滑展开收起 |
| 问号图标脉冲 | CSS `@keyframes pulse` on `.faq-icon` | 当前展开项的 `?` 图标缓慢脉冲 |

### 3. DeadVideosResult — 文件夹分组交错 + 按钮 pressEffect

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 内容交错入场 | `use:contentStagger` on `.bfao-modal-body` | 摘要 → 列表 → 操作栏依次入场 |
| 文件夹分组交错 | `use:contentStagger={{ stagger: 0.04 }}` on `.folder-list` | 各文件夹组交错滑入 |
| 操作按钮 pressEffect | `use:pressEffect` on buttons | 按下弹回的物理反馈 |

### 4. DuplicatesResult — 列表交错 + 按钮增强

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 内容交错入场 | `use:contentStagger` on `.bfao-modal-body` | 子元素依次浮现 |
| 重复项列表交错 | `use:contentStagger={{ stagger: 0.03 }}` on `.dup-list` | 列表项交错滑入 |
| 操作按钮 pressEffect | `use:pressEffect` on button | 按下弹回 |

### 5. FolderSelector — 选中弹跳 + 列表交错

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 文件夹列表交错 | `use:contentStagger={{ stagger: 0.025 }}` on `.folder-list` | 文件夹项交错入场 |
| 复选框弹跳 | `use:checkBounce` on checkbox inputs | 选中时弹跳动画 |
| 选中态过渡 | CSS `transition: transform 0.2s, box-shadow 0.2s` | 选中项轻微上移+阴影 |

### 6. UndoDialog — 列表交错 + 选中态动画

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 历史列表交错 | `use:contentStagger={{ stagger: 0.04 }}` on `.history-list` | 撤销记录交错入场 |
| 选中项高亮过渡 | CSS `transition: border-color 0.25s, background 0.25s` | 选中态平滑过渡 |

---

## 不做的事

- **不新建动画文件/组件** — 全部复用 `$animations/micro.ts` 已有函数
- **不添加 Canvas/粒子效果** — Modal 子组件不适合重度动画
- **不修改 Modal.svelte 本身** — 它的打开/关闭动画已完备
- **不重复 HistoryTimeline 的 CSS slideIn** — 它已有 CSS @keyframes 交错动画

---

## 预期效果

- 所有 Modal 子组件从"瞬间渲染"升级为"灵动入场"
- 交互反馈一致性提升（所有操作按钮都有 pressEffect）
- 健康分数环形动画成为视觉焦点
- 总改动量：~120 行（6 个文件），无新文件
