import React from 'react';
import { Moon, Sun, Globe, Bell, MapPin, ShieldCheck, Download, Trash2, User, Clock, Smartphone } from 'lucide-react';
import { AppState, PrayerName } from '../types';
import { PRAYER_NAMES } from '../constants';

interface SettingsProps {
  appState: AppState;
  onToggleTheme: () => void;
  onToggleHaptics: () => void;
  onCycleStrictness: () => void;
  setUserName: (name: string) => void;
  setTimingMode: (mode: 'auto' | 'manual') => void;
  setManualTiming: (prayer: PrayerName, time: string) => void;
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  appState, 
  onToggleTheme,
  onToggleHaptics,
  onCycleStrictness, 
  setUserName,
  setTimingMode,
  setManualTiming,
  onResetData
}) => {
  const isDark = appState.settings.theme === 'dark';

  const sections = [
    {
      title: 'Profile',
      items: [
        { 
          icon: User, 
          label: 'Name', 
          action: 'input', 
          value: appState.settings.userName || '',
          placeholder: 'Enter name',
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)
        }
      ]
    },
    {
      title: 'Prayer Timings',
      items: [
        { 
          icon: Clock, 
          label: 'Mode', 
          action: 'select', 
          value: appState.settings.timingMode,
          onClick: () => setTimingMode(appState.settings.timingMode === 'auto' ? 'manual' : 'auto')
        }
      ]
    }
  ];

  const appSections = [
    {
      title: 'Appearance',
      items: [
        { 
          icon: isDark ? Moon : Sun, 
          label: 'Dark Mode', 
          action: 'toggle', 
          value: isDark,
          onClick: onToggleTheme
        },
        { icon: Globe, label: 'Language', action: 'select', value: appState.settings.language },
      ]
    },
    {
      title: 'Experience',
      items: [
        { 
          icon: Smartphone, 
          label: 'Haptic Feedback', 
          action: 'toggle', 
          value: appState.settings.hapticsEnabled,
          onClick: onToggleHaptics
        },
        { icon: Bell, label: 'Athan Notifications', action: 'toggle', value: true },
        { 
          icon: ShieldCheck, 
          label: 'Strictness', 
          action: 'select', 
          value: appState.settings.strictness,
          onClick: onCycleStrictness
        },
      ]
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="space-y-6">
        {/* Core Settings */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-charcoal-accent uppercase tracking-widest px-1">{section.title}</h3>
            <div className="bg-slate-50 dark:bg-charcoal-surface border border-slate-100 dark:border-charcoal-border rounded-2xl overflow-hidden">
              {section.items.map((item, iIdx) => (
                <div 
                  key={iIdx} 
                  className={`flex items-center justify-between p-3 transition-colors ${iIdx !== section.items.length - 1 ? 'border-b border-slate-100 dark:border-charcoal-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500 dark:text-charcoal-sub">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-charcoal-text">{item.label}</span>
                  </div>
                  
                  <div>
                    {item.action === 'input' && (
                      <input 
                        type="text"
                        value={String(item.value)}
                        placeholder={item.placeholder}
                        onChange={item.onChange}
                        className="w-24 bg-white dark:bg-charcoal border-none rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-right"
                      />
                    )}
                    {item.action === 'select' && (
                      <button 
                        onClick={item.onClick}
                        className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md uppercase"
                      >
                        {String(item.value)}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {section.title === 'Prayer Timings' && appState.settings.timingMode === 'manual' && (
                <div className="p-3 space-y-3 bg-white dark:bg-charcoal border-t border-slate-100 dark:border-charcoal-border">
                  {PRAYER_NAMES.map((name) => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500">{name}</span>
                      <input 
                        type="time" 
                        value={appState.settings.manualTimings[name as PrayerName]}
                        onChange={(e) => setManualTiming(name as PrayerName, e.target.value)}
                        className="bg-slate-50 dark:bg-charcoal-surface border-none rounded-lg px-2 py-1 text-[10px] dark:text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Appearance & Experience */}
        {appSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-charcoal-accent uppercase tracking-widest px-1">{section.title}</h3>
            <div className="bg-slate-50 dark:bg-charcoal-surface border border-slate-100 dark:border-charcoal-border rounded-2xl overflow-hidden">
              {section.items.map((item, iIdx) => (
                <div 
                  key={iIdx} 
                  className={`flex items-center justify-between p-3 transition-colors ${iIdx !== section.items.length - 1 ? 'border-b border-slate-100 dark:border-charcoal-border' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500 dark:text-charcoal-sub">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-charcoal-text">{item.label}</span>
                  </div>
                  
                  <div>
                    {item.action === 'toggle' && (
                      <button 
                        onClick={item.onClick}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${item.value ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-charcoal-border'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                    )}
                    {item.action === 'select' && (
                      <button 
                        onClick={item.onClick}
                        className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md uppercase"
                      >
                        {String(item.value)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Data Management */}
        <div className="pt-2">
           <button 
            onClick={onResetData}
            className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-2xl transition-all active:scale-[0.98] hover:bg-rose-100 dark:hover:bg-rose-900/20"
          >
            <Trash2 size={14} /> Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;