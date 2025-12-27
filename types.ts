
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export enum PrayerStatus {
  NOT_MARKED = 'NOT_MARKED',
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
  MISSED = 'MISSED'
}

export interface PrayerEntry {
  id: string;
  name: PrayerName;
  status: PrayerStatus;
  timestamp: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerName, PrayerStatus>;
  notes?: string;
}

export interface UserStats {
  streak: number;
  totalPrayers: number;
  onTimeCount: number;
  lastCompletedDate: string | null;
}

export interface AppState {
  logs: Record<string, DailyLog>;
  stats: UserStats;
  settings: AppSettings;
}

export interface AppSettings {
  userName?: string;
  language: 'English' | 'Urdu' | 'Arabic';
  theme: 'light' | 'dark';
  strictness: 'soft' | 'normal' | 'strict';
  timingMode: 'auto' | 'manual';
  manualTimings: Record<PrayerName, string>;
  onboardingCompleted?: boolean;
  intentions?: string[];
  location: {
    lat: number;
    lng: number;
  } | null;
}
