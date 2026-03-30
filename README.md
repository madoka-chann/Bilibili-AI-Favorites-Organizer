# Bilibili 收藏夹 AI 智能整理器

一款基于 AI 的 Bilibili 收藏夹自动分类整理油猴脚本。告别手动整理，让 AI 帮你把杂乱的收藏夹自动归类到不同文件夹中。

感谢b站某不知名的根号三，本脚本基于[其视频](https://www.bilibili.com/video/BV1LifmBgEPZ/?spm_id_from=333.337.search-card.all.click)最初提供的demo继续开发。

### 安装&更新

更新如有请点击重新安装

 **[Github源](https://raw.githubusercontent.com/madoka-chann/Bilibili-AI-Favorites-Organizer/refs/heads/main/bilibili-favorites-ai-organizer.user.js)**

 
 **[Github国内加速源](https://ghfast.top/https://raw.githubusercontent.com/madoka-chann/Bilibili-AI-Favorites-Organizer/main/bilibili-favorites-ai-organizer.user.js)**

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

 **[Github源](https://raw.githubusercontent.com/madoka-chann/Bilibili-AI-Favorites-Organizer/refs/heads/main/bilibili-favorites-ai-organizer.user.js)**

 **[Github国内加速源](https://ghfast.top/https://raw.githubusercontent.com/madoka-chann/Bilibili-AI-Favorites-Organizer/main/bilibili-favorites-ai-organizer.user.js)**

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
├── bilibili-favorites-ai-organizer.user.js   # 主脚本（核心逻辑 + UI）
├── bilibili-favorites-ai-organizer.css        # 样式文件（主题 + 动画）
└── README.md
```
- **语言**：原生 JavaScript (ES6+)
- **样式**：CSS3（CSS 变量、渐变、动画、暗色主题）
- **图标**：Lucide Icons
- **存储**：Tampermonkey GM_getValue / GM_setValue

## 注意事项

- 使用前请确保已登录 Bilibili 账号
- API Key 仅保存在本地浏览器中，不会上传至任何服务器
- 建议首次使用前先备份收藏夹
- 请合理设置请求频率，避免触发 Bilibili 风控
- Ollama 本地部署需确保 `localhost:11434` 可访问

## 许可证

MIT License
