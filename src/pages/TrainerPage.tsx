import { useState } from 'react';
import { SqlQuestWorkspace } from '../features/trainer/SqlQuestWorkspace';
import { ApiQuestWorkspace } from '../features/trainer/api/ApiQuestWorkspace';
import type { ApiTaskDomain } from '../features/progress/progressDb';

type TrainerDomain = 'sql' | ApiTaskDomain;

const domains: Array<{ id: TrainerDomain; label: string }> = [
  { id: 'sql', label: 'SQL Quest' },
  { id: 'rest', label: 'REST API' },
  { id: 'json', label: 'JSON' },
  { id: 'openapi', label: 'OpenAPI' },
  { id: 'integration', label: 'Интеграции' }
];

export function TrainerPage() {
  const [domain, setDomain] = useState<TrainerDomain>('sql');
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
          className="grid min-w-[560px] grid-cols-5 gap-2 rounded-lg border border-white/10 bg-white/[0.055] p-2"
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
        {domain === 'sql' ? <SqlQuestWorkspace /> : <ApiQuestWorkspace domain={domain} />}
      </div>
    </div>
  );
}
