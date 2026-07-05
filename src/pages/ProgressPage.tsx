import { Award, BookOpen, Flame, ScrollText, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRankForXp, getSqlQuestChapter, sqlQuestLessons, sqlQuestRanks } from '../data/sqlQuest';
import { defaultProgress, defaultSqlQuestProgress, getProgress } from '../features/progress/progressDb';
import { computeSkillLevels } from '../features/progress/skillLevels';
import { conceptLabel } from '../features/practice/reviewEngine';
import type { UserProgress } from '../entities/schemas';
import { Panel } from '../shared/ui/Panel';

export function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  useEffect(() => {
    getProgress().then(setProgress).catch(() => setProgress(defaultProgress));
  }, []);

  const quest = progress.sqlQuest ?? defaultSqlQuestProgress;
  const skillLevels = useMemo(() => computeSkillLevels(progress), [progress]);
  const rank = getRankForXp(quest.xp);
  const currentChapter = getSqlQuestChapter(quest.currentChapterId);
  const recentLessons = quest.recentlySolvedLessonIds
    .map((lessonId) => sqlQuestLessons.find((lesson) => lesson.id === lessonId))
    .filter(Boolean);
  const topAttemptTopics = useMemo(
    () =>
      Object.entries(quest.attemptsByLessonId)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lessonId, attempts]) => ({
          attempts,
          lesson: sqlQuestLessons.find((lesson) => lesson.id === lessonId)
        }))
        .filter((item) => item.lesson),
    [quest.attemptsByLessonId]
  );

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-4">
        <Panel>
          <div className="flex items-center gap-3">
            <Award className="text-electric" />
            <div>
              <div className="text-2xl font-bold">{rank.title}</div>
              <div className="text-sm text-slate-400">текущий ранг</div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-3">
            <Flame className="text-amber" />
            <div>
              <div className="text-3xl font-bold">{quest.xp}</div>
              <div className="text-sm text-slate-400">XP в SQL Quest</div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-3">
            <ScrollText className="text-success" />
            <div>
              <div className="text-3xl font-bold">{quest.solvedSqlLessonIds.length}</div>
              <div className="text-sm text-slate-400">SQL-задач решено</div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center gap-3">
            <BookOpen className="text-mentor" />
            <div>
              <div className="text-lg font-bold">{currentChapter.title}</div>
              <div className="text-sm text-slate-400">текущая глава</div>
            </div>
          </div>
        </Panel>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="Открытые ранги">
          <div className="space-y-3">
            {sqlQuestRanks.map((item) => {
              const unlocked = quest.unlockedRankIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-md border p-3 ${
                    unlocked ? 'border-amber/30 bg-amber/10 text-slate-100' : 'border-white/10 bg-white/[0.03] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-xs">{item.minXp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Темы с большим числом попыток">
          {topAttemptTopics.length > 0 ? (
            <div className="space-y-3">
              {topAttemptTopics.map((item) => (
                <div key={item.lesson?.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{item.lesson?.sqlConcept}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.lesson?.title}</div>
                    </div>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
                      {item.attempts} попыток
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-400">
              Попытки появятся после первых запусков SQL-запросов.
            </p>
          )}
        </Panel>
      </div>

      <Panel title="Последние решённые SQL-задачи">
        {recentLessons.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentLessons.map((lesson) => (
              <Link
                key={lesson?.id}
                to="/trainer"
                className="rounded-md border border-success/25 bg-success/10 p-3 text-left transition hover:bg-success/15"
              >
                <div className="text-sm font-semibold text-success">{lesson?.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">{lesson?.sqlConcept}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-400">
            Решите первую задачу в SQL Quest, и здесь появится история прохождения.
          </p>
        )}
      </Panel>

      <Panel title="Общий прогресс по навыкам">
        <p className="mb-4 text-xs text-slate-500">Считается из фактически решённых задач: решено / всего по треку.</p>
        <div className="space-y-4">
          {skillLevels.map(({ skill, value, solved, total }) => (
            <div key={skill}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{skill}</span>
                <span className="text-slate-400">
                  {value}% <span className="text-slate-600">· {solved}/{total}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-electric" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Слабые зоны">
        {progress.weakZones.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {progress.weakZones.map((zone) => (
              <span key={zone} className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                <TrendingUp size={14} className="mr-1 inline" />
                {conceptLabel(zone)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-400">
            Слабых зон нет. Они появляются, когда концепт решён с ошибками — тогда он подсветится здесь и в «Практике».
          </p>
        )}
      </Panel>
    </div>
  );
}
