import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle2, 
  ChevronRight, Filter, Eye, X, ChevronDown,
  Bold, Italic, Underline as UnderlineIcon, Code, Info, RotateCcw
} from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Card } from '../components/Card';
import { cn } from '../../lib/utils';
import { Flashcard, FlashcardType } from '../../domain/entities/Flashcard';

const CategoryFilter: React.FC<{
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
  t: any;
}> = ({ categories, selected, onSelect, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = categories.length - 1; // exclude "All"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-3 md:py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl md:rounded-md bg-white dark:bg-zinc-900 text-sm font-medium transition-all hover:border-zinc-300 dark:hover:border-zinc-600 min-w-[160px]"
      >
        <Filter size={16} className="text-zinc-400 shrink-0" />
        <span className="text-zinc-900 dark:text-zinc-100 truncate">{selected === 'All' ? `${t.library.filter} (${count})` : selected}</span>
        <ChevronDown size={14} className={cn("ml-auto text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 md:left-0 top-full mt-2 z-50 w-full min-w-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { onSelect(cat); setOpen(false); }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                selected === cat
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              {cat === 'All' ? t.library.viewAll : cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LibraryPage: React.FC = () => {
  const { cards, addCard, deleteCard, updateCard, getCategories, t } = useMasteryStore();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [captureCategory, setCaptureCategory] = useState('General');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [viewingCard, setViewingCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (prefix: string, suffix: string, target: 'front' | 'back' = 'front') => {
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

  const handleFrontKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); wrapSelection('**', '**'); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); wrapSelection('*', '*'); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'u') { e.preventDefault(); wrapSelection('__', '__'); }
    
    if (e.key === '[' && front.endsWith('[')) {
      e.preventDefault();
      const newText = front.slice(0, -1) + '{{}}';
      setFront(newText);
      setTimeout(() => {
        const pos = front.length + 1;
        frontRef.current?.setSelectionRange(pos, pos);
      }, 0);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      backRef.current?.focus();
    }
  };

  useEffect(() => {
    if (selectedCategory !== 'All') {
      setCaptureCategory(selectedCategory);
    } else {
      setCaptureCategory('General');
    }
  }, [selectedCategory]);

  const handleCapture = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!front.trim() || !back.trim()) return;
    
    if (editingCard) {
      updateCard(editingCard.id, front, back, captureCategory);
      setEditingCard(null);
    } else {
      addCard(front, back, captureCategory);
      setLastCreated(front);
      setTimeout(() => setLastCreated(null), 2000);
    }

    setFront('');
    setBack('');
    frontRef.current?.focus();
  };

  const startEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setCaptureCategory(card.category);
    frontRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startView = (card: Flashcard) => {
    setViewingCard(card);
    setIsFlipped(false);
  };

  const categories = getCategories();
  const filteredCards = cards.filter(card => {
    const s = search.toLowerCase();
    const matchesSearch = card.front.toLowerCase().includes(s) || card.back.toLowerCase().includes(s);
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedCards = categories.reduce((acc, cat) => {
    if (cat === 'All') return acc;
    const cardsInCat = filteredCards.filter(c => c.category === cat);
    if (cardsInCat.length > 0) acc[cat] = cardsInCat;
    return acc;
  }, {} as Record<string, Flashcard[]>);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">{t.library.title}</h2>
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100 italic">
          {t.library.count.replace('{count}', cards.length.toString())}
        </h1>
      </div>

      {/* Turbo Capture Area */}
      <div className="mb-16">
        <div className="bg-zinc-100 dark:bg-zinc-900/50 p-1 md:p-1.5 rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-900 dark:focus-within:border-zinc-500 transition-all">
          <div className="bg-white dark:bg-zinc-900 rounded-[26px] p-5 md:p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.library.cardFront}</label>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => wrapSelection('**', '**')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500" title={`${t.library.bold} (Cmd+B)`}><Bold size={14} /></button>
                      <button type="button" onClick={() => wrapSelection('*', '*')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500" title={`${t.library.italic} (Cmd+I)`}><Italic size={14} /></button>
                      <button type="button" onClick={() => wrapSelection('__', '__')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500" title={`${t.library.underline} (Cmd+U)`}><UnderlineIcon size={14} /></button>
                      <button type="button" onClick={() => wrapSelection('`', '`')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500" title={t.library.code}><Code size={14} /></button>
                      <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                      <button 
                        type="button" 
                        onClick={() => wrapSelection('{{', '}}')} 
                        className="text-[10px] font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-1 rounded-lg hover:scale-105 transition-all shadow-sm"
                        title={t.library.clozeHint}
                      >
                        {'{ }'} {t.library.clozeLabel}
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={frontRef}
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    onKeyDown={handleFrontKeyDown}
                    placeholder={t.library.frontPlaceholder}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 md:p-6 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none resize-none min-h-[140px] text-lg font-medium leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">{t.library.cardBack}</label>
                  <textarea
                    ref={backRef}
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCapture(); } }}
                    placeholder={t.library.backPlaceholder}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 md:p-5 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all outline-none resize-none min-h-[120px] text-base leading-relaxed"
                  />
                  <p className="hidden md:flex text-[10px] text-zinc-400 font-medium px-1 items-center gap-1.5 italic">
                    <Info size={10} />
                    {t.library.proTip.replace('{key}', 'Enter')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                  type="text" 
                  value={captureCategory} 
                  onChange={(e) => setCaptureCategory(e.target.value)}
                  className="w-full md:w-48 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-zinc-900/10 outline-none" 
                  placeholder={t.library.categoryLabel}
                />
                <button
                  onClick={handleCapture}
                  disabled={!front || !back}
                  className="w-full md:flex-grow bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-[0.1em] hover:scale-[1.02] transition-all disabled:opacity-20 shadow-xl flex items-center justify-center gap-3"
                >
                  <Plus size={18} strokeWidth={3} />
                  {editingCard ? t.library.update : t.library.createButton}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="sticky top-0 z-10 py-4 mb-8 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.library.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none text-zinc-900 dark:text-zinc-100 shadow-sm"
            />
          </div>
          <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} t={t} />
        </div>

        {/* Grouped Cards View */}
        {Object.entries(groupedCards).map(([category, categoryCards]) => (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {category === 'All' ? t.library.allCategories : category}
                </span>
                <span className="text-[10px] font-black text-zinc-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md">
                  {categoryCards.length}
                </span>
              </div>
              <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryCards.map((card) => (
                <div key={card.id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-2xl transition-all flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-md">
                      {card.category}
                    </span>
                    <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startView(card)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" title={t.library.viewCard}><Eye size={18} /></button>
                      <button onClick={() => startEdit(card)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" title={t.library.editCard}><Edit2 size={18} /></button>
                      <button onClick={() => deleteCard(card.id)} className="p-2 text-zinc-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight">{card.front}</h4>
                  <p className="text-sm text-zinc-500 line-clamp-3 mb-6 flex-grow leading-relaxed">{card.back}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-black uppercase tracking-widest border-t border-zinc-50 dark:border-zinc-800 pt-5">
                    <span>{card.type === 'cloze' ? t.library.clozeLabel : t.library.standardLabel}</span>
                    <span>{card.nextReviewAt ? `${t.library.next}: ${new Date(card.nextReviewAt).toLocaleDateString()}` : t.dashboard.future}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCards.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
            <p className="text-zinc-400">{t.library.noCards}</p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {viewingCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingCard(null)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-8 md:p-12 shadow-2xl">
              <button onClick={() => setViewingCard(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" title={t.library.cancel}><X size={24} /></button>
              <div className="flex flex-col items-center gap-8 text-center">
                 <div className="space-y-1">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t.library.quickPreview}</h3>
                   <p className="text-xs font-bold text-emerald-500">{viewingCard.category}</p>
                 </div>
                 <div className="w-full">
                   <Card card={viewingCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.library.tapToFlip}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
