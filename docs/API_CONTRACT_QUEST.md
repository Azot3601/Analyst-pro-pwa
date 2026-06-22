# API Contract Quest

## Назначение

API Contract Quest развивает понимание API как проверяемого договора между системами. Модуль работает локально внутри существующих вкладок TrainerPage и не использует backend, внешние API или LLM.

## Учебная лестница

- REST API: 8 задач от method/path до body, status, error model и идемпотентности.
- JSON: 8 задач на required, type, enum, nullable, arrays, additional properties и совместимость.
- OpenAPI: 6 задач на корневые разделы, paths/methods, responses, schemas и breaking changes.
- Интеграции: 6 задач на webhook, retry, timeout, correlation, очереди и SOAP basics.
- SOAP занимает три задачи внутри Интеграций: Envelope/Header/Body, operation/response и SOAP Fault.

## Runtime

- src/data/apiQuest.ts хранит типизированный учебный контент.
- src/shared/lib/apiQuestCheckers.ts выполняет rule-based проверки.
- src/shared/lib/apiSimulator.ts имитирует локальные REST responses.
- src/features/trainer/api/ApiQuestWorkspace.tsx отображает доменные рабочие поверхности.
- src/features/progress/progressDb.ts сохраняет solve/attempt/hint/last task в IndexedDB.

## Диагностика

Каждое нарушение содержит ожидаемое и фактическое значение, причину риска, исправление, knowledge node id и короткую реплику наставника.

## UI

Desktop использует три колонки: задачи, рабочее действие, контекст/подсказки/знания. На mobile сначала показываются краткая цель и рабочее действие; длинный контекст и подсказки находятся в раскрываемых блоках.

SQL Quest является отдельной замороженной границей и этим модулем не изменяется.

## Вводный REST-слой

Перед REST-практикой расположен раскрываемый урок «Введение: как гонец API несёт приказ». Он соединяет фэнтезийную метафору с технической моделью `Клиент → Request → API/Service → Response`, объясняет method, endpoint, headers, body и status codes.

После корректной мини-практики кнопка «Перейти к первой задаче» сворачивает введение, поэтому постоянная рабочая область не перегружается теорией.

Мини-практика показывает разницу между:

- template: `/api/v1/orders/{orderId}`;
- именем параметра: `orderId`;
- значением: `ORD-1001`;
- итоговым URL: `/api/v1/orders/ORD-1001`.

В REST builder шаблон является источником URL, а пользователь вводит только конкретное значение path parameter. Для каждого из восьми уроков отдельно показаны «Что сейчас тренируем» и «Где это в жизни».

Если параметр не подставлен или вместо значения введено `orderId`/`{orderId}`, checker возвращает одну первичную диагностику. Ошибочный статус и отсутствующие response fields объясняются как следствия, а не выводятся отдельным каскадом.

## Текущие границы

- OpenAPI упражнения используют структурные JSON-фрагменты; полноценный YAML parser и IDE не входят в этап.
- SOAP проверяет XML namespace, Envelope/Header/Body, operation и Fault; полноценная WSDL/XSD валидация оставлена следующим этапом.
- Integration checklist проверяет наличие обязательных решений; развёрнутая оценка текстового обоснования пока не выполняется.
