import React from 'react';
import { Info } from 'lucide-react';

interface MethodologyTipProps {
  title: string;
  description: string;
}

export const MethodologyTip: React.FC<MethodologyTipProps> = ({ title, description }) => (
  <div className="mt-12 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex gap-4 items-start">
    <Info className="text-zinc-400 shrink-0" size={20} />
    <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </p>
      {description}
    </div>
  </div>
);
