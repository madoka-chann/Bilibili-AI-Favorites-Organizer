# 视觉增强计划 — Session 46

## 目标

**Elastic State — 弹性状态**：为状态切换注入弹性动能。前 45 轮覆盖了静态微交互和一致性收口，本轮聚焦于 **状态过渡动画**（按钮启用/禁用切换时的弹性脉冲）、**个性化图标动画**（每个工具按钮悬浮时拥有独特的图标动画而非统一 scale）、**表单活跃态纵深**（输入区域交互时的凹陷/浮起层次感）、**危险操作警示增强**（danger 按钮悬浮时的警告光晕脉冲）、**确认按钮流光**（PreviewConfirm 确认按钮的成功色渐变流光扫过）。

**主题**: "Elastic State — 弹性状态"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~150 行 CSS + ~5 行 JS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–45** 已完成所有组件独立动画 + 微交互 + 呼吸光晕 + 一致性收口
- 本次聚焦：**状态过渡弹性** + **个性化图标动画** + **表单纵深** + **危险警示** + **确认流光**

---

## 具体改动

### 1. ActionButtons.svelte — 个性化工具图标悬浮动画 + 启用脉冲

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 个性化图标悬浮 | CSS 每个 `.btn-tool` 通过 `:nth-child()` 选择器为不同工具按钮定义独特 hover icon transform: Archive→translateY(-2px), Copy→scaleX(-1) 镜像翻转, Undo2→rotate(-45deg), Download→translateY(2px), BarChart3→scaleY(1.2), Heart→scale(1.3), FileText→rotate(-5deg), HelpCircle→rotate(15deg), History→rotate(-120deg) | 替代统一 scale(1.2)，每个图标有独特物理暗示 |
| 工具行启用脉冲 | CSS `.tool-row:not(:has(.btn-tool:disabled))` 应用一次性 `enablePulse` 动画 (box-shadow 扩散 0.4s) | 当运行状态结束、按钮从禁用→启用时，行有微弱脉冲反馈 |

### 2. SettingsPanel.svelte — 字段网格活跃列发光 + 切换行活跃指示器

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 字段活跃发光 | CSS `.field-grid .bfao-field:focus-within` 添加微弱背景 + 圆角 + 品牌色内发光 (box-shadow inset) | 当用户聚焦某个输入字段时，整个 field 容器有微弱凹陷发光，增强纵深 |
| 切换行活跃态左指示线 | CSS `.toggle-row:has(:checked)` 添加左侧 2px 品牌色竖条 (border-left) | 已启用的切换行有品牌色左边条，视觉上快速区分开/关状态 |

### 3. forms.css — 复选框选中弹跳 + 禁用态视觉 + placeholder 渐显

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 复选框选中弹跳 | CSS `input[type='checkbox']:checked` 添加 `checkPop` 动画 (scale 1→1.2→1, 0.25s) | 勾选时有弹跳反馈，增强触感 |
| 禁用态退化 | CSS `.bfao-input:disabled, .bfao-select:disabled` 添加 opacity 0.5 + cursor not-allowed + background 微调 | 补齐表单禁用态视觉一致性 |
| Placeholder 淡入 | CSS `.bfao-input::placeholder` 添加 opacity 过渡 + focus 时透明度降低 | 聚焦时 placeholder 渐隐，引导用户输入 |

### 4. modal.css — 危险按钮悬浮警示光晕 + 按钮活跃态缩放 + 选项悬浮微缩放

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 危险按钮警示光晕 | CSS `.bfao-btn-danger:hover:not(:disabled)` 添加 `dangerGlow` 动画 (box-shadow 红色脉冲 1.5s infinite) | 悬浮危险按钮时有持续红色光晕脉冲警告用户 |
| 按钮活跃态缩放 | CSS `.bfao-btn:active:not(:disabled)` 添加 scale(0.95) + 快速 transition | 所有 modal 按钮按下时有统一的弹性缩放 |
| 选项悬浮微缩放 | CSS `.bfao-selectable-item:hover` 添加 scale(1.005) + translateY(-1px) | 悬浮可选项时有微弱提升，增强可点击感 |

### 5. PreviewConfirm.svelte — 确认按钮流光扫过 + footer 图标入场错位

**文件**: `src/components/PreviewConfirm.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 确认按钮流光 | CSS `.modal-btn.confirm::after` 添加 shimmer 伪元素 (白色渐变 translateX 扫过, 3s infinite) | 确认按钮有持续流光暗示"可以点击"，吸引注意力 |
| Footer 图标错位入场 | CSS `.icon-btn:nth-child(n)` 添加 `iconBtnSlideIn` 动画 + 错位 delay (0.05s 间隔) | Footer 工具图标依次弹入，增强入场仪式感 |

### 6. variables.css — 状态过渡令牌 + 危险光晕令牌

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 状态过渡脉冲令牌 | `--ai-state-pulse` 定义启用态脉冲 box-shadow (品牌色扩散, light/dark 各一) | 统一状态切换脉冲效果供组件复用 |
| 危险光晕令牌 | `--ai-glow-danger` 定义危险操作光晕 (红色 box-shadow, light/dark 各一) | 统一危险按钮光晕供 modal.css 等复用 |
| 字段活跃发光令牌 | `--ai-field-active-glow` 定义输入字段活跃态内发光 (品牌色 inset, light/dark 各一) | 统一字段聚焦发光供 SettingsPanel/forms 复用 |

### 7. CategoryGroup.svelte — 移除按钮危险确认光晕

**文件**: `src/components/preview/CategoryGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 移除按钮危险光晕 | CSS `.remove-btn:hover` 添加 `var(--ai-glow-danger)` box-shadow | 悬浮移除分类按钮时有红色危险光晕，与 modal danger btn 一致 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-45 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~150 行 CSS + ~5 行 JS (7 个文件)，1 个新计划文件
- 9 个工具按钮各有独特悬浮图标动画——个性化取代统一
- 表单字段聚焦时有凹陷发光纵深——增强交互层次
- 危险按钮/移除按钮有红色警示光晕脉冲——安全提醒
- 确认按钮有流光扫过——吸引操作注意力
- 复选框选中有弹跳反馈——触感增强
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
