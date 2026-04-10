import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, BookOpen, Play, Info, GraduationCap } from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { useStudySessionStore } from '../../application/store/useStudySessionStore';
import { Card } from '../components/Card';
import { ReviewGrade } from '../../domain/services/SRSEngine';

export const StudyPage: React.FC = () => {
  const { getStudyCards, updateMastery, getCategories, t, cards } = useMasteryStore();
  const { 
    isActive, 
    queue, 
    currentIndex, 
    startSession, 
    evaluateCard, 
    endSession, 
    isFinished 
  } = useStudySessionStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pendingNext, setPendingNext] = useState<number | null>(null);

  const startReview = (category: string = selectedCategory) => {
    setSelectedCategory(category);
    const sessionCards = getStudyCards(category);
    startSession(sessionCards, category);
    setPendingNext(null);
    setIsFlipped(false);
  };

  const handleNext = (grade: ReviewGrade) => {
    if (pendingNext !== null) return;
    
    // 1. Permanently update the card in the main store
    const currentCardId = queue[currentIndex];
    updateMastery(currentCardId, grade);

    // 2. Update session state
    evaluateCard(currentCardId, grade);

    // 3. Trigger visual transition
    if (currentIndex < queue.length - 1) {
      setPendingNext(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFlipComplete = () => {
    if (pendingNext !== null && !isFlipped) {
      setPendingNext(null);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || isFinished()) return;

    if (e.code === 'Space') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (isFlipped) {
      if (e.key === '1') handleNext(0);
      else if (e.key === '2') handleNext(3);
      else if (e.key === '3') handleNext(5);
    }
  }, [isFlipped, isActive, isFinished, queue, currentIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const categories = getCategories();

  if (!isActive) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.study.title}</h2>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{t.study.discipline}</h1>
          <p className="text-zinc-500 mt-2">{t.study.subtitle}</p>
        </div>

        {getStudyCards('All').length > 0 && (
          <button 
            onClick={() => startReview('All')}
            className="w-full mb-12 p-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-between group hover:shadow-2xl transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white dark:text-zinc-900" size={32} />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold">{t.study.reviewAll}</h3>
                <p className="text-zinc-400 dark:text-zinc-500 font-medium">
                  {t.study.reviewAllDesc.replace('{count}', getStudyCards('All').length.toString())}
                </p>
              </div>
            </div>
            <Play size={24} fill="currentColor" className="group-hover:translate-x-2 transition-transform" />
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const cardsDue = getStudyCards(cat).length;
            return (
              <button
                key={cat}
                onClick={() => startReview(cat)}
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

  if (queue.length === 0 && !isFinished()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700">
          <Check className="text-zinc-400" size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t.study.caughtUp}</h2>
        <p className="text-zinc-500 max-w-xs">{t.study.caughtUpDesc}</p>
        <button 
          onClick={endSession}
          className="mt-8 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {t.study.back}
        </button>
      </div>
    );
  }

  if (isFinished()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
        >
          <Check className="text-white dark:text-zinc-900" size={48} strokeWidth={3} />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight"
        >
          {t.study.finished}
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-500 text-lg max-w-sm mb-12"
        >
          {t.study.finishedDesc} <span className="text-zinc-900 dark:text-zinc-100 font-bold">{selectedCategory}</span>.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <button 
            onClick={() => {
              endSession();
              // Navigate back home to see updated Dashboard
              window.location.href = '/'; 
            }}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            {t.study.back}
          </button>
          <button 
            onClick={() => startReview()}
            className="w-full py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            {t.study.restart}
          </button>
        </motion.div>
      </div>
    );
  }

  const currentCard = cards.find(c => c.id === queue[currentIndex]);
  if (!currentCard) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{selectedCategory}</h2>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">{t.study.cardOf.replace('{current}', (currentIndex + 1).toString()).replace('{total}', queue.length.toString())}</p>
        </div>
        <button 
          onClick={endSession}
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
                onClick={() => handleNext(0)}
                className="flex-1 flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all group"
              >
                <X size={20} className="mb-1 text-red-500" />
                <span className="text-[10px] uppercase font-bold tracking-widest">{t.study.forgot}</span>
                <span className="text-[9px] opacity-40 mt-1">[1]</span>
              </button>
              
              <button
                onClick={() => handleNext(3)}
                className="flex-1 flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all group"
              >
                <RotateCcw size={20} className="mb-1 text-zinc-400" />
                <span className="text-[10px] uppercase font-bold tracking-widest">{t.study.hard}</span>
                <span className="text-[9px] opacity-40 mt-1">[2]</span>
              </button>

              <button
                onClick={() => handleNext(5)}
                className="flex-1 flex flex-col items-center justify-center p-4 border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all group shadow-lg"
              >
                <Check size={20} className="mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-widest">{t.study.easy}</span>
                <span className="text-[9px] opacity-60 mt-1">[3]</span>
              </button>
            </motion.div>
          ) : (
            <div className="h-[82px] flex items-center justify-center text-zinc-400 text-sm italic px-8 text-center pt-4">
              {t.study.flip}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
