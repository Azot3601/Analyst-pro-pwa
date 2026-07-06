import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import { defectCategories, reservationDefects, type DefectCategory } from '../../../data/cases/reservationCase/defects';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { checkDefect, type DefectCheck } from '../../../shared/lib/defectChecker';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const DEFECT_TASK_ID = 'defects-reservation';

export function DefectWorkspace() {
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState<DefectCategory | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<DefectCheck | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const exercise = reservationDefects[index];

  useEffect(() => {
    setCategory(null);
    setAnswer('');
    setResult(null);
  }, [index]);

  const check = () => {
    const outcome = checkDefect(exercise, category, answer);
    setResult(outcome);
    if (outcome.ok) {
      playSuccess();
      const nextSolved = new Set(solved).add(exercise.id);
      setSolved(nextSolved);
      void recordReview('defect:reservation', true).catch(() => undefined);
      if (nextSolved.size === reservationDefects.length) {
        void markTaskSolved(DEFECT_TASK_ID).catch(() => undefined);
      }
    } else {
      playError();
      void recordReview('defect:reservation', false).catch(() => undefined);
    }
  };

  const allDone = solved.size === reservationDefects.length;

  return (
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1fr_260px]">
      <div className="space-y-3">
        <Panel title={`Найди дефект (${index + 1}/${reservationDefects.length})`}>
          <div className="flex items-start gap-2 rounded-lg border border-amber/25 bg-amber/[0.06] p-3 text-sm leading-6 text-slate-100">
            <Search size={16} className="mt-0.5 shrink-0 text-amber" />
            {exercise.artifact}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Тип дефекта</div>
            <div className="grid grid-cols-2 gap-2">
              {defectCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    category === cat.id ? 'border-electric bg-electric/10 text-electric' : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]'
                  }`}
                  title={cat.hint}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">В чём проблема</div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none focus:border-electric/40"
              placeholder="назови суть дефекта своими словами"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <Button onClick={check}>
              <AlertTriangle size={15} /> Проверить
            </Button>
            {result?.ok && index < reservationDefects.length - 1 && (
              <Button variant="soft" onClick={() => setIndex(index + 1)}>
                Следующий <ArrowRight size={15} />
              </Button>
            )}
          </div>

          {result && (
            <div className={`mt-3 rounded-lg border p-2.5 text-xs ${result.ok ? 'border-success/30 bg-success/[0.06] text-success' : 'border-danger/30 bg-danger/[0.06] text-danger'}`}>
              <div className="font-semibold">{result.message}</div>
              {result.ok && <div className="mt-1 text-slate-300">{exercise.explanation}</div>}
            </div>
          )}
        </Panel>

        {allDone && (
          <Panel className="border-success/30 bg-success/[0.06]">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 size={16} /> Все дефекты разобраны. Категории: неатомарность, неполнота, противоречивость, невалидируемость.
            </div>
            <Button variant="soft" className="mt-2" onClick={() => { setIndex(0); setSolved(new Set()); }}>
              <RotateCcw size={15} /> Пройти заново
            </Button>
          </Panel>
        )}
      </div>

      <div className="space-y-3">
        <Panel title="Прогресс">
          <div className="space-y-1.5 text-xs">
            {reservationDefects.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setIndex(i)}
                className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left ${
                  i === index ? 'border-electric bg-electric/10 text-electric' : 'border-white/10 bg-white/[0.03] text-slate-300'
                }`}
              >
                <span>Артефакт {i + 1}</span>
                {solved.has(d.id) && <CheckCircle2 size={14} className="text-success" />}
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-slate-500">Категории дефектов — по мотивам Вигерса/BABOK.</div>
        </Panel>
      </div>
    </div>
  );
}
