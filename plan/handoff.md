# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第五次)

### 本次完成内容

**Phase 2 拖拽系统 K2/K3 + 主题过渡 J1/J2/J3** — 修改 2 个组件文件 + 2 个 plan 文件，实现面板拖拽、位置持久化、圆形揭示主题切换、图标旋转动画、色彩过渡。

#### 修改文件

| 文件 | 变更 | 对应计划 |
|------|------|----------|
| `Panel.svelte` | K2 GSAP Draggable 面板拖拽 (header 为触发区, 拖拽时 scale:0.98 + 增强阴影); K3 位置持久化 (`bfao_panelPos` GM storage) + 视口钳制恢复 | K2, K3 |
| `Header.svelte` | J1 圆形揭示: 旧主题色全屏遮罩 + clip-path 收缩揭示新主题; J2 图标旋转: 360° prismBounce; J3 面板色彩过渡: CSS transition 0.5s; header 添加 grab 光标 | J1, J2, J3 |

### Code Review 修复

| 问题 | 修复 |
|------|------|
| Header.svelte J3 dead code: 计算了 5 个 CSS 变量但只用了 `--ai-bg` | 精简为只取 `--ai-bg` |
| Header.svelte `appEl.style.transition` 无效: `.bfao-app` 有 `all:initial` 且无自身背景色 | 改为对 `.panel` 元素设置 transition |
| Panel.svelte K3 恢复位置可能越界 | 添加 `Math.max/min` 视口范围钳制 |

### 关键设计决策

1. **K2 面板拖拽实现**: 使用 `Draggable.create(panelEl, { trigger: headerEl })` 模式。Header 包裹在一个 `<div bind:this={headerEl}>` 中作为触发区域。拖拽时 scale 微缩至 0.98 + 增强阴影反馈, 松手后 prismBounce 回弹。`edgeResistance: 0.65` 提供边缘阻力。

2. **K3 位置持久化**: 与 FloatButton 的 `bfao_floatBtnPos` 模式对齐, 使用 `bfao_panelPos` 存储 `{ top, left }`。恢复时用 `bottom: auto` 覆盖 CSS 默认的 `bottom: 30px`。添加了视口钳制确保窗口缩小后面板不会出界。

3. **J1 圆形揭示方向**: 采用"旧色收缩"而非"新色扩展"策略。创建旧主题背景色的全屏遮罩层, clip-path 从全屏圆收缩到点击位置消失, 自然揭示下方已切换的新主题。这样 App.svelte 的 `data-theme` 可以立即响应式更新, 遮罩只负责视觉过渡。

4. **J2 图标旋转**: 直接 `gsap.fromTo(themeIconEl, {rotation:0}, {rotation:360})` 配合 prismBounce 缓动。Svelte 的 `{#if $isDark}` 条件渲染会在 store 更新后立即切换图标 (Sun↔Moon), 旋转动画作用于按钮容器而非图标本身, 确保图标切换和旋转同时发生。

5. **J3 色彩插值**: 对 `.panel` 元素设置 CSS `transition` (background-color, color, border-color, box-shadow), 600ms 后移除。因为 CSS 变量变化会触发依赖它们的属性重新计算, transition 能捕获这些变化。

### 下一步建议

优先级从高到低:

1. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
2. **Phase 2 其他**: A4 FLIP 变形为面板, A5 星座轨道, B5 深度视差
3. **Phase 2 收尾**: C1 全局磁性按钮 (更多组件集成)
4. **Phase 3 CSS 清理**: 可以开始删除原始 22K CSS 文件中不再需要的部分
5. **修复 pre-existing issues**: settings.ts 类型转换 error, SettingsGroup.svelte callback 类型, ProviderConfig/SettingsPanel a11y warnings

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~80%** (基础设施 + actions + 组件集成 + 进度条/Toast/文字特效 + 高级效果 + 拖拽系统 + 主题过渡; 剩余: 粒子系统、FLIP 变形、星座轨道、深度视差)
- Phase 3 CSS 清理: **0%**
- Phase 4 代码质量: **~80%** (类型+模块化完成; 本次清理了 3 处代码异味)
- Phase 5 性能优化: **0%**
