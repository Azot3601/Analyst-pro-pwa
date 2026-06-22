import { describe, expect, it } from 'vitest';
import { simulateApiRequest } from '../../shared/lib/apiSimulator';

describe('apiSimulator', () => {
  it('filters and paginates orders', () => {
    const response = simulateApiRequest({
      method: 'GET',
      path: '/api/v1/orders',
      query: { status: 'paid', page: '1', size: '1' }
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: [{ id: 'ord-1001', status: 'paid' }],
      pagination: { page: 1, size: 1, total: 2 }
    });
  });

  it('rejects invalid pagination with a stable error model', () => {
    const response = simulateApiRequest({
      method: 'GET',
      path: '/api/v1/orders',
      query: { page: '0', size: 'abc' }
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'INVALID_PAGINATION' });
  });

  it('treats HTTP header names as case-insensitive', () => {
    const response = simulateApiRequest({
      method: 'POST',
      path: '/api/v1/payments',
      headers: { 'idempotency-key': 'pay-quest-1' },
      body: { orderId: 'ord-1001', amount: 5600 }
    });

    expect(response.status).toBe(202);
    expect(response.body).toMatchObject({ operationId: 'payop-42' });
  });

  it('creates an order from a valid JSON body', () => {
    const response = simulateApiRequest({
      method: 'POST',
      path: '/api/v1/orders',
      headers: { 'content-type': 'application/json' },
      body: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 2 }], comment: null }
    });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe('/api/v1/orders/ord-2001');
    expect(response.body).toMatchObject({ id: 'ord-2001', status: 'created' });
  });

  it('rejects an incomplete order body with 422', () => {
    const response = simulateApiRequest({
      method: 'POST',
      path: '/api/v1/orders',
      headers: { 'content-type': 'application/json' },
      body: { customerId: 'CUST-1001', items: [{}] }
    });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ code: 'ORDER_VALIDATION_FAILED' });
  });

  it('supports resource lookup, patch, put and delete locally', () => {
    expect(simulateApiRequest({ method: 'GET', path: '/api/v1/orders/ord-1001' }).status).toBe(200);
    expect(
      simulateApiRequest({
        method: 'PATCH',
        path: '/api/v1/orders/ord-1001',
        body: { status: 'cancelled' }
      }).status
    ).toBe(200);
    expect(
      simulateApiRequest({
        method: 'PUT',
        path: '/api/v1/orders/ord-1001',
        headers: { 'if-match': 'current-etag' },
        body: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 1 }] }
      }).status
    ).toBe(200);
    expect(simulateApiRequest({ method: 'DELETE', path: '/api/v1/orders/ord-1001' }).status).toBe(204);
  });
});
