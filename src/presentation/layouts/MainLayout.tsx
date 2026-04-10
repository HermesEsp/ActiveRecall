import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  SquarePlay, 
  Library, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  Zap,
  Terminal,
  Keyboard,
  Command,
  User,
  ChevronRight
} from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 px-8 py-1.5 transition-all relative group ${
        isActive 
          ? 'text-zinc-900 dark:text-white' 
          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="relative z-10 transition-transform group-hover:-translate-y-0.5" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">{label}</span>
        {isActive && (
          <div className="absolute inset-x-2 -bottom-1 h-3 bg-zinc-900/5 dark:bg-white/5 blur-md rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 shadow-sm mx-1">
    {children}
  </kbd>
);

export const MainLayout: React.FC = () => {
  const { t } = useMasteryStore();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      
      {/* Universal Top Header - Compact & Ultra Glass */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 z-50 flex items-center justify-between px-6 md:px-10">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-900 shadow-lg group-hover:rotate-12 transition-transform">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="text-lg font-black tracking-tightest uppercase hidden sm:inline-block">ActiveRecall</span>
        </div>
        
        {/* Center: Main Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center bg-zinc-200/20 dark:bg-white/5 p-1 rounded-xl border border-white/20 dark:border-white/5">
          <NavItem to="/" icon={LayoutDashboard} label={t.nav.dashboard} />
          <NavItem to="/study" icon={SquarePlay} label={t.nav.study} />
          <NavItem to="/library" icon={Library} label={t.nav.library} />
        </nav>

        {/* Right: Settings & Version */}
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-30 mr-4">
              <Terminal size={10} className="mr-1" />
              {t.common.version}
           </div>
           
           <Link 
            to="/settings" 
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 rounded-lg shadow-lg hover:scale-105 transition-all group backdrop-blur-md"
           >
              <div className="w-6 h-6 bg-white/10 dark:bg-zinc-900/10 rounded-md flex items-center justify-center">
                 <SettingsIcon size={14} className="group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden md:inline-block">{t.nav.settings}</span>
           </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-32 md:pb-24 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-t border-zinc-200/50 dark:border-white/5 z-50 flex md:hidden items-center justify-around px-4 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <NavItem to="/" icon={LayoutDashboard} label={t.nav.dashboard} />
        <NavItem to="/study" icon={SquarePlay} label={t.nav.study} />
        <NavItem to="/library" icon={Library} label={t.nav.library} />
      </nav>

      {/* Universal Shortcut Footer (Desktop Only) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8 py-2.5 px-8 bg-zinc-900/80 dark:bg-white/80 text-white dark:text-zinc-900 rounded-full shadow-2xl border border-white/10 dark:border-black/5 backdrop-blur-xl z-40 transition-all hover:scale-105 hover:bg-zinc-900 dark:hover:bg-white">
        <div className="flex items-center gap-1 border-r border-white/20 dark:border-black/20 pr-8">
           <Keyboard size={14} className="mr-2" />
           <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">{t.common.shortcuts.split(':')[0]}</span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <Kbd>Space</Kbd><span className="text-[8px] font-black uppercase opacity-50">Flip</span>
           </div>
           <div className="w-1 h-1 rounded-full bg-white/20 dark:bg-black/20" />
           <div className="flex items-center gap-2">
              <div className="flex"><Kbd>1</Kbd><Kbd>2</Kbd><Kbd>3</Kbd></div>
              <span className="text-[8px] font-black uppercase opacity-50">Rate</span>
           </div>
           <div className="w-1 h-1 rounded-full bg-white/20 dark:bg-black/20" />
           <div className="flex items-center gap-2">
              <Kbd>Cmd</Kbd>
              <div className="flex"><Kbd>B</Kbd><Kbd>I</Kbd><Kbd>U</Kbd><Kbd>E</Kbd><Kbd>J</Kbd></div>
              <span className="text-[8px] font-black uppercase opacity-50">Style</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
