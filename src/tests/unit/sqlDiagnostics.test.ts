import { describe, expect, it } from 'vitest';
import { createSqlDiagnostic } from '../../shared/lib/sqlDiagnostics';

describe('createSqlDiagnostic', () => {
  it('reports missing and extra row counts with a learning hint', () => {
    const diagnostic = createSqlDiagnostic({
      actualRows: [{ id: 1001 }, { id: 1002 }, { id: 1003 }],
      expectedRows: [{ id: 1001 }, { id: 1003 }],
      relatedKnowledgeIds: ['sql-where-filter'],
      companionError: 'Ты открыл нужный архив, но прихватил лишние строки. Проверь WHERE.'
    });

    expect(diagnostic.expectedRowCount).toBe(2);
    expect(diagnostic.actualRowCount).toBe(3);
    expect(diagnostic.extraRows).toEqual([{ id: 1002 }]);
    expect(diagnostic.likelyCause).toContain('лишние строки');
    expect(diagnostic.relatedKnowledgeId).toBe('sql-where-filter');
  });

  it('reports missing and extra columns', () => {
    const diagnostic = createSqlDiagnostic({
      actualRows: [{ id: 1, status: 'paid', extra: 'x' }],
      expectedRows: [{ id: 1, status: 'paid', total: 100 }]
    });

    expect(diagnostic.missingColumns).toEqual(['total']);
    expect(diagnostic.extraColumns).toEqual(['extra']);
    expect(diagnostic.softHint).toContain('SELECT');
  });
});
