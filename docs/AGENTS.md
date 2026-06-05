# AGENTS

> Legacy note: this file originally described role checklists. Operational subagent prompts now live in root `AGENTS.md` and `agents/*.md`. Real review outputs are recorded in `docs/AGENT_REVIEW_LOG.md`.

Эти роли используются как чеклист самопроверки при разработке.

## Product Architect Agent

- Миссия: следить за целостностью продукта.
- Зоны: разделы, сценарии, связность тренажёра, базы знаний и инструментов.
- Входы: roadmap, UI, пользовательские сценарии.
- Выходы: архитектурные замечания, приоритеты, scope guard.
- Чеклист: нет пустых страниц; каждый раздел ведёт к обучению; домашний экран помогает продолжить работу.
- Когда вызывать: перед добавлением крупного раздела.

## System Analyst Mentor Agent

- Миссия: качество профессионального содержания.
- Зоны: термины, задачи, объяснения, реалистичность кейсов.
- Входы: task seeds, knowledge nodes, toolkit templates.
- Выходы: исправления формулировок и частых ошибок.
- Чеклист: задача имеет бизнес-контекст, критерий проверки и связь с реальной работой.
- Когда вызывать: при создании или ревизии контента.

## Curriculum Designer Agent

- Миссия: прогрессия от junior к middle+.
- Зоны: уровни, повторение, слабые зоны, траектория.
- Входы: список задач и навыков.
- Выходы: уровни сложности и порядок обучения.
- Чеклист: навыки развиваются последовательно; подсказки раскрываются постепенно.
- Когда вызывать: при изменении учебной карты.

## SQL Challenge Agent

- Миссия: SQL-тренажёр.
- Зоны: схемы, сиды, эталонные решения, проверка результата.
- Входы: предметные области, бизнес-вопросы.
- Выходы: SQL tasks, expected rows, explanations.
- Чеклист: запрос выполняется локально; ответ проверяется не по строке SQL, а по результату.
- Когда вызывать: перед релизом SQL-задач.

## API & Integration Agent

- Миссия: REST/API/OpenAPI/интеграции.
- Зоны: endpoint specs, ошибки, идемпотентность, webhooks, async flows.
- Входы: API tasks, simulator routes.
- Выходы: сценарии, контракты, проверка edge cases.
- Чеклист: есть статусы, error model, retry/idempotency reasoning.
- Когда вызывать: при изменении API-тренажёра.

## Knowledge Graph Agent

- Миссия: база знаний и связи.
- Зоны: граф, теги, типы связей, переходы task ↔ knowledge.
- Входы: knowledge nodes, relations.
- Выходы: graph integrity report.
- Чеклист: нет битых ссылок; связи помогают навигации.
- Когда вызывать: после добавления knowledge node.

## Toolkit Agent

- Миссия: рабочие инструменты аналитика.
- Зоны: чеклисты, шаблоны, валидаторы, генераторы.
- Входы: toolkit specs.
- Выходы: practically useful tools.
- Чеклист: инструмент работает локально и даёт понятный результат.
- Когда вызывать: при добавлении инструмента.

## UI/UX Motion Agent

- Миссия: современный dark-first UX.
- Зоны: темы, анимации, responsive, accessibility.
- Входы: screens, components.
- Выходы: UI review.
- Чеклист: русский UI, нет переполнений, нет карточек внутри карточек, фокус видим.
- Когда вызывать: перед визуальной стабилизацией.

## PWA Offline Agent

- Миссия: installability и offline-first.
- Зоны: manifest, service worker, caching, IndexedDB.
- Входы: Vite PWA config, storage flows.
- Выходы: PWA checklist.
- Чеклист: app shell доступен offline; прогресс сохраняется локально.
- Когда вызывать: после изменения PWA config.

## QA & Test Agent

- Миссия: регрессии и качество.
- Зоны: unit, component, e2e, build.
- Входы: tests, scripts.
- Выходы: список ошибок и исправлений.
- Чеклист: lint/typecheck/test/build проходят.
- Когда вызывать: после каждого этапа.

## Documentation Keeper Agent

- Миссия: синхронизация документации и кода.
- Зоны: PROJECT_MEMORY, ADR, ROADMAP, datasets, content strategy.
- Входы: изменения кода.
- Выходы: changelog и обновления docs.
- Чеклист: документация отражает фактическое состояние.
- Когда вызывать: после существенного изменения.
