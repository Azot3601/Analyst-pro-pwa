import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { Database, PlayCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { tasks } from '../data/tasks';
import { SqlQuestWorkspace } from '../features/trainer/SqlQuestWorkspace';
import { simulateApiRequest } from '../shared/lib/apiSimulator';
import { formatJson, validateJsonSchema } from '../shared/lib/jsonTools';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

type CheckState = 'idle' | 'success' | 'error';

const domainLabels: Record<string, string> = {
  sql: 'SQL Quest',
  rest: 'REST API',
  json: 'JSON',
  openapi: 'OpenAPI',
  integration: 'Интеграции'
};

export function TrainerPage() {
  const [domain, setDomain] = useState('sql');
  const filtered = useMemo(() => tasks.filter((task) => task.domain === domain), [domain]);
  const [taskId, setTaskId] = useState('rest-task-1');
  const task = tasks.find((item) => item.id === taskId) ?? filtered[0] ?? tasks[0];
  const [jsonValue, setJsonValue] = useState('{"orderId":"ord-1001","status":"paid","delivery":null}');
  const [resultText, setResultText] = useState('Результат появится здесь.');
  const [checkState, setCheckState] = useState<CheckState>('idle');

  const handleRun = () => {
    if (task.domain === 'json' || task.domain === 'openapi') {
      const validation =
        task.validation.kind === 'json-schema'
          ? validateJsonSchema(jsonValue, JSON.stringify(task.validation.schema))
          : formatJson(jsonValue);
      setCheckState(validation.ok ? 'success' : 'error');
      setResultText(`${validation.message}\n\n${validation.details?.join('\n') ?? validation.value ?? ''}`);
      return;
    }

    const response = simulateApiRequest({
      method: 'GET',
      path: '/api/v1/orders',
      query: { status: 'paid', page: '1', size: '10' }
    });
    setCheckState('success');
    setResultText(JSON.stringify(response, null, 2));
  };

  const selectDomain = (item: string) => {
    setDomain(item);
    const nextTask = tasks.find((taskItem) => taskItem.domain === item);
    if (nextTask) setTaskId(nextTask.id);
    setResultText('Результат появится здесь.');
    setCheckState('idle');
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-5 gap-2 rounded-lg border border-white/10 bg-white/[0.055] p-2">
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
      </div>

      {domain === 'sql' ? (
        <SqlQuestWorkspace />
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
              <pre
                className={`max-h-64 overflow-auto rounded-md border p-3 text-xs leading-5 ${
                  checkState === 'success'
                    ? 'border-success/30 bg-success/10 text-success'
                    : checkState === 'error'
                      ? 'border-danger/30 bg-danger/10 text-danger'
                      : 'border-white/10 bg-ink text-slate-300'
                }`}
              >
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
