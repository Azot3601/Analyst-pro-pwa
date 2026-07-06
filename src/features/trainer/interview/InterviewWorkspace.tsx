import { useMemo, useState } from 'react';
import { CheckCircle2, MessageSquare, RotateCcw, TriangleAlert } from 'lucide-react';
import { reservationInterview } from '../../../data/cases/reservationCase/interviewScript';
import { markTaskSolved, recordReview } from '../../progress/progressDb';
import { summarizeInterview } from '../../../shared/lib/interviewChecker';
import { playError, playSuccess } from '../../../shared/lib/audio';
import { Button } from '../../../shared/ui/Button';
import { Panel } from '../../../shared/ui/Panel';

const INTERVIEW_TASK_ID = 'interview-reservation';

export function InterviewWorkspace() {
  const [nodeId, setNodeId] = useState<string | null>(reservationInterview.startNodeId);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [asked, setAsked] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [finished, setFinished] = useState(false);

  const node = useMemo(() => reservationInterview.nodes.find((n) => n.id === nodeId), [nodeId]);

  const summary = useMemo(
    () => (finished ? summarizeInterview(reservationInterview, unlocked, asked) : null),
    [finished, unlocked, asked]
  );

  const pick = (optionId: string) => {
    if (!node) return;
    const option = node.questionOptions.find((o) => o.id === optionId);
    if (!option) return;
    const nextUnlocked = new Set(unlocked);
    option.unlocksRequirementIds.forEach((id) => nextUnlocked.add(id));
    setUnlocked(nextUnlocked);
    setAsked((prev) => [...prev, option.isGoodQuestion]);
    setFeedback({ good: option.isGoodQuestion, text: option.feedback });
    if (option.nextNodeId) {
      setNodeId(option.nextNodeId);
    } else {
      setFinished(true);
      const result = summarizeInterview(reservationInterview, nextUnlocked, [...asked, option.isGoodQuestion]);
      if (result.ok) {
        playSuccess();
        void markTaskSolved(INTERVIEW_TASK_ID).catch(() => undefined);
        void recordReview('interview:reservation', true).catch(() => undefined);
      } else {
        playError();
        void recordReview('interview:reservation', false).catch(() => undefined);
      }
    }
  };

  const restart = () => {
    setNodeId(reservationInterview.startNodeId);
    setUnlocked(new Set());
    setAsked([]);
    setFeedback(null);
    setFinished(false);
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <Panel title="Интервью со стейкхолдером">
          <p className="text-sm leading-6 text-slate-400">{reservationInterview.task}</p>
        </Panel>

        {!finished && node && (
          <Panel>
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-mentor/20 bg-mentor/[0.06] p-3 text-sm leading-6 text-slate-100">
              <MessageSquare size={16} className="mt-0.5 shrink-0 text-mentor" />
              {node.speakerLine}
            </div>
            <div className="space-y-2">
              {node.questionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => pick(option.id)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-slate-200 transition hover:border-electric/40 hover:bg-electric/[0.06]"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {feedback && (
              <div className={`mt-3 rounded-lg border p-2.5 text-xs ${feedback.good ? 'border-success/30 bg-success/[0.06] text-success' : 'border-amber/30 bg-amber/[0.06] text-amber'}`}>
                {feedback.good ? 'Хороший вопрос. ' : 'Слабый вопрос. '}
                {feedback.text}
              </div>
            )}
          </Panel>
        )}

        {finished && summary && (
          <Panel className={summary.ok ? 'border-success/30 bg-success/[0.06]' : 'border-amber/30 bg-amber/[0.06]'}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {summary.ok ? (
                <>
                  <CheckCircle2 size={16} className="text-success" /> <span className="text-success">Все обязательные требования выявлены.</span>
                </>
              ) : (
                <>
                  <TriangleAlert size={16} className="text-amber" /> <span className="text-amber">Не все обязательные требования выявлены.</span>
                </>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="font-display text-xl font-bold text-electric">{summary.found.length}/{summary.total}</div>
                <div className="text-[11px] text-slate-400">требований выявлено</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="font-display text-xl font-bold text-electric">{summary.qualityPercent}%</div>
                <div className="text-[11px] text-slate-400">качество вопросов ({summary.goodQuestions}/{summary.goodQuestions + summary.badQuestions})</div>
              </div>
            </div>
            {summary.missed.length > 0 && (
              <div className="mt-3 text-xs">
                <div className="mb-1 font-semibold text-slate-300">Упущено:</div>
                <ul className="space-y-1">
                  {summary.missed.map((r) => (
                    <li key={r.id} className={r.priority === 'must' ? 'text-danger' : 'text-slate-400'}>
                      • {r.text} {r.priority === 'must' && <span className="text-[10px] uppercase">(must)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="soft" className="mt-3" onClick={restart}>
              <RotateCcw size={15} /> Пройти заново
            </Button>
          </Panel>
        )}
      </div>

      <div className="space-y-3">
        <Panel title="Зафиксированные требования">
          <div className="mb-2 text-xs text-slate-500">Выявляются по ходу интервью хорошими вопросами.</div>
          {unlocked.size === 0 ? (
            <p className="text-xs text-slate-500">Пока пусто — задавай открытые уточняющие вопросы.</p>
          ) : (
            <ul className="space-y-1.5 text-xs">
              {reservationInterview.requirements
                .filter((r) => unlocked.has(r.id))
                .map((r) => (
                  <li key={r.id} className="rounded-lg border border-success/20 bg-success/[0.05] p-2 text-slate-200">
                    <span className={`mr-1 rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${r.priority === 'must' ? 'bg-danger/20 text-danger' : 'bg-white/10 text-slate-400'}`}>
                      {r.priority}
                    </span>
                    {r.text}
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-3 text-[11px] text-slate-500">Вопросов задано: {asked.length}</div>
        </Panel>
      </div>
    </div>
  );
}
