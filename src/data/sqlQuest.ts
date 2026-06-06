import type { SqlRow } from '../shared/lib/sqlChecker';

export type SqlQuestPathType = 'trial' | 'case';

export type SqlQuestChapter = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  topics: string[];
  description: string;
};

export type SqlQuestRank = {
  id: string;
  title: string;
  minXp: number;
};

export type SqlQuestLesson = {
  id: string;
  chapterId: string;
  pathType: SqlQuestPathType;
  title: string;
  storyIntro: string;
  businessContext: string;
  learningGoal: string;
  sqlConcept: string;
  starterSql: string;
  expectedRows: SqlRow[];
  orderMatters?: boolean;
  tablesUsed: string[];
  successCriteria: string[];
  hints: string[];
  explanation: string;
  commonMistakes: string[];
  relatedKnowledgeIds: string[];
  xp: number;
  prerequisiteTaskIds: string[];
  successStory: string;
  companionSuccess: string;
  companionError: string;
};

export const sqlQuestChapters: SqlQuestChapter[] = [
  {
    id: 'raw-data-village',
    order: 1,
    title: 'Деревня сырых данных',
    subtitle: 'Первые архивы: SELECT, FROM, LIMIT, ORDER BY',
    topics: ['SELECT', 'FROM', 'LIMIT', 'ORDER BY'],
    description: 'Учимся доставать нужные колонки и быстро смотреть самые важные строки.'
  },
  {
    id: 'filter-watch',
    order: 2,
    title: 'Фильтры дозора',
    subtitle: 'WHERE отделяет нужные записи от шумного рынка',
    topics: ['WHERE', 'AND', 'OR', 'IN', 'BETWEEN', 'LIKE', 'IS NULL'],
    description: 'Переводим бизнес-условия в точные SQL-фильтры.'
  },
  {
    id: 'trade-square',
    order: 3,
    title: 'Торговая площадь',
    subtitle: 'Считаем ресурсы, долги и поток заказов',
    topics: ['GROUP BY', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
    description: 'Собираем строки в показатели, которые можно обсуждать с бизнесом.'
  },
  {
    id: 'relations-archive',
    order: 4,
    title: 'Архив связей',
    subtitle: 'JOIN, ключи и потерянные строки',
    topics: ['INNER JOIN', 'LEFT JOIN', 'ключи', 'дубли', 'потеря строк'],
    description: 'Соединяем таблицы и проверяем, где процесс теряет факты.'
  },
  {
    id: 'condition-tower',
    order: 5,
    title: 'Башня условий',
    subtitle: 'CASE WHEN и HAVING для понятных выводов',
    topics: ['CASE WHEN', 'HAVING'],
    description: 'Превращаем коды в категории и фильтруем уже посчитанные группы.'
  },
  {
    id: 'subquery-dungeon',
    order: 6,
    title: 'Подземелье подзапросов',
    subtitle: 'Подзапросы и CTE как тайные слои архива',
    topics: ['subquery', 'EXISTS', 'IN', 'CTE'],
    description: 'Собираем сложные проверки из читаемых промежуточных шагов.'
  },
  {
    id: 'window-order',
    order: 7,
    title: 'Орден оконных функций',
    subtitle: 'ROW_NUMBER, RANK, LAG, LEAD и SUM OVER',
    topics: ['ROW_NUMBER', 'RANK', 'LAG', 'LEAD', 'SUM OVER'],
    description: 'Сохраняем строки, но добавляем к ним рейтинг, соседей и накопительные показатели.'
  },
  {
    id: 'kingdom-cases',
    order: 8,
    title: 'Реальные дела королевства',
    subtitle: 'Воронки, повторные покупки, SLA и аномалии',
    topics: ['воронки', 'retention-lite', 'повторные покупки', 'SLA', 'аномалии'],
    description: 'Решаем задачи, где SQL нужен для аналитического вывода, а не только для синтаксиса.'
  }
];

export const sqlQuestRanks: SqlQuestRank[] = [
  { id: 'data-villager', title: 'Селюк данных', minXp: 0 },
  { id: 'scribe-apprentice', title: 'Ученик писаря', minXp: 120 },
  { id: 'query-journeyman', title: 'Подмастерье запросов', minXp: 260 },
  { id: 'row-hunter', title: 'Охотник за строками', minXp: 430 },
  { id: 'join-master', title: 'Мастер JOIN-ов', minXp: 650 },
  { id: 'window-archmage', title: 'Архимаг оконных функций', minXp: 900 },
  { id: 'mart-keeper', title: 'Хранитель витрин данных', minXp: 1180 }
];

const orderedPaidRows = [
  { id: 1001, status: 'paid', total: 5600 },
  { id: 1003, status: 'paid', total: 980 },
  { id: 1005, status: 'paid', total: 8300 }
];

export const sqlQuestLessons: SqlQuestLesson[] = [
  {
    id: 'q01-select-ledger',
    chapterId: 'raw-data-village',
    pathType: 'trial',
    title: 'Открыть книгу заказов',
    storyIntro: 'Староста приносит первую книгу гильдии: страницы целые, но нужно быстро понять, какие заказы вообще лежат в архиве.',
    businessContext: 'Перед любым анализом нужно увидеть минимальный набор полей: идентификатор, статус и сумму заказа.',
    learningGoal: 'Научиться выбирать только нужные колонки и не тащить лишний шум.',
    sqlConcept: 'SELECT, FROM',
    starterSql: 'SELECT id, status, total\nFROM orders\nORDER BY id\nLIMIT 3;',
    expectedRows: [
      { id: 1001, status: 'paid', total: 5600 },
      { id: 1002, status: 'shipped', total: 2100 },
      { id: 1003, status: 'paid', total: 980 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Используется таблица orders.', 'Возвращаются только id, status и total.', 'Показаны первые три заказа по id.'],
    hints: [
      'Начни с SELECT и перечисли поля через запятую.',
      'FROM должен указывать на архив orders.',
      'ORDER BY id делает результат стабильным, LIMIT оставляет первые три строки.',
      'Не используй SELECT *: в квесте важна точность колонок.'
    ],
    explanation: 'SELECT — это не “покажи всё”, а управляемый взгляд на данные. Аналитик выбирает поля под вопрос, чтобы результат был читаемым.',
    commonMistakes: ['Вывести все колонки через *.', 'Забыть ORDER BY и получить нестабильный порядок.', 'Оставить больше трёх строк.'],
    relatedKnowledgeIds: ['sql', 'sql-select-from'],
    xp: 40,
    prerequisiteTaskIds: [],
    successStory: 'Книга открылась без пыли в глазах: первые строки видны, лишние поля остались на полке.',
    companionSuccess: 'Хороший первый разрез. Архивариус ещё спокоен.',
    companionError: 'Ты открыл нужный архив, но, похоже, прихватил лишнее или забыл порядок строк.'
  },
  {
    id: 'q02-sort-largest-order',
    chapterId: 'raw-data-village',
    pathType: 'trial',
    title: 'Самый тяжёлый сундук',
    storyIntro: 'Казначей просит найти самый дорогой заказ: если там ошибка, весь отчёт по выручке пойдёт криво.',
    businessContext: 'Поиск максимума через сортировку часто используется для sanity-check и поиска аномалий.',
    learningGoal: 'Закрепить ORDER BY DESC и LIMIT.',
    sqlConcept: 'ORDER BY, DESC, LIMIT',
    starterSql: 'SELECT id, total\nFROM orders\nORDER BY total DESC\nLIMIT 1;',
    expectedRows: [{ id: 1005, total: 8300 }],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Сортировка идёт по total DESC.', 'LIMIT оставляет одну строку.', 'В результате заказ 1005.'],
    hints: [
      'Самая большая сумма должна оказаться первой.',
      'DESC сортирует по убыванию.',
      'LIMIT 1 оставляет только лидера.',
      'Нужны id и total, чтобы сумму можно было связать с заказом.'
    ],
    explanation: 'ORDER BY + LIMIT помогает быстро найти крайние значения: самый дорогой заказ, последнее событие, самый подозрительный платёж.',
    commonMistakes: ['Сортировать ASC и получить минимальную сумму.', 'Вывести total без id.', 'Забыть LIMIT и получить весь архив.'],
    relatedKnowledgeIds: ['sql', 'sql-order-limit'],
    xp: 45,
    prerequisiteTaskIds: ['q01-select-ledger'],
    successStory: 'Казначей поставил метку на заказ 1005: сундук тяжёлый, но теперь он хотя бы найден.',
    companionSuccess: 'Вот он, крупный заказ. Не геройствуй: просто точная сортировка.',
    companionError: 'Колонки могут быть верными, но если порядок не тот, самый тяжёлый сундук останется внизу.'
  },
  {
    id: 'q03-recent-ledger-scan',
    chapterId: 'raw-data-village',
    pathType: 'case',
    title: 'Последние записи каравана',
    storyIntro: 'На вечернем обходе нужно быстро увидеть последние заказы, чтобы понять, что происходило в архиве перед закрытием смены.',
    businessContext: 'В реальной работе аналитик часто начинает расследование с последних событий или заказов.',
    learningGoal: 'Использовать сортировку по дате и ограничение результата.',
    sqlConcept: 'ORDER BY по дате, LIMIT',
    starterSql: 'SELECT id, customer_id, created_at\nFROM orders\nORDER BY created_at DESC\nLIMIT 3;',
    expectedRows: [
      { id: 1005, customer_id: 1, created_at: '2026-05-05' },
      { id: 1004, customer_id: 4, created_at: '2026-05-04' },
      { id: 1003, customer_id: 3, created_at: '2026-05-03' }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Сортировка по created_at DESC.', 'Возвращаются три последние строки.', 'В результате есть id, customer_id и created_at.'],
    hints: [
      'created_at показывает время появления заказа.',
      'DESC нужен, чтобы новые записи были сверху.',
      'LIMIT 3 — это быстрый обзор, а не полный отчёт.',
      'customer_id поможет потом связать заказ с клиентом.'
    ],
    explanation: 'Последние записи часто дают контекст инцидента: что изменилось перед жалобой, какой заказ пришёл последним, какие статусы свежие.',
    commonMistakes: ['Сортировать по id вместо даты без явной договорённости.', 'Забыть DESC.', 'Скрыть customer_id, который нужен для следующей связи.'],
    relatedKnowledgeIds: ['sql', 'sql-order-limit'],
    xp: 45,
    prerequisiteTaskIds: ['q02-sort-largest-order'],
    successStory: 'Свежие записи легли на стол: теперь видно, чем жил архив в последние дни.',
    companionSuccess: 'Так расследования и начинаются: сначала последние следы, потом версии.',
    companionError: 'Ты смотришь не в тот край хроники. Проверь сортировку по дате.'
  },
  {
    id: 'q04-where-paid-orders',
    chapterId: 'filter-watch',
    pathType: 'trial',
    title: 'Дозор оплаченных заказов',
    storyIntro: 'Купцы жалуются, что часть оплаченных заказов пропала из отчёта. Для начала нужно отделить paid от всех остальных.',
    businessContext: 'Статус заказа — бизнес-условие. Если фильтр неточный, дальше ломается весь анализ.',
    learningGoal: 'Закрепить WHERE для строкового статуса.',
    sqlConcept: 'WHERE',
    starterSql: "SELECT id, status, total\nFROM orders\nWHERE status = 'paid'\nORDER BY id;",
    expectedRows: orderedPaidRows,
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Есть WHERE status = paid.', 'Нет shipped и cancelled.', 'Строки отсортированы по id.'],
    hints: [
      'Фильтр ставится после FROM.',
      'Строковый статус нужно заключить в кавычки.',
      'Сортировка по id помогает сверить результат с эталоном.',
      'Должно остаться три paid-заказа.'
    ],
    explanation: 'WHERE переводит бизнес-правило в проверяемый набор строк. Здесь важно не перепутать статус заказа со статусом платежа.',
    commonMistakes: ['Фильтровать payments.status вместо orders.status.', 'Написать paid без кавычек.', 'Вернуть все статусы.'],
    relatedKnowledgeIds: ['sql-where-filter', 'sql'],
    xp: 50,
    prerequisiteTaskIds: ['q03-recent-ledger-scan'],
    successStory: 'Дозор пропустил только оплаченные заказы. Остальные пока ждут своего часа.',
    companionSuccess: 'Чёткий фильтр. Караваны paid прошли через ворота.',
    companionError: 'Ты считаешь всё королевство, а просили только оплаченные заказы.'
  },
  {
    id: 'q05-filter-range-in',
    chapterId: 'filter-watch',
    pathType: 'trial',
    title: 'Пошлина среднего каравана',
    storyIntro: 'Казначей просит список заказов в рабочих статусах и с суммой от 1000 до 6000: слишком мелкие и слишком крупные сегодня не проверяем.',
    businessContext: 'Комбинированные фильтры помогают сформировать точный операционный список.',
    learningGoal: 'Соединять IN, BETWEEN и AND.',
    sqlConcept: 'IN, BETWEEN, AND',
    starterSql: "SELECT id, status, total\nFROM orders\nWHERE status IN ('paid', 'shipped')\n  AND total BETWEEN 1000 AND 6000\nORDER BY id;",
    expectedRows: [
      { id: 1001, status: 'paid', total: 5600 },
      { id: 1002, status: 'shipped', total: 2100 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Статусы проверяются через IN.', 'Диапазон total задан через BETWEEN.', 'AND объединяет оба ограничения.'],
    hints: [
      'IN удобен, когда допустимых статусов несколько.',
      'BETWEEN включает границы диапазона.',
      'AND означает, что должны выполниться оба условия.',
      'Отменённый заказ и заказ на 8300 не должны попасть в результат.'
    ],
    explanation: 'В реальных отчётах часто есть несколько правил отбора. Их нужно читать как договорённость: статус подходит и сумма в нужном диапазоне.',
    commonMistakes: ['Использовать OR между статусом и суммой.', 'Забыть один из статусов.', 'Перепутать границы диапазона.'],
    relatedKnowledgeIds: ['sql-where-filter', 'sql'],
    xp: 55,
    prerequisiteTaskIds: ['q04-where-paid-orders'],
    successStory: 'Средние караваны отмечены для проверки, лишние телеги не мешают казначею.',
    companionSuccess: 'Фильтр держит строй: статус и сумма работают вместе.',
    companionError: 'Похоже, в дозор прошли лишние строки. Проверь AND, IN и диапазон.'
  },
  {
    id: 'q06-filter-idempotency-key',
    chapterId: 'filter-watch',
    pathType: 'case',
    title: 'След ключа pay-1003',
    storyIntro: 'Платёжный писарь шепчет, что ключ pay-1003 встречался подозрительно часто. Нужно найти все такие записи.',
    businessContext: 'Поиск по шаблону и NULL-check помогают расследовать дубли callback и качество интеграции.',
    learningGoal: 'Использовать LIKE и IS NOT NULL в расследовании.',
    sqlConcept: 'LIKE, IS NOT NULL',
    starterSql: "SELECT id, order_id, idempotency_key\nFROM payments\nWHERE idempotency_key IS NOT NULL\n  AND idempotency_key LIKE 'pay-1003'\nORDER BY id;",
    expectedRows: [
      { id: 3, order_id: 1003, idempotency_key: 'pay-1003' },
      { id: 4, order_id: 1003, idempotency_key: 'pay-1003' }
    ],
    orderMatters: true,
    tablesUsed: ['payments'],
    successCriteria: ['Проверка IS NOT NULL защищает от пустых ключей.', 'LIKE ищет нужный ключ.', 'Возвращаются две записи по одному order_id.'],
    hints: [
      'Ищи в таблице payments, не orders.',
      'idempotency_key может быть NULL, это лучше явно учитывать.',
      'LIKE работает со строковым шаблоном.',
      'Если всё верно, увидишь две строки с order_id 1003.'
    ],
    explanation: 'Ключ идемпотентности нужен, чтобы повторный запрос не создавал повторный эффект. Две captured-записи с одним ключом — тревожный сигнал.',
    commonMistakes: ['Искать ключ в orders.', 'Проверять status вместо idempotency_key.', 'Вернуть только одну строку и пропустить дубль.'],
    relatedKnowledgeIds: ['sql-where-filter', 'idempotency'],
    xp: 60,
    prerequisiteTaskIds: ['q05-filter-range-in'],
    successStory: 'След найден дважды. Писарь делает пометку: “проверить callback и защиту от дублей”.',
    companionSuccess: 'Вот он, повторный след. Данные редко лгут, они просто говорят тихо.',
    companionError: 'Ключ где-то рядом. Проверь таблицу payments и условие LIKE.'
  },
  {
    id: 'q07-group-status-count',
    chapterId: 'trade-square',
    pathType: 'trial',
    title: 'Пересчёт статусов на площади',
    storyIntro: 'На торговой площади спорят, сколько заказов в каждом статусе и какая сумма за ними стоит.',
    businessContext: 'Агрегация по статусу даёт первое распределение процесса.',
    learningGoal: 'Использовать GROUP BY с COUNT и SUM.',
    sqlConcept: 'GROUP BY, COUNT, SUM',
    starterSql: 'SELECT status, COUNT(*) AS cnt, SUM(total) AS total_sum\nFROM orders\nGROUP BY status\nORDER BY status;',
    expectedRows: [
      { status: 'cancelled', cnt: 1, total_sum: 1200 },
      { status: 'paid', cnt: 3, total_sum: 14880 },
      { status: 'shipped', cnt: 1, total_sum: 2100 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Группировка по status.', 'COUNT считает строки.', 'SUM считает сумму total внутри статуса.'],
    hints: [
      'Все неагрегированные поля в SELECT должны быть в GROUP BY.',
      'COUNT(*) считает количество заказов.',
      'SUM(total) складывает суммы в группе.',
      'ORDER BY status делает результат легко сверяемым.'
    ],
    explanation: 'GROUP BY превращает сырые строки в показатель. Это первый шаг от “что лежит в таблице” к “что происходит в процессе”.',
    commonMistakes: ['Вывести total без SUM.', 'Забыть GROUP BY.', 'Считать только paid, хотя просят все статусы.'],
    relatedKnowledgeIds: ['sql-group-by', 'sql'],
    xp: 60,
    prerequisiteTaskIds: ['q06-filter-idempotency-key'],
    successStory: 'Статусы пересчитаны, площадь стихла: теперь спорят уже по цифрам.',
    companionSuccess: 'Хорошая агрегация. Когда есть числа, крики становятся тише.',
    companionError: 'Ты считаешь строки, но группы пока расползаются. Проверь GROUP BY.'
  },
  {
    id: 'q08-aggregate-extremes',
    chapterId: 'trade-square',
    pathType: 'trial',
    title: 'Весы казначея',
    storyIntro: 'Казначей хочет одним взглядом увидеть минимальную, максимальную и среднюю сумму заказа.',
    businessContext: 'MIN, MAX и AVG помогают оценить масштаб данных и быстро найти ориентиры.',
    learningGoal: 'Использовать базовые агрегаты без группировки.',
    sqlConcept: 'MIN, MAX, AVG',
    starterSql: 'SELECT MIN(total) AS min_total,\n  MAX(total) AS max_total,\n  ROUND(AVG(total), 1) AS avg_total\nFROM orders;',
    expectedRows: [{ min_total: 980, max_total: 8300, avg_total: 3636 }],
    tablesUsed: ['orders'],
    successCriteria: ['MIN считает нижнюю границу.', 'MAX считает верхнюю границу.', 'AVG округлён до одного знака.'],
    hints: [
      'Если нет GROUP BY, агрегаты считаются по всей таблице.',
      'ROUND(AVG(total), 1) делает среднее читаемым.',
      'Нужна одна строка результата.',
      'Не смешивай агрегаты с id заказа в этом запросе.'
    ],
    explanation: 'Агрегаты без GROUP BY дают быстрый профиль таблицы: минимум, максимум и среднее помогают заметить странные масштабы.',
    commonMistakes: ['Добавить id в SELECT и сломать смысл агрегата.', 'Использовать SUM вместо AVG.', 'Забыть alias для колонок.'],
    relatedKnowledgeIds: ['sql-group-by', 'sql'],
    xp: 60,
    prerequisiteTaskIds: ['q07-group-status-count'],
    successStory: 'Весы показали диапазон сумм. Казначей наконец перестал считать на пальцах.',
    companionSuccess: 'Одна строка, три ориентира. Ничего лишнего.',
    companionError: 'Похоже, весы считают не то. Проверь агрегаты и не добавляй лишние поля.'
  },
  {
    id: 'q09-region-paid-revenue',
    chapterId: 'trade-square',
    pathType: 'case',
    title: 'Налог с оплаченных караванов',
    storyIntro: 'Совет регионов хочет знать, где оплаченные заказы дают больше всего денег.',
    businessContext: 'Региональная агрегация соединяет заказы с клиентами и превращает строки в управленческий показатель.',
    learningGoal: 'Скомбинировать JOIN, WHERE и GROUP BY.',
    sqlConcept: 'GROUP BY после JOIN',
    starterSql: "SELECT customers.region, COUNT(*) AS cnt, SUM(orders.total) AS total_sum\nFROM orders\nJOIN customers ON customers.id = orders.customer_id\nWHERE orders.status = 'paid'\nGROUP BY customers.region\nORDER BY customers.region;",
    expectedRows: [
      { region: 'siberia', cnt: 1, total_sum: 980 },
      { region: 'ural', cnt: 2, total_sum: 13900 }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'customers'],
    successCriteria: ['JOIN по customers.id = orders.customer_id.', 'Фильтр только paid.', 'Группировка по региону клиента.'],
    hints: [
      'Регион лежит в customers, сумма и статус — в orders.',
      'Сначала соединяем сущности, затем фильтруем paid.',
      'GROUP BY должен быть по customers.region.',
      'В отчёте должно быть два региона.'
    ],
    explanation: 'Такой запрос показывает, как из модели данных собрать бизнес-метрику: paid revenue по региону.',
    commonMistakes: ['Группировать по customer_id вместо region.', 'Считать все статусы.', 'Соединить таблицы по неправильным id.'],
    relatedKnowledgeIds: ['sql-group-by', 'sql-join-relations', 'sql-where-filter'],
    xp: 70,
    prerequisiteTaskIds: ['q08-aggregate-extremes'],
    successStory: 'Региональная казна посчитана: уральский караван сегодня явно не пустой.',
    companionSuccess: 'Вот это уже похоже на показатель, а не на россыпь строк.',
    companionError: 'Суммы странные? Проверь, не попали ли в налог отменённые или shipped-заказы.'
  },
  {
    id: 'q10-inner-join-customer-region',
    chapterId: 'relations-archive',
    pathType: 'trial',
    title: 'Найти родословную заказа',
    storyIntro: 'Заказ без клиента — как письмо без печати. Нужно связать заказ с регионом клиента.',
    businessContext: 'INNER JOIN нужен, когда у строки должна быть обязательная связанная сущность.',
    learningGoal: 'Закрепить соединение по внешнему ключу.',
    sqlConcept: 'INNER JOIN, foreign key',
    starterSql: "SELECT orders.id, customers.region\nFROM orders\nJOIN customers ON customers.id = orders.customer_id\nWHERE orders.status = 'paid'\nORDER BY orders.id;",
    expectedRows: [
      { id: 1001, region: 'ural' },
      { id: 1003, region: 'siberia' },
      { id: 1005, region: 'ural' }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'customers'],
    successCriteria: ['JOIN идёт по customers.id = orders.customer_id.', 'Фильтр paid применяется к orders.status.', 'Возвращаются id заказа и region.'],
    hints: [
      'orders.customer_id указывает на customers.id.',
      'У id есть одинаковое имя в обеих таблицах, используй префиксы.',
      'Фильтр paid относится к заказам.',
      'В результате должно быть три строки.'
    ],
    explanation: 'JOIN связывает сущности. Важно соединять по ключам модели, а не по похожим названиям колонок.',
    commonMistakes: ['Соединить orders.id с customers.id.', 'Не указать префикс у id.', 'Потерять фильтр paid.'],
    relatedKnowledgeIds: ['sql-join-relations', 'erd', 'sql'],
    xp: 70,
    prerequisiteTaskIds: ['q09-region-paid-revenue'],
    successStory: 'Родословная заказов восстановлена: теперь ясно, из каких земель пришли paid-заявки.',
    companionSuccess: 'Связь верная. Архивариус убрал руку с тревожного колокола.',
    companionError: 'Ты призвал JOIN, но проверь связь таблиц: ключи должны совпадать по смыслу.'
  },
  {
    id: 'q11-left-join-delivery-gap',
    chapterId: 'relations-archive',
    pathType: 'case',
    title: 'Пропавшие в доставке',
    storyIntro: 'Купцы говорят: деньги взяли, а доставка о некоторых заказах не слышала. Нужно найти paid-заказы без accepted-события.',
    businessContext: 'LEFT JOIN + IS NULL выявляет разрывы между бизнес-статусом и технической интеграцией.',
    learningGoal: 'Понять, почему INNER JOIN может скрыть проблему.',
    sqlConcept: 'LEFT JOIN, IS NULL',
    starterSql: "SELECT orders.id\nFROM orders\nLEFT JOIN delivery_events\n  ON delivery_events.order_id = orders.id\n  AND delivery_events.event_type = 'accepted'\nWHERE orders.status = 'paid'\n  AND delivery_events.id IS NULL\nORDER BY orders.id;",
    expectedRows: [{ id: 1001 }, { id: 1003 }],
    orderMatters: true,
    tablesUsed: ['orders', 'delivery_events'],
    successCriteria: ['Используется LEFT JOIN.', 'Условие accepted не уничтожает строки без события.', 'IS NULL находит отсутствующие accepted-события.'],
    hints: [
      'INNER JOIN выкинет как раз те строки, которые нужны для расследования.',
      'Фильтр event_type = accepted безопаснее держать в ON.',
      'Если события нет, delivery_events.id будет NULL.',
      'Ищи только paid-заказы.'
    ],
    explanation: 'Это типичный запрос на “должно быть, но отсутствует”. Он показывает заказы, где бизнес считает процесс оплаченным, а интеграция не подтвердила принятие.',
    commonMistakes: ['Использовать INNER JOIN.', 'Искать любой delivery event вместо accepted.', 'Поставить delivery_events.event_type в WHERE и потерять NULL.'],
    relatedKnowledgeIds: ['sql-left-join', 'sql-join-relations', 'integration'],
    xp: 80,
    prerequisiteTaskIds: ['q10-inner-join-customer-region'],
    successStory: 'Два заказа подняли сигнальные флаги: теперь доставка не сможет сказать “мы не знали”.',
    companionSuccess: 'Вот зачем нужен LEFT JOIN: он оставляет пропажу видимой.',
    companionError: 'Здесь пахнет потерянными заказами. INNER JOIN может выкинуть тех, у кого нет доставки.'
  },
  {
    id: 'q12-duplicate-payment-key',
    chapterId: 'relations-archive',
    pathType: 'case',
    title: 'Двойная печать платежа',
    storyIntro: 'В платёжной книге одна печать будто отпечаталась дважды. Нужно доказать дубль числом, а не подозрением.',
    businessContext: 'Дубли по idempotency_key приводят к финансовым расхождениям и требуют отдельного инцидента.',
    learningGoal: 'Искать дубли через GROUP BY и HAVING.',
    sqlConcept: 'дубли, ключ идемпотентности',
    starterSql: "SELECT idempotency_key, COUNT(*) AS cnt\nFROM payments\nWHERE status = 'captured'\nGROUP BY idempotency_key\nHAVING COUNT(*) > 1;",
    expectedRows: [{ idempotency_key: 'pay-1003', cnt: 2 }],
    tablesUsed: ['payments'],
    successCriteria: ['Фильтр captured.', 'Группировка по idempotency_key.', 'HAVING COUNT(*) > 1.'],
    hints: [
      'Дубль определяется не по payment.id, а по бизнес-ключу операции.',
      'Сначала оставь только captured.',
      'HAVING фильтрует группы после подсчёта.',
      'Ожидается один ключ с cnt = 2.'
    ],
    explanation: 'Дубликаты часто не видны в отдельных строках. Их нужно поднять на уровень группы и проверить количество повторений.',
    commonMistakes: ['Группировать по id платежа.', 'Считать authorized вместе с captured.', 'Пытаться написать COUNT в WHERE.'],
    relatedKnowledgeIds: ['sql-having', 'idempotency', 'data-quality'],
    xp: 80,
    prerequisiteTaskIds: ['q11-left-join-delivery-gap'],
    successStory: 'Двойная печать раскрыта. Казначей уже готовит письмо платёжному провайдеру.',
    companionSuccess: 'Дубль пойман не криком, а HAVING. Так и надо.',
    companionError: 'Если COUNT не работает в WHERE, башня условий ждёт тебя этажом выше: HAVING.'
  },
  {
    id: 'q13-case-delivery-state',
    chapterId: 'condition-tower',
    pathType: 'trial',
    title: 'Три состояния доставки',
    storyIntro: 'Совету нужен не набор event_type, а понятная классификация: принято, упало или потерялось.',
    businessContext: 'CASE WHEN переводит технические события в понятные бизнес-категории.',
    learningGoal: 'Использовать CASE WHEN с LEFT JOIN.',
    sqlConcept: 'CASE WHEN',
    starterSql: "SELECT orders.id,\n  CASE\n    WHEN delivery_events.event_type = 'accepted' THEN 'accepted'\n    WHEN delivery_events.event_type = 'failed' THEN 'failed'\n    ELSE 'missing'\n  END AS delivery_state\nFROM orders\nLEFT JOIN delivery_events ON delivery_events.order_id = orders.id\nWHERE orders.status = 'paid'\nORDER BY orders.id;",
    expectedRows: [
      { id: 1001, delivery_state: 'missing' },
      { id: 1003, delivery_state: 'failed' },
      { id: 1005, delivery_state: 'accepted' }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'delivery_events'],
    successCriteria: ['CASE возвращает accepted, failed или missing.', 'LEFT JOIN сохраняет paid-заказ без события.', 'Alias называется delivery_state.'],
    hints: [
      'CASE проверяет условия сверху вниз.',
      'ELSE удобно использовать для missing.',
      'Не теряй заказ 1001, у него нет delivery event.',
      'Сортировка по orders.id упрощает сверку.'
    ],
    explanation: 'CASE нужен, когда аналитик должен сделать данные понятными. Не все участники встречи обязаны помнить технические event_type.',
    commonMistakes: ['Считать NULL как failed.', 'Забыть ELSE.', 'Использовать INNER JOIN и потерять missing.'],
    relatedKnowledgeIds: ['sql-case-when', 'sql-left-join'],
    xp: 75,
    prerequisiteTaskIds: ['q12-duplicate-payment-key'],
    successStory: 'Состояния доставки получили имена. Теперь отчёт можно читать без дешифратора.',
    companionSuccess: 'Технический хаос стал тремя понятными категориями.',
    companionError: 'CASE почти готов, но missing не должен исчезнуть. Проверь LEFT JOIN и ELSE.'
  },
  {
    id: 'q14-having-paid-regions',
    chapterId: 'condition-tower',
    pathType: 'trial',
    title: 'Регион с двумя paid-заказами',
    storyIntro: 'Глава рынка хочет увидеть только регионы, где paid-заказов больше одного: туда отправят отдельного ревизора.',
    businessContext: 'HAVING нужен, когда условие зависит от агрегата.',
    learningGoal: 'Фильтровать группы после COUNT.',
    sqlConcept: 'HAVING',
    starterSql: "SELECT customers.region, COUNT(*) AS paid_count\nFROM orders\nJOIN customers ON customers.id = orders.customer_id\nWHERE orders.status = 'paid'\nGROUP BY customers.region\nHAVING COUNT(*) > 1;",
    expectedRows: [{ region: 'ural', paid_count: 2 }],
    tablesUsed: ['orders', 'customers'],
    successCriteria: ['COUNT считает paid-заказы по региону.', 'WHERE фильтрует строки до группировки.', 'HAVING оставляет группы с COUNT больше 1.'],
    hints: [
      'WHERE — до группировки, HAVING — после.',
      'Регион берётся из customers.',
      'COUNT(*) > 1 нельзя писать в WHERE.',
      'Останется только ural.'
    ],
    explanation: 'HAVING отвечает на вопросы уровня “какие группы удовлетворяют условию по показателю”.',
    commonMistakes: ['Писать COUNT в WHERE.', 'Считать все статусы.', 'Группировать по id заказа.'],
    relatedKnowledgeIds: ['sql-having', 'sql-group-by'],
    xp: 75,
    prerequisiteTaskIds: ['q13-case-delivery-state'],
    successStory: 'Ревизор отправлен на Урал: там paid-заказов больше одного.',
    companionSuccess: 'HAVING отработал чисто: фильтруем уже посчитанные группы.',
    companionError: 'WHERE не умеет смотреть на COUNT группы. Поднимайся к HAVING.'
  },
  {
    id: 'q15-case-payment-control',
    chapterId: 'condition-tower',
    pathType: 'case',
    title: 'Печати под контроль',
    storyIntro: 'Нужно пометить заказы по captured-платежам: один успешный платёж — ok, больше одного — needs_review.',
    businessContext: 'Условная логика помогает превратить агрегаты в статус контроля.',
    learningGoal: 'Совместить GROUP BY, COUNT и CASE.',
    sqlConcept: 'CASE WHEN по агрегату',
    starterSql: "SELECT order_id,\n  CASE\n    WHEN COUNT(*) > 1 THEN 'needs_review'\n    ELSE 'ok'\n  END AS payment_control\nFROM payments\nWHERE status = 'captured'\nGROUP BY order_id\nORDER BY order_id;",
    expectedRows: [
      { order_id: 1001, payment_control: 'ok' },
      { order_id: 1002, payment_control: 'ok' },
      { order_id: 1003, payment_control: 'needs_review' }
    ],
    orderMatters: true,
    tablesUsed: ['payments'],
    successCriteria: ['Фильтр captured.', 'Группировка по order_id.', 'CASE использует COUNT(*) > 1.'],
    hints: [
      'Сначала сгруппируй captured-платежи по order_id.',
      'COUNT(*) внутри группы показывает число успешных списаний.',
      'CASE может использовать агрегат.',
      'Заказ 1003 должен получить needs_review.'
    ],
    explanation: 'Такой запрос не только находит проблему, но и готовит признак для отчёта или ручной очереди проверки.',
    commonMistakes: ['Проверять idempotency_key вместо количества платежей по заказу.', 'Не фильтровать captured.', 'Вернуть cnt, но не статус контроля.'],
    relatedKnowledgeIds: ['sql-case-when', 'sql-having', 'idempotency'],
    xp: 85,
    prerequisiteTaskIds: ['q14-having-paid-regions'],
    successStory: 'Платёжные печати получили контрольные метки. Заказ 1003 отправлен на ручную сверку.',
    companionSuccess: 'Вот это уже рабочий аналитический признак.',
    companionError: 'Ты близко. Проверь, что CASE смотрит на COUNT внутри order_id.'
  },
  {
    id: 'q16-subquery-above-average',
    chapterId: 'subquery-dungeon',
    pathType: 'trial',
    title: 'Выше средней дани',
    storyIntro: 'Казначей просит найти заказы выше средней суммы. Среднее нельзя вписывать руками: завтра данные изменятся.',
    businessContext: 'Подзапрос нужен, когда порог зависит от данных.',
    learningGoal: 'Использовать scalar subquery с AVG.',
    sqlConcept: 'subquery',
    starterSql: 'SELECT id, total\nFROM orders\nWHERE total > (SELECT AVG(total) FROM orders)\nORDER BY id;',
    expectedRows: [
      { id: 1001, total: 5600 },
      { id: 1005, total: 8300 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['AVG считается во вложенном SELECT.', 'Сравнение идёт по total.', 'Порог не захардкожен.'],
    hints: [
      'Среднее считается отдельным SELECT AVG(total).',
      'Подзапрос можно поставить справа от >.',
      'Не подставляй 3636 руками.',
      'Ожидаются два заказа.'
    ],
    explanation: 'Подзапрос делает критерий динамическим. Это устойчивее, чем магическое число в WHERE.',
    commonMistakes: ['Хардкодить среднее.', 'Сравнивать id с AVG(total).', 'Использовать SUM вместо AVG.'],
    relatedKnowledgeIds: ['sql-subquery', 'sql'],
    xp: 85,
    prerequisiteTaskIds: ['q15-case-payment-control'],
    successStory: 'Заказы выше средней дани отмечены. Порог вывели из данных, а не из воздуха.',
    companionSuccess: 'Хорошо: если архив пополнится, запрос сам пересчитает порог.',
    companionError: 'Подземелье не любит магические числа. Среднее должно считаться подзапросом.'
  },
  {
    id: 'q17-in-captured-orders',
    chapterId: 'subquery-dungeon',
    pathType: 'trial',
    title: 'Заказы с captured-печатью',
    storyIntro: 'Нужно увидеть заказы, по которым есть хотя бы один captured-платёж.',
    businessContext: 'IN с подзапросом помогает отобрать сущности по фактам из другой таблицы.',
    learningGoal: 'Использовать IN subquery.',
    sqlConcept: 'IN subquery',
    starterSql: "SELECT id\nFROM orders\nWHERE id IN (\n  SELECT order_id\n  FROM payments\n  WHERE status = 'captured'\n)\nORDER BY id;",
    expectedRows: [{ id: 1001 }, { id: 1002 }, { id: 1003 }],
    orderMatters: true,
    tablesUsed: ['orders', 'payments'],
    successCriteria: ['Подзапрос возвращает order_id.', 'Внешний запрос фильтрует orders.id.', 'Фильтр payments.status = captured.'],
    hints: [
      'Подзапрос должен вернуть список order_id.',
      'Внешнее поле для сравнения — orders.id.',
      'Не забывай фильтр captured.',
      'Заказ 1005 не попадёт: у него authorized, не captured.'
    ],
    explanation: 'IN удобен для отбора объектов, у которых существует связанный факт определённого типа.',
    commonMistakes: ['Сравнить id с payment.id.', 'Вернуть authorized-платежи.', 'Забыть ORDER BY для стабильной проверки.'],
    relatedKnowledgeIds: ['sql-subquery', 'sql-where-filter'],
    xp: 85,
    prerequisiteTaskIds: ['q16-subquery-above-average'],
    successStory: 'Captured-печати сверены: три заказа имеют подтверждённое списание.',
    companionSuccess: 'Список из подзапроса лег в основной фильтр без лишнего шума.',
    companionError: 'Проверь, что подзапрос отдаёт order_id, а не id платежа.'
  },
  {
    id: 'q18-cte-payment-reconciliation',
    chapterId: 'subquery-dungeon',
    pathType: 'case',
    title: 'Сверка казны через CTE',
    storyIntro: 'Совет требует отчёт: paid-заказы должны совпадать с captured-суммой. Найди расхождения и покажи суммы.',
    businessContext: 'CTE делает сложную сверку платежей и заказов читаемой и проверяемой.',
    learningGoal: 'Разложить сверку на именованный шаг и итоговый запрос.',
    sqlConcept: 'CTE, COALESCE',
    starterSql: "WITH captured AS (\n  SELECT order_id, SUM(amount) AS captured_amount\n  FROM payments\n  WHERE status = 'captured'\n  GROUP BY order_id\n)\nSELECT orders.id AS order_id,\n  orders.total AS order_total,\n  COALESCE(captured.captured_amount, 0) AS captured_amount\nFROM orders\nLEFT JOIN captured ON captured.order_id = orders.id\nWHERE orders.status = 'paid'\n  AND COALESCE(captured.captured_amount, 0) <> orders.total\nORDER BY orders.id;",
    expectedRows: [
      { order_id: 1003, order_total: 980, captured_amount: 1960 },
      { order_id: 1005, order_total: 8300, captured_amount: 0 }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'payments'],
    successCriteria: ['CTE captured агрегирует captured-платежи.', 'LEFT JOIN сохраняет paid-заказы без captured.', 'COALESCE превращает NULL в 0 для сравнения.'],
    hints: [
      'Сначала посчитай captured_amount по order_id.',
      'Назови этот шаг captured через WITH.',
      'LEFT JOIN нужен, чтобы не потерять заказ без captured.',
      'COALESCE помогает сравнить NULL как 0.'
    ],
    explanation: 'Это практический запрос сверки: он одновременно ловит дубль captured по 1003 и отсутствие captured по 1005.',
    commonMistakes: ['Использовать INNER JOIN и потерять 1005.', 'Сравнить отдельный платёж вместо суммы.', 'Не применить COALESCE.'],
    relatedKnowledgeIds: ['sql-cte', 'sql-left-join', 'data-quality'],
    xp: 95,
    prerequisiteTaskIds: ['q17-in-captured-orders'],
    successStory: 'Казна сверена: два расхождения вынесены на совет, и оба теперь объяснимы.',
    companionSuccess: 'CTE сделал расследование читаемым. Так запрос можно показать команде.',
    companionError: 'Если исчез заказ 1005, проверь JOIN: без captured он должен остаться в сверке.'
  },
  {
    id: 'q19-row-number-region-leader',
    chapterId: 'window-order',
    pathType: 'trial',
    title: 'Первый заказ каждого региона',
    storyIntro: 'Орден аналитиков учит не схлопывать строки, когда нужен лидер внутри каждой группы.',
    businessContext: 'ROW_NUMBER позволяет найти топ-строку внутри сегмента и сохранить её поля.',
    learningGoal: 'Использовать ROW_NUMBER с PARTITION BY.',
    sqlConcept: 'ROW_NUMBER OVER',
    starterSql: 'WITH ranked AS (\n  SELECT customers.region,\n    orders.id,\n    orders.total,\n    ROW_NUMBER() OVER (\n      PARTITION BY customers.region\n      ORDER BY orders.total DESC\n    ) AS rn\n  FROM orders\n  JOIN customers ON customers.id = orders.customer_id\n)\nSELECT region, id, total\nFROM ranked\nWHERE rn = 1\nORDER BY region;',
    expectedRows: [
      { region: 'moscow', id: 1002, total: 2100 },
      { region: 'siberia', id: 1003, total: 980 },
      { region: 'ural', id: 1005, total: 8300 }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'customers'],
    successCriteria: ['PARTITION BY customers.region.', 'ORDER BY orders.total DESC внутри окна.', 'Внешний WHERE rn = 1.'],
    hints: [
      'GROUP BY даст максимум, но не безопасно сохранит id строки.',
      'PARTITION BY создаёт отдельный рейтинг по региону.',
      'ROW_NUMBER назначает 1 лидеру региона.',
      'Во внешнем запросе оставь rn = 1.'
    ],
    explanation: 'Оконные функции добавляют аналитический расчёт к строке, не превращая результат в одну строку на группу раньше времени.',
    commonMistakes: ['Использовать GROUP BY и потерять id.', 'Забыть PARTITION BY.', 'Сортировать total ASC.'],
    relatedKnowledgeIds: ['sql-window-functions', 'sql-cte', 'sql-join-relations'],
    xp: 100,
    prerequisiteTaskIds: ['q18-cte-payment-reconciliation'],
    successStory: 'Лидеры регионов названы. Орден оконных функций кивает почти незаметно.',
    companionSuccess: 'Высшая магия? Нет, просто окно с правильным PARTITION BY.',
    companionError: 'Если видишь одного лидера на всё королевство, проверь PARTITION BY.'
  },
  {
    id: 'q20-rank-orders',
    chapterId: 'window-order',
    pathType: 'trial',
    title: 'Ранг крупных заказов',
    storyIntro: 'Нужно выстроить заказы по величине, чтобы самые крупные получили отдельную проверку.',
    businessContext: 'RANK помогает ранжировать строки и оставлять прозрачный порядок при равных значениях.',
    learningGoal: 'Использовать RANK OVER с глобальной сортировкой.',
    sqlConcept: 'RANK OVER',
    starterSql: 'SELECT id, total,\n  RANK() OVER (ORDER BY total DESC) AS total_rank\nFROM orders\nORDER BY total_rank\nLIMIT 3;',
    expectedRows: [
      { id: 1005, total: 8300, total_rank: 1 },
      { id: 1001, total: 5600, total_rank: 2 },
      { id: 1002, total: 2100, total_rank: 3 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['RANK сортирует по total DESC.', 'Alias total_rank.', 'LIMIT 3 оставляет верх рейтинга.'],
    hints: [
      'RANK() OVER задаёт номер позиции по сортировке.',
      'DESC нужен для рейтинга от больших сумм к меньшим.',
      'ORDER BY total_rank стабилизирует вывод.',
      'Нужны первые три строки.'
    ],
    explanation: 'Ранжирование часто используется для top-N отчётов, приоритизации проверок и поиска “самых важных” объектов.',
    commonMistakes: ['Использовать ROW_NUMBER без необходимости.', 'Сортировать ASC.', 'Не дать alias total_rank.'],
    relatedKnowledgeIds: ['sql-window-functions', 'sql-order-limit'],
    xp: 100,
    prerequisiteTaskIds: ['q19-row-number-region-leader'],
    successStory: 'Три крупнейших заказа вышли в верхний ряд проверки.',
    companionSuccess: 'Ранг честный: крупные суммы впереди.',
    companionError: 'Рейтинг перевёрнут? Проверь DESC и ORDER BY внутри OVER.'
  },
  {
    id: 'q21-running-total-and-neighbors',
    chapterId: 'window-order',
    pathType: 'case',
    title: 'Хроника выручки',
    storyIntro: 'Летописец просит показать, как росла сумма заказов по дням и какая сумма была у предыдущего заказа.',
    businessContext: 'LAG и SUM OVER помогают анализировать динамику без потери строк.',
    learningGoal: 'Использовать LAG и накопительную сумму.',
    sqlConcept: 'LAG, SUM OVER',
    starterSql: 'SELECT id,\n  total,\n  LAG(total) OVER (ORDER BY created_at) AS prev_total,\n  SUM(total) OVER (\n    ORDER BY created_at\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM orders\nORDER BY created_at;',
    expectedRows: [
      { id: 1001, total: 5600, prev_total: null, running_total: 5600 },
      { id: 1002, total: 2100, prev_total: 5600, running_total: 7700 },
      { id: 1003, total: 980, prev_total: 2100, running_total: 8680 },
      { id: 1004, total: 1200, prev_total: 980, running_total: 9880 },
      { id: 1005, total: 8300, prev_total: 1200, running_total: 18180 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['LAG(total) смотрит на предыдущую строку по created_at.', 'SUM OVER считает накопительно.', 'Порядок результата совпадает с хронологией.'],
    hints: [
      'Оба окна должны быть упорядочены по created_at.',
      'У первого заказа prev_total будет NULL.',
      'Накопительная сумма требует рамку до текущей строки.',
      'Не используй GROUP BY: строки должны сохраниться.'
    ],
    explanation: 'Оконные функции позволяют смотреть на соседей и накопления: это основа для динамики, воронок и диагностики скачков.',
    commonMistakes: ['Сгруппировать строки и потерять хронологию.', 'Сортировать окно по id без явного смысла.', 'Забыть рамку накопительной суммы.'],
    relatedKnowledgeIds: ['sql-window-functions', 'sql-order-limit'],
    xp: 110,
    prerequisiteTaskIds: ['q20-rank-orders'],
    successStory: 'Хроника стала живой: рядом видны предыдущий заказ и растущая сумма.',
    companionSuccess: 'Теперь ты видишь не только строки, но и движение между ними.',
    companionError: 'Колонки сошлись, но строки пляшут. Проверь порядок окна и итоговую сортировку.'
  },
  {
    id: 'q22-delivery-funnel',
    chapterId: 'kingdom-cases',
    pathType: 'case',
    title: 'Воронка доставки',
    storyIntro: 'Совет хочет понять, как paid-заказы проходят в доставку: принято, упало или не дошло.',
    businessContext: 'Воронка показывает распределение paid-заказов по состояниям интеграции.',
    learningGoal: 'Собрать классификацию и агрегировать её.',
    sqlConcept: 'CASE + GROUP BY для funnel-lite',
    starterSql: "WITH states AS (\n  SELECT orders.id,\n    CASE\n      WHEN delivery_events.event_type = 'accepted' THEN 'accepted'\n      WHEN delivery_events.event_type = 'failed' THEN 'failed'\n      ELSE 'missing'\n    END AS delivery_state\n  FROM orders\n  LEFT JOIN delivery_events ON delivery_events.order_id = orders.id\n  WHERE orders.status = 'paid'\n)\nSELECT delivery_state, COUNT(*) AS cnt\nFROM states\nGROUP BY delivery_state\nORDER BY delivery_state;",
    expectedRows: [
      { delivery_state: 'accepted', cnt: 1 },
      { delivery_state: 'failed', cnt: 1 },
      { delivery_state: 'missing', cnt: 1 }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'delivery_events'],
    successCriteria: ['CTE states классифицирует paid-заказы.', 'GROUP BY считает количество по состоянию.', 'LEFT JOIN сохраняет missing.'],
    hints: [
      'Это развитие задачи с CASE: теперь нужна агрегация по состоянию.',
      'Сначала получи delivery_state на уровне заказа.',
      'Потом сгруппируй states по delivery_state.',
      'Должно получиться три состояния по одной строке.'
    ],
    explanation: 'Воронка не просто перечисляет проблемы, а показывает распределение процесса. Это помогает выбрать, куда копать первым.',
    commonMistakes: ['Считать все заказы, а не paid.', 'Потерять missing через INNER JOIN.', 'Группировать до классификации.'],
    relatedKnowledgeIds: ['sql-case-when', 'sql-group-by', 'integration'],
    xp: 115,
    prerequisiteTaskIds: ['q21-running-total-and-neighbors'],
    successStory: 'Воронка показала равный раскол: принято, упало, потерялось. У доставки будет долгий вечер.',
    companionSuccess: 'Вот аналитический результат: не одна строка, а картина процесса.',
    companionError: 'Воронка съехала? Проверь, что сначала классифицируешь paid-заказы, а потом считаешь.'
  },
  {
    id: 'q23-repeat-purchases',
    chapterId: 'kingdom-cases',
    pathType: 'trial',
    title: 'Вернувшийся покупатель',
    storyIntro: 'Торговая гильдия ищет клиентов с повторными заказами: с них начинается retention-разговор.',
    businessContext: 'Повторные покупки — простая, но важная метрика лояльности.',
    learningGoal: 'Найти клиентов с количеством заказов больше одного.',
    sqlConcept: 'retention-lite через GROUP BY и HAVING',
    starterSql: 'SELECT customer_id, COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 1\nORDER BY customer_id;',
    expectedRows: [{ customer_id: 1, order_count: 2 }],
    orderMatters: true,
    tablesUsed: ['orders'],
    successCriteria: ['Группировка по customer_id.', 'HAVING COUNT(*) > 1.', 'Возвращается клиент 1 с двумя заказами.'],
    hints: [
      'Повторность считается на уровне клиента.',
      'COUNT(*) покажет число заказов клиента.',
      'HAVING оставляет только тех, у кого заказов больше одного.',
      'Не фильтруй только paid, если задача про все повторные заказы.'
    ],
    explanation: 'Это retention-lite: пока без когорт, но уже с базовой идеей “клиент вернулся”.',
    commonMistakes: ['Группировать по order id.', 'Считать только paid без требования.', 'Использовать WHERE COUNT.'],
    relatedKnowledgeIds: ['sql-group-by', 'sql-having'],
    xp: 115,
    prerequisiteTaskIds: ['q22-delivery-funnel'],
    successStory: 'Клиент 1 отмечен как вернувшийся. Гильдия продаж довольно потирает руки.',
    companionSuccess: 'Повторность найдена простым запросом. Не всё ценное должно быть сложным.',
    companionError: 'Если список пустой, проверь: повторность живёт на customer_id, не на id заказа.'
  },
  {
    id: 'q24-kingdom-anomaly-board',
    chapterId: 'kingdom-cases',
    pathType: 'case',
    title: 'Доска аномалий королевства',
    storyIntro: 'Нужно собрать доску инцидентов: paid-заказы, где captured-сумма не совпадает с заказом или нет accepted-доставки.',
    businessContext: 'Реальная аналитическая проверка часто объединяет несколько сигналов качества процесса.',
    learningGoal: 'Совместить CTE, LEFT JOIN, агрегаты и CASE для итогового контроля.',
    sqlConcept: 'комплексная сверка процесса',
    starterSql: "WITH captured AS (\n  SELECT order_id, SUM(amount) AS captured_amount\n  FROM payments\n  WHERE status = 'captured'\n  GROUP BY order_id\n), accepted AS (\n  SELECT order_id, COUNT(*) AS accepted_count\n  FROM delivery_events\n  WHERE event_type = 'accepted'\n  GROUP BY order_id\n)\nSELECT orders.id AS order_id,\n  CASE\n    WHEN COALESCE(captured.captured_amount, 0) <> orders.total THEN 'payment_mismatch'\n    WHEN COALESCE(accepted.accepted_count, 0) = 0 THEN 'delivery_missing'\n    ELSE 'ok'\n  END AS anomaly_type\nFROM orders\nLEFT JOIN captured ON captured.order_id = orders.id\nLEFT JOIN accepted ON accepted.order_id = orders.id\nWHERE orders.status = 'paid'\n  AND (\n    COALESCE(captured.captured_amount, 0) <> orders.total\n    OR COALESCE(accepted.accepted_count, 0) = 0\n  )\nORDER BY orders.id;",
    expectedRows: [
      { order_id: 1001, anomaly_type: 'delivery_missing' },
      { order_id: 1003, anomaly_type: 'payment_mismatch' },
      { order_id: 1005, anomaly_type: 'payment_mismatch' }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'payments', 'delivery_events'],
    successCriteria: ['CTE captured считает суммы captured.', 'CTE accepted считает accepted-события.', 'CASE выбирает тип аномалии для paid-заказов.'],
    hints: [
      'Раздели проверку на CTE: captured и accepted.',
      'LEFT JOIN нужен для отсутствующих платежей и доставок.',
      'COALESCE превращает NULL в 0 перед сравнением.',
      'Если платежи не совпали, anomaly_type должен быть payment_mismatch.'
    ],
    explanation: 'Финальная задача связывает SQL и аналитическое мышление: мы формируем проверяемую доску аномалий, которая помогает команде приоритизировать разбор.',
    commonMistakes: ['Использовать INNER JOIN и потерять отсутствующие факты.', 'Не агрегировать captured перед сравнением.', 'Вернуть ok-строки, хотя нужна доска инцидентов.'],
    relatedKnowledgeIds: ['sql-cte', 'sql-case-when', 'sql-left-join', 'data-quality', 'integration'],
    xp: 130,
    prerequisiteTaskIds: ['q23-repeat-purchases'],
    successStory: 'Доска аномалий собрана. Королевство данных пока не идеально, зато теперь понятно, где чинить.',
    companionSuccess: 'Это уже не упражнение, а рабочий контроль качества процесса.',
    companionError: 'Сложная доска держится на простых шагах: CTE, LEFT JOIN, COALESCE и понятный CASE.'
  }
];

export const firstSqlQuestLesson = sqlQuestLessons[0];

export function getSqlQuestChapter(chapterId: string) {
  return sqlQuestChapters.find((chapter) => chapter.id === chapterId) ?? sqlQuestChapters[0];
}

export function getSqlQuestLesson(lessonId: string) {
  return sqlQuestLessons.find((lesson) => lesson.id === lessonId) ?? firstSqlQuestLesson;
}

export function getRankForXp(xp: number) {
  return [...sqlQuestRanks].reverse().find((rank) => xp >= rank.minXp) ?? sqlQuestRanks[0];
}

export function getNextRankForXp(xp: number) {
  return sqlQuestRanks.find((rank) => rank.minXp > xp);
}

export function getUnlockedRanksForXp(xp: number) {
  return sqlQuestRanks.filter((rank) => xp >= rank.minXp).map((rank) => rank.id);
}

export function isSqlQuestLessonUnlocked(lesson: SqlQuestLesson, solvedLessonIds: string[]) {
  return lesson.prerequisiteTaskIds.every((taskId) => solvedLessonIds.includes(taskId));
}
