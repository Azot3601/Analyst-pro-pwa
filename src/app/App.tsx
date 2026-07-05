import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, BrainCircuit, Gauge, GraduationCap, Home, Moon, Repeat, Search, Settings, Sun, TerminalSquare, Trophy, Wrench } from 'lucide-react';
import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { CommandPalette } from '../features/search/CommandPalette';
import { useAppStore } from './store';

// Ленивые страницы: каждая — свой чанк. Тяжёлые зависимости (sql.js в SQL Quest
// и капстоуне, CodeMirror, reactflow) больше не сидят в общем бандле.
const named = <T extends string>(p: Promise<Record<T, ComponentType>>, key: T) =>
  p.then((m) => ({ default: m[key] }));
const HomePage = lazy(() => named(import('../pages/HomePage'), 'HomePage'));
const ProfessionPage = lazy(() => named(import('../pages/ProfessionPage'), 'ProfessionPage'));
const TrainerPage = lazy(() => named(import('../pages/TrainerPage'), 'TrainerPage'));
const CapstonePage = lazy(() => named(import('../pages/CapstonePage'), 'CapstonePage'));
const PracticePage = lazy(() => named(import('../pages/PracticePage'), 'PracticePage'));
const KnowledgePage = lazy(() => named(import('../pages/KnowledgePage'), 'KnowledgePage'));
const ToolkitPage = lazy(() => named(import('../pages/ToolkitPage'), 'ToolkitPage'));
const ProgressPage = lazy(() => named(import('../pages/ProgressPage'), 'ProgressPage'));
const SettingsPage = lazy(() => named(import('../pages/SettingsPage'), 'SettingsPage'));

const nav = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/profession', label: 'Профессия', icon: GraduationCap },
  { to: '/trainer', label: 'Тренажёр', icon: TerminalSquare },
  { to: '/capstone', label: 'Капстоун', icon: Trophy },
  { to: '/practice', label: 'Практика', icon: Repeat },
  { to: '/knowledge', label: 'База знаний', icon: BrainCircuit },
  { to: '/toolkit', label: 'Инструментарий', icon: Wrench },
  { to: '/progress', label: 'Прогресс', icon: Gauge },
  { to: '/settings', label: 'Настройки', icon: Settings }
];

export function App() {
  const location = useLocation();
  const { theme, setTheme } = useAppStore();
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  return (
    <div className={isLight ? 'light' : 'dark'}>
      <div className="min-h-screen text-slate-100">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/[0.06] bg-graphite/70 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <NavLink to="/" className="mb-9 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-electric to-mentor text-lg font-black text-ink shadow-lift">
              P
            </div>
            <div>
              <div className="permalith text-2xl" data-text="Permalith">
                Permalith
              </div>
              <div className="text-xs text-slate-400">Тренажёр системного аналитика</div>
            </div>
          </NavLink>

          <nav className="space-y-1.5">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-electric/15 text-electric shadow-soft ring-1 ring-electric/25'
                        : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-electric' : 'text-slate-400 group-hover:text-white'} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-gradient-to-br from-electric/[0.12] to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={16} className="text-amber" />
              Сегодня прокачиваем
            </div>
            <p className="text-sm text-slate-400">SQL · идемпотентность · модель ошибок API</p>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.06] bg-ink/70 px-4 backdrop-blur-xl lg:px-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-electric/80">
                PWA · offline-first
              </div>
              <div className="text-sm text-slate-400">Локальное обучение системному анализу</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Поиск (Ctrl+K)"
                className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 text-slate-300 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.12]"
                onClick={() => window.dispatchEvent(new Event('permalith:search'))}
              >
                <Search size={16} />
                <span className="hidden text-sm text-slate-400 sm:inline">Поиск</span>
                <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-slate-500 md:inline">
                  Ctrl K
                </kbd>
              </button>
              <button
                aria-label="Переключить тему"
                className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.12]"
                onClick={() => setTheme(isLight ? 'dark' : 'light')}
              >
                {isLight ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1640px] px-4 pb-24 pt-6 lg:px-10 lg:pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Загрузка…</div>}>
                  <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profession" element={<ProfessionPage />} />
                    <Route path="/trainer" element={<TrainerPage />} />
                    <Route path="/capstone" element={<CapstonePage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/knowledge" element={<KnowledgePage />} />
                    <Route path="/toolkit" element={<ToolkitPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-9 gap-1 border-t border-white/[0.06] bg-graphite/85 px-2 py-2 backdrop-blur-xl lg:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors ${
                    isActive ? 'bg-electric/15 text-electric' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <CommandPalette />
      </div>
    </div>
  );
}
