# 视觉增强计划 — Session 36

## 目标

强化"预览区交互活力"——Preview 区域（PreviewToolbar、CategoryGroup、VideoItem）是用户停留时间最长的界面，但目前动画密度明显低于其他区域。同时补齐 Header 按钮入场序列、SettingsPanel 视图切换群组错位入场、以及全局 disabled 按钮的平滑退化过渡。

**主题**: "Preview Vitality — 预览活力"

**原则**：不新建组件文件，仅在已有文件中添加 CSS + 少量 JS/GSAP 逻辑，让预览区域的交互密度与其他面板齐平。

---

## 与已有视觉计划的关系

- **Session 27–35** 已完成核心面板、Modal、设置面板、表单控件等区域的动画增强
- 本次聚焦：**Preview 三件套 (Toolbar/CategoryGroup/VideoItem)** + **Header 入场序列** + **SettingsPanel 群组错位** + **disabled 按钮退化**

---

## 具体改动

### 1. PreviewToolbar.svelte — 活跃 Tab 滑动下划线 + 搜索图标反馈

**文件**: `src/components/preview/PreviewToolbar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 活跃 filter-btn 底部滑动指示线 | CSS `.filter-btn.active::after` 伪元素 + `scaleX(0→1)` transition | 切换 Tab 时底部出现从中心向两端展开的主题色指示线，比纯 scale/background 更有方向感 |
| filter-btn 悬浮发光边框 | CSS `.filter-btn:hover` 添加 `box-shadow` inset 内发光 | 与 FolderSelector selectable-item 悬浮内发光统一 |
| 搜索框图标脉冲 | CSS `.search-icon` 在 input 有值时添加 `opacity` 增强 + `color` 变主题色 | 输入内容时搜索图标高亮，暗示"搜索激活中" |
| 结果计数弹入 | CSS `.result-count` 出现时 `countPop` 动画 | 搜索结果数字弹入显示，复用 modal.css 已有的 countPop |

### 2. CategoryGroup.svelte — 展开折叠高度过渡 + 视频列表错位入场

**文件**: `src/components/preview/CategoryGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 展开/折叠 grid 高度过渡 | CSS `max-height` transition + JS 动态计算 `scrollHeight` | 展开时从 0 滑到实际高度，折叠时反向收回，避免瞬间出现/消失 |
| 展开后前 N 项错位入场 | CSS `@keyframes itemReveal` + `animation-delay` 递增 (前5项) | 展开后视频项从 opacity:0/translateY:8px 逐个滑入，前 5 项有 0.04s 递增延迟 |
| 悬浮时边框发光增强 | CSS `.category-group:hover` border-color 变主题色 + box-shadow | 整个分组悬浮时边框柔和发光，增强层次 |

### 3. VideoItem.svelte — 悬浮提升 + 缩略图缩放 + 信息滑出

**文件**: `src/components/preview/VideoItem.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 卡片悬浮微提升 | CSS `.video-item:hover` 添加 `translateY(-2px)` + `box-shadow` | 悬浮时卡片上浮+阴影加深，与 CategoryGroup hover 统一 |
| 缩略图悬浮缩放 | CSS `.video-thumb-wrap:hover .video-thumb` 添加 `transform: scale(1.05)` | 缩略图悬浮时轻微放大，配合已有 brightness(1.1) |
| 时长标签悬浮滑出 | CSS `.duration` 默认右移隐藏，悬浮时 `translateX(0)` 滑入 | 时长标签从缩略图右下角滑出，增加信息发现乐趣 |
| 置信度低条目脉冲增强 | CSS `.low-confidence` 边框脉冲从 opacity 改为 `box-shadow` | 低置信度项的脉冲从简单透明度变为边框发光脉冲，更醒目 |

### 4. Header.svelte — 按钮入场序列错位

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| header-btn 错位入场 | GSAP `gsap.fromTo` + stagger 0.08s，从 `opacity:0/scale:0.8/y:4` 入场 | Panel 展开后 Header 按钮依次弹入，与 SettingsGroup 子元素错位效果统一 |
| 标题文字入场 | GSAP `gsap.fromTo` 标题从 `opacity:0/x:-8` 滑入 | 标题从左侧滑入，先于按钮入场，建立视觉顺序 |

### 5. SettingsPanel.svelte — 视图切换群组错位入场

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| settings-group 切换入场错位 | CSS `@keyframes groupSlideIn` + `animation-delay` 递增 | 切换到设置视图时，各 SettingsGroup 依次从下方滑入 (translateY:12px→0 + opacity)，0.06s 递增延迟 |
| toggle-row 悬浮图标微旋 | CSS `.toggle-row:hover :global(svg)` 添加 `rotate(6deg)` | 悬浮时行内图标轻微旋转，与 forms.css icon-btn 旋转统一 |

### 6. forms.css — disabled 按钮平滑退化

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| disabled 态平滑过渡 | CSS `.bfao-btn:disabled` 添加 `transition: opacity 0.3s, filter 0.3s` + `filter: grayscale(0.3)` | 按钮变为 disabled 时平滑淡化+轻微去色，而非瞬间跳变 |
| disabled 态阴影消失 | CSS `.bfao-btn:disabled` 添加 `box-shadow: none` 过渡 | 禁用时阴影平滑消失，增强"不可用"的视觉暗示 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改已完成的 Session 27-35 组件动画**
- **不添加 Canvas/粒子效果**
- **不引入新的 GSAP 插件**
- **不修改任何组件的功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~40 行 JS/GSAP (6 个文件)，无新文件
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
- 重点体验提升：Preview 区域从"静态列表"升级为"有呼吸感的交互界面"
