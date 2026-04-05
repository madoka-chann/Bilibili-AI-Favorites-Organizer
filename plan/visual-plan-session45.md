# 视觉增强计划 — Session 45

## 目标

**Harmonic Completeness — 和谐圆满**：补齐最后的动画一致性缺口。前 44 轮已完成全组件覆盖，本轮聚焦于 **图标动画完整闭环**（Toast info 图标是唯一没有动画的类型）、**交互一致性收口**（PromptEditor 按钮缺少 ripple）、**滚动指示器精致化**（Panel/Modal 滚动条入场动画升级）、**微细节补完**（Header 版本号悬浮态、VideoItem 时长/上传者悬浮增强）。

**主题**: "Harmonic Completeness — 和谐圆满"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~130 行 CSS + ~8 行 JS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–44** 已完成所有组件独立动画 + 微交互 + 呼吸光晕 + 触感共振
- 本次聚焦：**图标动画完整闭环** + **交互一致性收口** + **滚动指示器精致化** + **微细节补完**

---

## 具体改动

### 1. Toast.svelte — Info 图标脉冲动画 + Timer Bar 流光扫过

**文件**: `src/components/Toast.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Info 图标脉冲 | CSS `.toast-info .toast-icon` 添加 `toastIconPulse` 动画 (scale 1→1.25→1, 0.5s) | 补齐 info 类型——唯一没有图标动画的 toast 类型 |
| Timer 流光扫过 | CSS `.toast-timer::after` shimmer 伪元素 (translateX -100%→100%, 白色渐变) | 计时条有流光扫过效果，增强"时间流逝"感知 |

### 2. Header.svelte — 版本号悬浮态

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 版本号悬浮放大 | CSS `.version:hover` scale(1.08) + opacity 0.9 + letter-spacing 0.03em | 版本号悬浮有微妙放大和展开感，补齐唯一没有 hover 的头部元素 |
| 版本号悬浮发光 | CSS `.version:hover` box-shadow 添加微弱外发光 | 悬浮时有柔和光晕暗示可关注 |

### 3. Panel.svelte — 滚动指示条入场动画 + 发光

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 指示条 scaleX 入场 | CSS `.scroll-indicator` 改用 `transform: scaleX(0)` → `.visible` `scaleX(1)`, `transform-origin: left` | 指示条从左侧展开入场，而非简单 opacity 渐显 |
| 指示条微发光 | CSS `.scroll-indicator.visible` box-shadow 添加品牌色微发光 | 可见时有微弱发光增强存在感 |

### 4. Modal.svelte — 滚动指示条入场动画 + 发光

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 指示条 scaleX 入场 | CSS `.modal-scroll-indicator` 改用 scaleX 入场 (同 Panel) | 与 Panel 保持一致的滚动指示条入场动画 |
| 指示条微发光 | CSS `.modal-scroll-indicator.visible` box-shadow 添加品牌色微发光 | 与 Panel 保持一致的品牌色发光 |

### 5. PromptEditor.svelte — 动作按钮 ripple 一致性

**文件**: `src/components/PromptEditor.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 动作按钮 ripple | JS `.prompt-action-btn` 添加 `use:ripple` | 项目中所有按钮组都有 ripple，PromptEditor 是唯一遗漏 |
| 预设行悬浮微发光 | CSS `.preset-row:hover` box-shadow 内发光增强 | 悬浮预设行有微弱内发光增强层次 |

### 6. VideoItem.svelte — 时长悬浮阴影 + 上传者下划线渐展

**文件**: `src/components/preview/VideoItem.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 时长悬浮阴影 | CSS `.video-item:hover .video-duration` box-shadow 微阴影 | 悬浮时时长标签有微弱阴影增强浮起感 |
| 上传者下划线渐展 | CSS `.video-uploader::after` scaleX 0→1 渐展下划线 (品牌色) | 悬浮时上传者名有品牌色下划线渐展，暗示可关注 |

### 7. variables.css — 滚动指示发光令牌 + 计时流光令牌

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 指示条发光令牌 | `--ai-indicator-glow` 定义滚动指示条发光 (box-shadow, light/dark 各一) | 统一滚动指示条发光供 Panel/Modal 复用 |
| Timer 流光色令牌 | `--ai-timer-shimmer` 定义计时条流光色 (light/dark 各一) | 统一计时流光色供 Toast 等复用 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-44 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~130 行 CSS + ~8 行 JS (7 个文件)，1 个新计划文件
- Toast info 图标有脉冲动画——四种类型全部覆盖
- Header 版本号有悬浮态——头部所有元素交互完整
- Panel/Modal 滚动指示条有从左展开入场 + 品牌色发光
- PromptEditor 动作按钮有 ripple——所有按钮组 ripple 一致
- VideoItem 时长和上传者有悬浮增强——预览列表交互完整
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
