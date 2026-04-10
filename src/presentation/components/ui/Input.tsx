import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, className = '', ...props }, ref) => (
  <div className="space-y-4 w-full">
    {label && (
      <div className="h-10 flex items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</label>
      </div>
    )}
    <textarea
      ref={ref}
      className={`
        w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 
        rounded-xl p-6 text-zinc-900 dark:text-zinc-100 
        focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white 
        transition-all outline-none resize-none min-h-[160px] 
        text-lg font-semibold leading-relaxed
        ${className}
      `}
      {...props}
    />
  </div>
));

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, icon, className = '', ...props }, ref) => (
  <div className="space-y-2 w-full">
    {label && (
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">{label}</label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`
          w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 
          rounded-xl py-3.5 ${icon ? 'pl-12' : 'px-5'} pr-4
          text-zinc-900 dark:text-zinc-100 
          focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white 
          transition-all outline-none text-sm font-semibold
          ${className}
        `}
        {...props}
      />
    </div>
  </div>
));

TextArea.displayName = 'TextArea';
Input.displayName = 'Input';
