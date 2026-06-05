export const sqlSchema = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  segment TEXT NOT NULL,
  region TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE delivery_events (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  idempotency_key TEXT,
  amount INTEGER NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

INSERT INTO customers VALUES
  (1, 'b2c', 'ural'),
  (2, 'b2b', 'moscow'),
  (3, 'b2c', 'siberia'),
  (4, 'b2c', 'ural');

INSERT INTO orders VALUES
  (1001, 1, 'paid', 5600, '2026-05-01'),
  (1002, 2, 'shipped', 2100, '2026-05-02'),
  (1003, 3, 'paid', 980, '2026-05-03'),
  (1004, 4, 'cancelled', 1200, '2026-05-04'),
  (1005, 1, 'paid', 8300, '2026-05-05');

INSERT INTO delivery_events VALUES
  (1, 1002, 'accepted', '2026-05-02'),
  (2, 1002, 'shipped', '2026-05-03'),
  (3, 1003, 'failed', '2026-05-03'),
  (4, 1005, 'accepted', '2026-05-05');

INSERT INTO payments VALUES
  (1, 1001, 'captured', 'pay-1001', 5600),
  (2, 1002, 'captured', 'pay-1002', 2100),
  (3, 1003, 'captured', 'pay-1003', 980),
  (4, 1003, 'captured', 'pay-1003', 980),
  (5, 1005, 'authorized', 'pay-1005', 8300);
`;

export const erdText = `
customers 1--N orders
orders 1--N payments
orders 1--N delivery_events
`;

export type SqlTablePreview = {
  name: string;
  title: string;
  description: string;
  columns: string[];
  rows: Array<Record<string, string | number | null>>;
};

export const sqlTablePreviews: SqlTablePreview[] = [
  {
    name: 'customers',
    title: 'Клиенты',
    description: 'Сегмент и регион клиента. Персональных данных нет, только аналитические признаки.',
    columns: ['id', 'segment', 'region'],
    rows: [
      { id: 1, segment: 'b2c', region: 'ural' },
      { id: 2, segment: 'b2b', region: 'moscow' },
      { id: 3, segment: 'b2c', region: 'siberia' },
      { id: 4, segment: 'b2c', region: 'ural' }
    ]
  },
  {
    name: 'orders',
    title: 'Заказы',
    description: 'Бизнес-статус заказа и сумма. Эта таблица отвечает на вопрос “что купили и в каком статусе”.',
    columns: ['id', 'customer_id', 'status', 'total', 'created_at'],
    rows: [
      { id: 1001, customer_id: 1, status: 'paid', total: 5600, created_at: '2026-05-01' },
      { id: 1002, customer_id: 2, status: 'shipped', total: 2100, created_at: '2026-05-02' },
      { id: 1003, customer_id: 3, status: 'paid', total: 980, created_at: '2026-05-03' },
      { id: 1004, customer_id: 4, status: 'cancelled', total: 1200, created_at: '2026-05-04' },
      { id: 1005, customer_id: 1, status: 'paid', total: 8300, created_at: '2026-05-05' }
    ]
  },
  {
    name: 'delivery_events',
    title: 'События доставки',
    description: 'Технические события интеграции с доставкой. Они не всегда совпадают с бизнес-статусом заказа.',
    columns: ['id', 'order_id', 'event_type', 'created_at'],
    rows: [
      { id: 1, order_id: 1002, event_type: 'accepted', created_at: '2026-05-02' },
      { id: 2, order_id: 1002, event_type: 'shipped', created_at: '2026-05-03' },
      { id: 3, order_id: 1003, event_type: 'failed', created_at: '2026-05-03' },
      { id: 4, order_id: 1005, event_type: 'accepted', created_at: '2026-05-05' }
    ]
  },
  {
    name: 'payments',
    title: 'Платежи',
    description: 'Статусы списаний и ключ идемпотентности. Таблица помогает искать дубли и сбои callback.',
    columns: ['id', 'order_id', 'status', 'idempotency_key', 'amount'],
    rows: [
      { id: 1, order_id: 1001, status: 'captured', idempotency_key: 'pay-1001', amount: 5600 },
      { id: 2, order_id: 1002, status: 'captured', idempotency_key: 'pay-1002', amount: 2100 },
      { id: 3, order_id: 1003, status: 'captured', idempotency_key: 'pay-1003', amount: 980 },
      { id: 4, order_id: 1003, status: 'captured', idempotency_key: 'pay-1003', amount: 980 },
      { id: 5, order_id: 1005, status: 'authorized', idempotency_key: 'pay-1005', amount: 8300 }
    ]
  }
];
