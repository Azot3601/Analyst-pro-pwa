import { describe, expect, it } from 'vitest';
import { sqlQuestLessons } from '../../data/sqlQuest';
import {
  applyApiTaskAttempt,
  applyApiTaskHint,
  applyApiTaskSolve,
  applySqlQuestAttempt,
  applySqlQuestHint,
  applySqlQuestSolve,
  defaultProgress,
  normalizeProgress
} from '../../features/progress/progressDb';
import { computeSkillLevels } from '../../features/progress/skillLevels';

describe('progress defaults', () => {
  it('starts with local user and no fabricated skill levels', () => {
    expect(defaultProgress.id).toBe('local-user');
    // Никаких выдуманных процентов: пока ничего не решено — все навыки на нуле.
    expect(defaultProgress.skillLevels).toEqual({});
    expect(computeSkillLevels(defaultProgress).every((s) => s.value === 0)).toBe(true);
  });

  it('computes real SQL skill level from solved lessons', () => {
    const lesson = sqlQuestLessons[0];
    const solved = applySqlQuestSolve(defaultProgress, lesson).progress;
    const sql = computeSkillLevels(solved).find((s) => s.skill === 'SQL');

    expect(sql?.solved).toBe(1);
    expect(sql?.total).toBe(sqlQuestLessons.length);
    expect(sql?.value).toBeGreaterThan(0);
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

  it('persists API task attempts, hints and last task by domain', () => {
    const attempted = applyApiTaskAttempt(defaultProgress, 'rest-get-orders', 'rest');
    const hinted = applyApiTaskHint(attempted, 'rest-get-orders', 'hint-1', 'rest');
    const restored = normalizeProgress(JSON.parse(JSON.stringify(hinted)));

    expect(restored.attempts['rest-get-orders']).toBe(1);
    expect(restored.revealedHints['rest-get-orders']).toEqual(['hint-1']);
    expect(restored.lastTaskIdsByDomain?.rest).toBe('rest-get-orders');
  });

  it('marks an API task solved once without changing SQL Quest progress', () => {
    const first = applyApiTaskSolve(defaultProgress, 'json-order-contract', 'json');
    const second = applyApiTaskSolve(first, 'json-order-contract', 'json');

    expect(second.solvedTaskIds).toEqual(['json-order-contract']);
    expect(second.lastTaskIdsByDomain?.json).toBe('json-order-contract');
    expect(second.sqlQuest).toEqual(defaultProgress.sqlQuest);
  });
});
