import { apiQuestTasks } from '../../data/apiQuest';
import { requirementsTasks } from '../../data/requirementsQuest';
import { sqlQuestLessons } from '../../data/sqlQuest';
import type { UserProgress } from '../../entities/schemas';

// Реальные уровни навыков считаются из фактически решённых задач, а не из
// захардкоженных чисел. Процент = решено / всего доступных задач по треку.

export type SkillLevel = { skill: string; value: number; solved: number; total: number };

const pct = (solved: number, total: number) => (total === 0 ? 0 : Math.round((solved / total) * 100));

const apiKindLabel: Record<string, string> = {
  rest: 'REST',
  json: 'JSON',
  openapi: 'OpenAPI',
  integration: 'Интеграции'
};

// Порядок треков в API-квесте, чтобы карточки не «прыгали» между рендерами.
const apiKindOrder = ['rest', 'json', 'openapi', 'integration'] as const;

export function computeSkillLevels(progress: UserProgress): SkillLevel[] {
  const solvedTasks = new Set(progress.solvedTaskIds);
  const solvedSql = new Set(progress.sqlQuest?.solvedSqlLessonIds ?? []);

  const rows: SkillLevel[] = [];

  // SQL
  const sqlSolved = sqlQuestLessons.filter((lesson) => solvedSql.has(lesson.id)).length;
  rows.push({ skill: 'SQL', solved: sqlSolved, total: sqlQuestLessons.length, value: pct(sqlSolved, sqlQuestLessons.length) });

  // API-треки (REST / JSON / OpenAPI / Интеграции)
  for (const kind of apiKindOrder) {
    const inKind = apiQuestTasks.filter((task) => task.kind === kind);
    if (inKind.length === 0) continue;
    const solved = inKind.filter((task) => solvedTasks.has(task.id)).length;
    rows.push({ skill: apiKindLabel[kind], solved, total: inKind.length, value: pct(solved, inKind.length) });
  }

  // Требования
  const reqSolved = requirementsTasks.filter((task) => solvedTasks.has(task.id)).length;
  rows.push({
    skill: 'Требования',
    solved: reqSolved,
    total: requirementsTasks.length,
    value: pct(reqSolved, requirementsTasks.length)
  });

  return rows;
}
