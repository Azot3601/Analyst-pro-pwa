import type { UserProgress } from '../../entities/schemas';
import { computeSkillLevels } from './skillLevels';

// Skill matrix: агрегация СУЩЕСТВУЮЩЕГО прогресса по областям знаний BABOK.
// Не новый трекинг — надстройка над UserProgress.

export type ModuleStat = { id: string; label: string; percent: number };

// Модули-конструкторы дают бинарный прогресс по одной задаче кейса.
const binaryModules: Array<[id: string, label: string, taskId: string]> = [
  ['ERD', 'ERD', 'erd-reservation'],
  ['BPMN', 'BPMN', 'bpmn-reservation'],
  ['Use Case', 'Use Case', 'usecase-reservation'],
  ['Интервью', 'Интервью', 'interview-reservation'],
  ['Дефекты', 'Дефекты', 'defects-reservation']
];

export function moduleStats(progress: UserProgress): ModuleStat[] {
  const fromLevels = computeSkillLevels(progress).map((l) => ({ id: l.skill, label: l.skill, percent: l.value }));
  const solved = new Set(progress.solvedTaskIds);
  const binary = binaryModules.map(([id, label, taskId]) => ({ id, label, percent: solved.has(taskId) ? 100 : 0 }));
  return [...fromLevels, ...binary];
}

export type BabokArea = { id: string; label: string; moduleIds: string[] };

// Области знаний BABOK (сокращённо) и какие модули тренажёра их закрывают.
export const babokAreas: BabokArea[] = [
  { id: 'elicitation', label: 'Элиситация и коммуникация', moduleIds: ['Интервью', 'Требования'] },
  { id: 'analysis', label: 'Анализ требований и проектирование', moduleIds: ['Требования', 'ERD', 'BPMN', 'Use Case', 'REST', 'JSON', 'OpenAPI', 'Интеграции'] },
  { id: 'lifecycle', label: 'Управление жизненным циклом требований', moduleIds: ['Дефекты'] },
  { id: 'evaluation', label: 'Оценка решения', moduleIds: ['SQL'] }
];

export type SkillMatrixRow = { id: string; label: string; percent: number; modules: ModuleStat[] };

export function computeSkillMatrix(progress: UserProgress): SkillMatrixRow[] {
  const byId = new Map(moduleStats(progress).map((m) => [m.id, m]));
  return babokAreas.map((area) => {
    const modules = area.moduleIds.map((id) => byId.get(id)).filter((m): m is ModuleStat => Boolean(m));
    const percent = modules.length ? Math.round(modules.reduce((sum, m) => sum + m.percent, 0) / modules.length) : 0;
    return { id: area.id, label: area.label, percent, modules };
  });
}
