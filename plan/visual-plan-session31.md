# 视觉增强计划 — Session 31

## 目标

激活 2 个已建好但从未使用的 Svelte action (`tilt.ts`、`glowTrack.ts`)，统一增强 Modal 基础组件的视觉表现力，并为 FloatButton 添加回场动画。本次聚焦"环境光与深度感"主题——通过光追踪、3D 倾斜和流动渐变，让界面从"平面交互"升级为"有深度、有光影的空间感交互"。

**原则**：不新建文件/组件，仅在已有文件中激活已存在但未使用的 action + 添加少量 CSS。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施 + 主组件
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件动画
- **visual-plan-session28.md** 已完成 4 个面板主界面组件动画
- **visual-plan-session29.md** 已完成 5 个设置面板组件动画
- **visual-plan-session30.md** 已完成 PreviewConfirm 深度视觉 + 全局滚动条/焦点环
- 本次聚焦：**未启用资产激活 (tilt/glowTrack) + Modal 基础组件统一增强 + FloatButton 回场**

---

## 具体改动

### 1. Modal.svelte — Header 极光流动 + 关闭按钮旋转 + 内容区光追踪

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Header 极光流动 | CSS `animation: aurora-flow 18s ease-in-out infinite` on `.modal-header` | Header 已有 `background-size: 800% 800%` 但缺少动画驱动，与 Panel Header 对齐 |
| 关闭按钮悬浮旋转 | CSS `transition: transform 0.25s` + `:hover` `rotate(90deg) scale(1.1)` on `.close-btn` | X 图标悬浮时旋转 90° 并微放大，增强交互暗示 |
| 内容区光追踪 | `use:glowTrack` on `.modal-body` + CSS `radial-gradient(circle at var(--glow-x) var(--glow-y), ...)` | 鼠标在 modal 内容区移动时，跟随一个柔和的环境光点 (**激活未使用的 glowTrack action**) |

### 2. StatsDialog.svelte — 统计卡片 3D 倾斜

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Stat 卡片 3D 倾斜 | `use:tilt={{ maxDeg: 4, scale: 1.03 }}` 替换 `use:hoverScale` on `.stat-card` | 鼠标悬浮时卡片 3D 倾斜+微放大，比单纯缩放更有深度感 (**激活未使用的 tilt action**) |

### 3. FloatButton.svelte — 回场弹入动画

**文件**: `src/components/FloatButton.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 回场弹入 | `$effect` 监听 `visible` 变化，GSAP `scale 0→1 + opacity 0→1` 弹入 (0.5s prismBounce) | 面板关闭后 FloatButton 重新出现时，从无到有弹入而非瞬间显示 |

### 4. Panel.svelte — 内容区光追踪

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 面板内容区光追踪 | `use:glowTrack` on `.panel-content` + CSS `radial-gradient` 伪元素 | 鼠标在面板内容区移动时，跟随柔和环境光，增强空间深度感 |

---

## 不做的事

- **不新建动画文件/组件** — 全部使用已存在的 action
- **不修改已完成的 Session 27-30 组件动画** — 仅增强基础层 (Modal/Panel/FloatButton)
- **不添加新的 GSAP 插件** — 仅用 CSS + 已有 action
- **不修改 Canvas 渲染逻辑** — 仅增强 CSS 视觉层
- **不对 StatsDialog 移除 hoverScale 以外做改动** — 仅替换为更高级的 tilt

---

## 预期效果

- 所有 Modal 对话框 header 从"静态渐变"升级为"流动极光"（与 Panel Header 视觉一致）
- Modal 关闭按钮从"静态图标"升级为"悬浮旋转提示"
- Modal 内容区获得"光追踪"环境光，鼠标移动时有柔和光点跟随
- StatsDialog 统计卡片从"2D 缩放"升级为"3D 倾斜深度感"
- FloatButton 从"瞬间出现"升级为"弹入回场"
- Panel 内容区获得环境光追踪，增强空间深度
- 总改动量：~50 行 CSS + ~20 行 JS (4 个文件)，无新文件
- 激活 2 个已建好但从未使用的 Svelte action (tilt, glowTrack)
