# TEST_STRATEGY

## Уровни

- Unit: схемы Zod, JSON tools, SQL checker, progress storage, graph integrity.
- Component: app shell, главная, тренажёр, knowledge card, graph, toolkit.
- E2E: навигация, SQL-задача, подсказка, JSON formatter, база знаний, offline shell.

## Команды

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

## Ограничение текущей среды

На 2026-06-04 установка npm-зависимостей заблокирована сетевым `connect EACCES`. Проверки нужно запустить после установки зависимостей.

## Фактический прогон 2026-06-04

- `npm run lint`: не стартовал, `eslint` не найден.
- `npm run typecheck`: не стартовал, `tsc` не найден.
- `npm run test`: не стартовал, `vitest` не найден.
- `npm run build`: не стартовал, `tsc` не найден.

Причина: `node_modules` отсутствует, `npm create vite@latest` не смог обратиться к `https://registry.npmjs.org`.

## Фактический прогон после установки зависимостей

- `npm run lint`: проходит.
- `npm run typecheck`: проходит.
- `npm run test`: проходит, 12 тестов.
- `npm run build`: проходит, PWA assets и `sql-wasm` попадают в `dist`.
- Предупреждение build: основной JS chunk больше 500 kB; следующий шаг оптимизации — code splitting для React Flow/CodeMirror/sql.js.

## Фактический прогон после переработки SQL-тренажёра

- `npm run lint`: проходит.
- `npm run typecheck`: проходит.
- `npm run test`: проходит, 16 тестов.
- `npm run build`: проходит.
- `npm run test:e2e`: проходит через Playwright smoke-runner `scripts/e2e-smoke.mjs`.
- E2E проверяет trainer, toolkit и knowledge на desktop и mobile. Проверяются `SQL-квест`, `Данные для этого шага`, запуск SQL-запроса, JSON formatter и база знаний.
- Стандартный `playwright test` в этой Windows-среде зависал на webServer/runner-завершении, поэтому команда проекта использует стабильный Playwright API smoke-runner с явным закрытием сервера и браузера.

## Agent Review Checks

После операционализации subagents:

- SQL/Curriculum agent нашёл рассинхронизацию `sql-10-cte` и отсутствие проверки lesson SQL.
- QA/PWA agent подтвердил необходимость e2e SQL execution.
- Documentation/Knowledge/Toolkit agent нашёл stale docs, placeholder knowledge content и stale Toolkit output.
- Product/UI agent указал на слабые связи между trainer, knowledge и toolkit.

## API Contract Quest Checks

- Unit: REST checker/simulator, JSON diagnostics, OpenAPI checker, integration checklist, SOAP XML parser, non-SQL progress.
- Component: корректный REST request, missing required JSON, missing OpenAPI response, integration idempotency/retry checklist.
- E2E smoke: последовательное открытие REST, JSON, OpenAPI и Интеграций внутри /trainer.
- Фактический прогон 2026-06-22: 11 test files, 69 tests; lint, typecheck, test, build и API-enhanced e2e smoke проходят.

Выполненные исправления зафиксированы в `docs/AGENT_REVIEW_LOG.md`.

## REST Onboarding Checks

- Unit: построение final URL, metadata восьми REST-уроков и приоритетная ошибка неподставленного path parameter.
- Component: onboarding, мини-практика `ORD-1001`, computed URL, успешный GET и отсутствие каскада `rest-status`/`rest-response-field`.
- E2E smoke использует только значение `orderId`; полный path больше не вводится вторым независимым способом.

## REST Beginner Learning Checks

- Unit: каждый из восьми учебных примеров выполняется через локальный simulator и проходит REST checker.
- Unit: Final URL включает path values и query params; неполный POST даёт один grouped diagnostic.
- Unit: проверяются Content-Type, required body, pagination/query, Idempotency-Key и ожидаемый HTTP 422.
- Component: `Перед решением`, тестовые значения, пример без автозаполнения, body contract panel и единственная карточка основной ошибки.
- SQL unit/component fixtures этим этапом не изменяются.
