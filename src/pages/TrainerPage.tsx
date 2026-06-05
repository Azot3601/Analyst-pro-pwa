import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import CodeMirror from '@uiw/react-codemirror';
import {
  BookOpen,
  Check,
  ChevronDown,
  Database,
  Layers,
  PlayCircle,
  Send,
  Table2,
  Target,
  Trophy
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { sqlLessons, type SqlLesson } from '../data/sqlCourse';
import { sqlTablePreviews, type SqlTablePreview } from '../data/sqlSeed';
import { tasks } from '../data/tasks';
import { runSql } from '../features/trainer/useSqlRunner';
import { simulateApiRequest } from '../shared/lib/apiSimulator';
import { formatJson, validateJsonSchema } from '../shared/lib/jsonTools';
import { compareSqlRows, type SqlRow } from '../shared/lib/sqlChecker';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

type CheckState = 'idle' | 'success' | 'error';

const domainLabels: Record<string, string> = {
  sql: 'SQL',
  rest: 'REST API',
  json: 'JSON',
  openapi: 'OpenAPI',
  integration: 'Интеграции'
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
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-400">
          {table.rows.length} строк
        </span>
      </div>
      <DataTable columns={table.columns} rows={table.rows as SqlRow[]} />
    </div>
  );
}

function LessonMap({
  currentLesson,
  completed,
  onSelect
}: {
  currentLesson: SqlLesson;
  completed: string[];
  onSelect: (lesson: SqlLesson) => void;
}) {
  return (
    <div className="space-y-2">
      {sqlLessons.map((lesson, index) => {
        const done = completed.includes(lesson.id);
        const active = lesson.id === currentLesson.id;
        return (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson)}
            className={`w-full rounded-md border p-3 text-left transition ${
              active
                ? 'border-electric bg-electric/10 text-electric'
                : done
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{lesson.title}</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[11px]">#{index + 1}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {lesson.focus.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] text-slate-400">
                  {skill}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function TrainerPage() {
  const [domain, setDomain] = useState('sql');
  const filtered = useMemo(() => tasks.filter((task) => task.domain === domain), [domain]);
  const [taskId, setTaskId] = useState('rest-task-1');
  const task = tasks.find((item) => item.id === taskId) ?? filtered[0] ?? tasks[0];
  const [lessonId, setLessonId] = useState(sqlLessons[0].id);
  const lesson = sqlLessons.find((item) => item.id === lessonId) ?? sqlLessons[0];
  const [sqlValue, setSqlValue] = useState(lesson.starterSql);
  const [jsonValue, setJsonValue] = useState('{"orderId":"ord-1001","status":"paid","delivery":null}');
  const [resultText, setResultText] = useState<string>('Запустите запрос, чтобы увидеть результат.');
  const [resultRows, setResultRows] = useState<SqlRow[]>([]);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [openHints, setOpenHints] = useState(1);
  const [selectedTable, setSelectedTable] = useState(sqlTablePreviews[1].name);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    setSqlValue(lesson.starterSql);
    setResultText('Запустите запрос, чтобы увидеть результат.');
    setResultRows([]);
    setCheckState('idle');
    setOpenHints(1);
    setSelectedTable(lesson.tablesUsed[0] ?? sqlTablePreviews[0].name);
  }, [lesson.id, lesson.starterSql, lesson.tablesUsed]);

  const progressPercent = Math.round((completedLessons.length / sqlLessons.length) * 100);
  const activeTable = sqlTablePreviews.find((table) => table.name === selectedTable) ?? sqlTablePreviews[0];
  const resultColumns = resultRows.length ? Object.keys(resultRows[0]) : [];

  const handleRun = async () => {
    if (domain === 'sql') {
      try {
        const rows = await runSql(sqlValue);
        const check = compareSqlRows(rows, lesson.expectedRows, lesson.orderMatters ?? false);
        setResultRows(rows);
        setCheckState(check.ok ? 'success' : 'error');
        setResultText(check.message);
        if (check.ok) {
          setCompletedLessons((current) => Array.from(new Set([...current, lesson.id])));
        }
      } catch (error) {
        setResultRows([]);
        setCheckState('error');
        setResultText(`SQL не выполнен: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`);
      }
      return;
    }

    if (task.domain === 'json' || task.domain === 'openapi') {
      const validation =
        task.validation.kind === 'json-schema'
          ? validateJsonSchema(jsonValue, JSON.stringify(task.validation.schema))
          : formatJson(jsonValue);
      setResultRows([]);
      setCheckState(validation.ok ? 'success' : 'error');
      setResultText(`${validation.message}\n\n${validation.details?.join('\n') ?? validation.value ?? ''}`);
      return;
    }

    const response = simulateApiRequest({
      method: 'GET',
      path: '/api/v1/orders',
      query: { status: 'paid', page: '1', size: '10' }
    });
    setResultRows([]);
    setCheckState('success');
    setResultText(JSON.stringify(response, null, 2));
  };

  const selectDomain = (item: string) => {
    setDomain(item);
    const nextTask = tasks.find((taskItem) => taskItem.domain === item);
    if (nextTask) setTaskId(nextTask.id);
    setResultText('Результат появится здесь.');
    setResultRows([]);
    setCheckState('idle');
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
        <div className="grid gap-4 2xl:grid-cols-[340px_minmax(0,1fr)_430px]">
          <Panel
            title="SQL-квест"
            action={
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                {progressPercent}% пути
              </span>
            }
          >
            <div className="mb-4 rounded-lg border border-electric/20 bg-electric/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-electric">
                <Trophy size={16} />
                Обучение как цепочка миссий
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Каждый шаг добавляет один новый приём. Сначала читаем таблицу, затем фильтруем,
                сортируем, соединяем, агрегируем и ищем интеграционные разрывы.
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-electric" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <LessonMap
              currentLesson={lesson}
              completed={completedLessons}
              onSelect={(nextLesson) => setLessonId(nextLesson.id)}
            />
          </Panel>

          <div className="space-y-4">
            <Panel
              title={lesson.title}
              action={
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                  Уровень {lesson.level}
                </span>
              }
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-electric">
                      <BookOpen size={16} />
                      Что изучаем
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{lesson.concept}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber">
                      <Target size={16} />
                      Бизнес-контекст
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{lesson.context}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{lesson.analystWhy}</p>
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lesson.focus.map((skill) => (
                      <span key={skill} className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">
                        {skill}
                      </span>
                    ))}
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
                      Смотрите на реальные строки перед тем, как писать запрос. Подсвечены таблицы,
                      которые нужны в текущей миссии.
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
                <div className="mb-2 text-sm font-semibold text-mentor">Миссия</div>
                <p className="text-sm leading-6 text-slate-200">{lesson.task}</p>
              </div>

              <div className="mt-5">
                <CodeMirror value={sqlValue} height="260px" extensions={[sql()]} theme="dark" onChange={setSqlValue} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={handleRun}>
                    <Send size={16} /> Запустить и проверить
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => setOpenHints((value) => Math.min(value + 1, lesson.hints.length))}
                  >
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
                <div className="space-y-2">
                  {lesson.hints.slice(0, openHints).map((hint, index) => (
                    <div key={hint} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                      <div className="mb-1 text-sm font-semibold text-slate-100">Подсказка {index + 1}</div>
                      <p className="text-sm leading-6 text-slate-400">{hint}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Результат и разбор">
                <div
                  className={`mb-3 rounded-md border p-3 text-sm ${
                    checkState === 'success'
                      ? 'border-success/30 bg-success/10 text-success'
                      : checkState === 'error'
                        ? 'border-danger/30 bg-danger/10 text-danger'
                        : 'border-white/10 bg-white/[0.04] text-slate-300'
                  }`}
                >
                  {resultText}
                </div>
                {resultRows.length > 0 ? (
                  <DataTable columns={resultColumns} rows={resultRows} />
                ) : (
                  <pre className="max-h-44 overflow-auto rounded-md bg-ink p-3 text-xs leading-5 text-slate-300">
                    {resultText}
                  </pre>
                )}
                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-2 text-sm font-semibold text-electric">Почему это важно</div>
                  <p className="text-sm leading-6 text-slate-400">{lesson.explanation}</p>
                </div>
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
                  <div className="mt-2 text-xs text-slate-400">`orders.customer_id` ссылается на `customers.id`</div>
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
                {resultText}
              </pre>
              <p className="mt-4 text-sm leading-6 text-slate-400">{task.explanation}</p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
