import type { SqlRow } from '../shared/lib/sqlChecker';

export type SqlLesson = {
  id: string;
  level: number;
  title: string;
  concept: string;
  context: string;
  analystWhy: string;
  task: string;
  starterSql: string;
  expectedRows: SqlRow[];
  orderMatters?: boolean;
  tablesUsed: string[];
  focus: string[];
  successCriteria: string[];
  hints: string[];
  explanation: string;
  commonMistakes: string[];
  nextUnlock: string;
};

export const sqlLessons: SqlLesson[] = [
  {
    id: 'sql-01-select-columns',
    level: 1,
    title: 'Шаг 1. Прочитать таблицу заказов',
    concept: 'SELECT выбирает конкретные колонки. Аналитик почти никогда не начинает с “всего”, он выбирает поля под вопрос.',
    context: 'Продакт просит быстро посмотреть, какие заказы есть в учебной базе и какие у них статусы.',
    analystWhy: 'Так вы учитесь сначала видеть предметную область: заказ, статус, сумма, дата создания.',
    task: 'Выведите `id`, `status`, `total` из таблицы `orders`.',
    starterSql: 'SELECT id, status, total\nFROM orders;',
    expectedRows: [
      { id: 1001, status: 'paid', total: 5600 },
      { id: 1002, status: 'shipped', total: 2100 },
      { id: 1003, status: 'paid', total: 980 },
      { id: 1004, status: 'cancelled', total: 1200 },
      { id: 1005, status: 'paid', total: 8300 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    focus: ['SELECT', 'выбор колонок', 'чтение домена'],
    successCriteria: ['Запрос берёт данные из `orders`.', 'В результате только три нужные колонки.', 'Порядок строк можно оставить как в таблице.'],
    hints: [
      'Начните с SELECT и перечислите нужные колонки через запятую.',
      'После FROM укажите таблицу `orders`.',
      'Не используйте `SELECT *`: задача учит выбирать только полезные поля.',
      'Итоговый запрос: `SELECT id, status, total FROM orders;`'
    ],
    explanation: 'Первый шаг SQL для аналитика — понять, какие поля отвечают на вопрос. Лишние колонки мешают читать результат и усложняют обсуждение с командой.',
    commonMistakes: ['Использовать `SELECT *`.', 'Забыть колонку `total`.', 'Брать данные из таблицы платежей вместо заказов.'],
    nextUnlock: 'После чтения таблицы переходим к фильтрации по бизнес-статусу.'
  },
  {
    id: 'sql-02-where-status',
    level: 1,
    title: 'Шаг 2. Отфильтровать оплаченные заказы',
    concept: 'WHERE оставляет только строки, которые подходят под условие.',
    context: 'Команда доставки хочет работать только с заказами, которые уже оплачены.',
    analystWhy: 'Фильтр по статусу — базовый способ перевести бизнес-правило в проверяемый запрос.',
    task: 'Верните `id` и `total` заказов со статусом `paid`.',
    starterSql: 'SELECT id, total\nFROM orders\nWHERE status = "paid";',
    expectedRows: [
      { id: 1001, total: 5600 },
      { id: 1003, total: 980 },
      { id: 1005, total: 8300 }
    ],
    orderMatters: true,
    tablesUsed: ['orders'],
    focus: ['WHERE', 'строковые значения', 'статусы'],
    successCriteria: ['Есть условие `status = "paid"`.', 'Возвращаются только оплаченные заказы.', 'Колонки результата: `id`, `total`.'],
    hints: [
      'Сначала выберите нужные колонки из `orders`.',
      'Добавьте WHERE после FROM.',
      'Строковый статус нужно сравнить со значением `"paid"`.',
      'Итог: `SELECT id, total FROM orders WHERE status = "paid";`'
    ],
    explanation: 'Статус заказа — бизнес-состояние. Аналитик должен явно фиксировать, какой статус считается входом в следующий процесс.',
    commonMistakes: ['Фильтровать по payment status вместо order status.', 'Писать `paid` без кавычек.', 'Возвращать отменённые заказы.'],
    nextUnlock: 'Следующий шаг — сортировка, чтобы видеть приоритетные строки.'
  },
  {
    id: 'sql-03-order-limit',
    level: 1,
    title: 'Шаг 3. Найти самый дорогой заказ',
    concept: 'ORDER BY сортирует строки, LIMIT ограничивает количество строк.',
    context: 'Руководитель хочет проверить самый крупный заказ перед ручной сверкой.',
    analystWhy: 'Сортировка и лимит помогают быстро находить аномалии, приоритеты и кандидатов для ручной проверки.',
    task: 'Верните `id` и `total` самого дорогого заказа.',
    starterSql: 'SELECT id, total\nFROM orders\nORDER BY total DESC\nLIMIT 1;',
    expectedRows: [{ id: 1005, total: 8300 }],
    orderMatters: true,
    tablesUsed: ['orders'],
    focus: ['ORDER BY', 'DESC', 'LIMIT'],
    successCriteria: ['Сортировка по `total DESC`.', 'Ограничение `LIMIT 1`.', 'В результате заказ 1005.'],
    hints: [
      'Нужно отсортировать суммы от большей к меньшей.',
      '`DESC` означает убывание.',
      'Оставьте только первую строку через `LIMIT 1`.',
      'Итог: `SELECT id, total FROM orders ORDER BY total DESC LIMIT 1;`'
    ],
    explanation: 'Такие запросы часто используются как sanity-check: “покажи самый дорогой/последний/подозрительный объект”.',
    commonMistakes: ['Сортировать ASC и получить самый дешёвый заказ.', 'Забыть LIMIT.', 'Вывести только total без id.'],
    nextUnlock: 'Теперь можно соединять таблицы и добавлять контекст клиента.'
  },
  {
    id: 'sql-04-inner-join',
    level: 2,
    title: 'Шаг 4. Добавить регион клиента через JOIN',
    concept: 'JOIN соединяет строки, когда ключ в одной таблице соответствует ключу в другой.',
    context: 'Нужно понять, из каких регионов приходят оплаченные заказы.',
    analystWhy: 'JOIN учит видеть связи сущностей: заказ принадлежит клиенту, у клиента есть регион и сегмент.',
    task: 'Верните `id` заказа и `region` клиента для оплаченных заказов.',
    starterSql: 'SELECT orders.id, customers.region\nFROM orders\nJOIN customers ON customers.id = orders.customer_id\nWHERE orders.status = "paid";',
    expectedRows: [
      { id: 1001, region: 'ural' },
      { id: 1003, region: 'siberia' },
      { id: 1005, region: 'ural' }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'customers'],
    focus: ['JOIN', 'FOREIGN KEY', 'связи сущностей'],
    successCriteria: ['Связь `customers.id = orders.customer_id`.', 'Фильтр по `orders.status`.', 'В результате есть регион клиента.'],
    hints: [
      '`orders.customer_id` указывает на `customers.id`.',
      'Когда колонка `id` есть в обеих таблицах, лучше писать префикс таблицы.',
      'Фильтр paid относится к заказу, не к клиенту.',
      'Итоговый JOIN соединяет `orders` и `customers` по customer_id.'
    ],
    explanation: 'Аналитик использует JOIN, чтобы собрать бизнес-картину из нескольких сущностей, не смешивая их смысл.',
    commonMistakes: ['Соединить `orders.id` с `customers.id`.', 'Не указать префикс у `id`.', 'Потерять фильтр paid.'],
    nextUnlock: 'Дальше агрегируем данные по региону.'
  },
  {
    id: 'sql-05-group-by',
    level: 2,
    title: 'Шаг 5. Посчитать сумму заказов по региону',
    concept: 'GROUP BY собирает строки в группы, агрегаты считают показатели внутри группы.',
    context: 'Продакт хочет увидеть, где больше денег в оплаченных заказах.',
    analystWhy: 'Агрегации переводят сырые строки в показатель, который можно обсуждать с бизнесом.',
    task: 'Посчитайте `cnt` и `total_sum` оплаченных заказов по `region`.',
    starterSql: 'SELECT customers.region, COUNT(*) AS cnt, SUM(orders.total) AS total_sum\nFROM orders\nJOIN customers ON customers.id = orders.customer_id\nWHERE orders.status = "paid"\nGROUP BY customers.region;',
    expectedRows: [
      { region: 'siberia', cnt: 1, total_sum: 980 },
      { region: 'ural', cnt: 2, total_sum: 13900 }
    ],
    tablesUsed: ['orders', 'customers'],
    focus: ['GROUP BY', 'COUNT', 'SUM'],
    successCriteria: ['Группировка по `customers.region`.', 'Есть `COUNT(*) AS cnt`.', 'Есть `SUM(orders.total) AS total_sum`.'],
    hints: [
      'Сначала соедините заказы с клиентами.',
      'Оставьте только `orders.status = "paid"`.',
      'Все неагрегированные поля из SELECT должны быть в GROUP BY.',
      'Для суммы используйте `SUM(orders.total) AS total_sum`.'
    ],
    explanation: 'Важно фильтровать строки до агрегации: иначе отменённые и неоплаченные заказы попадут в показатель.',
    commonMistakes: ['Группировать по customer_id вместо region.', 'Считать все заказы.', 'Не дать агрегату понятное имя.'],
    nextUnlock: 'Следующий шаг — искать группы, где показатель нарушает ожидание.'
  },
  {
    id: 'sql-06-having-duplicates',
    level: 2,
    title: 'Шаг 6. Найти дубли платежей',
    concept: 'HAVING фильтрует уже сгруппированные данные.',
    context: 'Платёжный провайдер мог прислать повторный callback, и деньги могли списаться дважды.',
    analystWhy: 'Дубли по ключу идемпотентности — реальный риск интеграций и финансовых процессов.',
    task: 'Верните `idempotency_key` и `cnt` для captured-платежей, где один ключ встретился больше одного раза.',
    starterSql: 'SELECT idempotency_key, COUNT(*) AS cnt\nFROM payments\nWHERE status = "captured"\nGROUP BY idempotency_key\nHAVING COUNT(*) > 1;',
    expectedRows: [{ idempotency_key: 'pay-1003', cnt: 2 }],
    tablesUsed: ['payments'],
    focus: ['HAVING', 'COUNT', 'идемпотентность'],
    successCriteria: ['Фильтр `status = "captured"`.', 'GROUP BY по `idempotency_key`.', 'HAVING COUNT(*) > 1.'],
    hints: [
      'Дубли ищутся не через WHERE, а через группировку.',
      'Сначала оставьте только успешные списания `captured`.',
      'HAVING применяется после GROUP BY.',
      'Итог: ключ `pay-1003` встречается дважды.'
    ],
    explanation: 'WHERE фильтрует строки, HAVING фильтрует группы. Для поиска дублей нужна группа по ключу и условие на COUNT.',
    commonMistakes: ['Использовать WHERE COUNT(*) > 1.', 'Считать authorized-платежи.', 'Группировать по id платежа.'],
    nextUnlock: 'Теперь ищем отсутствие связанных событий через LEFT JOIN.'
  },
  {
    id: 'sql-07-left-join-missing',
    level: 3,
    title: 'Шаг 7. Найти оплаченные заказы без передачи в доставку',
    concept: 'LEFT JOIN сохраняет строки слева даже тогда, когда справа нет соответствия.',
    context: 'Доставка жалуется, что часть оплаченных заказов не попадает в их очередь.',
    analystWhy: 'Это классический аналитический запрос на разрыв интеграционного процесса.',
    task: 'Верните `id` оплаченных заказов без события доставки `accepted`.',
    starterSql: 'SELECT orders.id\nFROM orders\nLEFT JOIN delivery_events\n  ON delivery_events.order_id = orders.id\n  AND delivery_events.event_type = "accepted"\nWHERE orders.status = "paid"\n  AND delivery_events.id IS NULL;',
    expectedRows: [{ id: 1001 }, { id: 1003 }],
    tablesUsed: ['orders', 'delivery_events'],
    focus: ['LEFT JOIN', 'IS NULL', 'интеграционный разрыв'],
    successCriteria: ['LEFT JOIN к `delivery_events`.', 'Условие accepted находится в JOIN или корректно сохраняет missing rows.', 'Проверка `delivery_events.id IS NULL` находит 1001 и 1003.'],
    hints: [
      'INNER JOIN не подойдёт: он удалит строки без доставки.',
      'Нужно сохранить все paid-заказы, а потом найти отсутствующее событие.',
      'Условие `event_type = "accepted"` безопаснее держать в ON.',
      'Если справа нет строки, поля `delivery_events` будут NULL.'
    ],
    explanation: 'LEFT JOIN + IS NULL показывает “ожидали связанный факт, но его нет”. Заказ 1001 вообще без события accepted, а 1003 имеет failed, но accepted так и не получил.',
    commonMistakes: ['Использовать JOIN вместо LEFT JOIN.', 'Проверять любой event, а не accepted.', 'Поставить фильтр event_type в WHERE так, что LEFT JOIN превратится в INNER JOIN.'],
    nextUnlock: 'Дальше сравниваем бизнес-статус и технические события.'
  },
  {
    id: 'sql-08-case-quality',
    level: 3,
    title: 'Шаг 8. Классифицировать качество передачи в доставку',
    concept: 'CASE превращает условия в понятные аналитические категории.',
    context: 'Нужно подготовить отчёт: какие оплаченные заказы переданы, какие упали, какие вообще не отправлены.',
    analystWhy: 'CASE помогает не просто найти строки, а объяснить состояние процесса бизнес-языком.',
    task: 'Для paid-заказов верните `id` и `delivery_state`: `accepted`, `failed` или `missing`.',
    starterSql: 'SELECT orders.id,\n  CASE\n    WHEN delivery_events.event_type = "accepted" THEN "accepted"\n    WHEN delivery_events.event_type = "failed" THEN "failed"\n    ELSE "missing"\n  END AS delivery_state\nFROM orders\nLEFT JOIN delivery_events ON delivery_events.order_id = orders.id\nWHERE orders.status = "paid";',
    expectedRows: [
      { id: 1001, delivery_state: 'missing' },
      { id: 1003, delivery_state: 'failed' },
      { id: 1005, delivery_state: 'accepted' }
    ],
    tablesUsed: ['orders', 'delivery_events'],
    focus: ['CASE', 'LEFT JOIN', 'классификация'],
    successCriteria: ['Есть CASE с тремя состояниями.', 'Paid-заказы не теряются.', 'Missing определяется через отсутствие события.'],
    hints: [
      'Начните с paid-заказов и LEFT JOIN к событиям.',
      'CASE проверяет тип события и возвращает текстовую категорию.',
      'ELSE удобно использовать для missing.',
      'В результате должно быть три paid-заказа.'
    ],
    explanation: 'Хороший аналитический результат часто не сырые коды, а понятная классификация, которую можно обсудить на встрече.',
    commonMistakes: ['Считать failed как missing.', 'Потерять заказ без события.', 'Не дать alias `delivery_state`.'],
    nextUnlock: 'Следующий уровень — подзапросы для сравнений с общей картиной.'
  },
  {
    id: 'sql-09-subquery',
    level: 4,
    title: 'Шаг 9. Найти заказы выше средней суммы',
    concept: 'Подзапрос позволяет сравнить строку с агрегированным значением.',
    context: 'Аналитик ищет крупные заказы, которые стоит проверять внимательнее.',
    analystWhy: 'Подзапросы нужны, когда критерий зависит от данных, а не от фиксированного числа.',
    task: 'Верните `id` и `total` заказов, сумма которых выше средней суммы всех заказов.',
    starterSql: 'SELECT id, total\nFROM orders\nWHERE total > (SELECT AVG(total) FROM orders);',
    expectedRows: [
      { id: 1001, total: 5600 },
      { id: 1005, total: 8300 }
    ],
    tablesUsed: ['orders'],
    focus: ['subquery', 'AVG', 'динамический порог'],
    successCriteria: ['AVG считается подзапросом.', 'Сравнение идёт по `total`.', 'Результат содержит 1001 и 1005.'],
    hints: [
      'Средняя сумма считается отдельным SELECT.',
      'Подзапрос можно поставить справа от `>`.',
      'Не хардкодьте среднее число.',
      'Порог должен пересчитаться, если данные изменятся.'
    ],
    explanation: 'Аналитик должен избегать магических чисел, если порог можно вывести из данных.',
    commonMistakes: ['Посчитать среднее вручную.', 'Сравнить id вместо total.', 'Использовать SUM вместо AVG.'],
    nextUnlock: 'Теперь используем CTE, чтобы сложный запрос читался как сценарий.'
  },
  {
    id: 'sql-10-cte',
    level: 4,
    title: 'Шаг 10. Сверка paid-заказов и captured-платежей через CTE',
    concept: 'CTE через WITH делает сложный запрос читаемым: сначала именуем шаги, потом соединяем результат.',
    context: 'Нужно сверить оплаченные заказы с фактически captured-платежами.',
    analystWhy: 'CTE помогает объяснять запрос как последовательность проверок, а не как один непонятный комок SQL.',
    task: 'Верните `order_id`, `order_total`, `captured_amount` для paid-заказов, где сумма captured-платежей не равна сумме заказа.',
    starterSql: 'WITH captured AS (\n  SELECT order_id, SUM(amount) AS captured_amount\n  FROM payments\n  WHERE status = "captured"\n  GROUP BY order_id\n)\nSELECT orders.id AS order_id,\n  orders.total AS order_total,\n  COALESCE(captured.captured_amount, 0) AS captured_amount\nFROM orders\nLEFT JOIN captured ON captured.order_id = orders.id\nWHERE orders.status = "paid"\n  AND COALESCE(captured.captured_amount, 0) <> orders.total;',
    expectedRows: [
      { order_id: 1003, order_total: 980, captured_amount: 1960 },
      { order_id: 1005, order_total: 8300, captured_amount: 0 }
    ],
    tablesUsed: ['orders', 'payments'],
    focus: ['CTE', 'reconciliation', 'SUM'],
    successCriteria: ['CTE агрегирует captured-платежи.', 'LEFT JOIN не теряет paid-заказы без captured.', 'Находятся заказ 1003 с дублем и заказ 1005 без captured-списания.'],
    hints: [
      'Сначала посчитайте сумму captured по order_id.',
      'Назовите этот шаг `captured` через WITH.',
      'Потом соедините CTE с orders через LEFT JOIN, чтобы не потерять заказы без captured.',
      'Для отсутствующей суммы используйте `COALESCE(..., 0)`.',
      'Ищите строки, где captured-сумма не равна `orders.total`.'
    ],
    explanation: 'Это уже аналитическая сверка: мы ищем два класса проблем — двойное captured-списание и отсутствие captured-списания при paid-заказе.',
    commonMistakes: ['Сравнить один платёж вместо суммы.', 'Не фильтровать captured.', 'Использовать INNER JOIN и потерять заказ без captured-платежа.'],
    nextUnlock: 'Следующий шаг — оконные функции для ранжирования и диагностики.'
  },
  {
    id: 'sql-11-window-functions',
    level: 5,
    title: 'Шаг 11. Найти самый крупный заказ в каждом регионе',
    concept: 'Оконные функции считают показатель внутри группы, но не схлопывают строки как GROUP BY.',
    context: 'Команда продаж хочет быстро увидеть главный заказ по каждому региону, не теряя идентификатор заказа.',
    analystWhy: 'Оконные функции помогают делать рейтинги, искать первые/последние события, диагностировать воронки и миграции.',
    task: 'Верните `region`, `id`, `total` самого крупного заказа в каждом регионе.',
    starterSql: 'WITH ranked AS (\n  SELECT customers.region,\n    orders.id,\n    orders.total,\n    ROW_NUMBER() OVER (\n      PARTITION BY customers.region\n      ORDER BY orders.total DESC\n    ) AS rn\n  FROM orders\n  JOIN customers ON customers.id = orders.customer_id\n)\nSELECT region, id, total\nFROM ranked\nWHERE rn = 1\nORDER BY region;',
    expectedRows: [
      { region: 'moscow', id: 1002, total: 2100 },
      { region: 'siberia', id: 1003, total: 980 },
      { region: 'ural', id: 1005, total: 8300 }
    ],
    orderMatters: true,
    tablesUsed: ['orders', 'customers'],
    focus: ['ROW_NUMBER', 'PARTITION BY', 'рейтинг'],
    successCriteria: ['Есть `ROW_NUMBER() OVER (...)`.', 'Разбиение идёт по `customers.region`.', 'Фильтр `rn = 1` оставляет лидера региона.'],
    hints: [
      'Сначала соедините заказы с клиентами, чтобы получить регион.',
      '`PARTITION BY customers.region` создаёт отдельный рейтинг внутри каждого региона.',
      '`ORDER BY orders.total DESC` ставит самый крупный заказ первым.',
      'Во внешнем SELECT оставьте строки, где `rn = 1`.'
    ],
    explanation: 'GROUP BY дал бы сумму или максимум, но не вернул бы безопасно id заказа. Оконная функция сохраняет строку и добавляет аналитический номер.',
    commonMistakes: ['Использовать GROUP BY и потерять id заказа.', 'Забыть PARTITION BY и получить одного лидера на всю базу.', 'Сортировать total по возрастанию.'],
    nextUnlock: 'Дальше можно развивать курс в cohort/funnel-lite и диагностику миграций.'
  }
];

export const firstSqlLesson = sqlLessons[0];
