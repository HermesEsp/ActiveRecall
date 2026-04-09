import React, { useState, useRef, useEffect } from 'react';
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
  const [isAdding, setIsAdding] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<FlashcardType>('standard');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) return;
    if (editingCard) {
      updateCard(editingCard.id, front, back, category, type);
      setEditingCard(null);
    } else {
      addCard(front, back, category, type);
    }
    resetForm();
  };

  const resetForm = () => {
    setFront('');
    setBack('');
    setCategory('General');
    setType('standard');
    setIsAdding(false);
    setEditingCard(null);
  };

  const startEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setCategory(card.category);
    setType(card.type || 'standard');
    setIsAdding(true);
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(search.toLowerCase()) ||
                         card.back.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = getCategories();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{t.library.title}</h2>
          <p className="text-zinc-900 dark:text-zinc-100 font-medium">{t.library.count.replace('{count}', cards.length.toString())}</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <Plus size={18} />
            <span>{t.library.add}</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder={t.library.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 md:py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl md:rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-900 dark:focus:border-zinc-500 transition-all text-sm"
          />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          t={t}
        />
      </div>

      {isAdding && (
        <div className="mb-8 p-5 md:p-6 border border-zinc-900 dark:border-zinc-500 rounded-xl bg-zinc-50 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editingCard ? t.library.editCard : t.library.newCard}</h3>
            <button onClick={resetForm} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.library.type}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('standard')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                    type === 'standard' ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                  )}
                >
                  {t.library.standard}
                </button>
                <button
                  type="button"
                  onClick={() => setType('cloze')}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                    type === 'cloze' ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                  )}
                >
                  {t.library.cloze}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.library.front}</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 min-h-[120px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed"
                placeholder={type === 'cloze' ? t.library.clozeHint : "Enter the question or prompt..."}
                required
              />
              {type === 'cloze' && (
                <p className="mt-2 text-[10px] text-zinc-400 italic">{t.library.clozeHint}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.library.back}</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 min-h-[120px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm leading-relaxed"
                placeholder="Enter the answer or explanation..."
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.library.category}</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
                placeholder="Ex: Mathematics, History, React..."
              />
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="order-2 md:order-1 px-6 py-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold uppercase tracking-widest text-[10px]"
              >
                {t.library.cancel}
              </button>
              <button
                type="submit"
                className="order-1 md:order-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg active:scale-[0.98]"
              >
                {editingCard ? t.library.update : t.library.save}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card) => (
          <div 
            key={card.id}
            className="p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group relative flex flex-col shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {card.category}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        i < card.masteryLevel ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(card)}
                    className="p-2 md:p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteCard(card.id)}
                    className="p-2 md:p-1 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 text-sm md:text-base">{card.front}</h4>
            <p className="text-xs md:text-sm text-zinc-500 line-clamp-3 mb-4 flex-grow leading-relaxed">{card.back}</p>
            
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-t border-zinc-50 dark:border-zinc-800 pt-3">
              <span>{t.library.mastery}: {card.masteryLevel}/5</span>
              <span>{card.nextReviewAt ? `${t.library.next}: ${new Date(card.nextReviewAt).toLocaleDateString()}` : t.library.new}</span>
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
