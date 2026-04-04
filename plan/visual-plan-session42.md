# 视觉增强计划 — Session 42

## 目标

**Velvet Depth — 丝绒纵深**：通过精细化的深度暗示（凹陷阴影、玻璃边框、渐变分隔）让 UI 从平面感升级为三维触感。前 41 轮已完成全组件动画覆盖，本轮聚焦于 **纵深层次感**（recessed tracks、elevated cards）、**结构化视觉引导**（计数器、分隔线、指示器）、**状态完成反馈**（环形脉冲、处理中光晕）。

**主题**: "Velvet Depth — 丝绒纵深"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~10 行 JS，6 个文件。

---

## 与已有视觉计划的关系

- **Session 27–41** 已完成所有组件的独立动画 + 微交互 + 感知表面
- 本次聚焦：**纵深层次感** + **结构化视觉引导** + **状态完成反馈**

---

## 具体改动

### 1. SettingsGroup.svelte — header 悬浮下划线渐展 + open body 凹陷感 + chevron 主题色过渡

**文件**: `src/components/SettingsGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| header 悬浮下划线渐展 | CSS `.group-header:hover::before` scaleX(0→1) 渐变下划线 (primary→transparent) | 悬浮时底部渐展品牌色下划线，增强交互引导 |
| open body 凹陷阴影 | CSS `.group.open .group-body` inset box-shadow (top 2px) | 展开的内容区有微妙的凹陷感，暗示"嵌入"层级 |
| chevron 悬浮主题色 | CSS `.group-header:hover .chevron` color 过渡到 primary | 悬浮时 chevron 与标题颜色统一变为品牌色 |

### 2. StatsDialog.svelte — 健康环完成脉冲 + score 文字发光 + grid 分隔线

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 健康环完成后脉冲光晕 | CSS `.health-ring` `ringGlow` keyframe (filter drop-shadow 脉冲, 2s 循环) | 健康分数环动画完成后持续发光脉冲 |
| score 数字文字发光 | CSS `.score-number` text-shadow 匹配 healthColor | 分数数字有品牌色光晕，增强视觉重量 |
| stats-grid 交叉分隔线 | CSS `.stat-card::before` 左侧渐变分隔线 (偶数列) + `.stat-card::after` 顶部分隔线 (后两张卡) | 2×2 网格中间有十字形渐变分隔线 |

### 3. ProgressBar.svelte — track 凹陷深度 + phase-label 活跃指示点 + cat 悬浮弹跳放大

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| progress-track 凹陷 | CSS `.progress-track` inset box-shadow (1px top, 0.5px bottom) | 进度轨道有凹陷感，像真实凹槽 |
| phase-label 活跃点 | CSS `.phase-label::before` 6px 圆点 + `phaseDot` 脉冲动画 | 阶段名称前有跳动的品牌色圆点 |
| cat 悬浮弹跳放大 | CSS `.progress-cat:hover` scale(1.3) + 暂停 catBounce | 悬浮猫咪时放大停跳，暗示"被抓住" |

### 4. HelpDialog.svelte — 滚动渐隐 + 答案左侧动画色条 + 展开项深度阴影

**文件**: `src/components/HelpDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| help-body 滚动渐隐 | CSS `.help-body` mask-image 上下渐隐 | 长列表上下渐隐暗示可滚动范围 |
| 答案左侧动画色条 | CSS `.faq-a::before` 2px 宽主题色条 + scaleY(0→1) | 答案展开时左侧有品牌色条从上到下绘入 |
| 展开项内阴影深度 | CSS `.faq-item.open` inset box-shadow (top) | 展开的 FAQ 项有凹陷感，与答案区域形成层次 |

### 5. DuplicatesResult.svelte — CSS 计数器序号 + action-bar 分隔线 + processing 光晕

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 列表项 CSS 计数器序号 | CSS `.dup-list` counter-reset + `.dup-item::before` counter() | 每个重复项前显示序号，增强结构感 |
| action-bar 顶部分隔线 | CSS `.bfao-action-bar::before` 渐变线 scaleX(0→1) | 操作栏顶部有渐展分隔线 |
| processing 按钮光晕 | CSS `.bfao-btn-primary:disabled` 动画 box-shadow 脉冲 | 处理中按钮有呼吸光晕暗示进行中 |

### 6. variables.css — 深度凹陷阴影令牌 + 玻璃边框令牌

**文件**: `src/styles/variables.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 凹陷阴影令牌 | `--ai-shadow-inset` inset 0 1px 3px rgba(0,0,0,0.08) | 统一的凹陷阴影，用于 track/body/card 内嵌 |
| 玻璃分隔令牌 | `--ai-divider-gradient` linear-gradient (transparent→primary-light→transparent) | 统一的渐变分隔线样式 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-41 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~0 行 JS (6 个文件)，1 个新计划文件
- SettingsGroup 手风琴有层次感的展开/收起
- StatsDialog 健康环有持续脉冲的生命感，网格有结构分隔
- ProgressBar 轨道有真实凹槽感，阶段指示更清晰
- HelpDialog 长列表有滚动边缘暗示，答案展开有动画层次
- DuplicatesResult 列表有结构化序号，操作区域有视觉分隔
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
