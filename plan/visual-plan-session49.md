# 视觉增强计划 — Session 49

## 目标

**Ambient Resonance — 环境共振**：让 UI 的每个层面都散发"活性"——面板随滚动呼吸、弹窗星辉微闪、Toast 消息文字逐字揭幕、悬浮按钮同心呼吸环、液态开关流光扫射、文本区打字脉动、操作按钮悬浮光扫。前 48 轮完成了全组件微交互与物理纵深，本轮聚焦于 **环境级共振**——让元素无需用户主动操作也能散发出微妙的"存在感"与"呼吸感"。

**主题**: "Ambient Resonance — 环境共振"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~170 行 CSS + ~10 行 Svelte，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–48** 已完成全组件动画 + 微交互 + 弹性状态 + 流体纵深 + 物理投影 + 动感纵深
- 本次聚焦：**面板呼吸边框** + **弹窗星辉** + **Toast 文字揭幕** + **悬浮按钮呼吸环** + **液态开关流光** + **文本区打字脉动** + **操作按钮光扫**

---

## 具体改动

### 1. Panel.svelte — 面板边框呼吸光晕 + 星云滚动共振

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 面板边框呼吸 | `.panel` 添加 `border: 1px solid transparent` + `panelBorderBreathe` 动画 (border-color 在 transparent ↔ rgba(primary, 0.15) 间 8s 循环) | 面板整体有微弱的品牌色边框呼吸，暗示"活跃"状态 |
| 星云滚动共振 | `updateScrollIndicator` 中设置 `--scroll-alpha` CSS 变量 (0→1)，`.nebula-particle` opacity 由 `calc(0.3 + var(--scroll-alpha, 0) * 0.4)` 驱动 | 滚动越深，星云粒子越亮——滚动与环境联动 |

### 2. Modal.svelte — 弹窗星辉微闪 + 标题悬浮字间距

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 弹窗星辉 | `.backdrop::after` 新增多个 radial-gradient 小光点 (4~6个) + `backdropStardust` 动画 (opacity 闪烁 4s infinite) | 弹窗背景有微弱星辉闪烁，增添梦幻纵深感 |
| 标题字间距 | `.modal-header h3:hover` 添加 `letter-spacing: 1px` + transition | 鼠标经过标题时文字轻微展开，增添精致感 |

### 3. Toast.svelte — 消息文字揭幕 + 类型色左侧条

**文件**: `src/components/Toast.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 消息文字揭幕 | `.toast-msg` 添加 `toastTextReveal` 动画 (clip-path: inset(0 100% 0 0) → inset(0 0 0 0), 0.5s, delay 0.15s) | 消息文字从左到右逐步揭幕，增添打字机效果感 |
| 类型色左侧条 | `.toast` 添加 `border-left: 3px solid` + 各类型对应颜色 + 微发光 box-shadow | 每个 toast 左边有一条类型色指示条，视觉层级更清晰 |

### 4. FloatButton.svelte — 同心呼吸环 + 按压涟漪

**文件**: `src/components/FloatButton.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 同心呼吸环 | `.float-btn::before` 添加圆形边框环 + `breathRing` 动画 (scale 1→1.4 + opacity 0.4→0, 3s infinite) | 悬浮按钮外围有同心环脉冲扩散，暗示可交互 |
| 按压凹陷 | `.float-btn:active` 添加 `scale(0.92)` + `box-shadow` 内缩 + 快速 transition | 按下时有明显的物理按压凹陷感 |

### 5. LiquidToggle.svelte — 轨道流光扫射 + 滑块内发光点

**文件**: `src/components/LiquidToggle.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 轨道流光 | `.liquid-toggle.on::after` 伪元素品牌色渐变 + `toggleShimmer` 动画 (translateX -100%→100% 3s infinite) | 开启状态时轨道内有流光扫射，暗示"能量流动" |
| 滑块内光点 | `.thumb::before` 3px 圆形内发光点 + `.on .thumb::before` 颜色从透明变为白色 | 滑块中心有微小光点，开启时亮起 |

### 6. PromptEditor.svelte — 文本区打字脉动 + 保存按钮增强

**文件**: `src/components/PromptEditor.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 打字脉动 | `.prompt-textarea:focus:not(:placeholder-shown)` 添加 `typingPulse` 动画 (border-color 在 primary ↔ gradient-accent 间 2s 循环) | 有内容且聚焦时边框颜色脉动，暗示"正在编辑" |
| 保存成功光环 | `.save-flash` 增强：添加 `::after` 扩散环 (scale 1→1.6, opacity 1→0, 0.5s) | 保存成功时有更明显的向外扩散光环效果 |

### 7. modal.css — 操作按钮悬浮光扫 + 可选项深度悬浮

**文件**: `src/styles/modal.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 按钮悬浮光扫 | `.bfao-btn-primary:hover::after` 添加对角渐变光扫 + `btnShimmerSweep` (translateX -100%→100% 0.6s) | 主按钮悬浮时有对角光扫划过，增添玻璃质感 |
| 可选项深度悬浮 | `.bfao-selectable-item:hover` 增强 box-shadow 为多层深度阴影 + translateY(-2px) | 悬浮时有更明显的浮起效果，增强可交互感 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-48 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~170 行 CSS + ~10 行 Svelte (7 个文件)，1 个新计划文件
- 面板有微弱的品牌色边框呼吸——"活跃"状态暗示
- 星云粒子随滚动变亮——环境共振
- 弹窗背景有星辉闪烁——梦幻纵深
- Toast 消息从左到右文字揭幕——打字机感
- 悬浮按钮有同心呼吸环——存在感脉冲
- 液态开关开启时有流光扫射——能量流动
- 文本区编辑中有边框脉动——编辑状态反馈
- 操作按钮有悬浮光扫——玻璃质感
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
