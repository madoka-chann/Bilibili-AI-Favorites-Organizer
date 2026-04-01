# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第三次)

### 本次完成内容

**Phase 2 进阶动画 — D 进度条 + G Toast 增强 + H 文字特效** — 新建 2 个动画模块，更新 4 个组件，实现 8 个动画效果。

#### 新建文件

| 文件 | 内容 | 对应计划 |
|------|------|----------|
| `src/animations/progress.ts` | D2 进度轨迹粒子 + D3 阶段切换闪光 + D4 胜利庆祝(微震+纸屑) + D5 数字弹跳 | D2-D5 |
| `src/animations/text.ts` | H1 文字解码(乱码→逐位还原) + H2 数字翻滚(从0滚动到目标值) | H1, H2 |

#### 修改文件

| 文件 | 变更 | 对应计划 |
|------|------|----------|
| `ProgressBar.svelte` | D2 每进度+4%触发3个轨迹粒子；D3 阶段切换时标签飘出+新标签入场+进度条闪光；D4 100%时微震+24个纸屑粒子庆祝；D5 百分比变化时弹跳缩放；状态在 `isRunning=false` 时重置 | D2-D5 |
| `Toast.svelte` | G3 添加/删除 toast 时用 `Flip.getState()` + `Flip.from()` 实现堆栈重排动画；G4 四种类型化入场: success=弹跳scale, error=滑入+短促震动, warning=从上方落下, info=标准弹性滑入 | G3, G4 |
| `LogArea.svelte` | H1 新日志条目使用 `use:decodeEntry` action 触发文字解码效果，通过 `decodedIds` Set 避免重复动画；添加等宽字体增强解码视觉效果 | H1 |
| `StatsDialog.svelte` | H2 统计数字(收藏夹数/视频总数/失效视频数/健康评分)使用 `use:rollNumber` action，从0平滑滚动到目标值(800ms，cubic ease-out) | H2 |

### Code Review 修复

| 问题 | 修复 |
|------|------|
| ProgressBar.svelte 未使用的 `onDestroy` import | 移除 |
| progress.ts 硬编码 z-index `2147483646` | 改用 `Z_INDEX.PARTICLE` 常量 |
| StatsDialog.svelte 未使用的 `BiliData` type import | 移除 |

### 关键设计决策

1. **D2 粒子节流**: 每进度+4%才触发一次粒子生成(3个/次)，避免过度创建 DOM 元素。粒子使用 `position: absolute` 在 track 内定位，track 设为 `overflow: visible`。

2. **D3 阶段切换时间线**: 使用 `gsap.timeline()` 协调闪光(brightness)和标签交换(y轴飘出/入场)。首次设置阶段时跳过动画，仅后续切换播放。

3. **D4 胜利庆祝**: 24个纸屑粒子 append 到 `document.body`(使用 `position: fixed`)，模拟物理抛射轨迹(角度 + 速度 + 重力)，动画完成后自动 `remove()`。

4. **G3 FLIP 堆栈**: 添加 toast 时记录现有 toast 的 FLIP state，用 `tick()` 等待 DOM 更新后 `Flip.from()` 动画化重排。新增的 toast 排除在 FLIP targets 外(它有自己的入场动画)。删除 toast 同理。

5. **G4 类型差异化**: error toast 有独特的"滑入后短促震动"效果(5步 keyframes, 每步 0.04s)，模拟警报感。warning 从上方落下而非从右侧滑入，形成视觉区分。

6. **H1 文字解码**: 纯 JS + RAF 实现(不依赖 GSAP)，每 20ms 解码一个字符。空格位置保持不变，仅随机替换非空格字符。通过 `decodedIds` Set 确保每条日志只解码一次。

7. **H2 数字翻滚**: 也是纯 JS + RAF 实现，支持 `toLocaleString()` 格式化和自定义后缀。使用 cubic ease-out 使起步快、结尾缓。

### 下一步建议

优先级从高到低:

1. **Phase 2 高级效果**: B3 标签交叉淡入，C5 液态开关，E2 FLIP 展开折叠，E4 缩略图缩放
2. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
3. **Phase 2 拖拽/主题**: K2 面板拖拽，K3 位置持久化，J1-J3 主题切换过渡
4. **Phase 2 其他**: A4 FLIP 变形为面板，A5 星座轨道，B5 深度视差
5. **Phase 3 CSS 清理**: 可以开始删除原始 22K CSS 文件中不再需要的部分
6. **修复 pre-existing issues**: settings.ts 类型转换 error, SettingsGroup.svelte callback 类型, ProviderConfig/SettingsPanel a11y warnings

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~60%** (基础设施完成 + actions 创建 + 组件集成 + 进度条/Toast/文字特效动画；剩余: 高级视觉效果、粒子系统、主题过渡)
- Phase 3 CSS 清理: **0%**
- Phase 4 代码质量: **~75%** (类型+模块化完成; 本次清理了 3 处代码异味)
- Phase 5 性能优化: **0%**
