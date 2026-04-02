# 视觉增强计划 — Session 32

## 目标

深化交互触感反馈与流动连续性。前 31 次 Session 已覆盖所有组件的入场/悬浮/状态动画，本次聚焦"被遗漏的触感层"——将 `ripple` 涟漪效果扩展到更多可点击元素，为 Header 注入文字流光与齿轮旋转，增强 Toast 的类型化图标动画，并为 LogArea 添加空状态呼吸。

**主题**: "Touch & Flow — 触感反馈深化"

**原则**：不新建文件/组件，仅在已有文件中扩展已存在的 action 使用 + 添加少量 CSS。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件动画
- **visual-plan-session28.md** 已完成 4 个面板主界面组件动画
- **visual-plan-session29.md** 已完成 5 个设置面板组件动画
- **visual-plan-session30.md** 已完成 PreviewConfirm 深度视觉 + 全局滚动条/焦点环
- **visual-plan-session31.md** 已完成 tilt/glowTrack 激活 + Modal 统一增强 + FloatButton 回场 + Panel 光追踪
- 本次聚焦：**ripple 扩展 + Header 文字流光/齿轮旋转 + Toast 图标动画 + LogArea 空状态 + Modal 按钮涟漪**

---

## 具体改动

### 1. Header.svelte — Settings 齿轮持续旋转 + 标题文字流光 + 版本号弹入

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Settings 齿轮旋转 | CSS `transition: transform 0.5s` + `.active` 时 `rotate(180deg)` | 设置面板打开时齿轮旋转 180°，关闭时旋转回来，增强开关状态暗示 |
| 标题文字流光 | CSS `@keyframes titleShimmer` (background-position 动画 on `-webkit-background-clip: text`) | 标题"AI 收藏夹整理器"文字上流过一道微妙高光，6s 循环 |
| 版本号弹入 | CSS `@keyframes versionPop` (scale 0→1.1→1) | 版本号 "v2.0" 首次渲染时弹跳入场 |

### 2. ActionButtons.svelte — 主按钮涟漪 + 工具按钮涟漪

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 主按钮涟漪 | `use:ripple={{ color: 'rgba(255,255,255,0.3)' }}` on `.btn-primary` | Material 风格点击涟漪，为最重要的"开始整理"按钮增加触感反馈 |
| 工具按钮涟漪 | `use:ripple={{ color: 'rgba(var(--ai-primary-rgb),0.15)' }}` on 9 个 `.btn-tool` | 工具按钮点击时涟漪扩散，统一触感语言 |

### 3. Toast.svelte — 图标类型化入场动画 + 悬浮交互提示

**文件**: `src/components/Toast.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Success 图标弹跳 | CSS `@keyframes toastIconBounce` (scale 0→1.3→1) on `.toast-success .toast-icon` | 成功通知 ✓ 图标弹跳入场 |
| Error 图标震动 | CSS `@keyframes toastIconShake` 5 帧抖动 on `.toast-error .toast-icon` | 错误通知 ✕ 图标短促震动 |
| Warning 图标摇摆 | CSS `@keyframes toastIconWobble` 左右摇摆 on `.toast-warning .toast-icon` | 警告通知 ⚠ 图标左右摇晃 |
| 悬浮提示 | CSS `transition: transform 0.2s, box-shadow 0.2s` + hover `scale(1.03) translateY(-1px)` | 悬浮时轻微放大+抬升，暗示可点击关闭 |

### 4. LogArea.svelte — 空状态呼吸动画

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 就绪消息脉冲 | CSS `@keyframes readyPulse` (opacity 0.6→1) on first `.log-success` | 首条"就绪"消息轻柔脉冲呼吸，暗示系统等待操作 |

### 5. Modal.svelte — Footer 按钮涟漪

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 确认/取消按钮涟漪 | `use:ripple` on `.modal-btn.confirm` + `.modal-btn.cancel` | Modal 底部按钮获得 Material 风格涟漪，统一触感反馈 |

---

## 不做的事

- **不新建动画文件/组件** — 全部复用已有 action + CSS @keyframes
- **不修改已完成的 Session 27-31 组件动画** — 仅在未覆盖的交互层增强
- **不添加 Canvas/粒子效果** — 本次聚焦 CSS 微动画和 action 扩展
- **不引入新的 GSAP 插件** — 仅用 CSS + 已有 ripple action
- **不修改任何组件的功能逻辑** — 仅增强视觉层

---

## 预期效果

- Header 标题从"静态文字"升级为"流光文字"，版本号弹入，齿轮随设置面板旋转
- ActionButtons 所有按钮获得 Material 涟漪，触感反馈完整统一
- Toast 通知图标从"静态符号"升级为"类型化动画图标"（弹跳/震动/摇摆）
- LogArea 首条消息获得呼吸脉冲，暗示等待状态
- Modal 底部按钮获得涟漪，与 Header 按钮触感统一
- 总改动量：~60 行 CSS + ~15 行 JS (5 个文件)，无新文件
- ripple action 从仅 Header 扩展到 ActionButtons + Modal，覆盖率从 1 组件到 3 组件
