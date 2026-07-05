import { describe, expect, it } from 'vitest';
import { apiQuestTasks } from '../../data/apiQuest';
import {
  buildPathFromTemplate,
  buildRestUrl,
  checkIntegration,
  checkJson,
  checkOpenApi,
  checkRest,
  checkSoap
} from '../../shared/lib/apiQuestCheckers';
import { simulateApiRequest } from '../../shared/lib/apiSimulator';

describe('apiQuest data', () => {
  it('contains the required quest distribution and UI metadata', () => {
    const counts = apiQuestTasks.reduce<Record<string, number>>((result, task) => {
      result[task.kind] = (result[task.kind] ?? 0) + 1;
      return result;
    }, {});
    expect(counts.rest).toBe(9);
    expect(counts.json).toBe(8);
    expect(counts.openapi).toBe(6);
    expect(counts.integration).toBe(6);
    expect(apiQuestTasks.filter((task) => task.kind === 'integration' && task.config.mode === 'soap')).toHaveLength(3);
    expect(apiQuestTasks.every((task) => task.shortIntro && task.learningGoal && task.successMessage)).toBe(true);
  });

  it('gives every REST lesson a focused skill and a real-life application', () => {
    const restTasks = apiQuestTasks.filter((task) => task.kind === 'rest');

    expect(restTasks.every((task) => task.trainingFocus.length > 0)).toBe(true);
    expect(restTasks.every((task) => task.realLife.length > 0)).toBe(true);
    expect(restTasks[0].config.pathParamExamples).toEqual({ orderId: 'ORD-1001' });
    expect(restTasks.every((task) => task.beginner.simpleExplanation.length > 0)).toBe(true);
    expect(restTasks.every((task) => task.beginner.fillSteps.length > 0)).toBe(true);
    expect(restTasks.every((task) => task.beginner.expectedResult.length > 0)).toBe(true);
    expect(restTasks.filter((task) => task.config.bodyFields.length > 0).every((task) => task.beginner.bodyContract)).toBe(true);
  });

  it('provides a working example for every REST lesson', () => {
    const restTasks = apiQuestTasks.filter((task) => task.kind === 'rest');

    for (const task of restTasks) {
      const example = task.beginner.example;
      const headers = Object.fromEntries(Object.entries(example.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
      const path = buildPathFromTemplate(example.endpoint, example.pathParams ?? {});
      const response = simulateApiRequest({ method: example.method, path, query: example.query, headers, body: example.body });
      const result = checkRest({ method: example.method, path, pathParams: example.pathParams, query: example.query, headers, body: example.body, expectedStatus: response.status, response: response.body }, task.config);

      expect(result.ok, `${task.id}: ${result.diagnostics.map((item) => item.code).join(', ')}`).toBe(true);
    }
  });
});

describe('REST checker', () => {
  it('builds a final URL from the endpoint template and parameter value', () => {
    expect(buildPathFromTemplate('/api/v1/orders/{orderId}', { orderId: 'ORD-1001' }))
      .toBe('/api/v1/orders/ORD-1001');
  });

  it('adds query parameters to the Final URL', () => {
    expect(buildRestUrl('/api/v1/orders', {}, { status: 'paid', page: '1', size: '10' }))
      .toBe('/api/v1/orders?status=paid&page=1&size=10');
  });

  it.each(['orderId', '{orderId}', ''])('returns one primary diagnostic when %s is used as the parameter value', (value) => {
    const path = buildPathFromTemplate('/api/v1/orders/{orderId}', { orderId: value });
    const result = checkRest(
      {
        method: 'GET',
        path,
        pathParams: { orderId: value },
        expectedStatus: 404,
        response: { code: 'NOT_FOUND' }
      },
      {
        method: 'GET',
        path: '/api/v1/orders/{orderId}',
        pathParams: ['orderId'],
        pathParamExamples: { orderId: 'ORD-1001' },
        query: [],
        headers: {},
        bodyFields: [],
        expectedStatus: 200,
        responseFields: ['id', 'status']
      }
    );

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toEqual(expect.objectContaining({
      code: 'rest-path-param-not-substituted',
      expected: 'ORD-1001'
    }));
    expect(result.diagnostics[0].why).toMatch(/404.*id.*status/i);
  });

  it('links a path parameter value to the concrete URL segment', () => {
    const result = checkRest(
      {
        method: 'GET',
        path: '/orders/42',
        pathParams: { orderId: '999' },
        expectedStatus: 200,
        response: {}
      },
      {
        method: 'GET',
        path: '/orders/{orderId}',
        pathParams: ['orderId'],
        query: [],
        headers: {},
        bodyFields: [],
        expectedStatus: 200,
        responseFields: []
      }
    );

    expect(result.diagnostics.map((item) => item.code)).toContain('rest-path-param-value');
  });
  it('groups missing request parts into one beginner diagnostic', () => {
    const result = checkRest(
      {
        method: 'POST', path: '/api/v1/orders', headers: {}, body: {},
        expectedStatus: 422, response: { code: 'ORDER_VALIDATION_FAILED' }
      },
      {
        method: 'POST',
        path: '/api/v1/orders',
        pathParams: [],
        query: [],
        headers: { 'content-type': 'application/json' },
        bodyFields: ['customerId', 'items', 'items.0.productId', 'items.0.quantity'],
        expectedStatus: 201,
        responseFields: ['id', 'status']
      }
    );

    expect(result.ok).toBe(false);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toEqual(expect.objectContaining({
      code: 'rest-request-incomplete',
      details: expect.arrayContaining([
        expect.stringMatching(/Content-Type/i),
        expect.stringMatching(/customerId/),
        expect.stringMatching(/items/)
      ]),
      consequences: expect.stringMatching(/не может создать заказ|ожидаемый response/i)
    }));
  });

  it('explains a missing Content-Type in beginner language', () => {
    const result = checkRest(
      { method: 'POST', path: '/api/v1/orders', headers: {}, body: { customerId: 'CUST-1001', items: [{ productId: 'PRD-10', quantity: 2 }] }, expectedStatus: 422, response: {} },
      { method: 'POST', path: '/api/v1/orders', pathParams: [], query: [], headers: { 'content-type': 'application/json' }, bodyFields: ['customerId', 'items', 'items.0.productId', 'items.0.quantity'], expectedStatus: 201, responseFields: ['id', 'status'] }
    );

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].why).toMatch(/Content-Type.*JSON|формат.*JSON/i);
  });

  it('accepts query parameters and an idempotency key when the contract is complete', () => {
    const queryResult = checkRest(
      { method: 'GET', path: '/api/v1/orders', query: { status: 'paid', page: '1', size: '10' }, expectedStatus: 200, response: { data: [], pagination: {} } },
      { method: 'GET', path: '/api/v1/orders', pathParams: [], query: ['status', 'page', 'size'], headers: {}, bodyFields: [], expectedStatus: 200, responseFields: ['data', 'pagination'] }
    );
    const paymentResult = checkRest(
      { method: 'POST', path: '/api/v1/payments', headers: { 'Idempotency-Key': 'pay-001' }, body: { orderId: 'ORD-1001', amount: 5600 }, expectedStatus: 202, response: { operationId: 'PAY-1001', status: 'processing' } },
      { method: 'POST', path: '/api/v1/payments', pathParams: [], query: [], headers: { 'idempotency-key': 'pay-001' }, bodyFields: ['orderId', 'amount'], expectedStatus: 202, responseFields: ['operationId', 'status'] }
    );

    expect(queryResult.ok).toBe(true);
    expect(paymentResult.ok).toBe(true);
  });

  it('accepts the intentional 422 validation-error contract', () => {
    const result = checkRest(
      { method: 'POST', path: '/api/v1/orders', headers: { 'content-type': 'application/json' }, body: { items: [] }, expectedStatus: 422, response: { code: 'ORDER_VALIDATION_FAILED', message: 'customerId обязателен' } },
      { method: 'POST', path: '/api/v1/orders', pathParams: [], query: [], headers: { 'content-type': 'application/json' }, bodyFields: ['items'], expectedStatus: 422, responseFields: ['code', 'message'] }
    );

    expect(result.ok).toBe(true);
  });
});

describe('JSON checker', () => {
  it('reports an invalid JSON Schema without throwing', () => {
    const result = checkJson('{"id":"1"}', { schema: { type: 'unknown-type' } });

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0].code).toBe('json-schema-invalid');
  });
  it.each([
    ['{}', 'missing-required'],
    ['{"role":"admin","age":"18"}', 'wrong-type'],
    ['{"role":"guest","age":18}', 'enum'],
    ['{"role":"admin","age":18,"note":null}', 'nullable'],
    ['{"role":"admin","age":18,"extra":true}', 'additional-properties']
  ])('returns friendly code %s -> %s', (input, code) => {
    const result = checkJson(input, {
      schema: {
        type: 'object',
        required: ['role', 'age'],
        additionalProperties: false,
        properties: {
          role: { type: 'string', enum: ['admin', 'operator'] },
          age: { type: 'integer' },
          note: { type: 'string' }
        }
      }
    });
    expect(result.diagnostics.map((item) => item.code)).toContain(code);
  });

  it('warns about compatibility without failing valid JSON', () => {
    const result = checkJson('{"id":"1"}', {
      schema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      previousSchema: { type: 'object', required: ['id', 'name'], properties: { id: { type: 'string' }, name: { type: 'string' } } }
    });
    expect(result.ok).toBe(true);
    expect(result.diagnostics.map((item) => item.code)).toContain('compatibility-warning');
  });
});

describe('OpenAPI checker', () => {
  it('checks paths, methods, sections, responses and schemas', () => {
    const result = checkOpenApi({ openapi: '3.0.3', paths: { '/orders': { get: { responses: { '200': { description: 'OK' } } } } }, components: { schemas: {} } }, {
      paths: { '/orders': ['get', 'post'] },
      sections: ['info', 'components'],
      responses: { 'GET /orders': ['200', '400'] },
      schemas: ['Order']
    });
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(['openapi-method', 'openapi-section', 'openapi-response', 'openapi-schema']));
  });

  it('detects a simple breaking change', () => {
    const result = checkOpenApi({ openapi: '3.0.3', paths: {} }, { paths: {}, sections: ['paths'], responses: {}, schemas: [], previousDocument: { openapi: '3.0.3', paths: { '/orders': { get: { responses: { '200': { description: 'OK' } } } } } } });
    expect(result.diagnostics.map((item) => item.code)).toContain('openapi-breaking-change');
  });
});

describe('integration and SOAP checkers', () => {
  it('requires integration concepts from the checklist', () => {
    const result = checkIntegration('Используем retry и eventId.', { requiredConcepts: ['retry', 'eventId', 'идемпотентность'] });
    expect(result.diagnostics.map((item) => item.code)).toContain('integration-concept');
  });

  it('checks SOAP Envelope, Header, Body, operation and Fault', () => {
    const result = checkSoap('<Envelope><Body><CreateOrder /></Body></Envelope>', { operation: 'CreateOrder', requireHeader: true, requireFault: true });
    expect(result.diagnostics.map((item) => item.code)).toEqual(expect.arrayContaining(['soap-header', 'soap-fault']));
  });

  it('reports malformed XML in Russian', () => {
    const result = checkSoap('<Envelope>', { operation: 'CreateOrder', requireHeader: false, requireFault: false });
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0].code).toBe('soap-xml');
    expect(result.diagnostics[0].why).toMatch(/[А-Яа-я]/);
  });

  it('requires SOAP namespace, Envelope root and operation inside Body', () => {
    const result = checkSoap(
      '<Envelope><CreateOrder/><Body/></Envelope>',
      { operation: 'CreateOrder', requireHeader: false, requireFault: false }
    );

    expect(result.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining(['soap-namespace', 'soap-operation-location'])
    );
  });

  it('requires Fault Code and Reason inside SOAP Body', () => {
    const result = checkSoap(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetOrderResponse/><soap:Fault/></soap:Body></soap:Envelope>',
      { operation: 'GetOrderResponse', requireHeader: false, requireFault: true }
    );

    expect(result.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining(['soap-fault-code', 'soap-fault-reason'])
    );
  });
});
