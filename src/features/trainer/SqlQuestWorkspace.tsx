import { sql } from '@codemirror/lang-sql';
import CodeMirror from '@uiw/react-codemirror';
import {
  Check,
  ChevronDown,
  Database,
  Lightbulb,
  Link2,
  Lock,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Table2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../app/store';
import { SophieAvatar } from '../../shared/ui/SophieAvatar';
import type { SophieState } from '../../shared/ui/SophiePortrait';
import { mentor } from '../../data/mentor';
import {
  getNextRankForXp,
  getRankForXp,
  getSqlQuestChapter,
  isSqlQuestLessonUnlocked,
  sqlQuestChapters,
  sqlQuestLessons,
  type SqlQuestLesson,
  type SqlQuestPathType
} from '../../data/sqlQuest';
import { sqlTablePreviews, type SqlTablePreview } from '../../data/sqlSeed';
import type { UserProgress } from '../../entities/schemas';
import {
  defaultProgress,
  defaultSqlQuestProgress,
  getProgress,
  recordSqlQuestAttempt,
  revealSqlQuestHint,
  setSqlQuestLocation,
  solveSqlQuestLesson,
  type SqlQuestProgress
} from '../progress/progressDb';
import { createSqlDiagnostic, type SqlDiagnostic } from '../../shared/lib/sqlDiagnostics';
import { compareSqlRows, type SqlRow } from '../../shared/lib/sqlChecker';
import { Button } from '../../shared/ui/Button';
import { Panel } from '../../shared/ui/Panel';
import { runSql } from './useSqlRunner';
import { playError, playLevelUp, playSuccess } from '../../shared/lib/audio';

type CheckState = 'idle' | 'success' | 'error';
type MobileTab = 'sql' | 'task' | 'data' | 'hints' | 'theory';

type SqlFeedback = {
  state: CheckState;
  message: string;
  diagnostic?: SqlDiagnostic;
};

const pathLabels: Record<SqlQuestPathType, string> = {
  trial: 'Испытание',
  case: 'Дело'
};

const mobileTabs: Array<{ id: MobileTab; label: string }> = [
  { id: 'sql', label: 'SQL' },
  { id: 'task', label: 'Задача' },
  { id: 'data', label: 'Данные' },
  { id: 'hints', label: 'Подсказки' },
  { id: 'theory', label: 'Теория' }
];

function DataTable({ columns, rows }: { columns: string[]; rows: SqlRow[] }) {
  const reduced = useAppStore((s) => s.reducedMotion);
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
            <motion.tr
              key={rowIndex}
              className="odd:bg-white/[0.025]"
              initial={reduced ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.24, delay: reduced ? 0 : Math.min(rowIndex * 0.045, 0.6) }}
            >
              {columns.map((column) => (
                <td key={column} className="border-b border-white/5 px-3 py-2 font-mono text-slate-300">
                  {row[column] === null ? <span className="text-slate-500">NULL</span> : String(row[column])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sophieStateFromFeedback = (state: SqlFeedback['state']): SophieState =>
  state === 'success' ? 'happy' : state === 'error' ? 'encouraging' : 'idle';

const sophieLine = (state: SqlFeedback['state']) =>
  state === 'success'
    ? 'Чисто сработано. Архив вспомнил правду — ещё одна лампа в городе зажглась.'
    : state === 'error'
      ? 'Почти. Глянь ещё раз на условие — одно слово порой решает всё.'
      : mentor.tagline;

function MentorCard({ feedback }: { feedback: SqlFeedback }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-electric/20 bg-gradient-to-br from-electric/[0.1] to-transparent p-3">
      <div className="shrink-0">
        <SophieAvatar state={sophieStateFromFeedback(feedback.state)} size={84} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-bold text-slate-50">{mentor.name}</div>
        <div className="text-[10px] uppercase tracking-wide text-electric/80">{mentor.title}</div>
        <p className="mt-1 text-xs leading-5 text-slate-300">{sophieLine(feedback.state)}</p>
      </div>
    </div>
  );
}

function TablePreview({ table }: { table: SqlTablePreview }) {
  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Table2 size={15} className="text-electric" />
            {table.name}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">{table.description}</p>
        </div>
        <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400">
          {table.rows.length} строк
        </span>
      </div>
      <DataTable columns={table.columns} rows={table.rows as SqlRow[]} />
    </div>
  );
}

function Disclosure({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="rounded-md border border-white/10 bg-white/[0.025]">
      <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-semibold text-slate-200">
        {title}
      </summary>
      <div className="border-t border-white/10 px-3 py-3 text-sm leading-6 text-slate-400">{children}</div>
    </details>
  );
}

function CompactRank({ quest, feedback }: { quest: SqlQuestProgress; feedback: SqlFeedback }) {
  const rank = getRankForXp(quest.xp);
  const nextRank = getNextRankForXp(quest.xp);
  const progressToNext = nextRank
    ? Math.round(((quest.xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;

  return (
    <div data-testid="quest-rank" className="rounded-md border border-amber/20 bg-amber/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-amber">{rank.title}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {quest.xp} XP · уровень {quest.level}
          </div>
        </div>
        <Sparkles size={16} className="text-amber" />
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-black/30">
        <div className="h-1.5 rounded-full bg-amber transition-[width] duration-700 ease-out" style={{ width: `${progressToNext}%` }} />
      </div>
      {feedback.state !== 'idle' && (
        <p className="mt-2 text-xs leading-5 text-slate-300">
          {feedback.state === 'success'
            ? 'Точный запрос. Архив сегодня на твоей стороне.'
            : 'Проверь результат по строкам и условиям, затем попробуй ещё раз.'}
        </p>
      )}
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
    <div className="max-h-[calc(100vh-17rem)] space-y-3 overflow-y-auto pr-1">
      {sqlQuestChapters.map((chapter) => {
        const chapterLessons = sqlQuestLessons.filter((lesson) => lesson.chapterId === chapter.id);
        const chapterSolved = chapterLessons.filter((lesson) => quest.solvedSqlLessonIds.includes(lesson.id)).length;

        return (
          <div key={chapter.id} className="rounded-md border border-white/10 bg-white/[0.025] p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-electric">Глава {chapter.order}</div>
                <div className="mt-0.5 text-xs font-semibold text-slate-100">{chapter.title}</div>
              </div>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                {chapterSolved}/{chapterLessons.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {chapterLessons.map((lesson) => {
                const solved = quest.solvedSqlLessonIds.includes(lesson.id);
                const locked = !isSqlQuestLessonUnlocked(lesson, quest.solvedSqlLessonIds);
                const active = lesson.id === currentLessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelect(lesson)}
                    className={`w-full rounded-md border px-2.5 py-2 text-left transition ${
                      active
                        ? 'border-electric bg-electric/10 text-electric'
                        : solved
                          ? 'border-success/25 bg-success/10 text-success'
                          : locked
                            ? 'border-white/5 bg-black/15 text-slate-500'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold leading-5">{lesson.title}</span>
                      {locked ? <Lock size={12} /> : solved ? <Check size={12} /> : null}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {pathLabels[lesson.pathType]} · {lesson.xp} XP
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DiagnosticBlock({ diagnostic, lesson }: { diagnostic: SqlDiagnostic; lesson: SqlQuestLesson }) {
  return (
    <div data-testid="sql-diagnostic" className="space-y-3 rounded-md border border-danger/25 bg-danger/10 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-danger">
        <ShieldAlert size={15} />
        Диагностика запроса
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-black/20 p-2 text-xs text-slate-300">
          Ожидалось: <span className="font-semibold text-slate-50">{diagnostic.expectedRowCount}</span>
        </div>
        <div className="rounded-md bg-black/20 p-2 text-xs text-slate-300">
          Получено: <span className="font-semibold text-slate-50">{diagnostic.actualRowCount}</span>
        </div>
      </div>
      {(diagnostic.missingColumns.length > 0 || diagnostic.extraColumns.length > 0) && (
        <div className="rounded-md bg-black/20 p-2 text-xs leading-5 text-slate-300">
          {diagnostic.missingColumns.length > 0 && <div>Не хватает: {diagnostic.missingColumns.join(', ')}</div>}
          {diagnostic.extraColumns.length > 0 && <div>Лишние: {diagnostic.extraColumns.join(', ')}</div>}
        </div>
      )}
      <p className="text-sm leading-6 text-slate-300">{diagnostic.likelyCause}</p>
      <div className="rounded-md border border-amber/20 bg-amber/10 p-2 text-xs leading-5 text-slate-200">
        {diagnostic.companionHint || lesson.companionError}
        <div className="mt-1 text-slate-400">{diagnostic.softHint}</div>
      </div>
      <Link className="inline-flex text-xs font-semibold text-electric hover:underline" to="/knowledge">
        Открыть связанное знание
      </Link>
    </div>
  );
}

function DataPanel({
  lesson,
  activeTable,
  selectedTable,
  onSelect
}: {
  lesson: SqlQuestLesson;
  activeTable: SqlTablePreview;
  selectedTable: string;
  onSelect: (table: string) => void;
}) {
  return (
    <div data-testid="sql-data-panel">
      <Panel title="Данные" className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {sqlTablePreviews.map((table) => (
            <button
              key={table.name}
              className={`rounded-md border px-2 py-1 text-[11px] ${
                selectedTable === table.name
                  ? 'border-electric bg-electric/10 text-electric'
                  : lesson.tablesUsed.includes(table.name)
                    ? 'border-amber/30 bg-amber/10 text-amber'
                    : 'border-white/10 bg-white/[0.03] text-slate-400'
              }`}
              onClick={() => onSelect(table.name)}
            >
              {table.name}
            </button>
          ))}
        </div>
        <TablePreview table={activeTable} />
        <Disclosure title="Связи таблиц">
          <div className="space-y-2 text-xs">
            <div>customers.id → orders.customer_id</div>
            <div>orders.id → payments.order_id</div>
            <div>orders.id → delivery_events.order_id</div>
          </div>
        </Disclosure>
      </Panel>
    </div>
  );
}

function HintsPanel({
  lesson,
  revealedHints,
  canReveal,
  onReveal
}: {
  lesson: SqlQuestLesson;
  revealedHints: string[];
  canReveal: boolean;
  onReveal: () => void;
}) {
  return (
    <Panel title="Подсказки">
      <Button variant="soft" className="mb-3 w-full" onClick={onReveal} disabled={!canReveal}>
        <Lightbulb size={15} /> Открыть следующую
      </Button>
      {revealedHints.length > 0 ? (
        <div className="space-y-2">
          {revealedHints.map((hint, index) => (
            <motion.div
              key={hint}
              initial={{ opacity: 0, scaleY: 0.8, y: -4 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="rounded-md border border-amber/20 bg-parchment/[0.06] p-2.5"
            >
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber">
                <Lightbulb size={12} /> {mentor.name}, подсказка {index + 1}
              </div>
              <p className="text-xs leading-5 text-slate-300">{hint}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs leading-5 text-slate-400">
          Подсказки открываются постепенно и сохраняются после перезагрузки.
        </p>
      )}
      <div className="mt-3 text-[11px] text-slate-500">{lesson.hints.length - revealedHints.length} ещё скрыто</div>
    </Panel>
  );
}

function TaskDetails({ lesson }: { lesson: SqlQuestLesson }) {
  return (
    <div className="space-y-2">
      <Disclosure title="Сюжетная причина">
        <p>{lesson.storyIntro}</p>
      </Disclosure>
      <Disclosure title="Бизнес-контекст">
        <p>{lesson.businessContext}</p>
      </Disclosure>
      <Disclosure title="Критерии успеха">
        <ul className="space-y-1">
          {lesson.successCriteria.map((item) => (
            <li key={item} className="flex gap-2">
              <Check size={14} className="mt-1 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}

function TheoryDetails({ lesson }: { lesson: SqlQuestLesson }) {
  return (
    <div className="space-y-2">
      <Disclosure title="Почему это важно" open>
        <p>{lesson.explanation}</p>
      </Disclosure>
      <Disclosure title="Частые ошибки">
        <ul className="space-y-1">
          {lesson.commonMistakes.map((mistake) => (
            <li key={mistake}>• {mistake}</li>
          ))}
        </ul>
      </Disclosure>
      <Link
        className="flex items-center gap-2 rounded-md border border-electric/20 bg-electric/10 px-3 py-2 text-sm font-semibold text-electric"
        to="/knowledge"
      >
        <Link2 size={15} /> Связанное знание
      </Link>
    </div>
  );
}

export function SqlQuestWorkspace() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const quest = progress.sqlQuest ?? defaultSqlQuestProgress;
  const [lessonId, setLessonId] = useState(quest.lastSqlLessonId ?? sqlQuestLessons[0].id);
  const lesson = sqlQuestLessons.find((item) => item.id === lessonId) ?? sqlQuestLessons[0];
  const chapter = getSqlQuestChapter(lesson.chapterId);
  const [sqlValue, setSqlValue] = useState(lesson.starterSql);
  const [feedback, setFeedback] = useState<SqlFeedback>({
    state: 'idle',
    message: 'Запустите запрос, чтобы увидеть результат.'
  });
  const [resultRows, setResultRows] = useState<SqlRow[]>([]);
  const [selectedTable, setSelectedTable] = useState(sqlTablePreviews[1].name);
  const [mobileTab, setMobileTab] = useState<MobileTab>('sql');

  useEffect(() => {
    getProgress()
      .then((saved) => {
        setProgress(saved);
        setLessonId(saved.sqlQuest?.lastSqlLessonId ?? sqlQuestLessons[0].id);
      })
      .catch(() => setProgress(defaultProgress));
  }, []);

  useEffect(() => {
    setSqlValue(lesson.starterSql);
    setFeedback({ state: 'idle', message: 'Запустите запрос, чтобы увидеть результат.' });
    setResultRows([]);
    setSelectedTable(lesson.tablesUsed[0] ?? sqlTablePreviews[0].name);
    setMobileTab('sql');
    void setSqlQuestLocation(lesson.chapterId, lesson.id).catch(() => undefined);
  }, [lesson.id, lesson.chapterId, lesson.starterSql, lesson.tablesUsed]);

  const progressPercent = Math.round((quest.solvedSqlLessonIds.length / sqlQuestLessons.length) * 100);
  const activeTable = sqlTablePreviews.find((table) => table.name === selectedTable) ?? sqlTablePreviews[0];
  const resultColumns = resultRows.length ? Object.keys(resultRows[0]) : [];
  const unlocked = isSqlQuestLessonUnlocked(lesson, quest.solvedSqlLessonIds);
  const revealedHintIds = quest.revealedHintsByLessonId[lesson.id] ?? [];
  const revealedHints = lesson.hints.filter((_, index) => revealedHintIds.includes(String(index)));

  const handleRun = async () => {
    if (!unlocked) {
      setFeedback({ state: 'error', message: 'Задача пока закрыта. Сначала решите предыдущие шаги.' });
      return;
    }

    try {
      setProgress(await recordSqlQuestAttempt(lesson.id));
      const rows = await runSql(sqlValue);
      const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
      setResultRows(rows);

      if (check.ok) {
        const { progress: solvedProgress, xpAwarded } = await solveSqlQuestLesson(lesson);
        setProgress(solvedProgress);
        if (solvedProgress.sqlQuest?.rankId !== quest.rankId) playLevelUp();
        else playSuccess();
        setFeedback({
          state: 'success',
          message:
            xpAwarded > 0
              ? `Результат совпадает с эталоном. +${xpAwarded} XP. ${lesson.successStory}`
              : `Результат совпадает с эталоном. XP уже начислен. ${lesson.successStory}`
        });
      } else {
        playError();
        setFeedback({
          state: 'error',
          message: 'Результат отличается от эталона.',
          diagnostic: createSqlDiagnostic({
            actualRows: rows,
            expectedRows: lesson.expectedRows,
            orderMatters: lesson.orderMatters,
            relatedKnowledgeIds: lesson.relatedKnowledgeIds,
            companionError: lesson.companionError
          })
        });
      }
    } catch (error) {
      playError();
      setResultRows([]);
      setFeedback({
        state: 'error',
        message: `SQL не выполнен: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`,
        diagnostic: createSqlDiagnostic({
          actualRows: [],
          expectedRows: lesson.expectedRows,
          relatedKnowledgeIds: lesson.relatedKnowledgeIds,
          companionError: 'Сначала проверь синтаксис: запятые, кавычки и порядок секций.'
        })
      });
    }
  };

  const handleRevealHint = async () => {
    const nextIndex = revealedHintIds.length;
    if (nextIndex >= lesson.hints.length) return;
    setProgress(await revealSqlQuestHint(lesson.id, String(nextIndex)));
  };

  const editorWorkspace = (
    <div className="space-y-3" data-testid="sql-editor-workspace">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-electric">
              Глава {chapter.order}: {chapter.title}
            </div>
            <h1 className="mt-1 text-lg font-bold text-slate-50">{lesson.title}</h1>
            <p className="mt-1 text-sm leading-5 text-slate-300">{lesson.learningGoal}</p>
          </div>
          <div className="flex shrink-0 gap-1.5 text-[11px]">
            <span className="rounded-md bg-white/10 px-2 py-1 text-slate-300">{pathLabels[lesson.pathType]}</span>
            <span className="rounded-md bg-amber/10 px-2 py-1 text-amber">{lesson.xp} XP</span>
          </div>
        </div>
        <div className="mt-2 text-xs font-semibold text-mentor">{lesson.sqlConcept}</div>
      </div>

      {!unlocked && (
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 p-3 text-sm text-slate-400">
          <Lock size={15} /> Сначала решите предыдущую задачу.
        </div>
      )}

      <div
        data-testid="sql-editor"
        className="overflow-hidden rounded-lg border border-electric/25 bg-ink shadow-glow [&_.cm-editor]:!h-[220px] sm:[&_.cm-editor]:!h-[300px]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="text-xs font-semibold text-electric">SQL-редактор</span>
          <span className="text-[10px] text-slate-500">локальное выполнение</span>
        </div>
        <CodeMirror value={sqlValue} height="300px" extensions={[sql()]} theme="dark" onChange={setSqlValue} />
      </div>

      <div data-testid="sql-actions" className="grid grid-cols-3 gap-2">
        <Button onClick={handleRun} disabled={!unlocked} className="px-2">
          <Send size={15} /> Запустить
        </Button>
        <Button
          variant="soft"
          onClick={handleRevealHint}
          disabled={revealedHintIds.length >= lesson.hints.length}
          className="px-2"
        >
          <ChevronDown size={15} /> Подсказка
        </Button>
        <Button variant="ghost" onClick={() => setSqlValue(lesson.starterSql)} className="px-2">
          <RotateCcw size={15} /> Сбросить
        </Button>
      </div>

      <section data-testid="sql-result" className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Database size={15} className="text-electric" />
          Результат
        </div>
        <div
          className={`rounded-md border p-2.5 text-sm leading-6 ${
            feedback.state === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : feedback.state === 'error'
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-white/10 bg-black/15 text-slate-400'
          }`}
        >
          {feedback.message}
        </div>
        {resultRows.length > 0 && (
          <div className="mt-3">
            <DataTable columns={resultColumns} rows={resultRows} />
          </div>
        )}
        {feedback.diagnostic && (
          <div className="mt-3">
            <DiagnosticBlock diagnostic={feedback.diagnostic} lesson={lesson} />
          </div>
        )}
      </section>

      <div className="hidden space-y-2 xl:block">
        <Disclosure title="Подробности задачи">
          <TaskDetails lesson={lesson} />
        </Disclosure>
        <Disclosure title="Теория и частые ошибки">
          <TheoryDetails lesson={lesson} />
        </Disclosure>
      </div>
    </div>
  );

  return (
    <div>
      <div
        data-testid="mobile-quest-tabs"
        className="sticky top-16 z-10 -mx-4 mb-3 overflow-x-auto border-y border-white/10 bg-ink/95 px-4 py-2 backdrop-blur xl:hidden"
      >
        <div role="tablist" className="grid grid-cols-5 gap-1">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={mobileTab === tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`rounded-md px-2 py-2 text-xs font-semibold ${
                mobileTab === tab.id ? 'bg-electric text-ink' : 'bg-white/[0.06] text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div data-testid="quest-layout" className="grid min-w-0 gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside data-testid="quest-sidebar" className="hidden min-w-0 xl:block">
          <div className="sticky top-20">
            <Panel
              title="Главы и задачи"
              action={<span className="text-xs text-slate-400">{progressPercent}%</span>}
            >
              <div className="mb-3 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-electric transition-[width] duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
              <QuestLessonList quest={quest} currentLessonId={lesson.id} onSelect={(next) => setLessonId(next.id)} />
            </Panel>
          </div>
        </aside>

        <main
          data-testid="quest-workspace"
          className={mobileTab === 'sql' ? 'min-w-0 pb-20 xl:pb-0' : 'hidden min-w-0 xl:block'}
        >
          {editorWorkspace}
        </main>

        <aside data-testid="quest-aside" className="hidden min-w-0 space-y-3 xl:block">
          <MentorCard feedback={feedback} />
          <CompactRank quest={quest} feedback={feedback} />
          <DataPanel
            lesson={lesson}
            activeTable={activeTable}
            selectedTable={selectedTable}
            onSelect={setSelectedTable}
          />
          <HintsPanel
            lesson={lesson}
            revealedHints={revealedHints}
            canReveal={revealedHintIds.length < lesson.hints.length}
            onReveal={handleRevealHint}
          />
          <Link
            className="flex items-center gap-2 rounded-md border border-electric/20 bg-electric/10 px-3 py-2 text-sm font-semibold text-electric"
            to="/knowledge"
          >
            <Link2 size={15} /> Связанное знание
          </Link>
        </aside>
      </div>

      <div className="xl:hidden">
        {mobileTab === 'task' && (
          <Panel title="Задача">
            <TaskDetails lesson={lesson} />
          </Panel>
        )}
        {mobileTab === 'data' && (
          <DataPanel
            lesson={lesson}
            activeTable={activeTable}
            selectedTable={selectedTable}
            onSelect={setSelectedTable}
          />
        )}
        {mobileTab === 'hints' && (
          <div className="space-y-3">
            <MentorCard feedback={feedback} />
            <CompactRank quest={quest} feedback={feedback} />
            <HintsPanel
              lesson={lesson}
              revealedHints={revealedHints}
              canReveal={revealedHintIds.length < lesson.hints.length}
              onReveal={handleRevealHint}
            />
          </div>
        )}
        {mobileTab === 'theory' && (
          <Panel title="Теория">
            <TheoryDetails lesson={lesson} />
          </Panel>
        )}
      </div>
    </div>
  );
}
