# PROJECT_MEMORY

## Цель

«Аналитик Pro» — offline-first PWA на русском языке для развития hard skills системного аналитика: SQL, REST API, JSON, JSON Schema, OpenAPI, ERD, интеграции, требования, НФТ, SLA/SLO, логирование и мониторинг.

## Принятые решения

- Runtime без GPT/OpenAI/Claude/LLM API и без платных AI-токенов.
- Основной UX: dark-first developer-tool интерфейс для комфортной ночной работы.
- Стек: Vite, React, TypeScript, Tailwind CSS, React Router, Zustand, Dexie, sql.js, CodeMirror, Ajv, Zod, React Flow, Framer Motion, Vitest, RTL, Playwright, vite-plugin-pwa.
- Основные данные и прогресс работают локально; внешние датасеты не копируются без ясной лицензии.
- CodeMirror выбран вместо Monaco для меньшего веса PWA.
- React Flow выбран для Obsidian-like графа знаний.

## Что сделано

- 2026-06-04: старт проекта из пустой папки `F:\Qproject`.
- 2026-06-04: создана базовая конфигурация Vite/PWA/TS/Tailwind/test tooling.
- 2026-06-04: npm registry был недоступен из среды (`connect EACCES`), позже зависимости были установлены пользователем локально.
- 2026-06-04: реализован dark-first app shell с маршрутами `Главная`, `Тренажёр`, `База знаний`, `Инструментарий`, `Прогресс`, `Настройки`.
- 2026-06-04: добавлены Zod-схемы `Task`, `KnowledgeNode`, `DatasetCard`, `UserProgress`, `ToolkitItem`.
- 2026-06-04: добавлен seed-контент: 95 задач, 87 узлов знаний, 26 инструментов, 9 карточек датасетов.
- 2026-06-04: добавлены локальные JSON tools, API simulator, SQL checker, sql.js runner, Dexie progress DB.
- 2026-06-04: добавлены unit, component и e2e тесты.
- 2026-06-04: попытки `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` не стартовали из-за отсутствия установленных dev-зависимостей.
- 2026-06-04: после установки зависимостей пользователем проверки стали доступны.
- 2026-06-04: SQL-тренажёр переработан в пошаговый SQL-квест: 10 уроков от `SELECT` до `CTE`, карта уроков, видимые таблицы базы, ERD, критерии успеха, поэтапные подсказки, табличный результат и разбор ошибок.
- 2026-06-05: создана рабочая система subagents: root `AGENTS.md`, роль-файлы в `agents/`, журнал `docs/AGENT_REVIEW_LOG.md`.
- 2026-06-05: реальные subagents запущены через `multi_agent_v1`; отчёты получены по SQL/Curriculum, Product/UI, QA/PWA, Documentation/Knowledge/Toolkit.
- 2026-06-05: по результатам subagent review исправлен SQL CTE-урок, добавлен урок по оконным функциям, расширены SQL-тесты, e2e теперь запускает SQL, Toolkit сбрасывает output при смене инструмента, приоритетные knowledge nodes получили кураторские тексты.
- 2026-06-05: SQL-тренажёр переведён в SQL Quest Mode: 8 глав, 24 задачи, пути `trial`/`case`, ранги, XP, блокировки prerequisites, Dexie-прогресс, обучающая диагностика SQL-ошибок и обновлённая ProgressPage.
- 2026-06-05: добавлены точные SQL knowledge nodes: `sql-select-from`, `sql-where-filter`, `sql-join-relations`, `sql-left-join`, `sql-group-by`, `sql-having`, `sql-case-when`, `sql-subquery`, `sql-cte`, `sql-window-functions`.
- 2026-06-06: проект подготовлен к Vercel deployment: добавлены SPA rewrites, PWA/cache/security headers, игнорирование `.vercel/`, команда `npm run verify:deploy` и инструкция `docs/DEPLOYMENT_VERCEL.md`.
- 2026-06-06: выполнен UX quality pass SQL Quest TrainerPage: SQL-редактор стал центральным действием, данные больше не дублируются, desktop получил трёхколоночный workspace, а mobile/tablet — вкладки с SQL по умолчанию.

## Что осталось

- Разделить `starterSql` и `solutionSql`, чтобы пользователь начинал большинство задач с заготовки, а не с готового запроса.
- Расширить SQL Quest диагностическими правилами по тексту запроса: forbidden `SELECT *`, required join key, required join type, alias check, hardcode detection.
- Расширить SQL-квест дальше: качество миграций, сверка API и БД, диагностика просадки конверсии.
- Поддерживать `scripts/e2e-smoke.mjs` как стабильный e2e smoke-runner для Windows-среды.
- Удалить временный `test-results` после установки разрешений/очистки workspace; автоматическое удаление было отклонено политикой доступа.

## Технические ограничения

- В рантайме запрещены LLM API.
- Данные пользователя остаются в IndexedDB.
- Приложение должно быть полезным offline после первого открытия.
- Лицензии внешних датасетов фиксируются до использования.

## Changelog

### 0.1.0

- Заложен PWA-каркас, документация, модели, seed-данные, тренажёры, база знаний, инструментарий и тестовая стратегия.
- Реализованы рабочие экраны приложения и локальные утилиты без runtime LLM/API.
- SQL-раздел получил учебную механику с последовательным усложнением, визуальной базой данных и контекстом задач.
- Subagents стали реальной частью процесса: role prompts лежат в `agents/`, результаты ревью записываются в `docs/AGENT_REVIEW_LOG.md`.
- SQL Quest Mode стал центральным режимом SQL: главы, пути, XP/ranks, persistent progress, блокировки, диагностика ошибок и knowledge links.
- SQL Quest получил компактный responsive workspace: редактор и запуск находятся в первом рабочем экране, результат и диагностика идут сразу следом, вторичный контекст перенесён во вкладки и раскрываемые блоки.
