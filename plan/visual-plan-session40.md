# 视觉增强计划 — Session 40

## 目标

**Ambient Polish — 环境精修**：对面板核心区域进行最后一轮"环境级"微交互打磨。聚焦于 **状态转换的过渡平滑度**、**空闲态的生命感**、以及 **跨组件视觉一致性** 三个维度。前 39 轮已覆盖几乎所有组件的独立动画，本轮关注"组件之间的缝隙"——那些单独看不到、但整体体验中能感知的细节。

**主题**: "Ambient Polish — 环境精修"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~200 行 CSS + ~30 行 JS，6 个文件。

---

## 与已有视觉计划的关系

- **Session 27–39** 已完成所有组件的独立动画增强
- 本次聚焦：**跨组件视觉一致性** + **面板空闲态生命感** + **状态转换平滑度**

---

## 具体改动

### 1. Panel.svelte — main-area 子组件交错入场 + 底部滚动渐隐 + 星云粒子过渡

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| main-area 子组件交错入场 | CSS `.main-area > *` `@keyframes mainContentFadeIn` (opacity+translateY) + `:nth-child` 延迟 | PromptEditor/LogArea/ProgressBar/ActionButtons 依次渐显 |
| panel-content 底部边缘渐隐 | CSS `mask-image` 底部 12px 渐隐 (仅底部，顶部保留给 scroll-indicator) | 滚动到底部时边缘渐隐暗示范围 |
| overscroll-behavior contain | CSS `overscroll-behavior: contain` | 滚动到边界时不穿透到页面 |
| nebula-particle 主题色联动 | CSS `transition: background 0.5s ease, box-shadow 0.5s ease` | 切换主题时星云粒子颜色平滑过渡 |

### 2. Modal.svelte — close-btn ripple + footer 入场 + header 光泽

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| close-btn 涟漪 | `use:ripple={{ color: 'rgba(255,255,255,0.3)' }}` | 关闭按钮有涟漪反馈 |
| modal-footer 入场渐显 | CSS `@keyframes footerSlideUp` (opacity+translateY 6px) | footer 从底部渐显 |
| modal-header 光泽扫过 | CSS `.modal-header::after` `@keyframes headerSweep` | header 有周期性光泽效果 |

### 3. PreviewConfirm.svelte — lightbox 退场 + icon-btn tooltip

**文件**: `src/components/PreviewConfirm.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| lightbox 退场动画 | CSS `.closing` + `lightboxOut`/`lightboxZoomOut` keyframes + JS setTimeout | 灯箱关闭有淡出缩小 |
| icon-btn 悬浮 tooltip | CSS `::after` 伪元素读取 `data-tooltip` 属性 | 图标按钮悬浮显示文字 |
| empty 状态呼吸 | CSS `emptyBreathe` opacity animation | 空搜索结果有生命感 |

### 4. SettingsPanel.svelte — 组间分隔线渐显

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| settings-group 间分隔线 | CSS `.group + .group::before` 渐变线 + `dividerFadeIn` | 设置组之间有渐显分隔线 |

### 5. App.svelte — 选择色 + 字体平滑 + 光标过渡

**文件**: `src/App.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 全局选择文字主题色 | CSS `::selection` background var(--ai-selection-bg) | 品牌紫色文字选择高亮 |
| 字体平滑渲染 | CSS `-webkit-font-smoothing: antialiased` | 文字抗锯齿更清晰 |
| cursor-spotlight 主题色过渡 | CSS `transition: background 0.5s ease` | 聚光灯颜色随主题过渡 |

### 6. variables.css — 选择色变量 + 主题过渡扩展

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| `--ai-selection-bg` | 新变量 (light/dark) | 统一文字选择高亮 |
| 主题过渡扩展 | transition 新增 color, border-color | 主题切换时更多属性平滑变色 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-39 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~200 行 CSS + ~10 行 JS (6 个文件)，1 个新计划文件
- 面板整体感从"各组件独立动画"提升到"有统一节奏的整体体验"
- 主题切换更平滑（星云粒子、聚光灯、文字、边框都参与过渡）
- Modal 生命感增强（header 光泽、footer 入场、close-btn 涟漪）
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
