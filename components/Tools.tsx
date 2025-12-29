
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Heart, Calendar as CalendarIcon, UtensilsCrossed, Settings2, CheckCircle2, X, Target, Menu, Trophy, Medal, Crown, Star } from 'lucide-react';
import { getIslamicCalendarData } from '../services/gemini';
import { AppState } from '../types';

interface ToolsProps {
  appState: AppState;
  onOpenDrawer: () => void;
}

const Tools: React.FC<ToolsProps> = ({ appState, onOpenDrawer }) => {
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehGoal, setTasbeehGoal] = useState<number | null>(33);
  const [activeTool, setActiveTool] = useState('tasbeeh');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [isTapping, setIsTapping] = useState(false);

  // Calendar States
  const [hijriDate, setHijriDate] = useState('');
  const [islamicEvents, setIslamicEvents] = useState<any[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastHapticTime = useRef<number>(0);

  const tools = [
    { id: 'tasbeeh', icon: Heart, label: 'Tasbeeh' },
    { id: 'achievements', icon: Trophy, label: 'Awards' },
    { id: 'calendar', icon: CalendarIcon, label: 'Hijri' },
    { id: 'fasting', icon: UtensilsCrossed, label: 'Fasting' },
  ];

  const ACHIEVEMENTS_LIST = [
    { id: 'streak_7', title: '7 Day Streak', description: 'Prayed consistently for a week', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { id: 'streak_30', title: 'Monthly Champion', description: '30 days of dedication', icon: Medal, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'streak_40', title: '40 Days Steadfast', description: 'Spiritual milestone reached', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { id: 'streak_100', title: 'Century Streak', description: '100 days of consistency', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { id: 'prayers_100', title: '100 Prayers', description: 'Total prayers recorded', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { id: 'prayers_500', title: 'Devoted Servant', description: '500 prayers recorded', icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' }
  ];

  // Initialize Hijri Date
  useEffect(() => {
    const hDate = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
    setHijriDate(hDate);
  }, []);

  // Fetch AI Calendar Events
  useEffect(() => {
    if (activeTool === 'calendar' && islamicEvents.length === 0) {
      const fetchCalendar = async () => {
        setLoadingCalendar(true);
        const data = await getIslamicCalendarData();
        setIslamicEvents(data.events || []);
        setLoadingCalendar(false);
      };
      fetchCalendar();
    }
  }, [activeTool, islamicEvents.length]);

  const triggerHaptics = (strength: 'light' | 'heavy' = 'light') => {
    if (!appState.settings.hapticsEnabled) return;
    
    const now = Date.now();
    if (now - lastHapticTime.current < 40) return;
    lastHapticTime.current = now;

    if ('vibrate' in navigator) {
      const duration = strength === 'heavy' ? 40 : 15;
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  };

  const playCalmBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const handleTasbeehIncrement = (e: React.MouseEvent | React.TouchEvent) => {
    // Only increment on intentional taps
    setTasbeehCount((prev) => {
      if (tasbeehGoal !== null && prev >= tasbeehGoal) {
        return prev;
      }
      return prev + 1;
    });
    
    // Visual feedback
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 150);
  };

  useEffect(() => {
    if (tasbeehCount === 0) return;

    if (tasbeehGoal !== null && tasbeehCount === tasbeehGoal) {
      playCalmBeep();
      triggerHaptics('heavy');
    } else {
      triggerHaptics('light');
    }
  }, [tasbeehCount, tasbeehGoal]);

  const selectGoal = (goal: number | null) => {
    setTasbeehGoal(goal);
    setTasbeehCount(0);
    setShowGoalModal(false);
    triggerHaptics('light');
  };

  const handleCustomGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customGoal);
    if (!isNaN(val) && val > 0) {
      selectGoal(val);
      setCustomGoal('');
    }
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : 'Passed';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
      <header className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
          className="lg:hidden absolute left-0 top-0.5 p-2 text-slate-400 hover:text-emerald-600 transition-colors z-10"
          aria-label="Open Settings"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col items-center md:items-start w-full">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight text-center md:text-left">Daily Tools</h2>
          <p className="text-slate-500 text-sm md:text-base font-medium text-center md:text-left">Your everyday Muslim companions</p>
        </div>
      </header>

      <div className="flex flex-wrap justify-center md:justify-start gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit max-w-full mx-auto md:mx-0">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTool(tool.id);
              triggerHaptics('light');
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTool === tool.id 
              ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tool.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            {tool.label}
          </button>
        ))}
      </div>

      <div className="min-h-[450px]">
        {activeTool === 'tasbeeh' && (
          <div 
            onClick={handleTasbeehIncrement}
            className={`flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-300 relative min-h-[500px] select-none w-full rounded-[3rem] transition-colors cursor-pointer ${isTapping ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}
          >
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-2 text-emerald-500/60 dark:text-emerald-400/40">
                <Heart size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tap anywhere to count</span>
              </div>
            </div>

            {/* Centered Counter Circle */}
            <div className="flex flex-col items-center gap-8 w-full">
              <div 
                className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 transition-all duration-300 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden pointer-events-none ${
                  isTapping ? 'scale-95' : 'scale-100'
                } ${
                  tasbeehGoal && tasbeehCount >= tasbeehGoal 
                  ? 'border-emerald-500 shadow-emerald-500/20' 
                  : 'border-emerald-100 dark:border-emerald-900/30 shadow-emerald-200/50 dark:shadow-none'
                }`}
              >
                {tasbeehGoal && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-emerald-50 dark:bg-emerald-900/10 transition-all duration-300 pointer-events-none"
                    style={{ height: `${Math.min((tasbeehCount / tasbeehGoal) * 100, 100)}%` }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <span className={`text-5xl sm:text-6xl font-black font-mono transition-colors ${tasbeehGoal && tasbeehCount >= tasbeehGoal ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
                    {tasbeehCount}
                  </span>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                      {tasbeehGoal ? `Goal: ${tasbeehGoal}` : 'Free Count'}
                    </span>
                    {tasbeehGoal && tasbeehCount >= tasbeehGoal && (
                      <span className="text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase mt-1 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset and Settings Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setTasbeehCount(0); 
                    triggerHaptics('heavy'); 
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-emerald-500 shadow-lg border border-slate-100 dark:border-slate-700 transition-all active:rotate-180 hover:scale-105"
                  title="Reset Counter"
                >
                  <RotateCcw size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Reset</span>
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowGoalModal(true); 
                    triggerHaptics('light'); 
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-emerald-500 shadow-lg border border-slate-100 dark:border-slate-700 transition-all hover:scale-105"
                  title="Set Goal"
                >
                  <Settings2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Goal</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 w-full pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pointer-events-none">Quick Goals</p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-sm:px-4 max-w-sm z-20">
                {[33, 99, 100].map(val => (
                  <button 
                    key={val}
                    onClick={(e) => { e.stopPropagation(); selectGoal(val); }}
                    className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border transition-all font-black text-xs sm:text-sm ${
                      tasbeehGoal === val 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Goal Modal */}
            {showGoalModal && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={(e) => { e.stopPropagation(); setShowGoalModal(false); }}
              >
                <div 
                  className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                        <Target size={20} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Set Custom Goal</h3>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowGoalModal(false); triggerHaptics('light'); }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCustomGoalSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Goal Count</label>
                      <input 
                        autoFocus
                        type="number" 
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none transition-all text-lg font-bold dark:text-white placeholder:text-slate-300"
                        min="1"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); selectGoal(null); }}
                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                      >
                        Free Mode
                      </button>
                      <button 
                        type="submit"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-2 py-4 px-8 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
                      >
                        Set Goal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-500">
             {ACHIEVEMENTS_LIST.map((ach) => {
               const isUnlocked = appState.unlockedAchievements?.includes(ach.id);
               return (
                 <div key={ach.id} className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all ${isUnlocked ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-70 grayscale'}`}>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-2xl mb-4 ${isUnlocked ? ach.bg : 'bg-slate-200 dark:bg-slate-800'}`}>
                        <ach.icon size={24} className={isUnlocked ? ach.color : 'text-slate-400'} />
                      </div>
                      {isUnlocked ? (
                         <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Unlocked</div>
                      ) : (
                         <div className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Locked</div>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{ach.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
                 </div>
               );
             })}
          </div>
        )}

        {activeTool === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 text-center mx-auto max-w-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-emerald-200/50">
                <CalendarIcon size={32} className="sm:w-[40px] sm:h-[40px]" />
              </div>
              <h3 className="text-2xl sm:text-4xl font-black arabic-font mb-2 leading-tight">{hijriDate || 'Calculating...'}</h3>
              <p className="text-slate-500 text-sm sm:text-lg mb-4">Islamic Hijri Calendar</p>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 inline-flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Live Astronomical Calculation</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {loadingCalendar ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <RotateCcw className="animate-spin" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest">Syncing religious dates...</p>
                </div>
              ) : islamicEvents.length > 0 ? (
                islamicEvents.map((event, idx) => (
                  <div key={idx} className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group mx-auto w-full max-w-md">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest block">{event.hijriDate}</span>
                      <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] sm:text-[10px] font-bold">
                        Upcoming
                      </div>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{event.name}</h4>
                    <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">{event.description || `Expected on ${new Date(event.gregorianDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400">Countdown</span>
                      <span className="text-emerald-600 font-black text-xs sm:text-sm">{calculateDaysRemaining(event.gregorianDate)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-400 text-sm">
                  No upcoming events found. Please check back later.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTool === 'fasting' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm max-w-3xl mx-auto w-full">
               <div className="text-center sm:text-left">
                 <h4 className="font-bold text-slate-800 dark:text-white text-lg sm:text-xl tracking-tight leading-tight">Sunnah Fasting</h4>
                 <p className="text-slate-500 text-sm font-medium">Track your Monday & Thursday fasts</p>
               </div>
               <button className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 text-sm">Track Fast</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto w-full">
                <div className="p-6 sm:p-8 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 shadow-sm">
                  <h5 className="font-bold text-amber-800 dark:text-amber-400 text-lg mb-2 leading-tight">Ramadan Preparation</h5>
                  <p className="text-amber-700 dark:text-amber-500/80 text-xs sm:text-sm mb-6 leading-relaxed">Make up for missed fasts before the next Ramadan begins.</p>
                  <div className="h-3 bg-amber-200/50 dark:bg-amber-900/50 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-amber-500 w-3/4 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] sm:text-[10px] text-amber-600 font-bold uppercase tracking-widest">Steady Progress</p>
                  </div>
                </div>
                <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between min-h-[160px]">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2 leading-tight">Ayam al-Bid</h5>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">The "White Days" are the 13th, 14th, and 15th of every lunar month.</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                    <CalendarIcon size={14} /> View upcoming cycles
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
