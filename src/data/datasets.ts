import { type DatasetCard, datasetCardSchema } from '../entities/schemas';

export const datasets = datasetCardSchema.array().parse([
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'Заказы, платежи, доставка, клиенты без персональных данных.',
    taskIdeas: ['поиск оплаченных заказов без доставки', 'reconciliation статусов', 'история заказов'],
    restrictions: 'Небольшой учебный объём.',
    status: 'used'
  },
  {
    id: 'banking-lite',
    name: 'Banking-lite',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'Операции, лимиты, идемпотентность, audit trail без ПДн.',
    taskIdeas: ['проверка дублей платежей', 'retry policy', 'идемпотентность POST'],
    restrictions: 'Не заменяет реальные банковские регламенты.',
    status: 'used'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'Отправления, маршруты, события доставки, SLA.',
    taskIdeas: ['webhook-события', 'async delivery flow', 'поиск просрочек'],
    restrictions: 'Упрощённая модель маршрутов.',
    status: 'used'
  },
  {
    id: 'education',
    name: 'Education Platform',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'Курсы, уроки, прогресс, учебные воронки.',
    taskIdeas: ['cohorts-lite', 'воронка уроков', 'отчёт по завершениям'],
    restrictions: 'Нет персональных данных.',
    status: 'used'
  },
  {
    id: 'support',
    name: 'Support Tickets',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'Обращения, SLA, статусы, каналы поддержки.',
    taskIdeas: ['SLA breach', 'приоритизация', 'наблюдаемость'],
    restrictions: 'Синтетические тексты обращений.',
    status: 'used'
  },
  {
    id: 'api-logs',
    name: 'API Logs',
    source: 'Локальный синтетический seed',
    license: 'Создано для проекта',
    purpose: 'HTTP-запросы, latency, trace id, ошибки.',
    taskIdeas: ['rate limits', 'ошибки 5xx', 'корреляция trace id'],
    restrictions: 'Сэмпл для обучения.',
    status: 'used'
  },
  {
    id: 'chinook',
    name: 'Chinook Database',
    source: 'https://github.com/lerocha/chinook-database',
    license: 'Требуется финальная проверка LICENSE.md перед копированием данных',
    purpose: 'Digital media store sample database.',
    taskIdeas: ['JOIN', 'агрегаты', 'отчётность'],
    restrictions: 'Домен менее близок к интеграционному анализу.',
    status: 'evaluated'
  },
  {
    id: 'sakila',
    name: 'Sakila Sample Database',
    source: 'https://dev.mysql.com/doc/sakila/en/',
    license: 'Есть отдельный раздел лицензии в документации MySQL',
    purpose: 'DVD rental sample database.',
    taskIdeas: ['ERD', 'нормализация', 'SQL joins'],
    restrictions: 'Не копировать без финальной проверки лицензии.',
    status: 'evaluated'
  },
  {
    id: 'adventureworks',
    name: 'AdventureWorks',
    source: 'https://github.com/microsoft/sql-server-samples',
    license: 'MIT для Microsoft SQL Server samples по корневому license.txt',
    purpose: 'OLTP/DW sample database.',
    taskIdeas: ['сложная отчётность', 'моделирование', 'data warehouse basics'],
    restrictions: 'Тяжёлый SQL Server-ориентированный домен.',
    status: 'evaluated'
  }
] satisfies DatasetCard[]);
