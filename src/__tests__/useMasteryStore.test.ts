import { describe, it, expect, beforeEach } from 'vitest';
import { useMasteryStore } from '../application/store/useMasteryStore';

const resetStore = () => {
  useMasteryStore.setState({
    cards: [],
    streak: 0,
    lastStudyDate: null,
    studyHistory: [],
    language: 'en',
  });
};

describe('useMasteryStore', () => {
  beforeEach(resetStore);

  describe('Card CRUD', () => {
    it('adds a standard card', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      const cards = useMasteryStore.getState().cards;
      expect(cards).toHaveLength(1);
      expect(cards[0]).toMatchObject({
        front: 'Q1', back: 'A1', category: 'Math',
        masteryLevel: 0, type: 'standard',
      });
    });

    it('adds a cloze card', () => {
      useMasteryStore.getState().addCard('The capital is {{Paris}}', 'Paris', 'Geo', 'cloze');
      expect(useMasteryStore.getState().cards[0].type).toBe('cloze');
    });

    it('defaults category to General when empty', () => {
      useMasteryStore.getState().addCard('Q', 'A', '');
      expect(useMasteryStore.getState().cards[0].category).toBe('General');
    });

    it('updates a card', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateCard(id, 'Q2', 'A2', 'Science', 'cloze');
      const card = useMasteryStore.getState().cards[0];
      expect(card).toMatchObject({ front: 'Q2', back: 'A2', category: 'Science', type: 'cloze' });
    });

    it('deletes a card', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().deleteCard(id);
      expect(useMasteryStore.getState().cards).toHaveLength(0);
    });
  });

  describe('Mastery & Spaced Repetition', () => {
    it('increases mastery level on success', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateMastery(id, true);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(1);
    });

    it('resets mastery to 0 on failure', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      // Level up to 3
      useMasteryStore.getState().updateMastery(id, true);
      useMasteryStore.getState().updateMastery(id, true);
      useMasteryStore.getState().updateMastery(id, true);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(3);
      // Fail — back to 0
      useMasteryStore.getState().updateMastery(id, false);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(0);
    });

    it('caps mastery at level 5', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      for (let i = 0; i < 10; i++) {
        useMasteryStore.getState().updateMastery(id, true);
      }
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(5);
    });

    it('sets nextReviewAt based on mastery level', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      const before = Date.now();
      useMasteryStore.getState().updateMastery(id, true);
      const card = useMasteryStore.getState().cards[0];
      // Level 1 = 1 day interval
      const expectedInterval = 1 * 24 * 60 * 60 * 1000;
      expect(card.nextReviewAt).toBeGreaterThanOrEqual(before + expectedInterval - 100);
      expect(card.lastReviewedAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('Study Cards Filtering', () => {
    it('returns cards with no nextReviewAt as due', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Science');
      const due = useMasteryStore.getState().getStudyCards('All');
      expect(due).toHaveLength(2);
    });

    it('filters by category', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Science');
      const due = useMasteryStore.getState().getStudyCards('Math');
      expect(due).toHaveLength(1);
      expect(due[0].category).toBe('Math');
    });

    it('excludes cards not yet due', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateMastery(id, true);
      // Card is now level 1 with 1-day interval — should not be due
      const due = useMasteryStore.getState().getStudyCards('All');
      expect(due).toHaveLength(0);
    });
  });

  describe('Streak', () => {
    it('starts streak at 1 on first study', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateMastery(id, true);
      expect(useMasteryStore.getState().streak).toBe(1);
    });

    it('does not increment streak for same day', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Test');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Test');
      const [c1, c2] = useMasteryStore.getState().cards;
      useMasteryStore.getState().updateMastery(c1.id, true);
      useMasteryStore.getState().updateMastery(c2.id, true);
      expect(useMasteryStore.getState().streak).toBe(1);
    });
  });

  describe('Categories', () => {
    it('returns All plus unique categories', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Math');
      useMasteryStore.getState().addCard('Q3', 'A3', 'Science');
      const cats = useMasteryStore.getState().getCategories();
      expect(cats).toEqual(['All', 'Math', 'Science']);
    });
  });

  describe('Study History', () => {
    it('records study history entries', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateMastery(id, true);
      const history = useMasteryStore.getState().studyHistory;
      expect(history).toHaveLength(1);
      expect(history[0].count).toBe(1);
    });

    it('increments count for same day', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Test');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Test');
      const [c1, c2] = useMasteryStore.getState().cards;
      useMasteryStore.getState().updateMastery(c1.id, true);
      useMasteryStore.getState().updateMastery(c2.id, false);
      expect(useMasteryStore.getState().studyHistory[0].count).toBe(2);
    });
  });
});
