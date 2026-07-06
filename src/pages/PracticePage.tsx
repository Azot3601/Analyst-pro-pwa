import { AlertTriangle, CalendarClock, CheckCircle2, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sqlQuestLessons } from '../data/sqlQuest';
import type { UserProgress } from '../entities/schemas';
import { defaultProgress, getProgress } from '../features/progress/progressDb';
import {
  conceptLabel,
  dueConcepts,
  nextDueAt,
  MAX_STRENGTH,
  sqlConceptId,
  type DueConcept
} from '../features/practice/reviewEngine';
import { Panel } from '../shared/ui/Panel';

// «Практика» — очередь интервального повторения: что пора освежить, чтобы
// навык не утёк. Сначала слабые зоны, затем прочие созревшие концепты.

// Подпись концепта берём из общего conceptLabel; здесь добавляем только маршрут,
// куда ведёт карточка (deep-link в нужный трек тренажёра).
function describeConcept(conceptId: string): { label: string; to: string } {
  const label = conceptLabel(conceptId);
  if (conceptId.startsWith('sql:')) {
    const lesson = sqlQuestLessons.find((l) => sqlConceptId(l.sqlConcept) === conceptId);
    return { label, to: lesson ? `/trainer?domain=sql&lesson=${lesson.id}` : '/trainer?domain=sql' };
  }
  if (conceptId.startsWith('api:')) {
    return { label, to: `/trainer?domain=${conceptId.slice(4)}` };
  }
  if (conceptId.startsWith('req:')) {
    return { label, to: '/trainer?domain=requirements' };
  }
  if (conceptId.startsWith('erd:')) {
    return { label, to: '/trainer?domain=erd' };
  }
  if (conceptId.startsWith('bpmn:')) {
    return { label, to: '/trainer?domain=bpmn' };
  }
  return { label, to: '/trainer' };
}

function StrengthBar({ strength }: { strength: number }) {
  return (
    <span className="flex gap-0.5" title={`Ступень ${strength} из ${MAX_STRENGTH}`}>
      {Array.from({ length: MAX_STRENGTH + 1 }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-3 rounded-full"
          style={{ background: i <= strength ? '#57d9a3' : 'rgba(255,255,255,0.14)' }}
        />
      ))}
    </span>
  );
}

function DueCard({ item }: { item: DueConcept }) {
  const { label, to } = describeConcept(item.conceptId);
  return (
    <Link
      to={to}
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:bg-white/[0.06] ${
        item.weak ? 'border-danger/30 bg-danger/[0.06]' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          {item.weak && <AlertTriangle size={14} className="shrink-0 text-danger" />}
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {item.weak ? 'слабая зона — повтори в первую очередь' : 'пора освежить'}
        </div>
      </div>
      <StrengthBar strength={item.state.strength} />
    </Link>
  );
}

export function PracticePage() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    void getProgress().then(setProgress).catch(() => setProgress(defaultProgress));
  }, []);

  const reviews = progress.reviews ?? {};
  const due = dueConcepts(reviews);
  const total = Object.keys(reviews).length;
  const upcoming = nextDueAt(reviews);
  const mastered = Object.values(reviews).filter((s) => s.strength >= 4).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Panel>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-electric/15 text-electric">
            <Repeat size={20} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Практика — повторение</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Навык живёт, пока его повторяешь. Здесь копятся концепты, которые пора освежить: сначала слабые зоны,
              затем те, что созрели по расписанию (1д → 3д → 7д → 16д → 35д).
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['К повторению', String(due.length)],
            ['Концептов изучается', String(total)],
            ['Закреплено прочно', String(mastered)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-display text-2xl font-bold text-electric">{value}</div>
              <div className="mt-0.5 text-[11px] text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Пора повторить">
        {due.length > 0 ? (
          <div className="space-y-2">
            {due.map((item) => (
              <DueCard key={item.conceptId} item={item} />
            ))}
          </div>
        ) : total > 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/[0.06] p-4 text-sm text-slate-200">
            <CheckCircle2 size={18} className="shrink-0 text-success" />
            <div>
              Всё повторено — отличная работа.
              {upcoming && (
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarClock size={13} /> Следующее повторение:{' '}
                  {new Date(upcoming).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-400">
            Пока пусто. Решай задачи в{' '}
            <Link to="/trainer" className="font-semibold text-electric underline decoration-dotted">
              тренажёре
            </Link>{' '}
            — каждый решённый концепт попадёт сюда и вернётся по расписанию, чтобы закрепиться надолго.
          </p>
        )}
      </Panel>
    </div>
  );
}
