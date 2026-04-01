/**
 * 从可能包含 markdown 代码块或额外文本的 AI 响应中提取第一个完整 JSON 对象。
 * 使用括号匹配算法，正确处理字符串内的转义字符。
 */
export function extractJsonObject(raw: string): unknown {
  let content = raw.replace(/```json/g, '').replace(/```/g, '').trim();

  const firstBrace = content.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let endPos = -1;

    for (let i = firstBrace; i < content.length; i++) {
      const ch = content[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { endPos = i; break; }
      }
    }

    if (endPos > firstBrace) {
      content = content.substring(firstBrace, endPos + 1);
    } else {
      const lastBrace = content.lastIndexOf('}');
      if (lastBrace > firstBrace) {
        content = content.substring(firstBrace, lastBrace + 1);
      }
    }
  }

  // 尝试解析 JSON，失败则修复常见尾逗号问题后重试
  try {
    return JSON.parse(content);
  } catch (firstErr: unknown) {
    const fixed = content.replace(/,\s*([\]}])/g, '$1');
    try {
      return JSON.parse(fixed);
    } catch {
      // 尾逗号修复也无法解析，抛出原始错误以保留上下文
      throw firstErr;
    }
  }
}
