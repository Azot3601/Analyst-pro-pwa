import { describe, expect, it } from 'vitest';
import { summarizeInterview } from '../../shared/lib/interviewChecker';
import { reservationInterview } from '../../data/cases/reservationCase/interviewScript';

// Проходит скрипт, всегда выбирая первый хороший вопрос — «прилежный» интервьюер.
function playGoodPath() {
  const unlocked = new Set<string>();
  const good: boolean[] = [];
  let nodeId: string | null = reservationInterview.startNodeId;
  const guard = new Set<string>();
  while (nodeId && !guard.has(nodeId)) {
    guard.add(nodeId);
    const node = reservationInterview.nodes.find((n) => n.id === nodeId)!;
    const option = node.questionOptions.find((o) => o.isGoodQuestion)!;
    option.unlocksRequirementIds.forEach((id) => unlocked.add(id));
    good.push(option.isGoodQuestion);
    nodeId = option.nextNodeId;
  }
  return { unlocked, good };
}

describe('summarizeInterview', () => {
  it('good path covers all must-have requirements with 100% quality', () => {
    const { unlocked, good } = playGoodPath();
    const summary = summarizeInterview(reservationInterview, unlocked, good);
    expect(summary.mustMissed).toEqual([]);
    expect(summary.ok).toBe(true);
    expect(summary.qualityPercent).toBe(100);
  });

  it('flags a missed must-have requirement', () => {
    const summary = summarizeInterview(reservationInterview, new Set(['r-window']), [true]);
    expect(summary.ok).toBe(false);
    expect(summary.mustMissed.length).toBeGreaterThan(0);
  });

  it('computes question quality from good/bad choices', () => {
    const summary = summarizeInterview(reservationInterview, new Set(), [true, false, false, true]);
    expect(summary.goodQuestions).toBe(2);
    expect(summary.badQuestions).toBe(2);
    expect(summary.qualityPercent).toBe(50);
  });
});
