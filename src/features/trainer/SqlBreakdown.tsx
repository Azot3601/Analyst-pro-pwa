import { BookOpen, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Учебный разбор запроса «с нуля»: парсит SQL на клаузы и объясняет каждую
// строку простым языком — что она делает и почему. Работает для любого урока,
// поэтому новичок понимает, как запрос собирается по кусочкам.

type ClauseDef = { re: RegExp; key: string; title: string; plain: string; why: string };

const CLAUSES: ClauseDef[] = [
  {
    re: /\bWITH\b/i,
    key: 'WITH',
    title: 'Заготовка (CTE)',
    plain: 'Именованный подзапрос: считаем промежуточный набор заранее и потом используем его как таблицу.',
    why: 'Разбивает сложный запрос на понятные шаги.'
  },
  {
    re: /\bSELECT\b/i,
    key: 'SELECT',
    title: 'Что показать',
    plain: 'Перечисляешь колонки, которые попадут в ответ. Звёздочка * означает «все колонки».',
    why: 'Любой запрос начинается с вопроса «что я хочу увидеть».'
  },
  {
    re: /\bFROM\b/i,
    key: 'FROM',
    title: 'Откуда брать данные',
    plain: 'Указываешь таблицу-источник. Таблица — как лист в Excel: строки (записи) и колонки (поля).',
    why: 'Без FROM неоткуда взять строки.'
  },
  {
    re: /\b(?:LEFT|RIGHT|INNER)?\s*JOIN\b/i,
    key: 'JOIN',
    title: 'Присоединить таблицу',
    plain: 'Подключаешь вторую таблицу, чтобы видеть связанные данные вместе (например, заказ и его клиента).',
    why: 'LEFT JOIN сохраняет все строки слева, даже если справа пары нет — там будет NULL.'
  },
  {
    re: /\bON\b/i,
    key: 'ON',
    title: 'Ключ связи',
    plain: 'По какому полю связываем таблицы — обычно id одной таблицы и внешний ключ другой.',
    why: 'Неверный ключ соединит данные неправильно, и результат будет ложным.'
  },
  {
    re: /\bWHERE\b/i,
    key: 'WHERE',
    title: 'Фильтр строк',
    plain: 'Оставляем только строки, для которых условие истинно (например, status = \'paid\').',
    why: 'Фильтр применяется до группировки — отсекает лишнее в самом начале.'
  },
  {
    re: /\bGROUP BY\b/i,
    key: 'GROUP BY',
    title: 'Группировка',
    plain: 'Собираем строки в группы по одному признаку, чтобы посчитать агрегаты в каждой группе.',
    why: 'Нужен, когда вопрос звучит как «сколько», «на какую сумму», «где больше».'
  },
  {
    re: /\bHAVING\b/i,
    key: 'HAVING',
    title: 'Фильтр групп',
    plain: 'Фильтр уже по посчитанным группам — после агрегации (например, COUNT(*) > 1).',
    why: 'WHERE так не умеет: он работает до GROUP BY, а HAVING — после.'
  },
  {
    re: /\bORDER BY\b/i,
    key: 'ORDER BY',
    title: 'Сортировка',
    plain: 'Упорядочиваем результат по полю. ASC — по возрастанию, DESC — по убыванию.',
    why: 'Порядок важен для читаемости и для сверки с эталоном.'
  },
  {
    re: /\bLIMIT\b/i,
    key: 'LIMIT',
    title: 'Сколько строк',
    plain: 'Ограничиваем число строк в ответе.',
    why: 'Удобно, чтобы не вываливать всю таблицу, когда нужно лишь несколько строк.'
  }
];

type Segment = { def: ClauseDef; index: number };

function explainSql(sql: string): Array<{ key: string; title: string; text: string; plain: string; why: string }> {
  const found: Segment[] = [];
  for (const def of CLAUSES) {
    const match = def.re.exec(sql);
    if (match) found.push({ def, index: match.index });
  }
  found.sort((a, b) => a.index - b.index);

  return found.map((segment, i) => {
    const start = segment.index;
    const end = i + 1 < found.length ? found[i + 1].index : sql.length;
    const text = sql
      .slice(start, end)
      .replace(/;\s*$/, '')
      .trim();
    return { key: segment.def.key, title: segment.def.title, text, plain: segment.def.plain, why: segment.def.why };
  });
}

export function SqlBreakdown({ sql }: { sql: string }) {
  const [open, setOpen] = useState(true);
  const steps = explainSql(sql);
  if (!steps.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/[0.07] to-transparent">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 p-4 text-left">
        <span className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-amber/15 text-amber">
            <BookOpen size={16} />
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-amber/80">Разбор по строчкам</span>
            <span className="block text-sm font-semibold text-slate-50">Как собран этот запрос</span>
          </span>
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ol className="space-y-2 px-4 pb-4">
          {steps.map((step, index) => (
            <li key={`${step.key}-${index}`} className="rounded-xl border border-white/[0.06] bg-ink/40 p-3">
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-amber/15 text-[11px] font-bold text-amber">
                  {index + 1}
                </span>
                <span className="rounded-md bg-amber/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber">
                  {step.key}
                </span>
                <span className="text-xs font-semibold text-slate-200">{step.title}</span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-md bg-black/30 px-2.5 py-1.5 font-mono text-[11px] leading-5 text-slate-200">
                {step.text}
              </pre>
              <p className="mt-2 text-xs leading-5 text-slate-300">{step.plain}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Почему: {step.why}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function SqlPrimer() {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-2xl border border-electric/20 bg-white/[0.03]">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 p-4 text-left">
        <span className="text-sm font-semibold text-slate-50">Впервые видишь SQL? Начни отсюда</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 text-sm leading-6 text-slate-300">
          <p>
            <strong className="text-slate-100">SQL — это язык вопросов к базе данных.</strong> Данные лежат в{' '}
            <strong className="text-slate-100">таблицах</strong>: как листы в Excel — строки (записи) и колонки (поля).
          </p>
          <p>
            Запрос читается почти по-английски:{' '}
            <span className="font-mono text-electric">ВЫБРАТЬ</span> такие-то колонки{' '}
            <span className="font-mono text-electric">ИЗ</span> такой-то таблицы{' '}
            <span className="font-mono text-electric">ГДЕ</span> выполняется условие.
          </p>
          <p>
            Главное: ты описываешь <em>что</em> хочешь получить, а не <em>как</em> искать — движок сам найдёт данные. Ниже
            «Разбор по строчкам» покажет, что делает каждая строка именно этого запроса.
          </p>
        </div>
      )}
    </section>
  );
}
