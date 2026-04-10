import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Label } from './Typography';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  maxWidth = 'max-w-lg' 
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }} 
          className={`relative w-full ${maxWidth} bg-zinc-50 dark:bg-zinc-900 rounded-xl p-8 md:p-12 shadow-2xl overflow-hidden`}
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X size={24} />
          </button>
          
          {(title || subtitle) && (
            <div className="flex flex-col items-center gap-1 text-center mb-8">
              {title && <Label>{title}</Label>}
              {subtitle && <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight">{subtitle}</p>}
            </div>
          )}
          
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
