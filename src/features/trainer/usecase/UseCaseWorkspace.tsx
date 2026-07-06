import { useState } from 'react';
import { CheckCircle2, ListChecks, Plus, RotateCcw, X } from 'lucide-react';
import { reservationUseCase, reservationUseCaseTask } from '../../../data/cases/reservationCase/referenceUseCase';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { checkUseCaseCompleteness, type UseCaseDraft } from '../../../shared/lib/graphCheckers';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const USECASE_TASK_ID = 'usecase-reservation';

const inputClass =
  'w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none focus:border-electric/40';

// Редактируемый нумерованный список шагов (основной/альтернативный поток).
function StepList({ title, steps, onChange, ordered }: { title: string; steps: string[]; onChange: (next: string[]) => void; ordered?: boolean }) {
  const update = (index: number, value: string) => onChange(steps.map((s, i) => (i === index ? value : s)));
  const remove = (index: number) => onChange(steps.filter((_, i) => i !== index));
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="space-y-1.5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right text-xs text-slate-500">{ordered ? `${index + 1}.` : '•'}</span>
            <input value={step} onChange={(e) => update(index, e.target.value)} className={inputClass} placeholder="один глагол действия на шаг" />
            {steps.length > 1 && (
              <button onClick={() => remove(index)} className="shrink-0 text-slate-500 hover:text-danger" aria-label="Удалить шаг">
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...steps, ''])} className="mt-1.5 inline-flex items-center gap-1 text-xs text-electric hover:underline">
        <Plus size={13} /> шаг
      </button>
    </div>
  );
}

export function UseCaseWorkspace() {
  const [draft, setDraft] = useState<UseCaseDraft>({
    actor: '',
    precondition: '',
    mainFlow: ['', '', ''],
    alternateFlows: [''],
    postcondition: ''
  });
  const [result, setResult] = useState<ReturnType<typeof checkUseCaseCompleteness> | null>(null);
  const [solved, setSolved] = useState(false);

  const patch = (part: Partial<UseCaseDraft>) => setDraft((current) => ({ ...current, ...part }));

  const reset = () => {
    setDraft({ actor: '', precondition: '', mainFlow: ['', '', ''], alternateFlows: [''], postcondition: '' });
    setResult(null);
    setSolved(false);
  };

  const check = async () => {
    const outcome = checkUseCaseCompleteness(draft);
    setResult(outcome);
    if (outcome.ok) {
      playSuccess();
      setSolved(true);
      await markTaskSolved(USECASE_TASK_ID).catch(() => undefined);
      void recordReview('usecase:reservation', true).catch(() => undefined);
    } else {
      playError();
      void recordReview('usecase:reservation', false).catch(() => undefined);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel title="Use Case: оформить бронь столика">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Актор</div>
            <input value={draft.actor} onChange={(e) => patch({ actor: e.target.value })} className={inputClass} placeholder="кто получает ценность" />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Предусловие</div>
            <textarea value={draft.precondition} onChange={(e) => patch({ precondition: e.target.value })} rows={2} className={inputClass} placeholder="что верно до старта сценария" />
          </div>
          <StepList title="Основной поток" ordered steps={draft.mainFlow} onChange={(mainFlow) => patch({ mainFlow })} />
          <StepList title="Альтернативные / исключительные потоки" steps={draft.alternateFlows} onChange={(alternateFlows) => patch({ alternateFlows })} />
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Постусловие</div>
            <textarea value={draft.postcondition} onChange={(e) => patch({ postcondition: e.target.value })} rows={2} className={inputClass} placeholder="результат сценария" />
          </div>
          <div className="flex gap-2">
            <Button onClick={check}>
              <ListChecks size={15} /> Проверить
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw size={15} /> Сбросить
            </Button>
          </div>
        </div>
      </Panel>

      <div className="space-y-3">
        <Panel title="Задача">
          <p className="text-sm leading-6 text-slate-300">{reservationUseCaseTask}</p>
        </Panel>

        {result && !result.ok && (
          <Panel title="Что поправить">
            <ul className="space-y-2 text-xs">
              {result.diagnostics.map((d, index) => (
                <li key={index} className={`rounded-lg border p-2 ${d.severity === 'warning' ? 'border-amber/30 bg-amber/[0.06] text-amber' : 'border-danger/30 bg-danger/[0.06] text-danger'}`}>
                  <div className="font-semibold">{d.why}</div>
                  <div className="mt-0.5 text-slate-400">{d.fix}</div>
                  {d.details && (
                    <ul className="mt-1 list-disc pl-4 text-slate-400">
                      {d.details.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {solved && (
          <Panel className="border-success/30 bg-success/[0.06]">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 size={16} /> Use case полный.
            </div>
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-electric">Сравнить с эталоном</summary>
              <div className="mt-2 space-y-1 text-slate-300">
                <div><b>Актор:</b> {reservationUseCase.actor}</div>
                <div><b>Предусловие:</b> {reservationUseCase.precondition}</div>
                <div><b>Основной поток:</b> {reservationUseCase.mainFlow.join(' → ')}</div>
                <div><b>Альтернативы:</b> {reservationUseCase.alternateFlows.join('; ')}</div>
                <div><b>Постусловие:</b> {reservationUseCase.postcondition}</div>
              </div>
            </details>
          </Panel>
        )}
      </div>
    </div>
  );
}
