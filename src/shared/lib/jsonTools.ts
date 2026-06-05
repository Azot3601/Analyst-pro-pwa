import Ajv from 'ajv';

export type JsonToolResult<T = unknown> = {
  ok: boolean;
  value?: T;
  message: string;
  details?: string[];
};

export function parseJson(input: string): JsonToolResult {
  try {
    return { ok: true, value: JSON.parse(input), message: 'JSON корректен.' };
  } catch (error) {
    return {
      ok: false,
      message: 'JSON не удалось разобрать.',
      details: [error instanceof Error ? error.message : 'Неизвестная ошибка']
    };
  }
}

export function formatJson(input: string): JsonToolResult<string> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed as JsonToolResult<string>;
  return {
    ok: true,
    value: JSON.stringify(parsed.value, null, 2),
    message: 'JSON отформатирован с отступом 2 пробела.'
  };
}

export function validateJsonSchema(jsonInput: string, schemaInput: string): JsonToolResult {
  const json = parseJson(jsonInput);
  const schema = parseJson(schemaInput);
  if (!json.ok) return json;
  if (!schema.ok) return { ...schema, message: 'JSON Schema не удалось разобрать.' };

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema.value as object);
  const ok = validate(json.value);

  return {
    ok,
    value: json.value,
    message: ok ? 'JSON соответствует схеме.' : 'JSON не соответствует схеме.',
    details: validate.errors?.map((item) => {
      const path = item.instancePath || 'корень документа';
      return `${path}: ${item.message ?? 'ошибка валидации'}`;
    })
  };
}

export function diffJson(leftInput: string, rightInput: string): JsonToolResult<string[]> {
  const left = parseJson(leftInput);
  const right = parseJson(rightInput);
  if (!left.ok) return left as JsonToolResult<string[]>;
  if (!right.ok) return right as JsonToolResult<string[]>;

  const changes: string[] = [];

  const walk = (path: string, a: unknown, b: unknown) => {
    if (JSON.stringify(a) === JSON.stringify(b)) return;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      changes.push(`${path}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
      return;
    }

    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    keys.forEach((key) => {
      walk(`${path}.${key}`, (a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
    });
  };

  walk('$', left.value, right.value);
  return {
    ok: true,
    value: changes.length ? changes : ['Отличий не найдено.'],
    message: 'Сравнение JSON завершено.'
  };
}

export function generateExampleFromSchema(schemaInput: string): JsonToolResult<string> {
  const parsed = parseJson(schemaInput);
  if (!parsed.ok) return parsed as JsonToolResult<string>;

  const build = (schema: any): unknown => {
    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;
    if (schema.enum?.length) return schema.enum[0];
    if (schema.type === 'string') return schema.format === 'date-time' ? '2026-06-04T12:00:00Z' : 'строка';
    if (schema.type === 'integer') return 1;
    if (schema.type === 'number') return 1.5;
    if (schema.type === 'boolean') return true;
    if (schema.type === 'array') return [build(schema.items ?? { type: 'string' })];
    if (schema.type === 'object' || schema.properties) {
      return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([key, value]) => [key, build(value)])
      );
    }
    return null;
  };

  return {
    ok: true,
    value: JSON.stringify(build(parsed.value), null, 2),
    message: 'Пример сгенерирован локальными правилами по JSON Schema.'
  };
}
