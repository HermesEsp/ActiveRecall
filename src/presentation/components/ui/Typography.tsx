import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = '' }) => (
  <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ${className}`}>
    {children}
  </h2>
);

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTitle: React.FC<TitleProps> = ({ children, className = '' }) => (
  <h1 className={`text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter ${className}`}>
    {children}
  </h1>
);
