import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, BrainCircuit, Gauge, Home, Moon, Settings, TerminalSquare, Wrench } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { KnowledgePage } from '../pages/KnowledgePage';
import { HomePage } from '../pages/HomePage';
import { ProgressPage } from '../pages/ProgressPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ToolkitPage } from '../pages/ToolkitPage';
import { TrainerPage } from '../pages/TrainerPage';
import { useAppStore } from './store';

const nav = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/trainer', label: 'Тренажёр', icon: TerminalSquare },
  { to: '/knowledge', label: 'База знаний', icon: BrainCircuit },
  { to: '/toolkit', label: 'Инструментарий', icon: Wrench },
  { to: '/progress', label: 'Прогресс', icon: Gauge },
  { to: '/settings', label: 'Настройки', icon: Settings }
];

export function App() {
  const location = useLocation();
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={theme === 'light' ? 'light' : 'dark'}>
      <div className="min-h-screen bg-ink/95 text-slate-100">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-graphite/92 p-5 backdrop-blur lg:block">
          <NavLink to="/" className="mb-8 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-electric text-lg font-black text-ink">
              AP
            </div>
            <div>
              <div className="text-lg font-bold">Аналитик Pro</div>
              <div className="text-xs text-slate-400">Hard skills без LLM API</div>
            </div>
          </NavLink>

          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-white/[0.12] text-electric'
                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={16} className="text-amber" />
              Сегодня прокачиваем
            </div>
            <p className="text-sm text-slate-400">SQL + идемпотентность + модель ошибок API</p>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-ink/78 px-4 backdrop-blur lg:px-8">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-electric/80">PWA offline-first</div>
              <div className="text-sm text-slate-400">Локальное обучение системному анализу</div>
            </div>
            <button
              aria-label="Переключить тему"
              className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/[0.08] text-slate-200 transition hover:bg-white/[0.14]"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Moon size={18} />
            </button>
          </header>

          <main className="px-4 pb-24 pt-6 lg:px-8 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/trainer" element={<TrainerPage />} />
                  <Route path="/knowledge" element={<KnowledgePage />} />
                  <Route path="/toolkit" element={<ToolkitPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-white/10 bg-graphite/95 px-1 py-2 backdrop-blur lg:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] ${
                    isActive ? 'text-electric' : 'text-slate-400'
                  }`
                }
              >
                <Icon size={17} />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
