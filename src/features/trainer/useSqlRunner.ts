import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { sqlSchema } from '../../data/sqlSeed';
import type { SqlRow } from '../../shared/lib/sqlChecker';

export async function runSql(query: string): Promise<SqlRow[]> {
  const SQL = await initSqlJs({
    locateFile: () => wasmUrl
  });
  const db = new SQL.Database();
  db.run(sqlSchema);
  const result = db.exec(query);
  db.close();

  if (!result.length) return [];

  const first = result[0];
  return first.values.map((values) =>
    Object.fromEntries(first.columns.map((column, index) => [column, values[index] as SqlRow[string]]))
  );
}
