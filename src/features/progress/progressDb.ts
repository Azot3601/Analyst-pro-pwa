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
import { applyReviewResult, weakZonesFrom } from '../practice/reviewEngine';

export type SqlQuestProgress = NonNullable<UserProgress['sqlQuest']>;
export type ApiTaskDomain = 'rest' | 'json' | 'openapi' | 'integration';

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
  lastTaskIdsByDomain: {},
  // Уровни навыков считаются на лету из решённых задач (computeSkillLevels) —
  // здесь ничего не хардкодим, чтобы экран не показывал выдуманные проценты.
  skillLevels: {},
  // Слабые зоны считаются из реальных результатов повторения — не выдумываются.
  weakZones: [],
  reviews: {},
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
    lastTaskIdsByDomain: progress.lastTaskIdsByDomain ?? {},
    skillLevels: progress.skillLevels ?? defaultProgress.skillLevels,
    weakZones: progress.weakZones ?? defaultProgress.weakZones,
    reviews: progress.reviews ?? {},
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

async function updateProgress(updater: (progress: UserProgress) => UserProgress) {
  return db.transaction('rw', db.progress, async () => {
    const stored = await db.progress.get('local-user');
    const next = normalizeProgress(updater(stored ? normalizeProgress(stored) : defaultProgress));
    await db.progress.put({ ...next, updatedAt: new Date().toISOString() });
    return next;
  });
}

function withApiLocation(progress: UserProgress, taskId: string, domain: ApiTaskDomain): UserProgress {
  return normalizeProgress({
    ...progress,
    lastTaskId: taskId,
    lastTaskIdsByDomain: {
      ...(progress.lastTaskIdsByDomain ?? {}),
      [domain]: taskId
    }
  });
}

export function applyApiTaskAttempt(
  progress: UserProgress,
  taskId: string,
  domain: ApiTaskDomain
): UserProgress {
  const normalized = normalizeProgress(progress);
  return withApiLocation(
    {
      ...normalized,
      attempts: {
        ...normalized.attempts,
        [taskId]: (normalized.attempts[taskId] ?? 0) + 1
      }
    },
    taskId,
    domain
  );
}

export function applyApiTaskHint(
  progress: UserProgress,
  taskId: string,
  hintId: string,
  domain: ApiTaskDomain
): UserProgress {
  const normalized = normalizeProgress(progress);
  const current = normalized.revealedHints[taskId] ?? [];
  return withApiLocation(
    {
      ...normalized,
      revealedHints: {
        ...normalized.revealedHints,
        [taskId]: Array.from(new Set([...current, hintId]))
      }
    },
    taskId,
    domain
  );
}

export function applyApiTaskSolve(
  progress: UserProgress,
  taskId: string,
  domain: ApiTaskDomain
): UserProgress {
  const normalized = normalizeProgress(progress);
  return withApiLocation(
    {
      ...normalized,
      solvedTaskIds: Array.from(new Set([...normalized.solvedTaskIds, taskId]))
    },
    taskId,
    domain
  );
}

export function recordApiTaskAttempt(taskId: string, domain: ApiTaskDomain) {
  return updateProgress((progress) => applyApiTaskAttempt(progress, taskId, domain));
}

export function revealApiTaskHint(taskId: string, hintId: string, domain: ApiTaskDomain) {
  return updateProgress((progress) => applyApiTaskHint(progress, taskId, hintId, domain));
}

export function solveApiTask(taskId: string, domain: ApiTaskDomain) {
  return updateProgress((progress) => applyApiTaskSolve(progress, taskId, domain));
}

export function setLastApiTask(taskId: string, domain: ApiTaskDomain) {
  return updateProgress((progress) => withApiLocation(progress, taskId, domain));
}

/** Записать результат повторения концепта: двигает лесенку интервалов и слабые зоны. */
export function recordReview(conceptId: string, pass: boolean) {
  return updateProgress((progress) => {
    const reviews = applyReviewResult(progress.reviews ?? {}, conceptId, pass);
    return { ...progress, reviews, weakZones: weakZonesFrom(reviews) };
  });
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
