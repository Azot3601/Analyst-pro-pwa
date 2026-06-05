# Аналитик Pro

Dark-first PWA-приложение на русском языке для развития hard skills системного аналитика.

## Возможности

- Тренажёр задач: SQL, REST/API, JSON/OpenAPI, интеграционные кейсы.
- Локальный SQL-тренажёр на `sql.js`.
- JSON formatter, validator, diff и JSON Schema validator.
- Локальный REST/API simulator.
- База знаний с поиском и Obsidian-like графом.
- Практический инструментарий системного аналитика.
- Прогресс пользователя в IndexedDB.
- PWA manifest, service worker и offline shell.

## Установка

```bash
npm install
```

Если `node_modules` уже установлены, этот шаг повторять не нужно.

## Запуск

```bash
npm run dev
```

## Проверки

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run security:scan
```

`npm run test:e2e` использует Playwright smoke-runner и проверяет тренажёр, инструментарий и базу знаний на desktop/mobile.

## Документация

Основная документация находится в `docs/`.
