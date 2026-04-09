import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, BookOpen, Play, Info } from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Flashcard } from '../../domain/entities/Flashcard';
import { Card } from '../components/Card';

export const StudyPage: React.FC = () => {
  const { getStudyCards, updateMastery, getCategories, t } = useMasteryStore();
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [pendingNext, setPendingNext] = useState<number | null>(null);

  const startSession = (category: string = selectedCategory) => {
    setSelectedCategory(category);
    const cards = getStudyCards(category);
    setStudyCards(cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStarted(true);
  };

  const handleNext = (success: boolean) => {
    if (pendingNext !== null) return;
    const currentCard = studyCards[currentIndex];
    updateMastery(currentCard.id, success);

    if (currentIndex < studyCards.length - 1) {
      setPendingNext(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFlipComplete = () => {
    if (pendingNext !== null && !isFlipped) {
      setCurrentIndex(pendingNext);
      setPendingNext(null);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!sessionStarted || isFinished) return;

    if (e.code === 'Space') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (isFlipped) {
      if (e.key === 'ArrowRight' || e.key === '1') {
        handleNext(true);
      } else if (e.key === 'ArrowLeft' || e.key === '0') {
        handleNext(false);
      }
    }
  }, [isFlipped, isFinished, studyCards, currentIndex, sessionStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const categories = getCategories();

  if (!sessionStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.study.title}</h2>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.study.discipline}</h1>
          <p className="text-zinc-500 mt-2">{t.study.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const cardsDue = getStudyCards(cat).length;
            return (
              <button
                key={cat}
                onClick={() => startSession(cat)}
                className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                    <BookOpen size={20} />
                  </div>
                  {cardsDue > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full">
                      {cardsDue} {t.study.due}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{cat}</h3>
                <p className="text-sm text-zinc-500 mb-6">{t.study.subtitle}</p>
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider">
                  <span>{t.study.start}</span>
                  <Play size={12} fill="currentColor" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex gap-4 items-start">
          <Info className="text-zinc-400 shrink-0" size={20} />
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{t.study.howItWorks.title}</p>
            {t.study.howItWorks.desc}
          </div>
        </div>
      </div>
    );
  }

  if (studyCards.length === 0 && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700">
          <Check className="text-zinc-400" size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t.study.caughtUp}</h2>
        <p className="text-zinc-500 max-w-xs">{t.study.caughtUpDesc}</p>
        <button 
          onClick={() => setSessionStarted(false)}
          className="mt-8 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {t.study.back}
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center mb-6">
          <Check className="text-white dark:text-zinc-900" size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t.study.finished}</h2>
        <p className="text-zinc-500 max-w-xs">
          {t.study.finishedDesc} <strong>{selectedCategory}</strong>.
        </p>
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => setSessionStarted(false)}
            className="px-6 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {t.study.back}
          </button>
          <button 
            onClick={() => startSession()}
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={18} />
            {t.study.restart}
          </button>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{selectedCategory}</h2>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">{t.study.cardOf.replace('{current}', (currentIndex + 1).toString()).replace('{total}', studyCards.length.toString())}</p>
        </div>
        <button 
          onClick={() => setSessionStarted(false)}
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {t.study.exit}
        </button>
      </div>

      <div className="flex flex-col items-center gap-12">
        <Card
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => pendingNext === null && setIsFlipped(!isFlipped)}
          onFlipComplete={handleFlipComplete}
        />

        <AnimatePresence mode="wait">
          {isFlipped ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 md:gap-4 w-full max-w-md"
            >
              <button
                onClick={() => handleNext(false)}
                className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-4 py-4 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all group"
              >
                <X size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-base">{t.study.forgot}</span>
                <span className="hidden md:block ml-auto text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 group-hover:bg-red-100 dark:group-hover:bg-red-900 group-hover:text-red-500">←</span>
              </button>
              <button
                onClick={() => handleNext(true)}
                className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-4 py-4 border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all group"
              >
                <Check size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-base">{t.study.recalled}</span>
                <span className="hidden md:block ml-auto text-[10px] bg-zinc-800 dark:bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-400 dark:text-zinc-600 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300">→</span>
              </button>
            </motion.div>
          ) : (
            <div className="h-[82px] flex items-center justify-center text-zinc-400 text-sm italic px-8 text-center">
              {t.study.flip}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
