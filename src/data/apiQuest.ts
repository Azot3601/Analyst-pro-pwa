import type { Task } from '../entities/schemas';
import { reservationContract } from './cases/reservationCase/apiContract';
import type { JsonRule, OpenApiRule, RestRule, SoapRule } from '../shared/lib/apiQuestCheckers';

type UiMeta = {
  shortIntro: string;
  learningGoal: string;
  successMessage: string;
  trainingFocus: string;
  realLife: string;
};

export type ApiQuestTask = Task & UiMeta & (
  | { kind: 'rest'; config: RestRule & { editor: 'request-builder' }; beginner: RestBeginnerGuide }
  | { kind: 'json'; config: JsonRule & { editor: 'json' } }
  | { kind: 'openapi'; config: OpenApiRule & { editor: 'openapi' } }
  | { kind: 'integration'; config: { mode: 'checklist'; requiredConcepts: string[] } | ({ mode: 'soap' } & SoapRule) }
);

export type RestBodyField = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  enum?: string[];
  nullable?: boolean;
};

export type RestBeginnerGuide = {
  simpleExplanation: string;
  fillSteps: string[];
  expectedResult: string;
  example: {
    method: string;
    endpoint: string;
    pathParams?: Record<string, string>;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  };
  bodyContract?: { fields: RestBodyField[]; example: unknown };
};

export const restTestValues = {
  orderId: 'ORD-1001',
  customerId: 'CUST-1001',
  productId: 'PRD-10',
  paymentId: 'PAY-1001',
  'Idempotency-Key': 'pay-001'
} as const;

type IntegrationQuestConfig = Extract<ApiQuestTask, { kind: 'integration' }>['config'];

const hints = (id: string) => [
  { id: `${id}-h1`, level: 1, title: 'Лёгкий намёк', text: 'Сначала найдите одну часть договора, которую проверяет эта задача.' },
  { id: `${id}-h2`, level: 2, title: 'Направление', text: 'Сопоставьте ожидаемый contract с фактическим request или документом.' },
  { id: `${id}-h3`, level: 3, title: 'Проверка риска', text: 'Подумайте, что увидит потребитель при ошибке, повторе или отсутствующем поле.' }
];

const domainCopy = {
  rest: {
    context: 'Королевская служба заказов открывает ворота для купеческой гильдии. Гонец должен принести однозначный HTTP-приказ.',
    goal: 'Согласовать request и response так, чтобы потребитель мог выполнить операцию без устных договорённостей.',
    task: 'Соберите method, endpoint, параметры, headers и body. Ответ локальной службы должен совпасть с ожидаемым контрактом.',
    knowledge: ['rest', 'http-methods', 'endpoint', 'api-error-model']
  },
  json: {
    context: 'Писарь переносит данные заказа в JSON-свиток, который автоматически проверяет стража схемы.',
    goal: 'Не допустить неоднозначных типов, пропущенных required-полей и несовместимых изменений payload.',
    task: 'Исправьте JSON по показанной схеме и разберите каждое нарушение required, type, enum или nullable.',
    knowledge: ['json', 'json-schema', 'required-vs-optional', 'nullable']
  },
  openapi: {
    context: 'Две гильдии подписывают машиночитаемую карту договора до начала интеграционного тестирования.',
    goal: 'Сделать paths, methods, requestBody, responses и schemas проверяемой частью контракта.',
    task: 'Дополните OpenAPI-фрагмент обязательными разделами и убедитесь, что happy path и ошибки описаны явно.',
    knowledge: ['openapi', 'api-error-model', 'breaking-changes', 'compatibility']
  },
  integration: {
    context: 'Караван сообщений проходит через ненадёжные дороги: ответы теряются, события повторяются, древняя служба требует SOAP.',
    goal: 'Описать устойчивый обмен между системами: timeout, retry, идемпотентность, корреляцию и строгий формат ошибки.',
    task: 'Соберите правила интеграционного сценария или исправьте XML-свиток, не полагаясь на идеальную сеть.',
    knowledge: ['integration', 'idempotency', 'retry-policy', 'soap']
  }
} as const;

const baseTask = (id: string, title: string, domain: keyof typeof domainCopy, index: number): Task & UiMeta => ({
  id,
  title,
  domain,
  level: index < 3 ? 'junior' : index < 6 ? 'junior+' : 'middle',
  difficulty: Math.min(5, Math.ceil((index + 1) / 2)) as 1 | 2 | 3 | 4 | 5,
  estimatedFocus: `${12 + index * 2} минут`,
  skills: domain === 'integration' ? ['интеграции', 'отказоустойчивость'] : [domain.toUpperCase(), 'контракт'],
  caseContext: `${domainCopy[domain].context} Текущий договор: «${title}».`,
  businessGoal: domainCopy[domain].goal,
  taskText: domainCopy[domain].task,
  inputArtifacts: [{ id: `${id}-artifact`, title: 'Фокус контракта', type: domain === 'openapi' ? 'openapi' : domain === 'json' ? 'json' : 'text', content: title }],
  hints: hints(id),
  expectedAnswer: 'Все обязательные правила контракта выполнены.',
  validation: { kind: 'text-includes', requiredPhrases: ['контракт'] },
  explanation: 'Явные правила делают контракт проверяемым и помогают локализовать ошибку до интеграционного тестирования.',
  commonMistakes: ['Проверять только успешный сценарий.', 'Описывать условие словами без наблюдаемого expected/actual.'],
  relatedKnowledgeIds: [...domainCopy[domain].knowledge],
  shortIntro: `Гильдейский наставник передал вам дело: ${title.toLocaleLowerCase('ru')}.`,
  learningGoal: `Научиться проверять «${title}» как часть договора между системами.`,
  successMessage: 'Гонец прошёл проверку: эта часть контракта описана однозначно.',
  trainingFocus: `Контракт ${title}`,
  realLife: 'Системный аналитик фиксирует это правило до разработки и интеграционного тестирования.'
});

type RestCase = {
  title: string; method: string; path: string; status: number; focus: string; realLife: string;
  query?: string[]; headers?: Record<string, string>; body?: string[]; response?: string[];
  pathParamExamples?: Record<string, string>;
  context: string;
  goal: string;
  beginner: RestBeginnerGuide;
};

const restCases: RestCase[] = [
  {
    title: 'Получение заказа по идентификатору', method: 'GET', path: '/api/v1/orders/{orderId}', status: 200,
    response: ['id', 'status', 'totalAmount'], pathParamExamples: { orderId: 'ORD-1001' },
    focus: 'GET + endpoint + path parameter',
    context: 'CRM гильдии открывает карточку заказа и должна запросить ровно одну запись по её номеру.',
    goal: 'Научиться превращать endpoint template в адрес конкретного ресурса.',
    realLife: 'Так фронтенд получает карточку заказа, CRM открывает сделку, а мобильное приложение показывает детали доставки.',
    beginner: {
      simpleExplanation: 'Мы просим сервис заказов отдать один конкретный заказ. {orderId} — место для настоящего номера, а не текст для отправки.',
      fillSteps: ['Оставь метод GET.', 'Введи ORD-1001 как значение orderId.', 'Проверь Final URL и отправь request.'],
      expectedResult: 'HTTP 200 и JSON с полями id, status, totalAmount.',
      example: { method: 'GET', endpoint: '/api/v1/orders/{orderId}', pathParams: { orderId: 'ORD-1001' } }
    }
  },
  {
    title: 'Создание заказа', method: 'POST', path: '/api/v1/orders', status: 201,
    headers: { 'content-type': 'application/json' }, body: ['customerId', 'items', 'items.0.productId', 'items.0.quantity'], response: ['id', 'status'],
    focus: 'POST + Content-Type + JSON body',
    context: 'Мобильная лавка передаёт службе заказов новую покупку. Сервису нужны данные клиента и хотя бы одна позиция.',
    goal: 'Понять, как POST создаёт ресурс и почему body проверяется по контракту.',
    realLife: 'Так сайт, мобильное приложение или 1С создаёт новый заказ в другой системе.',
    beginner: {
      simpleExplanation: 'POST просит сервис создать новый ресурс. JSON body содержит данные заказа, а Content-Type сообщает сервису формат послания.',
      fillSteps: ['Выбери POST.', 'Укажи /api/v1/orders.', 'Добавь Content-Type: application/json.', 'Собери body по контракту.'],
      expectedResult: 'HTTP 201 и JSON с id нового заказа и status created.',
      example: { method: 'POST', endpoint: '/api/v1/orders', headers: { 'Content-Type': 'application/json' }, body: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 2 }], comment: null } },
      bodyContract: { fields: [
        { name: 'customerId', type: 'string', required: true, description: 'Кто оформляет заказ.' },
        { name: 'items', type: 'array', required: true, description: 'Непустой список позиций.' },
        { name: 'items[].productId', type: 'string', required: true, description: 'Идентификатор товара.' },
        { name: 'items[].quantity', type: 'number', required: true, description: 'Количество больше нуля.' },
        { name: 'comment', type: 'string | null', required: false, nullable: true, description: 'Комментарий можно не передавать или передать null.' }
      ], example: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 2 }], comment: null } }
    }
  },
  {
    title: 'Фильтрация истории заказов', method: 'GET', path: '/api/v1/orders', status: 200,
    query: ['status', 'page', 'size'], response: ['data', 'pagination'], focus: 'query params + pagination',
    context: 'Вечерний отчёт должен показать только оплаченные заказы и не загружать всю торговую книгу сразу.',
    goal: 'Научиться уточнять GET-запрос фильтрами и параметрами страницы.',
    realLife: 'Так список заказов фильтруют по статусу, дате, странице и размеру выдачи.',
    beginner: {
      simpleExplanation: 'Query params идут после адреса и уточняют выборку. Они не меняют сам ресурс, а фильтруют и делят список на страницы.',
      fillSteps: ['Оставь GET.', 'Укажи /api/v1/orders.', 'Заполни status=paid, page=1 и size=10.'],
      expectedResult: 'HTTP 200, массив data и объект pagination.',
      example: { method: 'GET', endpoint: '/api/v1/orders', query: { status: 'paid', page: '1', size: '10' } }
    }
  },
  {
    title: 'Частичное изменение статуса', method: 'PATCH', path: '/api/v1/orders/{orderId}', status: 200,
    headers: { 'content-type': 'application/json' }, body: ['status'], response: ['id', 'status'], pathParamExamples: { orderId: 'ORD-1001' }, focus: 'PATCH + частичное обновление',
    context: 'Клиент поменял только статус заказа. Полный заказ пересылать заново не нужно.',
    goal: 'Отличить PATCH от PUT и изменить только одно поле ресурса.',
    realLife: 'Так меняют статус или другое отдельное поле, не пересылая весь объект.',
    beginner: {
      simpleExplanation: 'PATCH изменяет часть ресурса. В body передаём только поле status, которое действительно меняется.',
      fillSteps: ['Выбери PATCH.', 'Подставь ORD-1001.', 'Передай JSON body со status=cancelled.'],
      expectedResult: 'HTTP 200 и заказ с обновлённым status.',
      example: { method: 'PATCH', endpoint: '/api/v1/orders/{orderId}', pathParams: { orderId: 'ORD-1001' }, headers: { 'Content-Type': 'application/json' }, body: { status: 'cancelled' } },
      bodyContract: { fields: [{ name: 'status', type: 'string', required: true, enum: ['paid', 'shipped', 'cancelled'], description: 'Новое состояние заказа.' }], example: { status: 'cancelled' } }
    }
  },
  {
    title: 'Удаление черновика заказа', method: 'DELETE', path: '/api/v1/orders/{orderId}', status: 204,
    pathParamExamples: { orderId: 'ORD-1001' }, focus: 'DELETE + status 204',
    context: 'Черновик заказа больше не нужен. Служба удаляет ресурс и подтверждает команду без response body.',
    goal: 'Понять семантику DELETE и успешный ответ без тела, не смешивая удаление с бизнес-отменой.',
    realLife: 'Так удаляют черновик или временный ресурс. Оформленный заказ чаще отменяют сменой статуса через PATCH, а HTTP 204 означает успех без body.',
    beginner: {
      simpleExplanation: 'DELETE просит удалить конкретный ресурс. Это не всегда равно бизнес-отмене: оформленный заказ обычно переводят в cancelled через PATCH. Status 204 — нормальный успех без body.',
      fillSteps: ['Выбери DELETE.', 'Подставь ORD-1001 в endpoint template.', 'Не добавляй body.'],
      expectedResult: 'HTTP 204 и пустое тело ответа.',
      example: { method: 'DELETE', endpoint: '/api/v1/orders/{orderId}', pathParams: { orderId: 'ORD-1001' } }
    }
  },
  {
    title: 'Идемпотентное создание платежа', method: 'POST', path: '/api/v1/payments', status: 202,
    headers: { 'content-type': 'application/json', 'idempotency-key': 'pay-001' }, body: ['orderId', 'amount'], response: ['operationId', 'status'], focus: 'Idempotency-Key + повторная отправка',
    context: 'Платёжный гонец отправил приказ в казну, но ответ потерялся. Повтор без уникальной печати может списать деньги дважды.',
    goal: 'Защитить платёж от дубля с помощью Idempotency-Key.',
    realLife: 'Так защищают платежи и заказы от дублей при повторной отправке.',
    beginner: {
      simpleExplanation: 'Idempotency-Key связывает повторы одной операции. Сервис узнаёт повтор и не создаёт второй платёж.',
      fillSteps: ['Выбери POST.', 'Укажи /api/v1/payments.', 'Добавь Idempotency-Key: pay-001.', 'Передай orderId и amount.'],
      expectedResult: 'HTTP 202 и operationId асинхронной операции.',
      example: { method: 'POST', endpoint: '/api/v1/payments', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'pay-001' }, body: { orderId: 'ORD-1001', amount: 5600 } },
      bodyContract: { fields: [
        { name: 'orderId', type: 'string', required: true, description: 'За какой заказ платим.' },
        { name: 'amount', type: 'number', required: true, description: 'Положительная сумма платежа.' }
      ], example: { orderId: 'ORD-1001', amount: 5600 } }
    }
  },
  {
    title: 'Условное обновление ресурса', method: 'PUT', path: '/api/v1/orders/{orderId}', status: 200,
    headers: { 'content-type': 'application/json', 'if-match': 'current-etag' }, body: ['customerId', 'items', 'items.0.productId', 'items.0.quantity'], response: ['id'],
    pathParamExamples: { orderId: 'ORD-1001' }, focus: 'PUT + If-Match',
    context: 'Два писаря открыли один заказ. If-Match не даст второму незаметно перезаписать свежие изменения первого.',
    goal: 'Понять полную замену ресурса и optimistic locking.',
    realLife: 'Так защищают данные от потери при одновременном редактировании несколькими пользователями.',
    beginner: {
      simpleExplanation: 'PUT отправляет полное новое представление ресурса. If-Match разрешает запись только для известной версии.',
      fillSteps: ['Выбери PUT.', 'Подставь ORD-1001.', 'Добавь If-Match: current-etag.', 'Передай полный body заказа.'],
      expectedResult: 'HTTP 200; при старом ETag сервис вернул бы 412.',
      example: { method: 'PUT', endpoint: '/api/v1/orders/{orderId}', pathParams: { orderId: 'ORD-1001' }, headers: { 'Content-Type': 'application/json', 'If-Match': 'current-etag' }, body: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 1 }] } },
      bodyContract: { fields: [
        { name: 'customerId', type: 'string', required: true, description: 'Полные данные владельца заказа.' },
        { name: 'items', type: 'array', required: true, description: 'Полный список позиций.' },
        { name: 'items[].productId', type: 'string', required: true, description: 'Идентификатор товара.' },
        { name: 'items[].quantity', type: 'number', required: true, description: 'Количество.' }
      ], example: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 1 }] } }
    }
  },
  {
    title: 'Получение ошибки валидации', method: 'POST', path: '/api/v1/orders', status: 422,
    headers: { 'content-type': 'application/json' }, body: ['items'], response: ['code', 'message'], focus: 'status 422 + error model',
    context: 'Писарь отправляет заказ без customerId, чтобы проверить, одинаково ли сервис и клиент понимают ошибку обязательного поля.',
    goal: 'Прочитать validation error как часть API-контракта.',
    realLife: 'Так фронтенд и интеграции понимают, что именно пользователь или система заполнили неправильно.',
    beginner: {
      simpleExplanation: '422 означает: JSON понятен, но бизнес-данных недостаточно. Error model должна назвать код и понятную причину.',
      fillSteps: ['Выбери POST.', 'Укажи /api/v1/orders и Content-Type.', 'Передай items, но намеренно не передавай customerId.'],
      expectedResult: 'HTTP 422 и JSON с полями code и message.',
      example: { method: 'POST', endpoint: '/api/v1/orders', headers: { 'Content-Type': 'application/json' }, body: { items: [] } },
      bodyContract: { fields: [
        { name: 'customerId', type: 'string', required: true, description: 'В этой задаче намеренно пропускается для проверки ошибки.' },
        { name: 'items', type: 'array', required: true, description: 'Список позиций заказа.' }
      ], example: { items: [] } }
    }
  },
  {
    // Кейс «Бронирование столиков»: поля ответа берутся из reservationContract,
    // то есть те же имена, что в SQL-таблице reservations и в ERD кейса.
    title: 'Кейс: получить бронь столика',
    method: reservationContract.method,
    path: reservationContract.path,
    status: 200,
    pathParamExamples: { id: '3' },
    response: reservationContract.requiredFields,
    focus: 'GET ресурса по id (сквозной кейс «Бронирование»)',
    context: 'Тот же домен, что в SQL-треке: гость, столик, бронь, штраф. Достаём одну бронь по её id.',
    goal: 'Прочитать контракт ответа брони — те же поля, что в таблице reservations.',
    realLife: 'GET ресурса по идентификатору — базовая операция чтения в REST; тут она на знакомом домене брони.',
    beginner: {
      simpleExplanation:
        'GET /reservations/{id} возвращает одну бронь. Поля ответа совпадают с колонками таблицы reservations — один домен на все инструменты тренажёра.',
      fillSteps: ['Выбери GET.', 'Подставь 3 в шаблон endpoint.', 'Не добавляй тело запроса.'],
      expectedResult: `HTTP 200 и JSON брони с полями: ${reservationContract.requiredFields.join(', ')}.`,
      example: { method: 'GET', endpoint: reservationContract.path, pathParams: { id: '3' } }
    }
  }
];

const restTasks: ApiQuestTask[] = restCases.map((item, index) => {
  const id = `api-quest-rest-${index + 1}`;
  const pathParams = Array.from(item.path.matchAll(/\{([^}]+)\}/g), (match) => match[1]);
  return {
    ...baseTask(id, item.title, 'rest', index),
    caseContext: item.context,
    businessGoal: item.goal,
    taskText: item.beginner.fillSteps.join(' '),
    learningGoal: item.goal,
    trainingFocus: item.focus,
    realLife: item.realLife,
    beginner: item.beginner,
    kind: 'rest',
    config: {
      editor: 'request-builder', method: item.method, path: item.path, pathParams,
      pathParamExamples: item.pathParamExamples,
      query: item.query ?? [], headers: item.headers ?? {}, bodyFields: item.body ?? [],
      expectedStatus: item.status, responseFields: item.response ?? []
    }
  };
});

const jsonSchemas: Array<{ title: string; schema: Record<string, unknown>; previousSchema?: Record<string, unknown> }> = [
  { title: 'Обязательные поля заказа', schema: { type: 'object', required: ['id', 'status'], properties: { id: { type: 'string' }, status: { type: 'string' } } } },
  { title: 'Типы суммы и валюты', schema: { type: 'object', required: ['amount', 'currency'], properties: { amount: { type: 'number' }, currency: { type: 'string' } } } },
  { title: 'Enum статусов заказа', schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['new', 'paid', 'cancelled'] } } } },
  { title: 'Nullable-адрес доставки', schema: { type: 'object', required: ['delivery'], properties: { delivery: { type: ['object', 'null'] } } } },
  { title: 'Запрет неожиданных полей', schema: { type: 'object', additionalProperties: false, required: ['id'], properties: { id: { type: 'string' } } } },
  { title: 'Массив позиций заказа', schema: { type: 'object', required: ['items'], properties: { items: { type: 'array', minItems: 1, items: { type: 'object', required: ['sku'], properties: { sku: { type: 'string' } } } } } } },
  { title: 'Формат ошибки API', schema: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'array' } } } },
  { title: 'Совместимое развитие ответа', schema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } }, previousSchema: { type: 'object', required: ['id', 'legacyCode'], properties: { id: { type: 'string' }, legacyCode: { type: 'string' } } } }
];

const jsonTasks: ApiQuestTask[] = jsonSchemas.map((item, index) => {
  const id = `api-quest-json-${index + 1}`;
  return { ...baseTask(id, item.title, 'json', index), kind: 'json', config: { editor: 'json', schema: item.schema, previousSchema: item.previousSchema } };
});

const openApiCases: Array<{ title: string; rule: OpenApiRule }> = [
  { title: 'Каркас документа OpenAPI', rule: { paths: {}, sections: ['openapi', 'info', 'paths'], responses: {}, schemas: [] } },
  { title: 'Пути и HTTP-методы заказов', rule: { paths: { '/orders': ['get', 'post'] }, sections: ['paths'], responses: {}, schemas: [] } },
  { title: 'Успешные и ошибочные responses', rule: { paths: { '/orders': ['post'] }, sections: ['paths'], responses: { 'POST /orders': ['201', '400', '409'] }, schemas: [] } },
  { title: 'Переиспользуемые schemas', rule: { paths: {}, sections: ['components'], responses: {}, schemas: ['Order', 'ApiError'] } },
  { title: 'Полный контракт получения заказа', rule: { paths: { '/orders/{orderId}': ['get'] }, sections: ['info', 'paths', 'components'], responses: { 'GET /orders/{orderId}': ['200', '404'] }, schemas: ['Order', 'ApiError'] } },
  { title: 'Поиск breaking change', rule: { paths: {}, sections: ['paths'], responses: {}, schemas: [], previousDocument: { paths: { '/orders': { get: { responses: { '200': { description: 'OK' } } } } } } } }
];

const openApiTasks: ApiQuestTask[] = openApiCases.map((item, index) => {
  const id = `api-quest-openapi-${index + 1}`;
  return { ...baseTask(id, item.title, 'openapi', index), kind: 'openapi', config: { editor: 'openapi', ...item.rule } };
});

const integrationCases: Array<{ title: string; config: IntegrationQuestConfig }> = [
  { title: 'Webhook с повторной доставкой', config: { mode: 'checklist', requiredConcepts: ['eventId', 'идемпотентность', 'retry', 'подпись'] } },
  { title: 'Асинхронный обмен через очередь', config: { mode: 'checklist', requiredConcepts: ['correlationId', 'DLQ', 'retry', 'ordering'] } },
  { title: 'Синхронный вызов партнёра', config: { mode: 'checklist', requiredConcepts: ['timeout', 'retry', 'circuit breaker', 'идемпотентность'] } },
  { title: 'SOAP: структура запроса', config: { mode: 'soap', operation: 'CreateOrder', requireHeader: true, requireFault: false } },
  { title: 'SOAP: контракт ответа', config: { mode: 'soap', operation: 'CreateOrderResponse', requireHeader: false, requireFault: false } },
  { title: 'SOAP: обработка Fault', config: { mode: 'soap', operation: 'GetOrderResponse', requireHeader: true, requireFault: true } }
];

const integrationTasks: ApiQuestTask[] = integrationCases.map((item, index) => {
  const id = `api-quest-integration-${index + 1}`;
  return { ...baseTask(id, item.title, 'integration', index), kind: 'integration', config: item.config };
});

export const apiQuestTasks: ApiQuestTask[] = [
  ...restTasks,
  ...jsonTasks,
  ...openApiTasks,
  ...integrationTasks
];
