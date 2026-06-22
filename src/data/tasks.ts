import { type Task, taskSchema } from '../entities/schemas';
import { apiQuestTasks } from './apiQuest';
import { erdText, sqlSchema } from './sqlSeed';

const baseHints = (domain: string) => [
  { id: `${domain}-h1`, level: 1, title: 'Лёгкий намёк', text: 'Начните с бизнес-цели и нужных сущностей.' },
  { id: `${domain}-h2`, level: 2, title: 'Направление', text: 'Проверьте статусы, обязательные поля и связи между артефактами.' },
  { id: `${domain}-h3`, level: 3, title: 'Структура', text: 'Разбейте решение на фильтр, проверку условия и объяснение результата.' },
  { id: `${domain}-h4`, level: 4, title: 'Почти решение', text: 'Сформулируйте ответ так, чтобы его можно было проверить автоматически.' },
  { id: `${domain}-h5`, level: 5, title: 'Разбор', text: 'Свяжите решение с риском для пользователя или интеграции.' }
];

const sqlArtifacts = [
  { id: 'schema', title: 'SQL schema и seed', type: 'table' as const, content: sqlSchema },
  { id: 'erd', title: 'ERD', type: 'erd' as const, content: erdText }
];

const sqlTasks: Task[] = [
  {
    id: 'sql-paid-without-delivery',
    title: 'Оплаченные заказы без передачи в доставку',
    domain: 'sql',
    level: 'junior',
    difficulty: 1,
    estimatedFocus: '12 минут',
    skills: ['SELECT', 'LEFT JOIN', 'NULL-check'],
    caseContext: 'Команда доставки жалуется, что часть оплаченных заказов не попадает в очередь.',
    businessGoal: 'Найти заказы, которые оплачены, но не имеют события accepted в доставке.',
    taskText: 'Верните `id` оплаченных заказов без события `accepted` в `delivery_events`.',
    inputArtifacts: sqlArtifacts,
    hints: baseHints('sql-paid'),
    expectedAnswer: [{ id: 1001 }],
    validation: { kind: 'sql-result', expectedRows: [{ id: 1001 }], orderMatters: false },
    explanation: 'LEFT JOIN позволяет увидеть отсутствие связанного события доставки. Для аналитика это типовая проверка разрыва между оплатой и fulfillment.',
    commonMistakes: ['Использовать INNER JOIN и потерять заказы без событий.', 'Проверять любой delivery event вместо accepted.'],
    relatedKnowledgeIds: ['sql', 'join', 'integration']
  },
  {
    id: 'sql-duplicate-payments',
    title: 'Дубли платежей по idempotency key',
    domain: 'sql',
    level: 'junior+',
    difficulty: 2,
    estimatedFocus: '15 минут',
    skills: ['GROUP BY', 'HAVING', 'идемпотентность'],
    caseContext: 'Платёжный провайдер прислал повторный callback.',
    businessGoal: 'Найти ключи идемпотентности, по которым есть более одного списания.',
    taskText: 'Верните `idempotency_key` и `cnt` для дублей captured-платежей.',
    inputArtifacts: sqlArtifacts,
    hints: baseHints('sql-duplicates'),
    expectedAnswer: [{ idempotency_key: 'pay-1003', cnt: 2 }],
    validation: {
      kind: 'sql-result',
      expectedRows: [{ idempotency_key: 'pay-1003', cnt: 2 }],
      orderMatters: false
    },
    explanation: 'HAVING COUNT(*) > 1 выявляет нарушение идемпотентности на уровне данных.',
    commonMistakes: ['Считать все статусы платежей.', 'Не исключить NULL idempotency_key.'],
    relatedKnowledgeIds: ['sql', 'idempotency', 'api-error-model']
  }
];

const sqlScenarioTemplates = [
  {
    skills: ['WHERE', 'статусная модель'],
    text: 'Верните `id` и `status` отменённых заказов.',
    expectedRows: [{ id: 1004, status: 'cancelled' }]
  },
  {
    skills: ['GROUP BY', 'HAVING'],
    text: 'Найдите `order_id` и `cnt` для заказов, у которых больше одного captured-платежа.',
    expectedRows: [{ order_id: 1003, cnt: 2 }]
  },
  {
    skills: ['JOIN', 'агрегаты'],
    text: 'Посчитайте `cnt` и `total_sum` оплаченных заказов по `region` клиентов.',
    expectedRows: [
      { region: 'siberia', cnt: 1, total_sum: 980 },
      { region: 'ural', cnt: 2, total_sum: 13900 }
    ]
  },
  {
    skills: ['LEFT JOIN', 'качество данных'],
    text: 'Верните `id` заказов со статусом paid, у которых нет ни одного события доставки.',
    expectedRows: [{ id: 1001 }]
  },
  {
    skills: ['ORDER BY', 'LIMIT'],
    text: 'Верните самый дорогой заказ: `id` и `total`.',
    expectedRows: [{ id: 1005, total: 8300 }]
  }
] as const;

const generatedSqlTasks: Task[] = Array.from({ length: 28 }, (_, index) => {
  const n = index + 3;
  const difficulty = Math.min(5, Math.ceil(n / 6)) as 1 | 2 | 3 | 4 | 5;
  const template = sqlScenarioTemplates[index % sqlScenarioTemplates.length];
  return {
    id: `sql-scenario-${n}`,
    title: `SQL-кейс ${n}: аналитический вопрос по заказам`,
    domain: 'sql',
    level: difficulty < 3 ? 'junior+' : difficulty < 5 ? 'middle' : 'middle+',
    difficulty,
    estimatedFocus: `${10 + difficulty * 5} минут`,
    skills: ['SQL', ...template.skills],
    caseContext: 'Продуктовая команда разбирает расхождения между заказами, платежами и доставкой.',
    businessGoal: 'Сформировать проверяемый SQL-ответ для бизнес-вопроса.',
    taskText: template.text,
    inputArtifacts: sqlArtifacts,
    hints: baseHints(`sql-generated-${n}`),
    expectedAnswer: template.expectedRows,
    validation: { kind: 'sql-result', expectedRows: [...template.expectedRows], orderMatters: false },
    explanation: 'Задача тренирует перевод бизнес-вопроса в проверяемый SQL и интерпретацию результата.',
    commonMistakes: ['Не уточнить статусную модель.', 'Смешать бизнес-статус заказа и техническое событие интеграции.'],
    relatedKnowledgeIds: ['sql', 'erd', 'data-quality']
  };
});

const apiTasks: Task[] = apiQuestTasks.map((task) => taskSchema.parse(task));

export const tasks = taskSchema.array().parse([
  ...sqlTasks,
  ...generatedSqlTasks,
  ...apiTasks
]);

export const featuredTask = tasks[0];
