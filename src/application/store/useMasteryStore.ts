import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { openDB } from 'idb';
import { Flashcard, MasteryLevel, FlashcardType } from '../../domain/entities/Flashcard';
import { StudyLog } from '../../domain/entities/StudyLog';
import { SRSEngine, ReviewGrade } from '../../domain/services/SRSEngine';
import { MigrationService } from '../../domain/services/MigrationService';
import { translations, Language } from '../../translations';
import { useUserStore } from './useUserStore';

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
  importCards: (jsonData: string) => boolean;
  exportDeck: (category: string) => string;
  exportCard: (id: string) => string;
  resetAllData: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  const systemLang = navigator.language.split('-')[0];
  return (systemLang === 'pt' ? 'pt' : 'en') as Language;
};

// Domain Separated IndexedDB implementation
const dbPromise = typeof window !== 'undefined' ? openDB('ActiveRecallSystem', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('cards')) {
      db.createObjectStore('cards', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('logs')) {
      // For studyHistory items
      db.createObjectStore('logs', { keyPath: 'date' });
    }
    if (!db.objectStoreNames.contains('metadata')) {
      db.createObjectStore('metadata');
    }
  },
}) : null;

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!dbPromise) return null;
    const db = await dbPromise;
    const cards = await db.getAll('cards');
    const logs = await db.getAll('logs');
    const meta = await db.get('metadata', name);
    
    if (cards.length === 0 && !meta) return null;
    
    // Transparently bundle the relational tables back to Zustand state
    return JSON.stringify({
      state: {
         cards,
         studyHistory: logs,
         lastStudyDate: meta?.lastStudyDate || null,
      },
      version: meta?.version || 0
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!dbPromise) return;
    const data = JSON.parse(value);
    const { state, version } = data;
    const db = await dbPromise;
    
    const tx = db.transaction(['cards', 'logs', 'metadata'], 'readwrite');
    
    // We rewrite for exact sync, but IDB is fast enough for localized data sets.
    await tx.objectStore('cards').clear();
    for (const card of state.cards) {
       await tx.objectStore('cards').put(card);
    }
    
    await tx.objectStore('logs').clear();
    for (const log of state.studyHistory) {
      // Store logs organically using date as PK based on existing data
      await tx.objectStore('logs').put(log);
    }

    await tx.objectStore('metadata').put({
      lastStudyDate: state.lastStudyDate,
      version
    }, name);

    await tx.done;
  },
  removeItem: async (name: string): Promise<void> => {
    if (!dbPromise) return;
    const db = await dbPromise;
    const tx = db.transaction(['cards', 'logs', 'metadata'], 'readwrite');
    await tx.objectStore('cards').clear();
    await tx.objectStore('logs').clear();
    await tx.objectStore('metadata').delete(name);
    await tx.done;
  },
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
          else {
            newHistory.push({ date: todayStr, count: 1 });
            
            // Streak Management
            const userStore = useUserStore.getState();
            if (state.lastStudyDate) {
              const lastDate = new Date(state.lastStudyDate);
              const todayDate = new Date(todayStr);
              const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                userStore.incrementStreak();
              } else if (diffDays > 1) {
                userStore.resetStreak();
                userStore.incrementStreak();
              }
            } else {
              userStore.incrementStreak();
            }
          }
          if (newHistory.length > 30) newHistory.shift();

          const updatedCards = state.cards.map((card) => {
            if (card.id !== cardId) return card;
            const srsUpdate = SRSEngine.calculateNextReview(card, grade);
            
            let newLevel = card.masteryLevel;
            if (grade === 1) newLevel = 0;
            else if (grade === 2) newLevel = Math.max(1, card.masteryLevel) as MasteryLevel;
            else if (grade === 3) newLevel = Math.min(5, card.masteryLevel + 1) as MasteryLevel;
            else if (grade === 4) newLevel = 5;

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
      exportDeck: (category) => {
        const state = get();
        const deckCards = state.cards.filter(c => c.category === category);
        return JSON.stringify({
          cards: deckCards,
          type: 'deck',
          category,
          version: '1.0.1'
        }, null, 2);
      },
      exportCard: (id) => {
        const state = get();
        const card = state.cards.find(c => c.id === id);
        return JSON.stringify({
          cards: card ? [card] : [],
          type: 'card',
          version: '1.0.1'
        }, null, 2);
      },
      importCards: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (!data.cards || !Array.isArray(data.cards)) return false;
          
          // Generate new IDs so they don't collide if it's a clone
          const newCards = data.cards.map((c: any) => ({
            ...c,
            id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            // Reset progression optionally, or keep? The user imports a deck, maybe we want to start fresh to study?
            masteryLevel: 0,
            lastReviewedAt: null,
            nextReviewAt: null
          }));

          set((state) => ({
            cards: [...state.cards, ...MigrationService.migrateAll(newCards)]
          }));
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
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.cards.some(c => !c.fsrsCard && (!c.srsVersion || c.srsVersion < 2))) {
          state.cards = MigrationService.migrateAll(state.cards);
        }
      }
    }
  )
);
