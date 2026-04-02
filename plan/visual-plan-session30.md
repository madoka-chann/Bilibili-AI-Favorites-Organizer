# 视觉增强计划 — Session 30

## 目标

为分类预览对话框 (PreviewConfirm) 注入全面的交互微动画与视觉反馈，同时添加全局滚动条主题和键盘焦点环动画，提升整体交互品质。PreviewConfirm 是用户操作最密集的对话框（筛选、搜索、展开、合并、移除、确认），当前的交互反馈薄弱，本次将其从"功能性列表"升级为"灵动交互体验"。

**原则**：复用已有动画基础设施 (`$animations/micro.ts`、`$animations/gsap-config.ts`)，不新建文件/组件，仅在原有文件中增加 CSS 动画和少量 Svelte action 调用。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施 + 主组件
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件动画
- **visual-plan-session28.md** 已完成 4 个面板主界面组件动画
- **visual-plan-session29.md** 已完成 5 个设置面板组件动画
- 本次聚焦：**PreviewConfirm 对话框深度视觉增强 + 全局滚动条/焦点环**

---

## 具体改动

### 1. PreviewConfirm — 筛选按钮动效 + 分类卡片悬浮 + 展开指示 + 合并脉冲 + 移除抖动

**文件**: `src/components/PreviewConfirm.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 筛选按钮激活过渡 | CSS `transition: all 0.25s cubic-bezier(0.2,1,0.4,1)` + `scale(1.05)` on `.active` | 筛选按钮切换时平滑渐变+微弹，而非瞬间变色 |
| 分类卡片悬浮抬升 | CSS `transition: transform 0.25s, box-shadow 0.25s` + hover `translateY(-1px)` + 阴影加深 | 悬浮时卡片轻微抬起+投影加深，增强层次感 |
| 展开箭头旋转 | CSS `transition: transform 0.25s ease` on `.expand-btn` 内 icon | 展开/收起时箭头平滑旋转，而非瞬间切换图标 |
| 徽标入场弹跳 | CSS `@keyframes badgePop` (scale 0→1.15→1) on `.badge` | 徽标"已有"/"新建"首次渲染时弹跳入场 |
| 合并源脉冲边框 | CSS `@keyframes mergeSourcePulse` on `.merge-source` | 合并模式选中源分类时边框脉冲发光 |
| 移除按钮悬浮抖动 | CSS `@keyframes removeShake` on `.remove-btn:hover` | 移除按钮悬浮时轻微摇晃警示（同 PromptEditor deleteShake 风格）|
| 确认按钮悬浮光晕 | CSS `box-shadow` 增强 on `.confirm:hover` | 确认按钮悬浮时外发更强烈的成功色光晕 |
| 空状态浮动 | CSS `@keyframes emptyFloat` on `.bfao-modal-empty` | 无匹配时空状态文字轻柔浮动 |
| 搜索框焦点光晕 | CSS 增强 `.search-input:focus` box-shadow 动画 | 搜索框聚焦时光晕从 0 扩展到 3px |
| 底部图标按钮悬浮 | CSS `transition: transform 0.2s, box-shadow 0.2s` + hover 抬升+发光 | 底部工具图标按钮悬浮时微抬+外发光 |
| 视频项缩略图悬浮 | CSS `.video-thumb-wrap:hover` 缩略图微放大 | 悬浮时视频缩略图 scale(1.05) 增强预览感 |
| 置信度低警示 | CSS `@keyframes confLowPulse` on `.conf.low` | 低置信度标签轻微脉冲，吸引注意 |
| `pressEffect` 按钮 | `use:pressEffect` on 确认按钮 + 底部图标按钮 | 按下弹回的物理反馈 |

### 2. 全局滚动条主题

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 滚动条窄化 | `::-webkit-scrollbar { width: 5px }` | 将默认滚动条从粗宽改为精致窄条 |
| 滚动条颜色主题 | `scrollbar-thumb: var(--ai-border)` + `:hover` 加深 | 滚动条颜色跟随主题，悬浮时加深 |
| 滚动条圆角 | `border-radius: 4px` | 圆角滚动条匹配整体设计语言 |
| Firefox 兼容 | `scrollbar-width: thin; scrollbar-color` | Firefox 使用标准 API |

### 3. 键盘焦点环动画

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 焦点环动画 | CSS `outline` + `transition: outline-offset 0.15s` on `button:focus-visible` | 键盘导航时焦点环从元素扩展出现 |
| 主题色焦点环 | `outline-color: var(--ai-primary)` | 焦点环使用主题色，保持视觉一致 |

---

## 不做的事

- **不新建动画文件/组件** — 全部复用已有基础设施 + CSS @keyframes
- **不修改已完成的 Session 27/28/29 组件** — 它们的动画已完备
- **不添加 Canvas/粒子效果** — PreviewConfirm 适合轻量 CSS 动画
- **不修改虚拟滚动逻辑** — 仅增强视觉层，不触碰滚动性能逻辑
- **不引入新的 GSAP 插件** — 仅用 CSS + 已有 micro.ts 函数

---

## 预期效果

- PreviewConfirm 筛选按钮从"瞬间切换"升级为"弹性过渡"
- 分类卡片从"平面列表"升级为"悬浮卡片"（抬升+投影）
- 合并模式从"静态高亮"升级为"脉冲呼吸边框"
- 移除按钮从"静态图标"升级为"摇晃警示"
- 全局滚动条从"系统默认"升级为"精致主题化"
- 键盘导航获得视觉焦点反馈
- 总改动量：~130 行 CSS + ~10 行 JS (2 个文件: PreviewConfirm.svelte, variables.css)，无新文件
