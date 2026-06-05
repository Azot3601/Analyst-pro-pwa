export type SqlCell = string | number | boolean | null;
export type SqlRow = Record<string, SqlCell>;

const normalize = (rows: SqlRow[], orderMatters = false) => {
  const normalized = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [key, value === undefined ? null : value])
    )
  );

  return orderMatters
    ? normalized
    : normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
};

export function compareSqlRows(actual: SqlRow[], expected: SqlRow[], orderMatters = false) {
  const actualNormalized = normalize(actual, orderMatters);
  const expectedNormalized = normalize(expected, orderMatters);
  const ok = JSON.stringify(actualNormalized) === JSON.stringify(expectedNormalized);

  return {
    ok,
    message: ok
      ? 'Результат совпадает с эталоном.'
      : 'Результат отличается от эталона. Проверьте фильтры, JOIN и выбранные колонки.',
    actual: actualNormalized,
    expected: expectedNormalized
  };
}
