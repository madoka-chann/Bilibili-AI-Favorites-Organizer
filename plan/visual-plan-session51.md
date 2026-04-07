# 视觉增强计划 — Session 51

## 目标

**Tactile Depth — 触觉纵深**：为表单控件、按钮状态、头部交互注入物理触觉层——眼睛图标悬浮预热光圈、模型搜索聚焦渐变边框、关闭按钮 X 悬浮旋转、版本徽章内部微光、开关行激活指示条展开动画、日志条目悬浮边框发光、猫咪悬浮弹跳、表单控件聚焦箭头旋转。前 50 轮覆盖了全组件核心动画 + 环境共振 + 微观动力学，本轮聚焦于 **表单控件和按钮的物理触觉反馈**——让每一个点击、聚焦、悬浮都传递出三维纵深感。

**主题**: "Tactile Depth — 触觉纵深"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~160 行 CSS + ~5 行 Svelte，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–50** 已完成全组件动画 + 微交互 + 弹性状态 + 流体纵深 + 物理投影 + 动感纵深 + 环境共振 + 微观动力学
- 本次聚焦：**眼睛图标悬浮预热** + **模型搜索聚焦渐变** + **关闭按钮旋转** + **版本徽章微光** + **开关激活条展开** + **日志边框发光** + **猫咪弹跳** + **表单箭头旋转** + **新设计令牌**

---

## 具体改动

### 1. ProviderConfig.svelte — 眼睛图标悬浮预热光圈 + 选择器入场微光

**文件**: `src/components/ProviderConfig.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 眼睛图标悬浮预热 | `.bfao-icon-btn:hover` 添加 box-shadow 品牌色光圈 (0 0 12px primary 0.2) + icon rotate(15deg) | 悬浮时图标有预热光圈暗示"即将切换"，图标微旋增添活力 |
| 链接按钮图标摆动 | `.link-btn:hover :global(svg)` 添加 rotate(-12deg) 摆动 | 悬浮时外链图标轻微倾斜暗示"即将离开" |
| 并发数输入悬浮脉冲 | `.bfao-input-small:hover` 添加 border-color pulse transition | 数字输入框悬浮时有微弱边框色变化 |

### 2. ModelSelector.svelte — 搜索聚焦渐变边框 + 模型计数跳动

**文件**: `src/components/ModelSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 搜索框聚焦渐变 | `.model-search:focus` 添加 box-shadow gradient glow + border-color primary | 搜索框聚焦时有品牌色光晕，与 forms.css focusRipple 一致 |
| 下拉框入场弹性增强 | `.model-dropdown` 的 dropdownIn 增加回弹 (scaleY overshoot 1.02) | 下拉框入场有微弱回弹暗示弹性 |
| 空状态悬浮旋转 | `.model-empty:hover` 添加 轻微 rotate 摆动 | 空状态悬浮时文字有微弱摆动 |

### 3. Header.svelte — 关闭按钮 X 悬浮旋转 + 版本徽章内部微光

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 关闭按钮 X 旋转 | `.header-btn:last-child:hover :global(svg)` 添加 rotate(90deg) transition | 悬浮关闭按钮时 X 图标旋转 90° 形成 "+" 状暗示"可关闭" |
| 版本徽章内部微光 | `.version::after` 添加 `versionShimmer` 渐变光扫 (translateX -100%→100% 3s infinite) | 版本徽章有持续微弱内部光扫效果 |
| 拖拽手柄悬浮展开 | `.header::before:hover` 从 18px 展开到 28px + opacity 增强 | 拖拽手柄区域悬浮时宽度展开暗示可拖拽 |

### 4. SettingsPanel.svelte — 开关行激活条展开动画 + 标签悬浮下划线

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 激活条展开 | `.toggle-row:has(:global(.on))` border-left 从 scaleY(0)→scaleY(1) transition | 开关激活时左侧指示条从中心向两端展开 |
| 标签悬浮下划线 | `.toggle-row > span:first-child::after` 添加底部渐变线 scaleX(0→1) on hover | 悬浮时开关标签有底部品牌色下划线展开 |
| 子字段入场弹性 | `.sub-field-slide` 动画增加 translateY overshoot (-2px→1px→0) | 子字段入场有微弱回弹 |

### 5. LogArea.svelte — 条目悬浮边框发光 + 猫咪悬浮弹跳

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 条目悬浮边框发光 | `.log-entry:hover` 添加 box-shadow inset 3px 0 6px primary glow | 悬浮日志条目时左侧边框有品牌色发光 |
| 猫咪悬浮弹跳 | `.log-cat:hover .cat-emoji` 添加 `catBounce` 动画 (translateY bounce 0.4s) | 悬浮猫咪区域时猫咪表情弹跳 |
| 日志区域入场淡入 | `.log-area` 添加 `logAreaFadeIn` 动画 (opacity 0→1 + translateY 4px 0.3s) | 日志区域初始挂载时有淡入效果 |

### 6. forms.css — 选择框聚焦箭头暗示 + 复选框悬浮光圈增强

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 输入框标签聚焦微移 | `.bfao-field:focus-within .bfao-label` 添加 translateX(2px) | 聚焦时标签右移 2px 暗示"当前激活" |
| 复选框悬浮光圈扩展 | `.bfao-checkbox-label:hover input[type='checkbox']` 增强 box-shadow 4px spread | 悬浮复选框时光圈更明显 |
| 图标按钮悬浮底部光条 | `.bfao-icon-btn:hover::after` 添加底部 2px 渐变光条 (scaleX 0→1) | 图标按钮悬浮时底部有品牌色光条 |

### 7. variables.css — 新增设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 (light / dark) | 用途 |
|------|-------------------|------|
| `--ai-glow-control-hover` | `0 0 12px rgba(primary, 0.15)` / `0 0 12px rgba(primary, 0.22)` | 表单控件悬浮光圈统一令牌 |
| `--ai-border-active-glow` | `rgba(primary, 0.35)` / `rgba(primary, 0.45)` | 激活状态边框发光色 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-50 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~160 行 CSS + ~5 行 Svelte (7 个文件)，1 个新计划文件
- 眼睛图标悬浮有预热光圈——即将操作预示
- 模型搜索聚焦有渐变光晕——聚焦深度感
- 关闭按钮 X 悬浮旋转——物理旋转触感
- 版本徽章有内部微光——精致细节
- 开关激活条有展开动画——状态变化可视化
- 日志条目悬浮有边框发光——交互深度感
- 猫咪悬浮弹跳——趣味性微交互
- 表单控件聚焦标签微移——聚焦引导
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
