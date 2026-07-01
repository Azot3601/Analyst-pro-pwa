import Ajv, { type ErrorObject } from 'ajv';

export type ApiQuestDiagnostic = {
  code: string;
  severity: 'error' | 'warning';
  expected: string;
  actual: string;
  why: string;
  fix: string;
  knowledgeId: string;
  characterLine: string;
  details?: string[];
  consequences?: string;
  example?: string;
};

export type ApiQuestCheckResult = { ok: boolean; diagnostics: ApiQuestDiagnostic[] };

const diagnostic = (
  code: string,
  expected: unknown,
  actual: unknown,
  why: string,
  fix: string,
  knowledgeId: string,
  severity: ApiQuestDiagnostic['severity'] = 'error',
  extras: Pick<ApiQuestDiagnostic, 'details' | 'consequences' | 'example'> = {}
): ApiQuestDiagnostic => ({
  code,
  severity,
  expected: String(expected),
  actual: String(actual),
  why,
  fix,
  knowledgeId,
  characterLine: severity === 'warning' ? 'Софи: тут совместимость под вопросом — не сломаем ли старых потребителей?' : 'Софи: почти! Поправь контракт и покажи мне ещё раз.',
  ...extras
});

const finish = (diagnostics: ApiQuestDiagnostic[]): ApiQuestCheckResult => ({
  ok: diagnostics.every((item) => item.severity !== 'error'),
  diagnostics
});

const hasPath = (value: unknown, path: string): boolean => {
  let current = value;
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return false;
    current = (current as Record<string, unknown>)[part];
  }
  return true;
};

export type RestSubmission = {
  method: string;
  path: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
  expectedStatus: number;
  response?: unknown;
};

export type RestRule = {
  method: string;
  path: string;
  pathParams: string[];
  pathParamExamples?: Record<string, string>;
  query: string[];
  headers: Record<string, string>;
  bodyFields: string[];
  expectedStatus: number;
  responseFields: string[];
};

export function buildPathFromTemplate(template: string, pathParams: Record<string, string>) {
  return template.replace(/\{([^}]+)\}/g, (placeholder, name: string) => {
    const value = pathParams[name]?.trim();
    return value ? encodeURIComponent(value) : placeholder;
  });
}

export function buildRestUrl(
  template: string,
  pathParams: Record<string, string>,
  query: Record<string, string> = {}
) {
  const path = buildPathFromTemplate(template, pathParams);
  const entries = Object.entries(query).filter(([, value]) => value.trim().length > 0);
  return entries.length ? `${path}?${new URLSearchParams(entries).toString()}` : path;
}

export function checkRest(input: RestSubmission, rule: RestRule): ApiQuestCheckResult {
  for (const name of rule.pathParams) {
    const rawValue = input.pathParams?.[name]?.trim() ?? '';
    const normalizedValue = rawValue.replace(/^\{(.+)\}$/, '$1').toLocaleLowerCase('ru');
    const unresolved = !rawValue || normalizedValue === name.toLocaleLowerCase('ru') || input.path.includes(`{${name}}`);
    if (unresolved) {
      const expected = rule.pathParamExamples?.[name] ?? `конкретное значение ${name}`;
      const missingFields = rule.responseFields.length ? `, поэтому поля ${rule.responseFields.join('/')} отсутствуют` : '';
      return finish([
        diagnostic(
          'rest-path-param-not-substituted',
          expected,
          rawValue || 'значение не введено',
          `Ты ввёл имя параметра, а нужно конкретное значение ресурса. Из-за этого сервис вернул 404${missingFields}.`,
          `Подставьте значение вроде «${expected}» вместо {${name}}.`,
          'path-parameter'
        )
      ]);
    }
  }

  if (input.method.toUpperCase() !== rule.method.toUpperCase()) {
    return finish([diagnostic(
      'rest-method', rule.method, input.method,
      `Метод ${input.method.toUpperCase()} означает другое действие. Для этой задачи гонец должен выполнить команду ${rule.method.toUpperCase()}.`,
      `Выберите ${rule.method.toUpperCase()} в поле HTTP method.`, 'http-methods'
    )]);
  }
  const pathPattern = new RegExp(`^${rule.path.replace(/\{[^}]+\}/g, '[^/]+')}$`);
  if (!pathPattern.test(input.path)) {
    return finish([diagnostic(
      'rest-path', rule.path, input.path || 'путь не заполнен',
      `Ты отправляешь гонца не к тем воротам. Endpoint определяет, в какую службу и к какому ресурсу попадёт request.`,
      `Укажи endpoint ${rule.path}.`, 'endpoint'
    )]);
  }
  const templateSegments = rule.path.split('/');
  const actualSegments = input.path.split('/');
  for (const name of rule.pathParams) {
    const value = input.pathParams?.[name];
    const segmentIndex = templateSegments.indexOf(`{${name}}`);
    if (value && segmentIndex >= 0 && actualSegments[segmentIndex] !== encodeURIComponent(value)) {
      return finish([diagnostic(
        'rest-path-param-value', value, actualSegments[segmentIndex] ?? 'отсутствует',
        `Значение ${name} должно заменить {${name}} внутри Final URL.`,
        `Собери URL из template и значения ${value}.`, 'path-parameter'
      )]);
    }
  }

  const missing: string[] = [];
  const missingKnowledge: string[] = [];
  for (const name of rule.query) {
    if (!input.query?.[name]) {
      missing.push(`Query parameter ${name}`);
      missingKnowledge.push('query-parameter');
    }
  }
  const actualHeaders = Object.fromEntries(Object.entries(input.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value.toLowerCase()]));
  for (const [name, value] of Object.entries(rule.headers)) {
    if (actualHeaders[name.toLowerCase()] !== value.toLowerCase()) {
      missing.push(`Header ${name}: ${value}`);
      missingKnowledge.push('headers');
    }
  }
  for (const field of rule.bodyFields) {
    if (!hasPath(input.body, field)) {
      missing.push(`Поле body.${field}`);
      missingKnowledge.push('request-body');
    }
  }
  if (missing.length) {
    const contentTypeMissing = missing.some((item) => item.toLowerCase().includes('content-type'));
    return finish([diagnostic(
      'rest-request-incomplete', 'все обязательные части request', missing.join('; '),
      contentTypeMissing
        ? 'Без Content-Type: application/json сервис не понимает, что body записан в формате JSON.'
        : 'Request собран не полностью, поэтому сервис не может безопасно выполнить команду.',
      'Заполни перечисленные части в показанном формате и отправь request ещё раз.',
      missingKnowledge[0] ?? 'rest', 'error',
      {
        details: missing,
        consequences: 'Из-за этого сервис не может выполнить операцию и не возвращает ожидаемый response.',
        example: missing.filter((item) => item.startsWith('Header') || item.startsWith('Query')).join('\n')
      }
    )]);
  }

  const responseProblems: string[] = [];
  if (input.expectedStatus !== rule.expectedStatus) {
    responseProblems.push(`Ожидался HTTP ${rule.expectedStatus}, получен HTTP ${input.expectedStatus}`);
  }
  for (const field of rule.responseFields) {
    if (!hasPath(input.response, field)) responseProblems.push(`В response нет поля ${field}`);
  }
  if (responseProblems.length) {
    return finish([diagnostic(
      'rest-response-unexpected', `HTTP ${rule.expectedStatus} и поля ${rule.responseFields.join(', ') || 'без body'}`,
      responseProblems.join('; '),
      'Сервис ответил не так, как ожидает потребитель. Сначала сравни status code, затем структуру response body.',
      'Проверь request и ожидаемый сценарий ответа.', 'response-body', 'error',
      { details: responseProblems, consequences: 'Интерфейс не сможет продолжить бизнес-сценарий без ожидаемого статуса и данных.' }
    )]);
  }
  return finish([]);
}

export type JsonRule = { schema: Record<string, unknown>; previousSchema?: Record<string, unknown> };

const valueAtPointer = (value: unknown, pointer: string): unknown => pointer
  .split('/')
  .slice(1)
  .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
  .reduce<unknown>((current, part) => current && typeof current === 'object'
    ? (current as Record<string, unknown>)[part]
    : undefined, value);

const jsonCode = (error: ErrorObject, value: unknown): string => {
  if (error.keyword === 'required') return 'missing-required';
  if (error.keyword === 'type') return valueAtPointer(value, error.instancePath) === null ? 'nullable' : 'wrong-type';
  if (error.keyword === 'enum') return 'enum';
  if (error.keyword === 'additionalProperties') return 'additional-properties';
  return 'json-schema';
};

export function checkJson(input: string, rule: JsonRule): ApiQuestCheckResult {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (error) {
    return finish([diagnostic('invalid-json', 'корректный JSON', error instanceof Error ? error.message : 'ошибка разбора', 'Невалидный JSON нельзя проверить по схеме.', 'Исправьте синтаксис JSON.', 'json')]);
  }
  const ajv = new Ajv({ allErrors: true, strict: false });
  let validate;
  try {
    validate = ajv.compile(rule.schema);
  } catch {
    return finish([
      diagnostic(
        'json-schema-invalid',
        'корректная JSON Schema',
        'схема не компилируется',
        'Некорректная схема не может быть договором между системами.',
        'Проверьте type, properties, required и ограничения схемы.',
        'json-schema'
      )
    ]);
  }
  validate(value);
  const diagnostics = (validate.errors ?? []).map((error) => diagnostic(
    jsonCode(error, value),
    error.keyword === 'required' ? String(error.params.missingProperty) : JSON.stringify(error.params),
    (JSON.stringify(valueAtPointer(value, error.instancePath)) ?? error.instancePath) || 'корень документа',
    'Значение нарушает правило JSON Schema.',
    `Исправьте значение по пути ${error.instancePath || '$'}: ${error.message ?? 'проверьте схему'}.`,
    error.keyword === 'type' ? 'nullable' : 'json-schema'
  ));
  if (rule.previousSchema) {
    const previous = (rule.previousSchema.properties ?? {}) as Record<string, unknown>;
    const current = (rule.schema.properties ?? {}) as Record<string, unknown>;
    const removed = Object.keys(previous).filter((name) => !(name in current));
    if (removed.length) diagnostics.push(diagnostic('compatibility-warning', 'сохранить прежние поля', `удалены: ${removed.join(', ')}`, 'Удаление поля может сломать существующих потребителей.', `Верните поля ${removed.join(', ')} или выпустите новую major-версию.`, 'compatibility', 'warning'));
  }
  return finish(diagnostics);
}

type OpenApiDocument = Record<string, any>;
export type OpenApiRule = {
  paths: Record<string, string[]>;
  sections: string[];
  responses: Record<string, string[]>;
  schemas: string[];
  previousDocument?: OpenApiDocument;
};

const parseDocument = (input: string | OpenApiDocument): OpenApiDocument | undefined => {
  if (typeof input !== 'string') return input;
  try { return JSON.parse(input) as OpenApiDocument; } catch { return undefined; }
};

export function checkOpenApi(input: string | OpenApiDocument, rule: OpenApiRule): ApiQuestCheckResult {
  const document = parseDocument(input);
  if (!document) return finish([diagnostic('openapi-syntax', 'OpenAPI JSON-документ', 'ошибка разбора', 'Документ нельзя проверить структурно.', 'Передайте корректный JSON.', 'openapi')]);
  const diagnostics: ApiQuestDiagnostic[] = [];
  for (const section of rule.sections) if (!(section in document)) diagnostics.push(diagnostic('openapi-section', section, 'отсутствует', 'Корневой раздел обязателен для полного контракта.', `Добавьте раздел ${section}.`, 'openapi'));
  for (const [path, methods] of Object.entries(rule.paths)) {
    if (!document.paths?.[path]) diagnostics.push(diagnostic('openapi-path', path, 'отсутствует', 'Операция недоступна без описания пути.', `Добавьте paths.${path}.`, 'endpoint'));
    for (const method of methods) if (!document.paths?.[path]?.[method.toLowerCase()]) diagnostics.push(diagnostic('openapi-method', `${method.toUpperCase()} ${path}`, 'отсутствует', 'Метод должен быть явно описан.', `Добавьте метод ${method.toLowerCase()} для ${path}.`, 'endpoint'));
  }
  for (const [operation, statuses] of Object.entries(rule.responses)) {
    const [method, ...pathParts] = operation.split(' ');
    const path = pathParts.join(' ');
    for (const status of statuses) if (!document.paths?.[path]?.[method.toLowerCase()]?.responses?.[status]) diagnostics.push(diagnostic('openapi-response', `${operation} -> ${status}`, 'отсутствует', 'Контракт должен описывать happy path и ошибки.', `Добавьте response ${status} для ${operation}.`, 'api-error-model'));
  }
  for (const schema of rule.schemas) if (!document.components?.schemas?.[schema]) diagnostics.push(diagnostic('openapi-schema', schema, 'отсутствует', 'Переиспользуемая модель фиксирует структуру данных.', `Добавьте components.schemas.${schema}.`, 'openapi'));
  if (rule.previousDocument) {
    for (const [path, item] of Object.entries(rule.previousDocument.paths ?? {})) {
      for (const method of Object.keys(item as object).filter((name) => ['get', 'post', 'put', 'patch', 'delete'].includes(name))) {
        if (!document.paths?.[path]?.[method]) diagnostics.push(diagnostic('openapi-breaking-change', `${method.toUpperCase()} ${path}`, 'удалено', 'Удаление операции ломает существующих клиентов.', 'Сохраните операцию или выпустите новую major-версию.', 'breaking-changes'));
      }
    }
  }
  return finish(diagnostics);
}

export function checkIntegration(input: string | string[], rule: { requiredConcepts: string[] }): ApiQuestCheckResult {
  const text = Array.isArray(input) ? input.join(' ') : input;
  const normalized = text.toLocaleLowerCase('ru');
  return finish(rule.requiredConcepts
    .filter((concept) => !normalized.includes(concept.toLocaleLowerCase('ru')))
    .map((concept) => diagnostic('integration-concept', concept, 'не найдено', 'Без этого понятия сценарий не описывает устойчивое взаимодействие.', `Добавьте в решение концепт «${concept}» и объясните его применение.`, 'integration')));
}

export type SoapRule = { operation: string; requireHeader: boolean; requireFault: boolean };

export function checkSoap(input: string, rule: SoapRule): ApiQuestCheckResult {
  const document = new DOMParser().parseFromString(input, 'application/xml');
  if (document.querySelector('parsererror')) return finish([diagnostic('soap-xml', 'корректный XML', 'ошибка синтаксиса', 'SOAP-сообщение должно быть валидным XML.', 'Закройте элементы и проверьте XML-синтаксис.', 'soap')]);
  const diagnostics: ApiQuestDiagnostic[] = [];
  const root = document.documentElement;
  const soapNamespaces = new Set([
    'http://schemas.xmlsoap.org/soap/envelope/',
    'http://www.w3.org/2003/05/soap-envelope'
  ]);
  const directChild = (parent: Element | undefined, name: string) =>
    parent ? Array.from(parent.children).find((element) => element.localName === name) : undefined;
  const descendant = (parent: Element | undefined, name: string) =>
    parent ? Array.from(parent.getElementsByTagName('*')).find((element) => element.localName === name) : undefined;
  const addMissing = (code: string, expected: string, why: string, fix: string) => {
    diagnostics.push(diagnostic(code, expected, 'отсутствует или расположен неверно', why, fix, code.startsWith('soap-fault') ? 'soap-fault' : 'soap'));
  };
  if (root.localName !== 'Envelope') {
    addMissing('soap-envelope', 'Envelope как корневой элемент', 'SOAP Envelope должен быть корнем XML-документа.', 'Поместите всё сообщение внутрь Envelope.');
  }
  if (!soapNamespaces.has(root.namespaceURI ?? '')) {
    addMissing('soap-namespace', 'SOAP 1.1 или SOAP 1.2 namespace', root.namespaceURI ? 'Использован не-SOAP namespace.' : 'Без namespace невозможно однозначно определить SOAP-версию.', 'Укажите стандартный xmlns:soap на Envelope.');
  }
  const header = directChild(root, 'Header');
  const body = directChild(root, 'Body');
  if (rule.requireHeader && !header) {
    addMissing('soap-header', 'Header внутри Envelope', 'Header передаёт метаданные и параметры обработки.', 'Добавьте Header прямым дочерним элементом Envelope.');
  }
  if (!body) {
    addMissing('soap-body', 'Body внутри Envelope', 'Body содержит вызов операции или Fault.', 'Добавьте Body прямым дочерним элементом Envelope.');
  }
  if (!descendant(body, rule.operation)) {
    addMissing('soap-operation-location', rule.operation + ' внутри Body', 'Операция SOAP должна находиться внутри Body.', `Переместите ${rule.operation} внутрь Body.`);
  }
  if (rule.requireFault) {
    const fault = descendant(body, 'Fault');
    if (!fault) {
      addMissing('soap-fault', 'Fault внутри Body', 'Fault фиксирует контракт ошибки SOAP.', 'Добавьте Fault внутрь Body.');
    } else {
      if (!descendant(fault, 'Code') && !descendant(fault, 'faultcode')) {
        addMissing('soap-fault-code', 'Fault Code', 'Код позволяет потребителю классифицировать ошибку.', 'Добавьте Code/Value или faultcode.');
      }
      if (!descendant(fault, 'Reason') && !descendant(fault, 'faultstring')) {
        addMissing('soap-fault-reason', 'Fault Reason', 'Причина объясняет отказ человеку и системе.', 'Добавьте Reason/Text или faultstring.');
      }
    }
  }
  return finish(diagnostics);
}
