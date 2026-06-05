import Dexie, { type Table } from 'dexie';
import type { UserProgress } from '../../entities/schemas';

export const defaultProgress: UserProgress = {
  id: 'local-user',
  solvedTaskIds: [],
  attempts: {},
  revealedHints: {},
  favoriteKnowledgeIds: [],
  lastRoute: '/',
  skillLevels: {
    SQL: 18,
    REST: 14,
    JSON: 22,
    OpenAPI: 10,
    Интеграции: 12,
    Требования: 20,
    НФТ: 8
  },
  weakZones: ['Идемпотентность', 'JSON Schema', 'SLA/SLO'],
  streak: 0,
  notes: {},
  updatedAt: new Date().toISOString()
};

class AnalystProDb extends Dexie {
  progress!: Table<UserProgress, string>;

  constructor() {
    super('analyst-pro');
    this.version(1).stores({
      progress: 'id, updatedAt'
    });
  }
}

export const db = new AnalystProDb();

export async function getProgress() {
  return (await db.progress.get('local-user')) ?? defaultProgress;
}

export async function saveProgress(progress: UserProgress) {
  await db.progress.put({ ...progress, updatedAt: new Date().toISOString() });
}

export async function markTaskSolved(taskId: string) {
  const progress = await getProgress();
  const solvedTaskIds = Array.from(new Set([...progress.solvedTaskIds, taskId]));
  await saveProgress({ ...progress, solvedTaskIds, lastTaskId: taskId });
}

export async function revealHint(taskId: string, hintId: string) {
  const progress = await getProgress();
  const current = progress.revealedHints[taskId] ?? [];
  await saveProgress({
    ...progress,
    revealedHints: {
      ...progress.revealedHints,
      [taskId]: Array.from(new Set([...current, hintId]))
    }
  });
}
