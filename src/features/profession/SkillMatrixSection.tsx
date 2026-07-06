import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid3x3 } from 'lucide-react';
import type { UserProgress } from '../../entities/schemas';
import { defaultProgress, getProgress } from '../progress/progressDb';
import { computeSkillMatrix } from '../progress/skillMatrix';

// Секция «Матрица навыков (BABOK)» для страницы Профессии. Агрегирует прогресс
// по областям знаний — видно, где закрыто, а где пробел.

export function SkillMatrixSection() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    void getProgress().then(setProgress).catch(() => setProgress(defaultProgress));
  }, []);

  const matrix = useMemo(() => computeSkillMatrix(progress), [progress]);

  return (
    <section className="rounded-2xl border border-electric/15 bg-white/[0.02] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Grid3x3 size={18} className="text-electric" />
        <h2 className="font-display text-lg font-bold text-white">Матрица навыков (BABOK)</h2>
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Твой прогресс по областям знаний BABOK. Считается из решённых задач тренажёра — видно, где сильно, а где пробел.
      </p>
      <div className="space-y-4">
        {matrix.map((area) => (
          <div key={area.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-100">{area.label}</span>
              <span className="text-slate-400">{area.percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-electric" style={{ width: `${area.percent}%` }} />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {area.modules.map((m) => (
                <span
                  key={m.id}
                  className={`rounded px-1.5 py-0.5 text-[10px] ${m.percent > 0 ? 'bg-success/15 text-success' : 'bg-white/[0.06] text-slate-500'}`}
                >
                  {m.label} {m.percent}%
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link to="/trainer" className="mt-4 inline-block text-sm font-semibold text-electric hover:underline">
        Закрыть пробелы в тренажёре →
      </Link>
    </section>
  );
}
