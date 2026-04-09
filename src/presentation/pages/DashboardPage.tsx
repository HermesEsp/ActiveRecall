import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Flame, Target, BookOpen } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { cards, streak, studyHistory, t, getStudyCards, theme } = useMasteryStore();

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const masteredCount = cards.filter(c => c.masteryLevel === 5).length;
  const learningCount = cards.length - masteredCount;
  
  const pieData = [
    { name: t.dashboard?.mastered || 'Mastered', value: masteredCount },
    { name: t.dashboard?.learning || 'Learning', value: learningCount },
  ];
  
  const COLORS = isDark ? ['#e4e4e7', '#3f3f46'] : ['#18181b', '#e4e4e7'];

  const chartData = studyHistory.map(h => ({
    date: h.date.split('-').slice(1).join('/'),
    count: h.count
  }));

  const cardsDue = getStudyCards('All').length;

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDark ? '#27272a' : '#fff',
    color: isDark ? '#e4e4e7' : '#18181b',
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">{t.dashboard?.title || 'Dashboard'}</h2>
        <p className="text-zinc-500">{t.dashboard?.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center">
            <Flame className="text-orange-400" size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{t.dashboard?.streak || 'Streak'}</p>
            <p className="text-2xl font-bold">{streak} {t.dashboard?.days || 'Days'}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
            <BookOpen className="text-zinc-900 dark:text-zinc-100" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.dashboard?.totalCards || 'Total Cards'}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{cards.length}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
            <Target className="text-zinc-900 dark:text-zinc-100" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.dashboard?.cardsDue || 'Due'}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{cardsDue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">{t.dashboard?.masteryDist || 'Mastery'}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-zinc-500 dark:text-zinc-400 text-sm">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">{t.dashboard?.studyVolume || 'Volume'}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#27272a' : '#f4f4f5'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                <Tooltip cursor={{ fill: isDark ? '#27272a' : '#f4f4f5' }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={isDark ? '#e4e4e7' : '#18181b'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
