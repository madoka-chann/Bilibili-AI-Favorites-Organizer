# Bilibili 收藏夹 AI 智能整理器


现在在抽空重构，后面做成一站式的收藏夹管理系统，

顺便接管下b站原生的收藏夹搜索和收藏按钮，应该会做成浏览器扩展。

<img width="3782" height="1755" alt="image" src="https://github.com/user-attachments/assets/205cd6c1-48b2-4fb3-b34c-daba9ac1a5c1" />

### 小demo

https://github.com/user-attachments/assets/667ee058-fe73-4ca6-a6f1-511bae2ba299


### 非常早期的版本演示视频

https://github.com/user-attachments/assets/f23b1fa1-7da2-4f5e-b2c1-ab46e784517c


一款基于 AI 的 Bilibili 收藏夹自动分类整理油猴脚本。告别手动整理，让 AI 帮你把杂乱的收藏夹自动归类到不同文件夹中。

感谢b站某不知名的根号三，本脚本基于[其视频](https://www.bilibili.com/video/BV1LifmBgEPZ/?spm_id_from=333.337.search-card.all.click)最初提供的demo继续开发。

### 安装&更新

2.0
 **[Github源](https://github.com/madoka-chann/Bilibili-AI-Favorites-Organizer/raw/refs/heads/main/dist/bilibili-ai-favorites-organizer.user.js)**

 
 **[Github国内加速源](https://ghfast.top/https://github.com/madoka-chann/Bilibili-AI-Favorites-Organizer/raw/refs/heads/main/dist/bilibili-ai-favorites-organizer.user.js)**

## 功能特性

### AI 智能分类
- **多 AI 服务商支持**：Google Gemini、OpenAI、DeepSeek、SiliconFlow、通义千问、Kimi、智谱 GLM、Groq、GitHub Models、Anthropic Claude、Ollama（本地部署）、OpenRouter
- **自定义 API**：支持任意 OpenAI 兼容接口
- **预设分类模板**：按 UP 主、内容类型、时长、学习资料、热度、多级分类、语言地区、观看优先级等 8 种内置分类方案
- **自定义规则**：支持自定义分类 Prompt，可持久化保存模板
- **置信度评分**：AI 对每个分类结果给出 0-1 的置信度分数

### 整理模式
- **单文件夹模式**：整理当前页面的收藏夹
- **多文件夹模式**：跨收藏夹批量操作
- **增量模式**：仅处理上次整理后新增的视频，对删除的视频也有应对机制
- **定时自动整理**：支持 30 分钟至 12 小时的定时任务

### 数据安全
- **备份/恢复**：执行前自动备份收藏夹结构，支持一键恢复
- **跨文件夹去重**：检测多个文件夹中的重复视频
- **失效视频清理**：批量检测并删除已失效的视频
- **设置导入/导出**：一键迁移配置（API Key 不会被导出，保证安全）

### 智能防风控
- **自适应限速**：触发 412 错误后自动调整请求速度
- **全局冷却机制**：8-60 秒冷却防止连续触发风控
- **自动重试**：AI 请求失败自动指数退避重试（最多 3 次）
- **人性化延迟**：请求间隔添加 ±30% 随机抖动，模拟真人操作
- **批次暂停**：多文件夹操作间自动暂停，降低风控风险

### 费用追踪
- Token 用量统计（Prompt / Completion / 调用次数）
- 支持 15+ 主流模型的动态费用估算

### 界面体验
- 悬浮操作按钮（可拖拽）
- 可折叠分组设置面板
- 明暗主题切换
- 实时进度条 + 分阶段 ETA 预估
- Toast 通知 + 浏览器通知
- 完成后撒花庆祝动画
- 彩色状态日志
- 分类预览（执行前可展开查看各分类详情并手动调整）
- HTML / JSON / CSV 多格式结果导出

## 安装

### 1. 安装油猴扩展

在浏览器中安装任一用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)

- [Violentmonkey](https://violentmonkey.github.io/)


### 2. 安装脚本

点击下方链接安装脚本（或在油猴扩展中手动导入 `bilibili-favorites-ai-organizer.user.js`）：


 **[Github源](https://github.com/madoka-chann/Bilibili-AI-Favorites-Organizer/raw/refs/heads/main/dist/bilibili-ai-favorites-organizer.user.js)**

 
 **[Github国内加速源](https://ghfast.top/https://github.com/madoka-chann/Bilibili-AI-Favorites-Organizer/raw/refs/heads/main/dist/bilibili-ai-favorites-organizer.user.js)**

### 3. 配置 AI 服务

1. 登录 [Bilibili](https://www.bilibili.com/) 并进入个人空间的收藏页面
2. 点击页面右下角的悬浮按钮打开设置面板
3. 选择 AI 服务商并填入对应的 API Key
4. 选择或自定义分类规则

## 使用方法

1. 进入 Bilibili 个人空间的收藏页面 (`space.bilibili.com`)
2. 点击右下角悬浮按钮，打开整理面板
3. 选择要整理的收藏夹
4. 配置 AI 服务商、模型和分类规则
5. 点击「开始整理」，等待 AI 分类完成
6. 预览分类结果，确认后执行移动操作

## 参数说明

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| AI 批次大小 | 每次 AI 请求处理的视频数 | 50-100 |
| 抓取速度 | 每页数据获取间隔 | 500ms-1.5s |
| 并发数 | 同时发送的 AI 请求数 | 2-3（高级账号可设 5+）|

## 支持的 AI 服务商

| 服务商 | 获取 API Key |
|--------|-------------|
| Google Gemini | [Google AI Studio](https://aistudio.google.com/) |
| OpenAI | [OpenAI Platform](https://platform.openai.com/) |
| DeepSeek | [DeepSeek 开放平台](https://platform.deepseek.com/) |
| 通义千问 | [阿里云百炼](https://dashscope.console.aliyun.com/) |
| Kimi (Moonshot) | [Moonshot 开放平台](https://platform.moonshot.cn/) |
| 智谱 GLM | [智谱 AI 开放平台](https://open.bigmodel.cn/) |
| SiliconFlow | [SiliconFlow](https://siliconflow.cn/) |
| Groq | [Groq Console](https://console.groq.com/) |
| GitHub Models | [GitHub Models](https://github.com/marketplace/models) |
| Anthropic Claude | [Anthropic Console](https://console.anthropic.com/) |
| OpenRouter | [OpenRouter](https://openrouter.ai/) |
| Ollama（本地） | [Ollama](https://ollama.com/)（无需 API Key） |

## 项目结构

```
src/
├── main.ts                          # 入口：挂载 Svelte app 到 body
├── App.svelte                       # 根组件：浮动按钮 + 面板
├── vite-env.d.ts                    # Vite 环境类型声明
├── stores/                          # → $stores/
│   ├── settings.ts                  # 设置 store (writable, 持久化到 GM_setValue)
│   ├── state.ts                     # 运行时状态 (isRunning, progress, logs, tokens)
│   ├── theme.ts                     # 主题/暗色模式 store + prefersReducedMotion
│   └── modal-bridge.ts              # Promise-based modal 通信 (folder select, preview confirm)
├── api/                             # → $api/
│   ├── bilibili.ts                  # B站 API 统一入口 (re-export)
│   ├── bilibili-http.ts             # B站 HTTP 请求层 (GM_xmlhttpRequest 封装)
│   ├── bilibili-auth.ts             # B站认证 (CSRF token, 用户信息)
│   ├── bilibili-folders.ts          # B站收藏夹操作 (列表/创建/移动)
│   ├── bilibili-videos.ts           # B站视频操作 (获取/删除/批量)
│   ├── bilibili-scanner.ts          # B站收藏夹分页扫描
│   ├── ai-client.ts                 # AI 统一调用层 (重试/限流/Token追踪)
│   ├── ai-providers.ts              # 多 Provider 适配器 (Gemini/OpenAI/Claude/...)
│   └── ai-prompt.ts                 # AI 提示词构建
├── core/                            # → $core/
│   ├── process.ts                   # 整理主流程 (拆分为子函数)
│   ├── dead-videos.ts               # 失效视频检测
│   ├── duplicates.ts                # 跨收藏夹去重
│   ├── backup.ts                    # 备份/恢复
│   ├── undo.ts                      # 撤销历史
│   ├── history.ts                   # 操作历史记录
│   ├── panel-actions.ts             # 面板操作包装 (认证校验 + isRunning 管理)
│   ├── export-logs.ts               # 日志导出
│   └── background-cache.ts          # 后台自动缓存
├── utils/                           # → $utils/
│   ├── constants/                   # 常量 (按领域分文件)
│   │   ├── index.ts                 # barrel export
│   │   ├── ai.ts                    # AI providers 注册表、预设、超时
│   │   ├── bilibili.ts              # B站 API URLs、页面大小、特殊文件夹
│   │   └── ui.ts                    # z-index 层级、颜色、限制
│   ├── dom.ts                       # escapeHtml, sanitize
│   ├── timing.ts                    # debounce, sleep, humanDelay
│   ├── errors.ts                    # 错误类型 + getErrorMessage
│   ├── gm.ts                        # GM_* API 类型安全封装
│   ├── collections.ts               # 数组/Map 工具函数
│   ├── download.ts                  # 文件下载工具
│   ├── json-extract.ts              # JSON 提取 (从 AI 响应中)
│   ├── progress.ts                  # 进度计算工具
│   └── running-state.ts             # isRunning 生命周期管理
├── types/                           # → $types/
│   ├── index.ts                     # barrel export
│   ├── settings.ts                  # Settings 接口 (23 个字段)
│   ├── video.ts                     # VideoResource, FavFolder, CategoryResult 等
│   └── ai.ts                        # AIProvider, AIResponse 等
├── components/                      # → $components/
│   ├── FloatButton.svelte           # 浮动按钮 (可拖拽, 磁性吸引, 极光呼吸)
│   ├── Panel.svelte                 # 主面板容器 (毛玻璃, 绽放/退场, B3交叉淡入)
│   ├── Header.svelte                # 面板头部 (极光渐变, 涟漪, 按压效果)
│   ├── SettingsPanel.svelte         # 设置区域 (4个可折叠分组, C5液态开关)
│   ├── SettingsGroup.svelte         # 单个设置分组 (B4弹簧手风琴)
│   ├── ProviderConfig.svelte        # AI Provider 配置 (模型选择, C4聚焦发光)
│   ├── LiquidToggle.svelte          # C5 液态开关 (GSAP thumb拉伸/滑动)
│   ├── PromptEditor.svelte          # 自定义提示词编辑器 (C4聚焦发光)
│   ├── LogArea.svelte               # AI 状态日志 (H1文字解码效果)
│   ├── ProgressBar.svelte           # 进度条 (D1-D6 粒子/阶段/庆祝/微光)
│   ├── ActionButtons.svelte         # 主操作按钮组 (C1/C2按压, C3光追踪)
│   ├── PreviewConfirm.svelte        # 分类预览+确认 (E2 FLIP展开, E3倾斜, E4缩放)
│   ├── FolderSelector.svelte        # 收藏夹选择器 (Modal)
│   ├── HistoryTimeline.svelte       # 历史时间线 (Modal)
│   ├── DeadVideosResult.svelte      # 失效视频结果 (Modal)
│   ├── DuplicatesResult.svelte      # 重复视频结果 (Modal)
│   ├── UndoDialog.svelte            # 撤销操作 (Modal)
│   ├── StatsDialog.svelte           # 统计/健康报告 (Modal, H2数字翻滚)
│   ├── Toast.svelte                 # Toast 通知 (G1-G5 弹性/FLIP/类型化)
│   └── Modal.svelte                 # 通用 Modal 容器 (F1绽放, F3物理退出)
├── animations/                      # → $animations/
│   ├── gsap-config.ts               # GSAP 插件注册 + 10品牌缓动 + 动画开关检测
│   ├── micro.ts                     # 微交互: pressEffect, focusGlow, checkBounce, staggerReveal, hoverScale 等
│   ├── progress.ts                  # 进度条: 轨迹粒子, 阶段切换, 胜利庆祝, 数字弹跳
│   └── text.ts                      # 文字特效: 解码效果, 数字翻滚
├── actions/                         # → $actions/
│   ├── magnetic.ts                  # use:magnetic — 磁性光标吸引
│   ├── tilt.ts                      # use:tilt — 3D 倾斜悬浮
│   ├── glow-track.ts                # use:glowTrack — 径向光追踪
│   └── ripple.ts                    # use:ripple — 点击涟漪
└── styles/                          # → $styles/
    ├── variables.css                # CSS 变量 (亮/暗主题, 颜色, 间距)
    ├── forms.css                    # 表单元素基础样式
    └── modal.css                    # Modal 通用样式
```

## 注意事项

- 使用前请确保已登录 Bilibili 账号
- API Key 仅保存在本地浏览器中，不会上传至任何服务器
- 建议首次使用前先备份收藏夹
- 请合理设置请求频率，避免触发 Bilibili 风控
- Ollama 本地部署需确保 `localhost:11434` 可访问

## 许可证

MIT License
