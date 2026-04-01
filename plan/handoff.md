# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第二次)

### 本次完成内容

**Phase 2 动画集成扩展** — 将已有的 Svelte actions 和微交互工具集成到更多组件中，并新增 B4 弹簧手风琴。

#### 修改文件

| 文件 | 变更 | 对应计划 |
|------|------|----------|
| `SettingsGroup.svelte` | 替换 Svelte `transition:slide` 为 GSAP 弹簧手风琴 (高度动画 + 箭头旋转)；CSS 控制初始状态，GSAP 控制交互；无动画时有 fallback | B4 |
| `ActionButtons.svelte` | 所有 10 个按钮添加 `use:glowTrack` + `use:pressEffect`；CSS 新增 radial-gradient 利用 `--glow-x/--glow-y` | C1, C2, C3 |
| `PreviewConfirm.svelte` | 视频卡片添加 `use:tilt` (2° 倾斜)；分类展开时 `listStaggerReveal` 交错入场 | E3, E1 |
| `ProviderConfig.svelte` | 所有 input 添加 `use:focusGlow` (API地址/Key/模型名/并发数) | C4 |
| `SettingsPanel.svelte` | number inputs 添加 `use:focusGlow` (写延迟/移动数/限制数) | C4 |
| `PromptEditor.svelte` | textarea 添加 `use:focusGlow` | C4 |

### 关键设计决策

1. **SettingsGroup GSAP 接管**: 不再使用 Svelte `transition:slide`，改为 GSAP `fromTo` 动画。原因是 `transition:slide` 需要条件渲染 (`{#if}`), 而 GSAP 直接操作 DOM 可以避免 slot 内容的销毁/重建。CSS 的 `height: 0; overflow: hidden` 和 `.initially-open` 类处理初始状态，`onMount` 后由 GSAP 接管。`shouldAnimate()` 为 false 时直接设置样式做 fallback。

2. **ActionButtons 双层效果**: `glowTrack` 提供视觉反馈 (radial-gradient 跟随光标)，`pressEffect` 提供触觉反馈 (按压缩放)。两者互不冲突，分别操作 CSS 变量和 GSAP transform。

3. **PreviewConfirm E1 集成**: 使用 `await tick()` 确保 DOM 更新后再调用 `listStaggerReveal`。通过 `data-category` 属性 + `CSS.escape()` 精确定位展开的分类。

### 下一步建议

优先级从高到低:

1. **Phase 2 进阶动画**: D2-D5 进度条动画 (粒子/阶段切换/庆祝)，G3/G4 Toast FLIP 堆栈和类型化入场
2. **Phase 2 高级效果**: B3 标签交叉淡入，C5 液态开关，E2 FLIP 展开折叠，E4 缩略图缩放
3. **Phase 2 文字特效**: H1 文字解码 (LogArea), H2 数字翻滚
4. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
5. **Phase 3 CSS 清理**: 可以开始删除原始 22K CSS 文件中不再需要的部分
6. **修复 pre-existing issues**: settings.ts 类型转换 error, ProviderConfig/SettingsPanel a11y warnings

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~45%** (基础设施 + actions 创建完成，集成到大部分组件，进阶动画和粒子系统待做)
- Phase 3 CSS 清理: **0%**
- Phase 4 代码质量: **~70%** (类型+模块化完成，安全加固和日志清理待做)
- Phase 5 性能优化: **0%**
