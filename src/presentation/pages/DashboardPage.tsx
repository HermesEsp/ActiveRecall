import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  Flame,
  GraduationCap,
  Layout as LayoutIcon,
  Calendar,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Label, PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';

// Molecules: Premium Stat Card
const StatCard = ({ icon: Icon, label, value, colorClass, gradientClass }: any) => (
  <div className={`relative bg-white dark:bg-zinc-900 p-8 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden group hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-500`}>
    <div className="relative z-10">
      <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <Label className="text-zinc-400 mb-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase tracking-[0.2em]">{label}</Label>
      <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{value}</p>
    </div>
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity`}>
      <Icon size={160} />
    </div>
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user, cards, studyHistory, t } = useMasteryStore();

  const masteredCount = cards.filter(c => c.masteryLevel >= 4).length;
  const learningCount = cards.length - masteredCount;
  const dueCount = cards.filter(c => !c.nextReviewAt || new Date(c.nextReviewAt) <= new Date()).length;

  // Chart Data Preparation
  const masteryData = [
    { name: 'Lvl 0', value: cards.filter(c => c.masteryLevel === 0).length, color: '#f43f5e' },
    { name: 'Lvl 1', value: cards.filter(c => c.masteryLevel === 1).length, color: '#f59e0b' },
    { name: 'Lvl 2', value: cards.filter(c => c.masteryLevel === 2).length, color: '#10b981' },
    { name: 'Lvl 3', value: cards.filter(c => c.masteryLevel === 3).length, color: '#3b82f6' },
    { name: 'Master', value: cards.filter(c => c.masteryLevel >= 4).length, color: '#6366f1' },
  ];

  const volumeData = studyHistory.slice(-7).map(h => ({
    date: h.date.split('-').slice(1).join('/'),
    count: h.count
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-1000">
      
      {/* Welcome Header - Robust & Modern */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
        <div className="relative">
          <PageTitle className="text-5xl md:text-6xl tracking-tightest leading-none">
            {t.dashboard.welcome.split(' ')[0]} <br/>
            <span className="text-zinc-400 dark:text-zinc-600">{user.name}!</span>
          </PageTitle>
          <div className="flex items-center gap-3 mt-6">
             <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t.dashboard.allCaughtUp}</span>
             </div>
             <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-full flex items-center gap-2">
                <Flame className="text-orange-500" size={14} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">{user.streak} {t.dashboard.days}</span>
             </div>
          </div>
        </div>

        <div className="hidden lg:block">
           <div className="bg-zinc-900 dark:bg-white p-1 rounded-xl shadow-2xl">
              <Button size="lg" onClick={() => window.location.href = '/study'} className="px-10">
                <GraduationCap size={20} className="mr-3" />
                {t.dashboard.startStudying}
              </Button>
           </div>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard 
          icon={BookOpen} 
          label={t.dashboard.totalCards} 
          value={cards.length} 
          colorClass="bg-blue-500 text-white" 
          gradientClass="from-blue-500 to-transparent"
        />
        <StatCard 
          icon={TrendingUp} 
          label={t.dashboard.mastered} 
          value={masteredCount} 
          colorClass="bg-emerald-500 text-white" 
          gradientClass="from-emerald-500 to-transparent"
        />
        <StatCard 
          icon={Zap} 
          label={t.dashboard.nextSession} 
          value={dueCount} 
          colorClass="bg-orange-500 text-white" 
          gradientClass="from-orange-500 to-transparent"
        />
      </div>

      {/* Middle Section: Insights & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Study Volume Chart - Large & Clean */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl p-10 shadow-xl group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Calendar className="text-zinc-400" size={20} />
                {t.dashboard.studyVolume}
              </h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Consistency Tracker</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#18181b',
                    color: '#fff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mastery Distribution - Visual Circle */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl p-10 shadow-xl flex flex-col items-center">
          <h3 className="text-sm font-black tracking-widest uppercase mb-10 text-zinc-400">{t.dashboard.masteryDist}</h3>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={masteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">{masteredCount}</span>
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.dashboard.mastered.split(' ')[0]}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
             {masteryData.slice(-2).map((item, i) => (
               <div key={i} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase text-zinc-500">{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom Area: Recent Activity & Motivation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Cards List */}
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-8">
            <Label className="text-xl flex items-center gap-2">
               <LayoutIcon className="text-zinc-400" size={20} />
               {t.dashboard.recent}
            </Label>
            <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all border-b-2 border-transparent hover:border-zinc-900">
               {t.dashboard.viewAll}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.slice(0, 4).map(card => (
              <div key={card.id} className="group bg-white dark:bg-zinc-900 p-8 rounded-xl border-2 border-zinc-50 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all shadow-sm hover:shadow-2xl">
                 <div className="flex justify-between items-start mb-6">
                   <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-inner">
                      <BookOpen size={18} />
                   </div>
                   <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                      <Trophy size={10} className="text-orange-500" />
                      <span className="text-[9px] font-black uppercase">Lv. {card.masteryLevel}</span>
                   </div>
                 </div>
                 <h4 className="font-black text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:translate-x-1 transition-transform">{card.front}</h4>
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{card.category}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
