import { BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ApiQuestTask } from '../../../data/apiQuest';

// Учебный разбор REST-запроса «по частям»: берёт контракт задачи и объясняет,
// что делает каждая часть запроса и зачем она нужна. Так новичок понимает, как
// запрос собирается из кусочков, а не просто «заполняет поля».

type RestTask = Extract<ApiQuestTask, { kind: 'rest' }>;

const methodPlain: Record<string, string> = {
  GET: 'Прочитать ресурс, ничего не меняя. Безопасен и кэшируем.',
  POST: 'Создать новый ресурс. Повтор без ключа идемпотентности создаёт дубль.',
  PUT: 'Полностью заменить ресурс новым представлением.',
  PATCH: 'Частично изменить ресурс — только переданные поля.',
  DELETE: 'Удалить ресурс. Обычно идемпотентен: повтор не меняет результат.'
};

function statusPlain(status: number): string {
  if (status >= 200 && status < 300) return 'Успех (2xx): операция выполнена, клиент продолжает сценарий.';
  if (status >= 400 && status < 500) return 'Ошибка клиента (4xx): запрос неверен — не тот путь, нет прав, невалидные данные.';
  if (status >= 500) return 'Ошибка сервера (5xx): сбой на стороне сервиса — клиенту обычно можно повторить позже.';
  return 'Промежуточный/другой класс ответа.';
}

type Part = { key: string; value: string; title: string; plain: string };

function buildParts(task: RestTask): Part[] {
  const c = task.config;
  const ex = task.beginner.example;
  const parts: Part[] = [];

  parts.push({
    key: 'METHOD',
    value: c.method,
    title: 'Метод — намерение операции',
    plain: methodPlain[c.method.toUpperCase()] ?? 'HTTP-метод задаёт, что мы хотим сделать с ресурсом.'
  });

  parts.push({
    key: 'ENDPOINT',
    value: c.path,
    title: 'Эндпоинт — адрес ресурса',
    plain: 'Путь к ресурсу или коллекции. Из него сервис понимает, к чему обращаются.'
  });

  for (const name of c.pathParams) {
    const example = c.pathParamExamples?.[name] ?? ex.pathParams?.[name];
    parts.push({
      key: 'PATH',
      value: example ? `{${name}} → ${example}` : `{${name}}`,
      title: `Path-параметр ${name}`,
      plain: 'Это часть адреса, а не текст для отправки: шаблон {…} заменяется конкретным значением ресурса, иначе будет 404.'
    });
  }

  for (const name of c.query) {
    parts.push({
      key: 'QUERY',
      value: `?${name}=${ex.query?.[name] ?? '…'}`,
      title: `Query-параметр ${name}`,
      plain: 'Настраивает выборку после «?»: фильтр, сортировка, пагинация. Обычно опционален.'
    });
  }

  for (const [name, val] of Object.entries(c.headers)) {
    parts.push({
      key: 'HEADER',
      value: `${name}: ${val}`,
      title: `Заголовок ${name}`,
      plain:
        name.toLowerCase() === 'content-type'
          ? 'Говорит серверу, в каком формате тело запроса (application/json = JSON).'
          : name.toLowerCase().includes('idempotency')
            ? 'Ключ идемпотентности: связывает повторы одной операции, чтобы не создать дубль.'
            : 'Служебная метаинформация запроса: формат, доступ, поведение.'
    });
  }

  if (c.bodyFields.length) {
    parts.push({
      key: 'BODY',
      value: c.bodyFields.join(', '),
      title: 'Тело запроса',
      plain: 'Полезная нагрузка для создания/изменения. Каждое поле — часть контракта: тип и обязательность важны.'
    });
  }

  parts.push({
    key: 'STATUS',
    value: String(c.expectedStatus),
    title: 'Ожидаемый статус ответа',
    plain: statusPlain(c.expectedStatus)
  });

  if (c.responseFields.length) {
    parts.push({
      key: 'RESPONSE',
      value: c.responseFields.join(', '),
      title: 'Тело ответа',
      plain: 'Что вернётся при успехе. Потребитель строит на этих полях свой сценарий.'
    });
  }

  return parts;
}

export function RestBreakdown({ task }: { task: RestTask }) {
  const [open, setOpen] = useState(true);
  const parts = buildParts(task);

  return (
    <section className="overflow-hidden rounded-lg border border-amber/20 bg-gradient-to-br from-amber/[0.07] to-transparent">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 p-3 text-left">
        <span className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-amber/15 text-amber">
            <BookOpen size={15} />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber/80">Разбор запроса</span>
            <span className="block text-sm font-semibold text-slate-50">Из чего собран этот запрос</span>
          </span>
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol className="space-y-2 px-3 pb-3">
          {parts.map((part, index) => (
            <li key={`${part.key}-${index}`} className="rounded-lg border border-white/[0.06] bg-ink/40 p-2.5">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-amber/15 text-[11px] font-bold text-amber">
                  {index + 1}
                </span>
                <span className="rounded bg-amber/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber">{part.key}</span>
                <span className="text-xs font-semibold text-slate-200">{part.title}</span>
              </div>
              <pre className="mt-1.5 overflow-x-auto rounded bg-black/30 px-2 py-1 font-mono text-[11px] leading-5 text-slate-200">
                {part.value}
              </pre>
              <p className="mt-1.5 text-xs leading-5 text-slate-300">{part.plain}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
