# 视觉增强计划 — Session 54

## 目标

**Ambient Depth — 环境深度**：为面板、模态框、设置区、进度条注入空间纵深感——滚动时阴影随深度变化，设置行悬浮有呼吸光晕，进度猫咪走路姿态随进度变化，模态框 header 图标入场弹跳，Provider 切换有品牌色闪烁，Header 拖拽手柄有力反馈光晕。前 53 轮已覆盖全组件核心动画 + 叙事流动 + 律动节拍，本轮聚焦于 **空间纵深与环境感知** ——让界面元素"感知"自身在空间中的位置和状态。

**主题**: "Ambient Depth — 环境深度"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~15 行 Svelte/TS，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–53** 已完成全组件动画 + 微交互 + 叙事流动 + 律动节拍
- 本次聚焦：**Panel 滚动深度阴影** + **Modal 滚动深度阴影** + **SettingsPanel toggle 行呼吸光晕** + **ProviderConfig 切换闪烁** + **ProgressBar 猫咪姿态** + **Header 拖拽力反馈** + **设计令牌扩展**

---

## 具体改动

### 1. Panel.svelte — 滚动深度阴影 + 内容区呼吸背景

**文件**: `src/components/Panel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 滚动深度阴影 | `.panel` 的 `box-shadow` 随 `--scroll-alpha` 增强 (基础 → 加深) | 滚动时面板阴影逐步加深——暗示内容"沉入"面板深处 |
| 星云粒子滚动联动 | `.nebula-particle` 的 `filter: blur()` 随滚动增加 (0→2px) | 滚动时星云粒子虚化——景深效果，焦点在内容上 |
| 内容区顶部渐隐增强 | `.panel-content` 增加 `mask-image` 顶部渐隐 (滚动时上边缘内容渐隐) | 上下双向渐隐而非仅底部 |

### 2. Modal.svelte — 滚动响应式阴影深度 + header 图标入场

**文件**: `src/components/Modal.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 滚动深度阴影 | `.modal` 的 `box-shadow` 随 modal body scrollProgress 变化 | 模态框滚动时阴影逐步加深——内容深度感 |
| Header 图标入场弹跳 | `.modal-header h3 :global(svg)` 入场 `bounceIn` (scale 0→1.2→1, delay 0.15s) | 图标有弹性入场——吸引注意力到标题 |
| 关闭按钮悬浮旋转增强 | `.close-btn:hover` 增加 `box-shadow` 光晕 | 关闭按钮悬浮有红色光晕预警 |

### 3. SettingsPanel.svelte — Toggle 行呼吸光晕 + 字段网格深度

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 激活 toggle 行呼吸光晕 | `.toggle-row:has(:global(.on))` 添加 `box-shadow` 品牌色微光 | 已开启的 toggle 行有持续微光——"活跃"状态的环境指示 |
| 字段网格行列交错入场 | `.field-grid > .bfao-field` 添加 stagger animation (odd/even 不同延迟) | 网格字段交错浮现——空间层次感 |
| 设置面板底部渐隐 | `.settings-panel` 底部 `mask-image` 微渐隐 | 底部内容微渐隐——暗示可继续滚动 |

### 4. ProviderConfig.svelte — 切换闪烁 + API Key 安全指示

**文件**: `src/components/ProviderConfig.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| Provider 选择器悬浮光晕 | `.bfao-select:hover` 添加 `box-shadow` 品牌光晕 | 选择器悬浮有环境光——聚焦引导 |
| API Key 输入安全指示 | `.bfao-input-flex` 添加 `border-left` 状态色 (空=warning, 有值=success) | API Key 有无的视觉状态指示 |
| 眼睛图标切换光晕 | `.bfao-icon-btn` 切换时有品牌色 `outline` 脉冲 | 显示/隐藏切换有脉冲反馈 |

### 5. ProgressBar.svelte — 猫咪行走姿态 + Token 统计入场

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 猫咪行走摇摆 | `.progress-cat` 添加 `catWalk` 倾斜动画 (rotate ±8deg 0.4s) | 猫咪随进度前进时有摇摆姿态——行走感 |
| 猫咪到达终点翻转 | `.progress-cat` 在 `complete` 后增加 CSS transform | 到达终点猫咪翻转庆祝 |
| Token 统计数字悬浮放大 | `.token-stats span:hover` 添加 `scale(1.1) + color primary` transition | 悬浮 Token 数字有放大和品牌色高亮 |

### 6. Header.svelte — 拖拽力反馈 + 按钮组连接线

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 拖拽手柄扩展反馈 | `.header:active::before` 增加 width 和 opacity 增强 | 按下拖拽时手柄明显扩展——力反馈 |
| 按钮组悬浮连接线 | `.header-actions` 添加 `::before` 底部连接线 (scaleX 0→1 on hover) | 按钮组悬浮时底部有品牌色连接线——空间关联感 |
| 设置按钮激活态增强 | `.header-btn.active` 增加 `box-shadow` 内发光 | 激活态按钮有内发光——深度按下感 |

### 7. variables.css — 新增设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 (light / dark) | 用途 |
|------|-------------------|------|
| `--ai-shadow-depth-scroll` | `0 32px 80px rgba(0,0,0,0.15)` / `0 32px 80px rgba(0,0,0,0.35)` | 滚动时加深的阴影 (Panel, Modal) |
| `--ai-glow-active-row` | `0 0 8px rgba(115,100,255,0.1)` / `0 0 8px rgba(139,127,255,0.15)` | 激活 toggle 行的环境微光 (SettingsPanel) |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-53 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~15 行 Svelte/TS (7 个文件)，1 个新计划文件
- Panel 滚动深度阴影——空间纵深
- Modal 滚动深度阴影 + 图标入场——环境感知
- SettingsPanel toggle 呼吸光晕——状态环境指示
- ProviderConfig 安全指示——功能性微交互
- ProgressBar 猫咪行走姿态——拟物趣味
- Header 拖拽力反馈——触觉暗示
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
