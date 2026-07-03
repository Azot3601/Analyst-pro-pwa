import { knowledgeNodeSchema, type KnowledgeNode } from '../entities/schemas';
import { richNodes } from './knowledgeRich';

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
  'SELECT и FROM',
  'WHERE-фильтрация',
  'JOIN',
  'JOIN-связи',
  'LEFT JOIN',
  'GROUP BY',
  'HAVING',
  'CASE WHEN',
  'Подзапрос',
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
  ,'HTTP methods'
  ,'Required vs optional'
  ,'Nullable'
  ,'Enum'
  ,'Breaking changes'
  ,'Timeout'
  ,'Async operation'
  ,'Request ID'
  ,'SOAP'
  ,'WSDL'
  ,'XSD'
  ,'SOAP Fault'
  ,'Валидация'
  ,'Верификация'
  ,'Валидация требований'
  ,'Верификация требований'
  ,'Прослеживаемость требований'
  ,'Приоритизация'
  ,'MoSCoW'
  ,'Конфликт интересов'
  ,'Допущение'
  ,'Стейкхолдер'
  ,'Scope'
  ,'Элиситация'
  ,'Scope creep'
  ,'Kano'
  ,'Baseline'
  ,'Управление изменениями'
  ,'Прототип'
  ,'Бизнес-правила'
  ,'Атрибуты качества'
  ,'MVP'
];

const slugOverrides: Record<string, string> = {
  REST: 'rest',
  HTTP: 'http',
  JSON: 'json',
  SQL: 'sql',
  ERD: 'erd',
  OpenAPI: 'openapi',
  'JSON Schema': 'json-schema',
  'SELECT и FROM': 'sql-select-from',
  'WHERE-фильтрация': 'sql-where-filter',
  JOIN: 'join',
  'JOIN-связи': 'sql-join-relations',
  'LEFT JOIN': 'sql-left-join',
  'GROUP BY': 'sql-group-by',
  HAVING: 'sql-having',
  'CASE WHEN': 'sql-case-when',
  Подзапрос: 'sql-subquery',
  CTE: 'sql-cte',
  'Оконные функции': 'sql-window-functions',
  'Качество данных': 'data-quality',
  Интеграции: 'integration',
  Идемпотентность: 'idempotency',
  'Error model': 'api-error-model',
  Пагинация: 'pagination',
  Совместимость: 'compatibility',
  'Совместимость API': 'compatibility',
  Webhooks: 'webhooks',
  'Асинхронное взаимодействие': 'async'
  ,'HTTP methods': 'http-methods'
  ,'Required vs optional': 'required-vs-optional'
  ,'Nullable': 'nullable'
  ,'Enum': 'enum'
  ,'Breaking changes': 'breaking-changes'
  ,'Timeout': 'timeout'
  ,'Async operation': 'async-operation'
  ,'Request ID': 'request-id'
  ,'SOAP': 'soap'
  ,'WSDL': 'wsdl'
  ,'XSD': 'xsd'
  ,'SOAP Fault': 'soap-fault'
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
  Partial<
    Pick<
      KnowledgeNode,
      | 'summary'
      | 'fullText'
      | 'whyItMatters'
      | 'walkthrough'
      | 'diagramId'
      | 'examples'
      | 'antiExamples'
      | 'related'
      | 'tags'
    >
  >
> = {
  sql: {
    summary: 'SQL помогает аналитику проверять гипотезы по данным, искать расхождения и формулировать отчётные правила.',
    fullText:
      'SQL для системного аналитика — это не только технический навык. Он нужен, чтобы проверить бизнес-правило на данных, найти разрыв между процессами, описать источник показателя и объяснить разработчикам или бизнесу, почему результат считается корректным.',
    examples: ['Найти paid-заказы без события доставки accepted.', 'Сверить сумму captured-платежей с суммой заказа.'],
    antiExamples: ['Писать SELECT * без понимания нужных колонок.', 'Считать SQL-ответ правильным без проверки бизнес-смысла.'],
    related: [
      { id: 'sql-join-relations', relation: 'used_in' },
      { id: 'erd', relation: 'prerequisite' },
      { id: 'data-quality', relation: 'used_in' }
    ],
    tags: ['sql', 'данные', 'hard-skills']
  },
  'sql-select-from': {
    summary: 'SELECT и FROM задают, какие поля и из какого источника нужны для ответа.',
    fullText:
      'Базовый SELECT важен не как формальность, а как первый аналитический разрез. Хороший запрос выбирает только нужные колонки, фиксирует источник данных через FROM и при необходимости стабилизирует обзор через ORDER BY и LIMIT.',
    examples: ['SELECT id, status, total FROM orders ORDER BY id LIMIT 3.'],
    antiExamples: ['Начинать расследование с SELECT * и спорить по лишним полям.'],
    related: [
      { id: 'sql', relation: 'prerequisite' },
      { id: 'sql-where-filter', relation: 'used_in' }
    ],
    tags: ['sql', 'select', 'основа']
  },
  'sql-where-filter': {
    summary: 'WHERE переводит бизнес-условие в набор строк, которые подходят под правило.',
    fullText:
      'Фильтрация через WHERE отделяет релевантные записи от шума. Аналитик должен явно понимать, какой статус, диапазон, шаблон или NULL-состояние отражает бизнес-смысл задачи.',
    examples: ["WHERE status = 'paid' AND total BETWEEN 1000 AND 6000."],
    antiExamples: ['Смешать статус заказа и статус платежа, потому что оба называются status.'],
    related: [
      { id: 'sql-select-from', relation: 'prerequisite' },
      { id: 'sql-group-by', relation: 'used_in' }
    ],
    tags: ['sql', 'where', 'фильтрация']
  },
  'sql-group-by': {
    summary: 'GROUP BY собирает строки в группы, а агрегаты превращают их в показатели.',
    fullText:
      'GROUP BY нужен, когда вопрос звучит как “сколько”, “на какую сумму”, “в каком регионе больше”. Важно фильтровать строки до группировки через WHERE и давать агрегатам понятные имена.',
    examples: ['COUNT(*) AS cnt, SUM(total) AS total_sum по status или region.'],
    antiExamples: ['Вывести неагрегированную колонку без понимания, почему она не входит в GROUP BY.'],
    related: [
      { id: 'sql-where-filter', relation: 'prerequisite' },
      { id: 'sql-having', relation: 'used_in' }
    ],
    tags: ['sql', 'агрегации', 'метрики']
  },
  'sql-join-relations': {
    summary: 'JOIN соединяет сущности по ключам модели данных, а не по похожим названиям колонок.',
    fullText:
      'JOIN нужен, чтобы связать заказ с клиентом, платежом или событием. Главный риск — выбрать неверную связь и получить правдоподобный, но неверный результат.',
    examples: ['orders.customer_id соединяется с customers.id.'],
    antiExamples: ['Соединить orders.id с customers.id только потому, что обе колонки называются id.'],
    related: [
      { id: 'erd', relation: 'prerequisite' },
      { id: 'sql-left-join', relation: 'used_in' }
    ],
    tags: ['sql', 'join', 'модель данных']
  },
  'sql-left-join': {
    summary: 'LEFT JOIN сохраняет строки слева и помогает найти отсутствующие связанные факты.',
    fullText:
      'LEFT JOIN особенно полезен в расследованиях: “заказ есть, а события доставки нет”, “клиент есть, а заказов нет”. После такого соединения отсутствие справа обычно проверяется через IS NULL.',
    examples: ['Paid-заказы без delivery_events.event_type = accepted.'],
    antiExamples: ['Использовать INNER JOIN и случайно скрыть именно те строки, где связь отсутствует.'],
    related: [
      { id: 'sql-join-relations', relation: 'prerequisite' },
      { id: 'integration', relation: 'used_in' }
    ],
    tags: ['sql', 'left-join', 'качество данных']
  },
  'sql-having': {
    summary: 'HAVING фильтрует группы после агрегации.',
    fullText:
      'HAVING используется, когда условие зависит от COUNT, SUM, AVG или другого агрегата. WHERE фильтрует строки до GROUP BY, HAVING — уже посчитанные группы.',
    examples: ['HAVING COUNT(*) > 1 для поиска дублей.'],
    antiExamples: ['Писать WHERE COUNT(*) > 1.'],
    related: [
      { id: 'sql-group-by', relation: 'prerequisite' },
      { id: 'idempotency', relation: 'used_in' }
    ],
    tags: ['sql', 'having', 'агрегации']
  },
  'sql-case-when': {
    summary: 'CASE WHEN превращает условия в понятные категории.',
    fullText:
      'CASE помогает аналитику перевести технические коды в бизнес-состояния: accepted, failed, missing; ok или needs_review. Это делает результат пригодным для обсуждения, отчёта или ручной очереди.',
    examples: ['CASE WHEN event_type = accepted THEN accepted ELSE missing END.'],
    antiExamples: ['Вернуть сырые коды без объяснения, какие действия по ним нужны.'],
    related: [
      { id: 'sql-left-join', relation: 'used_in' },
      { id: 'data-quality', relation: 'used_in' }
    ],
    tags: ['sql', 'case', 'классификация']
  },
  'sql-subquery': {
    summary: 'Подзапрос позволяет использовать результат одного SELECT внутри другого.',
    fullText:
      'Подзапрос полезен, когда критерий зависит от данных: выше средней суммы, входит в список captured-платежей, существует связанный факт. Он снижает риск магических чисел в запросе.',
    examples: ['WHERE total > (SELECT AVG(total) FROM orders).'],
    antiExamples: ['Вписать среднее вручную и забыть, что данные меняются.'],
    related: [
      { id: 'sql-cte', relation: 'used_in' },
      { id: 'sql-where-filter', relation: 'prerequisite' }
    ],
    tags: ['sql', 'subquery', 'динамические условия']
  },
  'sql-cte': {
    summary: 'CTE через WITH делает сложный запрос читаемым как последовательность шагов.',
    fullText:
      'CTE полезен для сверок и расследований: сначала посчитать промежуточный набор, потом соединить его с основными сущностями. Это облегчает ревью запроса и разговор с командой.',
    examples: ['WITH captured AS (...) SELECT ... FROM orders LEFT JOIN captured ...'],
    antiExamples: ['Спрятать всю сверку в один нечитаемый вложенный SELECT.'],
    related: [
      { id: 'sql-subquery', relation: 'prerequisite' },
      { id: 'data-quality', relation: 'used_in' }
    ],
    tags: ['sql', 'cte', 'сверка']
  },
  'sql-window-functions': {
    summary: 'Оконные функции добавляют расчёты к строкам, не схлопывая их в группы.',
    fullText:
      'ROW_NUMBER, RANK, LAG и SUM OVER позволяют строить рейтинги, смотреть предыдущие события и считать накопительные показатели. Это важно для воронок, динамики, когорт-lite и поиска аномалий.',
    examples: ['ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC).'],
    antiExamples: ['Использовать GROUP BY, когда нужно сохранить id конкретной строки.'],
    related: [
      { id: 'sql-cte', relation: 'prerequisite' },
      { id: 'sql-group-by', relation: 'contrasts_with' }
    ],
    tags: ['sql', 'window-functions', 'advanced']
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
  'required-vs-optional': {
    summary: 'Required определяет обязательность поля, а optional разрешает полю отсутствовать.',
    fullText:
      'Аналитик фиксирует обязательность отдельно для запроса и ответа. Optional не означает null: отсутствующее поле и поле со значением null — разные состояния контракта и бизнес-смысла.',
    examples: ['orderId обязателен, comment может отсутствовать.'],
    antiExamples: ['Считать все nullable-поля необязательными.'],
    related: [
      { id: 'json-schema', relation: 'used_in' },
      { id: 'nullable', relation: 'contrasts_with' }
    ],
    tags: ['json', 'schema', 'required']
  },
  nullable: {
    summary: 'Nullable разрешает явное значение null, но само поле при этом может оставаться обязательным.',
    fullText:
      'Поле delivery может присутствовать всегда, но быть null до назначения доставки. Это отличается от optional-поля, которое вообще может отсутствовать в документе.',
    examples: ['"delivery": null до назначения курьера.'],
    antiExamples: ['Удалить обязательное nullable-поле из ответа.'],
    related: [
      { id: 'required-vs-optional', relation: 'contrasts_with' },
      { id: 'json-schema', relation: 'used_in' }
    ],
    tags: ['json', 'nullable', 'контракт']
  },
  openapi: {
    summary: 'OpenAPI — машиночитаемая карта договора: paths, methods, parameters, bodies, responses и schemas.',
    fullText:
      'Системный аналитик читает OpenAPI не как YAML-файл, а как проверяемый договор между потребителем и сервисом. В нём должны быть happy path, ошибки, обязательность, примеры и совместимые правила развития.',
    examples: ['POST /orders описывает requestBody, 201, 422 и ссылки на схемы.'],
    antiExamples: ['Описать только 200 и оставить модель ошибки устной договорённостью.'],
    related: [
      { id: 'rest', relation: 'prerequisite' },
      { id: 'api-error-model', relation: 'used_in' },
      { id: 'breaking-changes', relation: 'used_in' }
    ],
    tags: ['openapi', 'api', 'contract']
  },
  'breaking-changes': {
    summary: 'Breaking change заставляет существующего потребителя менять код или ломает его ожидания.',
    fullText:
      'Удаление поля, смена типа, новый required-параметр или удаление response — типовые ломающие изменения. Добавление optional-поля обычно совместимо.',
    examples: ['Смена total с number на string ломает клиентов.'],
    antiExamples: ['Назвать любое добавление поля breaking change.'],
    related: [
      { id: 'compatibility', relation: 'prerequisite' },
      { id: 'openapi', relation: 'used_in' }
    ],
    tags: ['api', 'compatibility', 'openapi']
  },
  timeout: {
    summary: 'Timeout ограничивает время ожидания и переводит неопределённость сети в явный сценарий.',
    fullText:
      'После timeout неизвестно, выполнила ли удалённая система операцию. Поэтому повтор небезопасной команды требует идемпотентности и согласованной retry policy.',
    examples: ['Таймаут 3 секунды, затем retry только для 502/503/504.'],
    antiExamples: ['Повторять POST бесконечно после любого ответа.'],
    related: [
      { id: 'retry-policy', relation: 'used_in' },
      { id: 'idempotency', relation: 'used_in' }
    ],
    tags: ['integration', 'timeout', 'reliability']
  },
  soap: {
    summary: 'SOAP — строгий XML-протокол с Envelope, Header, Body и формализованным Fault.',
    fullText:
      'SOAP-контракт обычно описывается WSDL и XSD. Аналитику важно найти operation, структуру сообщения, namespace и модель ошибки, а не запоминать XML наизусть.',
    examples: ['Envelope содержит Header и Body с GetDebtRequest.'],
    antiExamples: ['Отправить operation вне SOAP Body.'],
    related: [
      { id: 'xml', relation: 'prerequisite' },
      { id: 'wsdl', relation: 'used_in' },
      { id: 'soap-fault', relation: 'used_in' }
    ],
    tags: ['soap', 'xml', 'integration']
  },
  wsdl: {
    summary: 'WSDL описывает операции, сообщения, binding и адрес SOAP-службы.',
    fullText:
      'WSDL отвечает на вопросы: какие operation доступны, какие XML-сообщения ожидаются и куда обращаться. XSD задаёт строгие типы полей внутри сообщений.',
    examples: ['operation GetDebt связана с GetDebtRequest и GetDebtResponse.'],
    antiExamples: ['Считать WSDL примером одного XML-запроса.'],
    related: [
      { id: 'soap', relation: 'prerequisite' },
      { id: 'xsd', relation: 'used_in' }
    ],
    tags: ['soap', 'wsdl', 'contract']
  },
  'soap-fault': {
    summary: 'SOAP Fault — стандартизированная ошибка внутри SOAP Body.',
    fullText:
      'Fault должен сообщать код, причину и при необходимости детали. HTTP 500 без SOAP Fault недостаточен для согласованной обработки бизнес-ошибки.',
    examples: ['Fault содержит Code, Reason и Detail для DEBTOR_NOT_FOUND.'],
    antiExamples: ['Вернуть произвольный XML с полем error.'],
    related: [
      { id: 'soap', relation: 'used_in' },
      { id: 'api-error-model', relation: 'related' }
    ],
    tags: ['soap', 'fault', 'errors']
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

    return { ...baseNode, ...curatedNodes[id], ...richNodes[id] } satisfies KnowledgeNode;
  })
);

export function findKnowledge(id: string) {
  return knowledgeNodes.find((node) => node.id === id);
}
