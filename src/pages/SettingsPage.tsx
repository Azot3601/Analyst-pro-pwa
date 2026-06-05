import { Download, Moon, WifiOff } from 'lucide-react';
import { useAppStore } from '../app/store';
import { Button } from '../shared/ui/Button';
import { Panel } from '../shared/ui/Panel';

export function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="max-w-4xl space-y-4">
      <Panel title="Настройки">
        <div className="grid gap-3 md:grid-cols-2">
          <button
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.08]"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Moon className="mb-3 text-electric" />
            <div className="font-semibold">Тема</div>
            <div className="mt-1 text-sm text-slate-400">Сейчас активна: {theme === 'dark' ? 'тёмная' : 'светлая'}.</div>
          </button>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
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
