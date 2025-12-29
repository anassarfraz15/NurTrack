
import React, { useEffect, useState, useRef } from 'react';
import { Clock, Flame, Star, Quote, ChevronRight, Timer, Menu, Save, Edit3, X, Calendar, ArrowRight, Circle, Users, User, XCircle, CheckCircle, PieChart, Check } from 'lucide-react';
import { PrayerName, PrayerStatus, AppState, PrayerMode } from '../types';
import { getTodayDateString, formatDisplayDate, getPrayerContext, getTimeRemaining, getAllPrayerTimings } from '../utils/dateTime';
import { PRAYER_NAMES } from '../constants';
import { getSpiritualMotivation } from '../services/gemini';

interface DashboardProps {
  appState: AppState;
  updatePrayerStatus: (name: PrayerName, status: PrayerStatus, mode?: PrayerMode) => void;
  lockTodayLog: () => void;
  onOpenDrawer: () => void;
}

const DEFAULT_TIMINGS: Record<PrayerName, string> = {
  Fajr: '05:12',
  Dhuhr: '12:45',
  Asr: '16:15',
  Maghrib: '18:32',
  Isha: '20:00'
};

const Dashboard: React.FC<DashboardProps> = ({ appState, updatePrayerStatus, lockTodayLog, onOpenDrawer }) => {
  const today = getTodayDateString();
  const todayLog = appState.logs[today] || { date: today, prayers: {}, modes: {}, isLocked: false };
  const [prayerContext, setPrayerContext] = useState(getPrayerContext(appState.settings));
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(prayerContext.next.rawTime, prayerContext.next.isTomorrow));
  const [isTimingsPopupOpen, setIsTimingsPopupOpen] = useState(false);
  
  const [motivation, setMotivation] = useState<{message: string, source: string, reflection: string} | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  
  const [isEditing, setIsEditing] = useState(!todayLog.isLocked);
  
  // Popup States
  const [activePopup, setActivePopup] = useState<'streak' | 'score' | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const prayerTimings = getAllPrayerTimings(appState.settings);

  // Check Gender - default to male behavior if undefined
  const isFemale = appState.settings.gender === 'female';

  const consistencyScore = appState.stats.totalPrayers 
    ? Math.round((appState.stats.onTimeCount / appState.stats.totalPrayers) * 100) 
    : 0;

  useEffect(() => {
    setIsEditing(!todayLog.isLocked);
  }, [todayLog.isLocked]);

  useEffect(() => {
    const timer = setInterval(() => {
      const context = getPrayerContext(appState.settings);
      setPrayerContext(context);
      setTimeRemaining(getTimeRemaining(context.next.rawTime, context.next.isTomorrow));
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };
    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopup]);

  const isPrayerEnabled = (name: PrayerName) => {
    if (appState.settings.strictness === 'strict' && todayLog.isLocked) return false;
    if (today !== getTodayDateString()) return !todayLog.isLocked;

    const timings = appState.settings.timingMode === 'manual' ? appState.settings.manualTimings : DEFAULT_TIMINGS;
    const timeStr = timings[name];
    if (!timeStr) return true;

    const [h, m] = timeStr.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= prayerMinutes;
  };

  const handleStatusUpdate = (name: PrayerName, status: PrayerStatus, mode?: PrayerMode) => {
    if (!isEditing) return;
    
    const currentStatus = todayLog.prayers[name];
    const currentMode = todayLog.modes?.[name];
    
    if (currentStatus === status && currentMode === mode) {
       updatePrayerStatus(name, PrayerStatus.NOT_MARKED);
    } else {
       updatePrayerStatus(name, status, mode);
    }
  };

  const handleCheckmarkClick = (name: PrayerName) => {
    if (!isEditing) return;
    const currentStatus = todayLog.prayers[name];
    
    if (currentStatus && currentStatus !== PrayerStatus.NOT_MARKED) {
      if (window.confirm(`Unmark ${name}?`)) {
        updatePrayerStatus(name, PrayerStatus.NOT_MARKED);
      }
    } else {
      updatePrayerStatus(name, PrayerStatus.ON_TIME, PrayerMode.INDIVIDUAL);
    }
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

  const allPrayersMarked = PRAYER_NAMES.every(name => 
    todayLog.prayers[name as PrayerName] && todayLog.prayers[name as PrayerName] !== PrayerStatus.NOT_MARKED
  );

  const firstName = appState.settings.userName ? appState.settings.userName.trim().split(' ')[0] : '';
  const greeting = firstName ? `Salam, ${firstName}` : 'Salam!';

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* Redesigned Header with Top-Right Stats */}
      <header className="relative flex items-center justify-between h-14 md:h-16 mb-2">
        {/* Left: Hamburger */}
        <button 
          onClick={onOpenDrawer}
          className="lg:hidden relative z-20 p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          aria-label="Open Settings"
        >
          <Menu size={24} />
        </button>

        {/* Center: Greeting - Absolute Positioned to be perfectly centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[240px] z-10 pointer-events-none">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            {greeting}
          </h2>
        </div>
        
        {/* Right: Stats Icons with Numbers */}
        <div className="ml-auto relative z-20 flex gap-2" ref={popupRef}>
          <button 
            onClick={() => setActivePopup(activePopup === 'streak' ? null : 'streak')}
            className="flex items-center gap-1.5 px-3 py-1.5 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-95 transition-all group"
          >
            <Flame size={16} className="text-orange-500 group-hover:fill-current" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{appState.stats.streak}</span>
          </button>
          
          <button 
             onClick={() => setActivePopup(activePopup === 'score' ? null : 'score')}
             className="flex items-center gap-1.5 px-3 py-1.5 h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/10 active:scale-95 transition-all group"
          >
            <PieChart size={16} className="text-emerald-500 group-hover:fill-current" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{consistencyScore}%</span>
          </button>

          {/* Contextual Popups */}
          {activePopup && (
            <div className="absolute top-full right-0 mt-3 z-50 w-52 md:w-60">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 animate-in zoom-in-95 origin-top-right relative">
                 {/* Triangle Arrow */}
                 <div className={`absolute -top-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-l border-t border-slate-100 dark:border-slate-800 transform rotate-45 ${activePopup === 'streak' ? 'right-20' : 'right-4'}`}></div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                      <div className={`p-1.5 rounded-lg ${activePopup === 'streak' ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {activePopup === 'streak' ? <Flame size={14} fill="currentColor" /> : <PieChart size={14} fill="currentColor" />}
                      </div>
                      <button onClick={() => setActivePopup(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
                   </div>
                   
                   {activePopup === 'streak' ? (
                     <>
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                         {appState.stats.streak > 0 ? "You're on fire!" : "Start your streak"}
                       </h4>
                       <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                         You've prayed consistently for <strong className="text-orange-500">{appState.stats.streak} days</strong>.
                       </p>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">
                         Best: {appState.stats.bestStreak} days
                       </div>
                     </>
                   ) : (
                     <>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                         On-Time Score
                       </h4>
                       <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                         You have completed <strong className="text-emerald-500">{consistencyScore}%</strong> of your total recorded prayers on time.
                       </p>
                       <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${consistencyScore}%` }}></div>
                       </div>
                     </>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Next Prayer Banner */}
      <div className="relative overflow-hidden bg-emerald-700 dark:bg-emerald-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl shadow-emerald-200/40 dark:shadow-none transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-600/50 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">
                   Active Period
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
             </div>
             <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none flex items-baseline gap-2">
                {prayerContext.current.name}
                <span className="text-xs md:text-sm font-medium opacity-60 font-mono tracking-normal">
                   {prayerContext.current.startTime} — {prayerContext.current.endTime}
                </span>
             </h3>
          </div>

          <div className="hidden md:flex items-center justify-center px-4">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <ArrowRight size={20} className="text-emerald-200" />
             </div>
          </div>

          <div className="flex-1 flex flex-col md:items-end gap-1">
             <div className="flex items-center md:justify-end gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ring-1 ring-white/20 backdrop-blur-sm">
                   <Timer size={10} className="opacity-80" />
                   Upcoming {timeRemaining}
                </span>
             </div>
             <div className="md:text-right">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-200/80 mb-0.5">
                   Starts at {prayerContext.next.startTime}
                </p>
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                   {prayerContext.next.name}
                   {prayerContext.next.isTomorrow && <span className="text-[10px] md:text-xs font-medium opacity-50 ml-2 uppercase">Tomorrow</span>}
                </h3>
             </div>
          </div>

          <button 
            onClick={() => setIsTimingsPopupOpen(true)}
            className="md:hidden absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/20 active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 md:w-80 md:h-80 bg-emerald-400/20 rounded-full blur-[70px] md:blur-[90px]"></div>
      </div>

      {/* Redesigned Prayer Marking Cards - Gender Aware */}
      <section className="space-y-3 relative">
        {PRAYER_NAMES.map((name) => {
          const prayerName = name as PrayerName;
          const status = todayLog.prayers[prayerName] || PrayerStatus.NOT_MARKED;
          const mode = todayLog.modes?.[prayerName];
          const isEnabled = isPrayerEnabled(prayerName);
          const time = prayerTimings.find(t => t.name === name)?.time;

          // Determine visual state
          const isCongregation = status === PrayerStatus.ON_TIME && mode === PrayerMode.CONGREGATION;
          const isIndividual = status === PrayerStatus.ON_TIME && mode === PrayerMode.INDIVIDUAL;
          const isLate = status === PrayerStatus.LATE;
          const isMissed = status === PrayerStatus.MISSED;
          const isMarked = status !== PrayerStatus.NOT_MARKED;

          return (
            <div 
              key={name}
              className={`flex overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 ${!isEnabled || !isEditing ? 'opacity-60 grayscale-[0.3] pointer-events-none' : ''}`}
            >
              {/* Left Section: Identity */}
              <div className={`w-12 md:w-32 flex flex-col items-center justify-center text-white bg-emerald-600 relative shrink-0 transition-colors`}>
                <div className="flex flex-col items-center gap-0.5 md:gap-1 -rotate-90 md:rotate-0 whitespace-nowrap">
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">
                     {time?.split(' ')[0]}
                   </span>
                   <span className="text-xs md:text-xl font-black tracking-tight uppercase md:normal-case">
                     {name}
                   </span>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-20"></div>
              </div>

              {/* Right Section: Actions */}
              <div className="flex-1 flex items-center justify-between px-2 md:px-6 py-2 md:py-3 relative gap-1 md:gap-4 overflow-hidden">
                
                {/* Status Icons Container - Grid changes based on Gender */}
                <div className="flex items-center justify-around flex-1 gap-1 md:gap-3">
                  
                  {isFemale ? (
                    // Female View: Prayed (On Time), Late, Missed
                    <>
                      <button
                        onClick={() => handleStatusUpdate(prayerName, PrayerStatus.ON_TIME, PrayerMode.INDIVIDUAL)}
                        disabled={!isEnabled}
                        className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 flex-1 ${
                          isIndividual 
                          ? 'text-emerald-600' 
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-full h-9 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isIndividual 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800'
                        }`}>
                           <Check size={18} className={`md:w-5 md:h-5 ${isIndividual ? 'fill-current' : ''}`} />
                        </div>
                        <span className="block text-[9px] font-bold mt-1 uppercase tracking-wider">Prayed</span>
                      </button>
                    </>
                  ) : (
                    // Male/Other View: Jamaat, Alone, Late, Missed
                    <>
                      <button
                        onClick={() => handleStatusUpdate(prayerName, PrayerStatus.ON_TIME, PrayerMode.CONGREGATION)}
                        disabled={!isEnabled}
                        className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 ${
                          isCongregation 
                          ? 'text-emerald-600' 
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isCongregation 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800'
                        }`}>
                           <Users size={18} className={`md:w-5 md:h-5 ${isCongregation ? 'fill-current' : ''}`} />
                        </div>
                        <span className="hidden md:block text-[9px] font-bold mt-1">Jamaat</span>
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(prayerName, PrayerStatus.ON_TIME, PrayerMode.INDIVIDUAL)}
                        disabled={!isEnabled}
                        className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 ${
                          isIndividual 
                          ? 'text-emerald-600' 
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isIndividual 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-slate-800'
                        }`}>
                           <User size={18} className={`md:w-5 md:h-5 ${isIndividual ? 'fill-current' : ''}`} />
                        </div>
                        <span className="hidden md:block text-[9px] font-bold mt-1">Alone</span>
                      </button>
                    </>
                  )}

                  {/* Late Button - Common */}
                  <button
                    onClick={() => handleStatusUpdate(prayerName, PrayerStatus.LATE)}
                    disabled={!isEnabled}
                    className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 ${
                      isLate 
                      ? 'text-amber-500' 
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                    } ${isFemale ? 'flex-1' : ''}`}
                  >
                    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                      isFemale ? 'w-full' : ''
                    } ${
                      isLate 
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 shadow-sm' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800'
                    }`}>
                       <Clock size={18} className={`md:w-5 md:h-5 ${isLate ? 'fill-current' : ''}`} />
                    </div>
                    <span className={`block text-[9px] font-bold mt-1 ${isFemale ? 'uppercase tracking-wider' : 'hidden md:block'}`}>Late</span>
                  </button>

                  {/* Missed Button - Common */}
                  <button
                    onClick={() => handleStatusUpdate(prayerName, PrayerStatus.MISSED)}
                    disabled={!isEnabled}
                    className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all active:scale-95 ${
                      isMissed 
                      ? 'text-rose-500' 
                      : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                    } ${isFemale ? 'flex-1' : ''}`}
                  >
                    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                      isFemale ? 'w-full' : ''
                    } ${
                      isMissed 
                      ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 shadow-sm' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800'
                    }`}>
                       <XCircle size={18} className={`md:w-5 md:h-5 ${isMissed ? 'fill-current' : ''}`} />
                    </div>
                    <span className={`block text-[9px] font-bold mt-1 ${isFemale ? 'uppercase tracking-wider' : 'hidden md:block'}`}>Missed</span>
                  </button>
                </div>

                {/* Completion Checkmark */}
                <div className="pl-2 md:pl-4 border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                  <button 
                    onClick={() => handleCheckmarkClick(prayerName)}
                    disabled={!isEnabled}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      isMarked 
                      ? (isLate ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 
                         isMissed ? 'bg-rose-500 border-rose-500 text-white shadow-md' :
                         'bg-emerald-600 border-emerald-600 text-white shadow-md')
                      : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-transparent'
                    }`}
                  >
                    {isMarked ? <CheckCircle size={20} className="md:w-6 md:h-6" /> : <Circle size={20} className="md:w-6 md:h-6" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Save & Edit Buttons */}
      {allPrayersMarked && (
        <div className="flex items-center justify-center gap-3 py-2 animate-in slide-in-from-bottom-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-3 min-w-[160px] justify-center"
            >
              <Save size={18} />
              Lock Today
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className={`px-8 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3 min-w-[160px] justify-center ${
                appState.settings.strictness === 'strict' && todayLog.isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Edit3 size={18} />
              Edit Log
            </button>
          )}
        </div>
      )}

      {/* Reflection Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden group">
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

      {/* Timings Popup */}
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
                    <Calendar size={10} />
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
                      timing.name === prayerContext.next.name 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        timing.name === prayerContext.next.name 
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sun = ({ size, className = "" }: { size: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const Moon = ({ size, className = "" }: { size: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;

export default Dashboard;
