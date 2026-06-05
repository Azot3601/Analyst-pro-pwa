import { Award, Flame, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { defaultProgress, getProgress } from '../features/progress/progressDb';
import type { UserProgress } from '../entities/schemas';
import { Panel } from '../shared/ui/Panel';

export function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    getProgress().then(setProgress).catch(() => setProgress(defaultProgress));
  }, []);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Panel>
          <div className="flex items-center gap-3">
            <Award className="text-electric" />
            <div>
              <div className="text-3xl font-bold">{progress.solvedTaskIds.length}</div>
              <div className="text-sm text-slate-400">решённых задач</div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-3">
            <Flame className="text-amber" />
            <div>
              <div className="text-3xl font-bold">{progress.streak}</div>
              <div className="text-sm text-slate-400">дней streak</div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-success" />
            <div>
              <div className="text-3xl font-bold">{progress.weakZones.length}</div>
              <div className="text-sm text-slate-400">слабые зоны</div>
            </div>
          </div>
        </Panel>
      </section>

      <Panel title="Уровень по навыкам">
        <div className="space-y-4">
          {Object.entries(progress.skillLevels).map(([skill, value]) => (
            <div key={skill}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{skill}</span>
                <span className="text-slate-400">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-electric" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Слабые зоны">
        <div className="flex flex-wrap gap-2">
          {progress.weakZones.map((zone) => (
            <span key={zone} className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {zone}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
