import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Database,
  FileCode2,
  KeyRound,
  LockKeyhole,
  ScrollText,
  Send
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiQuestTasks, restTestValues, type ApiQuestTask } from '../../../data/apiQuest';
import {
  getProgress,
  recordApiTaskAttempt,
  revealApiTaskHint,
  setLastApiTask,
  solveApiTask,
  type ApiTaskDomain
} from '../../progress/progressDb';
import {
  checkIntegration,
  buildPathFromTemplate,
  buildRestUrl,
  checkJson,
  checkOpenApi,
  checkRest,
  checkSoap,
  type ApiQuestCheckResult
} from '../../../shared/lib/apiQuestCheckers';
import { simulateApiRequest, type ApiResponse } from '../../../shared/lib/apiSimulator';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';
import { GlossaryText } from '../../knowledge/GlossaryText';

type Props = { domain: ApiTaskDomain };
type RestDraft = {
  method: string;
  path: string;
  pathParams: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: string;
};

const domainTitles: Record<ApiTaskDomain, string> = {
  rest: 'Договоры гонцов',
  json: 'Свитки данных',
  openapi: 'Карты контрактов',
  integration: 'Караваны сообщений'
};

const inputClass =
  'w-full rounded-md border border-white/10 bg-ink px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-electric/60 focus:ring-2 focus:ring-electric/20';

const formatHeaderName = (name: string) => name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('-');

function taskKnowledge(task: ApiQuestTask) {
  return task.relatedKnowledgeIds[0] ?? 'rest';
}

function RestBeforeSolution({ task }: { task: Extract<ApiQuestTask, { kind: 'rest' }> }) {
  const [showExample, setShowExample] = useState(false);
  const example = task.beginner.example;
  const exampleUrl = buildRestUrl(example.endpoint, example.pathParams ?? {}, example.query ?? {});

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-3" aria-labelledby="before-solution-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase text-electric">Перед решением</div>
          <h2 id="before-solution-title" className="mt-1 text-base font-semibold text-slate-50">Как работает этот request</h2>
        </div>
        <Button variant="soft" onClick={() => setShowExample((value) => !value)}>
          {showExample ? 'Скрыть пример' : 'Показать пример заполнения'}
        </Button>
      </div>
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-electric">Что сейчас изучаем</p>
          <p className="mt-1 text-slate-200">{task.trainingFocus}</p>
          <p className="mt-3 text-xs font-semibold text-slate-300">Простыми словами</p>
          <p className="mt-1 leading-6 text-slate-400">{task.beginner.simpleExplanation}</p>
          <p className="mt-3 text-xs font-semibold text-slate-300">Где это в жизни</p>
          <p className="mt-1 leading-6 text-slate-400">{task.realLife}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-300">Что нужно заполнить</p>
          <ol className="mt-1 space-y-1 text-sm text-slate-400">
            {task.beginner.fillSteps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}
          </ol>
          <p className="mt-3 text-xs font-semibold text-success">Что ожидаем получить</p>
          <p className="mt-1 text-sm text-slate-300">{task.beginner.expectedResult}</p>
        </div>
      </div>
      <details className="mt-3 rounded-md border border-white/10 bg-black/15 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-amber">Тестовые значения</summary>
        <div className="mt-2 grid gap-1 font-mono text-xs text-slate-300 sm:grid-cols-2">
          {Object.entries(restTestValues).map(([name, value]) => <p key={name}>{name}: {value}</p>)}
        </div>
      </details>
      {showExample && (
        <div className="mt-3 rounded-md border border-electric/25 bg-black/25 p-3 text-xs" data-testid="rest-example-panel">
          <p className="font-semibold text-electric">Пример заполнения — это подсказка, поля задачи не изменены</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-slate-500">Method</dt><dd className="font-mono text-slate-200">{example.method}</dd></div>
            <div><dt className="text-slate-500">Endpoint template</dt><dd className="break-all font-mono text-slate-200">{example.endpoint}</dd></div>
            {example.pathParams && <div><dt className="text-slate-500">Path parameter</dt><dd className="font-mono text-slate-200">{Object.entries(example.pathParams).map(([key, value]) => `${key} = ${value}`).join(', ')}</dd></div>}
            <div><dt className="text-slate-500">Final URL</dt><dd className="break-all font-mono text-electric">{exampleUrl}</dd></div>
          </dl>
          {example.query && <pre className="mt-2 whitespace-pre-wrap text-slate-300">Query params:{'\n'}{Object.entries(example.query).map(([key, value]) => `${key}=${value}`).join('\n')}</pre>}
          {example.headers && <pre className="mt-2 whitespace-pre-wrap text-slate-300">Headers:{'\n'}{Object.entries(example.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>}
          {example.body !== undefined && <pre className="mt-2 overflow-auto whitespace-pre-wrap text-slate-300">Body:{'\n'}{JSON.stringify(example.body, null, 2)}</pre>}
        </div>
      )}
    </section>
  );
}

function RestBodyContract({ task }: { task: Extract<ApiQuestTask, { kind: 'rest' }> }) {
  const contract = task.beginner.bodyContract;
  if (!contract) return null;
  return (
    <div className="rounded-md border border-amber/20 bg-amber/[0.04] p-3">
      <h3 className="text-xs font-semibold text-amber">Контракт JSON body</h3>
      <ul className="mt-2 space-y-2 text-xs text-slate-400">
        {contract.fields.map((field) => (
          <li key={field.name}>
            <code className="text-slate-100">{field.name}: {field.type}</code>
            <span className={field.required ? 'ml-2 text-danger' : 'ml-2 text-slate-500'}>{field.required ? 'обязательно' : 'optional'}</span>
            {field.enum && <span className="ml-2 text-electric">enum: {field.enum.join(' | ')}</span>}
            {field.nullable && <span className="ml-2 text-electric">nullable</span>}
            <p className="mt-1">{field.description}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase text-slate-500">Корректный пример</p>
      <pre className="mt-1 overflow-auto whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(contract.example, null, 2)}</pre>
    </div>
  );
}

function Workflow({ domain }: Props) {
  const labels =
    domain === 'integration'
      ? ['Система A', 'Контракт', 'Система B', 'Повтор / ошибка']
      : ['Клиент', 'API', 'Сервис', 'Ответ'];
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-white/10 bg-black/15 p-2 text-[11px] text-slate-300">
      {labels.map((label, index) => (
        <div key={label} className="contents">
          <span className="whitespace-nowrap rounded bg-white/[0.07] px-2 py-1">{label}</span>
          {index < labels.length - 1 && <ArrowRight size={13} className="shrink-0 text-electric" />}
        </div>
      ))}
    </div>
  );
}

function RestOnboarding() {
  const [practiceValue, setPracticeValue] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const finalUrl = buildPathFromTemplate('/api/v1/orders/{orderId}', { orderId: practiceValue });
  const completed = practiceValue.trim().toUpperCase() === 'ORD-1001';

  return (
    <details
      className="rounded-lg border border-electric/25 bg-electric/[0.06] p-3"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer text-sm font-semibold text-slate-50">
        Введение: как гонец API несёт приказ
      </summary>
      <div className="mt-3 space-y-4 text-sm leading-6 text-slate-300">
        <p>
          <strong className="text-electric">API</strong> — это договорённый способ одной системы обратиться к
          другой системе и получить ответ. В нашей метафоре гильдия отправляет гонца, но технически клиент
          отправляет HTTP request сервису и получает response.
        </p>
        <div className="flex items-center gap-1 overflow-x-auto rounded-md border border-white/10 bg-black/20 p-2 text-xs">
          {['Клиент', 'Request', 'API / Service', 'Response'].map((label, index) => (
            <div className="contents" key={label}>
              <span className="whitespace-nowrap rounded bg-white/[0.07] px-2 py-1">{label}</span>
              {index < 3 && <ArrowRight size={14} className="shrink-0 text-electric" />}
            </div>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/15 p-3">
            <p className="font-mono text-electric">GET /api/v1/orders/ORD-1001</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li><strong className="text-slate-200">GET</strong> — метод: получить данные.</li>
              <li><strong className="text-slate-200">Endpoint</strong> — адрес ворот нужного ресурса.</li>
              <li><strong className="text-slate-200">Headers</strong> — служебные отметки, формат и доступ.</li>
              <li><strong className="text-slate-200">Body</strong> — содержимое команды, если оно требуется.</li>
            </ul>
          </div>
          <div className="rounded-md border border-white/10 bg-black/15 p-3 text-xs text-slate-400">
            <p><strong className="text-success">200</strong> — запрос выполнен.</p>
            <p><strong className="text-amber">404</strong> — ресурс не найден.</p>
            <p><strong className="text-danger">400 / 422</strong> — request нарушает контракт.</p>
            <p className="mt-2">Status code — решение сервиса; response body содержит данные или модель ошибки.</p>
          </div>
        </div>
        <div className="rounded-md border border-amber/20 bg-amber/[0.05] p-3">
          <p className="text-xs font-semibold uppercase text-amber">Имя параметра не равно значению</p>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <p><span className="text-slate-500">Endpoint template</span><br /><code>/api/v1/orders/{'{orderId}'}</code></p>
            <p><span className="text-slate-500">Parameter name</span><br /><code>orderId</code></p>
            <p><span className="text-slate-500">Parameter value</span><br /><code>ORD-1001</code></p>
            <p><span className="text-slate-500">Computed URL</span><br /><code>/api/v1/orders/ORD-1001</code></p>
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 p-3">
          <p className="font-semibold text-slate-100">Мини-практика</p>
          <p className="mt-1 text-xs text-slate-400">Подставьте <code>ORD-1001</code> вместо <code>{'{orderId}'}</code>.</p>
          <label className="mt-2 block text-xs text-slate-400">
            Значение orderId
            <input
              aria-label="Мини-практика: значение orderId"
              className={`${inputClass} mt-1`}
              value={practiceValue}
              onChange={(event) => setPracticeValue(event.target.value)}
              placeholder="ORD-1001"
            />
          </label>
          <p className="mt-2 break-all font-mono text-xs text-electric">Итоговый URL: {finalUrl}</p>
          {completed && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-success">
                Теперь гонец идёт не к абстрактному {'{orderId}'}, а к конкретному заказу ORD-1001.
              </p>
              <Button variant="soft" onClick={() => setIsOpen(false)}>Перейти к первой задаче</Button>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

function DiagnosticPanel({ result, successMessage }: { result?: ApiQuestCheckResult; successMessage: string }) {
  if (!result) {
    return <p role="status" aria-live="polite" className="text-sm text-slate-400">Проверка ещё не запускалась.</p>;
  }
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-atomic="true">
      {result.ok && (
      <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={17} /> Контракт выполнен
        </div>
        <p className="mt-1 text-slate-200">{successMessage}</p>
      </div>
      )}
      {result.diagnostics.map((item, index) => (
        <article
          key={`${item.code}-${index}`}
          className={`rounded-md border p-3 text-sm ${
            item.severity === 'warning'
              ? 'border-amber/30 bg-amber/10'
              : 'border-danger/30 bg-danger/10'
          }`}
          role={item.severity === 'error' ? 'alert' : undefined}
        >
          <div className="flex items-center gap-2 font-semibold text-slate-100">
            <CircleAlert size={16} className={item.severity === 'warning' ? 'text-amber' : 'text-danger'} />
            <span>{item.code}</span>
          </div>
          <dl className="mt-2 grid gap-1 text-xs leading-5 text-slate-300 sm:grid-cols-2">
            <div><dt className="text-slate-500">Ожидалось</dt><dd>{item.expected}</dd></div>
            <div><dt className="text-slate-500">Получено</dt><dd>{item.actual}</dd></div>
          </dl>
          <p className="mt-2 text-slate-300">{item.why}</p>
          {item.details && (
            <div className="mt-2 rounded bg-black/20 p-2">
              <p className="text-xs font-semibold text-slate-200">Что не хватает или не совпало</p>
              <ul className="mt-1 space-y-1 text-xs text-slate-300">
                {item.details.map((detail) => <li key={detail}>• {detail}</li>)}
              </ul>
            </div>
          )}
          {item.consequences && <p className="mt-2 text-xs text-slate-400"><strong>Последствия:</strong> {item.consequences}</p>}
          {item.example && <pre className="mt-2 whitespace-pre-wrap rounded bg-black/20 p-2 text-xs text-slate-300">{item.example}</pre>}
          <p className="mt-1 text-electric">{item.fix}</p>
          <p className="mt-2 text-xs text-amber">{item.characterLine}</p>
          <Link className="mt-2 inline-flex text-xs font-semibold text-electric" to={`/knowledge?node=${item.knowledgeId}`}>
            Открыть связанное знание
          </Link>
        </article>
      ))}
    </div>
  );
}

function RestBuilder({
  task,
  draft,
  onChange,
  onCheck
}: {
  task: Extract<ApiQuestTask, { kind: 'rest' }>;
  draft: RestDraft;
  onChange: (next: RestDraft) => void;
  onCheck: () => void;
}) {
  const finalUrl = task.config.pathParams.length > 0
    ? buildRestUrl(task.config.path, draft.pathParams, draft.query)
    : draft.path
      ? buildRestUrl(draft.path, {}, draft.query)
      : 'Сначала заполни endpoint';
  return (
    <div className="space-y-3" data-testid="rest-request-builder">
      <Workflow domain="rest" />
      <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
        <label className="text-xs text-slate-400">
          HTTP method
          <select
            aria-label="HTTP method"
            className={`${inputClass} mt-1`}
            value={draft.method}
            onChange={(event) => onChange({ ...draft, method: event.target.value })}
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => <option key={method}>{method}</option>)}
          </select>
        </label>
        {task.config.pathParams.length === 0 ? (
          <label className="text-xs text-slate-400">
            Endpoint / path
            <input
              aria-label="Путь endpoint"
              className={`${inputClass} mt-1`}
              value={draft.path}
              placeholder={task.config.path}
              onChange={(event) => onChange({ ...draft, path: event.target.value })}
            />
          </label>
        ) : (
          <div className="rounded-md border border-white/10 bg-black/15 px-3 py-2 text-xs text-slate-400">
            Endpoint template
            <p className="mt-1 break-all font-mono text-slate-200">{task.config.path}</p>
          </div>
        )}
      </div>
      {task.config.pathParams.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {task.config.pathParams.map((name) => (
            <label key={name} className="text-xs text-slate-400">
              Значение {name} <span className="text-slate-600">(имя параметра: {name})</span>
              <input
                aria-label={`Значение ${name}`}
                data-testid={`rest-path-param-${name}`}
                className={`${inputClass} mt-1`}
                value={draft.pathParams[name] ?? ''}
                placeholder={task.config.pathParamExamples?.[name] ?? `Значение ${name}`}
                onChange={(event) => {
                  const pathParams = { ...draft.pathParams, [name]: event.target.value };
                  onChange({ ...draft, pathParams, path: buildPathFromTemplate(task.config.path, pathParams) });
                }}
              />
            </label>
          ))}
        </div>
      )}
      <div className="rounded-md border border-electric/20 bg-electric/[0.05] p-3 text-xs">
        <span className="text-slate-500">Final URL</span>
        <p className="mt-1 break-all font-mono text-electric" data-testid="computed-rest-url">{finalUrl}</p>
      </div>
      {(task.config.query.length > 0 || Object.keys(task.config.headers).length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {task.config.query.length > 0 && (
            <div className="rounded-md border border-white/10 bg-black/15 p-3">
              <p className="text-xs font-semibold text-slate-300">Query parameters</p>
              <p className="mt-1 text-[11px] text-slate-500">Формат в URL: status=paid&amp;page=1&amp;size=10</p>
              <div className="mt-2 space-y-2">
                {task.config.query.map((name) => (
                  <label key={name} className="block text-xs text-slate-400">
                    {name}
                    <input aria-label={`Query parameter ${name}`} className={`${inputClass} mt-1`} value={draft.query[name] ?? ''} placeholder={task.beginner.example.query?.[name] ?? ''} onChange={(event) => onChange({ ...draft, query: { ...draft.query, [name]: event.target.value } })} />
                  </label>
                ))}
              </div>
            </div>
          )}
          {Object.keys(task.config.headers).length > 0 && (
            <div className="rounded-md border border-white/10 bg-black/15 p-3">
              <p className="text-xs font-semibold text-slate-300">Headers</p>
              <p className="mt-1 text-[11px] text-slate-500">Формат: Content-Type: application/json</p>
              <div className="mt-2 space-y-2">
                {Object.keys(task.config.headers).map((name) => (
                  <label key={name} className="block text-xs text-slate-400">
                    {formatHeaderName(name)}
                    <input aria-label={`Header ${formatHeaderName(name)}`} className={`${inputClass} mt-1`} value={draft.headers[name] ?? ''} placeholder={Object.entries(task.beginner.example.headers ?? {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] ?? task.config.headers[name]} onChange={(event) => onChange({ ...draft, headers: { ...draft.headers, [name]: event.target.value } })} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {task.config.bodyFields.length > 0 && (
        <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
          <div className="overflow-hidden rounded-md border border-white/10">
            <div className="border-b border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">JSON body</div>
            <CodeMirror aria-label="JSON body" value={draft.body} height="220px" extensions={[json()]} theme="dark" onChange={(body) => onChange({ ...draft, body })} />
          </div>
          <RestBodyContract task={task} />
        </div>
      )}
      <Button onClick={onCheck}><Send size={16} /> Отправить / Проверить</Button>
    </div>
  );
}

function ContractEditor({
  task,
  value,
  onChange,
  onCheck
}: {
  task: Extract<ApiQuestTask, { kind: 'json' | 'openapi' }>;
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
}) {
  const isJson = task.kind === 'json';
  const schema = isJson ? task.config.schema : task.config;
  return (
    <div className="space-y-3">
      <Workflow domain={isJson ? 'json' : 'openapi'} />
      <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
        <div className="overflow-hidden rounded-md border border-electric/25 2xl:col-start-1 2xl:row-start-1">
          <div className="border-b border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-electric">
            {isJson ? 'JSON editor' : 'OpenAPI JSON fragment'}
          </div>
          <CodeMirror aria-label={isJson ? 'JSON editor' : 'OpenAPI editor'} value={value} height="310px" extensions={[json()]} theme="dark" onChange={onChange} />
        </div>
        <Button className="w-fit 2xl:col-start-1 2xl:row-start-2" onClick={onCheck}>
          <FileCode2 size={16} /> {isJson ? 'Проверить JSON' : 'Проверить контракт'}
        </Button>
        <div className="max-h-[350px] overflow-auto rounded-md border border-white/10 bg-black/20 p-3 2xl:col-start-2 2xl:row-span-2 2xl:row-start-1">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber">
            <ScrollText size={15} /> {isJson ? 'Contract / JSON Schema' : 'Карта обязательных частей'}
          </div>
          <pre className="whitespace-pre-wrap text-xs leading-5 text-slate-300">{JSON.stringify(schema, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

function IntegrationEditor({
  task,
  selected,
  value,
  onSelected,
  onValue,
  onCheck
}: {
  task: Extract<ApiQuestTask, { kind: 'integration' }>;
  selected: string[];
  value: string;
  onSelected: (value: string[]) => void;
  onValue: (value: string) => void;
  onCheck: () => void;
}) {
  if (task.config.mode === 'soap') {
    return (
      <div className="space-y-3">
        <Workflow domain="integration" />
        <div className="rounded-md border border-amber/25 bg-amber/5 p-3 text-sm text-slate-300">
          <span className="font-semibold text-amber">Древний строгий контракт:</span> найдите Envelope, Header,
          Body, operation и при необходимости SOAP Fault.
        </div>
        <div className="overflow-hidden rounded-md border border-electric/25">
          <div className="border-b border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-electric">SOAP XML</div>
          <CodeMirror aria-label="SOAP XML editor" value={value} height="310px" theme="dark" onChange={onValue} />
        </div>
        <Button onClick={onCheck}><ScrollText size={16} /> Проверить SOAP-свиток</Button>
      </div>
    );
  }
  const options = Array.from(new Set([...task.config.requiredConcepts, 'красивое имя сервиса', 'ручной повтор']));
  return (
    <div className="space-y-3">
      <Workflow domain="integration" />
      <div className="rounded-md border border-white/10 bg-black/15 p-3">
        <div className="mb-3 text-sm font-semibold text-slate-100">Соберите устойчивый сценарий</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((concept) => (
            <label key={concept} className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={selected.includes(concept)}
                onChange={(event) =>
                  onSelected(event.target.checked ? [...selected, concept] : selected.filter((item) => item !== concept))
                }
              />
              {concept}
            </label>
          ))}
        </div>
      </div>
      <Button onClick={onCheck}><LockKeyhole size={16} /> Проверить решение</Button>
    </div>
  );
}

function initialSoap(task: Extract<ApiQuestTask, { kind: 'integration' }>) {
  const config = task.config.mode === 'soap' ? task.config : undefined;
  return `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  ${config?.requireHeader ? '<soap:Header></soap:Header>' : ''}
  <soap:Body>
  </soap:Body>
</soap:Envelope>`;
}

export function ApiQuestWorkspace({ domain }: Props) {
  const domainTasks = useMemo(() => apiQuestTasks.filter((task) => task.kind === domain), [domain]);
  const [taskId, setTaskId] = useState(domainTasks[0].id);
  const task = domainTasks.find((item) => item.id === taskId) ?? domainTasks[0];
  const [restDraft, setRestDraft] = useState<RestDraft>({
    method: task.kind === 'rest' ? task.config.method : 'GET',
    path: '',
    pathParams: {},
    query: {},
    headers: {},
    body: '{}'
  });
  const [editorValue, setEditorValue] = useState('{}');
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [result, setResult] = useState<ApiQuestCheckResult>();
  const [response, setResponse] = useState<ApiResponse>();
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [revealedHintIds, setRevealedHintIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const resetForTask = (next: ApiQuestTask) => {
    setRestDraft({
      method: next.kind === 'rest' ? next.config.method : 'GET',
      path: next.kind === 'rest' && next.config.pathParams.length > 0 ? next.config.path : '',
      pathParams: {},
      query: {},
      headers: {},
      body: '{}'
    });
    setEditorValue(
      next.kind === 'openapi'
        ? JSON.stringify({ openapi: '3.1.0', info: { title: 'Гильдейский API', version: '1.0.0' }, paths: {} }, null, 2)
        : next.kind === 'integration' && next.config.mode === 'soap'
          ? initialSoap(next)
          : '{}'
    );
    setSelectedConcepts([]);
    setResult(undefined);
    setResponse(undefined);
    setRevealedHintIds([]);
  };

  useEffect(() => {
    let active = true;
    setReady(false);
    getProgress().then((progress) => {
      if (!active) return;
      const savedId = progress.lastTaskIdsByDomain?.[domain];
      const next = domainTasks.find((item) => item.id === savedId) ?? domainTasks[0];
      setTaskId(next.id);
      setSolvedIds(progress.solvedTaskIds);
      resetForTask(next);
      setRevealedHintIds(progress.revealedHints[next.id] ?? []);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [domain, domainTasks]);

  const selectTask = (nextId: string) => {
    const next = domainTasks.find((item) => item.id === nextId);
    if (!next) return;
    setTaskId(next.id);
    resetForTask(next);
    void getProgress().then((progress) => setRevealedHintIds(progress.revealedHints[next.id] ?? []));
    void setLastApiTask(next.id, domain);
  };

  const finishCheck = async (check: ApiQuestCheckResult) => {
    setResult(check);
    await recordApiTaskAttempt(task.id, domain);
    if (check.ok) {
      const progress = await solveApiTask(task.id, domain);
      setSolvedIds(progress.solvedTaskIds);
    }
  };

  const handleCheck = async () => {
    if (task.kind === 'rest') {
      let body: unknown;
      try {
        body = restDraft.body.trim() ? JSON.parse(restDraft.body) : undefined;
      } catch {
        await finishCheck(checkJson(restDraft.body, { schema: { type: 'object' } }));
        return;
      }
      const query = restDraft.query;
      const headers = restDraft.headers;
      const finalPath = task.config.pathParams.length > 0
        ? buildPathFromTemplate(task.config.path, restDraft.pathParams)
        : restDraft.path;
      const apiResponse = simulateApiRequest({
        method: restDraft.method,
        path: finalPath,
        query,
        headers,
        body
      });
      setResponse(apiResponse);
      await finishCheck(
        checkRest(
          {
            method: restDraft.method,
            path: finalPath,
            pathParams: restDraft.pathParams,
            query,
            headers,
            body,
            expectedStatus: apiResponse.status,
            response: apiResponse.body
          },
          task.config
        )
      );
      return;
    }
    if (task.kind === 'json') {
      await finishCheck(checkJson(editorValue, task.config));
      return;
    }
    if (task.kind === 'openapi') {
      await finishCheck(checkOpenApi(editorValue, task.config));
      return;
    }
    if (task.config.mode === 'soap') {
      await finishCheck(checkSoap(editorValue, task.config));
      return;
    }
    await finishCheck(checkIntegration(selectedConcepts, task.config));
  };

  const revealNextHint = async () => {
    const hint = task.hints.find((item) => !revealedHintIds.includes(item.id));
    if (!hint) return;
    const progress = await revealApiTaskHint(task.id, hint.id, domain);
    setRevealedHintIds(progress.revealedHints[task.id] ?? []);
  };

  const editor =
    task.kind === 'rest' ? (
      <RestBuilder task={task} draft={restDraft} onChange={setRestDraft} onCheck={handleCheck} />
    ) : task.kind === 'json' || task.kind === 'openapi' ? (
      <ContractEditor task={task} value={editorValue} onChange={setEditorValue} onCheck={handleCheck} />
    ) : (
      <IntegrationEditor
        task={task}
        selected={selectedConcepts}
        value={editorValue}
        onSelected={setSelectedConcepts}
        onValue={setEditorValue}
        onCheck={handleCheck}
      />
    );

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" aria-label="Загрузка тренажёра" />;
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[250px_minmax(0,1fr)_300px]" data-testid="api-quest-workspace">
      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <Panel title={domainTitles[domain]}>
            <div className="space-y-2">
              {domainTasks.map((item, index) => (
                <button
                  key={item.id}
                  className={`w-full rounded-md border p-2.5 text-left transition ${
                    item.id === task.id
                      ? 'border-electric/60 bg-electric/10'
                      : 'border-white/10 bg-black/10 hover:bg-white/[0.06]'
                  }`}
                  onClick={() => selectTask(item.id)}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                    {solvedIds.includes(item.id) && <CheckCircle2 size={14} className="text-success" />}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-200">{item.title}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </aside>

      <main className="min-w-0 space-y-3 pb-16 xl:pb-0">
        <label className="block text-xs text-slate-400 xl:hidden">
          Учебная задача
          <select className={`${inputClass} mt-1`} value={task.id} onChange={(event) => selectTask(event.target.value)}>
            {domainTasks.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title}</option>)}
          </select>
        </label>
        {domain === 'rest' && task.id === domainTasks[0].id && <RestOnboarding />}
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-electric">{domainTitles[domain]}</div>
              <h1 className="mt-1 text-lg font-bold text-slate-50">{task.title}</h1>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">{task.level} · {task.estimatedFocus}</span>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-300"><GlossaryText>{task.learningGoal}</GlossaryText></p>
          <p className="mt-2 text-xs text-amber">{task.shortIntro}</p>
        </section>
        {task.kind === 'rest' && <RestBeforeSolution key={task.id} task={task} />}
        <Panel title="Рабочая область">{editor}</Panel>
        <Panel title="Результат и диагностика" action={<Database size={16} className="text-electric" />}>
          <DiagnosticPanel result={result} successMessage={task.successMessage} />
          {response && (
            <details className="mt-3 rounded-md border border-white/10 bg-black/20 p-3" data-testid="api-response-viewer">
              <summary className="cursor-pointer text-sm font-semibold text-electric">
                Response viewer · HTTP {response.status}
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-300">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </details>
          )}
        </Panel>
        <div className="space-y-2 xl:hidden">
          <details className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-200">Контекст и теория</summary>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
              <p><GlossaryText>{task.caseContext}</GlossaryText></p><p><GlossaryText>{task.businessGoal}</GlossaryText></p><p><GlossaryText>{task.explanation}</GlossaryText></p>
            </div>
          </details>
          <details className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-200">Подсказки</summary>
            <div className="mt-3 space-y-2">
              {task.hints.filter((hint) => revealedHintIds.includes(hint.id)).map((hint) => (
                <p key={hint.id} className="text-sm text-slate-300">{hint.text}</p>
              ))}
              <Button variant="soft" onClick={revealNextHint} disabled={revealedHintIds.length >= task.hints.length}><ChevronDown size={15} /> Открыть подсказку</Button>
            </div>
          </details>
          <details className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-200">Связанная теория</summary>
            <Link className="mt-3 flex items-center gap-2 text-sm font-semibold text-electric" to={`/knowledge?node=${taskKnowledge(task)}`}>
              <BookOpen size={16} /> Открыть материал
            </Link>
            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">
              {task.commonMistakes.map((mistake) => <li key={mistake}>• {mistake}</li>)}
            </ul>
          </details>
        </div>
      </main>

      <aside className="hidden min-w-0 space-y-3 xl:block">
        <Panel title="Контекст">
          <p className="text-sm leading-6 text-slate-300"><GlossaryText>{task.caseContext}</GlossaryText></p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-electric">Цель бизнеса</p>
          <p className="mt-1 text-sm leading-6 text-slate-400"><GlossaryText>{task.businessGoal}</GlossaryText></p>
        </Panel>
        <Panel title="Подсказки" action={<KeyRound size={15} className="text-amber" />}>
          <div className="space-y-2">
            {task.hints.filter((hint) => revealedHintIds.includes(hint.id)).map((hint) => (
              <div key={hint.id} className="rounded-md bg-white/[0.05] p-2 text-sm text-slate-300">{hint.text}</div>
            ))}
            <Button className="w-full" variant="soft" onClick={revealNextHint} disabled={revealedHintIds.length >= task.hints.length}>
              <ChevronDown size={15} /> Открыть следующую
            </Button>
          </div>
        </Panel>
        <Panel title="Знание">
          <Link className="flex items-center gap-2 text-sm font-semibold text-electric" to={`/knowledge?node=${taskKnowledge(task)}`}>
            <BookOpen size={16} /> Открыть материал
          </Link>
          <details className="mt-3 border-t border-white/10 pt-3">
            <summary className="cursor-pointer text-sm text-slate-300">Частые ошибки</summary>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
              {task.commonMistakes.map((mistake) => <li key={mistake}>• {mistake}</li>)}
            </ul>
          </details>
        </Panel>
      </aside>
    </div>
  );
}
