
import React, { useState, useEffect, useRef } from 'react';
import { AppState, PrayerStatus, PrayerName, PrayerMode, AppSettings, UserStats, DailyLog, PrayerEntry } from './types.ts';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analytics from './components/Analytics.tsx';
import Tools from './components/Tools.tsx';
import Settings from './components/Settings.tsx';
import Dua from './components/Dua.tsx';
import AchievementPopup from './components/AchievementPopup.tsx';
import Auth from './components/Auth.tsx';
import Onboarding from './components/Onboarding.tsx';
import { getTodayDateString } from './utils/dateTime.ts';
import { supabase } from './services/supabase.ts';
import { db } from './services/db.ts';
import { syncEngine } from './services/sync.ts';
import { Loader2, WifiOff } from 'lucide-react';
import { Logo } from './constants.tsx';

const SETTINGS_STORAGE_KEY = 'nurtrack_settings_v1';

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
  hapticsEnabled: true,
  location: null
};

// Helper to construct UI logs from flat DB entries
const entriesToLogs = (entries: PrayerEntry[]): Record<string, DailyLog> => {
  const logs: Record<string, DailyLog> = {};
  const sortedEntries = [...entries].sort((a, b) => a.prayer_timestamp - b.prayer_timestamp);
  
  sortedEntries.forEach(entry => {
    if (!logs[entry.prayer_date]) {
      logs[entry.prayer_date] = {
        date: entry.prayer_date,
        prayers: {
          Fajr: PrayerStatus.NOT_MARKED,
          Dhuhr: PrayerStatus.NOT_MARKED,
          Asr: PrayerStatus.NOT_MARKED,
          Maghrib: PrayerStatus.NOT_MARKED,
          Isha: PrayerStatus.NOT_MARKED
        },
        modes: {} as Record<PrayerName, PrayerMode>,
        entries: [],
        isLocked: false
      };
    }
    logs[entry.prayer_date].prayers[entry.prayer_name] = entry.prayer_status;
    if (entry.prayer_mode && logs[entry.prayer_date].modes) {
      logs[entry.prayer_date].modes![entry.prayer_name] = entry.prayer_mode;
    }
    if (entry.is_locked) logs[entry.prayer_date].isLocked = true;
    
    const existingIdx = logs[entry.prayer_date].entries?.findIndex(e => e.prayer_name === entry.prayer_name) ?? -1;
    if (existingIdx > -1) {
      logs[entry.prayer_date].entries![existingIdx] = entry;
    } else {
      logs[entry.prayer_date].entries?.push(entry);
    }
  });
  return logs;
};

const calculateStatsFromLogs = (logs: Record<string, DailyLog> = {}): UserStats => {
  const safeLogs = logs || {};
  const dates = Object.keys(safeLogs).sort((a, b) => b.localeCompare(a));
  let totalPrayers = 0;
  let onTimeCount = 0;
  
  Object.values(safeLogs).forEach(log => {
    if (!log?.prayers) return;
    Object.values(log.prayers).forEach(status => {
      if (status !== PrayerStatus.NOT_MARKED && status !== PrayerStatus.MISSED) {
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [lastCelebratedDate, setLastCelebratedDate] = useState<string | null>(() => {
    return localStorage.getItem('nurtrack_last_celebrated');
  });

  const [appState, setAppState] = useState<AppState>({
    logs: {},
    stats: { streak: 0, totalPrayers: 0, onTimeCount: 0, lastCompletedDate: null },
    settings: INITIAL_SETTINGS
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user) syncEngine.sync(user.id);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  useEffect(() => {
    const init = async () => {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const settings = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;

        const entries = await db.getAllLogs();
        const logs = entriesToLogs(entries);
        const stats = calculateStatsFromLogs(logs);

        setAppState(prev => ({ ...prev, settings, logs, stats }));

        const { data: { session } } = await (supabase.auth as any).getSession();
        setUser(session?.user ?? null);
      } catch (e) {
        console.warn("Init failed:", e);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) setGuestMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isOnline) {
      const interval = setInterval(() => syncEngine.sync(user.id), 30000);
      syncEngine.hydrateLocal(user.id).then(() => {
        db.getAllLogs().then(entries => {
          const logs = entriesToLogs(entries);
          setAppState(prev => ({ ...prev, logs, stats: calculateStatsFromLogs(logs) }));
        });
      });
      return () => clearInterval(interval);
    }
  }, [user, isOnline]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appState.settings));
    if (appState.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.settings]);

  const updatePrayerStatus = async (name: PrayerName, status: PrayerStatus, mode?: PrayerMode) => {
    const today = getTodayDateString();
    const userId = user?.id || 'guest_user';
    const currentLog = appState.logs[today];

    if (currentLog?.isLocked && appState.settings.strictness === 'strict') {
      return; 
    }

    const existingEntry = currentLog?.entries?.find(e => e.prayer_name === name);

    const newEntry: PrayerEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      user_id: userId,
      prayer_name: name,
      prayer_date: today,
      prayer_status: status,
      prayer_mode: mode,
      prayer_timestamp: Date.now(),
      synced: false,
      created_at: existingEntry?.created_at || Date.now(),
      is_locked: currentLog?.isLocked || false
    };

    await db.saveEntry(newEntry);

    setAppState(prev => {
      const currentLog = prev.logs[today] || { 
        date: today, 
        prayers: {
          Fajr: PrayerStatus.NOT_MARKED,
          Dhuhr: PrayerStatus.NOT_MARKED,
          Asr: PrayerStatus.NOT_MARKED,
          Maghrib: PrayerStatus.NOT_MARKED,
          Isha: PrayerStatus.NOT_MARKED
        },
        modes: {} as Record<PrayerName, PrayerMode>,
        entries: [],
        isLocked: false
      };

      const updatedPrayers = { ...currentLog.prayers, [name]: status };
      const updatedModes = { ...currentLog.modes, [name]: mode } as Record<PrayerName, PrayerMode>;
      
      const updatedEntries = [...(currentLog.entries || [])];
      const eIdx = updatedEntries.findIndex(e => e.prayer_name === name);
      if (eIdx > -1) updatedEntries[eIdx] = newEntry;
      else updatedEntries.push(newEntry);

      const updatedLog = { ...currentLog, prayers: updatedPrayers, modes: updatedModes, entries: updatedEntries };
      const updatedLogs = { ...prev.logs, [today]: updatedLog };
      
      const newStats = calculateStatsFromLogs(updatedLogs);

      const allOnTime = (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as PrayerName[]).every(p => 
        updatedPrayers[p] === PrayerStatus.ON_TIME || updatedPrayers[p] === PrayerStatus.LATE
      );

      if (allOnTime && lastCelebratedDate !== today) {
        setShowAchievement(true);
        setLastCelebratedDate(today);
        localStorage.setItem('nurtrack_last_celebrated', today);
      }

      return { ...prev, logs: updatedLogs, stats: newStats };
    });

    if (isOnline && user) syncEngine.sync(user.id);
    
    if (appState.settings.hapticsEnabled && 'vibrate' in navigator) {
      navigator.vibrate(status === PrayerStatus.NOT_MARKED ? 30 : 15);
    }
  };

  const lockTodayLog = async () => {
    const today = getTodayDateString();
    const currentLog = appState.logs[today];
    if (!currentLog) return;

    const updatedEntriesPromises = (currentLog.entries || []).map(async entry => {
      const lockedEntry = { ...entry, is_locked: true, synced: false };
      await db.saveEntry(lockedEntry);
      return lockedEntry;
    });

    const newEntries = await Promise.all(updatedEntriesPromises);

    setAppState(prev => ({
      ...prev,
      logs: {
        ...prev.logs,
        [today]: {
          ...currentLog,
          entries: newEntries,
          isLocked: true
        }
      }
    }));

    if (isOnline && user) syncEngine.sync(user.id);
    if (appState.settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate([50, 30, 50]);
  };

  const resetAllData = async () => {
    if (!window.confirm("⚠️ ATTENTION: This will permanently delete your prayer logs, reset your streaks, and clear all achievement data. This action cannot be undone. Are you sure?")) {
      return;
    }

    try {
      const DB_NAME = 'NurTrackDB';
      const deleteReq = indexedDB.deleteDatabase(DB_NAME);
      
      deleteReq.onerror = () => console.error("Could not delete database");
      deleteReq.onsuccess = () => console.log("Database deleted successfully");

      localStorage.removeItem('nurtrack_last_celebrated');
      
      const freshSettings = { ...INITIAL_SETTINGS, onboardingCompleted: false };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(freshSettings));

      if (user) {
        await (supabase.auth as any).signOut();
      }

      window.location.reload();
    } catch (e) {
      alert("An error occurred while resetting data.");
    }
  };

  const toggleTheme = () => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: prev.settings.theme === 'light' ? 'dark' : 'light' }
    }));
  };

  const toggleHaptics = () => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, hapticsEnabled: !prev.settings.hapticsEnabled }
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

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="relative">
          <Logo size={120} className="animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-8">
          <Loader2 className="animate-spin" size={16} />
          Initializing Local Database
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
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isDrawerOpen={isDrawerOpen}
      onCloseDrawer={handleCloseDrawer}
      drawerContent={
        <Settings 
          appState={appState} 
          onToggleTheme={toggleTheme} 
          onToggleHaptics={toggleHaptics} 
          onCycleStrictness={cycleStrictness} 
          setUserName={setUserName} 
          setTimingMode={setTimingMode} 
          setManualTiming={setManualTiming} 
          onResetData={resetAllData}
        />
      } 
      user={user}
    >
      {!isOnline && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4">
          <WifiOff size={16} className="text-amber-600 dark:text-amber-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">
            Offline Mode: Saving prayers locally
          </p>
        </div>
      )}

      <div key={activeTab} className="max-w-4xl mx-auto py-2 lg:py-6 animate-in fade-in duration-500 fill-mode-forwards">
        {activeTab === 'dashboard' && <Dashboard appState={appState} updatePrayerStatus={updatePrayerStatus} lockTodayLog={lockTodayLog} onOpenDrawer={handleOpenDrawer} />}
        {activeTab === 'analytics' && <Analytics appState={appState} onOpenDrawer={handleOpenDrawer} />}
        {activeTab === 'dua' && <Dua onOpenDrawer={handleOpenDrawer} />}
        {activeTab === 'tools' && <Tools appState={appState} onOpenDrawer={handleOpenDrawer} />}
        {activeTab === 'settings' && <Settings appState={appState} onToggleTheme={toggleTheme} onToggleHaptics={toggleHaptics} onCycleStrictness={cycleStrictness} setUserName={setUserName} setTimingMode={setTimingMode} setManualTiming={setManualTiming} onResetData={resetAllData} />}
      </div>
      {showAchievement && <AchievementPopup onClose={() => setShowAchievement(false)} userName={appState.settings.userName} />}
    </Layout>
  );
};

export default App;
