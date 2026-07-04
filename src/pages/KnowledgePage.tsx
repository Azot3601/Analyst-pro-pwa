import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Network,
  Search,
  Sparkles,
  Star
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { knowledgeNodes } from '../data/knowledge';
import type { KnowledgeNode } from '../entities/schemas';
import { tasks } from '../data/tasks';
import { knowledgeDiagrams } from '../features/knowledge/diagrams';
import { ConceptMindmap } from '../features/knowledge/ConceptMindmap';
import { GlossaryText } from '../features/knowledge/GlossaryText';
import { Panel } from '../shared/ui/Panel';

const relationMeta: Record<string, { label: string; color: string }> = {
  prerequisite: { label: 'Сначала изучи', color: '#8b7bff' },
  related: { label: 'Связано', color: '#b3a4ff' },
  used_in: { label: 'Используется в', color: '#57d9a3' },
  common_mistake: { label: 'Частая ошибка', color: '#ff7a93' },
  example: { label: 'Пример', color: '#ffce6a' },
  contrasts_with: { label: 'Контраст с', color: '#f472b6' }
};

const levelMeta: Record<string, { label: string; color: string; dots: number }> = {
  basic: { label: 'База', color: '#57d9a3', dots: 1 },
  intermediate: { label: 'Средний', color: '#8b7bff', dots: 2 },
  advanced: { label: 'Продвинутый', color: '#ffce6a', dots: 3 }
};

const moduleOrder = [
  'Основы профессии',
  'Требования и качество',
  'API и контракты',
  'Интеграции',
  'SQL и данные',
  'Решения и архитектура',
  'Прочее'
];

function moduleOf(node: KnowledgeNode): string {
  const t = node.tags.map((tag) => tag.toLowerCase());
  const has = (...keys: string[]) => keys.some((key) => t.includes(key));
  if (has('sql', 'данные', 'данных', 'агрегации', 'метрики', 'join')) return 'SQL и данные';
  if (has('api', 'rest', 'json', 'openapi', 'http', 'schema', 'контракт', 'контракты', 'soap')) return 'API и контракты';
  if (has('integration', 'интеграции', 'webhooks', 'events', 'надёжность', 'wsdl')) return 'Интеграции';
  if (has('требования', 'nfr', 'качество')) return 'Требования и качество';
  if (has('decision', 'architecture', 'documentation')) return 'Решения и архитектура';
  if (has('основа', 'аналитика', 'hard-skills')) return 'Основы профессии';
  return 'Прочее';
}

function readingMinutes(node: KnowledgeNode): number {
  const words = [node.summary, node.fullText, node.whyItMatters ?? '', ...(node.walkthrough ?? []), ...node.examples, ...node.antiExamples]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 130));
}

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

type SelfCheckData = NonNullable<KnowledgeNode['selfCheck']>;

function SelfCheck({ data }: { data: SelfCheckData }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <section className="mt-8 rounded-2xl border border-amber/20 bg-amber/[0.05] p-4">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-amber/80">
        <HelpCircle size={13} /> Проверь себя
      </div>
      <p className="text-sm font-medium leading-6 text-slate-100">{data.question}</p>
      <div className="mt-3 space-y-2">
        {data.options.map((option, index) => {
          const isCorrect = index === data.answer;
          const state = !answered ? 'idle' : isCorrect ? 'correct' : index === picked ? 'wrong' : 'idle';
          return (
            <button
              key={option}
              disabled={answered}
              onClick={() => setPicked(index)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                state === 'correct'
                  ? 'border-success/40 bg-success/10 text-success'
                  : state === 'wrong'
                    ? 'border-danger/40 bg-danger/10 text-danger'
                    : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] disabled:hover:bg-white/[0.03]'
              }`}
            >
              {answered && isCorrect ? (
                <Check size={15} className="shrink-0" />
              ) : (
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[10px]">
                  {String.fromCharCode(65 + index)}
                </span>
              )}
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-3 rounded-lg bg-black/20 p-2.5 text-xs leading-5 text-slate-300">
          {picked === data.answer ? 'Верно! ' : 'Не совсем. '}
          {data.explain}
        </p>
      )}
    </section>
  );
}

export function KnowledgePage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [graphOpen, setGraphOpen] = useState(true);
  const nodeParam = params.get('node');
  const [selectedId, setSelectedId] = useState(nodeParam ?? knowledgeNodes[0].id);

  useEffect(() => {
    if (nodeParam && nodeParam !== selectedId && knowledgeNodes.some((node) => node.id === nodeParam)) {
      setSelectedId(nodeParam);
    }
  }, [nodeParam, selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('node', id);
        return next;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selected = knowledgeNodes.find((node) => node.id === selectedId) ?? knowledgeNodes[0];
  const diagram = selected.diagramId ? knowledgeDiagrams[selected.diagramId] : undefined;
  const level = levelMeta[selected.level];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return knowledgeNodes.filter((node) =>
      [node.title, node.summary, node.tags.join(' ')].join(' ').toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, KnowledgeNode[]>();
    filtered.forEach((node) => {
      const key = moduleOf(node);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(node);
    });
    return moduleOrder.filter((key) => map.has(key)).map((key) => ({ module: key, nodes: map.get(key)! }));
  }, [filtered]);

  const toc = useMemo(() => {
    const sections: Array<{ id: string; label: string }> = [{ id: 'sec-definition', label: 'Определение' }];
    if (selected.whyItMatters) sections.push({ id: 'sec-why', label: 'Зачем аналитику' });
    if (selected.walkthrough?.length) sections.push({ id: 'sec-walkthrough', label: 'Разбор по шагам' });
    if (diagram) sections.push({ id: 'sec-diagram', label: 'Схема' });
    sections.push({ id: 'sec-examples', label: 'Примеры и ошибки' });
    if (selected.related.length) sections.push({ id: 'sec-related', label: 'Связанные понятия' });
    return sections;
  }, [selected, diagram]);

  const relatedTasks = tasks.filter((task) => task.relatedKnowledgeIds.includes(selected.id)).slice(0, 6);
  const groupedRelations = selected.related
    .map((relation) => ({ ...relation, node: knowledgeNodes.find((node) => node.id === relation.id) }))
    .filter((relation) => relation.node);

  return (
    <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_212px]">
      {/* Колонка 1 — навигация по темам, сгруппированная по модулям */}
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-auto lg:pr-1">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 shadow-panel backdrop-blur-md">
          <label className="relative block">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              className="w-full rounded-xl border border-white/10 bg-ink py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-electric"
              placeholder="Поиск темы…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="mt-3 space-y-4">
            {grouped.map((group) => (
              <div key={group.module}>
                <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {group.module}
                </div>
                <div className="space-y-0.5">
                  {group.nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => select(node.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                        selectedId === node.id
                          ? 'bg-electric/15 font-semibold text-electric'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ background: levelMeta[node.level]?.color }}
                      />
                      <span className="truncate">{node.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Колонка 2 — статья */}
      <article className="min-w-0">
        <Panel className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-[68ch]">
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              <span>База знаний</span>
              <span>·</span>
              <span>{moduleOf(selected)}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{selected.title}</h1>
              <button
                aria-label="В избранное"
                className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-amber transition hover:bg-white/[0.12]"
              >
                <Star size={16} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium" style={{ color: level?.color }}>
                  {level?.label}
                </span>
                <span className="flex gap-0.5">
                  {[1, 2, 3].map((dot) => (
                    <span
                      key={dot}
                      className="size-1.5 rounded-full"
                      style={{ background: dot <= (level?.dots ?? 0) ? level?.color : 'rgba(255,255,255,0.15)' }}
                    />
                  ))}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} /> {readingMinutes(selected)} мин чтения
              </span>
              <span className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-slate-300">
                    #{tag}
                  </span>
                ))}
              </span>
            </div>

            <p className="mt-5 border-l-2 border-electric/40 pl-4 text-base font-medium leading-7 text-slate-100">
              {selected.summary}
            </p>

            <section id="sec-definition" className="mt-8 scroll-mt-24">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
                <BookOpen size={18} className="text-electric" /> Определение
              </h2>
              <p className="text-[15px] leading-7 text-slate-300">
                <GlossaryText>{selected.fullText}</GlossaryText>
              </p>
            </section>

            {selected.whyItMatters && (
              <section id="sec-why" className="mt-7 scroll-mt-24 rounded-2xl border border-electric/15 bg-electric/[0.06] p-4">
                <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-electric">
                  <Sparkles size={17} /> Зачем аналитику
                </h2>
                <p className="text-[15px] leading-7 text-slate-200">
                  <GlossaryText>{selected.whyItMatters}</GlossaryText>
                </p>
              </section>
            )}

            {selected.walkthrough && selected.walkthrough.length > 0 && (
              <section id="sec-walkthrough" className="mt-8 scroll-mt-24">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                  <ListChecks size={18} className="text-success" /> Разбор по шагам
                </h2>
                <ol className="space-y-3">
                  {selected.walkthrough.map((step, index) => (
                    <li key={step} className="flex gap-3 text-[15px] leading-7 text-slate-300">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-electric/15 text-xs font-bold text-electric">
                        {index + 1}
                      </span>
                      <span>
                        <GlossaryText>{step}</GlossaryText>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {diagram && (
              <section id="sec-diagram" className="mt-8 scroll-mt-24">
                <figure className="rounded-2xl border border-white/[0.08] bg-ink/50 p-4">
                  <diagram.Component />
                  <figcaption className="mt-2 text-center text-xs text-slate-500">{diagram.title}</figcaption>
                </figure>
              </section>
            )}

            <section id="sec-examples" className="mt-8 grid scroll-mt-24 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-success/15 bg-success/[0.05] p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-success">
                  <Lightbulb size={16} /> Примеры
                </h2>
                <ul className="space-y-2 text-[14px] leading-6 text-slate-300">
                  {selected.examples.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-danger/15 bg-danger/[0.05] p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-danger">
                  <AlertTriangle size={16} /> Антипримеры
                </h2>
                <ul className="space-y-2 text-[14px] leading-6 text-slate-300">
                  {selected.antiExamples.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {groupedRelations.length > 0 && (
              <section id="sec-related" className="mt-8 scroll-mt-24">
                <h2 className="mb-3 text-lg font-bold text-white">Связанные понятия</h2>
                <div className="flex flex-wrap gap-2">
                  {groupedRelations.map((relation) => (
                    <button
                      key={`${relation.id}-${relation.relation}`}
                      onClick={() => select(relation.id)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/25 hover:text-white"
                    >
                      <span className="size-2 rounded-full" style={{ background: relationMeta[relation.relation]?.color }} />
                      <span className="text-xs text-slate-500 group-hover:text-slate-300">
                        {relationMeta[relation.relation]?.label}:
                      </span>
                      {relation.node?.title}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {relatedTasks.length > 0 && (
              <section className="mt-7">
                <h2 className="mb-3 text-sm font-bold text-electric">Потренировать на задачах</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedTasks.map((task) => (
                    <Link
                      key={task.id}
                      to="/trainer"
                      className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-electric hover:text-electric"
                    >
                      {task.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {selected.selfCheck && <SelfCheck key={selected.id} data={selected.selfCheck} />}
          </div>
        </Panel>

        {/* Карта знаний — сворачиваемая панель под статьёй */}
        <Panel className="mt-5">
          <button
            onClick={() => setGraphOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="flex items-center gap-2 text-base font-semibold text-slate-50">
              <Network size={18} className="text-electric" /> Карта знаний
            </span>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${graphOpen ? 'rotate-180' : ''}`} />
          </button>
          {graphOpen && (
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                {Object.entries(relationMeta).map(([key, meta]) => (
                  <span key={key} className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink/60 p-2">
                <ConceptMindmap node={selected} onSelect={select} />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {groupedRelations.length
                  ? 'В центре — выбранное понятие, вокруг — его прямые связи. Кликни ветку, чтобы перейти.'
                  : 'У этого понятия пока нет описанных связей.'}
              </div>
            </div>
          )}
        </Panel>
      </article>

      {/* Колонка 3 — содержание статьи (только широкий экран) */}
      <aside className="hidden xl:block">
        <div className="sticky top-20 self-start">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">На этой странице</div>
          <nav className="space-y-1 border-l border-white/10">
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="-ml-px block w-full border-l-2 border-transparent py-1 pl-3 text-left text-sm text-slate-400 transition hover:border-electric hover:text-electric"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
