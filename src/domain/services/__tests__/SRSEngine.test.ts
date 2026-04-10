import { describe, it, expect } from 'vitest';
import { SRSEngine } from '../SRSEngine';
import { Flashcard } from '../../entities/Flashcard';
import { createEmptyCard } from 'ts-fsrs';

describe('SRSEngine (FSRS Algorithm)', () => {
  const mockCard: Partial<Flashcard> = {
    fsrsCard: createEmptyCard(),
  };

  it('initializes new cards correctly on success (grade 4 = Easy)', () => {
    const update = SRSEngine.calculateNextReview(mockCard, 4);
    expect(update.fsrsCard).toBeDefined();
    expect(update.fsrsCard.reps).toBe(1);
    expect(update.fsrsCard.scheduled_days).toBeGreaterThan(0);
  });

  it('handles penalty / reset correctly on failure (grade 1 = Forgot)', () => {
    const update = SRSEngine.calculateNextReview(mockCard, 1);
    expect(update.fsrsCard.reps).toBe(0); // For learning state, it might stay 0 or go back to learning
    expect(update.fsrsCard.scheduled_days).toBe(0);
  });
});
