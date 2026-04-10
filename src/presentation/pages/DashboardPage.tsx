import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Play, Calendar, TrendingUp, Flame } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { cards, streak, t, getStudyCards, theme } = useMasteryStore();
  const navigate = useNavigate();

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const cardsDue = getStudyCards('All').length;

  const cardsDueTomorrow = cards.filter(c => {
    if (!c.nextReviewAt) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    const date = new Date(c.nextReviewAt);
    return date > new Date() && date <= tomorrow;
  }).length;

  const cardsDueFuture = cards.filter(c => {
    if (!c.nextReviewAt) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return new Date(c.nextReviewAt) > tomorrow;
  }).length;

  const masteryDist = [1, 2, 3, 4, 5].map(lvl => ({
    level: `Lvl ${lvl}`,
    count: cards.filter(c => c.masteryLevel === lvl).length
  }));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-16">
      {/* Hero Action Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="px-6 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center gap-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <Flame size={18} className={streak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-zinc-400"} />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
               {streak > 0 ? t.dashboard.streakDays.replace('{count}', streak.toString()) : t.dashboard.streakStart}
             </span>
          </div>
        </div>
        
        <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t.dashboard.startPrompt}</h2>
        <div className="bg-zinc-900 dark:bg-zinc-100 p-10 md:p-16 rounded-[40px] shadow-2xl shadow-zinc-200 dark:shadow-none relative overflow-hidden group">
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h1 className="text-4xl md:text-6xl font-black text-white dark:text-zinc-900 tracking-tight leading-tight">
              {cardsDue > 0 
                ? t.dashboard.reviewCount.replace('{count}', cardsDue.toString())
                : t.dashboard.allCaughtUp}
            </h1>
            
            {cardsDue > 0 && (
              <button 
                onClick={() => navigate('/study')}
                className="w-full md:w-auto px-16 py-6 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-[24px] font-black text-xl hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl flex items-center justify-center gap-4 group/btn"
              >
                <span>{t.study.start}</span>
                <Play size={24} fill="currentColor" className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-zinc-900/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors" />
        </div>
      </div>

      {/* Forecast Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-zinc-300 transition-all">
          <div>
            <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.dashboard.tomorrow}</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic">{cardsDueTomorrow} cards</p>
          </div>
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group hover:border-zinc-300 transition-all">
          <div>
            <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.dashboard.future}</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic">{cardsDueFuture} cards</p>
          </div>
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Minimal Stats */}
      <div className="pt-12 border-t border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-8">{t.dashboard.masteryDist}</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={masteryDist}>
              <XAxis dataKey="level" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#27272a' : '#fff' }}
              />
              <Bar dataKey="count" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
