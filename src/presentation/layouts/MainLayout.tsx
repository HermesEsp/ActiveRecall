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
  Search,
  ChevronRight,
  Circle
} from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-5 py-2 rounded-lg transition-all duration-500 group ${
        isActive 
          ? 'text-zinc-900 dark:text-white bg-zinc-900/5 dark:bg-white/5' 
          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-900/5 dark:hover:bg-white/5'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">{label}</span>
        {isActive && (
          <div className="absolute -left-1 w-1 h-3 bg-zinc-900 dark:bg-white rounded-full" />
        )}
      </>
    )}
  </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1.5 px-6 py-2 transition-all relative ${
        isActive 
          ? 'text-white scale-110' 
          : 'text-zinc-500'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        {isActive && (
          <div className="absolute -bottom-1 w-4 h-0.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        )}
      </>
    )}
  </NavLink>
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[10px] font-black text-zinc-400 shadow-sm mx-1">
    {children}
  </kbd>
);

export const MainLayout: React.FC = () => {
  const { t, user } = useMasteryStore();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 font-sans antialiased">
      
      {/* PROFESSIONAL HEADER SYSTEM */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 z-50 flex items-center justify-between px-6 md:px-12">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-9 h-9 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-950 shadow-xl group-hover:rotate-12 transition-transform duration-500">
              <div className="relative">
                <Zap size={20} fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950 dark:border-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tightest uppercase leading-none">ActiveRecall</span>
              <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-zinc-400 mt-1">{t.common.version.split(' ')[0]}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 p-1 bg-zinc-900/5 dark:bg-white/5 rounded-xl">
            <NavItem to="/dashboard" icon={LayoutDashboard} label={t.nav.dashboard} />
            <NavItem to="/study" icon={SquarePlay} label={t.nav.study} />
            <NavItem to="/library" icon={Library} label={t.nav.library} />
          </nav>
        </div>
        
        {/* Right: Actions & User */}
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-lg text-zinc-400 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-all">
              <Search size={14} />
              <div className="flex items-center gap-1.5">
                 <span className="text-[9px] font-bold uppercase tracking-widest">Search</span>
                 <div className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
              </div>
           </div>

           <div className="flex items-center gap-4 pl-6 border-l border-zinc-200 dark:border-white/5">
              <Link 
                to="/settings" 
                className="w-10 h-10 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group overflow-hidden"
              >
                 <User size={18} />
              </Link>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-32 md:pb-24 min-h-screen">
        <Outlet />
      </main>

      {/* REFINED MOBILE BOTTOM BAR - Dark Glass Tactical */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm h-16 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl z-50 flex md:hidden items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <MobileNavItem to="/dashboard" icon={LayoutDashboard} label={t.nav.dashboard} />
        <MobileNavItem to="/study" icon={SquarePlay} label={t.nav.study} />
        <MobileNavItem to="/library" icon={Library} label={t.nav.library} />
      </div>

      {/* REFINED SHORTCUT FOOTER (Desktop Only) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8 py-3 px-8 bg-white/60 dark:bg-zinc-900/60 text-zinc-900 dark:text-white rounded-full shadow-2xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl z-40 transition-all">
        <div className="flex items-center gap-3 border-r border-zinc-200 dark:border-white/10 pr-8">
           <Terminal size={14} className="text-zinc-400" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Tactical Bar</span>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Kbd>SPACE</Kbd>
              <span className="text-[8px] font-black uppercase opacity-40">Flip</span>
           </div>
           <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
           <div className="flex items-center gap-2">
              <div className="flex gap-0.5"><Kbd>1</Kbd><Kbd>2</Kbd><Kbd>3</Kbd></div>
              <span className="text-[8px] font-black uppercase opacity-40">Rate</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
