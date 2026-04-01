# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第十一次)

### 本次完成内容

**代码质量强化 — TypeScript 严格模式 + 深度 Code Review 修复**

#### TypeScript 严格化

| 改动 | 文件 | 详情 |
|------|------|------|
| 启用 `noUnusedLocals` + `noUnusedParameters` | `tsconfig.json` | 从 `false` 改为 `true`，捕获死代码 |
| 清理未使用导入 | `src/core/panel-actions.ts` | 移除 `cancelRequested`, `getSourceMediaId`, `exportLogs`, `loadUndoHistory`, `loadHistory` 5 个未使用导入 |
| 清理未使用类型导入 | `src/api/ai-providers.ts` | 移除 `GeminiUsageMetadata`, `StandardUsage` 2 个未使用类型 |
| 修复类型断言 | `src/stores/settings.ts` | `Object.fromEntries` 结果用 `as unknown as Settings` 替代不安全的直接 `as Settings` |

#### 消除 `as any` 类型断言

| 改动 | 文件 | 详情 |
|------|------|------|
| GSAP CDN 全局类型声明 | `src/vite-env.d.ts` | 新增 `declare const Flip/Draggable/CustomEase` 全局类型声明 |
| 移除 3 处 `as any` | `src/animations/gsap-config.ts` | `(globalThis as any).Flip` → 直接使用全局声明的 `Flip`/`Draggable` |
| 改进类型断言 | `src/api/ai-client.ts` | `as { retryable?: boolean }` → `as Record<string, unknown>` + 严格 `=== true` 检查；`onerror` 同理 |

#### 深度 Code Review 发现并修复

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `bilibili-videos.ts` | `moveVideos` catch 块静默吞错误，用户无反馈 | HIGH | 添加 `logs.add(\`移动操作异常: ...\`, 'error')` |
| `bilibili-videos.ts` | `batchDeleteVideos` catch 块日志消息误导 ("限流" 但实际可能是任何错误) | HIGH | 改为 `logs.add(\`删除操作失败: ...\`, 'error')` |
| `stores/state.ts` | 日志数组无上限，长时间运行可能 OOM | MEDIUM | 添加 `MAX_LOG_ENTRIES=500` 自动裁剪 |
| `Toast.svelte` | `setTimeout` 未追踪，组件销毁时无法清理 | MEDIUM | 引入 `toastTimeouts` Map + `onDestroy` 清理 |
| `background-cache.ts` | `safeScan` catch 块完全静默 | MEDIUM | 添加 `import.meta.env.DEV` 条件日志 |
| `ai-client.ts` | JSON 解析失败时无响应片段，难以调试 | MEDIUM | 所有 JSON 错误消息附加 `responseText.substring(0, 120)` |
| `process.ts` | `aiConcurrency` 无边界约束，用户可设极大值 | LOW | 添加 `Math.max(1, Math.min(10, ...))` 约束 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `background-cache.ts` | `stopBackgroundCache` 未被调用 | 模块级代码在页面生命周期内运行，userscript 场景下页面卸载自动清理，无需手动调用 |
| `magnetic.ts` | document mousemove 全局监听 | destroy() 中已正确移除，无泄漏 |
| `process.ts` | `isRunning` TOCTOU 竞态 | JavaScript 单线程模型下同步检查+赋值不会出现真正的竞态，现有模式安全 |
| `Modal.svelte` | ESC 键多模态冲突 | 现有行为 (所有模态响应 ESC) 在当前 UI 设计中不会同时出现多个模态，无需 modal stack |

### 关键设计决策

1. **GSAP 全局类型声明**: 选择在 `vite-env.d.ts` 中用 `declare const` 而非 `declare global` — 简洁直接，无需 namespace 嵌套
2. **`_Flip`/`_Draggable` 本地绑定**: 全局 `declare` 的常量不能直接 `export`，需创建本地绑定再重导出
3. **日志裁剪策略**: 只在超过上限时 slice，避免每次 add 都创建新数组的性能开销
4. **并发约束位置**: 在 process.ts 使用处约束而非 settings store 中 — 保持 store 纯粹，约束逻辑靠近使用方

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次强化: strict TS + 零 `as any` + 错误处理一致性)
- Phase 5 性能优化: **100%** (本次新增: 日志裁剪 + Toast 清理 + 并发约束)

**所有 Phase 均已 100% 完成。代码质量经 11 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十次)

### 本次完成内容

**Phase 2 最终收官 — I1-I5 粒子系统全部完成 + 深度 Code Review**

#### I1-I5 粒子系统实现

| 效果 | 文件 | 详情 |
|------|------|------|
| I1 极光画布 | `src/actions/panel-canvas.ts` | Canvas2D 50% 分辨率；3 层极光带 (多频率 sin 波叠加)；鼠标追踪径向发光；`gsap.ticker.add()` 统一渲染循环 |
| I2 光标散射 | `src/actions/cursor-scatter.ts` | 80ms 节流 + 30% 生成率；最多 5 并发粒子；`position: fixed` 避免 overflow 裁剪 |
| I3 物理纸屑 | `src/animations/progress.ts` | 升级 D4 → 60 粒子 + `gsap.ticker` 逐帧物理；重力 700px/s² + 帧率无关阻力 `Math.pow(drag, deltaRatio)` |
| I4 星云漂移 | `Panel.svelte` (CSS) | 8 个 CSS 粒子；`calc(var(--i))` 参数化；`@keyframes nebula-float`；`prefers-reduced-motion` 自动禁用 |
| I5 丝线网络 | `src/actions/panel-canvas.ts` | Canvas2D 40% 分辨率；30 个线程节点 + 连接检测；鼠标引力；与 I1 共享 `use:panelCanvas` action |

#### 深度 Code Review 发现并修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `cursor-scatter.ts` | 粒子被 `overflow: auto` 裁剪 | 改为 `position: fixed` + `document.body` |
| `panel-canvas.ts` | `time += 0.008` 帧率依赖 | `time += 0.008 * deltaRatio()` |
| `panel-canvas.ts` | I5 线程物理帧率依赖 | `Math.pow(0.998, dr)` + 位移乘 `dr` |
| `panel-canvas.ts` | `scale` 不随 mode 更新 | 提取 `getScale()` + `update()` 调 `resize()` |
| `progress.ts` | I3 空气阻力帧率依赖 | `Math.pow(DRAG, deltaRatio)` |

### 关键设计决策

1. **I1/I5 共享单 Canvas action**: `use:panelCanvas={{ mode }}` — 符合 MAX_CANVAS_FX=1 约束
2. **I3 不使用 Physics2D**: 付费插件，改用 `gsap.ticker` 手动物理
3. **帧率无关物理**: 所有阻力用 `Math.pow(drag, deltaRatio)`
4. **I2 fixed 定位**: 避免 `.panel-content` overflow 裁剪
5. **I4 纯 CSS**: `calc(var(--i))` 参数化 8 个粒子差异

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%** (I1-I5 粒子系统本次全部完成)
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%**
- Phase 5 性能优化: **100%**

**所有 Phase 均已 100% 完成。重构计划 (zesty-wandering-acorn.md) 全部实施完毕。**

---

## 上一次会话 (2026-04-01, 第九次)

### 本次完成内容

**Phase 2 动画扩展 (A5 星座轨道 + C1 全局磁性按钮) + Code Review 修复**

#### Phase 2 新增动画

| 效果 | 文件 | 详情 |
|------|------|------|
| A5 星座轨道 | `FloatButton.svelte` | 5 个轨道球围绕按钮旋转；使用 proxy 对象 + 三角函数定位 (避免 MotionPathPlugin 依赖)；每球独立周期 (10-18s) 营造星座不规则感；闪烁周期 1.5-2.8s, sine.inOut 缓动；轨道半径 42px, 球体 3-5px, 5 种品牌色 |
| C1 全局磁性按钮 | `ActionButtons.svelte`, `FolderSelector.svelte`, `HistoryTimeline.svelte`, `DeadVideosResult.svelte`, `DuplicatesResult.svelte` | 所有按钮集成 `use:magnetic={{ radius: 40, strength: 0.25 }}`；ActionButtons 10 个按钮 + 4 个 Modal 组件共 6 个按钮 = 16 个新增磁性按钮 |

#### Code Review 修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `FloatButton.svelte` | A5 轨道 `onUpdate` 中使用 `gsap.set(orb, {x,y})` — 每帧 300 次调用有不必要的 GSAP 内部开销 | 改为直接 `orb.style.transform = translate(...)` — 零开销的原生 DOM 操作 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `ActionButtons.svelte` | `use:magnetic` 在 `disabled` 按钮上仍生效，可能覆盖 CSS `transform: none` | 影响极小 — disabled 仅在 isRunning 时触发，磁性偏移 ≤10px，不值得增加复杂度 |
| `magnetic.ts` | 10 个按钮 = 10 个 document mousemove 监听器 | 每个监听器仅做距离计算 (O(1))，性能无忧 |

### 关键设计决策

1. **A5 不使用 MotionPathPlugin**: 该插件未在 vite.config.ts CDN 配置中注册。使用 proxy 对象 + `Math.cos/sin` 三角函数实现等效圆形轨道，零额外依赖。

2. **轨道球作为按钮子元素**: 将 `.orbits` 容器放在 `<button>` 内部 — 确保拖拽时轨道球跟随按钮移动，且 `gsap.context(fn, btnEl)` 作用域覆盖所有子元素。

3. **C1 磁性参数统一**: 所有小按钮使用 `{ radius: 40, strength: 0.25 }` (计划规定值)，FloatButton 保持 `{ radius: 120, strength: 0.3 }` — 大小差异体现层次感。

### 下一步建议

Phase 2 仅剩 **I1-I5 粒子系统** (Canvas 效果, 需性能测试, 复杂度高)。所有其他 Phase 均 100% 完成。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~93%** (剩余: I1-I5 粒子系统 — Canvas 效果, 可选装饰性)
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%**
- Phase 5 性能优化: **100%**

---

## 上一次会话 (2026-04-01, 第八次)

### 本次完成内容

**Phase 2 动画扩展 (A4 FLIP 变形 + B5 深度视差) + Code Review 遗留修复**

#### Phase 2 新增动画

| 效果 | 文件 | 详情 |
|------|------|------|
| A4 FLIP 变形 | `App.svelte`, `Panel.svelte` | 点击 FloatButton 时捕获 `Flip.getState(btn)`，传递给 Panel 组件；Panel onMount 使用 `Flip.from()` 实现按钮→面板的形变过渡 (0.55s velvetSpring)；fallback 为 B1 丝绒绽放 |
| B5 深度视差 | `src/actions/parallax.ts`, `Panel.svelte` | 新建 `use:parallax` Svelte action；面板内滚动时 `--parallax-y` CSS 变量更新在父元素上；`.panel::before` 渐变背景层消费该变量进行 translateY 偏移 |

#### Code Review 修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `process.ts` | `Promise.all(aiPromises)` 虽然单个 promise 已有 try-catch，但缺少外层防护 | 添加 try-catch 包裹，捕获 limiter 等意外异常并输出友好日志 |
| `undo.ts` | 旧格式迁移缺少 shape 验证，可能导入无效数据 | 新增 `isValidUndoRecord()` 校验函数；`loadUndoHistory` 用 `.filter()` 过滤无效记录 |

#### 深度 Code Review 发现并修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `parallax.ts` | CSS 变量作用域 bug — `--parallax-y` 设在子元素 `.panel-content` 上，但 `.panel::before` 在父元素上无法访问 | 改为设置在 `node.parentElement` (即 `.panel`) 上 |
| `parallax.ts` | `gsap.quickTo` 不适合 CSS 变量字符串值插值 | 改用直接 `style.setProperty()` — 更简单可靠，移除不必要的 gsap 导入 |
| `App.svelte` | `import '$animations/gsap-config'` 与具名导入重复 | 删除冗余的副作用导入 |
| `Panel.svelte` | `.panel-content` 缺少 z-index，可能被 `::before` 背景层遮挡 | 添加 `position: relative; z-index: 1` |
| `Panel.svelte` | FLIP onComplete 中位置恢复逻辑与 onMount 重复 | 提取 `restoreSavedPosition()` 复用函数 |

### 关键设计决策

1. **A4 FLIP 跨组件协调**: 由 App.svelte 统一协调 — 在 FloatButton 隐藏前通过 DOM 查询 `.float-btn` 捕获 Flip 状态，通过 prop 传递给 Panel。选择 DOM 查询而非组件 ref 暴露，因为 Svelte 不原生支持跨组件 DOM ref。

2. **B5 视差采用纯 CSS 变量方案**: 放弃 `gsap.quickTo` 方案 — CSS 变量的 string 值 (`"-12px"`) 不适合 quickTo 的数值插值。直接 `style.setProperty` 配合 `passive: true` scroll 监听已足够流畅，且零依赖。

3. **parallax 变量设在父元素**: 因为 `::before` 伪元素属于 `.panel` (父)，而 scroll 事件在 `.panel-content` (子) 上触发。CSS 变量只能向下继承，不能向上传递，所以必须设在父元素上。

### 下一步建议

项目 **5 个阶段全部完成**。Phase 2 剩余可选装饰性动画：

1. **A5 星座轨道** — 5 个轨道球围绕 FloatButton 旋转 (motionPath, 纯装饰)
2. **C1 全局磁性按钮** — 更多组件集成 `use:magnetic` (低优先级)
3. **I1-I5 粒子系统** — Canvas 效果 (需性能测试, 复杂度高)

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~87%** (剩余: A5 星座轨道, C1 磁性扩展, I1-I5 粒子系统 — 均为可选装饰性)
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%**
- Phase 5 性能优化: **100%**
