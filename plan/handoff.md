# Handoff Notes — Bilibili AI Favorites Organizer Refactoring

## 最近一次会话 (2026-04-01, 第六次)

### 本次完成内容

**Phase 3 CSS 激进清理 + Code Review 修复** — 删除 22,072 行死 CSS 文件，全局 CSS 精简至 310 行，修复 4 处代码安全/质量问题。

#### Phase 3 CSS 清理

| 变更 | 详情 |
|------|------|
| 删除 `bilibili-favorites-ai-organizer.css` | 22,072 行原始 CSS 完全未被 Svelte 代码引用，安全删除 |
| 清理 `variables.css` | 移除 `--ai-shadow-sm` 死变量 (从未被任何组件引用) |
| 清理 `modal.css` | 移除 `.bfao-scroll-list` 死类 (从未被任何组件引用) |

**CSS 审计结论:**
- 全部 448 个 @keyframes — 随原始 CSS 一起删除 (动画全部由 GSAP 接管)
- 全部 217 个 CSS easing 变量 — 随原始 CSS 一起删除 (由 10 个 GSAP CustomEase 替代)
- 37 个 CSS design tokens 中 36 个在用，1 个死变量已移除
- 22 个全局 CSS 类中 21 个在用，1 个死类已移除
- 21 个 Svelte 组件的 scoped `<style>` 块 — 全部 CSS 类均在使用，零死代码

#### Code Review 修复

| 文件 | 问题 | 修复 |
|------|------|------|
| `ai-client.ts` | URL 拼接未编码 API key 和 pageToken (注入风险) | 改用 `URLSearchParams` 安全构建查询参数 |
| `background-cache.ts` | `setInterval` 无法停止，多次调用会累积 | 添加去重保护 + `stopBackgroundCache()` 清理函数 |
| `undo.ts` | `JSON.parse(raw as string)` 无类型验证 | 改为 `typeof raw === 'string'` 前置检查 |
| `history.ts` | `JSON.parse(raw as string)` 无类型验证 | 改为 `typeof raw === 'string' ? raw : '[]'` 安全降级 |

#### Code Review 未修复项 (记录但不在本次范围)

| 类别 | 描述 | 优先级 |
|------|------|--------|
| a11y | 12 个 label-control 关联警告 (SettingsPanel, ProviderConfig, LiquidToggle) | 低 |
| 安全 | `ai-providers.ts` 自定义 baseUrl 无 SSRF 验证 (内网 IP 检查) | 中 |
| 性能 | `PreviewConfirm.svelte` videoMap 在每次 reactive 更新时重建 | 低 |
| 类型安全 | `gsap-config.ts` 使用 `(globalThis as any)` 获取 CDN 插件 (必要的，无法避免) | N/A |

### 关键设计决策

1. **原始 CSS 文件直接删除**: 通过全面审计确认原始 `bilibili-favorites-ai-organizer.css` 未被 Svelte 代码的任何位置引用 (不在 vite.config.ts、不在任何 import、不在 @resource 声明中)。所有组件样式已在 Phase 1 迁移到 Svelte scoped `<style>` 块中，全局设计 tokens 已在 `src/styles/` 中重新定义。

2. **CSS 结果**: 22,391 行 → 310 行全局 CSS + ~1,163 行 scoped CSS = ~1,473 行总计。CSS 减少 93.4%。

3. **background-cache 防护**: 添加 `intervalId` 去重 + `stopBackgroundCache()` 导出函数。虽然当前 `setupBackgroundCache()` 只在 `main.ts` 调用一次，但防护多次调用是必要的安全措施。

### 下一步建议

优先级从高到低:

1. **Phase 2 粒子系统**: I1-I5 (Canvas 效果需谨慎评估性能预算)
2. **Phase 2 其他**: A4 FLIP 变形为面板, A5 星座轨道, B5 深度视差
3. **Phase 2 收尾**: C1 全局磁性按钮 (更多组件集成)
4. **Phase 4 a11y 修复**: label-control 关联 (SettingsPanel, ProviderConfig, LiquidToggle)
5. **Phase 5 性能优化**: GM_getValue 缓存、虚拟滚动、Canvas 暂停策略

### 项目总体进度

- Phase 0 构建系统: **100%**
- Phase 1 组件架构: **100%**
- Phase 2 动画系统: **~80%** (剩余: 粒子系统、FLIP 变形、星座轨道、深度视差)
- Phase 3 CSS 清理: **100%** ✅ 本次完成
- Phase 4 代码质量: **~85%** (类型+模块化完成; 多轮 Code Review 修复)
- Phase 5 性能优化: **0%**
