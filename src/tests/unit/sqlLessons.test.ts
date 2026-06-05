import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { sqlLessons } from '../../data/sqlCourse';
import { sqlSchema } from '../../data/sqlSeed';
import { compareSqlRows, type SqlRow } from '../../shared/lib/sqlChecker';

async function runLessonSql(query: string): Promise<SqlRow[]> {
  const SQL = await initSqlJs({
    locateFile: (file) => `node_modules/sql.js/dist/${file}`
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

describe('sqlLessons starter SQL', () => {
  it('matches expected rows for every lesson', async () => {
    for (const lesson of sqlLessons) {
      const rows = await runLessonSql(lesson.starterSql);
      const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
      expect(check.ok, lesson.id).toBe(true);
    }
  });
});
