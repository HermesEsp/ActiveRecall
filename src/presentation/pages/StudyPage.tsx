import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Play, 
  RotateCcw, 
  Check,
  BookOpen,
  X,
  Target,
  Trophy,
  Focus,
  CornerDownLeft
} from 'lucide-react';
import { useMasteryStore, ReviewGrade } from '../../application/store/useMasteryStore';
import { useStudySessionStore } from '../../application/store/useStudySessionStore';
import { Card } from '../components/Card';
import { Label, PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { MethodologyTip } from '../components/ui/MethodologyTip';

const Kbd = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <kbd className={`inline-flex items-center justify-center px-2 py-1 rounded border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black text-zinc-500 shadow-sm ${className}`}>
    {children}
  </kbd>
);

import { useTranslation } from '../hooks/useTranslation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const StudyPage: React.FC = () => {
  const { getStudyCards, updateMastery, getCategories, cards } = useMasteryStore();
  const { t } = useTranslation();
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [pendingNext, setPendingNext] = useState<number | null>(null);

  const startReview = (category: string = 'All') => {
    const studyCards = getStudyCards(category);
    if (studyCards.length > 0) {
      setSelectedCategory(category);
      startSession(studyCards, category);
      setIsFlipped(false);
    }
  };

  const handleNext = (grade: ReviewGrade) => {
    if (pendingNext !== null) return;
    const currentCardId = queue[currentIndex];
    updateMastery(currentCardId, grade);
    evaluateCard(currentCardId, grade);
    setIsFlipped(false);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    ' ': () => {
      if (isActive && !isFinished()) {
        setIsFlipped(prev => !prev);
      }
    },
    '1': () => {
      if (isActive && isFlipped && !isFinished()) handleNext(0);
    },
    '2': () => {
      if (isActive && isFlipped && !isFinished()) handleNext(3);
    },
    '3': () => {
      if (isActive && isFlipped && !isFinished()) handleNext(5);
    },
    'Escape': () => {
      if (isActive) endSession();
    }
  });

  if (!isActive) {
    const categories = getCategories();
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 animate-in fade-in duration-1000">
        <div className="mb-20">
          <PageTitle className="text-5xl md:text-6xl tracking-tightest">{t.study.title}</PageTitle>
          <p className="text-zinc-500 font-bold text-lg mt-4 max-w-lg">{t.study.subtitle}</p>
        </div>

        {getStudyCards('All').length > 0 && (
          <button onClick={() => startReview('All')}
            className="w-full mb-16 p-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex flex-col md:flex-row items-center justify-between group hover:scale-[1.01] transition-all relative overflow-hidden shadow-3xl"
          >
            <div className="flex items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center border border-white/10 dark:border-zinc-900/10"><GraduationCap size={40} /></div>
              <div className="text-left"><h3 className="text-3xl font-black tracking-tight">{t.study.reviewAll}</h3><p className="text-zinc-400 dark:text-zinc-500 font-bold">{t.study.reviewAllDesc.replace('{count}', getStudyCards('All').length.toString())}</p></div>
            </div>
            <div className="mt-8 md:mt-0 flex items-center gap-4 relative z-10 bg-white dark:bg-zinc-900 p-2 rounded-full pr-8">
               <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center"><Play size={20} fill="currentColor" className="text-white dark:text-zinc-900" /></div>
               <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white uppercase">{t.study.start}</span>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Target size={240} /></div>
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {categories.map(cat => {
            const cardsDue = getStudyCards(cat).length;
            if (cat === 'All') return null;
            return (
              <button key={cat} onClick={() => startReview(cat)}
                className="p-10 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-100 hover:shadow-2xl transition-all text-left group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10"><div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all shadow-inner"><BookOpen size={24} /></div>{cardsDue > 0 && <span className="bg-red-500 text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/30">{cardsDue} {t.study.due}</span>}</div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">{cat}</h3>
                  <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"><span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.study.start}</span><Play size={12} fill="currentColor" /></div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity translate-x-1/4 translate-y-1/4"><BookOpen size={160} /></div>
              </button>
            );
          })}
        </div>
        <MethodologyTip title={t.study.howItWorks.title} description={t.study.howItWorks.desc} />
      </div>
    );
  }

  if (queue.length === 0 && !isFinished()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center mb-8 border-2 border-emerald-100 dark:border-emerald-900/50 shadow-xl"><Check className="text-emerald-500" size={48} strokeWidth={3} /></div>
        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-4">{t.study.caughtUp}</h2>
        <p className="text-zinc-500 max-w-xs font-bold text-lg">{t.study.caughtUpDesc}</p>
        <Button variant="secondary" size="lg" className="mt-12 min-w-[200px]" onClick={endSession}>{t.study.back}</Button>
      </div>
    );
  }

  if (isFinished()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 animate-in fade-in duration-1000">
        <div className="relative mb-12"><motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-32 h-32 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-3xl text-white dark:text-zinc-900 relative z-10"><Trophy size={56} strokeWidth={2.5} /></motion.div><div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" /></div>
        <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 mb-6 tracking-tightest">{t.study.finished}</h2>
        <p className="text-zinc-500 text-xl max-w-md mb-16 font-bold leading-relaxed">{t.study.finishedDesc} <span className="text-zinc-900 dark:text-zinc-100 border-b-4 border-emerald-500/30">{selectedCategory}</span>.</p>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md"><Button fullWidth size="lg" onClick={() => { endSession(); window.location.href = '/'; }}>{t.study.back}</Button><Button variant="secondary" fullWidth size="lg" onClick={() => startReview(selectedCategory)}><RotateCcw size={20} className="mr-3" />{t.study.restart}</Button></div>
      </div>
    );
  }

  const currentCard = cards.find(c => c.id === queue[currentIndex]);
  if (!currentCard) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-6"><div className="w-12 h-12 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center shadow-sm"><Focus className="text-zinc-400" size={20} /></div><div><span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{selectedCategory}</span><h4 className="text-lg font-black tracking-tight leading-none pt-1">{t.study.cardOf.replace('{current}', (currentIndex + 1).toString()).replace('{total}', queue.length.toString())}</h4></div></div>
        <button onClick={endSession} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors border-b-2 border-transparent hover:border-red-500/20 pb-1">{t.study.exit}</button>
      </div>

      <div className="flex flex-col items-center gap-16">
        <div className="w-full perspect-1000">
           <Card card={currentCard} isFlipped={isFlipped} onFlip={() => pendingNext === null && setIsFlipped(!isFlipped)} onFlipComplete={() => {}} />
        </div>

        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-3 text-zinc-400 text-sm font-black uppercase tracking-widest italic animate-pulse">
                 {t.study.flip}
               </div>
               <div className="flex items-center gap-2 mt-2">
                  <Kbd className="bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white text-zinc-900 dark:text-white px-4 py-2 text-xs">SPACE</Kbd>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t.common.toReveal}</span>
               </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-4 md:gap-6 w-full max-w-xl">
              <button onClick={() => handleNext(0)} className="flex-1 group flex flex-col items-center justify-center py-6 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20 transition-all relative">
                <X size={24} className="text-zinc-300 group-hover:text-red-500 transition-colors mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-600 mb-4">{t.study.forgot}</span>
                <Kbd className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700">1</Kbd>
              </button>
              
              <button onClick={() => handleNext(3)} className="flex-1 group flex flex-col items-center justify-center py-6 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-900 dark:hover:border-white hover:shadow-2xl transition-all relative">
                <RotateCcw size={24} className="text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest mb-4">{t.study.hard}</span>
                <Kbd className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700">2</Kbd>
              </button>

              <button onClick={() => handleNext(5)} className="flex-1 group flex flex-col items-center justify-center py-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-2xl shadow-zinc-900/40 hover:scale-[1.05] transition-all relative overflow-hidden">
                <Check size={24} strokeWidth={4} className="mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest mb-4">{t.study.easy}</span>
                <Kbd className="bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900 border-white/20 dark:border-zinc-900/20">3</Kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size, className }: any) => <div className={className}><Check size={size} strokeWidth={4} /></div>;
