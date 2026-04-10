import React from 'react';
import { motion } from 'motion/react';
import { Flashcard } from '../../domain/entities/Flashcard';

interface CardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onFlipComplete?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, isFlipped, onFlip, onFlipComplete }) => {
  const renderText = (text: string) => {
    // Extended Markdown support
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|__.*?__)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-zinc-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic opacity-90">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-500 dark:text-pink-400 font-bold">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={i} className="underline decoration-zinc-400 underline-offset-4">{part.slice(2, -2)}</u>;
      }
      return part;
    });
  };

  const renderFront = () => {
    if (card.type === 'cloze') {
      const text = card.front.replace(/\{\{(.*?)\}\}/g, '[ ... ]');
      return renderText(text);
    }
    return renderText(card.front);
  };

  const renderBack = () => {
    if (card.type === 'cloze') {
      const parts = card.front.split(/(\{\{.*?\}\})/);
      return (
        <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed px-4">
          {parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
              return (
                <span key={i} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-1.5 py-0.5 rounded mx-0.5 font-bold">
                  {renderText(part.slice(2, -2))}
                </span>
              );
            }
            return renderText(part);
          })}
        </p>
      );
    }
    return (
      <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed px-4">
        {renderText(card.back)}
      </p>
    );
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto aspect-[3/4] md:aspect-[4/3] perspective-1000 cursor-pointer group"
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        onAnimationComplete={() => onFlipComplete?.()}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col p-6 md:p-8 items-center justify-center text-center">
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {card.category}
          </span>
          <h3 className="text-lg md:text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-tight px-4">
            {renderFront()}
          </h3>
          <div className="absolute bottom-4 text-[10px] md:text-xs text-zinc-400 font-medium uppercase tracking-wider">
            <span className="md:hidden">Tap to flip</span>
            <span className="hidden md:inline">Click or Space to flip</span>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm flex flex-col p-6 md:p-8 items-center justify-center text-center rotate-y-180"
        >
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {card.type === 'cloze' ? 'Cloze' : 'Answer'}
          </span>
          {renderBack()}
          <div className="absolute bottom-4 text-[10px] md:text-xs text-zinc-400 font-medium uppercase tracking-wider">
            Level {card.masteryLevel} Mastery
          </div>
        </div>
      </motion.div>
    </div>
  );
};
