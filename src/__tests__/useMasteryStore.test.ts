import { describe, it, expect, beforeEach } from 'vitest';
import { useMasteryStore } from '../application/store/useMasteryStore';
import { useUserStore } from '../application/store/useUserStore';

const resetStore = () => {
  useMasteryStore.setState({
    cards: [],
    lastStudyDate: null,
    studyHistory: [],
  });
  useUserStore.setState({
    user: {
      name: 'User',
      email: 'user@example.com',
      streak: 0,
      language: 'en',
      theme: 'system'
    }
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
      useMasteryStore.getState().updateMastery(id, 5);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(5);
    });

    it('resets mastery to 0 on failure', () => {
      useMasteryStore.getState().addCard('Q', 'A', 'Test');
      const id = useMasteryStore.getState().cards[0].id;
      useMasteryStore.getState().updateMastery(id, 5);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(5);
      useMasteryStore.getState().updateMastery(id, 0);
      expect(useMasteryStore.getState().cards[0].masteryLevel).toBe(0);
    });
  });

  describe('Study Cards Filtering', () => {
    it('filters by category', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      useMasteryStore.getState().addCard('Q2', 'A2', 'Science');
      const due = useMasteryStore.getState().getStudyCards('Math');
      expect(due).toHaveLength(1);
      expect(due[0].category).toBe('Math');
    });
  });

  describe('Categories', () => {
    it('returns unique categories', () => {
      useMasteryStore.getState().addCard('Q1', 'A1', 'Math');
      useMasteryStore.getState().addCard('Q3', 'A3', 'Science');
      const cats = useMasteryStore.getState().getCategories();
      expect(cats).toEqual(['Math', 'Science']);
    });
  });
});
