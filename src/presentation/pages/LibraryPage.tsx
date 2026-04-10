import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Search, Edit2, X, ChevronDown, Filter } from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
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
  const { cards, addCard, updateCard, deleteCard, getCategories, t } = useMasteryStore();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [captureCategory, setCaptureCategory] = useState('');
  const [lastCreated, setLastCreated] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const backRef = useRef<HTMLTextAreaElement>(null);
  const frontRef = useRef<HTMLTextAreaElement>(null);

  const insertCloze = () => {
    const el = frontRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = `${before}{{${selected}}}${after}`;
    setFront(newText);
    
    // Position cursor inside or after
    setTimeout(() => {
      el.focus();
      const newPos = selected ? start + selected.length + 4 : start + 2;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleFrontKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Auto-pair [[ to {{}}
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

  // Sync capture category with filter, but allow overrides
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

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCapture();
    }
  };

  const categories = getCategories();
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(search.toLowerCase()) ||
                         card.back.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Grouping logic
  const groupedCards = categories.reduce((acc, cat) => {
    if (cat === 'All') return acc;
    const cardsInCat = filteredCards.filter(c => c.category === cat);
    if (cardsInCat.length > 0) {
      acc[cat] = cardsInCat;
    }
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

      {/* Turbo Capture Area - Mobile First */}
      <div className="mb-16">
        <div className="bg-zinc-100 dark:bg-zinc-900/50 p-1 md:p-1.5 rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 transition-all focus-within:border-zinc-900 dark:focus-within:border-zinc-500">
          <form 
            onSubmit={handleCapture}
            className="bg-white dark:bg-zinc-900 rounded-[26px] p-5 md:p-8 shadow-sm"
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.library.cardFront}</label>
                    <button 
                      type="button"
                      onClick={insertCloze}
                      className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Wrap selection in Cloze {{}}"
                    >
                      {'{ }'} CLOZE
                    </button>
                  </div>
                  <textarea
                    ref={frontRef}
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    onKeyDown={handleFrontKeyDown}
                    placeholder={t.library.frontPlaceholder}
                    enterKeyHint="next"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 md:p-5 rounded-2xl border-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 text-lg md:text-xl font-medium resize-none min-h-[100px] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t.library.cardBack}</label>
                  <textarea
                    ref={backRef}
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    onKeyDown={handleBackKeyDown}
                    placeholder={t.library.backPlaceholder}
                    enterKeyHint="done"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 p-4 md:p-5 rounded-2xl border-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 text-lg md:text-xl font-medium resize-none min-h-[100px] transition-all"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                <div className="w-full md:w-auto space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">{t.library.categoryLabel}</label>
                  <input 
                    type="text"
                    value={captureCategory}
                    onChange={(e) => setCaptureCategory(e.target.value)}
                    className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-zinc-900/10"
                    placeholder="New category name..."
                  />
                </div>

                <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
                  <AnimatePresence>
                    {lastCreated && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-emerald-500 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={16} /> {t.library.addedFeedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="submit"
                    disabled={!front.trim() || !back.trim()}
                    className="w-full md:w-auto px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:scale-100 transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
                  >
                    {editingCard ? t.library.update : t.library.createButton}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden md:flex items-center justify-center gap-2">
          <span>{t.library.proTip.replace('{key}', 'Enter')}</span>
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder={t.library.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-5 md:py-4 border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all text-sm font-bold"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          t={t}
        />
      </div>

      <div className="space-y-16">
        {Object.entries(groupedCards).map(([category, items]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic">{category}</h3>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {items.length} cards
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((card) => (
                <div 
                  key={card.id}
                  className="p-6 md:p-8 border-2 border-zinc-100 dark:border-zinc-800 rounded-[24px] bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-400 transition-all group relative flex flex-col shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                      {t.library.mastery}: {card.masteryLevel}/5
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(card)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCard(card.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight">{card.front}</h4>
                  <p className="text-sm text-zinc-500 line-clamp-3 mb-6 flex-grow leading-relaxed font-medium">{card.back}</p>
                  
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-black uppercase tracking-widest border-t border-zinc-50 dark:border-zinc-800 pt-5">
                    <span>{card.type === 'cloze' ? 'CLOZE' : 'STANDARD'}</span>
                    <span>{card.nextReviewAt ? `${t.library.next}: ${new Date(card.nextReviewAt).toLocaleDateString()}` : 'New Card'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
          <p className="text-zinc-400">{t.library.noCards}</p>
        </div>
      )}
    </div>
  );
};
