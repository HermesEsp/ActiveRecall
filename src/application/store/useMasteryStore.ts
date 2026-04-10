import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flashcard, MasteryLevel, FlashcardType } from '../../domain/entities/Flashcard';
import { StudyLog } from '../../domain/entities/StudyLog';
import { translations, Language } from '../../translations';
import { SRSEngine, ReviewGrade } from '../../domain/services/SRSEngine';
import { MigrationService } from '../../domain/services/MigrationService';

export function getDefaultCards(lang: Language): Flashcard[] {
  const cards = translations[lang].defaultCards.map((card, i) => ({
    id: `default-${i + 1}`,
    front: card.front,
    back: card.back,
    category: card.category,
    masteryLevel: 0 as const,
    lastReviewedAt: null,
    nextReviewAt: null,
    type: card.type as 'standard' | 'cloze',
  }));
  return MigrationService.migrateAll(cards);
}

function applyTheme(theme: 'system' | 'light' | 'dark') {
  if (typeof document === 'undefined') return;
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
  updateMastery: (cardId: string, grade: ReviewGrade) => void;
  getStudyCards: (category?: string) => Flashcard[];
  getCategories: () => string[];
  migrateAll: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

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
      migrateAll: () => {
        set(state => ({ cards: MigrationService.migrateAll(state.cards) }));
      },
      addCard: (front, back, category, type) => {
        // Intelligent type detection
        const detectedType = type || (front.includes('{{') && front.includes('}}') ? 'cloze' : 'standard');
        
        const newCard: Flashcard = {
          id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          front,
          back,
          category: category || 'General',
          masteryLevel: 0,
          lastReviewedAt: null,
          nextReviewAt: null,
          type: detectedType,
        };
        set((state) => ({ cards: [...state.cards, MigrationService.migrateCard(newCard)] }));
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
      updateMastery: (cardId, grade) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        set((state) => {
          let newStreak = state.streak;
          let newLastStudyDate = state.lastStudyDate;

          // Update streak if this is the first study of a new day
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

          const newHistory = [...state.studyHistory];
          const todayEntry = newHistory.find(h => h.date === todayStr);
          if (todayEntry) todayEntry.count += 1;
          else newHistory.push({ date: todayStr, count: 1 });
          if (newHistory.length > 30) newHistory.shift();

          const updatedCards = state.cards.map((card) => {
            if (card.id !== cardId) return card;

            const srsUpdate = SRSEngine.calculateNextReview(card, grade);
            
            // Map SRD update back to legacy masteryLevel for partial backward compatibility
            let newLevel = card.masteryLevel;
            if (grade === 0) newLevel = 0;
            else if (grade === 3) newLevel = Math.min(5, card.masteryLevel + 1) as MasteryLevel;
            else if (grade === 5) newLevel = 5;

            return {
              ...card,
              ...srsUpdate,
              masteryLevel: newLevel,
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

        // Priority sort: overdue by more time first
        return dueCards.sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0));
      },
      getCategories: () => {
        const { cards } = get();
        const categories = Array.from(new Set(cards.map(c => c.category)));
        return ['All', ...categories];
      },
      exportData: () => {
        const state = get();
        const data = {
          cards: state.cards,
          streak: state.streak,
          lastStudyDate: state.lastStudyDate,
          studyHistory: state.studyHistory,
          language: state.language,
          theme: state.theme,
          version: '1.0.0'
        };
        return JSON.stringify(data, null, 2);
      },
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          // Basic validation
          if (!data.cards || !Array.isArray(data.cards)) return false;
          
          set({
            cards: MigrationService.migrateAll(data.cards),
            streak: data.streak || 0,
            lastStudyDate: data.lastStudyDate || null,
            studyHistory: data.studyHistory || [],
            language: data.language || 'en',
            theme: data.theme || 'system'
          });
          return true;
        } catch (e) {
          console.error('Import failed', e);
          return false;
        }
      }
    }),
    {
      name: 'flashcard-mastery-storage',
      partialize: (state) => {
        const { t, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Automatic migration trigger
          if (state.cards.some(c => !c.srsVersion)) {
            state.cards = MigrationService.migrateAll(state.cards);
          }
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
