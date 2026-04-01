/**
 * AI 分类系统提示词构建
 */

export function buildSystemPrompt(existingFolderNames: string[], customPrompt: string): string {
  const existingPart = existingFolderNames.length > 0
    ? `\n\n【已有收藏夹列表】\n${existingFolderNames.map(n => `• ${n}`).join('\n')}\n\n必须优先使用以上已有收藏夹名！只有当视频完全不适合任何已有分类时，才可新建。`
    : '';

  const customPart = customPrompt
    ? `\n\n【用户自定义规则（最高优先级）】\n${customPrompt}`
    : '';

  return `你是逻辑严密的B站收藏夹视频分类专家。

【任务】
将以下视频分类到合适的收藏夹。

【规则】
1. 每个视频必须且只能属于一个分类
2. 输出纯JSON，格式：{"thoughts":"分析过程","categories":{"收藏夹名":[{"id":数字,"type":数字,"conf":置信度0-1}]}}
3. conf 表示分类置信度，1.0=非常确定，0.5=不太确定
4. 绝不遗漏任何视频${existingPart}${customPart}`.trim();
}
