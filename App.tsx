
import React, { useState, useEffect, useRef } from 'react';
import { AppState, PrayerStatus, PrayerName, AppSettings, UserStats, DailyLog } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Tools from './components/Tools';
import Settings from './components/Settings';
import AchievementPopup from './components/AchievementPopup';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { getTodayDateString } from './utils/dateTime';
import { supabase, syncUserData, fetchUserData } from './services/supabase';
// Removed missing User type from @supabase/supabase-js
import { Loader2 } from 'lucide-react';

const STORAGE_KEY = 'nurtrack_state_v1';

const INITIAL_SETTINGS: AppSettings = {
  userName: '',
  language: 'English',
  theme: 'light',
  strictness: 'normal',
  timingMode: 'auto',
  manualTimings: {
    Fajr: '05:12',
    Dhuhr: '12:45',
    Asr: '16:15',
    Maghrib: '18:32',
    Isha: '20:00'
  },
  onboardingCompleted: false,
  location: null
};

const calculateStatsFromLogs = (logs: Record<string, DailyLog> = {}): UserStats => {
  const safeLogs = logs || {};
  const dates = Object.keys(safeLogs).sort((a, b) => b.localeCompare(a));
  let totalPrayers = 0;
  let onTimeCount = 0;
  
  Object.values(safeLogs).forEach(log => {
    if (!log?.prayers) return;
    Object.values(log.prayers).forEach(status => {
      if (status !== PrayerStatus.NOT_MARKED) {
        totalPrayers++;
        if (status === PrayerStatus.ON_TIME) onTimeCount++;
      }
    });
  });

  let streak = 0;
  const today = getTodayDateString();
  let checkDate = new Date();
  
  let safety = 0;
  while (safety < 365) {
    safety++;
    const dateStr = checkDate.toISOString().split('T')[0];
    const log = safeLogs[dateStr];
    
    const isCompleted = log && (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).every(p => 
      log.prayers?.[p] && log.prayers[p] !== PrayerStatus.NOT_MARKED && log.prayers[p] !== PrayerStatus.MISSED
    );

    if (isCompleted) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return {
    streak,
    totalPrayers,
    onTimeCount,
    lastCompletedDate: dates.find(d => {
       const log = safeLogs[d];
       if (!log?.prayers) return false;
       return (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).every(p => 
        log.prayers[p] && log.prayers[p] !== PrayerStatus.NOT_MARKED
       );
    }) || null
  };
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAchievement, setShowAchievement] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  // Changed User type to any to bypass missing export error
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const syncTimeoutRef = useRef<number | null>(null);

  const [lastCelebratedDate, setLastCelebratedDate] = useState<string | null>(() => {
    return localStorage.getItem('nurtrack_last_celebrated');
  });

  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const stats = calculateStatsFromLogs(parsed.logs || {});
        return {
          logs: parsed.logs || {},
          stats: stats,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.error("Local State Initialization Failed:", e);
    }
    return {
      logs: {},
      stats: { streak: 0, totalPrayers: 0, onTimeCount: 0, lastCompletedDate: null },
      settings: INITIAL_SETTINGS
    };
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Cast supabase.auth to any to bypass getSession missing error
        const { data: { session } } = await (supabase.auth as any).getSession();
        setUser(session?.user ?? null);
      } catch (e) {
        console.warn("Auth initialization bypassed due to connection issues.");
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cast supabase.auth to any to bypass onAuthStateChange missing error
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const loadCloudData = async () => {
        try {
          const cloudData = await fetchUserData(user.id);
          if (cloudData) {
            setAppState(cloudData);
          } else {
            syncUserData(user.id, appState);
          }
        } catch (e) {
          console.error("Cloud data sync failed:", e);
        }
      };
      loadCloudData();
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {}
    
    if (appState.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user) {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = window.setTimeout(() => {
        syncUserData(user.id, appState);
      }, 2000);
    }
  }, [appState, user]);

  const toggleTheme = () => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'light' ? 'dark' : 'light' }
    }));
  };

  const cycleStrictness = () => {
    const modes: ('soft' | 'normal' | 'strict')[] = ['soft', 'normal', 'strict'];
    setAppState(prev => {
      const currentIndex = modes.indexOf(prev.settings.strictness);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...prev,
        settings: { ...prev.settings, strictness: modes[nextIndex] }
      };
    });
  };

  const setUserName = (name: string) => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, userName: name }
    }));
  };

  const setTimingMode = (mode: 'auto' | 'manual') => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, timingMode: mode }
    }));
  };

  const setManualTiming = (prayer: PrayerName, time: string) => {
    setAppState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        manualTimings: {
          ...prev.settings.manualTimings,
          [prayer]: time
        }
      }
    }));
  };

  const completeOnboarding = (updates: Partial<AppSettings>) => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates, onboardingCompleted: true }
    }));
  };

  const updatePrayerStatus = (name: PrayerName, status: PrayerStatus) => {
    const today = getTodayDateString();
    setAppState(prev => {
      const currentLog: DailyLog = prev.logs[today] || { 
        date: today, 
        prayers: {
          Fajr: PrayerStatus.NOT_MARKED,
          Dhuhr: PrayerStatus.NOT_MARKED,
          Asr: PrayerStatus.NOT_MARKED,
          Maghrib: PrayerStatus.NOT_MARKED,
          Isha: PrayerStatus.NOT_MARKED
        } 
      };
      
      const previousStatus = currentLog.prayers[name];
      if (prev.settings.strictness === 'strict' && previousStatus !== PrayerStatus.NOT_MARKED) return prev;
      if (previousStatus === status) return prev;

      const updatedPrayers: Record<PrayerName, PrayerStatus> = { ...currentLog.prayers, [name]: status };
      const updatedLog: DailyLog = { ...currentLog, prayers: updatedPrayers };
      const updatedLogs: Record<string, DailyLog> = { ...prev.logs, [today]: updatedLog };
      
      const newStats = calculateStatsFromLogs(updatedLogs);

      const allOnTime = (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).every(p => 
        updatedPrayers[p] === PrayerStatus.ON_TIME
      );

      if (allOnTime && lastCelebratedDate !== today) {
        setShowAchievement(true);
        setLastCelebratedDate(today);
      }

      return { ...prev, logs: updatedLogs, stats: newStats };
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
          <span className="text-white font-black text-2xl">N</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
          <Loader2 className="animate-spin" size={16} />
          Initializing NurTrack
        </div>
      </div>
    );
  }

  if (!user && !guestMode) {
    return <Auth onGuestMode={() => setGuestMode(true)} />;
  }

  if (!appState.settings.onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} drawerContent={<Settings appState={appState} onToggleTheme={toggleTheme} onCycleStrictness={cycleStrictness} setUserName={setUserName} setTimingMode={setTimingMode} setManualTiming={setManualTiming} />} user={user}>
      <div key={activeTab} className="max-w-4xl mx-auto py-2 lg:py-6 animate-in fade-in duration-500 fill-mode-forwards">
        {activeTab === 'dashboard' && <Dashboard appState={appState} updatePrayerStatus={updatePrayerStatus} />}
        {activeTab === 'analytics' && <Analytics appState={appState} />}
        {activeTab === 'tools' && <Tools />}
        {activeTab === 'settings' && <Settings appState={appState} onToggleTheme={toggleTheme} onCycleStrictness={cycleStrictness} setUserName={setUserName} setTimingMode={setTimingMode} setManualTiming={setManualTiming} />}
      </div>
      {showAchievement && <AchievementPopup onClose={() => setShowAchievement(false)} userName={appState.settings.userName} />}
    </Layout>
  );
};

export default App;
