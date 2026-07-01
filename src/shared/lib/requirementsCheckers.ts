import type { ApiQuestCheckResult, ApiQuestDiagnostic } from './apiQuestCheckers';

// Детерминированные офлайн-чекеры модуля «Анализ требований».
// Переиспользуют контракт диагностик ApiQuestDiagnostic[] / ApiQuestCheckResult,
// поэтому рендерятся тем же DiagnosticPanel, что и API-квест.
// Принцип оценки открытых задач — структурированные конструкторы + ключ-эталон +
// чек-листы с дистракторами (см. docs/learning-architecture.md).

const diagnostic = (
  code: string,
  expected: unknown,
  actual: unknown,
  why: string,
  fix: string,
  knowledgeId: string,
  severity: ApiQuestDiagnostic['severity'] = 'error',
  extras: Pick<ApiQuestDiagnostic, 'details' | 'consequences' | 'example'> = {}
): ApiQuestDiagnostic => ({
  code,
  severity,
  expected: String(expected),
  actual: String(actual),
  why,
  fix,
  knowledgeId,
  characterLine:
    severity === 'warning'
      ? 'Софи: формулировка скользкая — давай уточним границы.'
      : 'Софи: ты близко. Уточни разбор — и проверим заново.',
  ...extras
});

const finish = (diagnostics: ApiQuestDiagnostic[]): ApiQuestCheckResult => ({
  ok: diagnostics.every((item) => item.severity !== 'error'),
  diagnostics
});

// ---------------------------------------------------------------------------
// Задача 1. Классификация утверждений из «грязного» брифа.
// ---------------------------------------------------------------------------

export type StatementLabel =
  | 'functional'
  | 'nfr'
  | 'assumption'
  | 'ambiguity'
  | 'out-of-scope';

export const statementLabels: Record<StatementLabel, string> = {
  functional: 'Функц. требование',
  nfr: 'Нефункц. требование (НФТ)',
  assumption: 'Допущение',
  ambiguity: 'Неоднозначность (нужен вопрос)',
  'out-of-scope': 'Вне scope'
};

export type StatementSpec = {
  id: string;
  text: string;
  label: StatementLabel;
  rationale: string;
};

export type ClassificationRule = { statements: StatementSpec[] };
export type ClassificationSubmission = Record<string, StatementLabel | ''>;

export function checkClassification(
  submission: ClassificationSubmission,
  rule: ClassificationRule
): ApiQuestCheckResult {
  const unanswered = rule.statements.filter((spec) => !submission[spec.id]);
  if (unanswered.length) {
    return finish([
      diagnostic(
        'requirements-unclassified',
        'все утверждения размечены',
        `без метки: ${unanswered.length}`,
        'Аналитик не оставляет утверждение без статуса — иначе оно молча уйдёт в реализацию или потеряется.',
        'Поставь метку каждому утверждению из брифа.',
        'requirements',
        'error',
        { details: unanswered.map((spec) => `«${spec.text}»`) }
      )
    ]);
  }

  const mismatches = rule.statements.filter((spec) => submission[spec.id] !== spec.label);
  if (!mismatches.length) return finish([]);

  return finish(
    mismatches.map((spec) =>
      diagnostic(
        'requirements-misclassified',
        statementLabels[spec.label],
        statementLabels[submission[spec.id] as StatementLabel] ?? 'не размечено',
        `«${spec.text}» — ${spec.rationale}`,
        `Поставь метку «${statementLabels[spec.label]}».`,
        'requirements'
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Задача 2. Выбор уточняющих вопросов (мульти-выбор с дистракторами).
// ---------------------------------------------------------------------------

export type QuestionOption = {
  id: string;
  text: string;
  required: boolean;
  // Почему вопрос лишний/вредный — для дистракторов.
  noise?: string;
};

export type QuestionsRule = { options: QuestionOption[] };
export type QuestionsSubmission = string[];

export function checkQuestions(
  submission: QuestionsSubmission,
  rule: QuestionsRule
): ApiQuestCheckResult {
  const selected = new Set(submission);
  const diagnostics: ApiQuestDiagnostic[] = [];

  const missing = rule.options.filter((option) => option.required && !selected.has(option.id));
  if (missing.length) {
    diagnostics.push(
      diagnostic(
        'requirements-missing-questions',
        'заданы все ключевые уточняющие вопросы',
        `не выбрано: ${missing.length}`,
        'Без этих вопросов остаётся неоднозначность, которая всплывёт уже на интеграции или приёмке.',
        'Добавь обязательные уточняющие вопросы.',
        'elicitation',
        'error',
        { details: missing.map((option) => `«${option.text}»`) }
      )
    );
  }

  const noise = rule.options.filter((option) => !option.required && selected.has(option.id));
  if (noise.length) {
    diagnostics.push(
      diagnostic(
        'requirements-noise-questions',
        'только релевантные вопросы',
        `шумовых выбрано: ${noise.length}`,
        'Лишние или наводящие вопросы тратят время стейкхолдера и уводят анализ в сторону.',
        'Сними выбор с нерелевантных вопросов.',
        'elicitation',
        'warning',
        { details: noise.map((option) => `«${option.text}» — ${option.noise ?? 'вне фокуса задачи'}`) }
      )
    );
  }

  return finish(diagnostics);
}

// ---------------------------------------------------------------------------
// Задача 3. User Story + критерии приёмки (Gherkin) + edge/негативные кейсы.
// ---------------------------------------------------------------------------

export type Clause = { id: string; text: string };

export type StoryRule = {
  roleId: string;
  roleOptions: Array<{ id: string; text: string }>;
  requiredClauseIds: string[];
  edgeRequiredIds: string[];
  clausePool: Clause[];
  edgePool: Clause[];
};

export type StorySubmission = {
  roleId: string;
  clauseIds: string[];
  edgeCaseIds: string[];
};

const clauseText = (pool: Clause[], id: string) => pool.find((item) => item.id === id)?.text ?? id;

export function checkStory(submission: StorySubmission, rule: StoryRule): ApiQuestCheckResult {
  const diagnostics: ApiQuestDiagnostic[] = [];

  if (submission.roleId !== rule.roleId) {
    const expected = rule.roleOptions.find((option) => option.id === rule.roleId)?.text ?? rule.roleId;
    const actual = rule.roleOptions.find((option) => option.id === submission.roleId)?.text ?? 'роль не выбрана';
    diagnostics.push(
      diagnostic(
        'story-role',
        expected,
        actual,
        'Роль в user story — это тот, кто получает ценность. Неверная роль смещает весь смысл истории.',
        `Выбери роль «${expected}».`,
        'user-story'
      )
    );
  }

  const selectedClauses = new Set(submission.clauseIds);
  const missingClauses = rule.requiredClauseIds.filter((id) => !selectedClauses.has(id));
  const distractorClauses = submission.clauseIds.filter(
    (id) => !rule.requiredClauseIds.includes(id)
  );
  if (missingClauses.length || distractorClauses.length) {
    diagnostics.push(
      diagnostic(
        'story-acceptance-criteria',
        'критерии приёмки покрывают happy path и проверяемы',
        `не хватает: ${missingClauses.length}, лишних: ${distractorClauses.length}`,
        'Критерии приёмки задают, что значит «готово». Пропуск делает историю непроверяемой, лишние клаузы — неоднозначной.',
        'Собери Given/When/Then только из нужных клауз.',
        'acceptance-criteria',
        'error',
        {
          details: [
            ...missingClauses.map((id) => `Добавь: «${clauseText(rule.clausePool, id)}»`),
            ...distractorClauses.map((id) => `Убери: «${clauseText(rule.clausePool, id)}»`)
          ]
        }
      )
    );
  }

  const missingEdges = rule.edgeRequiredIds.filter((id) => !submission.edgeCaseIds.includes(id));
  const distractorEdges = submission.edgeCaseIds.filter((id) => !rule.edgeRequiredIds.includes(id));
  if (missingEdges.length || distractorEdges.length) {
    diagnostics.push(
      diagnostic(
        'story-edge-cases',
        'покрыты только релевантные edge/негативные сценарии',
        `не покрыто: ${missingEdges.length}, лишних: ${distractorEdges.length}`,
        'Сильную историю отличает покрытие негативных и граничных сценариев — но «всё подряд» так же вредно, как пропуск.',
        'Отметь обязательные edge/негативные кейсы и сними нерелевантные.',
        'acceptance-criteria',
        'error',
        {
          details: [
            ...missingEdges.map((id) => `Добавь: «${clauseText(rule.edgePool, id)}»`),
            ...distractorEdges.map((id) => `Убери: «${clauseText(rule.edgePool, id)}»`)
          ]
        }
      )
    );
  }

  return finish(diagnostics);
}
