# SECURITY_PROCESS

## Цель

Защитить проект «Аналитик Pro» от случайной утечки секретов, локальных файлов, сборочных артефактов, приватных параметров и небезопасных изменений процесса.

## Security Agent

Операционная роль находится в:

- `agents/data-security-agent.md`

Её нужно запускать как реального subagent перед:

- добавлением `.env` или переменных окружения;
- изменением PWA/service worker/cache;
- изменением IndexedDB/localStorage;
- подключением внешних сервисов;
- изменением build/deploy/test scripts;
- публикацией репозитория;
- первым коммитом после крупной генерации файлов.

## Локальная проверка

```bash
npm run security:scan
```

Для проверки supply-chain уязвимостей в среде с доступом к npm registry:

```bash
npm audit --audit-level=moderate
```

Проверка ищет:

- `.env*` файлы;
- вероятные API keys, токены, private keys, passwords;
- `node_modules/`, `dist/`, `build/`, `coverage/`, `test-results/`, `playwright-report/`;
- большие файлы вне разрешённых директорий;
- рискованные runtime-упоминания внешних LLM/API credentials;
- tracked-файлы, которые должны быть ignored.

## Правила

- Секреты не коммитить.
- `.env.example` можно хранить только с безопасными placeholder-значениями.
- Не печатать секреты в логах, тестах, issue, review log или финальных ответах.
- `npm run dev` и `npm run preview` должны оставаться localhost-by-default; LAN-режим использовать только через `dev:lan` / `preview:lan` осознанно.
- PWA cache не должен кешировать пользовательские секреты.
- IndexedDB хранит только учебный прогресс, подсказки, избранное и локальные заметки без секретов.
- Любой внешний API должен быть явно описан в ADR и пройти security review.

## Периодичность

- Автоматическая проверка: еженедельно через automation `security-audit-pro`.
- Ручная проверка: перед коммитом, перед публикацией и после изменения зависимостей.

## Журнал

Результаты реальных subagent security review записываются в:

- `docs/AGENT_REVIEW_LOG.md`
