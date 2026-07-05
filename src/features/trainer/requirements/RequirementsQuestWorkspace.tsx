import {
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  ListChecks,
  ScrollText,
  Sparkles
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  requirementsTasks,
  type RequirementsTask
} from '../../../data/requirementsQuest';
import { getProgress, markTaskSolved, recordReview } from '../../progress/progressDb';
import { requirementsConceptId } from '../../practice/reviewEngine';
import {
  checkClassification,
  checkQuestions,
  checkStory,
  statementLabels,
  type ClassificationSubmission,
  type StatementLabel
} from '../../../shared/lib/requirementsCheckers';
import type { ApiQuestCheckResult } from '../../../shared/lib/apiQuestCheckers';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';
import { playError, playHint, playSuccess } from '../../../shared/lib/audio';

const labelOptions = Object.entries(statementLabels) as Array<[StatementLabel, string]>;

const checkboxClass =
  'mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-ink text-electric focus:ring-electric/40';
const optionRowClass =
  'flex cursor-pointer items-start gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200 transition hover:bg-white/[0.06]';

function DiagnosticPanel({ result }: { result?: ApiQuestCheckResult }) {
  if (!result) {
    return (
      <p role="status" aria-live="polite" className="text-sm text-slate-400">
        Проверка ещё не запускалась.
      </p>
    );
  }
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-atomic="true">
      {result.ok && (
        <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={17} /> Анализ принят
          </div>
          <p className="mt-1 text-slate-200">Решение совпало с эталоном аналитика.</p>
        </div>
      )}
      {result.diagnostics.map((item, index) => (
        <article
          key={`${item.code}-${index}`}
          className={`rounded-md border p-3 text-sm ${
            item.severity === 'warning' ? 'border-amber/30 bg-amber/10' : 'border-danger/30 bg-danger/10'
          }`}
          role={item.severity === 'error' ? 'alert' : undefined}
        >
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            <CircleAlert size={16} className={item.severity === 'warning' ? 'text-amber' : 'text-danger'} />
            <span>{item.code}</span>
          </div>
          <dl className="mt-2 grid gap-1 text-xs leading-5 text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Ожидалось</dt>
              <dd>{item.expected}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Получено</dt>
              <dd>{item.actual}</dd>
            </div>
          </dl>
          <p className="mt-2 text-slate-300">{item.why}</p>
          {item.details && (
            <div className="mt-2 rounded bg-black/20 p-2">
              <ul className="space-y-1 text-xs text-slate-300">
                {item.details.map((detail) => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-1 text-electric">{item.fix}</p>
          <p className="mt-2 text-xs text-amber">{item.characterLine}</p>
          <Link
            className="mt-2 inline-flex text-xs font-semibold text-electric"
            to={`/knowledge?node=${item.knowledgeId}`}
          >
            Открыть связанное знание
          </Link>
        </article>
      ))}
    </div>
  );
}

function ExpertSolution({ task }: { task: RequirementsTask }) {
  return (
    <div className="rounded-md border border-electric/30 bg-electric/[0.06] p-3 text-sm">
      <div className="flex items-center gap-2 font-semibold text-electric">
        <Sparkles size={16} /> Экспертное решение
      </div>
      <ul className="mt-2 space-y-1 text-slate-200">
        {task.expertSolution.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-300">
        <strong className="text-slate-100">Рефлексия:</strong> {task.reflectionPrompt}
      </p>
    </div>
  );
}

export function RequirementsQuestWorkspace() {
  const [activeId, setActiveId] = useState(requirementsTasks[0].id);
  const task = useMemo(
    () => requirementsTasks.find((item) => item.id === activeId) ?? requirementsTasks[0],
    [activeId]
  );

  // Группируем задачи по бизнес-домену, сохраняя порядок их появления.
  const taskGroups = useMemo(() => {
    const groups = new Map<string, RequirementsTask[]>();
    for (const item of requirementsTasks) {
      const list = groups.get(item.domain) ?? [];
      list.push(item);
      groups.set(item.domain, list);
    }
    return Array.from(groups.entries());
  }, []);

  const [classification, setClassification] = useState<ClassificationSubmission>({});
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [roleId, setRoleId] = useState('');
  const [clauseIds, setClauseIds] = useState<string[]>([]);
  const [edgeIds, setEdgeIds] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState(0);
  const [result, setResult] = useState<ApiQuestCheckResult>();
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  useEffect(() => {
    void getProgress().then((progress) => setSolvedIds(progress.solvedTaskIds));
  }, []);

  // Сброс черновика при смене задачи.
  useEffect(() => {
    setClassification({});
    setQuestionIds([]);
    setRoleId('');
    setClauseIds([]);
    setEdgeIds([]);
    setRevealedHints(0);
    setResult(undefined);
  }, [activeId]);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const runCheck = async () => {
    let check: ApiQuestCheckResult;
    if (task.kind === 'classification') {
      check = checkClassification(classification, task.rule);
    } else if (task.kind === 'questions') {
      check = checkQuestions(questionIds, task.rule);
    } else {
      check = checkStory({ roleId, clauseIds, edgeCaseIds: edgeIds }, task.rule);
    }
    setResult(check);
    if (check.ok) playSuccess();
    else playError();
    void recordReview(requirementsConceptId(task.kind), check.ok).catch(() => undefined);
    if (check.ok && !solvedIds.includes(task.id)) {
      await markTaskSolved(task.id);
      setSolvedIds((prev) => Array.from(new Set([...prev, task.id])));
    }
  };

  const solved = solvedIds.includes(task.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Panel className="h-max" title="Анализ требований">
        <p className="mb-3 text-xs text-slate-400">
          Петля аналитика: элиситация → спецификация. Открытые задачи проверяются детерминированно.
        </p>
        <div className="space-y-4">
          {taskGroups.map(([domain, items]) => {
            const solvedInGroup = items.filter((item) => solvedIds.includes(item.id)).length;
            return (
              <div key={domain}>
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{domain}</span>
                  <span className="text-[10px] text-slate-600">
                    {solvedInGroup}/{items.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveId(item.id)}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                          item.id === activeId
                            ? 'border-electric bg-electric/10 text-electric'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{item.title}</span>
                          {solvedIds.includes(item.id) && <CheckCircle2 size={15} className="text-success" />}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">{item.step}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase">
            <span className="rounded bg-electric/10 px-2 py-1 text-electric">{task.step}</span>
            <span className="rounded bg-white/[0.06] px-2 py-1 text-slate-300">{task.level}</span>
            <span className="rounded bg-white/[0.06] px-2 py-1 text-slate-300">{task.estimatedFocus}</span>
            {solved && (
              <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-success">
                <CheckCircle2 size={13} /> решено
              </span>
            )}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">{task.title}</h2>
          <p className="mt-1 text-sm text-slate-300">{task.learningGoal}</p>

          <div className="mt-3 rounded-md border border-white/10 bg-ink/60 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ScrollText size={14} /> Бриф от стейкхолдера
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-200">{task.brief}</p>
          </div>
          <p className="mt-3 text-sm text-slate-300">{task.taskText}</p>
        </Panel>

        <Panel title="Рабочая область">
          {task.kind === 'classification' && (
            <ul className="space-y-2">
              {task.rule.statements.map((statement) => (
                <li
                  key={statement.id}
                  className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm text-slate-200">{statement.text}</span>
                  <select
                    aria-label={`Метка для: ${statement.text}`}
                    value={classification[statement.id] ?? ''}
                    onChange={(event) =>
                      setClassification((prev) => ({
                        ...prev,
                        [statement.id]: event.target.value as StatementLabel
                      }))
                    }
                    className="rounded-md border border-white/10 bg-ink px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-electric/60"
                  >
                    <option value="">— выбрать —</option>
                    {labelOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}

          {task.kind === 'questions' && (
            <ul className="space-y-2">
              {task.rule.options.map((option) => (
                <li key={option.id}>
                  <label className={optionRowClass}>
                    <input
                      type="checkbox"
                      className={checkboxClass}
                      checked={questionIds.includes(option.id)}
                      onChange={() => setQuestionIds((prev) => toggle(prev, option.id))}
                    />
                    <span>{option.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {task.kind === 'story' && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-electric">Роль (кто получает ценность)</p>
                <div className="flex flex-wrap gap-2">
                  {task.rule.roleOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition ${
                        roleId === option.id
                          ? 'border-electric bg-electric/10 text-electric'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="story-role"
                        className="sr-only"
                        checked={roleId === option.id}
                        onChange={() => setRoleId(option.id)}
                      />
                      {option.text}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-electric">
                  <ListChecks size={14} /> Критерии приёмки (Given/When/Then)
                </p>
                <ul className="space-y-2">
                  {task.rule.clausePool.map((clause) => (
                    <li key={clause.id}>
                      <label className={optionRowClass}>
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={clauseIds.includes(clause.id)}
                          onChange={() => setClauseIds((prev) => toggle(prev, clause.id))}
                        />
                        <span>{clause.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-electric">Edge / негативные сценарии</p>
                <ul className="space-y-2">
                  {task.rule.edgePool.map((edge) => (
                    <li key={edge.id}>
                      <label className={optionRowClass}>
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={edgeIds.includes(edge.id)}
                          onChange={() => setEdgeIds((prev) => toggle(prev, edge.id))}
                        />
                        <span>{edge.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={() => void runCheck()}>Проверить</Button>
            {revealedHints < task.hints.length && (
              <Button variant="soft" onClick={() => { setRevealedHints((value) => value + 1); playHint(); }}>
                <Lightbulb size={15} /> Подсказка ({revealedHints}/{task.hints.length})
              </Button>
            )}
          </div>

          {revealedHints > 0 && (
            <ul className="mt-3 space-y-2">
              {task.hints.slice(0, revealedHints).map((hint) => (
                <li key={hint.id} className="rounded-md border border-amber/20 bg-amber/[0.06] p-2 text-sm text-slate-200">
                  <span className="text-xs font-semibold text-amber">{hint.title}: </span>
                  {hint.text}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Обратная связь">
          <DiagnosticPanel result={result} />
          {(solved || result?.ok) && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-slate-300">{task.explanation}</p>
              <ExpertSolution task={task} />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
