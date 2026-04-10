import { Flashcard } from '../entities/Flashcard';
import { fsrs, Rating, createEmptyCard } from 'ts-fsrs';

export type ReviewGrade = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface SRSUpdate {
  fsrsCard: any;
  nextReviewAt: number;
  lastReviewedAt: number;
}

const f = fsrs({});

/**
 * Free Spaced Repetition Scheduler (FSRS) Engine
 */
export const SRSEngine = {
  calculateNextReview: (card: Partial<Flashcard>, grade: ReviewGrade): SRSUpdate => {
    // 1. Initialize or get current FSRS state
    let currentFSRSCard = card.fsrsCard;
    if (!currentFSRSCard) {
      currentFSRSCard = createEmptyCard();
    }

    // 2. Map Legacy ReviewGrade to FSRS Rating
    let rating = Rating.Good;
    if (grade === 1) {
      rating = Rating.Again;
    } else if (grade === 2) {
      rating = Rating.Hard;
    } else if (grade === 3) {
      rating = Rating.Good;
    } else if (grade === 4) {
      rating = Rating.Easy;
    }

    // 3. Calculate next steps using FSRS
    const now = new Date();
    const result = f.next(currentFSRSCard, now, rating);
    const scheduledCard = result.card;

    return {
      fsrsCard: scheduledCard,
      nextReviewAt: scheduledCard.due.getTime(),
      lastReviewedAt: now.getTime(),
    };
  }
};
