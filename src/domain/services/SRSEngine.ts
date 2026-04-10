import { Flashcard } from '../entities/Flashcard';

export type ReviewGrade = 0 | 3 | 5; // Forgot (0), Hard (3), Easy (5)

export interface SRSUpdate {
  repetitionCount: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: number;
  lastReviewedAt: number;
}

/**
 * SM-2 Algorithm Implementation
 * Optimized for incremental migration from a mastery-level system.
 */
export const SRSEngine = {
  calculateNextReview: (card: Partial<Flashcard>, grade: ReviewGrade): SRSUpdate => {
    // Default values for new or legacy cards
    let repetitionCount = card.repetitionCount ?? 0;
    let easeFactor = card.easeFactor ?? 2.5;
    let interval = card.interval ?? 0;

    if (grade >= 3) {
      // Success
      if (repetitionCount === 0) {
        interval = 1;
      } else if (repetitionCount === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitionCount += 1;

      // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      // For q=3: EF = EF - 0.14
      // For q=5: EF = EF + 0.10
      easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    } else {
      // Failure (Forgot)
      repetitionCount = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2); // Penalty for forgetting
    }

    // Constraints
    if (easeFactor < 1.3) easeFactor = 1.3;

    return {
      repetitionCount,
      easeFactor: Number(easeFactor.toFixed(2)),
      interval,
      nextReviewAt: Date.now() + interval * 24 * 60 * 60 * 1000,
      lastReviewedAt: Date.now(),
    };
  }
};
