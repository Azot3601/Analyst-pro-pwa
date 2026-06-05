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
