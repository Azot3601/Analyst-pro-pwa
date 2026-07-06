import { describe, expect, it } from 'vitest';
import { checkDefect } from '../../shared/lib/defectChecker';
import { reservationDefects } from '../../data/cases/reservationCase/defects';

const byId = (id: string) => reservationDefects.find((d) => d.id === id)!;

describe('checkDefect', () => {
  it('accepts correct category and on-topic answer', () => {
    const ex = byId('d1');
    const result = checkDefect(ex, 'unverifiable', 'Нет метрики, непонятно за сколько секунд');
    expect(result.ok).toBe(true);
  });

  it('rejects wrong category even with on-topic keywords', () => {
    const ex = byId('d1');
    const result = checkDefect(ex, 'incomplete', 'нет метрики');
    expect(result.ok).toBe(false);
    expect(result.categoryOk).toBe(false);
    expect(result.keywordOk).toBe(true);
  });

  it('rejects right category with empty/off-topic answer', () => {
    const ex = byId('d2');
    const result = checkDefect(ex, 'non-atomic', 'не знаю');
    expect(result.ok).toBe(false);
    expect(result.keywordOk).toBe(false);
  });

  it('every defect exercise is self-consistent (category + a keyword)', () => {
    for (const ex of reservationDefects) {
      const answer = ex.keywords[0];
      expect(checkDefect(ex, ex.category, answer).ok, ex.id).toBe(true);
    }
  });
});
