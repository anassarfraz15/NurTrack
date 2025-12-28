import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Flame, Star, Quote, Lock, ChevronRight, Timer, Menu } from 'lucide-react';
import { PrayerName, PrayerStatus, AppState } from '../types';
import { getTodayDateString, formatDisplayDate, getNextPrayer, getTimeRemaining } from '../utils/dateTime';
import { PRAYER_NAMES } from '../constants';
import { getSpiritualMotivation } from '../services/gemini';

interface DashboardProps {
  appState: AppState;
  updatePrayerStatus: (name: PrayerName, status: PrayerStatus) => void;
  onOpenDrawer: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appState, updatePrayerStatus, onOpenDrawer }) => {
  const today = getTodayDateString();
  const todayLog = appState.logs[today] || { date: today, prayers: {} };
  const [nextPrayerData, setNextPrayerData] = useState(getNextPrayer(appState.settings));
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(nextPrayerData.rawTime, nextPrayerData.isTomorrow));
  
  const [motivation, setMotivation] = useState<{message: string, source: string, reflection: string} | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const consistencyScore = appState.stats.totalPrayers 
    ? Math.round((appState.stats.onTimeCount / appState.stats.totalPrayers) * 100) 
    : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getNextPrayer(appState.settings);
      setNextPrayerData(next);
      setTimeRemaining(getTimeRemaining(next.rawTime, next.isTomorrow));
    }, 60000);
    return () => clearInterval(timer);
  }, [appState.settings]);

  useEffect(() => {
    const fetchMotivation = async () => {
      setLoadingMotivation(true);
      const data = await getSpiritualMotivation(
        appState.stats.streak,
        `${consistencyScore}% consistency`
      );
      setMotivation(data);
      setLoadingMotivation(false);
    };
    fetchMotivation();
  }, [appState.stats.streak, consistencyScore]);

  const handleStatusUpdate = (name: PrayerName, newStatus: PrayerStatus) => {
    const currentStatus = todayLog.prayers[name] || PrayerStatus.NOT_MARKED;
    const isStrict = appState.settings.strictness === 'strict';

    if (isStrict) {
      if (currentStatus !== PrayerStatus.NOT_MARKED) return;
      
      const confirmSave = window.confirm(
        `Confirm ${name}: In Strict Mode, you cannot change this later. Are you sure you want to mark it as ${newStatus.replace('_', ' ')}?`
      );
      if (!confirmSave) return;
    }

    updatePrayerStatus(name, newStatus);
  };

  const firstName = appState.settings.userName ? appState.settings.userName.trim().split(' ')[0] : '';
  const greeting = firstName ? `Salam, ${firstName}` : 'Salam!';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header - Centered on Mobile */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center justify-center gap-3 mb-1">
            <button 
              onClick={onOpenDrawer}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-emerald-600 transition-colors"
              aria-label="Open Settings"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
            {formatDisplayDate(today)}
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Active Session</span>
          </p>
        </div>
        
        <div className="flex justify-center md:justify-end gap-4">
          <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Flame className="text-orange-500" fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em]">Streak</p>
              <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{appState.stats.streak} Days</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Star className="text-amber-500" fill="currentColor" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em]">Score</p>
              <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{consistencyScore}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Next Prayer Highlight */}
      <div className="relative overflow-hidden bg-emerald-700 dark:bg-emerald-800 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl shadow-emerald-200/50 dark:shadow-none transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ring-1 ring-white/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                Next Prayer
              </span>
              <span className="px-3 py-1 bg-emerald-600/40 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm">
                <Timer size={12} className="opacity-80" />
                {timeRemaining}
              </span>
            </div>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-2">
              {nextPrayerData.name}
              {nextPrayerData.isTomorrow && <span className="text-xl md:text-2xl font-medium opacity-60 ml-3 block md:inline tracking-normal">Tomorrow</span>}
            </h3>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-8 border-t border-white/10 md:border-none pt-6 md:pt-0">
            <div className="text-left md:text-right">
              <p className="text-4xl md:text-5xl font-mono font-bold tracking-tighter leading-none">
                {nextPrayerData.time}
              </p>
              <p className="text-emerald-200/60 text-[10px] font-black uppercase tracking-[0.2em] mt-3 block">Athan notification enabled</p>
            </div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20 transition-transform active:scale-90 cursor-pointer group">
              <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-400/20 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-300/10 rounded-full blur-[70px]"></div>
      </div>

      {/* Prayer Status Tracking */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PRAYER_NAMES.map((name) => {
          const status = todayLog.prayers[name as PrayerName] || PrayerStatus.NOT_MARKED;
          const isLocked = appState.settings.strictness === 'strict' && status !== PrayerStatus.NOT_MARKED;
          
          return (
            <div 
              key={name}
              className={`p-6 rounded-3xl border transition-all duration-300 ${
                status !== PrayerStatus.NOT_MARKED 
                ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-800' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
              } group relative`}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{name}</h4>
                {isLocked ? (
                   <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400" title="Locked by Strict Mode">
                     <Lock size={14} />
                   </div>
                ) : (
                   <div className={`w-2 h-2 rounded-full ${status === PrayerStatus.NOT_MARKED ? 'bg-slate-200 dark:bg-slate-700' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'}`}></div>
                )}
              </div>
              
              <div className={`flex flex-col gap-2.5 ${isLocked ? 'opacity-60 pointer-events-none grayscale-[0.2]' : ''}`}>
                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.ON_TIME)}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    status === PrayerStatus.ON_TIME 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600'
                  }`}
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} /> On Time</span>
                </button>
                
                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.LATE)}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    status === PrayerStatus.LATE 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600'
                  }`}
                >
                  <span className="flex items-center gap-2"><Clock size={14} /> Late</span>
                </button>
                
                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.MISSED)}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    status === PrayerStatus.MISSED 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600'
                  }`}
                >
                  <span className="flex items-center gap-2"><AlertCircle size={14} /> Missed</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Spiritual Insight Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-slate-50 dark:text-slate-800/20 group-hover:text-emerald-500/10 transition-colors">
          <Quote size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
              <Quote size={20} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Daily Reflection</h3>
          </div>
          
          {loadingMotivation ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
              <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4"></div>
              <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] mt-6"></div>
            </div>
          ) : motivation ? (
            <div className="space-y-6">
              <div>
                <p className="text-slate-800 dark:text-slate-200 italic text-2xl leading-relaxed arabic-font font-medium">
                  "{motivation.message}"
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-3 tracking-wide uppercase">— {motivation.source}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] text-slate-600 dark:text-slate-400 text-sm border border-slate-100 dark:border-slate-800 leading-relaxed shadow-inner">
                <span className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.2em] block mb-2">Insight AI</span>
                {motivation.reflection}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-slate-400 font-medium italic">Complete your first prayer to unlock daily insights.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;