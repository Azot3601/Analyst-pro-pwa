import { describe, expect, it } from 'vitest';
import { computeSkillMatrix } from '../../features/progress/skillMatrix';
import { defaultProgress } from '../../features/progress/progressDb';

describe('computeSkillMatrix', () => {
  it('is all zero on fresh progress', () => {
    const matrix = computeSkillMatrix(defaultProgress);
    expect(matrix.every((area) => area.percent === 0)).toBe(true);
    // Все области BABOK представлены и имеют привязанные модули.
    expect(matrix.length).toBe(4);
    expect(matrix.every((area) => area.modules.length > 0)).toBe(true);
  });

  it('aggregates a solved constructor into its BABOK area', () => {
    const progress = { ...defaultProgress, solvedTaskIds: ['interview-reservation'] };
    const elicitation = computeSkillMatrix(progress).find((a) => a.id === 'elicitation')!;
    // Интервью = 100%, Требования = 0% → среднее 50%.
    expect(elicitation.percent).toBe(50);
  });
});
