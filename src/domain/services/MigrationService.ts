import { Flashcard } from '../entities/Flashcard';

/**
 * Handles the safe transition of legacy cards (masteryLevel 0-5) 
 * to the new SRS-ready data structure.
 */
export const MigrationService = {
  migrateCard: (card: Flashcard): Flashcard => {
    // If already migrated, skip
    if (card.srsVersion && card.srsVersion >= 1) {
      return card;
    }

    // Map legacy masteryLevel to initial SRS values
    // This preserves the "relative maturity" of the cards
    const levelToInterval = [0, 1, 3, 7, 14, 30];
    
    const interval = levelToInterval[card.masteryLevel] || 0;
    const repetitionCount = card.masteryLevel > 0 ? card.masteryLevel : 0;

    return {
      ...card,
      repetitionCount,
      easeFactor: 2.5,
      interval,
      srsVersion: 1,
      // Ensure it has a nextReviewAt if it was already mastered
      nextReviewAt: card.nextReviewAt || (interval > 0 ? Date.now() + interval * 24 * 60 * 60 * 1000 : null)
    };
  },

  migrateAll: (cards: Flashcard[]): Flashcard[] => {
    return cards.map(MigrationService.migrateCard);
  }
};
