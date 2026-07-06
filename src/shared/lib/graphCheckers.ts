import type { ApiQuestCheckResult, ApiQuestDiagnostic } from './apiQuestCheckers';

// Структурные чекеры диаграмм (ERD, BPMN, use case). Сравниваем ГРАФ, а не
// координаты узлов и не строки: множества сущностей/полей/связей и достижимость.
// Тот же контракт диагностик, что у apiQuestCheckers/requirementsCheckers.

const diag = (
  code: string,
  why: string,
  fix: string,
  details?: string[]
): ApiQuestDiagnostic => ({
  code,
  severity: 'error',
  expected: 'структура совпадает с эталоном',
  actual: 'есть расхождения',
  why,
  fix,
  knowledgeId: 'erd',
  characterLine: 'Софи: сверь структуру — сущности, поля и кардинальности связей.',
  ...(details ? { details } : {})
});

const finish = (diagnostics: ApiQuestDiagnostic[]): ApiQuestCheckResult => ({
  ok: diagnostics.every((d) => d.severity !== 'error'),
  diagnostics
});

const norm = (value: string) => value.trim().toLowerCase();

// ── ERD ─────────────────────────────────────────────────────────────────────

export type Cardinality = '1-1' | '1-N' | 'N-N';
export type ErdField = { name: string; type: string };
export type ErdEntity = { name: string; fields: ErdField[] };
export type ErdRelation = { from: string; to: string; cardinality: Cardinality };
export type ErdGraph = { entities: ErdEntity[]; relations: ErdRelation[] };

const pairKey = (a: string, b: string) => [norm(a), norm(b)].sort().join('|');

export function compareErdGraph(submission: ErdGraph, reference: ErdGraph): ApiQuestCheckResult {
  const diagnostics: ApiQuestDiagnostic[] = [];

  // 1. Сущности и их поля.
  for (const refEntity of reference.entities) {
    const subEntity = submission.entities.find((e) => norm(e.name) === norm(refEntity.name));
    if (!subEntity) {
      diagnostics.push(
        diag('erd-missing-entity', `Нет сущности «${refEntity.name}».`, `Добавь сущность «${refEntity.name}».`)
      );
      continue;
    }
    const missingFields = refEntity.fields.filter(
      (rf) => !subEntity.fields.some((sf) => norm(sf.name) === norm(rf.name))
    );
    if (missingFields.length) {
      diagnostics.push(
        diag(
          'erd-missing-field',
          `В «${refEntity.name}» не хватает полей.`,
          'Добавь недостающие поля в формате имя: тип.',
          missingFields.map((f) => `${refEntity.name}.${f.name}: ${f.type}`)
        )
      );
    }
    const wrongType = refEntity.fields
      .map((rf) => ({ rf, sf: subEntity.fields.find((sf) => norm(sf.name) === norm(rf.name)) }))
      .filter(({ rf, sf }) => sf && norm(sf.type) !== norm(rf.type));
    if (wrongType.length) {
      diagnostics.push(
        diag(
          'erd-wrong-type',
          `Неверный тип поля в «${refEntity.name}».`,
          'Исправь тип поля под эталон.',
          wrongType.map(({ rf }) => `${refEntity.name}.${rf.name} должно быть ${rf.type}`)
        )
      );
    }
  }

  // 2. Связи: сначала наличие пары, затем кардинальность и направление 1-N.
  for (const refRel of reference.relations) {
    const subRel = submission.relations.find((r) => pairKey(r.from, r.to) === pairKey(refRel.from, refRel.to));
    if (!subRel) {
      diagnostics.push(
        diag(
          'erd-missing-relation',
          `Нет связи между «${refRel.from}» и «${refRel.to}».`,
          `Проведи связь ${refRel.from} ${refRel.cardinality} ${refRel.to}.`
        )
      );
      continue;
    }
    if (subRel.cardinality !== refRel.cardinality) {
      diagnostics.push(
        diag(
          'erd-wrong-cardinality',
          `Кардинальность связи «${refRel.from}»–«${refRel.to}» неверна.`,
          `Ожидалось ${refRel.cardinality} (получено ${subRel.cardinality}).`
        )
      );
      continue;
    }
    // Для 1-N важна сторона «один» (from). Для 1-1 и N-N направление симметрично.
    if (refRel.cardinality === '1-N' && norm(subRel.from) !== norm(refRel.from)) {
      diagnostics.push(
        diag(
          'erd-wrong-direction',
          `Направление 1-N перепутано между «${refRel.from}» и «${refRel.to}».`,
          `Сторона «один» — это «${refRel.from}» (у одного ${refRel.from} много ${refRel.to}).`
        )
      );
    }
  }

  // 3. Лишние связи — предупреждение, не блокирует.
  const refPairs = new Set(reference.relations.map((r) => pairKey(r.from, r.to)));
  const extras = submission.relations.filter((r) => !refPairs.has(pairKey(r.from, r.to)));
  if (extras.length) {
    diagnostics.push({
      ...diag(
        'erd-extra-relation',
        'Есть лишние связи, которых нет в эталоне.',
        'Убери связи, не следующие из модели.',
        extras.map((r) => `${r.from} — ${r.to}`)
      ),
      severity: 'warning'
    });
  }

  return finish(diagnostics);
}
