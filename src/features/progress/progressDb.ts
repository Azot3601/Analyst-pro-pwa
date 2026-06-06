import Dexie, { type Table } from 'dexie';
import {
  getRankForXp,
  getUnlockedRanksForXp,
  sqlQuestChapters,
  sqlQuestLessons,
  sqlQuestRanks,
  type SqlQuestLesson
} from '../../data/sqlQuest';
import type { UserProgress } from '../../entities/schemas';

export type SqlQuestProgress = NonNullable<UserProgress['sqlQuest']>;

export const defaultSqlQuestProgress: SqlQuestProgress = {
  solvedSqlLessonIds: [],
  xp: 0,
  level: 1,
  rankId: sqlQuestRanks[0].id,
  unlockedRankIds: [sqlQuestRanks[0].id],
  attemptsByLessonId: {},
  revealedHintsByLessonId: {},
  currentChapterId: sqlQuestChapters[0].id,
  lastSqlLessonId: sqlQuestLessons[0].id,
  recentlySolvedLessonIds: []
};

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
  sqlQuest: defaultSqlQuestProgress,
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

function normalizeSqlQuestProgress(progress?: SqlQuestProgress): SqlQuestProgress {
  const xp = progress?.xp ?? defaultSqlQuestProgress.xp;
  const rank = getRankForXp(xp);
  const solvedSqlLessonIds = progress?.solvedSqlLessonIds ?? [];

  return {
    ...defaultSqlQuestProgress,
    ...progress,
    solvedSqlLessonIds,
    xp,
    level: Math.max(1, Math.floor(xp / 120) + 1),
    rankId: rank.id,
    unlockedRankIds: getUnlockedRanksForXp(xp),
    attemptsByLessonId: progress?.attemptsByLessonId ?? {},
    revealedHintsByLessonId: progress?.revealedHintsByLessonId ?? {},
    recentlySolvedLessonIds: progress?.recentlySolvedLessonIds ?? solvedSqlLessonIds.slice(-5).reverse()
  };
}

export function normalizeProgress(progress: UserProgress): UserProgress {
  return {
    ...defaultProgress,
    ...progress,
    solvedTaskIds: progress.solvedTaskIds ?? [],
    attempts: progress.attempts ?? {},
    revealedHints: progress.revealedHints ?? {},
    favoriteKnowledgeIds: progress.favoriteKnowledgeIds ?? [],
    skillLevels: progress.skillLevels ?? defaultProgress.skillLevels,
    weakZones: progress.weakZones ?? defaultProgress.weakZones,
    notes: progress.notes ?? {},
    sqlQuest: normalizeSqlQuestProgress(progress.sqlQuest)
  };
}

export async function getProgress() {
  const progress = await db.progress.get('local-user');
  return progress ? normalizeProgress(progress) : defaultProgress;
}

export async function saveProgress(progress: UserProgress) {
  await db.progress.put(normalizeProgress({ ...progress, updatedAt: new Date().toISOString() }));
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

export function applySqlQuestAttempt(progress: UserProgress, lessonId: string): UserProgress {
  const normalized = normalizeProgress(progress);
  const quest = normalized.sqlQuest ?? defaultSqlQuestProgress;
  return normalizeProgress({
    ...normalized,
    sqlQuest: {
      ...quest,
      attemptsByLessonId: {
        ...quest.attemptsByLessonId,
        [lessonId]: (quest.attemptsByLessonId[lessonId] ?? 0) + 1
      },
      lastSqlLessonId: lessonId
    }
  });
}

export function applySqlQuestHint(progress: UserProgress, lessonId: string, hintId: string): UserProgress {
  const normalized = normalizeProgress(progress);
  const quest = normalized.sqlQuest ?? defaultSqlQuestProgress;
  const current = quest.revealedHintsByLessonId[lessonId] ?? [];

  return normalizeProgress({
    ...normalized,
    sqlQuest: {
      ...quest,
      revealedHintsByLessonId: {
        ...quest.revealedHintsByLessonId,
        [lessonId]: Array.from(new Set([...current, hintId]))
      },
      lastSqlLessonId: lessonId
    }
  });
}

export function applySqlQuestSolve(
  progress: UserProgress,
  lesson: Pick<SqlQuestLesson, 'id' | 'xp' | 'chapterId'>
): { progress: UserProgress; xpAwarded: number } {
  const normalized = normalizeProgress(progress);
  const quest = normalized.sqlQuest ?? defaultSqlQuestProgress;
  const alreadySolved = quest.solvedSqlLessonIds.includes(lesson.id);
  const xpAwarded = alreadySolved ? 0 : lesson.xp;
  const solvedSqlLessonIds = alreadySolved
    ? quest.solvedSqlLessonIds
    : [...quest.solvedSqlLessonIds, lesson.id];
  const xp = quest.xp + xpAwarded;
  const rank = getRankForXp(xp);
  const recentlySolvedLessonIds = alreadySolved
    ? quest.recentlySolvedLessonIds
    : [lesson.id, ...quest.recentlySolvedLessonIds.filter((id) => id !== lesson.id)].slice(0, 5);

  return {
    xpAwarded,
    progress: normalizeProgress({
      ...normalized,
      sqlQuest: {
        ...quest,
        solvedSqlLessonIds,
        xp,
        level: Math.max(1, Math.floor(xp / 120) + 1),
        rankId: rank.id,
        unlockedRankIds: getUnlockedRanksForXp(xp),
        currentChapterId: lesson.chapterId,
        lastSqlLessonId: lesson.id,
        recentlySolvedLessonIds
      }
    })
  };
}

export async function recordSqlQuestAttempt(lessonId: string) {
  const progress = applySqlQuestAttempt(await getProgress(), lessonId);
  await saveProgress(progress);
  return progress;
}

export async function revealSqlQuestHint(lessonId: string, hintId: string) {
  const progress = applySqlQuestHint(await getProgress(), lessonId, hintId);
  await saveProgress(progress);
  return progress;
}

export async function solveSqlQuestLesson(lesson: Pick<SqlQuestLesson, 'id' | 'xp' | 'chapterId'>) {
  const result = applySqlQuestSolve(await getProgress(), lesson);
  await saveProgress(result.progress);
  return result;
}

export async function setSqlQuestLocation(chapterId: string, lessonId: string) {
  const progress = normalizeProgress(await getProgress());
  await saveProgress({
    ...progress,
    sqlQuest: {
      ...(progress.sqlQuest ?? defaultSqlQuestProgress),
      currentChapterId: chapterId,
      lastSqlLessonId: lessonId
    }
  });
}
