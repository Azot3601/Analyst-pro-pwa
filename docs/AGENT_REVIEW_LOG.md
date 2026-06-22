# AGENT_REVIEW_LOG

This file records outputs from real subagent reviews. It stores concise engineering reports, not hidden chain-of-thought.

## 2026-06-05 — Agent System Operationalization

Status: initialized.

Changes:

- Added root `AGENTS.md`.
- Added operational role prompts in `agents/`.
- Established this review log as the place where subagent findings are summarized.

Note:

- Writing to hidden `.agents/` was blocked by workspace permissions, so operational prompts live in `agents/`.

Pending:

- Continue running subagents before substantial feature changes.

## 2026-06-05 — Real Subagent Review Pass

Status: completed.

Subagents:

- SQL Challenge + Curriculum Designer: completed.
- Product Architect + UI/UX Motion: completed.
- QA & Test + PWA Offline: completed.
- Documentation Keeper + Knowledge Graph + Toolkit: completed.

Key Findings:

- SQL lesson `sql-10-cte` used `JOIN` and missed paid orders without captured payments.
- SQL starter queries were not automatically checked against seed data.
- E2E did not execute a SQL query.
- Toolkit output could become stale after switching categories.
- Knowledge graph content had too many generated placeholder nodes.
- Documentation still contained stale installation/check status.
- Product loops between trainer, knowledge base, and toolkit need deeper linking.

Actions Taken:

- Fixed `sql-10-cte` with `LEFT JOIN`, `COALESCE`, and expected rows for duplicate and missing captured payments.
- Added `sql-11-window-functions`.
- Added `src/tests/unit/sqlLessons.test.ts` to run every lesson starter SQL against the seed database.
- Expanded `sqlChecker` unit tests.
- Updated `scripts/e2e-smoke.mjs` to click “Запустить и проверить” and assert SQL success.
- Fixed toolkit output reset on category/tool changes.
- Added curated high-priority knowledge node content.
- Updated knowledge graph visibility so selected nodes stay in the graph.
- Updated stale README/project memory notes.

Remaining Backlog:

- Persist SQL lesson completion in IndexedDB.
- Add offline service-worker tests after first load.
- Expand non-SQL trainer paths to SQL-kвест quality.
- Replace more generated knowledge nodes with curated content.
- Implement distinct local runners/templates for every toolkit item.

## 2026-06-05 — Data Security Agent Added

Status: initialized.

Changes:

- Added `agents/data-security-agent.md`.
- Added `docs/SECURITY_PROCESS.md`.
- Added local `npm run security:scan`.
- Added Data Security Agent to root `AGENTS.md`.

Purpose:

- Detect accidental secret leaks, local env files, unignored generated artifacts, risky dependency/process changes, and unsafe data handling.

Pending:

- Run real Data Security Agent against the current codebase.
- Schedule recurring security review automation.

## 2026-06-05 — Data Security Agent First Review

Status: completed.

Subagent:

- Data Security Agent: completed.

Key Findings:

- No high-severity findings.
- No local `.env*`, obvious secrets, tokens, private keys, runtime LLM/API calls, or tracked ignored files found.
- `node_modules/`, `dist/`, `build/`, `coverage/`, `test-results/`, `playwright-report/`, `.env*`, `.serena/`, `.codex/` are ignored.
- Caveat: `.agents/` was not ignored.
- Caveat: default `dev` and `preview` scripts exposed Vite on `0.0.0.0`.
- Caveat: `npm audit` was not confirmed because registry access can be blocked in this environment.

Actions Taken:

- Added `.agents/` to `.gitignore`.
- Changed `npm run dev` to localhost-by-default.
- Changed `npm run preview` to localhost-by-default.
- Added `npm run dev:lan` and `npm run preview:lan` for explicit LAN exposure.
- Created weekly recurring security audit automation: `security-audit-pro`.
- Verified `npm run security:scan`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run test:e2e`.
- Attempted `npm audit --audit-level=moderate`; it failed because npm registry access is blocked by `connect EACCES`.

Remaining Backlog:

- Run `npm audit --audit-level=moderate` in a network-enabled environment.
- Add offline/PWA security tests when auth or remote sync appears.
- Re-run Data Security Agent before first commit/publish and whenever env/auth/external APIs are introduced.

## 2026-06-05 — SQL Quest Mode Review

Status: completed.

Subagents:

- SQL/Curriculum/System Analyst Mentor Agent: completed.
- Data Security/QA Agent: completed.

Key Findings:

- Старый SQL-тренажёр был линейным и не имел модели 8 глав / 24 задач / `trial` и `case`.
- Прогресс SQL был page-state, а не IndexedDB.
- XP-once, attempts и persisted hints отсутствовали.
- Диагностика SQL mismatch была слишком общей.
- Старые `starterSql` фактически являются готовыми решениями; для строгого режима нужен отдельный `solutionSql`.

Actions Taken:

- Добавлен `src/data/sqlQuest.ts` с 8 главами и 24 SQL-задачами.
- Добавлен SQL Quest progress namespace в Dexie `UserProgress.sqlQuest`.
- Реализованы attempts, hints, solved ids, XP-once, ranks, current/last lesson.
- Обновлены `TrainerPage` и `ProgressPage`.
- Добавлен `src/shared/lib/sqlDiagnostics.ts`.
- Добавлены SQL knowledge nodes и links.
- Добавлены unit/component/e2e проверки для SQL Quest прогресса и диагностики.

Remaining Backlog:

- Разделить `starterSql` и `solutionSql`.
- Добавить rules-based диагностику текста запроса.
- Добавить браузерную проверку offline/PWA для IndexedDB progress.

## 2026-06-06 — Vercel Pre-Publish Review

Status: completed.

Subagents:

- Data Security Agent: completed.
- PWA Offline / QA Test Agent: completed.

Key Findings:

- Для Vite SPA требовался `vercel.json` с rewrite на `index.html`, иначе прямое открытие `/trainer` или `/progress` могло вернуть 404.
- `.vercel/` должен оставаться локальным и не попадать в Git.
- PWA manifest нуждался в PNG `192x192`, PNG `512x512` и maskable-иконке для более стабильной installability.
- Runtime-cache следует ограничивать same-origin ресурсами.
- `npm audit` не выполняется в текущей среде из-за заблокированного доступа к npm registry.

Actions Taken:

- Добавлен `vercel.json`: Vite build/output, SPA rewrite, cache headers и базовые security headers.
- Добавлено игнорирование `.vercel/`.
- Добавлена команда `npm run verify:deploy`.
- PWA runtime cache ограничен `sameOrigin`.
- Добавлены PNG PWA-иконки.
- Добавлена инструкция `docs/DEPLOYMENT_VERCEL.md`.
- Полный `npm run verify:deploy` прошёл.

Remaining Backlog:

- Выполнить `npm audit --audit-level=moderate` в среде с доступом к registry.
- После Preview deployment проверить реальные Vercel deep links, headers, service worker и offline reload.
- Рассмотреть code splitting: основной JS chunk остаётся крупным.

## 2026-06-06 — SQL Quest Trainer UX Review

Status: completed.

Subagents:

- UI/UX Motion Agent: completed.
- QA Test Agent: completed.

Key Findings:

- Старый трёхколоночный layout включался только выше `1536px`, поэтому на laptop/desktop SQL-редактор уходил ниже вторичных блоков.
- Данные базы показывались повторно, а диагностика ошибки находилась слишком далеко от результата.
- На mobile отсутствовала рабочая навигация по приоритетным зонам SQL Quest.

Actions Taken:

- Desktop layout переведён на три рабочие колонки уже с `1280px`: задачи, SQL workspace, данные/подсказки.
- Оставлен один компактный блок данных с таблицами, preview и связями.
- Добавлены mobile/tablet вкладки с открытой по умолчанию вкладкой SQL.
- Редактор, действия, результат и диагностика собраны в непрерывный основной поток.
- Добавлены responsive e2e-проверки для `1440`, `1366`, tablet и `390px`.

Residual Risks:

- На очень узких экранах список верхних доменов использует горизонтальную прокрутку.
- Основной JS chunk остаётся крупным и требует отдельной работы по code splitting.
