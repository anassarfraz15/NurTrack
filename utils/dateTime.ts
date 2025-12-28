
import { AppSettings, PrayerName } from '../types';

export const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

const DEFAULT_TIMINGS: Record<PrayerName, string> = {
  Fajr: '05:12',
  Dhuhr: '12:45',
  Asr: '16:15',
  Maghrib: '18:32',
  Isha: '20:00'
};

const formatTime12h = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m.toString().padStart(2, '0');
  return `${displayH}:${displayM} ${ampm}`;
};

export const getNextPrayer = (settings: AppSettings) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const timings = settings.timingMode === 'manual' ? settings.manualTimings : DEFAULT_TIMINGS;
  
  const prayerOrder: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (const name of prayerOrder) {
    const timeStr = timings[name];
    const [h, m] = timeStr.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    
    if (prayerMinutes > currentMinutes) {
      return { 
        name, 
        time: formatTime12h(timeStr),
        rawTime: timeStr,
        isTomorrow: false
      };
    }
  }
  
  // If all prayers today are passed, return Fajr tomorrow
  return { 
    name: 'Fajr' as PrayerName, 
    time: formatTime12h(timings['Fajr']),
    rawTime: timings['Fajr'],
    isTomorrow: true
  };
};

/**
 * Calculates both the currently active prayer period and the upcoming prayer context.
 * Used for the main dashboard display.
 */
export const getPrayerContext = (settings: AppSettings) => {
  const timings = settings.timingMode === 'manual' ? settings.manualTimings : DEFAULT_TIMINGS;
  const prayerOrder: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find the prayer whose time has passed but is most recent
  let currentPrayer: PrayerName = 'Isha';
  for (const name of prayerOrder) {
    const [h, m] = timings[name].split(':').map(Number);
    if (currentMinutes >= (h * 60 + m)) {
      currentPrayer = name;
    }
  }

  const currentIndex = prayerOrder.indexOf(currentPrayer);
  const nextIndex = (currentIndex + 1) % prayerOrder.length;
  const nextName = prayerOrder[nextIndex];
  
  const nextPrayerData = getNextPrayer(settings);

  return {
    current: {
      name: currentPrayer,
      startTime: formatTime12h(timings[currentPrayer]),
      endTime: formatTime12h(timings[nextName])
    },
    next: {
      name: nextPrayerData.name,
      startTime: nextPrayerData.time,
      rawTime: nextPrayerData.rawTime,
      isTomorrow: nextPrayerData.isTomorrow
    }
  };
};

export const getTimeRemaining = (rawTime: string, isTomorrow: boolean) => {
  const now = new Date();
  const [h, m] = rawTime.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  
  if (isTomorrow) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes <= 0) return "Starting now";
  
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  
  if (hours > 0) {
    return `in ${hours}h ${mins}m`;
  }
  return `in ${mins}m`;
};

export const getAllPrayerTimings = (settings: AppSettings) => {
  const timings = settings.timingMode === 'manual' ? settings.manualTimings : DEFAULT_TIMINGS;
  return Object.entries(timings).map(([name, time]) => ({
    name: name as PrayerName,
    time: formatTime12h(time)
  }));
};
