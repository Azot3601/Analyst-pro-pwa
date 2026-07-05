import type {
  ClassificationRule,
  QuestionsRule
} from '../shared/lib/requirementsCheckers';

// Капстоун — сквозной кейс, который проводит одну бизнес-фичу через всю «петлю
// аналитика»: бриф → требования → контракт API → SQL-проверка. Один домен,
// четыре навыка. Всё офлайн и детерминированно.

export const capstoneBrief =
  'Финансовый директор на встрече: «У нас есть оплаченные заказы, которые так и не доехали до клиента — ' +
  'событие доставки accepted по ним не пришло. Клиенты недовольны, а мы узнаём об этом только по жалобам. ' +
  'Нужен механизм: система сама находит такие заказы, показывает их менеджеру и позволяет инициировать возврат. ' +
  'Хорошо бы быстро. Наверное, таких заказов немного. Потом прикрутим авто-возврат без менеджера».';

export const capstoneGoal =
  'Фича «Контроль недоставленных оплаченных заказов»: найти paid-заказы без события доставки accepted, ' +
  'показать менеджеру и дать инициировать возврат.';

// ── Стадия 1. Требования: классификация брифа ───────────────────────────────
export const capstoneClassification: ClassificationRule = {
  statements: [
    { id: 's1', text: 'Система находит оплаченные заказы без события доставки accepted.', label: 'functional', rationale: 'ключевое действие системы — то, ради чего фича.' },
    { id: 's2', text: 'Найденные заказы показываются менеджеру списком.', label: 'functional', rationale: 'конкретное поведение системы.' },
    { id: 's3', text: 'Менеджер может инициировать возврат по заказу.', label: 'functional', rationale: 'действие, доступное пользователю.' },
    { id: 's4', text: 'Список должен формироваться быстро.', label: 'ambiguity', rationale: 'без метрики «быстро» непроверяемо — нужен вопрос.' },
    { id: 's5', text: 'Таких заказов, наверное, немного.', label: 'assumption', rationale: 'гипотеза («наверное»), её проверяют по данным.' },
    { id: 's6', text: 'Позже сделать автоматический возврат без менеджера.', label: 'out-of-scope', rationale: '«потом» — будущая фича, вне границ задачи.' }
  ]
};

// ── Стадия 2. Контракт API: какие поля обязательны в ответе ──────────────────
export const capstoneContract: QuestionsRule = {
  options: [
    { id: 'f-order-id', text: 'order_id — идентификатор недоставленного заказа', required: true },
    { id: 'f-total', text: 'total — сумма заказа (сколько возвращать)', required: true },
    { id: 'f-paid-at', text: 'paid_at — когда заказ был оплачен', required: true },
    { id: 'f-status', text: 'delivery_status — почему заказ считается недоставленным', required: true },
    { id: 'f-color', text: 'button_color — цвет кнопки «Вернуть» в интерфейсе', required: false, noise: 'деталь UI, не место в контракте данных.' },
    { id: 'f-manager-mood', text: 'manager_note — свободная заметка менеджера', required: false, noise: 'не относится к выявлению недоставленных заказов.' },
    { id: 'f-db', text: 'db_shard — на каком шарде БД лежит заказ', required: false, noise: 'деталь реализации хранилища, не контракт.' }
  ]
};

// ── Стадия 3. SQL: проверочный запрос ───────────────────────────────────────
export const capstoneSql = {
  prompt:
    'Напиши запрос, который находит id оплаченных (status = \'paid\') заказов, по которым НЕТ события ' +
    'доставки с типом accepted. Именно эти заказы попадут менеджеру. Верни колонку id, отсортируй по id.',
  starterSql:
    "SELECT orders.id\nFROM orders\nLEFT JOIN delivery_events\n  ON delivery_events.order_id = orders.id\n  AND delivery_events.event_type = -- ? какой тип события?\nWHERE orders.status = -- ? какой статус заказа?\n  AND delivery_events.id IS NULL -- строки без совпадения в доставке\nORDER BY orders.id;",
  solutionSql:
    "SELECT orders.id\nFROM orders\nLEFT JOIN delivery_events\n  ON delivery_events.order_id = orders.id\n  AND delivery_events.event_type = 'accepted'\nWHERE orders.status = 'paid'\n  AND delivery_events.id IS NULL\nORDER BY orders.id;",
  hint: 'LEFT JOIN + условие event_type = \'accepted\' в ON, а в WHERE — delivery_events.id IS NULL: остаются заказы без принятой доставки.'
};

export const capstoneConceptIds = ['req:classification', 'api:contract', 'sql:капстоун'];
