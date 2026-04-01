/** 按键函数分组 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => number,
): Record<number, T[]> {
  const result: Record<number, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
