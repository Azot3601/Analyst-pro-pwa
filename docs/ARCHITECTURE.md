# ARCHITECTURE

## Структура

```text
src/
  app/                 app shell, routing, providers
  pages/               route-level screens
  widgets/             крупные композиционные блоки
  features/            trainer, knowledge-base, toolkit, progress, settings
  entities/            Zod-схемы и типы
  shared/              ui, lib, config, styles, types
  data/                tasks, knowledge, datasets, cheat-sheets
  tests/               unit/component/e2e
docs/
public/
```

## Потоки данных

- Seed-данные импортируются статически и валидируются Zod-схемами.
- Состояние UI хранится в Zustand.
- Прогресс, подсказки, избранное и decision log сохраняются в IndexedDB через Dexie.
- SQL-тренажёр поднимает in-browser sql.js базу из локальных схем и сидов.
- PWA service worker кеширует app shell, статику и wasm-ассеты.

## Runtime

Нет серверного backend. REST/API тренажёр работает как локальный симулятор, возвращающий ответы из TypeScript-данных.
