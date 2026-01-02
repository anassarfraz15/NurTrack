import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Flame, Star, Quote, ChevronRight, Timer, Menu, Save, Edit3, X, Calendar, ArrowRight, Circle, Users, User, XCircle, CheckCircle, Check, Sunrise, Sun as SunIcon, Sunset, CloudSun, Moon as MoonIcon } from 'lucide-react';
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
  const [activePopup, setActivePopup] = useState<'streak' | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const prayerTimings = getAllPrayerTimings(appState.settings);
  const isFriday = new Date().getDay() === 5;

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

  const getPrayerIcon = (prayerName: string, size: number = 24, className?: string) => {
    const pName = prayerName.includes('Jumma') ? 'Dhuhr' : prayerName;
    const props = { size, className, strokeWidth: 1.5 };
    switch (pName) {
      case 'Fajr': return <Sunrise {...props} />;
      case 'Dhuhr': return <SunIcon {...props} />;
      case 'Asr': return <CloudSun {...props} />;
      case 'Maghrib': return <Sunset {...props} />;
      case 'Isha': return <MoonIcon {...props} />;
      default: return <Clock {...props} />;
    }
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

        {/* Center: Greeting & Date - Absolute Positioned to be perfectly centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[240px] z-10 pointer-events-none">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-charcoal-text tracking-tight leading-none">
            {greeting}
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-charcoal-sub mt-0.5 uppercase tracking-wide">
            {formatDisplayDate(today)}
          </p>
        </div>
        
        {/* Right: Streak Icon Only */}
        <div className="ml-auto relative z-20" ref={popupRef}>
          <button 
            onClick={() => setActivePopup(activePopup === 'streak' ? null : 'streak')}
            className="flex items-center gap-1.5 px-3 py-1.5 h-10 bg-white dark:bg-charcoal-surface rounded-xl border border-slate-100 dark:border-charcoal-border shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-95 transition-all group"
          >
            <Flame size={16} className="text-orange-500 group-hover:fill-current" />
            <span className="text-xs font-black text-slate-700 dark:text-charcoal-text tabular-nums">{appState.stats.streak}</span>
          </button>

          {/* Contextual Popup */}
          {activePopup && (
            <div className="absolute top-full right-0 mt-3 z-50 w-52 md:w-60">
              <div className="bg-white dark:bg-charcoal-surface rounded-2xl shadow-xl border border-slate-100 dark:border-charcoal-border p-4 animate-in zoom-in-95 origin-top-right relative">
                 {/* Triangle Arrow */}
                 <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white dark:bg-charcoal-surface border-l border-t border-slate-100 dark:border-charcoal-border transform rotate-45"></div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
                        <Flame size={14} fill="currentColor" />
                      </div>
                      <button onClick={() => setActivePopup(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
                   </div>
                   
                   <h4 className="text-sm font-bold text-slate-900 dark:text-charcoal-text mb-1">
                     {appState.stats.streak > 0 ? "You're on fire!" : "Start your streak"}
                   </h4>
                   <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                     You've prayed consistently for <strong className="text-orange-500">{appState.stats.streak} days</strong>.
                   </p>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-charcoal px-2 py-1 rounded-md inline-block">
                     Best: {appState.stats.bestStreak} days
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Redesigned Minimal Prayer Banner - Fully Responsive */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2f5d40] to-[#1a3826] dark:from-[#064e3b] dark:to-[#022c22] rounded-[1.8rem] md:rounded-[2.2rem] shadow-xl shadow-emerald-900/10 text-white transition-all duration-500 group">
        
        {/* Top Section - Current Prayer */}
        <div className="p-5 pr-14 md:p-7 md:pr-20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 md:gap-5">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/5">
                {getPrayerIcon(prayerContext.current.name, undefined, "w-6 h-6 md:w-8 md:h-8")}
             </div>
             <div>
                <span className="block text-emerald-200/80 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">Now</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-none">{prayerContext.current.name}</h3>
             </div>
          </div>
          <div className="text-right">
             <span className="block text-emerald-200/80 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">Time</span>
             <p className="text-lg md:text-xl font-bold tracking-tight">{prayerContext.current.startTime}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 md:mx-7 h-px bg-white/10" />

        {/* Bottom Section - Next Prayer */}
        <div className="p-5 pr-14 md:p-7 md:pr-20 flex items-center justify-between relative z-10">
           <div className="flex items-center gap-4 md:gap-5">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/5 text-emerald-100/80">
                {getPrayerIcon(prayerContext.next.name, undefined, "w-5 h-5 md:w-[22px] md:h-[22px]")}
             </div>
             <div>
                <span className="block text-emerald-200/80 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">Next</span>
                <h3 className="text-lg md:text-xl font-bold tracking-tight leading-none text-white/90">{prayerContext.next.name}</h3>
             </div>
          </div>
          
          <div className="bg-white/10 rounded-2xl px-3 py-2 md:px-5 md:py-3 backdrop-blur-md flex items-center gap-2 md:gap-3 border border-white/10">
             <Timer className="text-emerald-200 w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
             <span className="text-sm md:text-lg font-bold tabular-nums tracking-tight">{timeRemaining.replace('in ', '')}</span>
          </div>
        </div>

        {/* Dedicated Timings Icon */}
        <button
          onClick={() => setIsTimingsPopupOpen(true)}
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-emerald-200 hover:text-white z-20"
          aria-label="View Prayer Timings"
        >
          <Calendar className="w-4 h-4 md:w-[22px] md:h-[22px]" strokeWidth={1.5} />
        </button>

        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 md:w-80 md:h-80 bg-emerald-400/10 rounded-full blur-[60px] md:blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 md:w-60 md:h-60 bg-emerald-900/40 rounded-full blur-[40px] md:blur-[60px]"></div>
      </div>

      {/* Redesigned Prayer Marking Cards - Gender Aware */}
      <section className="space-y-3 relative">
        {PRAYER_NAMES.map((name) => {
          const prayerName = name as PrayerName;
          const status = todayLog.prayers[prayerName] || PrayerStatus.NOT_MARKED;
          const mode = todayLog.modes?.[prayerName];
          const isEnabled = isPrayerEnabled(prayerName);
          const time = prayerTimings.find(t => t.name === name)?.time;
          
          // Rename Dhuhr to Jumma if it is Friday
          const displayName = (name === 'Dhuhr' && isFriday) ? 'Jumma' : name;

          // Determine visual state
          const isCongregation = status === PrayerStatus.ON_TIME && mode === PrayerMode.CONGREGATION;
          const isIndividual = status === PrayerStatus.ON_TIME && mode === PrayerMode.INDIVIDUAL;
          const isLate = status === PrayerStatus.LATE;
          const isMissed = status === PrayerStatus.MISSED;
          const isMarked = status !== PrayerStatus.NOT_MARKED;

          return (
            <div 
              key={name}
              className={`flex overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-charcoal-surface border border-slate-100 dark:border-charcoal-border shadow-sm transition-all duration-300 ${!isEnabled || !isEditing ? 'opacity-60 grayscale-[0.3] pointer-events-none' : ''}`}
            >
              {/* Left Section: Identity */}
              <div className={`w-12 md:w-32 flex flex-col items-center justify-center text-white bg-emerald-600 relative shrink-0 transition-colors`}>
                <div className="flex flex-col items-center gap-0.5 md:gap-1 -rotate-90 md:rotate-0 whitespace-nowrap">
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">
                     {time?.split(' ')[0]}
                   </span>
                   <span className="text-xs md:text-xl font-black tracking-tight uppercase md:normal-case">
                     {displayName}
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
                          : 'text-slate-300 dark:text-charcoal-accent hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-full h-9 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isIndividual 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-charcoal'
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
                          : 'text-slate-300 dark:text-charcoal-accent hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isCongregation 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-charcoal'
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
                          : 'text-slate-300 dark:text-charcoal-accent hover:text-slate-500'
                        }`}
                      >
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                          isIndividual 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 shadow-sm' 
                          : 'border-transparent bg-slate-50 dark:bg-charcoal'
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
                      : 'text-slate-300 dark:text-charcoal-accent hover:text-slate-500'
                    } ${isFemale ? 'flex-1' : ''}`}
                  >
                    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                      isFemale ? 'w-full' : ''
                    } ${
                      isLate 
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 shadow-sm' 
                      : 'border-transparent bg-slate-50 dark:bg-charcoal'
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
                      : 'text-slate-300 dark:text-charcoal-accent hover:text-slate-500'
                    } ${isFemale ? 'flex-1' : ''}`}
                  >
                    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border-2 ${
                      isFemale ? 'w-full' : ''
                    } ${
                      isMissed 
                      ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 shadow-sm' 
                      : 'border-transparent bg-slate-50 dark:bg-charcoal'
                    }`}>
                       <XCircle size={18} className={`md:w-5 md:h-5 ${isMissed ? 'fill-current' : ''}`} />
                    </div>
                    <span className={`block text-[9px] font-bold mt-1 ${isFemale ? 'uppercase tracking-wider' : 'hidden md:block'}`}>Missed</span>
                  </button>
                </div>

                {/* Completion Checkmark */}
                <div className="pl-2 md:pl-4 border-l border-slate-100 dark:border-charcoal-border/50 flex items-center justify-center">
                  <button 
                    onClick={() => handleCheckmarkClick(prayerName)}
                    disabled={!isEnabled}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                      isMarked 
                      ? (isLate ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 
                         isMissed ? 'bg-rose-500 border-rose-500 text-white shadow-md' :
                         'bg-emerald-600 border-emerald-600 text-white shadow-md')
                      : 'border-slate-200 dark:border-charcoal-border text-slate-300 dark:text-charcoal-accent bg-transparent'
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
              className={`px-8 py-4 bg-slate-900 dark:bg-charcoal-surface hover:bg-slate-800 dark:hover:bg-charcoal-surface/80 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3 min-w-[160px] justify-center ${
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
      <section className="bg-white dark:bg-charcoal-surface border border-slate-100 dark:border-charcoal-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 text-slate-50 dark:text-charcoal group-hover:text-emerald-500/10 transition-colors pointer-events-none">
          <Quote size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <Quote size={16} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-charcoal-text tracking-tight">Reflection</h3>
          </div>
          
          {loadingMotivation ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-charcoal rounded-full w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-charcoal rounded-full w-3/4"></div>
            </div>
          ) : motivation ? (
            <div className="space-y-3">
              <div>
                <p className="text-slate-800 dark:text-charcoal-text italic text-lg leading-relaxed arabic-font font-medium">
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

      {/* Timings Popup - Portal to Body */}
      {isTimingsPopupOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-screen h-screen">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-300 w-full h-full" onClick={() => setIsTimingsPopupOpen(false)}></div>
          <div 
            className="bg-white dark:bg-charcoal-surface w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-charcoal-border animate-in zoom-in-95 duration-500 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-[9px] tracking-[0.2em] mb-1">
                    <Calendar size={10} />
                    Schedule
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-charcoal-text tracking-tight">Prayer Timings</h3>
                </div>
                <button 
                  onClick={() => setIsTimingsPopupOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-text transition-colors bg-slate-50 dark:bg-charcoal rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {prayerTimings.map((timing) => (
                  <div 
                    key={timing.name} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      timing.name === (prayerContext.next.key as any)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-charcoal/50 border-slate-100 dark:border-charcoal-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        timing.name === (prayerContext.next.key as any)
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white dark:bg-charcoal-border text-slate-400 shadow-sm'
                      }`}>
                         {getPrayerIcon(timing.name, 14)}
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-charcoal-text">{timing.displayName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-charcoal-text text-xs">
                      {timing.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Dashboard;