import { ArrowRight, CheckCircle2, Megaphone, Network, Play, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasks } from '../data/tasks';
import { knowledgeNodes } from '../data/knowledge';
import { changelog, type ChangeTag } from '../data/changelog';
import { defaultProgress, getProgress } from '../features/progress/progressDb';
import { computeSkillLevels } from '../features/progress/skillLevels';
import type { UserProgress } from '../entities/schemas';
import { Panel } from '../shared/ui/Panel';
import { Button } from '../shared/ui/Button';

const tagStyle: Record<ChangeTag, string> = {
  Новое: 'bg-electric/15 text-electric',
  Улучшено: 'bg-success/15 text-success',
  Исправлено: 'bg-amber/15 text-amber'
};

function WhatsNew() {
  return (
    <Panel className="border-electric/15">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-electric/15 text-electric">
          <Megaphone size={16} />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-slate-50">Что нового</h2>
          <p className="text-xs text-slate-400">Последние изменения — жми, чтобы потыкать</p>
        </div>
      </div>
      <div className="space-y-4">
        {changelog.map((rel) => (
          <div key={rel.version}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">{rel.version}</span>
              <span className="text-xs font-semibold text-slate-200">{rel.title}</span>
            </div>
            <ul className="space-y-1">
              {rel.changes.map((c, i) => {
                const inner = (
                  <span className="flex items-start gap-2">
                    <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagStyle[c.tag]}`}>
                      {c.tag}
                    </span>
                    <span>{c.text}</span>
                  </span>
                );
                return (
                  <li key={i} className="text-sm leading-5 text-slate-300">
                    {c.to ? (
                      <Link
                        to={c.to}
                        className="group flex items-start justify-between gap-2 rounded-lg px-1 py-1 transition hover:bg-white/[0.05]"
                      >
                        {inner}
                        <ArrowRight size={14} className="mt-0.5 shrink-0 text-slate-500 group-hover:text-electric" />
                      </Link>
                    ) : (
                      <div className="px-1 py-1">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const skillTone: Record<string, string> = {
  SQL: 'bg-electric',
  REST: 'bg-mentor',
  JSON: 'bg-amber',
  OpenAPI: 'bg-mentor',
  Интеграции: 'bg-success',
  Требования: 'bg-danger'
};

export function HomePage() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    void getProgress().then(setProgress).catch(() => setProgress(defaultProgress));
  }, []);

  const skills = useMemo(() => computeSkillLevels(progress), [progress]);

  // Онбординг-маршрут: ведём новичка по шагам, отмечая пройденное по реальным данным.
  const path = useMemo(() => {
    const reqSolved = progress.solvedTaskIds.includes('req-01-classify');
    const sqlSolved = (progress.sqlQuest?.solvedSqlLessonIds ?? []).length > 0;
    const practiceStarted = Object.keys(progress.reviews ?? {}).length > 0;
    const started = sqlSolved || reqSolved || progress.solvedTaskIds.length > 0 || practiceStarted;
    const steps = [
      { title: 'Профессия', desc: 'Понять, чем занят аналитик и как системы общаются', to: '/profession', done: started },
      { title: 'Требования', desc: 'Разобрать первый бриф: требования против допущений', to: '/trainer?domain=requirements', done: reqSolved },
      { title: 'SQL с нуля', desc: 'Решить первую задачу — запрос к книге заказов', to: '/trainer?domain=sql', done: sqlSolved },
      { title: 'Практика', desc: 'Закрепить решённое интервальным повторением', to: '/practice', done: practiceStarted }
    ];
    const nextIndex = steps.findIndex((step) => !step.done);
    return { steps, nextIndex };
  }, [progress]);

  return (
    <div className="space-y-6">
      <WhatsNew />
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

      <Panel title="Маршрут обучения" className="border-electric/15">
        <p className="mb-4 text-sm text-slate-400">
          Не знаешь, с чего начать? Иди по шагам — приложение поведёт за руку. Пройденное отмечается автоматически.
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          {path.steps.map((step, index) => {
            const isNext = index === path.nextIndex;
            return (
              <Link
                key={step.title}
                to={step.to}
                className={`group relative rounded-xl border p-4 transition ${
                  step.done
                    ? 'border-success/25 bg-success/[0.06]'
                    : isNext
                      ? 'border-electric/40 bg-electric/[0.08] shadow-soft'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      step.done ? 'bg-success/20 text-success' : isNext ? 'bg-electric/20 text-electric' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={14} /> : index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                  {isNext && (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-electric">сейчас</span>
                  )}
                </div>
                <p className="text-xs leading-5 text-slate-400">{step.desc}</p>
                <ArrowRight
                  size={14}
                  className="mt-2 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-electric"
                />
              </Link>
            );
          })}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Карта навыков">
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.skill}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-100">{skill.skill}</span>
                  <span className="text-slate-400">
                    {skill.value}% <span className="text-slate-600">· {skill.solved}/{skill.total}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full ${skillTone[skill.skill] ?? 'bg-electric'}`}
                    style={{ width: `${skill.value}%` }}
                  />
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
