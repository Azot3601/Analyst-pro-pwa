import type { InterviewRequirement, InterviewScript } from '../../data/cases/reservationCase/interviewScript';

// Оценка интервью: покрытие скрытых требований + качество вопросов (доля
// открытых уточняющих против наводящих/преждевременных). Детерминированно.

export type InterviewSummary = {
  found: InterviewRequirement[];
  missed: InterviewRequirement[];
  mustMissed: InterviewRequirement[];
  total: number;
  goodQuestions: number;
  badQuestions: number;
  qualityPercent: number;
  ok: boolean;
};

export function summarizeInterview(
  script: InterviewScript,
  unlockedIds: ReadonlySet<string>,
  askedGoodFlags: readonly boolean[]
): InterviewSummary {
  const found = script.requirements.filter((r) => unlockedIds.has(r.id));
  const missed = script.requirements.filter((r) => !unlockedIds.has(r.id));
  const mustMissed = missed.filter((r) => r.priority === 'must');
  const goodQuestions = askedGoodFlags.filter(Boolean).length;
  const badQuestions = askedGoodFlags.length - goodQuestions;
  const qualityPercent = askedGoodFlags.length ? Math.round((goodQuestions / askedGoodFlags.length) * 100) : 0;
  return {
    found,
    missed,
    mustMissed,
    total: script.requirements.length,
    goodQuestions,
    badQuestions,
    qualityPercent,
    ok: mustMissed.length === 0
  };
}
