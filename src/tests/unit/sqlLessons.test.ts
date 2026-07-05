import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { isSqlQuestLessonUnlocked, sqlQuestChapters, sqlQuestLessons } from '../../data/sqlQuest';
import { caseSchemaSql } from '../../data/cases/caseRegistry';
import { sqlSchema } from '../../data/sqlSeed';
import { compareSqlRows, type SqlRow } from '../../shared/lib/sqlChecker';

async function runLessonSql(query: string): Promise<SqlRow[]> {
  const SQL = await initSqlJs({
    locateFile: (file) => `node_modules/sql.js/dist/${file}`
  });
  const db = new SQL.Database();
  db.run(sqlSchema);
  db.run(caseSchemaSql);
  const result = db.exec(query);
  db.close();

  if (!result.length) return [];
  const first = result[0];
  return first.values.map((values) =>
    Object.fromEntries(first.columns.map((column, index) => [column, values[index] as SqlRow[string]]))
  );
}

describe('sqlQuest lessons', () => {
  it('keeps 8 base chapters (both paths) plus the reservation case-track', () => {
    expect(sqlQuestChapters).toHaveLength(9);
    expect(sqlQuestLessons).toHaveLength(26);

    for (const chapter of sqlQuestChapters.filter((c) => c.id !== 'case-reservation')) {
      const lessons = sqlQuestLessons.filter((lesson) => lesson.chapterId === chapter.id);
      expect(lessons, chapter.id).toHaveLength(3);
      expect(lessons.some((lesson) => lesson.pathType === 'trial'), chapter.id).toBe(true);
      expect(lessons.some((lesson) => lesson.pathType === 'case'), chapter.id).toBe(true);
    }

    const caseLessons = sqlQuestLessons.filter((lesson) => lesson.chapterId === 'case-reservation');
    expect(caseLessons.length).toBeGreaterThanOrEqual(2);
    expect(caseLessons.every((lesson) => lesson.pathType === 'case')).toBe(true);
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

  it('solution SQL matches expected rows for every lesson', async () => {
    for (const lesson of sqlQuestLessons) {
      const rows = await runLessonSql(lesson.solutionSql);
      const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
      expect(check.ok, lesson.id).toBe(true);
    }
  });

  it('starter SQL is a scaffold, not the ready answer', () => {
    for (const lesson of sqlQuestLessons) {
      expect(lesson.starterSql, lesson.id).not.toBe(lesson.solutionSql);
      // Каркас содержит «дырки»-комментарии, которые ученик должен заполнить.
      expect(lesson.starterSql.includes('-- ?'), lesson.id).toBe(true);
    }
  });
});
