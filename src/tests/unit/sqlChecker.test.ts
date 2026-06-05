import { describe, expect, it } from 'vitest';
import { compareSqlRows } from '../../shared/lib/sqlChecker';

describe('compareSqlRows', () => {
  it('compares rows without order by default', () => {
    const result = compareSqlRows([{ id: 2 }, { id: 1 }], [{ id: 1 }, { id: 2 }]);
    expect(result.ok).toBe(true);
  });

  it('reports mismatch', () => {
    const result = compareSqlRows([{ id: 1 }], [{ id: 2 }]);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('отличается');
  });

  it('respects row order when requested', () => {
    const result = compareSqlRows([{ id: 2 }, { id: 1 }], [{ id: 1 }, { id: 2 }], true);
    expect(result.ok).toBe(false);
  });

  it('detects extra columns', () => {
    const result = compareSqlRows([{ id: 1, extra: 'x' }], [{ id: 1 }]);
    expect(result.ok).toBe(false);
  });

  it('normalizes undefined cells as null', () => {
    const result = compareSqlRows([{ id: 1, value: undefined as never }], [{ id: 1, value: null }]);
    expect(result.ok).toBe(true);
  });
});
