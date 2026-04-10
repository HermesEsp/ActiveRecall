import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations } from '../../translations';

export type Theme = 'system' | 'light' | 'dark';

export interface UserProfile {
  name: string;
  email: string;
  streak: number;
  language: Language;
  theme: Theme;
}

interface UserState {
  user: UserProfile;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user: Partial<UserProfile>) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

const getInitialLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const systemLang = navigator.language.split('-')[0];
  return (systemLang === 'pt' ? 'pt' : 'en') as Language;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        name: 'User',
        email: 'user@example.com',
        streak: 0,
        language: getInitialLanguage(),
        theme: 'system'
      },
      setLanguage: (lang) => set((state) => ({ 
        user: { ...state.user, language: lang }
      })),
      setTheme: (theme) => {
        set((state) => ({ user: { ...state.user, theme } }));
        applyTheme(theme);
      },
      setUser: (updates) => set((state) => ({ 
        user: { ...state.user, ...updates } 
      })),
      incrementStreak: () => set((state) => ({
        user: { ...state.user, streak: state.user.streak + 1 }
      })),
      resetStreak: () => set((state) => ({
        user: { ...state.user, streak: 0 }
      })),
    }),
    {
      name: 'activerecall-user-storage',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.user.theme);
      }
    }
  )
);

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useUserStore.getState().user.theme === 'system') applyTheme('system');
  });
}
