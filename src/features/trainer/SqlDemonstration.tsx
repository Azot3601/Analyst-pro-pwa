import { AnimatePresence, motion } from 'framer-motion';
import { Play, RotateCcw, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../app/store';

// Премиальная демонстрация «посмотри, что произойдёт»: до решения задачи
// показывает на маленьком примере, как SQL-операция преобразует строки —
// пошагово, с анимацией и подписями. Тип демо выводится из sqlConcept урока.

type DemoType = 'filter' | 'group' | 'order' | 'join' | 'select';
type Row = { id: number; status: string; total: number };

const SAMPLE: Row[] = [
  { id: 1001, status: 'paid', total: 5600 },
  { id: 1002, status: 'shipped', total: 2100 },
  { id: 1003, status: 'paid', total: 1200 },
  { id: 1004, status: 'cancelled', total: 900 },
  { id: 1005, status: 'paid', total: 4300 }
];

const statusColor: Record<string, string> = {
  paid: '#57d9a3',
  shipped: '#ffce6a',
  cancelled: '#ff7a93'
};

const captions: Record<DemoType, string[]> = {
  filter: [
    'Берём все заказы из таблицы orders.',
    "Проверяем условие WHERE и оставляем только подходящие строки (status = 'paid').",
    'В результат попали только совпавшие строки — остальные отброшены.'
  ],
  group: [
    'Берём все заказы.',
    'GROUP BY собирает строки в группы по одному признаку (status).',
    'В каждой группе считаем агрегат — COUNT строк и SUM суммы.'
  ],
  order: [
    'Берём все заказы в исходном порядке.',
    'ORDER BY упорядочивает строки по полю total (по убыванию).',
    'Готово — строки идут в нужном порядке.'
  ],
  join: [
    'Берём заказы из таблицы orders.',
    'По ключу подставляем имя клиента из customers.',
    'LEFT JOIN сохраняет заказ даже без клиента — там будет NULL.'
  ],
  select: [
    'Берём таблицу со всеми колонками.',
    'SELECT оставляет только нужные колонки (id, status).',
    'Лишние колонки отброшены — результат чище.'
  ]
};

const demoTitle: Record<DemoType, string> = {
  filter: 'Фильтрация строк',
  group: 'Группировка и агрегаты',
  order: 'Сортировка',
  join: 'Соединение таблиц',
  select: 'Выбор колонок'
};

function conceptToDemo(concept: string): DemoType {
  const c = concept.toLowerCase();
  if (c.includes('join')) return 'join';
  if (c.includes('group') || c.includes('having') || c.includes('агрег') || c.includes('оконн')) return 'group';
  if (c.includes('order') || c.includes('сортир')) return 'order';
  if (c.includes('where') || c.includes('фильтр') || c.includes('like') || c.includes('between') || c.includes('case')) return 'filter';
  return 'select';
}

function RowChip({ row, dim, extra }: { row: Row; dim?: boolean; extra?: string | null }) {
  const color = statusColor[row.status] ?? '#8b7bff';
  return (
    <motion.div
      layout
      layoutId={`demo-row-${row.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: dim ? 0.3 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs"
      style={{ borderColor: `${color}55`, background: `${color}14` }}
    >
      <span className="text-slate-300">#{row.id}</span>
      <span className="font-semibold" style={{ color }}>
        {row.status}
      </span>
      <span className="text-slate-400">{row.total}</span>
      {extra !== undefined && (
        <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${extra === null ? 'bg-danger/20 text-danger' : 'bg-electric/15 text-electric'}`}>
          {extra ?? 'NULL'}
        </span>
      )}
    </motion.div>
  );
}

function Stage({ type, step }: { type: DemoType; step: number }) {
  if (type === 'filter') {
    const rows = step < 2 ? SAMPLE : SAMPLE.filter((r) => r.status === 'paid');
    return (
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {rows.map((row) => (
            <RowChip key={row.id} row={row} dim={step >= 1 && row.status !== 'paid'} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  if (type === 'order') {
    const rows = step >= 1 ? [...SAMPLE].sort((a, b) => b.total - a.total) : SAMPLE;
    return (
      <div className="flex flex-wrap gap-2">
        {rows.map((row) => (
          <RowChip key={row.id} row={row} />
        ))}
      </div>
    );
  }

  if (type === 'join') {
    const customer: Record<number, string | null> = { 1001: 'CUST-1', 1002: 'CUST-2', 1003: 'CUST-1', 1004: null, 1005: 'CUST-3' };
    return (
      <div className="flex flex-wrap gap-2">
        {SAMPLE.map((row) => (
          <RowChip key={row.id} row={row} extra={step >= 1 ? customer[row.id] : undefined} dim={step === 2 && customer[row.id] !== null} />
        ))}
      </div>
    );
  }

  if (type === 'group') {
    if (step === 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {SAMPLE.map((row) => (
            <RowChip key={row.id} row={row} />
          ))}
        </div>
      );
    }
    const groups = SAMPLE.reduce<Record<string, Row[]>>((acc, row) => {
      (acc[row.status] ??= []).push(row);
      return acc;
    }, {});
    return (
      <div className="flex flex-wrap gap-3">
        {Object.entries(groups).map(([status, rows]) => {
          const color = statusColor[status] ?? '#8b7bff';
          return (
            <motion.div layout key={status} className="rounded-xl border p-2" style={{ borderColor: `${color}44` }}>
              <div className="mb-1.5 text-[11px] font-semibold" style={{ color }}>
                {status}
              </div>
              <div className="flex flex-col gap-1.5">
                {rows.map((row) => (
                  <RowChip key={row.id} row={row} />
                ))}
              </div>
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 rounded-md bg-black/25 px-2 py-1 font-mono text-[10px] text-slate-300"
                >
                  COUNT {rows.length} · SUM {rows.reduce((s, r) => s + r.total, 0)}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  // select
  const cols: Array<keyof Row> = ['id', 'status', 'total'];
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 text-xs">
      <div className="flex bg-white/[0.06]">
        {cols.map((col) => (
          <div
            key={col}
            className={`flex-1 px-3 py-1.5 font-semibold transition-opacity ${step >= 1 && col === 'total' ? 'opacity-25' : 'text-slate-200'}`}
          >
            {col}
          </div>
        ))}
      </div>
      {SAMPLE.map((row) => (
        <div key={row.id} className="flex border-t border-white/5">
          {cols.map((col) => (
            <div
              key={col}
              className={`flex-1 px-3 py-1 font-mono text-slate-300 transition-opacity ${step >= 1 && col === 'total' ? 'opacity-20' : ''}`}
            >
              {String(row[col])}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SqlDemonstration({ concept }: { concept: string }) {
  const reduced = useAppStore((s) => s.reducedMotion);
  const type = conceptToDemo(concept);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    clear();
    return clear;
  }, [concept]);

  const play = () => {
    clear();
    if (reduced) {
      setStep(2);
      return;
    }
    setStep(0);
    setPlaying(true);
    timers.current.push(window.setTimeout(() => setStep(1), 1400));
    timers.current.push(
      window.setTimeout(() => {
        setStep(2);
        setPlaying(false);
      }, 2800)
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-electric/20 bg-gradient-to-br from-electric/[0.08] via-white/[0.02] to-transparent p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-electric/15 text-electric">
            <Wand2 size={16} />
          </span>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-electric/80">Демонстрация · перед задачей</div>
            <div className="text-sm font-semibold text-slate-50">{demoTitle[type]}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-1.5 rounded-full transition-colors"
              style={{ background: dot <= step ? '#8b7bff' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
          <button
            onClick={play}
            disabled={playing}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/[0.12] disabled:opacity-50"
          >
            {step === 2 ? <RotateCcw size={13} /> : <Play size={13} />}
            {step === 2 ? 'Ещё раз' : 'Показать'}
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-[92px] rounded-xl border border-white/[0.06] bg-ink/40 p-3">
        <Stage type={type} step={step} />
      </div>

      <motion.p key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex gap-2 text-xs leading-5 text-slate-300">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-electric/15 text-[10px] font-bold text-electric">
          {step + 1}
        </span>
        {captions[type][step]}
      </motion.p>
    </section>
  );
}
