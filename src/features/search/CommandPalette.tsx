import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchItem } from './searchIndex';

// Индекс тянет все data-файлы (sqlQuest/apiQuest/knowledgeRich) — грузим его
// лениво при первом открытии палитры, чтобы он не сидел в стартовом бандле.
type SearchFn = (query: string) => SearchItem[];

// Командная палитра: Ctrl/⌘+K открывает глобальный поиск по базе знаний,
// задачам и страницам. Навигация стрелками, Enter — переход, Esc — закрыть.

const categoryTone: Record<string, string> = {
  Навигация: 'text-slate-400',
  'База знаний': 'text-mentor',
  SQL: 'text-electric',
  API: 'text-amber',
  Требования: 'text-success'
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchFn, setSearchFn] = useState<SearchFn | null>(null);

  const results = useMemo(() => (searchFn ? searchFn(query) : []), [searchFn, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('permalith:search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('permalith:search', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // Фокус после появления модалки.
      requestAnimationFrame(() => inputRef.current?.focus());
      if (!searchFn) {
        void import('./searchIndex').then((m) => setSearchFn(() => m.searchItems));
      }
    }
  }, [open, searchFn]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (index: number) => {
    const item = results[index];
    if (!item) return;
    navigate(item.to);
    setOpen(false);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(active);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-graphite shadow-lift"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Глобальный поиск"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Поиск по базе знаний, задачам и разделам…"
            className="w-full bg-transparent py-4 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-400 sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              Начни печатать — например «идемпотентность», «оконные функции» или «отмена подписки».
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">Ничего не найдено по запросу «{query}».</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(index)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  index === active ? 'bg-electric/15' : 'hover:bg-white/[0.05]'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-100">{item.title}</span>
                  {item.subtitle && <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${categoryTone[item.category] ?? 'text-slate-400'}`}>
                    {item.category}
                  </span>
                  {index === active && <CornerDownLeft size={13} className="text-slate-400" />}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
