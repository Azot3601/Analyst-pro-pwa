# Деплой На Vercel

## Текущая Конфигурация

Проект готовится к Vercel как статическое Vite SPA/PWA:

- установка зависимостей: `npm ci`;
- production build: `npm run build`;
- директория публикации: `dist`;
- SPA deep links перенаправляются на `index.html`;
- hashed assets получают долгий immutable cache;
- `sw.js`, `registerSW.js` и manifest всегда перепроверяются браузером;
- manifest содержит SVG, PNG `192x192`, PNG `512x512` и maskable-иконку;
- `.vercel/`, `.env*`, `dist/` и `node_modules/` не попадают в Git.

Конфигурация находится в `vercel.json`.

## Рекомендуемый Способ: GitHub Integration

1. Убедиться, что изменения закоммичены и отправлены в GitHub.
2. В Vercel выбрать **Add New → Project**.
3. Импортировать репозиторий `Azot3601/Analyst-pro-pwa`.
4. Проверить настройки:
   - Framework Preset: `Vite`;
   - Root Directory: корень репозитория;
   - Build Command: `npm run build`;
   - Output Directory: `dist`;
   - Install Command: `npm ci`.
5. Environment Variables не добавлять: текущий runtime не использует секреты или внешние API.
6. Сначала открыть Preview deployment и проверить прямые URL:
   - `/`;
   - `/trainer`;
   - `/knowledge`;
   - `/toolkit`;
   - `/progress`.
7. После проверки назначить deployment production.

## Локальная Проверка Перед Публикацией

```bash
npm run verify:deploy
```

Команда запускает security scan, lint, typecheck, unit/component tests, production build и e2e smoke.

## Проверка После Деплоя

- Обновить страницу напрямую на `/trainer` и убедиться, что нет 404.
- Выполнить SQL-задачу и перезагрузить страницу: IndexedDB progress должен сохраниться.
- Проверить `/manifest.webmanifest`, `/sw.js` и загрузку `sql-wasm-*.wasm`.
- В DevTools → Application проверить service worker и offline reload.
- Убедиться, что preview/production deployment не содержит переменных или токенов, которые не нужны приложению.

## Важно

- `.vercel/project.json` содержит локальную привязку к Vercel project и не должен коммититься.
- Не добавлять `VERCEL_TOKEN` в репозиторий. Он нужен только при CLI/CI deploy и хранится как secret.
- Текущий прогресс пользователя хранится локально в браузере. Он не синхронизируется между устройствами и доменами.
