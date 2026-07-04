// Глоссарий подсветки терминов: фраза → id узла базы знаний.
// Старт со среза REST + JSON. Расширяется на остальные кластеры тем же образом.
// Подсветка превращает любой текст тренажёра в «кликабельный»: незнакомое слово →
// переход в базу знаний.

const termMap: Record<string, string[]> = {
  rest: ['REST'],
  http: ['HTTP'],
  'http-methods': ['HTTP-метод', 'HTTP-методы', 'HTTP метод', 'HTTP-метода', 'HTTP method'],
  'status-codes': ['статус-код', 'статус-кода', 'статус-коды', 'статус-кодов', 'status code', 'HTTP-статус'],
  endpoint: ['endpoint', 'эндпоинт', 'эндпоинта'],
  'path-parameter': ['path-параметр', 'path-параметра', 'path-параметры', 'path parameter', 'path-param'],
  'query-parameter': ['query-параметр', 'query-параметра', 'query-параметры', 'query parameter', 'query-param'],
  headers: ['Content-Type', 'Idempotency-Key', 'Authorization', 'заголовок', 'заголовки', 'заголовков'],
  'request-body': ['request body', 'тело запроса'],
  'response-body': ['response body', 'тело ответа'],
  json: ['JSON'],
  'json-schema': ['JSON Schema', 'JSON-схема', 'JSON-схемы', 'схема валидации'],
  'required-vs-optional': ['required', 'обязательное поле', 'обязательность'],
  nullable: ['nullable', 'nullable-поле'],
  enum: ['enum'],
  'api-error-model': ['модель ошибки', 'error model', 'контракт ошибки'],
  idempotency: ['идемпотентность', 'идемпотентн', 'идемпотентный', 'идемпотентная', 'идемпотентного'],
  'breaking-changes': ['breaking change', 'breaking-change', 'ломающее изменение', 'ломающих изменений'],
  compatibility: ['обратная совместимость', 'совместимость', 'совместимости'],
  pagination: ['пагинация', 'пагинации', 'pagination'],
  'retry-policy': ['retry policy', 'retry-policy', 'политика повторов'],
  webhooks: ['webhook', 'webhooks', 'вебхук'],
  openapi: ['OpenAPI'],
  'request-id': ['Request ID', 'requestId', 'correlationId', 'correlation id'],

  // SQL и данные
  sql: ['SQL'],
  'sql-join-relations': ['JOIN', 'INNER JOIN'],
  'sql-left-join': ['LEFT JOIN'],
  'sql-group-by': ['GROUP BY', 'группировка'],
  'sql-where-filter': ['WHERE'],
  'sql-having': ['HAVING'],
  'sql-case-when': ['CASE WHEN'],
  нормализация: ['нормализация', 'нормализации'],

  // Требования и качество
  требования: ['требование', 'требования', 'требований'],
  'функциональные-требования': ['функциональное требование', 'функциональные требования'],
  'нефункциональные-требования': ['нефункциональные требования', 'нефункциональное требование', 'НФТ'],
  'бизнес-требования': ['бизнес-требование', 'бизнес-требования'],
  'пользовательская-история': ['user story', 'user-story', 'пользовательская история'],
  'use-case': ['use case', 'use-case', 'юзкейс'],
  'acceptance-criteria': ['критерии приёмки', 'критериев приёмки', 'acceptance criteria'],
  ambiguity: ['неоднозначность', 'неоднозначности'],
  'stakeholder-interview': ['интервью со стейкхолдером'],
  'edge-cases': ['edge case', 'edge cases', 'граничные случаи', 'граничный случай'],

  // Моделирование
  erd: ['ERD', 'ER-диаграмма'],
  bpmn: ['BPMN'],
  uml: ['UML'],
  crud: ['CRUD'],

  // Интеграции
  integration: ['интеграция', 'интеграции', 'интеграций'],
  'синхронное-взаимодействие': ['синхронное', 'синхронного', 'синхронно'],
  async: ['асинхронное', 'асинхронного', 'асинхронно'],
  очереди: ['очередь', 'очереди', 'очередей'],
  события: ['событие', 'события', 'событий'],
  soap: ['SOAP'],
  wsdl: ['WSDL'],
  xsd: ['XSD'],
  'soap-fault': ['SOAP Fault'],
  микросервисы: ['микросервис', 'микросервисы', 'микросервисов'],
  монолит: ['монолит', 'монолита'],
  'api-gateway': ['API Gateway', 'API-шлюз'],

  // Безопасность и доступ
  аутентификация: ['аутентификация', 'аутентификации'],
  авторизация: ['авторизация', 'авторизации'],
  oauth2: ['OAuth2', 'OAuth 2.0', 'OAuth'],
  jwt: ['JWT'],
  'роли-и-права': ['роли и права', 'RBAC'],

  // НФТ, надёжность, наблюдаемость
  observability: ['observability', 'наблюдаемость'],
  логирование: ['логирование', 'логи'],
  мониторинг: ['мониторинг', 'мониторинга'],
  трассировка: ['трассировка', 'трассировки'],
  'trace-id': ['trace id', 'trace-id'],
  'correlation-id': ['correlation id', 'correlation-id'],
  sla: ['SLA'],
  slo: ['SLO', 'SLI'],
  performance: ['производительность'],
  reliability: ['надёжность'],
  security: ['безопасность'],
  scalability: ['масштабируемость'],
  availability: ['доступность'],

  // Решения и архитектура
  adr: ['ADR'],
  'risk-matrix': ['матрица рисков', 'риск-матрица'],
  'trade-off-matrix': ['trade-off', 'матрица компромиссов'],

  // Данные и контракты
  reconciliation: ['сверка', 'сверки', 'reconciliation'],
  версионирование: ['версионирование', 'версионирования'],
  'bounded-context': ['bounded context', 'ограниченный контекст'],
  'ddd-basics': ['DDD'],
  xml: ['XML'],
  swagger: ['Swagger'],

  // Требования и бизнес-анализ (статья «Профессия»)
  'валидация-требований': ['валидация требований', 'валидации требований', 'валидацию требований'],
  'верификация-требований': ['верификация требований', 'верификации требований'],
  валидация: ['валидация', 'валидации', 'валидацию'],
  верификация: ['верификация', 'верификации', 'верификацию'],
  элиситация: ['элиситация', 'элиситации', 'элиситацию'],
  'прослеживаемость-требований': ['прослеживаемость требований', 'прослеживаемость', 'прослеживаемости', 'traceability'],
  приоритизация: ['приоритизация', 'приоритизации', 'приоритизацию'],
  moscow: ['MoSCoW'],
  kano: ['Kano'],
  'конфликт-интересов': ['конфликт интересов', 'конфликта интересов', 'конфликты интересов'],
  допущение: ['допущение', 'допущения', 'допущений', 'домысел', 'домыслы', 'домыслов'],
  'scope-creep': ['scope creep', 'scope-creep'],
  scope: ['out-of-scope', 'in-scope', 'scope'],
  baseline: ['baseline'],
  'управление-изменениями': ['управление изменениями', 'управления изменениями', 'change control'],
  прототип: ['прототип', 'прототипа', 'прототипы', 'прототипирование'],
  'бизнес-правила': ['бизнес-правило', 'бизнес-правила', 'бизнес-правил'],
  'атрибуты-качества': ['атрибуты качества', 'атрибутов качества', 'quality attributes'],
  mvp: ['MVP'],
  стейкхолдер: ['стейкхолдер', 'стейкхолдера', 'стейкхолдеры', 'стейкхолдеров'],

  // Процессы разработки (SDLC / Agile)
  sdlc: ['SDLC'],
  waterfall: ['Waterfall', 'водопад', 'водопадная модель'],
  agile: ['Agile', 'эджайл', 'эджайла'],
  scrum: ['Scrum', 'скрам'],
  kanban: ['Kanban', 'канбан'],
  спринт: ['спринт', 'спринта', 'спринты', 'спринтов'],
  бэклог: ['бэклог', 'бэклога', 'backlog'],
  'definition-of-done': ['Definition of Done', 'DoD']
};

export type GlossaryEntry = { term: string; id: string };

// Длинные фразы — первыми, чтобы «JSON Schema» матчился раньше «JSON».
export const glossaryEntries: GlossaryEntry[] = Object.entries(termMap)
  .flatMap(([id, terms]) => terms.map((term) => ({ term, id })))
  .filter((entry) => entry.term.length >= 3)
  .sort((a, b) => b.term.length - a.term.length);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Граница «слова» с поддержкой кириллицы и латиницы (ASCII \b тут не годится).
const boundaryStart = '(?<![\\p{L}\\p{N}])';
const boundaryEnd = '(?![\\p{L}\\p{N}])';

export const glossaryRegex = new RegExp(
  `${boundaryStart}(${glossaryEntries.map((entry) => escapeRegExp(entry.term)).join('|')})${boundaryEnd}`,
  'giu'
);

const lookup = new Map(glossaryEntries.map((entry) => [entry.term.toLowerCase(), entry.id]));

export function termIdFor(term: string): string | undefined {
  return lookup.get(term.toLowerCase());
}

export type GlossarySegment = { text: string; id?: string };

// Разбивает текст на сегменты; каждое первое вхождение термина получает id узла.
// Повторы того же узла внутри одного текста остаются обычным текстом — без шума.
export function segmentText(text: string): GlossarySegment[] {
  const segments: GlossarySegment[] = [];
  const usedIds = new Set<string>();
  let lastIndex = 0;

  for (const match of text.matchAll(glossaryRegex)) {
    const matchIndex = match.index ?? 0;
    const matched = match[0];
    const id = termIdFor(matched);

    if (!id || usedIds.has(id)) continue;
    usedIds.add(id);

    if (matchIndex > lastIndex) {
      segments.push({ text: text.slice(lastIndex, matchIndex) });
    }
    segments.push({ text: matched, id });
    lastIndex = matchIndex + matched.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }
  return segments;
}
