import { knowledgeNodeSchema, type KnowledgeNode } from '../entities/schemas';

const titles = [
  'Требования',
  'Функциональные требования',
  'Нефункциональные требования',
  'Бизнес-требования',
  'Пользовательская история',
  'Use Case',
  'Acceptance Criteria',
  'BPMN',
  'UML',
  'ERD',
  'CRUD',
  'REST',
  'HTTP',
  'JSON',
  'XML',
  'OpenAPI',
  'Swagger',
  'SQL',
  'Нормализация',
  'Интеграции',
  'Синхронное взаимодействие',
  'Асинхронное взаимодействие',
  'Очереди',
  'События',
  'Webhooks',
  'Идемпотентность',
  'Авторизация',
  'Аутентификация',
  'OAuth2',
  'JWT',
  'Роли и права',
  'SLA',
  'SLO',
  'Логирование',
  'Мониторинг',
  'Трассировка',
  'API Gateway',
  'Микросервисы',
  'Монолит',
  'DDD basics',
  'Bounded Context',
  'Glossary',
  'Data Lineage',
  'Миграции данных',
  'Совместимость API',
  'Версионирование',
  'Edge cases',
  'JSON Schema',
  'Пагинация',
  'Фильтрация',
  'Сортировка',
  'Rate limits',
  'Retry policy',
  'Error model',
  'Контракт API',
  'Endpoint',
  'Path parameter',
  'Query parameter',
  'Headers',
  'Request body',
  'Response body',
  'Status codes',
  'JOIN',
  'LEFT JOIN',
  'GROUP BY',
  'HAVING',
  'CTE',
  'Оконные функции',
  'Качество данных',
  'Reconciliation',
  'Trace ID',
  'Correlation ID',
  'Observability',
  'Performance',
  'Reliability',
  'Security',
  'Scalability',
  'Availability',
  'ADR',
  'Decision Log',
  'Risk Matrix',
  'Trade-off Matrix',
  'Stakeholder Interview',
  'Ambiguity',
  'Data Mapping',
  'Contract Review',
  'Backward Compatibility'
];

const slugOverrides: Record<string, string> = {
  REST: 'rest',
  HTTP: 'http',
  JSON: 'json',
  SQL: 'sql',
  ERD: 'erd',
  OpenAPI: 'openapi',
  'JSON Schema': 'json-schema',
  JOIN: 'join',
  'Качество данных': 'data-quality',
  Интеграции: 'integration',
  Идемпотентность: 'idempotency',
  'Error model': 'api-error-model',
  Пагинация: 'pagination',
  Совместимость: 'compatibility',
  'Совместимость API': 'compatibility',
  Webhooks: 'webhooks',
  'Асинхронное взаимодействие': 'async'
};

const slugify = (title: string) =>
  slugOverrides[title] ??
  title
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('/', '-')
    .replaceAll('.', '')
    .replace(/[^\p{L}\p{N}-]/gu, '');

const curatedNodes: Record<
  string,
  Partial<Pick<KnowledgeNode, 'summary' | 'fullText' | 'examples' | 'antiExamples' | 'related' | 'tags'>>
> = {
  sql: {
    summary: 'SQL помогает аналитику проверять гипотезы по данным, искать расхождения и формулировать отчётные правила.',
    fullText:
      'SQL для системного аналитика — это не только технический навык. Он нужен, чтобы проверить бизнес-правило на данных, найти разрыв между процессами, описать источник показателя и объяснить разработчикам или бизнесу, почему результат считается корректным.',
    examples: ['Найти paid-заказы без события доставки accepted.', 'Сверить сумму captured-платежей с суммой заказа.'],
    antiExamples: ['Писать SELECT * без понимания нужных колонок.', 'Считать SQL-ответ правильным без проверки бизнес-смысла.'],
    related: [
      { id: 'join', relation: 'used_in' },
      { id: 'erd', relation: 'prerequisite' },
      { id: 'data-quality', relation: 'used_in' }
    ],
    tags: ['sql', 'данные', 'hard-skills']
  },
  rest: {
    summary: 'REST — стиль проектирования HTTP API вокруг ресурсов, методов и представлений.',
    fullText:
      'Для системного аналитика REST важен как язык договора между клиентом и сервером: ресурс, endpoint, метод, параметры, request/response, статусы, ошибки, пагинация, сортировка и совместимость изменений.',
    examples: ['GET /api/v1/orders?status=paid&page=1&size=10 для истории заказов.'],
    antiExamples: ['Описать только happy path 200 OK и забыть ошибки, лимиты и пагинацию.'],
    related: [
      { id: 'http', relation: 'prerequisite' },
      { id: 'openapi', relation: 'used_in' },
      { id: 'api-error-model', relation: 'used_in' }
    ],
    tags: ['api', 'rest', 'контракты']
  },
  'json-schema': {
    summary: 'JSON Schema фиксирует структуру JSON: типы, обязательность, nullable, форматы и ограничения.',
    fullText:
      'JSON Schema помогает аналитику превратить пример JSON в проверяемый контракт. Особенно важно различать optional и nullable, фиксировать required-поля и думать о совместимости при развитии API.',
    examples: ['Поле delivery может быть null, но orderId и status обязательны.'],
    antiExamples: ['Удалить поле из ответа без версии API и считать это безопасным изменением.'],
    related: [
      { id: 'json', relation: 'prerequisite' },
      { id: 'compatibility', relation: 'used_in' },
      { id: 'openapi', relation: 'used_in' }
    ],
    tags: ['json', 'schema', 'api']
  },
  idempotency: {
    summary: 'Идемпотентность защищает операции от повторного эффекта при retry, callback и сетевых сбоях.',
    fullText:
      'В интеграциях идемпотентность нужна, чтобы повторный запрос или webhook не создал дубль платежа, заказа или события. Аналитик должен описать ключ идемпотентности, окно хранения, повторный ответ и правила дедупликации.',
    examples: ['POST /payments принимает Idempotency-Key и повторно возвращает исходный operationId.'],
    antiExamples: ['Повторить captured-платёж при каждом повторном callback провайдера.'],
    related: [
      { id: 'webhooks', relation: 'used_in' },
      { id: 'retry-policy', relation: 'used_in' },
      { id: 'api-error-model', relation: 'related' }
    ],
    tags: ['интеграции', 'api', 'надёжность']
  },
  webhooks: {
    summary: 'Webhook — входящее событие от внешней системы, которое требует проверки подписи, retry и дедупликации.',
    fullText:
      'Webhook нельзя считать доставленным ровно один раз и строго по порядку. Аналитик должен описать eventId, подпись, retry policy, идемпотентную обработку, out-of-order события и мониторинг ошибок.',
    examples: ['DELIVERY_ACCEPTED приходит повторно с тем же eventId и не должен менять состояние дважды.'],
    antiExamples: ['Обрабатывать webhook без eventId и без журнала принятых событий.'],
    related: [
      { id: 'async', relation: 'prerequisite' },
      { id: 'idempotency', relation: 'used_in' },
      { id: 'retry-policy', relation: 'used_in' }
    ],
    tags: ['webhooks', 'events', 'integration']
  },
  adr: {
    summary: 'ADR фиксирует архитектурное решение, контекст, варианты, последствия и дату принятия.',
    fullText:
      'ADR полезен системному аналитику, когда нужно сохранить не только выбранное решение, но и причины отказа от альтернатив. Это снижает повторные споры и помогает новым участникам понять ограничения.',
    examples: ['ADR: CodeMirror выбран вместо Monaco из-за меньшего веса PWA.'],
    antiExamples: ['Записать “решили так” без контекста, вариантов и последствий.'],
    related: [
      { id: 'decision-log', relation: 'related' },
      { id: 'trade-off-matrix', relation: 'used_in' }
    ],
    tags: ['decision', 'architecture', 'documentation']
  },
  'нефункциональные-требования': {
    summary: 'НФТ описывают качество системы: производительность, доступность, безопасность, надёжность и наблюдаемость.',
    fullText:
      'Нефункциональные требования должны быть измеримыми. Вместо “система должна работать быстро” аналитик фиксирует целевой latency, нагрузку, доступность, RTO/RPO, требования к логам, метрикам и алертам.',
    examples: ['p95 ответа GET /orders не выше 300 мс при 100 rps.'],
    antiExamples: ['“Система должна быть удобной и быстрой” без метрики и условия проверки.'],
    related: [
      { id: 'sla', relation: 'used_in' },
      { id: 'slo', relation: 'used_in' },
      { id: 'observability', relation: 'used_in' }
    ],
    tags: ['nfr', 'качество', 'требования']
  }
};

export const knowledgeNodes = knowledgeNodeSchema.array().parse(
  titles.map((title, index) => {
    const id = slugify(title);
    const prev = index > 0 ? slugify(titles[index - 1]) : undefined;
    const next = index < titles.length - 1 ? slugify(titles[index + 1]) : undefined;
    const related: KnowledgeNode['related'] = [];
    if (prev) related.push({ id: prev, relation: 'related' });
    if (next) related.push({ id: next, relation: 'used_in' });

    const baseNode = {
      id,
      title,
      type: index % 11 === 0 ? 'practice' : index % 7 === 0 ? 'checklist' : index % 5 === 0 ? 'concept' : 'term',
      level: index < 28 ? 'basic' : index < 62 ? 'intermediate' : 'advanced',
      summary: `${title} — важное понятие для системного анализа, проектирования требований и интеграций.`,
      fullText: `Понятие «${title}» используется, когда аналитик переводит бизнес-потребность в проверяемые артефакты: требования, модели данных, API-контракты, сценарии интеграции и критерии приёмки. Важно фиксировать контекст, границы применимости, риски и частые ошибки.`,
      examples: [`Пример: использовать «${title}» при разборе заказа, платежа или интеграционного события.`],
      antiExamples: [`Антипример: упомянуть «${title}» без критерия проверки и владельца решения.`],
      related,
      tags: [
        index < 18 ? 'требования' : index < 36 ? 'интеграции' : index < 55 ? 'api' : 'практика',
        index % 2 ? 'hard-skills' : 'аналитика'
      ]
    } satisfies KnowledgeNode;

    return { ...baseNode, ...curatedNodes[id] } satisfies KnowledgeNode;
  })
);

export function findKnowledge(id: string) {
  return knowledgeNodes.find((node) => node.id === id);
}
