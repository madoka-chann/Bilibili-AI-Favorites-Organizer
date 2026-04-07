# 视觉增强计划 — Session 53

## 目标

**Kinetic Cadence — 律动节拍**：为数据展示、操作按钮、时间线、日志和结果列表注入节奏感——每个元素按照自己的韵律"呼吸"，数值变化有脉冲反馈，工具按钮行有视觉层级递进，时间线卡片内容分层揭示，处理状态有条纹节拍。前 52 轮已覆盖全组件核心动画 + 叙事流动，本轮聚焦于 **节奏与韵律微交互** ——让数据跳动、按钮呼吸、列表行进都有可感知的节拍。

**主题**: "Kinetic Cadence — 律动节拍"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~200 行 CSS + ~20 行 Svelte/TS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–52** 已完成全组件动画 + 微交互 + 叙事流动
- 本次聚焦：**StatsDialog 数据脉冲** + **ActionButtons 行级层递** + **HistoryTimeline 内容分层** + **LogArea 节奏入场** + **DuplicatesResult 处理条纹** + **Toast 渐变律动** + **设计令牌扩展**

---

## 具体改动

### 1. StatsDialog.svelte — 统计卡片悬浮联动 + 文件夹行条形图过冲 + 分区标题脉冲指示点

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 卡片悬浮值缩放协同 | `.stat-card:hover .stat-label` 添加 `letter-spacing 0.06em + opacity 1` transition | 悬浮卡片时标签与数值联动——值放大时标签字距展开，增强"聚焦阅读"节拍 |
| 文件夹行条形图过冲回弹 | `ratioBarGrow` 改为 ease-out-back (scaleX 0→1.04→1) | 条形图增长时微过冲再回弹——数据"弹性着陆"节拍 |
| 分区标题脉冲指示点 | `.section-title::before` 之前添加 `::after` 脉冲圆点 (6px, pulseDot animation 1.5s) | 分区标题左侧有脉冲圆点——"章节心跳"节拍指示 |
| 危险值悬浮警告光晕 | `.stat-value.danger` 悬浮时添加 `text-shadow: var(--ai-glow-danger-text)` | 失效视频数悬浮时有红色文字光晕——危险数据强调 |

### 2. ActionButtons.svelte — 工具行层级递进 + 主按钮运行条纹 + 按钮弹簧回弹

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 工具行悬浮层级递进 | `.tool-row:hover ~ .tool-row` 添加 `opacity: 0.55` transition | 悬浮某行时后续行变暗——视觉层级递进，聚焦当前行 |
| 主按钮运行条纹 | `.btn-primary.running::before` 添加 `runningStripes` 条纹动画 (45deg repeating-linear-gradient, translateX loop) | 运行中主按钮有斜向条纹流动——"进行中"节拍 |
| 工具按钮弹簧回弹 | `.btn-tool:active` 改为 `scale(0.90)` + 添加 `.btn-tool` transition 含 overshoot ease | 按下工具按钮先压缩再过冲回弹——"弹簧"触感节拍 |

### 3. HistoryTimeline.svelte — 卡片内容分层揭示 + 清空按钮图标旋转

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 卡片内容分层揭示 | `.timeline-time` / `.timeline-detail` / `.timeline-cats` 各自 animation-delay 递增 (0s, 0.08s, 0.16s) | 卡片内时间→详情→分类依次揭示——"逐层展开"节拍 |
| 首条目"最新"徽章 | `.timeline-item:first-child` 添加 `::after` "最新" 微标签 (fade + scale入场) | 最新记录有小标签提示 |
| 清空按钮图标旋转 | `.clear-btn:hover :global(svg)` 添加 `rotate(180deg)` transition | 悬浮清空按钮时垃圾桶图标旋转——"倒垃圾"暗示 |

### 4. LogArea.svelte — 日志类型节奏入场 + 最新条目脉冲标记

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 成功日志入场弹跳 | `.log-success` 的 `logSlideIn` 后追加 `successBounce` (translateY -2px→0 0.2s) | 成功日志有微弹——"成功确认"节拍 |
| 错误日志入场震动 | `.log-error` 在 `borderGlow` 后追加 `errorShake` (translateX ±2px 0.3s) | 错误日志有震动——"警报"节拍 |
| 最新条目左边框脉冲 | `.log-entry:last-child` 添加 `border-left-color` 脉冲 (primary→accent 循环 2s) | 最新日志左边框有品牌色脉冲——"心跳"节拍标记最新 |
| 猫咪文字悬浮微光 | `.cat-text:hover` 添加 `text-shadow: var(--ai-glow-text-hover)` | 猫咪文字悬浮时有品牌光晕 |

### 5. DuplicatesResult.svelte — 处理状态条纹叠加 + 去重按钮脉冲

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 处理中条纹叠加 | `.bfao-btn-primary:disabled` (processing) 添加 `::after` 斜条纹动画 (repeating-linear-gradient 45deg, translateX loop 1.5s) | 去重处理中按钮有条纹流动——"进行中"节拍 |
| 重复项数量强调 | `.bfao-modal-summary strong` 添加 `color: var(--ai-error)` + `font-size: 1.15em` + 脉冲 | 重复数量用红色强调 + 微脉冲——"警示"节拍 |
| 更多提示渐显 | `.bfao-modal-more` 添加 `moreReveal` (opacity 0→0.7 + translateY 4px→0 0.4s delay 0.5s) | "...及其他 N 个"渐显入场 |

### 6. Toast.svelte — Toast 背景渐变律动 + 关闭提示

**文件**: `src/components/Toast.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 成功 Toast 背景脉冲 | `.toast-success` 添加 `successPulse` (background-color 微变 brightness 0.95→1.05 2s infinite) | 成功 Toast 背景有微脉冲——"心跳"节拍 |
| 悬浮关闭提示 "×" | `.toast::after` 添加右侧 "×" 图标 (opacity 0→1 on hover, right 8px) | 悬浮 Toast 时右侧出现关闭提示 |
| 图标类型色环 | `.toast-icon` 添加 `outline` 圆环 (2px solid currentColor 0.15α) transition on hover | 悬浮时图标有类型色圆环——"聚焦"节拍 |

### 7. variables.css — 新增设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 (light / dark) | 用途 |
|------|-------------------|------|
| `--ai-glow-danger-text` | `0 0 10px rgba(error, 0.25)` / `0 0 10px rgba(error, 0.35)` | 危险数据文字悬浮光晕 (StatsDialog 失效视频数) |
| `--ai-stripe-overlay` | `rgba(255,255,255,0.12)` / `rgba(255,255,255,0.08)` | 处理中条纹叠加色 (ActionButtons 运行条纹, DuplicatesResult 处理条纹) |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-52 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~200 行 CSS + ~20 行 Svelte/TS (7 个文件)，1 个新计划文件
- StatsDialog 悬浮联动 + 条形图过冲——数据节拍
- ActionButtons 行级递进 + 运行条纹——操作节拍
- HistoryTimeline 内容分层揭示——叙事节拍
- LogArea 类型化入场 + 最新脉冲——日志节拍
- DuplicatesResult 处理条纹——进度节拍
- Toast 背景脉冲 + 关闭提示——通知节拍
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
