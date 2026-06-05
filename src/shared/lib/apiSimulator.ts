type ApiRequest = {
  method: string;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
};

export type ApiResponse = {
  status: number;
  body: unknown;
  headers: Record<string, string>;
};

const orders = [
  { id: 'ord-1001', status: 'paid', deliveryStatus: 'not_sent', total: 5600 },
  { id: 'ord-1002', status: 'shipped', deliveryStatus: 'accepted', total: 2100 },
  { id: 'ord-1003', status: 'paid', deliveryStatus: 'failed', total: 980 }
];

export function simulateApiRequest(request: ApiRequest): ApiResponse {
  const method = request.method.toUpperCase();

  if (method === 'GET' && request.path === '/api/v1/orders') {
    const status = request.query?.status;
    const page = Number(request.query?.page ?? 1);
    const size = Number(request.query?.size ?? 10);
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

  if (method === 'POST' && request.path === '/api/v1/payments') {
    if (!request.headers?.['Idempotency-Key']) {
      return {
        status: 409,
        body: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Для платежной операции нужен Idempotency-Key.'
        },
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
