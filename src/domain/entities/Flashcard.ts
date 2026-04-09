export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type FlashcardType = 'standard' | 'cloze';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  masteryLevel: MasteryLevel;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  type: FlashcardType;
}
