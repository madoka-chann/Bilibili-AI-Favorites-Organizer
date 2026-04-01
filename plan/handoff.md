# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第八次)

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
