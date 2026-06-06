import { describe, expect, it } from 'vitest';
import { sqlQuestLessons } from '../../data/sqlQuest';
import {
  applySqlQuestAttempt,
  applySqlQuestHint,
  applySqlQuestSolve,
  defaultProgress,
  normalizeProgress
} from '../../features/progress/progressDb';

describe('progress defaults', () => {
  it('starts with local user and skill levels', () => {
    expect(defaultProgress.id).toBe('local-user');
    expect(defaultProgress.skillLevels.SQL).toBeGreaterThan(0);
  });

  it('awards SQL Quest XP once for a solved lesson', () => {
    const lesson = sqlQuestLessons[0];
    const first = applySqlQuestSolve(defaultProgress, lesson);
    const second = applySqlQuestSolve(first.progress, lesson);

    expect(first.xpAwarded).toBe(lesson.xp);
    expect(second.xpAwarded).toBe(0);
    expect(second.progress.sqlQuest?.xp).toBe(lesson.xp);
    expect(second.progress.sqlQuest?.solvedSqlLessonIds).toEqual([lesson.id]);
  });

  it('persists attempts and revealed hints in normalized progress', () => {
    const lesson = sqlQuestLessons[0];
    const withAttempt = applySqlQuestAttempt(defaultProgress, lesson.id);
    const withHint = applySqlQuestHint(withAttempt, lesson.id, '0');
    const normalized = normalizeProgress(withHint);

    expect(normalized.sqlQuest?.attemptsByLessonId[lesson.id]).toBe(1);
    expect(normalized.sqlQuest?.revealedHintsByLessonId[lesson.id]).toEqual(['0']);
  });

  it('keeps solved SQL lesson after reload normalization', () => {
    const lesson = sqlQuestLessons[0];
    const solved = applySqlQuestSolve(defaultProgress, lesson).progress;
    const restored = normalizeProgress(JSON.parse(JSON.stringify(solved)));

    expect(restored.sqlQuest?.solvedSqlLessonIds).toContain(lesson.id);
    expect(restored.sqlQuest?.lastSqlLessonId).toBe(lesson.id);
  });
});
