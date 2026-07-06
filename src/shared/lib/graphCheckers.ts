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

// ── BPMN ──────────────────────────────────────────────────────────────────────

export type BpmnNodeKind = 'start' | 'end' | 'task' | 'gateway-x' | 'gateway-parallel' | 'exception';
export type BpmnNode = { id: string; kind: BpmnNodeKind; label: string };
export type BpmnEdge = { from: string; to: string };
export type BpmnGraph = { nodes: BpmnNode[]; edges: BpmnEdge[] };

export type BpmnReference = {
  task: string;
  // Какие типы узлов обязаны присутствовать.
  requiredKinds: BpmnNodeKind[];
  // Хотя бы одно из этих слов должно встретиться в подписи развилки/исключения.
  exceptionKeywords: string[];
};

const kindLabels: Record<BpmnNodeKind, string> = {
  start: 'старт',
  end: 'конец',
  task: 'задача',
  'gateway-x': 'исключающий шлюз',
  'gateway-parallel': 'параллельный шлюз',
  exception: 'событие-исключение'
};

/** Может ли узел достичь любого end-события по рёбрам (BFS). */
function reachesEnd(startId: string, edges: BpmnEdge[], endIds: Set<string>): boolean {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge.to);
  }
  const seen = new Set<string>([startId]);
  const queue = [startId];
  while (queue.length) {
    const current = queue.shift()!;
    if (endIds.has(current)) return true;
    for (const next of adjacency.get(current) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

export function compareBpmnGraph(submission: BpmnGraph, reference: BpmnReference): ApiQuestCheckResult {
  const diagnostics: ApiQuestDiagnostic[] = [];
  const kinds = new Set(submission.nodes.map((n) => n.kind));

  const missingKinds = reference.requiredKinds.filter((kind) => !kinds.has(kind));
  if (missingKinds.length) {
    diagnostics.push(
      diag(
        'bpmn-missing-node',
        'В процессе не хватает обязательных элементов.',
        'Добавь недостающие узлы из палитры.',
        missingKinds.map((kind) => kindLabels[kind])
      )
    );
  }

  // Достижимость end-события из каждого узла (кроме самих end).
  const endIds = new Set(submission.nodes.filter((n) => n.kind === 'end').map((n) => n.id));
  if (endIds.size > 0) {
    const dangling = submission.nodes.filter((n) => n.kind !== 'end' && !reachesEnd(n.id, submission.edges, endIds));
    if (dangling.length) {
      diagnostics.push(
        diag(
          'bpmn-unreachable-end',
          'Из некоторых узлов нельзя дойти до события «конец».',
          'Соедини узлы так, чтобы каждый путь завершался end-событием.',
          dangling.map((n) => `${kindLabels[n.kind]}${n.label ? ` «${n.label}»` : ''}`)
        )
      );
    }
  }

  // Обязательная ветка-исключение по названию условия (не по координатам).
  const hasException = submission.nodes.some(
    (n) =>
      (n.kind === 'gateway-x' || n.kind === 'exception') &&
      reference.exceptionKeywords.some((kw) => n.label.toLowerCase().includes(kw.toLowerCase()))
  );
  if (!hasException) {
    diagnostics.push(
      diag(
        'bpmn-missing-exception',
        'Нет ветки-исключения, названной по условию из брифа.',
        `Добавь развилку/событие с условием про ${reference.exceptionKeywords[0]} (например «${reference.exceptionKeywords[0]}?»).`
      )
    );
  }

  return finish(diagnostics);
}

// ── Use Case ─────────────────────────────────────────────────────────────────

export type UseCaseDraft = {
  actor: string;
  precondition: string;
  mainFlow: string[];
  alternateFlows: string[];
  postcondition: string;
};

// Грубый список глаголов-маркеров действия (стемы). Не NLP — эвристика атомарности.
const actionVerbStems = [
  'выбира', 'введ', 'ввод', 'нажим', 'провер', 'созда', 'сохран', 'отправ', 'показыва',
  'открыва', 'подтвержда', 'выставля', 'отменя', 'резервир', 'списыва', 'начисл', 'уведомл',
  'запраш', 'получа', 'формир', 'рассчит', 'назнача', 'брониру', 'указыва', 'добавля'
];

const nonEmpty = (list: string[]) => list.map((s) => s.trim()).filter(Boolean);

/** Шаг неатомарен, если в нём соединены несколько действий (союз/несколько глаголов). */
function isNonAtomic(step: string): boolean {
  const text = step.toLowerCase();
  if (/\s(и|затем|потом|после чего)\s/.test(text)) return true;
  const verbs = actionVerbStems.filter((stem) => text.includes(stem));
  return verbs.length > 1;
}

export function checkUseCaseCompleteness(draft: UseCaseDraft): ApiQuestCheckResult {
  const diagnostics: ApiQuestDiagnostic[] = [];
  const main = nonEmpty(draft.mainFlow);
  const alt = nonEmpty(draft.alternateFlows);

  if (!draft.actor.trim()) {
    diagnostics.push(diag('uc-no-actor', 'Не указан актор.', 'Назови действующее лицо (кто получает ценность).'));
  }
  if (!draft.precondition.trim()) {
    diagnostics.push(diag('uc-no-precondition', 'Нет предусловия.', 'Опиши, что должно быть верно до старта сценария.'));
  }
  if (main.length < 3) {
    diagnostics.push(diag('uc-short-main-flow', 'Основной поток слишком короткий.', 'Опиши минимум 3 шага основного сценария.'));
  }
  if (alt.length < 1) {
    diagnostics.push(diag('uc-no-alternate', 'Нет альтернативного/исключительного потока.', 'Добавь хотя бы один альтернативный сценарий (например, ошибку или отказ).'));
  }
  if (!draft.postcondition.trim()) {
    diagnostics.push(diag('uc-no-postcondition', 'Нет постусловия.', 'Опиши результат сценария (что стало верным после).'));
  }

  // Атомарность шагов — предупреждение, не блокирует полноту.
  const nonAtomic = main.filter(isNonAtomic);
  if (nonAtomic.length) {
    diagnostics.push({
      ...diag(
        'uc-non-atomic-step',
        'Некоторые шаги описывают несколько действий сразу.',
        'Разбей шаг на отдельные: один глагол действия на строку.',
        nonAtomic.map((s) => `«${s}»`)
      ),
      severity: 'warning',
      knowledgeId: 'use-story'
    });
  }

  return finish(diagnostics);
}
