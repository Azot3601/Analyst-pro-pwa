# SQL Quest Mode

## Цель

SQL Quest Mode делает SQL центральным режимом тренажёра: пользователь решает реальные аналитические задачи в лёгкой средневеково-фэнтезийной рамке.

Фокус этапа:

- 70% — SQL и мышление аналитика;
- 20% — сюжетная причина и атмосфера архива/гильдий/караванов;
- 10% — ранги, XP, реплики спутника и игровые элементы.

## Формула Задачи

Каждая задача строится как:

`сюжетная причина → SQL-действие → проверяемый результат → ошибка с объяснением → связанное знание → награда`

Обязательные поля задачи находятся в `src/data/sqlQuest.ts`: `chapterId`, `pathType`, `storyIntro`, `businessContext`, `learningGoal`, `sqlConcept`, `starterSql`, `expectedRows`, `hints`, `explanation`, `commonMistakes`, `relatedKnowledgeIds`, `xp`, `prerequisiteTaskIds`, `successStory`.

## Главы

1. Деревня сырых данных — `SELECT`, `FROM`, `LIMIT`, `ORDER BY`.
2. Фильтры дозора — `WHERE`, `AND`, `OR`, `IN`, `BETWEEN`, `LIKE`, `IS NULL`.
3. Торговая площадь — `GROUP BY`, `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
4. Архив связей — `INNER JOIN`, `LEFT JOIN`, ключи, дубли, потеря строк.
5. Башня условий — `CASE WHEN`, `HAVING`.
6. Подземелье подзапросов — subquery, `EXISTS`, `IN`, `CTE`.
7. Орден оконных функций — `ROW_NUMBER`, `RANK`, `LAG`, `LEAD`, `SUM OVER`.
8. Реальные дела королевства — funnel-lite, repeat purchases, SLA/аномалии.

## Прогресс

Минимальный SQL Quest progress хранится в IndexedDB через Dexie:

- `solvedSqlLessonIds`;
- `xp`;
- `level`;
- `rankId`;
- `unlockedRankIds`;
- `attemptsByLessonId`;
- `revealedHintsByLessonId`;
- `currentChapterId`;
- `lastSqlLessonId`;
- `recentlySolvedLessonIds`.

XP начисляется один раз за задачу. Повторное решение сохраняет результат, но не дублирует награду.

## Диагностика Ошибок

`src/shared/lib/sqlDiagnostics.ts` сравнивает фактический и ожидаемый результат:

- ожидаемое и фактическое количество строк;
- лишние и недостающие строки;
- лишние и недостающие колонки;
- вероятная причина;
- мягкая подсказка;
- реплика спутника;
- ссылка на knowledge node.

## Ограничение Этапа

Сейчас `starterSql` остаётся рабочим запросом для стабильного onboarding и e2e smoke. Следующий refinement: разделить `starterSql` и `solutionSql`, чтобы большинство задач открывались как заготовки, а эталон использовался только проверками и тестами.
