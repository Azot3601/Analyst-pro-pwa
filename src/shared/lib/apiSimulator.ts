export type ApiRequest = {
  method: string;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
};

import { reservationContract } from '../../data/cases/reservationCase/apiContract';

export type ApiResponse = {
  status: number;
  body: unknown;
  headers: Record<string, string>;
};

const orders = [
  { id: 'ord-1001', status: 'paid', deliveryStatus: 'not_sent', totalAmount: 5600 },
  { id: 'ord-1002', status: 'shipped', deliveryStatus: 'accepted', totalAmount: 2100 },
  { id: 'ord-1003', status: 'paid', deliveryStatus: 'failed', totalAmount: 980 }
];

export function simulateApiRequest(request: ApiRequest): ApiResponse {
  const method = request.method.toUpperCase();
  const headers = Object.fromEntries(
    Object.entries(request.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
  );

  if (method === 'GET' && request.path === '/api/v1/orders') {
    const status = request.query?.status;
    const page = Number(request.query?.page ?? 1);
    const size = Number(request.query?.size ?? 10);
    if (!Number.isInteger(page) || !Number.isInteger(size) || page < 1 || size < 1 || size > 100) {
      return {
        status: 400,
        body: {
          code: 'INVALID_PAGINATION',
          message: 'page должен быть больше нуля, а size — целым числом от 1 до 100.'
        },
        headers: { 'content-type': 'application/json' }
      };
    }
    const filtered = status ? orders.filter((order) => order.status === status) : orders;
    return {
      status: 200,
      body: {
        data: filtered.slice((page - 1) * size, page * size),
        pagination: { page, size, total: filtered.length }
      },
      headers: { 'content-type': 'application/json' }
    };
  }

  // Кейс «Бронирование столиков»: GET одной брони — тот же домен, что в SQL-треке.
  const reservationMatch = request.path.match(/^\/api\/v1\/reservations\/(\d+)$/);
  if (method === 'GET' && reservationMatch) {
    return { status: 200, body: reservationContract.example, headers: { 'content-type': 'application/json' } };
  }

  const orderMatch = request.path.match(/^\/api\/v1\/orders\/(ord-\d+)$/i);
  if (method === 'GET' && orderMatch) {
    const order = orders.find((item) => item.id.toLowerCase() === orderMatch[1].toLowerCase());
    return order
      ? { status: 200, body: order, headers: { 'content-type': 'application/json' } }
      : {
          status: 404,
          body: { code: 'ORDER_NOT_FOUND', message: 'Заказ не найден.' },
          headers: { 'content-type': 'application/json' }
        };
  }

  if (method === 'PATCH' && orderMatch) {
    const body = request.body as { status?: unknown } | undefined;
    if (typeof body?.status !== 'string') {
      return {
        status: 422,
        body: { code: 'STATUS_REQUIRED', message: 'Для изменения нужен строковый status.' },
        headers: { 'content-type': 'application/json' }
      };
    }
    return {
      status: 200,
      body: { id: orderMatch[1], status: body.status },
      headers: { 'content-type': 'application/json' }
    };
  }

  if (method === 'PUT' && orderMatch) {
    const body = request.body as { customerId?: unknown; items?: unknown } | undefined;
    if (
      headers['if-match'] !== 'current-etag' ||
      typeof body?.customerId !== 'string' ||
      !Array.isArray(body.items)
    ) {
      return {
        status: 412,
        body: { code: 'PRECONDITION_FAILED', message: 'Проверьте If-Match и полное тело заказа.' },
        headers: { 'content-type': 'application/json' }
      };
    }
    return {
      status: 200,
      body: { id: orderMatch[1], status: 'updated' },
      headers: { 'content-type': 'application/json', etag: 'next-etag' }
    };
  }

  if (method === 'DELETE' && orderMatch) {
    return { status: 204, body: null, headers: {} };
  }

  if (method === 'POST' && request.path === '/api/v1/orders') {
    const body = request.body as { customerId?: unknown; items?: unknown } | undefined;
    const validItems = Array.isArray(body?.items) && body.items.length > 0 && body.items.every((item) => {
      if (!item || typeof item !== 'object') return false;
      const position = item as { productId?: unknown; quantity?: unknown };
      return typeof position.productId === 'string' && typeof position.quantity === 'number' && position.quantity > 0;
    });
    if (
      headers['content-type'] !== 'application/json' ||
      typeof body?.customerId !== 'string' ||
      !validItems
    ) {
      return {
        status: 422,
        body: {
          code: 'ORDER_VALIDATION_FAILED',
          message: 'Нужны customerId, непустой items и Content-Type: application/json.'
        },
        headers: { 'content-type': 'application/json' }
      };
    }
    return {
      status: 201,
      body: { id: 'ord-2001', status: 'created' },
      headers: {
        'content-type': 'application/json',
        location: '/api/v1/orders/ord-2001'
      }
    };
  }

  if (method === 'POST' && request.path === '/api/v1/payments') {
    if (!headers['idempotency-key']) {
      return {
        status: 409,
        body: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Для платежной операции нужен Idempotency-Key.'
        },
        headers: { 'content-type': 'application/json' }
      };
    }

    const body = request.body as { orderId?: unknown; amount?: unknown } | undefined;
    if (typeof body?.orderId !== 'string' || typeof body.amount !== 'number' || body.amount <= 0) {
      return {
        status: 422,
        body: { code: 'PAYMENT_VALIDATION_FAILED', message: 'Нужны строковый orderId и положительный amount.' },
        headers: { 'content-type': 'application/json' }
      };
    }

    return {
      status: 202,
      body: { operationId: 'payop-42', status: 'processing' },
      headers: { 'content-type': 'application/json' }
    };
  }

  return {
    status: 404,
    body: { code: 'NOT_FOUND', message: 'Endpoint не найден в локальном симуляторе.' },
    headers: { 'content-type': 'application/json' }
  };
}

export function buildCurl(request: ApiRequest) {
  const headers = Object.entries(request.headers ?? {})
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');
  const body = request.body ? `-d '${JSON.stringify(request.body)}'` : '';
  const query = request.query
    ? `?${new URLSearchParams(request.query).toString()}`
    : '';

  return `curl -X ${request.method.toUpperCase()} ${headers} ${body} "https://local.analyst-pro${request.path}${query}"`;
}
