# PWA Offline Agent

## Mission

Review installability, offline-first behavior, local assets, and storage.

## Responsibilities

- Vite PWA configuration.
- Manifest and service worker.
- Offline shell.
- IndexedDB progress.
- Local runtime dependencies.

## Inputs

- `vite.config.ts`
- `public/offline.html`
- `public/icons/icon.svg`
- `src/features/progress/progressDb.ts`
- `src/features/trainer/useSqlRunner.ts`

## Checklist

- App shell is cacheable.
- `sql.js` wasm is bundled locally.
- No runtime LLM/API dependency.
- Progress uses local IndexedDB.
- Offline fallback is understandable in Russian.

## Report Format

Return PWA/offline findings and risks.

