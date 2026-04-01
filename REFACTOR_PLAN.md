# Bilibili AI Favorites Organizer — 重构计划与进度

## 总览

对 Svelte + TypeScript 油猴脚本进行系统性现代化重构，目标：消除重复代码、强化类型安全、统一架构模式、提升可维护性。

---

## 已完成 Phase (1-9)

### Phase 1 — Panel业务逻辑提取 + Svelte5模式统一
- **Commit**: `74c704a`
- 提取 Panel 业务逻辑到 `panel-actions.ts`
- 统一 Svelte 5 响应式模式
- 共享表单 CSS 提取到 `forms.css`
- 拆分 `process.ts` 降低单文件复杂度

### Phase 2 — 类型安全强化 + 常量模块拆分
- **Commit**: `f937a25`
- 全面类型安全强化
- 常量模块拆分为 `ai.ts` / `bilibili.ts` / `ui.ts`
- API 层去重

### Phase 3 — 共享抽象层提取
- **Commit**: `2d2e45f`
- 提取 4 个共享抽象层
- 净删 107 行重复代码

### Phase 4 — 错误处理 + API URL去重 + 分页扫描
- **Commit**: `0c812d8`
- 错误处理类型安全化 (`unknown` 替代 `any`)
- API URL 去重到常量
- 分页扫描逻辑抽象为 `bilibili-scanner.ts`

### Phase 5 — POST API去重 + 运行状态统一
- **Commit**: `303a1b3`
- POST API 去重为 `postBiliApi()`
- 运行状态管理统一
- 类型安全强化 + 竞态防护

### Phase 6 — 泛型modal桥接 + any全量消除
- **Commit**: `7ebc9bd`
- 泛型 `createModalBridge<TInput, TResult>()` 消除 modal 重复
- 全量 `any` 消除 (0 remaining)
- Settings 键自动推导
- CSS 去重

### Phase 7 — 工具函数提取 + 魔法值常量化
- **Commit**: `0502867`
- 工具函数提取 (`json-extract`, `progress`, `running-state`, `download`, `collections`)
- 魔法值常量化
- 运行状态统一
- JSON 解析抽象

### Phase 8 — 认证模板去重 + catch类型安全
- **Commit**: `ac075b9`
- `withAuthAndRunning()` 认证+运行状态包装器
- 全量 catch 类型安全化 (`err: unknown`)
- 共享 CSS 提取 + Settings 数据驱动
- Token 追踪合并

### Phase 9 — backoff工具提取 + modal-bridge精简 + 类型安全强化
- **Commit**: `2d880a8`
- 提取 `backoffMs()` 共享指数退避工具，消除 `bilibili-http` / `ai-client` 重复逻辑
- modal-bridge 导出从 7 个独立 export 精简为 2 个对象 (`folderSelect` / `previewConfirm`)
- Settings store 类型安全：消除 `Record<string, unknown>` 双重断言
- 统一 `video.ts` 的 inline import → 标准 `import type`
- 删除孤立的 `core/folder-scan.ts`（已被 `bilibili-scanner.ts` 替代）
- **统计**: 9 files, +38 / -113 (净删 75 行)

---

## 待执行 Phase (10+)

### Phase 10 — AI Provider 配置分层 (中优先)
- **目标**: 将 `src/lib/utils/constants/ai.ts` (140 LOC) 中的 UI 字符串 (`keyPlaceholder`, `apiUrl`) 与 API 端点配置分离
- **原因**: 当前 13 个 provider 混合了 API 配置与 UI 展示逻辑，增删 provider 需改动过多位置
- **涉及文件**: `constants/ai.ts`, `ai-providers.ts`, `ProviderConfig.svelte`

### Phase 11 — Panel.svelte 组件拆分 (中优先)
- **目标**: 将 Panel.svelte (273 LOC) 中 8 个 modal 状态管理提取为独立子组件
- **原因**: Panel 同时管理 dead-videos, duplicates, undo, history, stats 等 modal 状态，职责过重
- **预期**: Panel 降至 ~150 LOC，提升可测试性

### Phase 12 — withAuthAndRunning 覆盖扩展 (中优先)
- **目标**: 将 `withAuthAndRunning()` 包装器扩展到 `dead-videos.ts` / `duplicates.ts` / `backup.ts` 中尚未使用的操作
- **原因**: 这些模块仍有重复的 try/catch + logs.add 错误处理模式 (~30 行)

### Phase 13 — CSS 按钮样式统一 (低优先)
- **目标**: 统一 `Modal.svelte` 的 `.modal-btn` 与共享 `.bfao-btn` 系统
- **原因**: Modal footer 按钮有独立的样式定义，与全局按钮系统不一致

### Phase 14 — a11y 修复 (低优先)
- **目标**: 修复 SettingsPanel / ProviderConfig 中 label 未关联 control 的警告
- **原因**: 构建时有 12 个 `a11y_label_has_associated_control` 警告

### Phase 15 — ProviderConfig 组件拆分 (低优先)
- **目标**: 将 ProviderConfig.svelte (242 LOC) 拆分为 ProviderSelect / ModelSelector / ApiKeyInput
- **原因**: 管理多个状态 (model fetching, dropdown, api key visibility)，可拆分提升复用性

---

## 代码质量指标 (Phase 9 后)

| 指标 | 状态 | 备注 |
|------|------|------|
| TypeScript 覆盖 | **优秀** | 无 `any` 类型 |
| 类型安全 | **优秀** | `unknown` 使用得当，双重断言已消除 |
| 代码重复 (DRY) | **良好** | 主要模式已抽象，少量可进一步统一 |
| 模块内聚 | **优秀** | 清晰的 types → api → core → stores → components 分层 |
| 错误处理 | **良好** | 集中化工具 + `withAuthAndRunning` 包装 |
| CSS 重复 | **良好** | 共享 `forms.css` + `modal.css`，Modal footer 仍独立 |
| 组件规模 | **中等** | Panel (273) / ProviderConfig (242) 仍较大 |
| 构建 | **通过** | 仅 a11y 警告，无错误 |

---

## 下次启动断点

- **分支**: `main`
- **最新 Commit**: `2d880a8`
- **下一任务**: Phase 10 — AI Provider 配置分层
- **关键文件入口**: `src/lib/utils/constants/ai.ts`
