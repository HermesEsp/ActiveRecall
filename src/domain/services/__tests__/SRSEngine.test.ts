import { describe, it, expect } from 'vitest';
import { SRSEngine } from '../SRSEngine';
import { Flashcard } from '../../entities/Flashcard';

describe('SRSEngine (SM-2 Algorithm)', () => {
  const mockCard: Partial<Flashcard> = {
    repetitionCount: 0,
    easeFactor: 2.5,
    interval: 0,
  };

  it('initializes new cards correctly on success (grade 5)', () => {
    const update = SRSEngine.calculateNextReview(mockCard, 5);
    expect(update.repetitionCount).toBe(1);
    expect(update.interval).toBe(1);
    expect(update.easeFactor).toBe(2.6); // 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02)) = 2.6
  });

  it('increments repetition and calculates interval correctly for known cards', () => {
    const card: Partial<Flashcard> = {
      repetitionCount: 2,
      easeFactor: 2.5,
      interval: 6,
    };
    const update = SRSEngine.calculateNextReview(card, 5);
    expect(update.repetitionCount).toBe(3);
    expect(update.interval).toBe(15); // Math.round(6 * 2.5)
  });

  it('resets repetition and applies penalty on failure (grade 0)', () => {
    const card: Partial<Flashcard> = {
      repetitionCount: 5,
      easeFactor: 2.5,
      interval: 50,
    };
    const update = SRSEngine.calculateNextReview(card, 0);
    expect(update.repetitionCount).toBe(0);
    expect(update.interval).toBe(1);
    expect(update.easeFactor).toBe(2.3); // 2.5 - 0.2
  });

  it('caps easeFactor at minimum 1.3', () => {
    const card: Partial<Flashcard> = {
      repetitionCount: 1,
      easeFactor: 1.4,
      interval: 1,
    };
    const update = SRSEngine.calculateNextReview(card, 0);
    expect(update.easeFactor).toBe(1.3);
  });
});
