import { ArrowRight, CheckCircle2, Network, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tasks } from '../data/tasks';
import { knowledgeNodes } from '../data/knowledge';
import { Panel } from '../shared/ui/Panel';
import { Button } from '../shared/ui/Button';

const skills = [
  { title: 'SQL', progress: 42, tone: 'bg-electric' },
  { title: 'REST API', progress: 36, tone: 'bg-mentor' },
  { title: 'JSON Schema', progress: 28, tone: 'bg-amber' },
  { title: 'Интеграции', progress: 31, tone: 'bg-success' },
  { title: 'НФТ', progress: 18, tone: 'bg-danger' }
];

export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel className="overflow-hidden border-electric/15 bg-gradient-to-br from-electric/[0.14] via-mentor/[0.06] to-transparent p-0">
          <div className="relative p-6 md:p-8">
            <div className="absolute -right-10 top-0 h-56 w-56 rounded-full bg-electric/20 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-amber/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-electric/25 bg-electric/10 px-3 py-1 text-xs font-semibold text-electric">
                <Sparkles size={13} /> Без LLM API · работает офлайн
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                Тренажёр системного аналитика для практики, контрактов и данных
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Учитесь на локальных кейсах: SQL, REST API, JSON Schema, OpenAPI, интеграции,
                требования, SLA/SLO и трассировка. Всё работает без LLM API и без внешнего backend.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/trainer">
                  <Button>
                    <Play size={17} /> Открыть тренажёр
                  </Button>
                </Link>
                <Link to="/toolkit">
                  <Button variant="soft">
                    Перейти к инструментам <ArrowRight size={17} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Продолжить задачу">
          <div className="rounded-md border border-electric/20 bg-electric/10 p-4">
            <div className="text-sm text-electric">SQL: заказы без передачи в доставку</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Найдите оплаченные заказы без события accepted в доставке.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{tasks.length}</div>
              <div className="text-xs text-slate-400">задач</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{knowledgeNodes.length}</div>
              <div className="text-xs text-slate-400">понятий</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">PWA</div>
              <div className="text-xs text-slate-400">offline</div>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Карта навыков">
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.title}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-100">{skill.title}</span>
                  <span className="text-slate-400">{skill.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${skill.tone}`} style={{ width: `${skill.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Граф знаний">
          <div className="relative h-64 overflow-hidden rounded-lg border border-white/10 bg-ink/60">
            {['SQL', 'REST API', 'JSON Schema', 'OpenAPI', 'Идемпотентность', 'SLA/SLO'].map((node, index) => (
              <div
                key={node}
                className="absolute rounded-md border border-white/12 bg-panel px-3 py-2 text-xs text-slate-100 shadow-glow"
                style={{
                  left: `${12 + (index % 3) * 30}%`,
                  top: `${18 + Math.floor(index / 3) * 38}%`
                }}
              >
                {node}
              </div>
            ))}
            <Network className="absolute bottom-4 right-4 text-electric/70" />
          </div>
        </Panel>
      </section>

      <Panel title="Сегодня прокачиваем">
        <div className="grid gap-3 md:grid-cols-3">
          {['Разобрать payment callback', 'Проверить JSON Schema', 'Сформировать ADR'].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={16} className="text-amber" />
                {item}
              </div>
              <p className="text-sm text-slate-400">Короткая практика с подсказками и разбором решения.</p>
              <CheckCircle2 className="mt-4 text-success" size={18} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
