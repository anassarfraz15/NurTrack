
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export enum PrayerStatus {
  NOT_MARKED = 'NOT_MARKED',
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
  MISSED = 'MISSED'
}

export enum PrayerMode {
  INDIVIDUAL = 'INDIVIDUAL',
  CONGREGATION = 'CONGREGATION'
}

export interface PrayerEntry {
  id: string; // UUID for local and remote tracking
  user_id: string;
  prayer_name: PrayerName;
  prayer_date: string; // YYYY-MM-DD
  prayer_status: PrayerStatus;
  prayer_mode?: PrayerMode;
  prayer_timestamp: number;
  synced: boolean;
  created_at: number;
  is_locked?: boolean; // New: track if this entry is finalized
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, PrayerStatus>;
  modes?: Partial<Record<PrayerName, PrayerMode>>;
  entries?: PrayerEntry[]; // Detailed entries for offline-first tracking
  isLocked?: boolean; // New: UI state for finalized logs
}

export interface UserStats {
  streak: number;
  bestStreak: number;
  totalPrayers: number;
  onTimeCount: number;
  lastCompletedDate: string | null;
}

export interface AppState {
  logs: Record<string, DailyLog>;
  stats: UserStats;
  settings: AppSettings;
  unlockedAchievements: string[];
}

export interface AppSettings {
  userName?: string;
  gender?: 'male' | 'female' | 'other';
  language: 'English' | 'Urdu' | 'Arabic';
  theme: 'light' | 'dark';
  strictness: 'soft' | 'normal' | 'strict';
  timingMode: 'auto' | 'manual';
  manualTimings: Record<PrayerName, string>;
  onboardingCompleted?: boolean;
  intentions?: string[];
  hapticsEnabled: boolean;
  location: {
    lat: number;
    lng: number;
  } | null;
}
