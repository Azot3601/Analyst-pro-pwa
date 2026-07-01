import { Download, Moon, Sun, Sparkles, Volume2, VolumeX, WifiOff, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '../app/store';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';
import { playSuccess } from '../shared/lib/audio';

function ToggleCard({
  active,
  onToggle,
  icon,
  title,
  hint
}: {
  active: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
    >
      <div>
        <div className="mb-3 text-electric">{icon}</div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{hint}</div>
      </div>
      <span
        className={`mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
          active ? 'bg-electric/80' : 'bg-white/15'
        }`}
      >
        <span className={`size-5 rounded-full bg-white shadow transition ${active ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

export function SettingsPage() {
  const {
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    reducedMotion,
    setReducedMotion,
    volume,
    setVolume
  } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <div className="max-w-4xl space-y-4">
      <Panel title="Настройки">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleCard
            active={isDark}
            onToggle={() => setTheme(isDark ? 'light' : 'dark')}
            icon={isDark ? <Moon /> : <Sun />}
            title="Тема"
            hint={`Сейчас активна: ${isDark ? 'тёмная' : 'светлая'}.`}
          />
          <ToggleCard
            active={soundEnabled}
            onToggle={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSuccess();
            }}
            icon={soundEnabled ? <Volume2 /> : <VolumeX />}
            title="Звуки"
            hint="Мягкие сигналы при успехе, ошибке и подсказке."
          />
          <ToggleCard
            active={reducedMotion}
            onToggle={() => setReducedMotion(!reducedMotion)}
            icon={<Wind />}
            title="Меньше анимаций"
            hint="Спокойный режим без декоративного движения."
          />
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <Sparkles className="mb-3 text-amber" />
            <div className="font-semibold">Громкость</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              disabled={!soundEnabled}
              onChange={(event) => setVolume(Number(event.target.value))}
              onMouseUp={() => soundEnabled && playSuccess()}
              className="mt-3 w-full accent-electric disabled:opacity-40"
            />
            <div className="mt-1 text-sm text-slate-400">{Math.round(volume * 100)}%</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <WifiOff className="mb-3 text-success" />
            <div className="font-semibold">Offline-first</div>
            <div className="mt-1 text-sm text-slate-400">Материалы и прогресс рассчитаны на локальную работу.</div>
          </div>
        </div>
      </Panel>

      <Panel title="Установка PWA">
        <p className="mb-4 text-sm leading-6 text-slate-400">
          Используйте системную кнопку браузера «Установить приложение». Service worker обновляется автоматически.
        </p>
        <Button variant="soft">
          <Download size={16} /> Проверить установку в браузере
        </Button>
      </Panel>
    </div>
  );
}
