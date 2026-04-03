import { describe, it, expect } from 'vitest';
import { groupBy } from './collections';

describe('groupBy', () => {
  it('groups items by key function', () => {
    const items = [
      { id: 1, folderId: 10 },
      { id: 2, folderId: 20 },
      { id: 3, folderId: 10 },
    ];
    const result = groupBy(items, (item) => item.folderId);
    expect(result.get(10)).toHaveLength(2);
    expect(result.get(20)).toHaveLength(1);
  });

  it('returns Map (not plain object) to preserve number keys', () => {
    const result = groupBy([{ v: 1 }], () => 42);
    expect(result).toBeInstanceOf(Map);
    expect(result.get(42)).toEqual([{ v: 1 }]);
  });

  it('handles empty input', () => {
    const result = groupBy([], () => 0);
    expect(result.size).toBe(0);
  });
});
