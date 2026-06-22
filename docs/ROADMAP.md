# ROADMAP

## Этап 1. Инициализация и архитектура

- Vite/React/TypeScript каркас.
- PWA конфигурация.
- Dark-first дизайн-система.
- Документация и роли агентов.

## Этап 2. Данные и модели

- Zod-схемы задач, знаний, прогресса, датасетов и инструментов.
- Seed-контент и синтетические домены.
- Связи task ↔ knowledge.

## Этап 3. SQL-тренажёр

- sql.js, локальная база, ERD, editor, runner, checker.
- Задачи уровней 1-5.
- SQL Quest Mode: 8 глав, 24 задачи, пути `trial`/`case`, XP/ranks, Dexie-прогресс, диагностические ошибки.
- Следующий refinement: разделить `starterSql` и `solutionSql`, добавить rules-based диагностику текста запроса.

## Этап 4. JSON и REST/API

- JSON formatter/validator/diff/schema validator.
- In-browser API simulator и request builder.
- API Contract Quest: 8 REST, 8 JSON, 6 OpenAPI и 6 Integration задач, включая 3 SOAP basics.
- Статус: реализовано внутри существующих вкладок TrainerPage.

## Этап 5. Knowledge Graph

- Поиск, теги, карточки знаний, React Flow граф.

## Этап 6. Toolkit

- JSON/API/SQL/Requirements/Integration/NFR/Decision инструменты.

## Этап 7. Прогресс и polish

- Страница прогресса, слабые зоны, избранное, настройки.

## Этап 8. Стабилизация

- Проверки, PWA/offline QA, финальный changelog.
