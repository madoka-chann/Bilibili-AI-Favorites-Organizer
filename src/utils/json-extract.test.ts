import { describe, it, expect } from 'vitest';
import { extractJsonObject } from './json-extract';

describe('extractJsonObject', () => {
  it('parses clean JSON', () => {
    const result = extractJsonObject('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('extracts JSON from markdown code block', () => {
    const raw = '```json\n{"thoughts": "test", "categories": {}}\n```';
    const result = extractJsonObject(raw) as Record<string, unknown>;
    expect(result.thoughts).toBe('test');
  });

  it('extracts JSON surrounded by extra text', () => {
    const raw = 'Here is the result:\n{"a": 1}\nDone!';
    expect(extractJsonObject(raw)).toEqual({ a: 1 });
  });

  it('handles escaped quotes in strings', () => {
    const raw = '{"name": "hello \\"world\\""}';
    expect(extractJsonObject(raw)).toEqual({ name: 'hello "world"' });
  });

  it('handles nested braces', () => {
    const raw = '{"outer": {"inner": {"deep": 1}}}';
    const result = extractJsonObject(raw) as Record<string, unknown>;
    expect(result).toEqual({ outer: { inner: { deep: 1 } } });
  });

  it('fixes trailing commas', () => {
    const raw = '{"a": 1, "b": 2,}';
    expect(extractJsonObject(raw)).toEqual({ a: 1, b: 2 });
  });

  it('fixes trailing comma in arrays', () => {
    const raw = '{"list": [1, 2, 3,]}';
    expect(extractJsonObject(raw)).toEqual({ list: [1, 2, 3] });
  });

  it('throws on invalid JSON', () => {
    expect(() => extractJsonObject('not json at all')).toThrow();
  });

  it('handles braces inside strings', () => {
    const raw = '{"text": "a { b } c", "val": 42}';
    expect(extractJsonObject(raw)).toEqual({ text: 'a { b } c', val: 42 });
  });
});
