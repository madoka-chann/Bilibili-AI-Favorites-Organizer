# 视觉增强计划 — Session 50

## 目标

**Kinetic Micro-Physics — 微观动力学**：为二级组件注入物理微动效——手风琴展开涟漪、统计卡片边框流光、时间线节点链式脉冲、失效视频危险渐变、重复视频序号弹出、文件夹选择器选中光弧。前 49 轮完成了全组件核心动画 + 环境共振，本轮聚焦于 **对话框/列表类组件的物理微交互**——让每一个列表项、每一个数据卡片都具备触觉级别的运动响应。

**主题**: "Kinetic Micro-Physics — 微观动力学"

**原则**：不新建文件，复用已有 CSS keyframes/transitions + 设计令牌。所有新增动画在 `prefers-reduced-motion` 下禁用或退化。总改动量控制在 ~180 行 CSS + ~15 行 Svelte，7 个文件。

---

## 与已有视觉计划的关系

- **Session 27–49** 已完成全组件动画 + 微交互 + 弹性状态 + 流体纵深 + 物理投影 + 动感纵深 + 环境共振
- 本次聚焦：**手风琴涟漪** + **统计卡片流光** + **时间线链式脉冲** + **失效视频危险脉冲** + **重复视频序号弹出** + **文件夹选中光弧** + **新设计令牌**

---

## 具体改动

### 1. SettingsGroup.svelte — 手风琴展开涟漪 + 图标呼吸光圈

**文件**: `src/components/SettingsGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 展开涟漪 | `.group.open .group-header::after` 增加 `headerRippleExpand` 动画 (scaleX 0→1.2 + opacity 0.4→0 0.6s) | 手风琴展开时底部有一道向两侧扩散的涟漪光线 |
| 图标呼吸光圈 | `.group.open .group-icon` 添加 `iconBreathGlow` 动画 (box-shadow 8px→14px→8px 品牌色 3s infinite) | 展开状态下图标有持续微弱的光圈呼吸，暗示"活跃内容" |
| 标题悬浮微移 | `.group-header:hover .group-title` 添加 `translateX(2px)` transition | 鼠标经过时标题轻微右移，增添动感 |

### 2. StatsDialog.svelte — 统计卡片边框流光 + 健康环粒子轨道 + 比例条脉冲

**文件**: `src/components/StatsDialog.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 卡片边框流光 | `.stat-card::before` (非nth-child选择的) 添加 `cardBorderFlow` 动画 (border-image gradient 旋转, 用 background conic-gradient 模拟) | 统计卡片有微弱的边框渐变流动效果 |
| 健康环粒子 | `.health-ring::after` 添加 3px 圆点 + `ringOrbitDot` 动画 (rotate 0→360° 4s infinite) | 健康环上有一颗小光点沿圆弧轨道运行 |
| 比例条脉冲 | `.folder-row:hover::after` 增加 `barPulseGlow` 效果 (box-shadow 0→4px 品牌色 glow) | 悬浮时比例条有发光脉冲 |
| 分区标题流光 | `.section-title::before` 添加从左到右渐变光扫 | 分区标题有微妙的光泽扫过效果 |

### 3. HistoryTimeline.svelte — 时间线节点链式脉冲 + 卡片悬浮内光 + 空状态呼吸

**文件**: `src/components/HistoryTimeline.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 节点链式脉冲 | `.timeline-dot` 添加 `dotChainPulse` 动画 (box-shadow 扩散 + 收缩 1.5s, delay = var(--i) * 0.3s) | 各节点按顺序依次亮起形成链式传导效果 |
| 卡片内光 | `.timeline-item:hover .timeline-card::before` 添加内侧顶部渐变光条 (height 2px, gradient scaleX 0→1) | 悬浮时卡片顶部有一道光条亮起 |
| 空状态脉动 | `.bfao-modal-empty` 添加 `emptyBreath` 动画 (opacity 0.5↔0.8 + translateY 微浮 3s infinite) | 空状态文字有微弱的浮动呼吸感 |
| 分类标签悬浮色变 | `.timeline-cats:hover` 添加 border-left 品牌色 accent | 分类标签悬浮时有品牌色左侧指示条 |

### 4. DeadVideosResult.svelte — 危险渐变脉冲 + 视频项悬浮删除线 + 摘要数字强调

**文件**: `src/components/DeadVideosResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 危险渐变脉冲 | `.folder-group` 添加微弱 `dangerAmbient` 动画 (border-left 2px error-color, opacity 呼吸 0.3↔0.6 4s) | 失效视频分组有微弱的红色左侧条呼吸，暗示"需要处理" |
| 悬浮删除线 | `.video-item:hover::after` 添加 `strikeReveal` 动画 (width 0→100%, height 1px, error-color, 0.3s) | 鼠标经过失效视频时有删除线从左到右划过 |
| 摘要强调弹出 | `.bfao-modal-summary strong` 添加 `emphasisPop` 动画 (scale 1→1.15→1 + color glow, 0.4s, stagger) | 摘要中的数字有弹出强调效果 |

### 5. DuplicatesResult.svelte — 序号弹出链 + 悬浮副本标记 + 列表入场波纹

**文件**: `src/components/DuplicatesResult.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 序号弹出链 | `.dup-item::before` 添加 `counterPop` 入场动画 (scale 0→1.2→1, stagger via --i var) | 序号圆点按顺序弹出，形成链式入场效果 |
| 悬浮文件夹高亮 | `.dup-folders` 悬浮时添加 underline gradient 展开 (scaleX 0→1) | 重复出现的文件夹名悬浮时有渐变下划线展开 |
| 项目间连接线 | `.dup-item + .dup-item::after` 添加左侧连接竖线 (2px, 品牌色, 低 opacity) | 相邻重复项之间有微弱的连接线暗示关联 |

### 6. FolderSelector.svelte — 选中光弧 + 文件夹图标微动 + 全选按钮状态流光

**文件**: `src/components/FolderSelector.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 选中光弧 | `:global(.bfao-selectable-item.selected)::after` 添加右侧圆弧光条 (height 60%, 2px, 品牌色, scaleY 0→1) | 选中的文件夹右侧有一道品牌色光弧亮起 |
| 文件夹标题打字 | `.folder-title` 悬浮时 `letter-spacing: 0.03em` + color transition | 悬浮时标题文字微微展开 |
| 全选流光 | `.toggle-all:hover::before` 添加底部渐变光条 (scaleX 0→1, gradient) | 全选按钮悬浮时有底部光条展开 |

### 7. variables.css — 新增设计令牌

**文件**: `src/styles/variables.css`

| 令牌 | 值 (light / dark) | 用途 |
|------|-------------------|------|
| `--ai-glow-icon-breath` | `0 0 10px rgba(primary, 0.2)` / `0 0 10px rgba(primary, 0.3)` | SettingsGroup 图标呼吸光圈 |
| `--ai-danger-ambient` | `rgba(error, 0.08)` / `rgba(error, 0.12)` | DeadVideosResult 危险氛围色 |

---

## 不做的事

- **不新建动画文件/组件**
- **不修改 Session 27-49 已完成的核心动画**
- **不添加 Canvas/粒子效果**
- **不引入新 GSAP 插件**
- **不修改功能逻辑**

---

## 预期效果

- 总改动量：~180 行 CSS + ~15 行 Svelte (7 个文件)，1 个新计划文件
- 手风琴展开时有涟漪扩散——物理反馈
- 统计卡片有边框流光——数据活力感
- 健康环有轨道粒子——生命力暗示
- 时间线节点链式脉冲——时间流动感
- 失效视频有危险渐变脉冲——紧迫感暗示
- 重复视频序号链式弹出——列表节奏感
- 文件夹选中有光弧——选中确认反馈
- 所有新增动画在 prefers-reduced-motion 下禁用或退化
