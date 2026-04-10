import React from 'react';

interface GroupDividerProps {
  label: string;
  count?: number;
}

export const GroupDivider: React.FC<GroupDividerProps> = ({ label, count }) => (
  <div className="flex items-center gap-3 mb-8 mt-12 first:mt-0">
    <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
    <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-black text-zinc-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md">
          {count}
        </span>
      )}
    </div>
    <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-800" />
  </div>
);
