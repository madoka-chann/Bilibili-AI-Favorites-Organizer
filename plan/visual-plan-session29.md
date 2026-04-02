# 视觉增强计划 — Session 29

## 目标

为 5 个设置面板相关组件注入交互微动画与视觉反馈，让设置区域从"功能性表单"升级为"灵动交互体验"。这是动画覆盖的最后一块拼图——前 28 次已完成核心面板 + Modal 子组件，本次聚焦设置区域。

**原则**：复用已有动画基础设施 (`$animations/micro.ts`、`$animations/gsap-config.ts`)，不新建文件/组件，仅在原有组件中增加 CSS 动画、Svelte action 调用和少量 GSAP 逻辑。

---

## 与已有视觉计划的关系

- **zesty-wandering-acorn.md** Phase 2 已完成核心动画基础设施 + 主组件
- **visual-plan-session27.md** 已完成 6 个 Modal 子组件动画
- **visual-plan-session28.md** 已完成 4 个面板主界面组件动画
- 本次聚焦：**设置面板区域 5 个组件的微交互增强**

---

## 具体改动

### 1. SettingsGroup — 手风琴展开内容交错 + 头部悬浮反馈增强 + 图标脉冲

**文件**: `src/components/SettingsGroup.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 子元素交错入场 | GSAP stagger 在 accordion open 动画完成后触发 | 展开后子元素依次浮现 (opacity 0→1, y 8→0)，增强层次感 |
| 头部悬浮缩放 | CSS `transition: transform 0.25s` on `.group-header:hover` | 悬浮时整行微缩放 `scale(1.01)` + 图标背景加深 |
| 图标展开脉冲 | GSAP scale pulse on `.group-icon` when opening | 展开时图标弹跳一次 (scale 1→1.25→1)，吸引视觉焦点 |
| 展开态左边框指示 | CSS `border-left` 过渡 on `.group[data-open]` | 展开的分组左侧出现主题色竖线指示 |

### 2. ProviderConfig — 下拉列表入场 + 条件字段滑入 + 按钮交互增强

**文件**: `src/components/ProviderConfig.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 模型下拉缩放入场 | CSS `@keyframes dropdownIn` (scale 0.95→1, opacity 0→1) | 下拉列表从无到有时带缩放渐显 |
| 模型项交错入场 | CSS `@keyframes modelItemSlideIn` + `animation-delay` per item | 模型列表项依次从右侧滑入 |
| 选中项发光 | CSS `transition: box-shadow 0.25s` on `.model-item.active` | 选中模型项内发光指示 |
| 自定义 URL 字段滑入 | CSS `@keyframes fieldSlideDown` (height 0→auto, opacity 0→1) | `isCustomProvider` 切换时字段平滑滑入而非瞬现 |
| 图标按钮 pressEffect | `use:pressEffect` on icon buttons | 刷新/测试/显隐按钮按下弹回 |
| 链接按钮悬浮发光 | CSS `box-shadow` transition on `.link-btn:hover` | 悬浮时外发柔和光晕 |

### 3. PromptEditor — 预设列表交错 + 按钮交互 + 星标动画

**文件**: `src/components/PromptEditor.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 自定义预设行交错 | CSS `@keyframes presetSlideIn` + `animation-delay` per row | 预设列表项依次滑入 |
| 预设行悬浮高亮 | CSS `transition: background 0.2s, transform 0.15s` on hover | 悬浮行背景微亮 + 轻微右移 |
| 保存按钮 pressEffect | `use:pressEffect` on save button | 保存按钮按下弹回 |
| 星标切换弹跳 | CSS `@keyframes starBounce` (scale 0.5→1.2→1) | 设为默认时星标弹跳放大 |
| 删除按钮悬浮抖动 | CSS `@keyframes deleteShake` on `.danger:hover` | 删除按钮悬浮时轻微摇晃警示 |

### 4. SettingsPanel — 条件子字段滑入 + 提示信息渐显

**文件**: `src/components/SettingsPanel.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 限制数量字段滑入 | CSS 包裹元素 `@keyframes subFieldSlideIn` | `limitEnabled` 打开时子输入框平滑滑入 |
| 缓存间隔字段滑入 | CSS `@keyframes subFieldSlideIn` on `.sub-field` | `bgCacheEnabled` 打开时缓存间隔平滑滑入 |
| 动画提示渐显 | CSS `@keyframes hintFadeIn` (opacity 0→1, y -4→0) | 提示文字从上方渐入 |
| 切换行悬浮 | CSS `transition: background 0.2s` on `.toggle-row:hover` | 行为开关行悬浮时背景微亮 |

### 5. LiquidToggle — 开启态光晕 + 滑块内发光

**文件**: `src/components/LiquidToggle.svelte`

| 效果 | 实现 | 说明 |
|------|------|------|
| 开启态外发光 | CSS `box-shadow` transition on `.liquid-toggle.on` | 开启时轨道外发主题色柔光 |
| 滑块内发光 | CSS `box-shadow` transition on `.thumb` when parent `.on` | 开启时白色滑块内加柔和高光 |

---

## 不做的事

- **不新建动画文件/组件** — 全部复用已有基础设施 + CSS @keyframes
- **不修改已完成的 Modal 子组件或面板核心组件** — Session 27/28 已覆盖
- **不添加 Canvas/粒子效果** — 设置区域适合轻量微交互
- **不引入新的 GSAP 插件** — 仅用 CSS + 已有 micro.ts 函数
- **不新增 Svelte action** — 复用 `pressEffect`、`focusGlow` 等已有 action

---

## 预期效果

- SettingsGroup 手风琴从"展开内容"升级为"展开 + 子元素灵动入场"
- ProviderConfig 模型下拉从"瞬间出现"升级为"缩放 + 交错入场"
- PromptEditor 预设列表从"静态列表"升级为"交互式列表"（悬浮/弹跳/滑入）
- SettingsPanel 条件字段从"瞬间出现"升级为"平滑滑入"
- LiquidToggle 开启状态从"变色"升级为"变色 + 发光"
- 总改动量：~120 行 CSS + ~20 行 JS（5 个文件），无新文件
