import { Flashcard } from './Flashcard';

export interface StudyLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface StudySession {
  cards: Flashcard[];
  currentIndex: number;
  isFinished: boolean;
}
