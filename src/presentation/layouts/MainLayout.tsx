import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { BookOpen, Settings, Layout, GraduationCap, BarChart3 } from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { cn } from '../../lib/utils';

export const MainLayout: React.FC = () => {
  const { t } = useMasteryStore();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-20 md:pb-0">
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
                <GraduationCap className="text-white dark:text-zinc-900" size={20} />
              </div>
              <h1 className="text-lg font-bold tracking-tight">ActiveRecall</h1>
            </div>
            
            <nav className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <BarChart3 size={16} />
                <span>{t.nav.dashboard}</span>
              </NavLink>
              <NavLink
                to="/study"
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <BookOpen size={16} />
                <span>{t.nav.study}</span>
              </NavLink>
              <NavLink
                to="/library"
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  isActive 
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Layout size={16} />
                <span>{t.nav.library}</span>
              </NavLink>
            </nav>

            <div className="flex items-center gap-4">
              <NavLink 
                to="/settings"
                className={({ isActive }) => cn(
                  "p-2 transition-colors rounded-full",
                  isActive ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <Settings size={20} />
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-zinc-900 dark:text-zinc-100" size={24} />
          <h1 className="text-base font-bold tracking-tight">ActiveRecall</h1>
        </div>
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            "p-2 rounded-full",
            isActive ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
          )}
        >
          <Settings size={20} />
        </NavLink>
      </header>

      <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-around px-6 z-50">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
          )}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.nav.dashboard}</span>
        </NavLink>
        <NavLink
          to="/study"
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
          )}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.nav.study}</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
          )}
        >
          <Layout size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.nav.library}</span>
        </NavLink>
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:block fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <div className="flex gap-4">
            <span>v1.0.0</span>
            <span>Offline Mode Enabled</span>
          </div>
          <div className="flex gap-4">
            <span>Keyboard Shortcuts: [Space] Flip, [←/→] Rate</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
