import type { SqlRow } from './sqlChecker';

export type SqlDiagnostic = {
  expectedRowCount: number;
  actualRowCount: number;
  missingColumns: string[];
  extraColumns: string[];
  missingRows: SqlRow[];
  extraRows: SqlRow[];
  likelyCause: string;
  softHint: string;
  companionHint: string;
  relatedKnowledgeId?: string;
};

const rowKey = (row: SqlRow) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(row)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [key, value ?? null])
    )
  );

const uniqueColumns = (rows: SqlRow[]) => Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).sort();

function diffRows(source: SqlRow[], target: SqlRow[]) {
  const targetCounts = new Map<string, number>();
  target.forEach((row) => {
    const key = rowKey(row);
    targetCounts.set(key, (targetCounts.get(key) ?? 0) + 1);
  });

  return source.filter((row) => {
    const key = rowKey(row);
    const count = targetCounts.get(key) ?? 0;
    if (count <= 0) return true;
    targetCounts.set(key, count - 1);
    return false;
  });
}

export function createSqlDiagnostic({
  actualRows,
  expectedRows,
  orderMatters = false,
  relatedKnowledgeIds = [],
  companionError
}: {
  actualRows: SqlRow[];
  expectedRows: SqlRow[];
  orderMatters?: boolean;
  relatedKnowledgeIds?: string[];
  companionError?: string;
}): SqlDiagnostic {
  const expectedColumns = uniqueColumns(expectedRows);
  const actualColumns = uniqueColumns(actualRows);
  const missingColumns = expectedColumns.filter((column) => !actualColumns.includes(column));
  const extraColumns = actualColumns.filter((column) => !expectedColumns.includes(column));
  const missingRows = diffRows(expectedRows, actualRows).slice(0, 5);
  const extraRows = diffRows(actualRows, expectedRows).slice(0, 5);

  let likelyCause = 'Результат отличается от эталона: нужно проверить выбранные колонки, условия и связи таблиц.';
  let softHint = 'Сравни формулировку задачи с SELECT, WHERE, JOIN, GROUP BY и ORDER BY в своём запросе.';

  if (missingColumns.length || extraColumns.length) {
    likelyCause = 'Набор колонок не совпал с ожидаемым результатом.';
    softHint = 'Проверь SELECT и alias: тренажёр сравнивает не только значения, но и имена колонок.';
  } else if (actualRows.length > expectedRows.length) {
    likelyCause = 'Запрос вернул лишние строки. Часто это означает слабый WHERE, неверный HAVING или слишком широкий JOIN.';
    softHint = 'Ты открыл нужный архив, но прихватил лишние строки. Проверь фильтры и условия соединения.';
  } else if (actualRows.length < expectedRows.length) {
    likelyCause = 'Запрос потерял строки. Часто причина в INNER JOIN вместо LEFT JOIN или слишком жёстком фильтре.';
    softHint = 'Здесь могут быть потерянные записи. Проверь, не отрезал ли запрос строки без связанных фактов.';
  } else if (orderMatters && (missingRows.length || extraRows.length)) {
    likelyCause = 'Количество строк и колонки похожи, но порядок или значения отличаются.';
    softHint = 'Колонки сошлись, но строки пляшут. Проверь ORDER BY и условия расчёта.';
  }

  return {
    expectedRowCount: expectedRows.length,
    actualRowCount: actualRows.length,
    missingColumns,
    extraColumns,
    missingRows,
    extraRows,
    likelyCause,
    softHint,
    companionHint: companionError ?? 'Софи кивает на условие запроса: где-то там притаилась ошибка.',
    relatedKnowledgeId: relatedKnowledgeIds[0]
  };
}
