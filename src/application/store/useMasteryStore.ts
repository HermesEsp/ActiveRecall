import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flashcard, MasteryLevel, FlashcardType } from '../../domain/entities/Flashcard';
import { StudyLog } from '../../domain/entities/StudyLog';
import { translations, Language } from '../../translations';
import { Flashcard } from '../../domain/entities/Flashcard';

export function getDefaultCards(lang: Language): Flashcard[] {
  return translations[lang].defaultCards.map((card, i) => ({
    id: `default-${i + 1}`,
    front: card.front,
    back: card.back,
    category: card.category,
    masteryLevel: 0 as const,
    lastReviewedAt: null,
    nextReviewAt: null,
    type: card.type as 'standard' | 'cloze',
  }));
}

function applyTheme(theme: 'system' | 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export type Theme = 'system' | 'light' | 'dark';

interface MasteryState {
  cards: Flashcard[];
  language: Language;
  theme: Theme;
  streak: number;
  lastStudyDate: string | null;
  studyHistory: StudyLog[];
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  t: typeof translations.en;
  addCard: (front: string, back: string, category: string, type?: FlashcardType) => void;
  updateCard: (id: string, front: string, back: string, category: string, type?: FlashcardType) => void;
  deleteCard: (id: string) => void;
  updateMastery: (cardId: string, success: boolean) => void;
  getStudyCards: (category?: string) => Flashcard[];
  getCategories: () => string[];
}

const MASTERY_INTERVALS: Record<MasteryLevel, number> = {
  0: 0,
  1: 1 * 24 * 60 * 60 * 1000, // 1 day
  2: 3 * 24 * 60 * 60 * 1000, // 3 days
  3: 7 * 24 * 60 * 60 * 1000, // 7 days
  4: 14 * 24 * 60 * 60 * 1000, // 14 days
  5: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set, get) => ({
      cards: getDefaultCards('en'),
      language: 'en',
      theme: 'system',
      streak: 0,
      lastStudyDate: null,
      studyHistory: [],
      setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      t: translations.en,
      addCard: (front, back, category, type = 'standard') => {
        const newCard: Flashcard = {
          id: crypto.randomUUID(),
          front,
          back,
          category: category || 'General',
          masteryLevel: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          type,
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },
      updateCard: (id, front, back, category, type = 'standard') => {
        set((state) => ({
          cards: state.cards.map((card) => 
            card.id === id ? { ...card, front, back, category, type } : card
          ),
        }));
      },
      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));
      },
      updateMastery: (cardId, success) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        set((state) => {
          // Streak logic
          let newStreak = state.streak;
          let newLastStudyDate = state.lastStudyDate;

          if (newLastStudyDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (newLastStudyDate === yesterdayStr) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
            newLastStudyDate = todayStr;
          }

          // History logic
          const newHistory = [...state.studyHistory];
          const todayEntry = newHistory.find(h => h.date === todayStr);
          if (todayEntry) {
            todayEntry.count += 1;
          } else {
            newHistory.push({ date: todayStr, count: 1 });
          }

          // Keep only last 30 days of history for the chart
          if (newHistory.length > 30) newHistory.shift();

          const updatedCards = state.cards.map((card) => {
            if (card.id !== cardId) return card;

            let newLevel = card.masteryLevel;
            if (success) {
              newLevel = Math.min(5, card.masteryLevel + 1) as MasteryLevel;
            } else {
              newLevel = 0;
            }

            const nextReview = Date.now() + MASTERY_INTERVALS[newLevel];

            return {
              ...card,
              masteryLevel: newLevel,
              lastReviewedAt: Date.now(),
              nextReviewAt: nextReview,
            };
          });

          return {
            cards: updatedCards,
            streak: newStreak,
            lastStudyDate: newLastStudyDate,
            studyHistory: newHistory,
          };
        });
      },
      getStudyCards: (category) => {
        const { cards } = get();
        const now = Date.now();
        
        let dueCards = cards.filter(card => 
          card.nextReviewAt === null || card.nextReviewAt <= now
        );

        if (category && category !== 'All') {
          dueCards = dueCards.filter(card => card.category === category);
        }

        return dueCards.sort((a, b) => a.masteryLevel - b.masteryLevel);
      },
      getCategories: () => {
        const { cards } = get();
        const categories = Array.from(new Set(cards.map(c => c.category)));
        return ['All', ...categories];
      },
    }),
    {
      name: 'flashcard-mastery-storage',
      partialize: (state) => {
        const { t, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language || 'en'];
          applyTheme(state.theme || 'system');
        }
      }
    }
  )
);

// Listen for OS theme changes when in system mode
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useMasteryStore.getState().theme === 'system') applyTheme('system');
  });
}
