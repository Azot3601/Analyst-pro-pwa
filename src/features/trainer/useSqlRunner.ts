import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { caseSchemaSql } from '../../data/cases/caseRegistry';
import { sqlSchema } from '../../data/sqlSeed';
import type { SqlRow } from '../../shared/lib/sqlChecker';

// Движок sql.js и засеянная БД кэшируются один раз на сессию, а не
// переинициализируются на каждый запрос (раньше WASM грузился и БД
// пересоздавалась при каждом прогоне — это упиралось и в UX, и в анимации).

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type SqlDatabase = InstanceType<SqlJsStatic['Database']>;

let enginePromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<SqlDatabase> | null = null;

function getEngine() {
  if (!enginePromise) {
    enginePromise = initSqlJs({ locateFile: () => wasmUrl });
  }
  return enginePromise;
}

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = getEngine().then((SQL) => {
      const db = new SQL.Database();
      db.run(sqlSchema);
      db.run(caseSchemaSql); // таблицы кейсов (Бронирование столиков и т.д.)
      return db;
    });
  }
  return dbPromise;
}

export async function runSql(query: string): Promise<SqlRow[]> {
  const db = await getDatabase();
  const result = db.exec(query);
  if (!result.length) return [];

  const first = result[0];
  return first.values.map((values) =>
    Object.fromEntries(first.columns.map((column, index) => [column, values[index] as SqlRow[string]]))
  );
}
