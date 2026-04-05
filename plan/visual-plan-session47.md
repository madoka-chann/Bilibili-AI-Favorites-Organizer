# 视觉增强计划 — Session 47

## 目标

**Fluid Depth — 流体纵深**：为数据展示注入纵深层次和生命力。前 46 轮覆盖了微交互、状态指示、个性化图标等全方位动画，本轮聚焦于 **数据可视化增强**（统计卡片悬浮光扫 + 收藏夹行内联比例条）、**空状态生命化**（空记录页面的猫咪呼吸动画 + 引导文字渐显）、**时间线流动脉冲**（连接线上的顺序光点传播）、**摘要数字弹性强调**（模态框摘要中的关键数字弹跳入场）、**选中计数动态徽章**（收藏夹选择数变化时的缩放闪烁反馈）。

**主题**: "Fluid Depth — 流体纵深"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~10 行 Svelte，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–46** 已完成所有组件独立动画 + 微交互 + 一致性收口 + 弹性状态
- 本次聚焦：**数据纵深可视化** + **空状态生命力** + **时间线流动** + **数字弹性** + **选中反馈**

---

## 具体改动

### 1. StatsDialog.svelte — 统计卡片悬浮光扫 + 收藏夹行内联比例条

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 卡片悬浮光扫 | CSS `.stat-card::before` 添加对角线渐变伪元素，hover 时 `translateX(-100%→100%)` 扫过 0.6s | 悬浮统计卡片时有对角光芒扫过，增强玻璃质感 |
| 收藏夹行内联比例条 | CSS `.folder-row::after` 绝对定位背景条，宽度通过内联 `--ratio` CSS 变量控制 + Svelte 计算比例 | 每个收藏夹行有品牌色比例条直观显示视频数占比 |

### 2. HistoryTimeline.svelte — 时间线流动脉冲 + 空状态猫咪

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 连接线流动脉冲 | CSS `.timeline::after` 添加小光点沿连接线从上到下循环移动 (`translateY` 0→100%, 3s infinite linear) | 时间线竖线上有光点持续向下流动，暗示时间流逝 |
| 空状态猫咪呼吸 | CSS `.bfao-modal-empty` 添加猫咪 emoji `::before` + 缓慢 scale 呼吸动画 1.5s infinite | 空历史页面有活泼的猫咪呼吸动画，减少空白感 |

### 3. UndoDialog.svelte — 空状态猫咪动画

**文件**: `src/components/UndoDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 空状态猫咪呼吸 | CSS `.bfao-modal-empty` 添加猫咪 emoji `::before` + 文字渐显 `::after` | 与 HistoryTimeline 一致的空状态生命化 |

### 4. DuplicatesResult.svelte — 摘要数字弹性入场

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 摘要数字弹跳 | CSS `.bfao-modal-summary strong` 添加 `summaryPop` 动画 (scale 0.5→1.15→1, 0.4s) + 品牌色文字阴影 | 摘要中的关键数字有弹性入场，吸引注意力 |
| 列表计数器脉冲 | CSS `.dup-item::before` hover 时添加 scale(1.2) + 品牌色 box-shadow | 悬浮时序号圆圈有放大+发光，增强交互感 |

### 5. DeadVideosResult.svelte — 摘要数字弹性入场 + 文件夹图标旋转

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 摘要数字弹跳 | CSS `.bfao-modal-summary strong` 同 DuplicatesResult 一致的 `summaryPop` 动画 | 统一摘要数字弹性入场风格 |
| 文件夹图标悬浮旋转 | CSS `.folder-header:hover` 内 emoji 添加微旋转 + 放大 transition | 文件夹标题悬浮时图标有活泼旋转，增强可点击暗示 |

### 6. FolderSelector.svelte — 选中计数动态徽章

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 计数徽章弹跳 | CSS `.count` 通过 Svelte `$effect` 在 selected.size 变化时添加/移除 `.bounce` 类 + `countBounce` 动画 (scale 1→1.2→1, 0.25s) | 每次勾选/取消时计数徽章有弹跳反馈 |
| 选中数颜色渐变 | CSS `.count` 根据选中数量动态 `color` 过渡 (0→muted, >0→primary) | 有选中时计数文字变为品牌色，无选中时恢复灰色 |

### 7. modal.css — 摘要数字弹性入场 + 空状态猫咪 (共享样式)

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 摘要数字弹跳 | CSS `.bfao-modal-summary strong` 添加 `summaryPop` 动画 + 颜色/阴影 | 所有 modal 摘要数字统一弹性入场 |
| 空状态猫咪呼吸 | CSS `.bfao-modal-empty::before` 添加猫咪 emoji + `emptyBreath` 动画 | 统一空状态生命化样式 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-46 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~10 行 Svelte (7 个文件)，1 个新计划文件
- 统计卡片悬浮有对角光芒扫过——玻璃质感纵深
- 收藏夹行有内联比例条——数据可视化直觉
- 时间线连接线有流动光点——时间流逝暗示
- 空状态有猫咪呼吸动画——减少空白感
- 摘要关键数字有弹性入场——吸引注意力
- 选中计数有弹跳+变色反馈——操作确认感
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
