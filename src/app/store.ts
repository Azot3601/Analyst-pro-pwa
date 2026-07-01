import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

type AppState = {
  theme: Theme;
  activeSkill: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  volume: number;
  setTheme: (theme: Theme) => void;
  setActiveSkill: (skill: string) => void;
  setSoundEnabled: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setVolume: (value: number) => void;
};

// Настройки сохраняются в localStorage (тема теперь тоже переживает перезагрузку).
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      activeSkill: 'SQL',
      soundEnabled: true,
      reducedMotion: false,
      volume: 0.7,
      setTheme: (theme) => set({ theme }),
      setActiveSkill: (activeSkill) => set({ activeSkill }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setVolume: (volume) => set({ volume })
    }),
    {
      name: 'analyst-pro-prefs',
      partialize: (state) => ({
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        reducedMotion: state.reducedMotion,
        volume: state.volume
      })
    }
  )
);
