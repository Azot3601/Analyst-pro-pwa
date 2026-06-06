import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { isSqlQuestLessonUnlocked, sqlQuestChapters, sqlQuestLessons } from '../../data/sqlQuest';
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

describe('sqlQuest lessons', () => {
  it('has 8 chapters and 24 lessons with both learning paths', () => {
    expect(sqlQuestChapters).toHaveLength(8);
    expect(sqlQuestLessons).toHaveLength(24);

    for (const chapter of sqlQuestChapters) {
      const lessons = sqlQuestLessons.filter((lesson) => lesson.chapterId === chapter.id);
      expect(lessons, chapter.id).toHaveLength(3);
      expect(lessons.some((lesson) => lesson.pathType === 'trial'), chapter.id).toBe(true);
      expect(lessons.some((lesson) => lesson.pathType === 'case'), chapter.id).toBe(true);
    }
  });

  it('unlocks lessons after prerequisites are solved', () => {
    const secondLesson = sqlQuestLessons[1];
    expect(isSqlQuestLessonUnlocked(secondLesson, [])).toBe(false);
    expect(isSqlQuestLessonUnlocked(secondLesson, [sqlQuestLessons[0].id])).toBe(true);
  });

  it('does not contain broken prerequisites', () => {
    const ids = new Set(sqlQuestLessons.map((lesson) => lesson.id));
    const broken = sqlQuestLessons.flatMap((lesson) => lesson.prerequisiteTaskIds.filter((id) => !ids.has(id)));
    expect(broken).toEqual([]);
  });

  it('starter SQL matches expected rows for every lesson', async () => {
    for (const lesson of sqlQuestLessons) {
      const rows = await runLessonSql(lesson.starterSql);
      const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
      expect(check.ok, lesson.id).toBe(true);
    }
  });
});
