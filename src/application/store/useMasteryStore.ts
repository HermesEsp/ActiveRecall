import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flashcard, MasteryLevel, FlashcardType } from '../../domain/entities/Flashcard';
import { StudyLog } from '../../domain/entities/StudyLog';
import { SRSEngine, ReviewGrade } from '../../domain/services/SRSEngine';
import { MigrationService } from '../../domain/services/MigrationService';
import { translations, Language } from '../../translations';

export { type ReviewGrade };

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

interface MasteryState {
  cards: Flashcard[];
  lastStudyDate: string | null;
  studyHistory: StudyLog[];
  addCard: (front: string, back: string, category: string, type?: FlashcardType) => void;
  updateCard: (id: string, front: string, back: string, category: string, type?: FlashcardType) => void;
  deleteCard: (id: string) => void;
  updateMastery: (cardId: string, grade: ReviewGrade, isPractice?: boolean) => void;
  getStudyCards: (category?: string, forceAll?: boolean) => Flashcard[];
  getCategories: () => string[];
  migrateAll: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  restoreTutorial: (lang: Language) => void;
  resetAllData: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const systemLang = navigator.language.split('-')[0];
  return (systemLang === 'pt' ? 'pt' : 'en') as Language;
};

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set, get) => ({
      cards: getDefaultCards(getInitialLanguage()),
      lastStudyDate: null,
      studyHistory: [],
      migrateAll: () => {
        set(state => ({ cards: MigrationService.migrateAll(state.cards) }));
      },
      addCard: (front, back, category, type) => {
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
        set((state) => {
          const updatedCards = state.cards.map((card) => 
            card.id === id ? { ...card, front, back, category, type } : card
          );
          return { cards: updatedCards };
        });
      },
      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));
      },
      updateMastery: (cardId, grade, isPractice = false) => {
        if (isPractice) return; // Reviews do not affect SRS stats or daily history

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        set((state) => {
          const newHistory = [...state.studyHistory];
          const todayEntry = newHistory.find(h => h.date === todayStr);
          if (todayEntry) todayEntry.count += 1;
          else newHistory.push({ date: todayStr, count: 1 });
          if (newHistory.length > 30) newHistory.shift();

          const updatedCards = state.cards.map((card) => {
            if (card.id !== cardId) return card;
            const srsUpdate = SRSEngine.calculateNextReview(card, grade);
            
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
            lastStudyDate: todayStr,
            studyHistory: newHistory,
          };
        });
      },
      getStudyCards: (category, forceAll = false) => {
        const { cards } = get();
        const now = Date.now();
        
        let filteredCards = cards;
        if (!forceAll) {
          filteredCards = cards.filter(card => 
            card.nextReviewAt === null || card.nextReviewAt <= now
          );
        }

        if (category && category !== 'All') {
          filteredCards = filteredCards.filter(card => card.category === category);
        }

        return filteredCards.sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0));
      },
      getCategories: () => {
        const { cards } = get();
        return Array.from(new Set(cards.map(c => c.category)));
      },
      exportData: () => {
        const state = get();
        return JSON.stringify({
          cards: state.cards,
          lastStudyDate: state.lastStudyDate,
          studyHistory: state.studyHistory,
          version: '1.0.1'
        }, null, 2);
      },
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (!data.cards || !Array.isArray(data.cards)) return false;
          
          set({
            cards: MigrationService.migrateAll(data.cards),
            lastStudyDate: data.lastStudyDate || null,
            studyHistory: data.studyHistory || [],
          });
          return true;
        } catch (e) {
          return false;
        }
      },
      restoreTutorial: (lang) => {
        const { cards: currentCards } = get();
        const tutorialCards = getDefaultCards(lang);
        const missingTutorials = tutorialCards.filter(
          tc => !currentCards.some(cc => cc.front === tc.front)
        );
        if (missingTutorials.length > 0) {
          set({ cards: [...currentCards, ...missingTutorials] });
        }
      },
      resetAllData: (lang) => {
        set({
          cards: getDefaultCards(lang),
          studyHistory: [],
          lastStudyDate: null
        });
      }
    }),
    {
      name: 'flashcard-mastery-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.cards.some(c => !c.srsVersion)) {
          state.cards = MigrationService.migrateAll(state.cards);
        }
      }
    }
  )
);
