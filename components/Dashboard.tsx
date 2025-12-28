
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Flame, Star, Quote, Lock, ChevronRight, Timer, Menu, Check, Save, Edit3, ShieldAlert, X, Sparkles } from 'lucide-react';
import { PrayerName, PrayerStatus, AppState } from '../types';
import { getTodayDateString, formatDisplayDate, getNextPrayer, getTimeRemaining, getAllPrayerTimings } from '../utils/dateTime';
import { PRAYER_NAMES } from '../constants';
import { getSpiritualMotivation } from '../services/gemini';

interface DashboardProps {
  appState: AppState;
  updatePrayerStatus: (name: PrayerName, status: PrayerStatus) => void;
  lockTodayLog: () => void;
  onOpenDrawer: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appState, updatePrayerStatus, lockTodayLog, onOpenDrawer }) => {
  const today = getTodayDateString();
  const todayLog = appState.logs[today] || { date: today, prayers: {}, isLocked: false };
  const [nextPrayerData, setNextPrayerData] = useState(getNextPrayer(appState.settings));
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(nextPrayerData.rawTime, nextPrayerData.isTomorrow));
  const [isTimingsPopupOpen, setIsTimingsPopupOpen] = useState(false);
  
  const [motivation, setMotivation] = useState<{message: string, source: string, reflection: string} | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  
  // Local UI state for toggling card interactivity
  const [isEditing, setIsEditing] = useState(!todayLog.isLocked);

  const prayerTimings = getAllPrayerTimings(appState.settings);

  const allPrayersMarked = PRAYER_NAMES.every(name => 
    todayLog.prayers[name as PrayerName] && todayLog.prayers[name as PrayerName] !== PrayerStatus.NOT_MARKED
  );

  const consistencyScore = appState.stats.totalPrayers 
    ? Math.round((appState.stats.onTimeCount / appState.stats.totalPrayers) * 100) 
    : 0;

  useEffect(() => {
    setIsEditing(!todayLog.isLocked);
  }, [todayLog.isLocked]);

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
    if (!isEditing) return;
    const currentStatus = todayLog.prayers[name] || PrayerStatus.NOT_MARKED;
    const finalStatus = currentStatus === newStatus ? PrayerStatus.NOT_MARKED : newStatus;
    updatePrayerStatus(name, finalStatus);
  };

  const handleSave = () => {
    const isStrict = appState.settings.strictness === 'strict';
    if (isStrict) {
      const confirmSave = window.confirm(
        "Strict Mode Confirmation: Are you sure you want to save today's prayer data? Once saved, you will NOT be able to change it later."
      );
      if (confirmSave) {
        lockTodayLog();
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
      lockTodayLog();
    }
  };

  const handleEdit = () => {
    const isStrict = appState.settings.strictness === 'strict';
    if (isStrict && todayLog.isLocked) {
      alert("Strict Mode: This day has already been locked and cannot be edited.");
      return;
    }
    setIsEditing(true);
  };

  const firstName = appState.settings.userName ? appState.settings.userName.trim().split(' ')[0] : '';
  const greeting = firstName ? `Salam, ${firstName}` : 'Salam!';

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Header - Minimal padding */}
      <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
        <button 
          onClick={onOpenDrawer}
          className="lg:hidden absolute left-0 top-0.5 p-2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
          aria-label="Open Settings"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {greeting}
            </h2>
          </div>
          <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-medium text-center md:text-left">
            {formatDisplayDate(today)}
          </p>
        </div>
        
        <div className="flex justify-center md:justify-end gap-2 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 px-3 sm:px-5 py-2 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center gap-2 sm:gap-4 transition-all hover:shadow-md">
            <div className="p-1 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg sm:rounded-xl">
              <Flame className="text-orange-500" fill="currentColor" size={14} />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-[0.15em]">Streak</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-lg leading-tight">{appState.stats.streak}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 px-3 sm:px-5 py-2 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center gap-2 sm:gap-4 transition-all hover:shadow-md">
            <div className="p-1 sm:p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg sm:rounded-xl">
              <Star className="text-amber-500" fill="currentColor" size={14} />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-[0.15em]">Score</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-lg leading-tight">{consistencyScore}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Next Prayer Highlight - Reduced Padding and Minimalist Scale */}
      <div className="relative overflow-hidden bg-emerald-700 dark:bg-emerald-800 rounded-[1.75rem] md:rounded-[2.5rem] p-4 md:p-10 text-white shadow-xl shadow-emerald-200/40 dark:shadow-none transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/10 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] ring-1 ring-white/20 flex items-center gap-1.5">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                Next Prayer
              </span>
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-600/40 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 backdrop-blur-sm">
                <Timer size={10} className="opacity-80" />
                {timeRemaining}
              </span>
            </div>
            <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
              {nextPrayerData.name}
              {nextPrayerData.isTomorrow && <span className="text-sm md:text-2xl font-medium opacity-60 ml-2 block md:inline tracking-normal">Tomorrow</span>}
            </h3>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/10 md:border-none pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <p className="text-2xl md:text-5xl font-mono font-bold tracking-tighter leading-none">
                {nextPrayerData.time}
              </p>
              <p className="text-emerald-200/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 md:mt-3 block">Athan notification enabled</p>
            </div>
            <button 
              onClick={() => setIsTimingsPopupOpen(true)}
              className="w-10 h-10 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20 transition-transform active:scale-90 cursor-pointer group hover:bg-white/20"
            >
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 md:w-80 md:h-80 bg-emerald-400/20 rounded-full blur-[70px] md:blur-[90px]"></div>
      </div>

      {/* Prayer Timings Modal */}
      {isTimingsPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[9px] tracking-[0.2em] mb-1">
                    <Sparkles size={10} />
                    Schedule
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Prayer Timings</h3>
                </div>
                <button 
                  onClick={() => setIsTimingsPopupOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {prayerTimings.map((timing) => (
                  <div 
                    key={timing.name} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      timing.name === nextPrayerData.name 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        timing.name === nextPrayerData.name 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'
                      }`}>
                         {timing.name === 'Fajr' && <Star size={14} />}
                         {timing.name === 'Dhuhr' && <Sun size={14} />}
                         {timing.name === 'Asr' && <Clock size={14} />}
                         {timing.name === 'Maghrib' && <Star size={14} />}
                         {timing.name === 'Isha' && <Moon size={14} />}
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{timing.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {timing.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-center gap-2">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mode:</span>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md">
                  {appState.settings.timingMode}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Status Tracking - Minimalist Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {PRAYER_NAMES.map((name) => {
          const status = todayLog.prayers[name as PrayerName] || PrayerStatus.NOT_MARKED;
          const timing = prayerTimings.find(t => t.name === name);
          
          let cardStyle = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800";
          let accentText = "text-slate-400";
          let shadowStyle = "shadow-sm";

          if (status === PrayerStatus.ON_TIME) {
            cardStyle = "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/20";
            accentText = "text-emerald-600 dark:text-emerald-400";
            shadowStyle = "shadow-md shadow-emerald-500/5";
          } else if (status === PrayerStatus.LATE) {
            cardStyle = "bg-amber-50 dark:bg-amber-900/10 border-amber-500/20";
            accentText = "text-amber-600 dark:text-amber-400";
            shadowStyle = "shadow-md shadow-amber-500/5";
          } else if (status === PrayerStatus.MISSED) {
            cardStyle = "bg-rose-50 dark:bg-rose-900/10 border-rose-500/20";
            accentText = "text-rose-600 dark:text-rose-400";
            shadowStyle = "shadow-md shadow-rose-500/5";
          }

          return (
            <div 
              key={name}
              className={`p-3 sm:p-4 rounded-[1.75rem] md:rounded-[2rem] border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${cardStyle} ${shadowStyle} ${!isEditing ? 'opacity-80 grayscale-[0.3]' : ''}`}
            >
              {!isEditing && (
                <div className="absolute inset-0 bg-slate-100/10 dark:bg-slate-950/20 backdrop-blur-[1px] z-10 pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-4 relative z-20">
                <div>
                  <h4 className={`font-black text-xs tracking-tight uppercase ${status === PrayerStatus.NOT_MARKED ? 'text-slate-800 dark:text-slate-200' : accentText}`}>
                    {name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{timing?.time}</p>
                </div>
                {!isEditing && (
                  <div className="p-1 bg-white/50 dark:bg-slate-800/50 rounded-lg text-slate-400">
                    <Lock size={10} />
                  </div>
                )}
              </div>
              
              <div className={`grid grid-cols-3 gap-1 relative z-20 ${!isEditing ? 'pointer-events-none' : ''}`}>
                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.ON_TIME)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                    status === PrayerStatus.ON_TIME 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105 z-10' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {status === PrayerStatus.ON_TIME ? <Check size={14} /> : <CheckCircle2 size={14} />}
                </button>

                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.LATE)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                    status === PrayerStatus.LATE 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105 z-10' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                  }`}
                >
                  <Clock size={14} />
                </button>

                <button 
                  onClick={() => handleStatusUpdate(name as PrayerName, PrayerStatus.MISSED)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                    status === PrayerStatus.MISSED 
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105 z-10' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30'
                  }`}
                >
                  <AlertCircle size={14} />
                </button>
              </div>
              
              <div className="mt-2 text-center relative z-20">
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] opacity-40 transition-opacity ${status !== PrayerStatus.NOT_MARKED ? 'opacity-100' : 'opacity-0'}`}>
                  {status.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Save & Edit Buttons - Minimalist floating style */}
      {allPrayersMarked && (
        <div className="flex items-center justify-center gap-3 py-2 animate-in slide-in-from-bottom-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 min-w-[140px] justify-center"
            >
              <Save size={16} />
              Save Today
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className={`px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 min-w-[140px] justify-center ${
                appState.settings.strictness === 'strict' && todayLog.isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Edit3 size={16} />
              Edit Log
            </button>
          )}
        </div>
      )}

      {/* Reflection Card - Refined padding */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[1.75rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 text-slate-50 dark:text-slate-800/20 group-hover:text-emerald-500/10 transition-colors pointer-events-none">
          <Quote size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <Quote size={16} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Reflection</h3>
          </div>
          
          {loadingMotivation ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4"></div>
            </div>
          ) : motivation ? (
            <div className="space-y-3">
              <div>
                <p className="text-slate-800 dark:text-slate-200 italic text-lg leading-relaxed arabic-font font-medium">
                  "{motivation.message}"
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-black text-[9px] mt-2 tracking-widest uppercase">— {motivation.source}</p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-slate-400 text-xs font-medium italic">Start tracking to unlock insights.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Internal icons for modal
const Sun = ({ size, className = "" }: { size: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const Moon = ({ size, className = "" }: { size: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;

export default Dashboard;
