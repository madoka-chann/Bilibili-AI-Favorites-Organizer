# 视觉增强计划 — Session 41

## 目标

**Sentient Surface — 感知表面**：让 UI 对用户行为产生更细腻的"感知"响应。前 40 轮已完成所有组件的独立动画和跨组件一致性打磨，本轮聚焦于 **用户意图感知**（悬浮暂停、空闲提示）、**动态排版**（文字响应交互）、**状态可视化增强**（渐变流动、运行态反馈）。

**主题**: "Sentient Surface — 感知表面"

**原则**：不新建文件，复用已有 GSAP actions + CSS keyframes/transitions。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~30 行 JS，6 个文件。

---

## 与已有视觉计划的关系

- **Session 27–40** 已完成所有组件的独立动画增强 + 跨组件一致性
- 本次聚焦：**用户意图感知** + **动态排版** + **状态可视化增强**

---

## 具体改动

### 1. Toast.svelte — 悬浮暂停计时器 + timer bar 渐变色 + 最后一秒闪烁

**文件**: `src/components/Toast.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 悬浮暂停计时器 | CSS `.toast:hover .toast-timer` `animation-play-state: paused` + `.toast:hover` scale(1.02) 微扩 | 鼠标悬浮时计时暂停，toast 微微放大暗示"抓住了" |
| timer bar 渐变色 | CSS `.toast-timer` background 改为 `linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))` | 计时条从亮到暗渐变，暗示时间流逝方向 |
| 悬浮暂停图标提示 | CSS `.toast:hover::before` 显示暂停图标 (⏸) | 悬浮时左上角渐显暂停图标 |

### 2. FloatButton.svelte — 空闲 tooltip 渐显 + Bot icon 悬浮旋转

**文件**: `src/components/FloatButton.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 空闲 tooltip 渐显 | CSS `.float-btn::after` content "点击打开" + `tooltipFadeIn` keyframe (3s delay) | 3 秒后渐显文字提示引导新用户 |
| Bot icon 悬浮旋转 | CSS `.float-btn:hover :global(svg)` rotate(12deg) + scale(1.1) transition | 悬浮时机器人图标微旋转增加趣味性 |
| 悬浮光环扩散 | CSS `.float-btn:hover` box-shadow 扩散 + 渐变背景位置偏移 | 悬浮时光环更明亮，渐变流动 |

### 3. Header.svelte — 标题 letter-spacing 悬浮展开 + 活跃按钮指示 dot

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 标题悬浮 letter-spacing 展开 | CSS `.header-title > span:first-child:hover` letter-spacing 0→0.06em transition | 悬浮时文字微展开，呈现高级排版质感 |
| 活跃按钮底部 dot 指示器 | CSS `.header-btn.active::after` 4px 圆点 + `dotPop` scale 弹入 | 设置按钮激活时底部出现品牌色指示点 |
| 关闭按钮悬浮 X 颜色渐变 | CSS `.header-btn:last-child:hover` color 过渡到 error 色 | 关闭按钮悬浮时 X 变红暗示"关闭" |

### 4. ActionButtons.svelte — btn-primary 渐变流动 + disabled 组整体退化

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| btn-primary 背景渐变流动 | CSS `@keyframes gradientFlow` background-position 0%→100% 循环 | 主按钮彩色渐变缓慢流动，增强生命感 |
| running 态倒计时视觉 | CSS `.btn-primary.running .kbd` 显示并脉冲 | 运行时快捷键提示 Esc 更醒目 |
| disabled 工具栏整体退化 | CSS `.tool-row:has(.btn-tool:disabled)` opacity 0.7 + 统一灰度 | 运行时禁用按钮所在行整体变暗，而非单个按钮灰度 |

### 5. LogArea.svelte — 日志条目计数角标 + 空日志占位动画

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 错误日志条目闪烁加重 | CSS `.log-error` border-left-width 4px (比其他 3px 更粗) + 背景微红 | 错误日志比其他日志更醒目 |
| 日志条目悬浮时间戳高亮 | CSS `.log-entry:hover .log-time` background 变主题色淡 | 悬浮时时间戳更醒目 |
| 猫咪文字悬浮高亮 | CSS `.log-cat:hover .cat-text` color 变主题色 + letter-spacing 微增 | 猫咪文字悬浮时有排版响应 |

### 6. forms.css — input 悬浮微提升 + select 箭头旋转 + label 聚焦字重过渡

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| input/select 悬浮微提升 | CSS `.bfao-input:hover, .bfao-select:hover` translateY(-0.5px) + border-color 变淡主题色 | 输入框悬浮时微浮起增加触感 |
| label 聚焦字重过渡 | CSS `.bfao-field:focus-within .bfao-label` font-weight 500→600 transition | 聚焦时标签变粗引导视线 |
| icon-btn 悬浮旋转微调 | CSS `.bfao-icon-btn:hover:not(:disabled) svg` rotate(8deg) | 图标按钮悬浮时微旋转增加灵动感 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-40 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~10 行 JS (6 个文件)，1 个新计划文件
- Toast 有"悬浮即暂停"的直觉响应，用户可以安心阅读通知内容
- FloatButton 对新用户更友好，有文字引导
- Header 标题排版有高级感，按钮状态更清晰
- ActionButtons 主按钮更有生命感，禁用态更整体
- LogArea 错误日志更醒目，猫咪文字可交互
- 表单控件悬浮有一致的微提升触感
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
