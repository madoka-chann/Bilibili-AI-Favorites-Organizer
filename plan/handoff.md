# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01)

### 本次完成内容

**Phase 2 动画系统基础层** — 创建了 Svelte actions 和微交互工具系统，并集成到核心组件中。

#### 新增文件

| 文件 | 说明 | 对应计划 |
|------|------|----------|
| `src/actions/magnetic.ts` | 磁性光标吸引 Svelte action (`use:magnetic`) | A1 |
| `src/actions/tilt.ts` | 3D 倾斜悬浮 Svelte action (`use:tilt`) | E3 |
| `src/actions/glow-track.ts` | 径向光追踪 Svelte action (`use:glowTrack`) | C3 |
| `src/actions/ripple.ts` | 点击涟漪 Svelte action (`use:ripple`) | Material ripple |
| `src/animations/micro.ts` | 微交互工具集: pressEffect, focusGlow, checkBounce, staggerReveal, contentStagger, listStaggerReveal | C2, C4, C6, C7, F4, E1 |

#### 修改文件

| 文件 | 变更 |
|------|------|
| `FloatButton.svelte` | +magnetic action, +A3 点击粒子爆发, +A6 液态形变 border-radius 动画, 拖拽时禁用 magnetic |
| `Header.svelte` | +ripple action, +pressEffect, CSS transition 简化避免与 GSAP 冲突 |
| `Modal.svelte` | +F4 内容交错入场 (模态框打开后子元素依次浮现) |

### 关键设计决策

1. **Svelte actions 模式**: 所有可复用交互效果封装为 Svelte action (`use:xxx`)，这是 Svelte 官方推荐的 DOM 交互模式。每个 action 内部调用 `shouldAnimate()` 遵循三级减弱动画策略。

2. **磁性效果 + 拖拽冲突**: magnetic action 新增 `enabled` 选项，FloatButton 在拖拽开始时禁用、结束时恢复。Draggable 使用 `left,top`，magnetic 使用 GSAP `x,y`，属性不冲突但视觉上需要互斥。

3. **micro.ts 是 action 也是工具函数**: `pressEffect` 和 `focusGlow` 是 Svelte action 格式 (返回 `{ destroy }`)；`listStaggerReveal` 和 `contentStagger` 是命令式调用的工具函数。

### 下一步建议

优先级从高到低:

1. **Phase 2 继续**: 将 actions 集成到更多组件 — `tilt` 到 PreviewConfirm 的视频卡片 (E3)，`glowTrack` 到 ActionButtons (C3)，`focusGlow` 到所有 input 元素 (C4)
2. **Phase 2 进阶动画**: B4 弹簧手风琴 (SettingsGroup)，D2-D5 进度条动画，G3/G4 Toast FLIP 堆栈
3. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
4. **Phase 3 CSS 清理**: 可以开始删除原始 22K CSS 文件中不再需要的部分
5. **修复 pre-existing issues**: settings.ts 类型转换 error, ProviderConfig/SettingsPanel a11y warnings

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~35%** (基础设施完成，集成到核心组件，大量高级效果待做)
- Phase 3 CSS 清理: **0%**
- Phase 4 代码质量: **~70%** (类型+模块化完成，安全加固和日志清理待做)
- Phase 5 性能优化: **0%**
