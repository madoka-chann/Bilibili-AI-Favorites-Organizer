# 视觉增强计划 — Session 48

## 目标

**Kinetic Depth — 动感纵深**：为核心交互注入动感与物理纵深。前 47 轮覆盖了全组件微交互、数据可视化、空状态生命化等，本轮聚焦于 **日志入场模糊消散**（log 条目从模糊到清晰的物理感入场）、**进度猫咪投影**（猫咪弹跳时投影同步缩放暗示高度）、**设置分割线流光滑行**（gradient background-position 滑行替代 scaleX）、**标题光晕脉冲**（标题文字 shimmer 同步微发光）、**输入聚焦涟漪环**（focus 时外扩涟漪环暗示激活）、**主按钮悬浮渐变反转**（hover 时渐变方向流动反转增加动感）、**工具按钮悬浮底线**（hover 时品牌色底线渐展指示当前工具）。

**主题**: "Kinetic Depth — 动感纵深"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~160 行 CSS + ~5 行 Svelte，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–47** 已完成所有组件独立动画 + 微交互 + 一致性收口 + 弹性状态 + 流体纵深
- 本次聚焦：**物理感入场** + **投影纵深** + **流光分隔** + **标题光晕** + **聚焦涟漪** + **渐变动感** + **工具底线**

---

## 具体改动

### 1. LogArea.svelte — 日志条目模糊消散入场 + 猫咪闲置旋摆

**文件**: `src/components/LogArea.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 模糊消散入场 | `logSlideIn` keyframes 增加 `filter: blur(3px)→blur(0)` | 日志条目从模糊渐清晰滑入，增添物理消散感 |
| 猫咪闲置旋摆 | `catIdle` keyframes 增加 `rotate(-3deg)→rotate(3deg)` | 猫咪除了上下浮动还有轻微左右摇摆，更活泼生动 |
| 日志区域聚焦发光 | `.log-area:focus-within` 添加 `box-shadow` 品牌色内发光 | 当日志区域获得焦点时有品牌色内发光指示 |

### 2. ProgressBar.svelte — 猫咪弹跳投影 + 完成态发光边框

**文件**: `src/components/ProgressBar.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 猫咪弹跳投影 | `.progress-cat::after` 伪元素椭圆投影 + `catShadow` 动画与 `catBounce` 同步 (scaleX 0.8↔1.2, opacity 0.3↔0.15) | 猫咪跳起时投影变小变淡，落下时变大变深，暗示物理高度 |
| 完成态发光边框 | `.progress-track` 在 complete 时添加 `border` 渐变色过渡 + 微发光 | 进度 100% 时轨道边框有品牌色发光闭合效果 |

### 3. SettingsPanel.svelte — 分割线流光滑行 + 子字段背景过渡

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 分割线流光滑行 | `.group + .group::before` 增加 `dividerSlide` 动画 (background-position 0%→100%→0%) 替代静态渐变 | 分割线有光芒从左到右缓慢滑行，暗示内容流动 |
| 子字段背景过渡 | `.sub-field-slide` 添加 background 从透明到 `var(--ai-bg-hover)` 过渡 | 子字段展开时有柔和的背景色渐显，增强层次纵深 |

### 4. Header.svelte — 标题光晕同步脉冲 + 拖拽抓手指示

**文件**: `src/components/Header.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 标题光晕脉冲 | `.header-title > span:first-child` 添加 `text-shadow` 白色发光 + `titleGlow` 动画与 `titleShimmer` 同步 (6s) | shimmer 经过时文字有同步微发光，增强光影一体感 |
| 拖拽抓手指示 | `.header::before` 添加 6 点点阵抓手图案 (radial-gradient) + hover 时 opacity 增强 | 头部区域有微弱的抓手图案，暗示可拖拽交互 |

### 5. forms.css — 输入聚焦涟漪环 + Select 箭头弹跳

**文件**: `src/styles/forms.css`

| 效果 | 实现 | 说明 |
|------|------|------|
| 输入聚焦涟漪环 | `.bfao-input:focus, .bfao-select:focus` 的 `box-shadow` 添加 `focusRipple` 动画 (0→6px→0 spread) | 聚焦时有向外扩散的涟漪环，暗示"激活"状态 |
| 图标按钮悬浮旋转增强 | `.bfao-icon-btn:hover svg` 旋转从 8deg 增强到 `rotate(12deg) scale(1.05)` | 更明显的旋转+缩放组合，增强交互反馈 |

### 6. ActionButtons.svelte — 主按钮悬浮渐变反转 + 工具按钮底线

**文件**: `src/components/ActionButtons.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 主按钮悬浮渐变反转 | `.btn-primary:hover` 的 `animation-direction: reverse` | hover 时渐变流动方向反转，产生动感的方向切换 |
| 工具按钮悬浮底线 | `.btn-tool::after` 伪元素品牌色底线 + hover 时 `scaleX(0→1)` + `transform-origin: left` | 悬浮工具按钮时底部有品牌色线条从左渐展，指示当前工具 |

### 7. variables.css — 新设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 | 用途 |
|------|------|------|
| `--ai-glow-title` | `0 0 20px rgba(255,255,255,0.15)` / dark: `0.2` | 标题文字同步发光 |
| `--ai-focus-ripple` | `rgba(115,100,255,0.2)` / dark: `rgba(139,127,255,0.25)` | 输入聚焦涟漪环色 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-47 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~160 行 CSS + ~5 行 Svelte (7 个文件)，1 个新计划文件
- 日志条目有模糊→清晰的物理消散感入场
- 进度猫咪弹跳时投影同步变化——物理高度纵深
- 设置分割线有流光滑行——内容流动暗示
- 标题文字 shimmer 经过时同步微发光——光影一体
- 输入聚焦有涟漪外扩——激活反馈
- 主按钮悬浮渐变方向反转——动感方向切换
- 工具按钮悬浮有品牌色底线渐展——当前工具指示
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
