import { toolkitItemSchema, type ToolkitItem } from '../entities/schemas';

const templates: ToolkitItem[] = [
  ['json', 'JSON formatter', 'Вставьте JSON и получите аккуратное форматирование.', 'JSON', 'json'],
  ['json', 'JSON validator', 'Проверяет синтаксис и объясняет ошибку по-русски.', 'JSON', 'json'],
  ['json', 'JSON diff', 'Сравнивает две структуры и показывает отличия.', 'JSON A / JSON B', 'json'],
  ['json', 'JSON Schema validator', 'Проверяет payload по JSON Schema локально через Ajv.', 'Payload + Schema', 'json-schema'],
  ['json', 'Генератор примера по Schema', 'Создаёт учебный пример по простым правилам schema.', 'JSON Schema', 'json-schema'],
  ['api', 'curl builder', 'Собирает curl-команду из метода, URL, headers и body.', 'HTTP request', 'rest'],
  ['api', 'HTTP status helper', 'Подсказывает смысл статусов и типовые ошибки.', 'Status code', 'http'],
  ['api', 'Endpoint checklist', 'Проверяет полноту endpoint specification.', 'Endpoint draft', 'endpoint'],
  ['api', 'Error model designer', 'Шаблон единой модели ошибок API.', 'Error fields', 'api-error-model'],
  ['api', 'Pagination checklist', 'Чеклист page/size/cursor/sort/total.', 'Pagination draft', 'pagination'],
  ['requirements', 'Генератор требования', 'Структура требования с целью, актором, правилом и критериями.', 'Описание', 'требования'],
  ['requirements', 'Quality checklist', 'Проверка атомарности, проверяемости и однозначности.', 'Текст требования', 'требования'],
  ['requirements', 'Ambiguity detector', 'Rule-based поиск слов риска: быстро, удобно, нормально, и т.п.', 'Текст требования', 'ambiguity'],
  ['requirements', 'User story builder', 'Шаблон As a / I want / So that на русском.', 'Роль + цель', 'пользовательская-история'],
  ['requirements', 'Acceptance criteria builder', 'Given/When/Then критерии приёмки.', 'Сценарий', 'acceptance-criteria'],
  ['sql', 'SQL cheat sheet', 'SELECT, JOIN, GROUP BY, HAVING, CTE, оконные функции.', 'Тема', 'sql'],
  ['sql', 'JOIN visual helper', 'Объясняет INNER/LEFT JOIN на примере заказов.', 'Связь таблиц', 'join'],
  ['integration', 'Integration scenario template', 'Шаблон сценария обмена между системами.', 'Системы', 'integration'],
  ['integration', 'Sync vs async helper', 'Помогает выбрать синхронное или асинхронное взаимодействие.', 'Ограничения', 'async'],
  ['integration', 'Webhook checklist', 'Доставка, подпись, retry, дедупликация, порядок событий.', 'Webhook', 'webhooks'],
  ['integration', 'Retry policy checklist', 'Backoff, max attempts, DLQ, идемпотентность.', 'Ошибка', 'retry-policy'],
  ['nfr', 'Availability calculator', 'Переводит процент доступности в допустимый downtime.', 'SLA', 'availability'],
  ['nfr', 'Observability checklist', 'Логи, метрики, трейсы, алерты, correlation id.', 'Сервис', 'observability'],
  ['decision', 'ADR generator', 'Лёгкий шаблон архитектурного решения.', 'Решение', 'adr'],
  ['decision', 'Risk matrix', 'Вероятность, влияние, mitigation, owner.', 'Риск', 'risk-matrix'],
  ['decision', 'Trade-off matrix', 'Сравнение вариантов по критериям.', 'Варианты', 'trade-off-matrix']
].map(([category, title, description, inputLabel, knowledge]) => ({
  id: title.toLowerCase().replaceAll(' ', '-'),
  category: category as ToolkitItem['category'],
  title,
  description,
  inputLabel,
  tags: [category, 'локально'],
  template: `# ${title}\n\n## Контекст\n\n## Входные данные\n\n## Решение\n\n## Проверка\n`,
  checklist: [
    'Есть бизнес-контекст.',
    'Есть критерий проверки.',
    'Зафиксированы ограничения и edge cases.',
    'Результат можно передать разработчику или стейкхолдеру.'
  ],
  relatedKnowledgeIds: [knowledge]
}));

export const toolkitItems = toolkitItemSchema.array().parse(templates);
