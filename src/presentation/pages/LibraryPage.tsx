import React, { useState, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2,
  Eye, Bold, Italic, Underline as UnderlineIcon, Code,
  Layers, Zap, Sparkles, MousePointer2, Scissors,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { useTranslation } from '../hooks/useTranslation';
import { useStudySessionStore } from '../../application/store/useStudySessionStore';
import { Card as CardComponent } from '../components/Card';
import { Label, PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { MethodologyTip } from '../components/ui/MethodologyTip';
import { GroupDivider } from '../components/ui/GroupDivider';

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-[8px] font-black text-zinc-400 ml-1.5 shadow-sm">
    {children}
  </kbd>
);

const CategoryFilter = ({ categories, selected, onSelect, t }: any) => (
  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
    <button
      onClick={() => onSelect('All')}
      className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${selected === 'All'
        ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl dark:bg-white dark:border-white dark:text-zinc-900'
        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-100'
        }`}
    >
      {t.library.allCategories}
    </button>
    {categories.map((cat: string) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${selected === cat
          ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl dark:bg-white dark:border-white dark:text-zinc-900'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-100'
          }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

interface DeckCardProps {
  category: string;
  count: number;
  onClick: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ category, count, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 p-10 text-left hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-2xl overflow-hidden"
  >
    {/* Stack Effect */}
    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-800 translate-y-[-100%] group-hover:translate-y-0 transition-transform" />
    <div className="absolute top-0 left-0 w-full h-2 bg-zinc-100 dark:bg-zinc-800/50 translate-y-[-100%] group-hover:translate-y-[-50%] transition-transform delay-75" />

    <div className="relative z-10">
      <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all shadow-inner">
        <Layers size={28} />
      </div>
      <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight line-clamp-1">{category}</h3>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{count} cards</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </div>
    </div>

    {/* Decorative Icon */}
    <div className="absolute right-0 bottom-0 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity translate-x-1/4 translate-y-1/4">
      <Layers size={180} />
    </div>
  </button>
);

export const LibraryPage: React.FC = () => {
  const { cards, addCard, deleteCard, updateCard, getCategories } = useMasteryStore();
  const { t } = useTranslation();
  const { startSession } = useStudySessionStore();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [captureCategory, setCaptureCategory] = useState('General');
  const [editingCard, setEditingCard] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewingCard, setViewingCard] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);

  const categories = getCategories();

  const wrapSelection = (prefix: string, suffix: string, target: 'front' | 'back') => {
    const el = target === 'front' ? frontRef.current : backRef.current;
    const setter = target === 'front' ? setFront : setBack;
    const value = target === 'front' ? front : back;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = `${before}${prefix}${selected}${suffix}${after}`;
    setter(newValue);
    setTimeout(() => {
      el.focus();
      const newPos = selected ? start + prefix.length + selected.length + suffix.length : start + prefix.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, target: 'front' | 'back') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (target === 'front') { e.preventDefault(); backRef.current?.focus(); }
      else { e.preventDefault(); handleCapture(); }
    }
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') { e.preventDefault(); wrapSelection('**', '**', target); }
      if (e.key === 'i') { e.preventDefault(); wrapSelection('*', '*', target); }
      if (e.key === 'u') { e.preventDefault(); wrapSelection('__', '__', target); }
      if (e.key === 'e') { e.preventDefault(); wrapSelection('`', '`', target); }
      if (e.key === 'j') { e.preventDefault(); wrapSelection('{{', '}}', target); }
    }
  };

  const handleCapture = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!front.trim() || !back.trim()) return;
    if (editingCard) { updateCard(editingCard.id, front, back, captureCategory); setEditingCard(null); }
    else { addCard(front, back, captureCategory); }
    setFront(''); setBack(''); frontRef.current?.focus();
  };

  const startEdit = (card: any) => {
    setEditingCard(card); setFront(card.front); setBack(card.back); setCaptureCategory(card.category);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => frontRef.current?.focus(), 500);
  };

  const filteredCards = cards.filter(c => {
    const matchesSearch = c.front.toLowerCase().includes(search.toLowerCase()) ||
      c.back.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).reverse();

  const groupedCards = filteredCards.reduce((acc: any, card) => {
    const cat = card.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(card);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <PageTitle className="text-5xl md:text-6xl tracking-tightest">{t.nav.library}</PageTitle>
          <div className="flex items-center gap-3 mt-4 text-zinc-500 font-bold">
            <Layers size={18} />
            <span>{t.library.count.replace('{count}', cards.length.toString())}</span>
          </div>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            size="lg"
            className="shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={4} className="mr-3" />
            {t.library.createButton}
          </Button>
        )}
      </div>

      {/* Card Factory Section */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 96 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-xl p-1 shadow-2xl relative">
              <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 md:p-14 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 dark:bg-zinc-800 -rotate-45 translate-x-32 -translate-y-32 flex items-end justify-center pb-8 border border-zinc-100 dark:border-zinc-700 opacity-50" />

                <div className="relative z-10 flex flex-col gap-12">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                        {editingCard ? t.library.update : t.library.createButton}
                      </h3>
                    </div>
                    <button
                      onClick={() => { setIsCreating(false); setEditingCard(null); setFront(''); setBack(''); }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all group"
                    >
                      <Plus size={20} className="rotate-45 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  <div className="relative z-10 flex flex-col gap-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Front Area */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
                            <Label className="text-zinc-400">{t.library.cardFront}</Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => wrapSelection('**', '**', 'front')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Bold size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>B</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('*', '*', 'front')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Italic size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>I</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('__', '__', 'front')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <UnderlineIcon size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>U</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('`', '`', 'front')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Code size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>E</Kbd>
                            </button>
                            <div className="w-px h-3 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                            <button onClick={() => wrapSelection('{{', '}}', 'front')} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg shadow-lg hover:scale-105 transition-all">
                              <span className="text-[9px] font-black uppercase tracking-widest">{t.library.clozeLabel}</span>
                              <Kbd>J</Kbd>
                            </button>
                          </div>
                        </div>
                        <TextArea
                          ref={frontRef} value={front} onChange={(e) => setFront(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'front')}
                          placeholder={t.library.frontPlaceholder}
                          className="text-xl font-bold min-h-[140px] border-zinc-100 focus:border-zinc-900 bg-zinc-50/20"
                        />
                      </div>

                      {/* Back Area */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2 h-8">
                            <div className="w-1.5 h-1.5 rounded-full border border-zinc-900 dark:border-white" />
                            <Label className="text-zinc-400">{t.library.cardBack}</Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => wrapSelection('**', '**', 'back')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Bold size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>B</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('*', '*', 'back')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Italic size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>I</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('__', '__', 'back')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <UnderlineIcon size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>U</Kbd>
                            </button>
                            <button onClick={() => wrapSelection('`', '`', 'back')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors group flex items-center">
                              <Code size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                              <Kbd>E</Kbd>
                            </button>
                            <div className="w-px h-3 bg-zinc-100 dark:bg-zinc-800 mx-1" />
                            <button onClick={() => wrapSelection('{{', '}}', 'back')} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:border-zinc-900 transition-all border border-zinc-100 dark:border-zinc-700">
                              <Scissors size={12} className="text-zinc-400" />
                              <Kbd>J</Kbd>
                            </button>
                          </div>
                        </div>
                        <TextArea
                          ref={backRef} value={back} onChange={(e) => setBack(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'back')}
                          placeholder={t.library.backPlaceholder}
                          className="text-xl font-bold min-h-[140px] border-zinc-100 focus:border-zinc-900 bg-zinc-50/20"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center pt-8 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="w-full md:w-80">
                        <Label className="mb-2 px-1 block opacity-30 uppercase text-[9px] tracking-widest">{t.library.categoryLabel}</Label>
                        <Input value={captureCategory} onChange={(e) => setCaptureCategory(e.target.value)}
                          className="bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none px-1 font-black uppercase text-xs tracking-wider focus:border-zinc-900"
                          placeholder="General..."
                        />
                      </div>
                      <div className="flex-grow w-full">
                        <button onClick={handleCapture} disabled={!front || !back}
                          className="w-full py-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-30 flex items-center justify-center gap-4 group"
                        >
                          <Plus size={20} strokeWidth={4} />
                          {editingCard ? t.library.update : t.library.createButton}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library Browser */}
      <div className="space-y-12">
        <div className="sticky top-0 z-40 bg-zinc-50/60 dark:bg-zinc-950/60 backdrop-blur-xl py-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:max-w-md">
              <Input icon={<Search size={18} className="text-zinc-400" />} placeholder={t.library.search} value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white/50 dark:bg-zinc-900/50 border-zinc-200/50" />
            </div>
            <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} t={t} />
          </div>
        </div>

        <div className="space-y-24">
          {(selectedCategory === 'All' && !search) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {Object.entries(groupedCards).map(([category, categoryCards]: any) => (
                <DeckCard
                  key={category}
                  category={category}
                  count={categoryCards.length}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          ) : (
            Object.entries(groupedCards).map(([category, categoryCards]: any) => (
              <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8 group">
                  <GroupDivider label={category} count={categoryCards.length} />
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                    >
                      ← {t.study.back}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryCards.map((card: any) => (
                    <div key={card.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-8 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-2xl flex flex-col min-h-[280px] group relative">
                      <div className="flex justify-between items-start mb-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-lg group-hover:bg-zinc-900 group-hover:text-white transition-colors">{card.category}</span>
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => { setViewingCard(card); setIsFlipped(false); }} className="p-2" aria-label={t.library.quickPreview}>
                            <Eye size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(card)} className="p-2" aria-label={t.library.update}>
                            <Edit2 size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteCard(card.id)} className="p-2 hover:text-red-500" aria-label={t.common.delete}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-4 line-clamp-3 leading-tight tracking-tight">{card.front}</h4>
                      <p className="text-sm text-zinc-400 line-clamp-3 mb-12 flex-grow font-medium leading-relaxed">{card.back}</p>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-600 border-t border-zinc-50 dark:border-zinc-800 pt-6">
                        <div className="flex items-center gap-2"><Zap size={12} fill="currentColor" /><span>Lv. {card.masteryLevel}</span></div>
                        <span>{card.nextReviewAt ? new Date(card.nextReviewAt).toLocaleDateString() : t.dashboard.future}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-24">
        <MethodologyTip title={t.study.howItWorks.title} description={t.study.howItWorks.desc} />
      </div>

      <Modal isOpen={!!viewingCard} onClose={() => setViewingCard(null)} title={t.library.quickPreview} subtitle={viewingCard?.category}>
        <div className="flex flex-col items-center gap-10 py-6">
          <CardComponent card={viewingCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
          <div className="flex items-center gap-4 text-zinc-400 font-black uppercase tracking-widest text-[10px] animate-pulse">
            <MousePointer2 size={12} />{t.library.tapToFlip}
          </div>
        </div>
      </Modal>
    </div>
  );
};
