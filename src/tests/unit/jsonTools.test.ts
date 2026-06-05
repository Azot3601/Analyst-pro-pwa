import { describe, expect, it } from 'vitest';
import { diffJson, formatJson, generateExampleFromSchema, parseJson, validateJsonSchema } from '../../shared/lib/jsonTools';

describe('jsonTools', () => {
  it('formats valid JSON', () => {
    const result = formatJson('{"a":1}');
    expect(result.ok).toBe(true);
    expect(result.value).toContain('\n  "a": 1\n');
  });

  it('returns Russian validation message for invalid JSON', () => {
    const result = parseJson('{"a":');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('JSON не удалось');
  });

  it('validates JSON Schema locally', () => {
    const result = validateJsonSchema('{"id":"1"}', '{"type":"object","required":["id"]}');
    expect(result.ok).toBe(true);
  });

  it('diffs JSON values', () => {
    const result = diffJson('{"a":1}', '{"a":2}');
    expect(result.value?.[0]).toContain('1 → 2');
  });

  it('generates an example from schema', () => {
    const result = generateExampleFromSchema('{"type":"object","properties":{"name":{"type":"string"}}}');
    expect(result.value).toContain('"name": "строка"');
  });
});
