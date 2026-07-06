import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ApiTaskDomain } from '../features/progress/progressDb';

// Каждый воркспейс — свой чанк: sql.js едет только с SQL Quest, CodeMirror —
// только с редакторными доменами.
const SqlQuestWorkspace = lazy(() =>
  import('../features/trainer/SqlQuestWorkspace').then((m) => ({ default: m.SqlQuestWorkspace }))
);
const ApiQuestWorkspace = lazy(() =>
  import('../features/trainer/api/ApiQuestWorkspace').then((m) => ({ default: m.ApiQuestWorkspace }))
);
const RequirementsQuestWorkspace = lazy(() =>
  import('../features/trainer/requirements/RequirementsQuestWorkspace').then((m) => ({
    default: m.RequirementsQuestWorkspace
  }))
);
const ErdWorkspace = lazy(() => import('../features/trainer/erd/ErdWorkspace').then((m) => ({ default: m.ErdWorkspace })));

type TrainerDomain = 'sql' | 'requirements' | 'erd' | ApiTaskDomain;

const domains: Array<{ id: TrainerDomain; label: string }> = [
  { id: 'requirements', label: 'Требования' },
  { id: 'sql', label: 'SQL Quest' },
  { id: 'erd', label: 'ERD' },
  { id: 'rest', label: 'REST API' },
  { id: 'json', label: 'JSON' },
  { id: 'openapi', label: 'OpenAPI' },
  { id: 'integration', label: 'Интеграции' }
];

export function TrainerPage() {
  // Deep-link из «Практики»: /trainer?domain=sql&lesson=q07
  const [params] = useSearchParams();
  const domainParam = params.get('domain');
  const lessonParam = params.get('lesson') ?? undefined;
  const initialDomain = domains.some((item) => item.id === domainParam) ? (domainParam as TrainerDomain) : 'sql';
  const [domain, setDomain] = useState<TrainerDomain>(initialDomain);
  const selectRelativeDomain = (offset: number) => {
    const current = domains.findIndex((item) => item.id === domain);
    setDomain(domains[(current + offset + domains.length) % domains.length].id);
  };

  return (
    <div className="space-y-3">
      <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <div
          role="tablist"
          aria-label="Разделы тренажёра"
          className="grid min-w-[760px] grid-cols-7 gap-2 rounded-lg border border-white/10 bg-white/[0.055] p-2"
        >
          {domains.map((item) => (
            <button
              key={item.id}
              role="tab"
              id={`trainer-tab-${item.id}`}
              aria-controls="trainer-active-panel"
              aria-selected={domain === item.id}
              tabIndex={domain === item.id ? 0 : -1}
              className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                domain === item.id
                  ? 'border-electric bg-electric/10 text-electric'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
              }`}
              onClick={() => setDomain(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') selectRelativeDomain(1);
                if (event.key === 'ArrowLeft') selectRelativeDomain(-1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="trainer-active-panel"
        role="tabpanel"
        aria-labelledby={`trainer-tab-${domain}`}
      >
        <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Загрузка модуля…</div>}>
          {domain === 'sql' ? (
            <SqlQuestWorkspace initialLessonId={lessonParam} />
          ) : domain === 'requirements' ? (
            <RequirementsQuestWorkspace />
          ) : domain === 'erd' ? (
            <ErdWorkspace />
          ) : (
            <ApiQuestWorkspace domain={domain} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
