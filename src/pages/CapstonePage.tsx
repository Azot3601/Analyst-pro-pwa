import { CheckCircle2, Database, FileText, ListChecks, Lock, PlayCircle, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  capstoneBrief,
  capstoneClassification,
  capstoneContract,
  capstoneGoal,
  capstoneSql
} from '../data/capstone';
import { markTaskSolved, recordReview } from '../features/progress/progressDb';
import { runSql } from '../features/trainer/useSqlRunner';
import { compareSqlRows, type SqlRow } from '../shared/lib/sqlChecker';
import {
  checkClassification,
  checkQuestions,
  statementLabels,
  type ClassificationSubmission,
  type StatementLabel
} from '../shared/lib/requirementsCheckers';
import { playError, playSuccess } from '../shared/lib/audio';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

const CAPSTONE_ID = 'capstone-reconciliation';
const labelOptions = Object.entries(statementLabels) as Array<[StatementLabel, string]>;

// ── Стадия 1: требования ────────────────────────────────────────────────────
function RequirementsStage({ onPass }: { onPass: () => void }) {
  const [submission, setSubmission] = useState<ClassificationSubmission>({});
  const [error, setError] = useState<string[]>([]);

  const run = () => {
    const result = checkClassification(submission, capstoneClassification);
    if (result.ok) {
      playSuccess();
      onPass();
    } else {
      playError();
      setError(result.diagnostics.flatMap((d) => d.details ?? [d.why]));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">Размечай каждое утверждение из брифа. Допущения и неоднозначности — отдельно.</p>
      <div className="space-y-2">
        {capstoneClassification.statements.map((statement) => (
          <div key={statement.id} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-200">{statement.text}</span>
            <select
              value={submission[statement.id] ?? ''}
              onChange={(event) =>
                setSubmission((prev) => ({ ...prev, [statement.id]: event.target.value as StatementLabel }))
              }
              className="shrink-0 rounded-md border border-white/15 bg-graphite px-2 py-1.5 text-sm text-slate-100"
            >
              <option value="">— выбери тип —</option>
              {labelOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {error.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-danger/30 bg-danger/[0.06] p-3 text-xs text-danger">
          {error.map((line, index) => (
            <li key={index}>• {line}</li>
          ))}
        </ul>
      )}
      <Button onClick={run}>Проверить разбор</Button>
    </div>
  );
}

// ── Стадия 2: контракт API ──────────────────────────────────────────────────
function ContractStage({ onPass }: { onPass: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [issues, setIssues] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const run = () => {
    const result = checkQuestions(selected, capstoneContract);
    // Для капстоуна требуем чистый контракт: все нужные поля и без лишних.
    if (result.diagnostics.length === 0) {
      playSuccess();
      onPass();
    } else {
      playError();
      setIssues(result.diagnostics.flatMap((d) => d.details ?? [d.why]));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Ответ эндпоинта <code className="rounded bg-white/10 px-1">GET /orders/undelivered</code> отдаёт список
        недоставленных заказов. Отметь поля, которые обязаны быть в контракте, и не бери лишнее.
      </p>
      <div className="space-y-2">
        {capstoneContract.options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200 hover:bg-white/[0.05]"
          >
            <input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} className="size-4" />
            {option.text}
          </label>
        ))}
      </div>
      {issues.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-danger/30 bg-danger/[0.06] p-3 text-xs text-danger">
          {issues.map((line, index) => (
            <li key={index}>• {line}</li>
          ))}
        </ul>
      )}
      <Button onClick={run}>Проверить контракт</Button>
    </div>
  );
}

// ── Стадия 3: SQL-проверка ──────────────────────────────────────────────────
function SqlStage({ onPass }: { onPass: () => void }) {
  const [value, setValue] = useState(capstoneSql.starterSql);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [rows, setRows] = useState<SqlRow[]>([]);
  const [showHint, setShowHint] = useState(false);

  const run = async () => {
    try {
      const [actual, expected] = await Promise.all([runSql(value), runSql(capstoneSql.solutionSql)]);
      const check = compareSqlRows(actual, expected, false);
      setRows(actual);
      if (check.ok) {
        playSuccess();
        setFeedback({ ok: true, message: `Верно — найдено недоставленных заказов: ${actual.length}.` });
        onPass();
      } else {
        playError();
        setFeedback({ ok: false, message: 'Результат не совпал с эталоном. Проверь условия JOIN и WHERE.' });
      }
    } catch (err) {
      playError();
      setFeedback({ ok: false, message: `SQL не выполнен: ${(err as Error).message}` });
      setRows([]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">{capstoneSql.prompt}</p>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
        rows={9}
        className="w-full rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-electric/40"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={run}>
          <PlayCircle size={16} /> Выполнить
        </Button>
        <Button variant="soft" onClick={() => setShowHint((value) => !value)}>
          Подсказка
        </Button>
      </div>
      {showHint && <p className="rounded-lg border border-amber/20 bg-amber/[0.06] p-3 text-xs text-slate-300">{capstoneSql.hint}</p>}
      {feedback && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            feedback.ok ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400">
              <tr>
                {Object.keys(rows[0]).map((col) => (
                  <th key={col} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-white/5 text-slate-200">
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type StageDef = { key: string; title: string; icon: typeof FileText; concept?: { id: string } };

export function CapstonePage() {
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  const [active, setActive] = useState(0);

  const allDone = done.every(Boolean);

  useEffect(() => {
    if (allDone) {
      void markTaskSolved(CAPSTONE_ID).catch(() => undefined);
      void recordReview('req:classification', true).catch(() => undefined);
      void recordReview('api:contract', true).catch(() => undefined);
      void recordReview('sql:капстоун', true).catch(() => undefined);
    }
  }, [allDone]);

  const pass = (index: number) => {
    setDone((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setActive((current) => (index === current ? Math.min(current + 1, 3) : current));
  };

  const stages = useMemo<StageDef[]>(
    () => [
      { key: 'req', title: 'Требования: разбор брифа', icon: ListChecks },
      { key: 'contract', title: 'Контракт API: поля ответа', icon: FileText },
      { key: 'sql', title: 'SQL: проверка данных', icon: Database }
    ],
    []
  );

  // brief — нулевая стадия (только чтение), поэтому индексы стадий с проверкой: 0..2 → done[1..3]
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Panel className="border-electric/15">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-electric/15 text-electric">
            <Trophy size={20} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Капстоун — сквозной кейс</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Одна фича через всю петлю аналитика: бриф → требования → контракт → SQL. Момент, когда навыки
              складываются в профессию.
            </p>
          </div>
        </div>
      </Panel>

      {/* Стадия 0: бриф */}
      <Panel title="Бриф от заказчика">
        <div className="flex gap-3">
          <FileText size={18} className="mt-0.5 shrink-0 text-mentor" />
          <div>
            <p className="text-sm leading-6 text-slate-200">{capstoneBrief}</p>
            <p className="mt-3 rounded-lg border border-electric/20 bg-electric/[0.05] p-3 text-sm text-slate-300">
              <span className="font-semibold text-electric">Цель фичи:</span> {capstoneGoal}
            </p>
          </div>
        </div>
      </Panel>

      {stages.map((stage, index) => {
        const isDone = done[index];
        const isActive = index === active;
        const isLocked = index > 0 && !done[index - 1];
        const Icon = stage.icon;
        return (
          <Panel key={stage.key} className={isDone ? 'border-success/25' : isActive ? 'border-electric/25' : ''}>
            <button
              className="flex w-full items-center gap-3 text-left"
              onClick={() => !isLocked && setActive(isActive ? -1 : index)}
              disabled={isLocked}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-xl ${
                  isDone ? 'bg-success/15 text-success' : isLocked ? 'bg-white/5 text-slate-600' : 'bg-electric/15 text-electric'
                }`}
              >
                {isDone ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={15} /> : <Icon size={16} />}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-100">
                  Шаг {index + 1}. {stage.title}
                </span>
                <span className="block text-xs text-slate-500">
                  {isDone ? 'пройдено' : isLocked ? 'откроется после предыдущего шага' : 'в работе'}
                </span>
              </span>
            </button>
            {isActive && !isLocked && (
              <div className="mt-4 border-t border-white/10 pt-4">
                {stage.key === 'req' && <RequirementsStage onPass={() => pass(0)} />}
                {stage.key === 'contract' && <ContractStage onPass={() => pass(1)} />}
                {stage.key === 'sql' && <SqlStage onPass={() => pass(2)} />}
              </div>
            )}
          </Panel>
        );
      })}

      {allDone && (
        <Panel className="border-success/30 bg-success/[0.06]">
          <div className="flex items-start gap-3">
            <Trophy size={22} className="mt-0.5 shrink-0 text-amber" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Капстоун пройден 🎉</h2>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                Ты провёл одну фичу от разговора с заказчиком до проверки данных: классифицировал требования,
                собрал контракт API и написал SQL-проверку. Это и есть работа системного аналитика в миниатюре.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/practice">
                  <Button variant="soft">Закрепить в Практике</Button>
                </Link>
                <Link to="/progress">
                  <Button variant="soft">Посмотреть прогресс</Button>
                </Link>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
