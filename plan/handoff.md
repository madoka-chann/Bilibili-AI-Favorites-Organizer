# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-02, 第二十次)

### 本次完成内容

**错误类型规范化 + 数据校验强化 + 类型安全修正 — 6 处代码质量改进 + 深度架构级 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `ai-client.ts` | `callAISingle` 中 `onerror`/`ontimeout`/限流 reject 使用 plain object `{ retryable: true, message }` — 无 stack trace，`instanceof Error` 检查失败，与项目错误处理约定不一致 | MEDIUM | 新增 `RetryableError extends Error` 类；所有 retryable reject 使用 `new RetryableError()`；`callAI` 中重试检测改为 `instanceof RetryableError` |
| `undo.ts` | `isValidUndoRecord` 仅校验 `moves` 为非空数组 — 不验证条目结构，损坏的 GM 存储数据可导致运行时 TypeError (缺少 `fromMediaId`/`toMediaId`/`resources`) | MEDIUM | 新增 `isValidMove` 校验函数，验证每条 move 的 `fromMediaId: number` / `toMediaId: number` / `resources: string (非空)` |
| `settings.ts` | `loadFromStorage` 直接将 `gmGetValue` 返回值 cast 为 `Settings` — 损坏的 GM 存储可注入 NaN/负值/类型不匹配，导致死循环(aiChunkSize=0)或 UI 异常 | MEDIUM | 新增 `NUMERIC_BOUNDS` 范围表 + `sanitizeValue` 校验函数；所有数值字段 clamp 到合法范围，类型不匹配回退默认值 |
| `collections.ts` | `groupBy` 返回 `Record<number, T[]>` — JS 对象键隐式转字符串，调用方 `Object.entries()` 得到 `[string, T[]]`，需 `Number()` 转回，类型系统与运行时不一致 | MEDIUM | 改为返回 `Map<number, T[]>`，调用方 (`process.ts`/`dead-videos.ts`) 直接 `for...of` 迭代，消除隐式类型转换 |
| `bilibili-scanner.ts` | 分页循环中 `res.data` 可能为 null/undefined 时仍访问 `has_more` — 虽有 `?.` 保护但逻辑顺序不清晰，`medias.length === 0` 检查混入 `has_more` 条件 | LOW | 前置 `!res.data` 退出；将 `medias.length === 0` 检查提前到遍历前；`has_more` 直接用 `res.data.has_more` (已由前置 guard 保证非 null) |
| `download.ts` | `URL.revokeObjectURL` 延迟仅 100ms — 慢速系统上浏览器可能尚未启动下载；`parentNode.removeChild` 是过时 DOM API | LOW | 延迟增至 1000ms；改用 `a.remove()` |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `bilibili-http.ts` | `handleRateLimit=true` 时跳过 HTTP status 检查 | B站 API 统一返回 HTTP 200 + JSON `code` 字段标识错误；非 JSON 响应 (CDN 错误页) 会在 `res.json()` 阶段抛异常被 catch 捕获 |
| `bilibili-folders.ts` | 创建收藏夹后仅在 `_folderListCache` 存在时追加 | 缓存未初始化时追加无意义；下次 `getAllFoldersWithIds` 会完整加载；process.ts 移动前已调用 `invalidateFolderCache()` |
| `ai-providers.ts` | SSRF 错误消息包含 "内网地址" 字样 | 面向用户的中文提示，非面向攻击者的 API 响应；告知用户地址被拒原因有助排查配置问题 |
| `timing.ts` | `createConcurrencyLimiter` 无超时/取消机制 | 所有消费方 (`callAI` 批处理) 内部有独立超时和取消检查；limiter 仅控制并发度，不承担超时职责 |
| `modal-bridge.ts` | 新请求覆盖旧 pending promise 时 reject 旧 promise | 调用方 (`process.ts`) 在 `try/finally` 中统一处理 rejection；UI 串行触发，并发覆盖场景极低 |
| `background-cache.ts` | 生产环境扫描失败静默吞错 | 后台缓存是非关键路径优化；失败不影响核心功能；避免用户看到无意义的后台错误 Toast |

### 关键设计决策

1. **RetryableError 类 vs plain object**: Error 子类保留 stack trace，`instanceof` 检查替代 duck typing (`'retryable' in err`)，更安全且与 TypeScript 类型系统对齐。
2. **groupBy 返回 Map**: JS 对象键始终为 string，导致 `Record<number, T[]>` 的类型签名是谎言。`Map<number, T[]>` 保留真实的 number 键，消除调用方 `Number()` 转换。
3. **Settings sanitizeValue 在 load 时而非 consume 时**: 统一在加载入口校验一次，比在每个消费点分别 `Math.max(1, ...)` 更全面、更不容易遗漏。与 session 19 的 `process.ts` 消费点防护互补——两道防线。
4. **Scanner data null guard 前置**: `!res.data` 比 `!res.data?.has_more` 更清晰地表达"服务器未返回数据"语义；`medias.length === 0` 在遍历前检查避免空循环。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: RetryableError 类替代 plain object / UndoRecord 深度校验 / Settings 范围校验 / groupBy Map 化 / Scanner guard 强化)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 20 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十九次)

### 本次完成内容

**资源泄漏修复 + 零值防护 + 类型安全强化 — 5 处代码质量改进 + 深度架构级 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `Toast.svelte` | `toasts.length > MAX_TOAST_COUNT` 时 `slice` 丢弃旧 toast，但 `toastTimeouts` Map 中对应的 setTimeout 未清除 — 超时后触发 `removeToast()` 操作不存在的 toast，且 Map 条目永不释放 | MEDIUM | 在 `slice` 前遍历被丢弃 toast，`clearTimeout` + `delete` 清理 |
| `process.ts` | `settings.aiChunkSize` 无下界保护 — 存储损坏或用户设为 0 时，`for (i += 0)` 死循环锁死 UI | MEDIUM | 新增 `Math.max(1, settings.aiChunkSize)` 提取为 `chunkSize` 常量 |
| `process.ts` | `settings.moveChunkSize` 同理无下界保护 — 0 值导致移动阶段死循环 | MEDIUM | 新增 `Math.max(1, settings.moveChunkSize)` 提取为 `moveChunk` 常量 |
| `ai-client.ts` | `fetchModelList` 非 GitHub 分支中 `json` 变量类型为 `{ data?; models? }` — 但 GitHub catalog API 可返回裸数组，类型断言不匹配 | LOW | 将 `json` 类型改为 `unknown`，各分支独立做安全类型断言 |
| `background-cache.ts` | `stopBackgroundCache()` 后 `scanInProgress` flag 可能残留为 `true` — 若 `stop()` 时恰好有扫描在运行，后续 `setup()` 的新扫描被永久阻塞 | LOW | 在 `stop()` 末尾重置 `scanInProgress = false` |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `magnetic.ts` | 每个 magnetic action 实例注册全局 mousemove | 120px 近距离检测需要全局追踪；`destroy()` 正确清理；各实例独立注册/移除自身回调 |
| `bilibili-folders.ts` | `_folderListCache` 模块级缓存无并发保护 | JS 单线程 + await 点保证不会并发进入；由 UI 串行触发 |
| `bilibili-folders.ts` | `res.data.fid ?? res.data.id` — `fid` 为 0 时 nullish 会穿透 | B 站 API `fid` 不会为 0 (0 是无效 ID)；`id` 是主键字段，两者语义不同 |
| `progress.ts` | `document.title` 直接访问无 SSR 检查 | userscript 只在浏览器运行，不存在 SSR 场景 |
| `ai-providers.ts` | IPv6 regex `\[::1?\]` 匹配 `[::]` 和 `[::1]` | 两者分别是 all-zeros 和 loopback，都应该被 SSRF 拦截，行为正确 |
| `process.ts` | AI 阶段完成后无取消检查直接 `updateProgress` | 进度更新是幂等 UI 操作，取消后 `finally` 会 `resetProgress`，无副作用 |

### 关键设计决策

1. **Toast timeout 清理时机**: 在 `slice` 之前遍历被丢弃的 toast 并清理——必须在 `toasts` 数组被截断前完成，否则丢失 ID 引用。
2. **chunkSize/moveChunkSize 下界而非 settings 层校验**: 防御在消费处而非 settings store，因为 settings 可能被直接写入 GM storage 绕过 store。
3. **`json: unknown` 而非联合类型**: GitHub API 返回格式不稳定（数组 vs 对象），`unknown` 强制每个分支做显式类型断言，比窄类型 + `as` 更安全。
4. **`scanInProgress` 重置**: 即使当前无扫描在运行，重置也是幂等操作，不会引入副作用。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: Toast 资源泄漏修复 + 死循环防护 + 类型安全)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 19 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十八次)

### 本次完成内容

**防御性编程 + 错误处理 + 动画健壮性 — 6 处代码质量改进 + 深度架构级 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `backup.ts` | `v.type` 无防御性回退 — dead-videos.ts/duplicates.ts 均使用 `?? DEFAULT_VIDEO_TYPE` 但 backup.ts 缺失 | MEDIUM | 添加 `?? DEFAULT_VIDEO_TYPE` 回退，与其他模块保持一致 |
| `process.ts` | AI 分类数据准备阶段 `v.type` 同样缺少 type 回退 + `Promise.all()` 外层 catch 不可达 (每个 promise 内部已有 try-catch) | MEDIUM | 添加 type 回退；移除死代码 catch 块，简化为直接 `await Promise.all()` |
| `json-extract.ts` | 尾逗号修复后的第二次 `JSON.parse` 无 try-catch — 修复失败时抛出误导性的 SyntaxError，丢失原始解析错误上下文 | MEDIUM | 包裹内层 try-catch，失败时重新抛出原始 `firstErr` 保留错误上下文 |
| `theme.ts` | `mediaAbort!.signal` 使用非空断言 — 虽然在 `typeof window !== 'undefined'` 条件内但 TypeScript 不会跨语句 narrow | LOW | 将 `mediaAbort` 加入 if 条件，TypeScript 自动 narrow 为非 null 类型 |
| `LiquidToggle.svelte` | 快速连续切换时 GSAP timeline 叠加冲突 — 前一个动画未终止就创建新动画 | MEDIUM | 新增 `activeTl` 引用追踪；新动画前调用 `activeTl?.kill()` |
| `Header.svelte` | 主题图标旋转动画同样存在快速连续点击时叠加冲突 | MEDIUM | 新增 `themeIconTween` 引用追踪；新动画前调用 `themeIconTween?.kill()` |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `magnetic.ts` | 每个 magnetic action 实例注册全局 mousemove | 120px 近距离检测需要全局追踪；`destroy()` 正确清理 |
| `PreviewConfirm.svelte` | `bind:this` 使用 `undefined!` 初始化 | Svelte 5 惯用模式，元素在 `onMount` 前绑定完成 |
| `gm.ts` gmCache | Map 无大小限制 | userscript 单页生命周期内缓存键有限 (~30 个设置键)，不会 OOM |
| `running-state.ts` | 双重 `cancelRequested.set(false)` (try 前后各一次) | 前置重置清除上次残留取消状态，finally 重置确保操作结束后状态干净——两者语义不同 |
| `bilibili-folders.ts` | 缓存竞态 (并发调用可能重复 API) | JS 单线程 + await 点保证不会并发进入；由 UI 串行触发 |
| `progress.ts` victoryCelebration | ticker 无超时保护 | 粒子 `life += dt` 确定性递增，`maxLife` 必达，ticker 必定自停 |

### 关键设计决策

1. **video type 防御性回退统一**: `VideoResource.type` 在 TypeScript 接口中是 `number` (非 optional)，但 B 站 API 运行时可能返回 null/undefined。dead-videos.ts 和 duplicates.ts 已有 `?? DEFAULT_VIDEO_TYPE`，backup.ts 和 process.ts 缺失，导致 API 异常时备份数据或 AI 分类数据中 type 为 undefined。
2. **Promise.all 死代码移除**: 每个 promise 内部已有完整的 try-catch，不会 reject，外层 catch 永远不会执行。移除避免给维护者造成"这里可能会报错"的误导。
3. **JSON 解析错误链**: 保留 `firstErr` 而非抛出第二次解析的错误——第二次解析的错误信息指向修复后的字符串，不如原始错误有诊断价值。
4. **GSAP 动画中断保护**: `kill()` 前一个动画后再创建新动画，避免两个 timeline 同时操作同一 DOM 元素的 transform/scale 属性导致视觉抖动。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: 防御性回退统一 + 死代码清理 + 错误链完善 + 非空断言消除 + 动画中断保护)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 18 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十七次)

### 本次完成内容

**安全加固 + 资源清理强化 — 5 处代码质量改进 + 深度架构级 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `ai-providers.ts` | `getProviderBaseUrl()` SSRF 拒绝时返回空字符串 — 空字符串构造相对 URL `/chat/completions`，导致 API 密钥被发送到 bilibili.com 域名 | **SECURITY** | 改为 `throw new Error(msg)` + `logs.add()` 通知用户，彻底阻断请求 |
| `ai-client.ts` | JSON 解析失败时的错误消息包含未脱敏的响应片段 — API 可能在错误响应中回显密钥 | MEDIUM | 提取 `redactApiKey()` 工具函数，统一应用于所有包含响应文本的错误路径 |
| `bilibili-http.ts` | `fetchBiliJson` 中 `clearTimeout(timer)` 分散在 try/catch 两处 — continue/return/throw 路径不一致，可能遗漏清理 | MEDIUM | 改用 `try { ... } finally { clearTimeout(timer); }` 保证所有退出路径均清理 |
| `cursor-scatter.ts` | `destroy()` 只移除事件监听器，不清理正在动画中的粒子 — 组件销毁后 DOM 残留最多 5 个孤立节点 | MEDIUM | 新增 `activeParticles: Set<HTMLDivElement>` 追踪；`destroy()` 中 `gsap.killTweensOf()` + `dot.remove()` 全量清理 |
| `ai-providers.ts` | Anthropic API 版本 `'2025-04-14'` 硬编码在函数体内 — 维护时需要搜索字符串定位 | LOW | 提取为 `ANTHROPIC_API_VERSION` 命名常量；`ai-client.ts` 中 models list API 的不同版本 `'2024-10-22'` 添加注释说明差异原因 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `magnetic.ts` | 全局 `document.mousemove` 监听器 | 120px 近距离检测需要全局鼠标追踪；`destroy()` 中已正确 `removeEventListener` |
| `progress.ts` victoryCelebration | ticker 无超时保护 | 粒子 `life += dt` 确定性递增，`maxLife` 必达，ticker 必定自停 |
| `gsap-config.ts` | `get(settings).animEnabled` 无 null guard | stores 在模块加载时即初始化含默认值，不可能为 null |
| `modal-bridge.ts` | 新请求覆盖旧请求的 race condition | 单模态 UI 设计保证不会并发请求；覆盖行为是预期语义 |
| `background-cache.ts` `fetchJson` | clearTimeout 分散在 try/catch | 函数简单（单次请求无重试），当前写法虽冗余但正确 |

### 关键设计决策

1. **SSRF 防护 throw-not-return**: 之前返回空字符串只是"软失败"，调用方不检查空字符串就会构造相对 URL。改为 throw 是硬失败，确保请求链彻底中断。调用方 (`callAISingle`) 的错误通过 `callAI` 的重试机制上报给用户。
2. **`redactApiKey` 作为独立工具函数**: 而非内联在每个 catch 块中，便于后续所有包含响应文本的错误路径一致使用。
3. **`finally` vs 双 `clearTimeout`**: `finally` 覆盖 return/throw/continue 三种退出路径，比分散在 try 和 catch 中更健壮且不会遗漏。
4. **粒子清理用 `gsap.killTweensOf` + `remove`**: 必须先停动画再移除 DOM，否则 GSAP 在下一帧可能更新已移除节点。
5. **Anthropic API 两个版本**: messages API 用最新 `2025-04-14`，models list API 用稳定 `2024-10-22`——不同 endpoint 版本不同是 Anthropic 推荐做法。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: SSRF 安全加固 + API key 脱敏 + 资源清理)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 17 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十六次)

### 本次完成内容

**防御性编程强化 — 5 处代码质量改进 + 深度架构级 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `panel-canvas.ts` | `canvas.getContext('2d')!` 非空断言 — 无 Canvas 2D 支持的环境会崩溃 | MEDIUM | 移除 `!`，添加 null guard 提前返回空 action |
| `background-cache.ts` | `setTimeout(safeScan, 5000)` 初始延时未追踪 — 页面卸载前执行 `stopBackgroundCache()` 时无法清除该 timeout | MEDIUM | 新增 `initialTimeoutId` 变量追踪，`stopBackgroundCache()` 中 `clearTimeout` |
| `FloatButton.svelte` / `Header.svelte` | JS 内联样式使用硬编码 z-index 魔数 (2147483647/2147483646) — 与 `Z_INDEX` 常量脱节 | LOW | 导入 `Z_INDEX` 常量替代硬编码值；CSS `<style>` 块添加常量名注释 |
| `ProviderConfig.svelte` | `:global(.spinning)` 无作用域限制 — 可能污染全局 | LOW | 收紧为 `.bfao-icon-btn :global(.spinning)` + 注释说明原因 |
| `App.svelte` / `Panel.svelte` | CSS `<style>` 中 z-index 硬编码无注释 — 维护者不知道对应哪个常量 | LOW | 添加 `/* Z_INDEX.FLOAT */` / `/* Z_INDEX.PANEL */` 注释 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `SettingsGroup.svelte` | `state_referenced_locally` 警告仍在 — `$state(defaultOpen)` 同样触发 | 属于 Svelte 5 编译器已知行为，`defaultOpen` 初始值捕获是预期语义，无法在不改变行为的前提下消除 |
| `background-cache.ts` | `stopBackgroundCache()` 已导出但未被调用 | userscript 生命周期与页面一致，无需主动停止；保留导出供未来扩展 |
| CSS z-index 硬编码 | `<style>` 块中无法引用 JS 常量 | 通过注释标注对应常量名，确保值与 `ui.ts` 一致即可 |

### 关键设计决策

1. **Canvas null guard 用 `maybeCtx` 中间变量**: 直接 `const ctx2d = canvas.getContext('2d')` 后做 null check，TypeScript 不会在闭包中 narrow 类型。使用中间变量 + `const ctx2d = maybeCtx` 赋值后，闭包中类型正确为 `CanvasRenderingContext2D`。
2. **z-index 策略**: JS 创建的 DOM 元素用 `Z_INDEX` 常量；CSS `<style>` 块用硬编码值 + 注释。不引入 CSS 自定义属性避免复杂度（`all: initial` 会重置自定义属性）。
3. **`:global()` 收紧**: Lucide 图标组件的 class 传递到 SVG 子元素，Svelte scoped CSS 无法匹配，需要 `:global()`。收紧到父选择器 `.bfao-icon-btn` 内部，避免全局污染。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: 防御性编程 + z-index 一致性 + CSS scope)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 16 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十五次)

### 本次完成内容

**运行时安全加固 — 5 处边界条件修复 + 深度 Code Review**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `ai-client.ts` | `extractJsonObject()` 返回 `unknown` 直接 `as AIClassificationResult` — AI 返回畸形 JSON (缺少 categories、id/type 类型错误) 时无法拦截，导致下游静默异常 | HIGH | 新增 `validateAIResult()` 运行时类型守卫：验证 categories 是对象、每个分类值是数组、每个条目有 number 类型的 id/type |
| `undo.ts` | `restored === 0` 时仍日志 "撤销完成" 并 `clearUndoRecord()` 删除记录 — 所有移动均失败时用户丢失撤销机会 | HIGH | 当 `restored === 0` 且非用户取消时：日志报错 "所有移动操作均未成功"，保留撤销记录不删除 |
| `process.ts` | AI 批次失败只逐条日志，无汇总 — 用户无法快速了解整体成功率 | MEDIUM | 新增 `aiFailed` 计数器；所有批次完成后输出汇总 (全部失败=error，部分失败=warning) |
| `Panel.svelte` | `onDestroy` 未调用 `rejectAllModals()` — 面板销毁时若有待处理的 modal bridge Promise，该 Promise 永远不会 resolve/reject，造成内存泄漏 | MEDIUM | 在 `onDestroy` 回调中追加 `rejectAllModals()` 调用 |
| `settings.ts` | `loadFromStorage()` 中 `provider` 字段从 GM_getValue 加载后无校验 — 存储损坏或旧版本数据可能导致 `AI_PROVIDERS[provider]` 返回 undefined | MEDIUM | 新增 `isValidProvider()` 守卫：校验 provider 是否在 AI_PROVIDERS 注册表中，无效时回退为 `DEFAULT_SETTINGS.provider` |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `magnetic.ts` | 10 个按钮 = 10 个 document mousemove 监听器 | destroy() 中已正确 removeEventListener，无泄漏 |
| `text.ts` | `destroyed` flag 与 RAF 回调时序 | JS 单线程模型下 destroy() 只在 RAF 回调间隙执行，flag 足以保证安全 |
| `progress.ts` | `victoryCelebration` ticker 重复添加风险 | 单次触发场景 (100% 完成时)，且 ticker 自清理 |
| `modal-bridge.ts` | 请求覆盖时旧 Promise reject — closure 残留 | store.set(null) 后 resolve/reject 无引用，GC 可正常回收 |
| `bilibili-http.ts` | `backoffMs` 无最大值上限 | `maxRetries` 参数限制迭代次数，backoff 增长受限 |

### 关键设计决策

1. **validateAIResult 放在 ai-client.ts 而非 json-extract.ts**: json-extract.ts 是通用 JSON 提取工具，不应耦合业务类型。类型校验属于 AI 调用层的职责。
2. **撤销记录保留策略**: 全部失败时保留记录让用户可以重试（可能是临时网络问题），而不是静默丢弃唯一的恢复机会。
3. **Settings provider 校验位置**: 放在 `loadFromStorage()` 中（数据入口），而非使用处。确保所有消费方拿到的 provider 必定有效。
4. **Panel onDestroy 时机**: rejectAllModals 放在组件 onDestroy 而非 closePanel 回调，确保无论何种方式销毁面板都能清理。

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: 运行时类型安全 + 边界条件修复)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 15 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十四次)

### 本次完成内容

**深度代码审计 — 架构级 Code Review + 7 处缺陷修复**

#### 发现并修复的问题

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `ai-client.ts` | `setTimeout` 与 `gmXmlHttpRequest.timeout` 双超时竞争 — 可导致 Promise 被拒两次 | HIGH | 移除冗余 `setTimeout`，仅保留 `gmXmlHttpRequest` 内置的 `ontimeout` 回调 |
| `ai-client.ts` | `fetchModelList` Gemini 分页无上限 — API 返回重复 pageToken 时死循环 | MEDIUM | 添加 `MAX_PAGES = 20` 安全阈值 |
| `undo.ts` | `moveVideos` 返回值被忽略 — 移动失败时 `restored` 仍计数 | HIGH | 检查 `ok` 返回值，失败时输出警告日志并跳过计数 |
| `bilibili-http.ts` | `postBiliApi` 重试循环中 `fetch` 无 try-catch — 网络错误直接抛出不重试 | HIGH | 包裹 try-catch，网络异常时指数退避重试 |
| `progress.ts` | `resetProgress` 用正则剥离标题前缀 — 其他扩展修改标题时会损坏 | MEDIUM | 改为保存/恢复原始 `document.title` |
| `process.ts` | 日志显示 `settings.aiConcurrency` 原始值而非 `Math.min(10, ...)` 约束后的值 | LOW | 改为输出实际使用的 `concurrency` 变量 |
| `panel-actions.ts` | `handleStart` catch 块调用 `isRunning.set(false)` 与 `startProcess.finally` 重复 | LOW | 移除冗余的 `isRunning.set(false)` 及未使用的 `isRunning` 导入 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `gm.ts` | `gmCache` Map 无大小限制 | userscript 单页生命周期内缓存键有限 (~30 个设置键)，不会 OOM |
| `ai-providers.ts` | HTTP 自定义 URL 仅警告不阻止 | 用户自托管 Ollama 等可能使用 HTTP，阻止会破坏功能 |
| `json-extract.ts` | 尾逗号修复是唯一的 JSON 修复策略 | AI 输出中尾逗号是最常见的格式错误，其他错误由上层 catch 处理 |
| `running-state.ts` | `cancelRequested` 在 finally 中重置 | 符合一次性操作语义，取消标志在操作结束后应重置 |
| `PreviewConfirm.svelte` | 虚拟滚动硬编码行高 38px | CSS 中行高受控且一致，动态测量会增加不必要的复杂度 |

### 关键设计决策

1. **移除 setTimeout 双超时**: `gmXmlHttpRequest` 的 `ontimeout` 回调已足够可靠。双超时导致在边界条件下 Promise 状态异常 (虽然 JS Promise 语义确保只执行一次，但 `clearTimeout` 后回调函数仍可能执行)
2. **postBiliApi 重试一致性**: `fetchBiliJson` (GET) 已有完善的 try-catch 重试；`postBiliApi` (POST) 之前缺失，导致网络闪断时写操作不重试
3. **标题保存/恢复**: 比正则匹配更健壮，且兼容 B 站自身的标题变化和其他扩展

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: 7 处缺陷修复 + 深度架构审计)
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%**

**所有 Phase 均已 100% 完成。svelte-check 0 errors。代码质量经 14 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十三次)

### 本次完成内容

**Phase 6: Svelte 5 Runes 全量迁移 + 深度 Code Review**

#### Svelte 5 Runes 迁移

| 改动 | 范围 | 详情 |
|------|------|------|
| `export let` → `$props()` | 16 个组件 | 所有带 props 的组件添加 `interface Props` + `$props()` 解构 |
| `$:` 声明 → `$derived()` | 7 处 | DeadVideosResult/DuplicatesResult/FolderSelector/StatsDialog/PreviewConfirm/ProviderConfig |
| `$:` 副作用 → `$effect()` | 8 处 | Panel settings toggle、ProgressBar 5 个进度效果、LogArea 自动滚动 |
| 本地状态 → `$state()` | 全部 | Panel 15 个模态/UI 状态；FolderSelector/PreviewConfirm 的 Set；ProviderConfig 4 个 UI 状态等 |
| `bind:this` → `$state<T>(undefined!)` | 全部 | 所有 bind:this 目标改为 `$state` 声明 |
| `<slot>` → Snippets | Modal + 7 消费者 | Modal: `children/icon/toolbar/footer` Snippet props；子组件: `{#snippet}` |
| `<svelte:component>` → 动态组件 | SettingsGroup | `{@const Icon = icon} <Icon>` |
| `PromptEditor` | `promptValue` | `let` → `$state($settings.lastPrompt)` |

#### 深度 Code Review 发现并修复

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `LiquidToggle.svelte` | `checked` prop 在 runes 模式下被直接 mutate | HIGH | 改为 `const newChecked = !checked; onchange?.(newChecked)` |
| `FloatButton.svelte` | `{#if visible}` 销毁 DOM 导致 GSAP 丢失 | MEDIUM | 改为 CSS `class:hidden={!visible}` + `display: none` |
| `Panel.svelte` | `StatsState` 类型导入未使用; `mainAreaEl` 未使用 | LOW | 删除 |
| `SettingsGroup.svelte` | `onComplete` 回调隐式返回 Tween | LOW | 添加 `{ }` 块 |
| `FolderSelector.svelte` | Set `selected = selected` 不触发 runes 响应性 | HIGH | 改为 `selected = new Set(selected)` |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `Toast.svelte` | 未迁移到 runes | `export { addToast as show }` 需要 legacy 模式 |
| `SettingsGroup.svelte` | `state_referenced_locally` warning | 手风琴组件故意捕获初始值 |

### 关键设计决策

1. **Toast 保留 legacy 模式**: Svelte 5 不支持 `export { fn }` 组件导出在 runes 模式下
2. **`bind:this` 使用 `$state<T>(undefined!)`**: Svelte 5 要求 bind:this 为 `$state`
3. **FloatButton CSS hide**: 保留 DOM 和 GSAP 动画生命周期
4. **LiquidToggle 单向数据流**: 不再 mutate prop，纯回调通知
5. **Set 响应性**: 所有 Set 变更后 `new Set(...)` 重新赋值

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%**
- Phase 5 性能优化: **100%**
- Phase 6 Svelte 5 Runes: **100%** (本次新增)

**所有 Phase 均已 100% 完成。svelte-check 0 errors。**

---

## 上一次会话 (2026-04-01, 第十二次)

### 本次完成内容

**性能优化收尾 + 安全审计 + 深度 Code Review**

#### 性能优化

| 改动 | 文件 | 详情 |
|------|------|------|
| Canvas 可见性暂停 | `src/actions/panel-canvas.ts` | IntersectionObserver 检测面板可见性；不可见时自动 `gsap.ticker.remove(tick)` 暂停渲染，可见时恢复；`io.disconnect()` 在 destroy 中正确清理 |
| PreviewConfirm 虚拟滚动 | `src/components/PreviewConfirm.svelte` | 分类视频数 >40 时启用虚拟滚动；固定行高 38px (34+4gap)，显示 8 行 + 4 行 overscan；`scrollTops` 记录按分类名追踪滚动位置；折叠时自动清理 scrollTops 记录 |
| Theme 监听器清理 | `src/App.svelte` | 添加 `onDestroy(destroyThemeListeners)` 调用，确保 matchMedia 监听器在组件销毁时通过 AbortController 清理 |

#### 安全审计

| 改动 | 文件 | 详情 |
|------|------|------|
| `@connect *` 审计 | `vite.config.ts` | 评估移除通配符 → 发现自定义 OpenAI 兼容端点需要 `*`；保留并添加注释说明 SSRF 由 `ai-providers.ts isPrivateHost()` 防护 |

#### 深度 Code Review 发现并修复

| 文件 | 问题 | 严重性 | 修复 |
|------|------|--------|------|
| `panel-canvas.ts` | `gsap.ticker.add(tick)` 在 `io.observe(node)` 之前执行，不可见时有短暂无用渲染 | LOW | 调整初始化顺序：先注册 IO 观察器再启动 ticker |
| `PreviewConfirm.svelte` | Svelte 5 事件语法：`on:scroll` 与 `style:` 指令混用触发构建错误 | HIGH | 改为 `onscroll` 新语法 |

#### Code Review 评估但不修复的项

| 文件 | 观察 | 结论 |
|------|------|------|
| `PreviewConfirm.svelte` | 使用 `export let` 旧语法而非 Svelte 5 `$props()` | 项目全部组件统一使用旧语法，批量迁移应作为独立任务 |
| `vite.config.ts` | `@connect *` 通配符 | 自定义 AI 端点功能必需；SSRF 防护已在 ai-providers.ts 实现 (isPrivateHost 阻止 127.*/10.*/192.168.* 等) |
| ESLint 配置 | `.eslintrc.cjs` 未创建 | 当前工作流未使用 lint，可作为后续 CI/CD 集成时添加 |

### 关键设计决策

1. **虚拟滚动阈值 40**: 低于此数量直接渲染全部 DOM 节点（性能无忧），高于时切换绝对定位 + 窗口化渲染
2. **Canvas 暂停用 IntersectionObserver 而非面板状态**: 直接观察 DOM 可见性比监听 store 更解耦，且在任何隐藏场景（非仅面板关闭）都能生效
3. **保留 @connect ***: 移除会破坏核心功能（自定义 AI 端点），SSRF 防护已在应用层实现

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **100%**
- Phase 3 CSS 清理: **100%**
- Phase 4 代码质量: **100%** (本次: @connect 安全审计 + 注释)
- Phase 5 性能优化: **100%** (本次新增: Canvas 可见性暂停 + 虚拟滚动 + Theme 清理)

**所有 Phase 均已 100% 完成。代码质量经 12 次迭代持续强化。**

---

## 上一次会话 (2026-04-01, 第十一次)

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
