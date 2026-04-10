import { Flashcard } from '../entities/Flashcard';
import { createEmptyCard } from 'ts-fsrs';

/**
 * Handles the safe transition of legacy cards (masteryLevel 0-5 and SM-2) 
 * to the new FSRS (Free Spaced Repetition Scheduler) data structure.
 */
export const MigrationService = {
  migrateCard: (card: Flashcard): Flashcard => {
    // If already migrated to FSRS, skip
    if (card.srsVersion && card.srsVersion >= 2 && card.fsrsCard) {
      return card;
    }

    // Map legacy masteryLevel to initial SRS values
    // This preserves the "relative maturity" of the cards
    const levelToInterval = [0, 1, 3, 7, 14, 30];
    
    const interval = levelToInterval[card.masteryLevel] || 0;
    const repetitionCount = card.masteryLevel > 0 ? card.masteryLevel : 0;

    // FSRS Blank Slate
    const fsrsCard = createEmptyCard();
    fsrsCard.due = new Date(card.nextReviewAt || Date.now());
    if (interval > 0) {
      // Simulate some repetition natively for the object if possible
      fsrsCard.reps = repetitionCount;
      fsrsCard.elapsed_days = interval;
      fsrsCard.scheduled_days = interval;
    }

    return {
      ...card,
      repetitionCount,
      easeFactor: 2.5,
      interval,
      fsrsCard,
      srsVersion: 2,
      // Ensure it has a nextReviewAt if it was already mastered
      nextReviewAt: card.nextReviewAt || (interval > 0 ? Date.now() + interval * 24 * 60 * 60 * 1000 : null)
    };
  },

  migrateAll: (cards: Flashcard[]): Flashcard[] => {
    return cards.map(MigrationService.migrateCard);
  }
};
