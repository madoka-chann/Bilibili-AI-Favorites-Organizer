# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第四次)

### 本次完成内容

**Phase 2 高级视觉效果 — B3 标签交叉淡入 + C5 液态开关 + E2 FLIP 展开折叠 + E4 悬浮缩放** — 新建 1 个组件，新增 1 个动画函数，更新 4 个组件。

#### 新建文件

| 文件 | 内容 | 对应计划 |
|------|------|----------|
| `src/components/LiquidToggle.svelte` | C5 液态开关组件: thumb 滑动 + scaleX 拉伸/回弹 + track 脉冲，替代 SettingsPanel 中的 checkbox | C5 |

#### 修改文件

| 文件 | 变更 | 对应计划 |
|------|------|----------|
| `Panel.svelte` | B3 settings 面板切换时交叉淡入/淡出动画(opacity+x 偏移); 使用 `settingsVisible` 控制 DOM 存在期以支持退场动画; 合并重复 gsap-config 导入 | B3 |
| `SettingsPanel.svelte` | 集成 LiquidToggle 替代 checkbox; 行为设置(Group 3)和动画效果(Group 4)的 7 个 boolean toggle 全部使用 LiquidToggle; 新增 `.toggle-row` 布局样式 | C5 |
| `PreviewConfirm.svelte` | E2 分类展开/折叠时用 `Flip.getState()` + `Flip.from()` 实现 FLIP 布局动画; E4 视频项添加 `use:hoverScale` 悬浮缩放; 修复 tilt scale=1 避免与 hoverScale 冲突 | E2, E4 |
| `src/animations/micro.ts` | 新增 `hoverScale()` Svelte action: mouseenter 时 scale 放大, mouseleave 时缩回, 支持自定义 scale/duration, 自动清理 | E4 |

### Code Review 修复

| 问题 | 修复 |
|------|------|
| LiquidToggle CSS `transition: transform` 与 GSAP `x` 属性冲突 | 移除 CSS transition 和 `.on .thumb` transform 规则，GSAP 全权控制运动; `onMount` 设置初始位置 |
| Panel.svelte 两行重复 `$animations/gsap-config` 导入 | 合并为单行导入 |
| PreviewConfirm tilt `scale:1.01` 与 hoverScale `scale:1.03` 在同一元素冲突 | tilt scale 改为 1 (仅倾斜), hoverScale 负责缩放 |

### 关键设计决策

1. **B3 交叉淡入实现**: 使用 `prevSettingsOpen` 变量追踪前值变化，触发 `animateSettingsToggle()`。打开时先设 `settingsVisible=true` → `tick()` → GSAP fromTo 淡入; 关闭时 GSAP 淡出 → `onComplete` 设 `settingsVisible=false` 移除 DOM。

2. **C5 LiquidToggle 架构**: 完全独立的 Svelte 组件，接收 `checked` prop 和 `onchange` 回调。GSAP timeline 协调 thumb 的 scaleX/scaleY 拉伸 (0.12s) → 滑动+恢复 (0.28s)。track 同时做 scale 脉冲 (yoyo+repeat)。CSS 只负责颜色过渡 (background transition)，所有运动交给 GSAP。

3. **E2 FLIP 展开折叠**: `toggleExpand()` 中先 `Flip.getState()` 捕获所有 `.category-group` 的布局位置，然后修改 `expanded` Set → `tick()` → `Flip.from()` 动画化布局变化。FLIP 动画完成后再触发 E1 stagger reveal，确保动画不冲突。

4. **E4 hoverScale 与 tilt 共存**: 两个 action 都操作同一 DOM 元素的 transform。解决方案: tilt 的 `scale` 参数设为 1 (不缩放，只做 3D 倾斜)，hoverScale 独立处理缩放。GSAP `overwrite: 'auto'` 确保不会堆叠冲突的 tween。

### 下一步建议

优先级从高到低:

1. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
2. **Phase 2 拖拽/主题**: K2 面板拖拽，K3 位置持久化，J1-J3 主题切换过渡
3. **Phase 2 其他**: A4 FLIP 变形为面板，A5 星座轨道，B5 深度视差
4. **Phase 3 CSS 清理**: 可以开始删除原始 22K CSS 文件中不再需要的部分
5. **修复 pre-existing issues**: settings.ts 类型转换 error, SettingsGroup.svelte callback 类型, ProviderConfig/SettingsPanel a11y warnings

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~70%** (基础设施完成 + actions + 组件集成 + 进度条/Toast/文字特效 + 高级效果 B3/C5/E2/E4；剩余: 粒子系统、主题过渡、面板拖拽、FLIP 变形)
- Phase 3 CSS 清理: **0%**
- Phase 4 代码质量: **~75%** (类型+模块化完成; 本次清理了 3 处代码异味)
- Phase 5 性能优化: **0%**
