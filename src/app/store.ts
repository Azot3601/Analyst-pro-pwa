import { create } from 'zustand';

type Theme = 'dark' | 'light';

type AppState = {
  theme: Theme;
  activeSkill: string;
  setTheme: (theme: Theme) => void;
  setActiveSkill: (skill: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  activeSkill: 'SQL',
  setTheme: (theme) => set({ theme }),
  setActiveSkill: (activeSkill) => set({ activeSkill })
}));
