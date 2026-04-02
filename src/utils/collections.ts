/** 按键函数分组 — 返回 Map 避免 JS 对象键隐式转字符串 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => number,
): Map<number, T[]> {
  const result = new Map<number, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    let group = result.get(key);
    if (!group) {
      group = [];
      result.set(key, group);
    }
    group.push(item);
  }
  return result;
}
