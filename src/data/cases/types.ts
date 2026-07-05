import type { SqlTablePreview } from '../sqlSeed';

// Общие типы доменной модели кейсов. entities.ts каждого кейса — источник истины:
// имена и типы полей отсюда текут в SQL-таблицы, превью и API-контракт. seedData и
// apiContract ссылаются на сущности ЧЕРЕЗ типы (RowOf), а не копипастой строк.

export type FieldType = 'integer' | 'text' | 'timestamp' | 'money' | 'boolean';

export interface Field {
  readonly name: string;
  readonly type: FieldType;
  readonly pk?: boolean;
  readonly fk?: string; // "table.column"
  readonly nullable?: boolean;
  readonly enumValues?: readonly string[];
  readonly note?: string;
}

export interface Entity {
  readonly name: string; // отображаемое имя (ERD)
  readonly table: string; // имя таблицы в SQL
  readonly fields: readonly Field[];
}

type TsOf<T extends FieldType> = T extends 'integer' | 'money'
  ? number
  : T extends 'boolean'
    ? boolean
    : string;

/** Тип строки, выведенный ИЗ определения сущности: ключи — имена полей entities. */
export type RowOf<E extends { fields: readonly Field[] }> = {
  [F in E['fields'][number] as F['name']]: TsOf<F['type']>;
};

// ── Генерация SQL и превью из сущностей (единственный источник — Entity) ──────

const sqlColumnType = (t: FieldType) => (t === 'integer' || t === 'money' || t === 'boolean' ? 'INTEGER' : 'TEXT');

const literal = (value: unknown): string =>
  value == null
    ? 'NULL'
    : typeof value === 'number'
      ? String(value)
      : typeof value === 'boolean'
        ? value
          ? '1'
          : '0'
        : `'${String(value).replace(/'/g, "''")}'`;

export function entityToDdl(entity: Entity): string {
  const columns = entity.fields.map((f) => {
    const parts = [`  ${f.name} ${sqlColumnType(f.type)}`];
    if (f.pk) parts.push('PRIMARY KEY');
    else if (!f.nullable) parts.push('NOT NULL');
    return parts.join(' ');
  });
  const foreignKeys = entity.fields
    .filter((f) => f.fk)
    .map((f) => {
      const [table, column] = f.fk!.split('.');
      return `  FOREIGN KEY(${f.name}) REFERENCES ${table}(${column})`;
    });
  return `CREATE TABLE ${entity.table} (\n${[...columns, ...foreignKeys].join(',\n')}\n);`;
}

export function rowsToInsert(entity: Entity, rows: ReadonlyArray<Record<string, unknown>>): string {
  if (!rows.length) return '';
  const columns = entity.fields.map((f) => f.name);
  const values = rows
    .map((row) => `  (${columns.map((c) => literal(row[c])).join(', ')})`)
    .join(',\n');
  return `INSERT INTO ${entity.table} (${columns.join(', ')}) VALUES\n${values};`;
}

/** DDL + INSERT для одной сущности вместе с её строками. */
export function entityToSql(entity: Entity, rows: ReadonlyArray<Record<string, unknown>>): string {
  return `${entityToDdl(entity)}\n${rowsToInsert(entity, rows)}`;
}

export function entityToPreview(
  entity: Entity,
  title: string,
  description: string,
  rows: ReadonlyArray<Record<string, string | number | null>>
): SqlTablePreview {
  return {
    name: entity.table,
    title,
    description,
    columns: entity.fields.map((f) => f.name),
    rows: rows.map((r) => ({ ...r }))
  };
}
