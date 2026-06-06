import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import CodeMirror from '@uiw/react-codemirror';
import {
  Check,
  ChevronDown,
  Database,
  Flame,
  Layers,
  Lock,
  PlayCircle,
  ScrollText,
  Send,
  ShieldAlert,
  Sparkles,
  Table2,
  Target,
  Trophy
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getNextRankForXp,
  getRankForXp,
  getSqlQuestChapter,
  isSqlQuestLessonUnlocked,
  sqlQuestChapters,
  sqlQuestLessons,
  type SqlQuestLesson,
  type SqlQuestPathType
} from '../data/sqlQuest';
import { sqlTablePreviews, type SqlTablePreview } from '../data/sqlSeed';
import { tasks } from '../data/tasks';
import {
  defaultProgress,
  defaultSqlQuestProgress,
  getProgress,
  recordSqlQuestAttempt,
  revealSqlQuestHint,
  setSqlQuestLocation,
  solveSqlQuestLesson,
  type SqlQuestProgress
} from '../features/progress/progressDb';
import { runSql } from '../features/trainer/useSqlRunner';
import type { UserProgress } from '../entities/schemas';
import { simulateApiRequest } from '../shared/lib/apiSimulator';
import { createSqlDiagnostic, type SqlDiagnostic } from '../shared/lib/sqlDiagnostics';
import { formatJson, validateJsonSchema } from '../shared/lib/jsonTools';
import { compareSqlRows, type SqlRow } from '../shared/lib/sqlChecker';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

type CheckState = 'idle' | 'success' | 'error';

type SqlFeedback = {
  state: CheckState;
  message: string;
  diagnostic?: SqlDiagnostic;
  xpAwarded?: number;
};

const domainLabels: Record<string, string> = {
  sql: 'SQL Quest',
  rest: 'REST API',
  json: 'JSON',
  openapi: 'OpenAPI',
  integration: 'Интеграции'
};

const pathLabels: Record<SqlQuestPathType, string> = {
  trial: 'Путь Испытания',
  case: 'Путь Дела'
};

const pathDescriptions: Record<SqlQuestPathType, string> = {
  trial: 'Точность синтаксиса и чистый SQL-приём.',
  case: 'Контекст, риск неверной трактовки и смысл запроса.'
};

function DataTable({ columns, rows }: { columns: string[]; rows: SqlRow[] }) {
  return (
    <div className="overflow-auto rounded-md border border-white/10">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-white/[0.06] text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-white/10 px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white/[0.025]">
              {columns.map((column) => (
                <td key={column} className="border-b border-white/5 px-3 py-2 font-mono text-slate-300">
                  {row[column] === null ? <span className="text-slate-500">NULL</span> : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablePreview({ table }: { table: SqlTablePreview }) {
  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Table2 size={16} className="text-electric" />
            {table.name}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">{table.description}</p>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-400">{table.rows.length} строк</span>
      </div>
      <DataTable columns={table.columns} rows={table.rows as SqlRow[]} />
    </div>
  );
}

function RankCard({ quest }: { quest: SqlQuestProgress }) {
  const rank = getRankForXp(quest.xp);
  const nextRank = getNextRankForXp(quest.xp);
  const progressToNext = nextRank
    ? Math.round(((quest.xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;

  return (
    <div className="rounded-lg border border-amber/20 bg-amber/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-amber">Спутник архива</div>
          <div className="mt-1 text-lg font-bold text-slate-50">{rank.title}</div>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            XP: {quest.xp}. Уровень {quest.level}. Следующая ступень держится на точности запросов.
          </p>
        </div>
        <Sparkles className="text-amber" />
      </div>
      <div className="mt-3 h-2 rounded-full bg-black/30">
        <div className="h-2 rounded-full bg-amber" style={{ width: `${progressToNext}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{rank.title}</span>
        <span>{nextRank?.title ?? 'верхняя ступень'}</span>
      </div>
    </div>
  );
}

function QuestLessonList({
  quest,
  currentLessonId,
  onSelect
}: {
  quest: SqlQuestProgress;
  currentLessonId: string;
  onSelect: (lesson: SqlQuestLesson) => void;
}) {
  return (
    <div className="space-y-4">
      {sqlQuestChapters.map((chapter) => {
        const chapterLessons = sqlQuestLessons.filter((lesson) => lesson.chapterId === chapter.id);
        const chapterSolved = chapterLessons.filter((lesson) => quest.solvedSqlLessonIds.includes(lesson.id)).length;

        return (
          <div key={chapter.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-electric">Глава {chapter.order}</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">{chapter.title}</div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{chapter.subtitle}</p>
              </div>
              <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-300">
                {chapterSolved}/{chapterLessons.length}
              </span>
            </div>

            {(['trial', 'case'] as SqlQuestPathType[]).map((pathType) => (
              <div key={pathType} className="mb-3 last:mb-0">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {pathLabels[pathType]}
                </div>
                <div className="space-y-2">
                  {chapterLessons
                    .filter((lesson) => lesson.pathType === pathType)
                    .map((lesson) => {
                      const solved = quest.solvedSqlLessonIds.includes(lesson.id);
                      const locked = !isSqlQuestLessonUnlocked(lesson, quest.solvedSqlLessonIds);
                      const active = lesson.id === currentLessonId;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelect(lesson)}
                          className={`w-full rounded-md border p-3 text-left transition ${
                            active
                              ? 'border-electric bg-electric/10 text-electric'
                              : solved
                                ? 'border-success/30 bg-success/10 text-success'
                                : locked
                                  ? 'border-white/10 bg-black/20 text-slate-500'
                                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold">{lesson.title}</span>
                            {locked ? <Lock size={14} /> : solved ? <Check size={14} /> : <span className="text-[11px]">{lesson.xp} XP</span>}
                          </div>
                          <div className="mt-2 text-xs leading-5 text-slate-400">{lesson.sqlConcept}</div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DiagnosticBlock({ diagnostic, lesson }: { diagnostic: SqlDiagnostic; lesson: SqlQuestLesson }) {
  return (
    <div className="space-y-3 rounded-lg border border-danger/25 bg-danger/10 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-danger">
        <ShieldAlert size={16} />
        Диагностика запроса
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-black/20 p-3 text-sm text-slate-300">
          Ожидалось строк: <span className="font-semibold text-slate-50">{diagnostic.expectedRowCount}</span>
        </div>
        <div className="rounded-md bg-black/20 p-3 text-sm text-slate-300">
          Получено строк: <span className="font-semibold text-slate-50">{diagnostic.actualRowCount}</span>
        </div>
      </div>
      {(diagnostic.missingColumns.length > 0 || diagnostic.extraColumns.length > 0) && (
        <div className="rounded-md bg-black/20 p-3 text-sm leading-6 text-slate-300">
          {diagnostic.missingColumns.length > 0 && <div>Не хватает колонок: {diagnostic.missingColumns.join(', ')}</div>}
          {diagnostic.extraColumns.length > 0 && <div>Лишние колонки: {diagnostic.extraColumns.join(', ')}</div>}
        </div>
      )}
      <div className="rounded-md bg-black/20 p-3 text-sm leading-6 text-slate-300">
        <div className="font-semibold text-slate-100">Вероятная причина</div>
        <p>{diagnostic.likelyCause}</p>
      </div>
      <div className="rounded-md border border-amber/20 bg-amber/10 p-3 text-sm leading-6 text-slate-200">
        <div className="font-semibold text-amber">Подсказка спутника</div>
        <p>{diagnostic.companionHint || lesson.companionError}</p>
        <p className="mt-2 text-slate-300">{diagnostic.softHint}</p>
      </div>
      <Link className="inline-flex text-sm font-semibold text-electric hover:underline" to="/knowledge">
        Открыть связанное знание: {diagnostic.relatedKnowledgeId ?? lesson.relatedKnowledgeIds[0]}
      </Link>
    </div>
  );
}

export function TrainerPage() {
  const [domain, setDomain] = useState('sql');
  const filtered = useMemo(() => tasks.filter((task) => task.domain === domain), [domain]);
  const [taskId, setTaskId] = useState('rest-task-1');
  const task = tasks.find((item) => item.id === taskId) ?? filtered[0] ?? tasks[0];
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const quest = progress.sqlQuest ?? defaultSqlQuestProgress;
  const [lessonId, setLessonId] = useState(quest.lastSqlLessonId ?? sqlQuestLessons[0].id);
  const lesson = sqlQuestLessons.find((item) => item.id === lessonId) ?? sqlQuestLessons[0];
  const chapter = getSqlQuestChapter(lesson.chapterId);
  const [sqlValue, setSqlValue] = useState(lesson.starterSql);
  const [jsonValue, setJsonValue] = useState('{"orderId":"ord-1001","status":"paid","delivery":null}');
  const [feedback, setFeedback] = useState<SqlFeedback>({
    state: 'idle',
    message: 'Запустите запрос, чтобы увидеть результат.'
  });
  const [resultRows, setResultRows] = useState<SqlRow[]>([]);
  const [selectedTable, setSelectedTable] = useState(sqlTablePreviews[1].name);

  useEffect(() => {
    getProgress()
      .then((saved) => {
        setProgress(saved);
        const savedLessonId = saved.sqlQuest?.lastSqlLessonId ?? sqlQuestLessons[0].id;
        setLessonId(savedLessonId);
      })
      .catch(() => setProgress(defaultProgress));
  }, []);

  useEffect(() => {
    setSqlValue(lesson.starterSql);
    setFeedback({ state: 'idle', message: 'Запустите запрос, чтобы увидеть результат.' });
    setResultRows([]);
    setSelectedTable(lesson.tablesUsed[0] ?? sqlTablePreviews[0].name);
    void setSqlQuestLocation(lesson.chapterId, lesson.id).catch(() => undefined);
  }, [lesson.id, lesson.chapterId, lesson.starterSql, lesson.tablesUsed]);

  const progressPercent = Math.round((quest.solvedSqlLessonIds.length / sqlQuestLessons.length) * 100);
  const activeTable = sqlTablePreviews.find((table) => table.name === selectedTable) ?? sqlTablePreviews[0];
  const resultColumns = resultRows.length ? Object.keys(resultRows[0]) : [];
  const unlocked = isSqlQuestLessonUnlocked(lesson, quest.solvedSqlLessonIds);
  const revealedHintIds = quest.revealedHintsByLessonId[lesson.id] ?? [];
  const revealedHints = lesson.hints.filter((_, index) => revealedHintIds.includes(String(index)));
  const rank = getRankForXp(quest.xp);

  const refreshProgress = async () => setProgress(await getProgress());

  const handleRun = async () => {
    if (domain === 'sql') {
      if (!unlocked) {
        setFeedback({
          state: 'error',
          message: 'Задача пока закрыта. Сначала решите предыдущие шаги этой ветки.'
        });
        return;
      }

      try {
        const afterAttempt = await recordSqlQuestAttempt(lesson.id);
        setProgress(afterAttempt);
        const rows = await runSql(sqlValue);
        const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
        setResultRows(rows);

        if (check.ok) {
          const { progress: solvedProgress, xpAwarded } = await solveSqlQuestLesson(lesson);
          setProgress(solvedProgress);
          setFeedback({
            state: 'success',
            message:
              xpAwarded > 0
                ? `Результат совпадает с эталоном. Награда: +${xpAwarded} XP. ${lesson.successStory}`
                : `Результат совпадает с эталоном. XP уже был начислен раньше. ${lesson.successStory}`,
            xpAwarded
          });
        } else {
          const diagnostic = createSqlDiagnostic({
            actualRows: rows,
            expectedRows: lesson.expectedRows,
            orderMatters: lesson.orderMatters,
            relatedKnowledgeIds: lesson.relatedKnowledgeIds,
            companionError: lesson.companionError
          });
          setFeedback({
            state: 'error',
            message: 'Результат отличается от эталона. Ниже разбор, где именно разошлись данные.',
            diagnostic
          });
        }
      } catch (error) {
        await refreshProgress().catch(() => undefined);
        setResultRows([]);
        setFeedback({
          state: 'error',
          message: `SQL не выполнен: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`,
          diagnostic: createSqlDiagnostic({
            actualRows: [],
            expectedRows: lesson.expectedRows,
            relatedKnowledgeIds: lesson.relatedKnowledgeIds,
            companionError: 'Запрос даже не дошёл до сверки. Сначала проверь синтаксис: запятые, кавычки и порядок секций.'
          })
        });
      }
      return;
    }

    if (task.domain === 'json' || task.domain === 'openapi') {
      const validation =
        task.validation.kind === 'json-schema'
          ? validateJsonSchema(jsonValue, JSON.stringify(task.validation.schema))
          : formatJson(jsonValue);
      setResultRows([]);
      setFeedback({
        state: validation.ok ? 'success' : 'error',
        message: `${validation.message}\n\n${validation.details?.join('\n') ?? validation.value ?? ''}`
      });
      return;
    }

    const response = simulateApiRequest({
      method: 'GET',
      path: '/api/v1/orders',
      query: { status: 'paid', page: '1', size: '10' }
    });
    setResultRows([]);
    setFeedback({ state: 'success', message: JSON.stringify(response, null, 2) });
  };

  const handleRevealHint = async () => {
    const nextIndex = revealedHintIds.length;
    if (nextIndex >= lesson.hints.length) return;
    const saved = await revealSqlQuestHint(lesson.id, String(nextIndex));
    setProgress(saved);
  };

  const selectLesson = (nextLesson: SqlQuestLesson) => {
    setLessonId(nextLesson.id);
  };

  const selectDomain = (item: string) => {
    setDomain(item);
    const nextTask = tasks.find((taskItem) => taskItem.domain === item);
    if (nextTask) setTaskId(nextTask.id);
    setFeedback({ state: 'idle', message: 'Результат появится здесь.' });
    setResultRows([]);
  };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="grid gap-3 md:grid-cols-5">
          {Object.entries(domainLabels).map(([item, label]) => (
            <button
              key={item}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                domain === item
                  ? 'border-electric bg-electric/10 text-electric'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
              }`}
              onClick={() => selectDomain(item)}
            >
              {label}
            </button>
          ))}
        </div>
      </Panel>

      {domain === 'sql' ? (
        <div className="grid gap-4 2xl:grid-cols-[360px_minmax(0,1fr)_430px]">
          <Panel
            title="SQL Quest Mode"
            action={
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                {progressPercent}% пути
              </span>
            }
          >
            <div className="mb-4 rounded-lg border border-electric/20 bg-electric/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-electric">
                <Trophy size={16} />
                SQL как путь аналитика
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Каждая задача: причина из мира данных, SQL-действие, проверяемый результат, разбор ошибки,
                связанное знание и награда. Атмосфера помогает держать внимание, но решает всё запрос.
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-electric" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <QuestLessonList quest={quest} currentLessonId={lesson.id} onSelect={selectLesson} />
          </Panel>

          <div className="space-y-4">
            <Panel
              title={lesson.title}
              action={
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                  {pathLabels[lesson.pathType]} · {lesson.xp} XP
                </span>
              }
            >
              <div className="mb-4 rounded-lg border border-white/10 bg-ink/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-electric">
                      Глава {chapter.order}: {chapter.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{chapter.description}</p>
                  </div>
                  {!unlocked && (
                    <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-xs text-slate-400">
                      <Lock size={14} /> закрыто prerequisites
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-electric">
                      <ScrollText size={16} />
                      Сюжетная причина
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{lesson.storyIntro}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber">
                      <Target size={16} />
                      Бизнес-контекст
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{lesson.businessContext}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{lesson.learningGoal}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-ink/60 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-100">Критерии успеха</div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {lesson.successCriteria.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check size={15} className="mt-0.5 shrink-0 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
                    <div className="mb-1 font-semibold text-slate-200">{pathLabels[lesson.pathType]}</div>
                    {pathDescriptions[lesson.pathType]}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-white/10 bg-ink/50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-electric">
                      <Table2 size={16} />
                      Данные для этого шага
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Таблица видна до запроса: сначала смотри на реальные строки, потом формулируй SQL.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sqlTablePreviews.map((table) => (
                      <button
                        key={table.name}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          selectedTable === table.name
                            ? 'border-electric bg-electric/10 text-electric'
                            : lesson.tablesUsed.includes(table.name)
                              ? 'border-amber/30 bg-amber/10 text-amber'
                              : 'border-white/10 bg-white/[0.03] text-slate-300'
                        }`}
                        onClick={() => setSelectedTable(table.name)}
                      >
                        {table.name}
                      </button>
                    ))}
                  </div>
                </div>
                <DataTable columns={activeTable.columns} rows={activeTable.rows as SqlRow[]} />
              </div>

              <div className="mt-5 rounded-lg border border-mentor/20 bg-mentor/10 p-4">
                <div className="mb-2 text-sm font-semibold text-mentor">SQL-действие</div>
                <p className="text-sm leading-6 text-slate-200">{lesson.sqlConcept}</p>
              </div>

              <div className="mt-5">
                <CodeMirror value={sqlValue} height="280px" extensions={[sql()]} theme="dark" onChange={setSqlValue} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={handleRun} disabled={!unlocked}>
                    <Send size={16} /> Запустить и проверить
                  </Button>
                  <Button variant="soft" onClick={handleRevealHint} disabled={revealedHintIds.length >= lesson.hints.length}>
                    <ChevronDown size={16} /> Открыть подсказку
                  </Button>
                  <Button variant="ghost" onClick={() => setSqlValue(lesson.starterSql)}>
                    Вернуть стартовый запрос
                  </Button>
                </div>
              </div>
            </Panel>

            <div className="grid gap-4 xl:grid-cols-2">
              <Panel title="Подсказки по шагам">
                {revealedHints.length > 0 ? (
                  <div className="space-y-2">
                    {revealedHints.map((hint, index) => (
                      <div key={hint} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                        <div className="mb-1 text-sm font-semibold text-slate-100">Подсказка {index + 1}</div>
                        <p className="text-sm leading-6 text-slate-400">{hint}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    Подсказки открываются постепенно и сохраняются после перезагрузки.
                  </p>
                )}
              </Panel>

              <Panel title="Результат и разбор">
                <div
                  className={`mb-3 rounded-md border p-3 text-sm leading-6 ${
                    feedback.state === 'success'
                      ? 'border-success/30 bg-success/10 text-success'
                      : feedback.state === 'error'
                        ? 'border-danger/30 bg-danger/10 text-danger'
                        : 'border-white/10 bg-white/[0.04] text-slate-300'
                  }`}
                >
                  {feedback.message}
                </div>
                {resultRows.length > 0 && <DataTable columns={resultColumns} rows={resultRows} />}
                {feedback.diagnostic && (
                  <div className="mt-4">
                    <DiagnosticBlock diagnostic={feedback.diagnostic} lesson={lesson} />
                  </div>
                )}
                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-2 text-sm font-semibold text-electric">Почему это важно</div>
                  <p className="text-sm leading-6 text-slate-400">{lesson.explanation}</p>
                </div>
                {feedback.state === 'success' && (
                  <div className="mt-4 rounded-md border border-amber/20 bg-amber/10 p-3">
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber">
                      <Flame size={16} />
                      {rank.title}
                    </div>
                    <p className="text-sm leading-6 text-slate-200">{lesson.companionSuccess}</p>
                  </div>
                )}
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-danger">Частые ошибки</div>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {lesson.commonMistakes.map((mistake) => (
                      <li key={mistake}>• {mistake}</li>
                    ))}
                  </ul>
                </div>
              </Panel>
            </div>
          </div>

          <div className="space-y-4">
            <RankCard quest={quest} />

            <Panel title="База данных">
              <div className="mb-4 flex flex-wrap gap-2">
                {sqlTablePreviews.map((table) => (
                  <button
                    key={table.name}
                    className={`rounded-md border px-3 py-2 text-xs ${
                      selectedTable === table.name
                        ? 'border-electric bg-electric/10 text-electric'
                        : lesson.tablesUsed.includes(table.name)
                          ? 'border-amber/30 bg-amber/10 text-amber'
                          : 'border-white/10 bg-white/[0.03] text-slate-300'
                    }`}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    {table.name}
                  </button>
                ))}
              </div>
              <TablePreview table={activeTable} />
            </Panel>

            <Panel title="ERD и связи">
              <div className="space-y-3">
                <div className="rounded-md border border-white/10 bg-ink p-3">
                  <div className="flex items-center gap-2 text-sm text-electric">
                    <Layers size={16} />
                    customers 1 → N orders
                  </div>
                  <div className="mt-2 text-xs text-slate-400">orders.customer_id ссылается на customers.id</div>
                </div>
                <div className="rounded-md border border-white/10 bg-ink p-3">
                  <div className="flex items-center gap-2 text-sm text-electric">
                    <Layers size={16} />
                    orders 1 → N payments
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Один заказ может иметь несколько попыток платежа.</div>
                </div>
                <div className="rounded-md border border-white/10 bg-ink p-3">
                  <div className="flex items-center gap-2 text-sm text-electric">
                    <Layers size={16} />
                    orders 1 → N delivery_events
                  </div>
                  <div className="mt-2 text-xs text-slate-400">События доставки показывают техническую интеграцию.</div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Panel title="Тренажёр">
            <label className="text-xs text-slate-400" htmlFor="task">
              Задача
            </label>
            <select
              id="task"
              className="mt-2 w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-slate-100"
              value={task.id}
              onChange={(event) => setTaskId(event.target.value)}
            >
              {filtered.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            <div className="mt-5 space-y-3">
              <div className="text-xs uppercase tracking-[0.16em] text-electric">Контекст</div>
              <p className="text-sm leading-6 text-slate-300">{task.caseContext}</p>
              <div className="text-xs uppercase tracking-[0.16em] text-electric">Цель бизнеса</div>
              <p className="text-sm leading-6 text-slate-300">{task.businessGoal}</p>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel
              title={task.title}
              action={
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                  {task.level} · {task.estimatedFocus}
                </span>
              }
            >
              <p className="mb-4 text-sm leading-6 text-slate-300">{task.taskText}</p>
              <CodeMirror value={jsonValue} height="220px" extensions={[json()]} theme="dark" onChange={setJsonValue} />
              <div className="mt-4 flex gap-3">
                <Button onClick={handleRun}>
                  <PlayCircle size={16} /> Проверить
                </Button>
              </div>
            </Panel>

            <Panel title="Результат и разбор">
              <div className="mb-3 flex items-center gap-2 text-sm text-electric">
                <Database size={16} />
                Локальное выполнение
              </div>
              <pre className="max-h-64 overflow-auto rounded-md bg-ink p-3 text-xs leading-5 text-slate-300">
                {feedback.message}
              </pre>
              <p className="mt-4 text-sm leading-6 text-slate-400">{task.explanation}</p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
