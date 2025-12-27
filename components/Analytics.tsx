
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { AppState, PrayerStatus, PrayerName, DailyLog } from '../types';
import { PRAYER_NAMES } from '../constants';
import { TrendingUp, Award, Sparkles, Info, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Circle, Flame } from 'lucide-react';
import { getTodayDateString, formatDisplayDate } from '../utils/dateTime';

interface AnalyticsProps {
  appState: AppState;
}

const Analytics: React.FC<AnalyticsProps> = ({ appState }) => {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateString());
  const isDark = appState.settings.theme === 'dark';

  // Theme-aware color constants
  const colors = {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)',
    barBg: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
  };

  // Calendar Logic
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const todayStr = getTodayDateString();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Real days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateKey = date.toISOString().split('T')[0];
      const log = appState.logs[dateKey];
      
      let status: 'perfect' | 'partial' | 'missed' | 'none' = 'none';
      
      if (log) {
        const markedCount = Object.values(log.prayers).filter(s => s !== PrayerStatus.NOT_MARKED && s !== PrayerStatus.MISSED).length;
        const missedCount = Object.values(log.prayers).filter(s => s === PrayerStatus.MISSED).length;
        
        if (markedCount === 5) status = 'perfect';
        else if (markedCount > 0) status = 'partial';
        else if (missedCount > 0) status = 'missed';
      } else if (dateKey < todayStr) {
        // Past day with no log
        status = 'missed';
      }
      
      days.push({ day: i, dateKey, status });
    }
    return days;
  }, [appState.logs, currentMonth, currentYear, todayStr]);

  // Selected Day Data
  const selectedDayLog = appState.logs[selectedCalendarDate] || { prayers: {} };

  // Chart Data Computation
  const { weeklyTrend, overallDistribution, averageConsistency } = useMemo(() => {
    const trendDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const log = (appState.logs[dateKey] || { prayers: {} }) as DailyLog;
      
      const counts = {
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        onTime: 0,
        late: 0,
        missed: 0
      };

      Object.values(log.prayers).forEach(status => {
        if (status === PrayerStatus.ON_TIME) counts.onTime++;
        else if (status === PrayerStatus.LATE) counts.late++;
        else if (status === PrayerStatus.MISSED) counts.missed++;
      });
      trendDays.push(counts);
    }

    let totalOnTime = 0, totalLate = 0, totalMissed = 0;
    Object.values(appState.logs).forEach(log => {
      Object.values((log as DailyLog).prayers).forEach(status => {
        if (status === PrayerStatus.ON_TIME) totalOnTime++;
        else if (status === PrayerStatus.LATE) totalLate++;
        else if (status === PrayerStatus.MISSED) totalMissed++;
      });
    });

    const totalMarked = totalOnTime + totalLate + totalMissed;
    const consistencyScore = totalMarked === 0 ? 0 : Math.round((totalOnTime / totalMarked) * 100);

    return {
      weeklyTrend: trendDays,
      overallDistribution: [
        { name: 'On Time', value: totalOnTime || (totalMarked === 0 ? 1 : 0), color: isDark ? '#10b981' : '#059669' },
        { name: 'Late', value: totalLate, color: isDark ? '#fbbf24' : '#d97706' },
        { name: 'Missed', value: totalMissed, color: isDark ? '#f87171' : '#dc2626' },
      ],
      averageConsistency: consistencyScore
    };
  }, [appState.logs, isDark]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border-0 shadow-2xl rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700/50 backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill || entry.color || entry.stroke }}></div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{entry.name}</span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getStatusIcon = (status: PrayerStatus) => {
    switch(status) {
      case PrayerStatus.ON_TIME: return <CheckCircle2 size={16} className="text-emerald-500" />;
      case PrayerStatus.LATE: return <Clock size={16} className="text-amber-500" />;
      case PrayerStatus.MISSED: return <AlertCircle size={16} className="text-rose-500" />;
      default: return <Circle size={16} className="text-slate-200 dark:text-slate-800" />;
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Visual Streak Calendar</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Identify your consistency patterns at a glance</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-800/50">
          <Flame className="text-emerald-600 dark:text-emerald-400" size={20} fill="currentColor" />
          <span className="font-bold text-emerald-800 dark:text-emerald-200">{appState.stats.streak} Day Streak</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Streak Calendar Section */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                <CalendarDays size={22} />
              </div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
                {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 opacity-50 cursor-not-allowed"><ChevronLeft size={20} /></button>
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 opacity-50 cursor-not-allowed"><ChevronRight size={20} /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
            ))}
            {calendarDays.map((dayObj, idx) => {
              if (!dayObj) return <div key={`empty-${idx}`} className="h-14 md:h-20" />;
              
              const isSelected = selectedCalendarDate === dayObj.dateKey;
              const isToday = dayObj.dateKey === todayStr;

              // Color Logic for Streak Calendar
              let bgClass = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/50";
              let textClass = "text-slate-600 dark:text-slate-400";
              let shadowClass = "";

              if (dayObj.status === 'perfect') {
                bgClass = "bg-emerald-500 border-emerald-500";
                textClass = "text-white";
                shadowClass = "shadow-lg shadow-emerald-500/20";
              } else if (dayObj.status === 'partial') {
                bgClass = "bg-amber-400 border-amber-400";
                textClass = "text-amber-950";
                shadowClass = "shadow-lg shadow-amber-500/20";
              } else if (dayObj.status === 'missed') {
                bgClass = "bg-rose-500 border-rose-500";
                textClass = "text-white";
                shadowClass = "shadow-lg shadow-rose-500/20";
              }

              return (
                <button
                  key={dayObj.dateKey}
                  onClick={() => setSelectedCalendarDate(dayObj.dateKey)}
                  className={`group relative h-14 md:h-20 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                    isSelected 
                    ? 'ring-4 ring-slate-900/10 dark:ring-white/10 scale-105 z-10' 
                    : ''
                  } ${bgClass} ${textClass} ${shadowClass} hover:scale-[1.02] active:scale-95`}
                >
                  <span className="text-sm font-black">{dayObj.day}</span>
                  {isToday && !isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-sm" /> All Prayers (5/5)
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-4 h-4 rounded-lg bg-amber-400 shadow-sm" /> Partial (1-4)
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="w-4 h-4 rounded-lg bg-rose-500 shadow-sm" /> Missed Day
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">
              <div className="w-4 h-4 rounded-lg border-2 border-slate-100 dark:border-slate-800" /> Future/Not Tracked
            </div>
          </div>
        </section>

        {/* Selected Day Panel - Redesigned for History */}
        <section className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col h-full border border-slate-800/50">
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <CalendarDays size={180} />
          </div>
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Historical Review</p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {formatDisplayDate(selectedCalendarDate).split(',')[0]}
                </h3>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <CalendarDays size={20} className="text-slate-400" />
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-widest">Prayer Log</p>
            
            <div className="space-y-3">
              {PRAYER_NAMES.map((name) => {
                const status = selectedDayLog.prayers[name as PrayerName] || PrayerStatus.NOT_MARKED;
                return (
                  <div key={name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        {getStatusIcon(status)}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{name}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                      status === PrayerStatus.ON_TIME ? 'bg-emerald-500/10 text-emerald-400' : 
                      status === PrayerStatus.LATE ? 'bg-amber-500/10 text-amber-400' : 
                      status === PrayerStatus.MISSED ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800/50 text-slate-500'
                    }`}>
                      {status === PrayerStatus.NOT_MARKED ? 'No Data' : status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <Sparkles size={24} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-medium leading-relaxed text-slate-300">
                "Take account of yourselves before you are taken to account." 
                <span className="block mt-1 text-emerald-400 font-bold">— Umar ibn al-Khattab</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800/80 relative">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Discipline Progress</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Weekly performance breakdown</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={36}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: colors.text, fontSize: 12, fontWeight: 600}} dy={12} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: colors.text, fontSize: 11}} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: colors.barBg, radius: 10}} />
                <Bar dataKey="onTime" name="On Time" fill="#10b981" stackId="a" />
                <Bar dataKey="late" name="Late" fill="#f59e0b" stackId="a" />
                <Bar dataKey="missed" name="Missed" fill="#f43f5e" stackId="a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Global Distribution */}
        <section className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-2xl text-amber-600">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Accuracy Ratio</h3>
          </div>
          
          <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallDistribution}
                    innerRadius="68%"
                    outerRadius="88%"
                    paddingAngle={12}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    {overallDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center pointer-events-none">
               <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{averageConsistency}%</span>
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.25em] mt-1.5">Efficiency</span>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-8">
             {overallDistribution.map((item) => (
               <div key={item.name} className="flex flex-col items-center p-3 bg-slate-50/80 dark:bg-slate-800/30 rounded-2xl border border-transparent">
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1.5 tracking-wide">{item.name}</span>
                 <span className="text-xl font-black" style={{ color: item.color }}>{item.value}</span>
               </div>
             ))}
          </div>
        </section>
      </div>

      {/* Insight Footer */}
      <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden border border-slate-800/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center ring-1 ring-emerald-500/30 backdrop-blur-md shrink-0">
          <Sparkles size={38} className="text-emerald-400" />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
          <h4 className="text-2xl font-bold mb-2 tracking-tight">Your History is Your Strength</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Each day on this calendar is a memory of your devotion. Don't be discouraged by a few red spots; look at the field of green you're building. Every prayer is a new beginning.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm">
          <Info size={14} className="text-slate-600" />
          Insight AI
        </div>
      </div>
    </div>
  );
};

export default Analytics;
