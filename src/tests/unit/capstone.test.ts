import { describe, expect, it } from 'vitest';
import {
  capstoneClassification,
  capstoneContract,
  capstoneSql
} from '../../data/capstone';
import { checkClassification, checkQuestions } from '../../shared/lib/requirementsCheckers';

describe('capstone data is internally solvable', () => {
  it('reference classification passes the checker', () => {
    const key = Object.fromEntries(capstoneClassification.statements.map((s) => [s.id, s.label]));
    expect(checkClassification(key, capstoneClassification).ok).toBe(true);
  });

  it('reference contract selection is clean (all required, no noise)', () => {
    const required = capstoneContract.options.filter((o) => o.required).map((o) => o.id);
    const result = checkQuestions(required, capstoneContract);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('SQL scaffold is not the ready answer', () => {
    expect(capstoneSql.starterSql).not.toBe(capstoneSql.solutionSql);
    expect(capstoneSql.solutionSql).toContain("event_type = 'accepted'");
  });
});
