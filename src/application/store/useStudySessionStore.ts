import { create } from 'zustand';
import { Flashcard } from '../../domain/entities/Flashcard';
import { shuffle } from '../../lib/utils';
import { ReviewGrade } from '../../domain/services/SRSEngine';

export interface StudySessionState {
  isActive: boolean;
  isPractice: boolean;
  queue: string[]; // IDs of cards
  results: Record<string, ReviewGrade>;
  currentIndex: number;
  category: string;
  startTime: number | null;
  
  // Actions
  startSession: (cards: Flashcard[], category: string, isPractice?: boolean) => void;
  evaluateCard: (cardId: string, grade: ReviewGrade) => void;
  endSession: () => void;
  getCurrentCardId: () => string | null;
  isFinished: () => boolean;
}

export const useStudySessionStore = create<StudySessionState>()((set, get) => ({
  isActive: false,
  isPractice: false,
  queue: [],
  results: {},
  currentIndex: 0,
  category: 'All',
  startTime: null,

  startSession: (cards, category, isPractice = false) => {
    const shuffledIds = shuffle(cards.map(c => c.id));
    set({
      isActive: true,
      isPractice,
      queue: shuffledIds,
      results: {},
      currentIndex: 0,
      category,
      startTime: Date.now(),
    });
  },

  evaluateCard: (cardId, grade) => {
    set((state) => ({
      results: { ...state.results, [cardId]: grade },
      currentIndex: state.currentIndex + 1,
    }));
  },

  endSession: () => {
    set({ isActive: false, queue: [], results: {}, currentIndex: 0, startTime: null });
  },

  getCurrentCardId: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] || null;
  },

  isFinished: () => {
    const { queue, currentIndex, isActive } = get();
    return isActive && currentIndex >= queue.length && queue.length > 0;
  }
}));
