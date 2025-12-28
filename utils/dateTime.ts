
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

export const getPrayerContext = (settings: AppSettings) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const timings = settings.timingMode === 'manual' ? settings.manualTimings : DEFAULT_TIMINGS;
  const prayerOrder: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Create a mapping of minutes for comparison
  const prayerMinutes = prayerOrder.map(name => {
    const [h, m] = timings[name].split(':').map(Number);
    return { name, mins: h * 60 + m };
  });

  let currentIndex = -1;
  let nextIndex = -1;

  // Find the current period
  for (let i = 0; i < prayerMinutes.length; i++) {
    const current = prayerMinutes[i];
    const next = prayerMinutes[(i + 1) % prayerMinutes.length];
    
    // Check if it's after the last prayer (Isha) but before midnight or after midnight but before Fajr
    if (i === prayerMinutes.length - 1) {
       if (currentMinutes >= current.mins || currentMinutes < prayerMinutes[0].mins) {
         currentIndex = i;
         nextIndex = 0;
         break;
       }
    } else {
       if (currentMinutes >= current.mins && currentMinutes < next.mins) {
         currentIndex = i;
         nextIndex = i + 1;
         break;
       }
    }
  }

  // Handle case before Fajr starts (Midnight to Fajr)
  if (currentIndex === -1 && currentMinutes < prayerMinutes[0].mins) {
    currentIndex = 4; // Isha from yesterday
    nextIndex = 0; // Fajr today
  }

  const currentPrayer = prayerMinutes[currentIndex];
  const nextPrayer = prayerMinutes[nextIndex];

  return {
    current: {
      name: currentPrayer.name,
      startTime: formatTime12h(timings[currentPrayer.name]),
      endTime: formatTime12h(timings[nextPrayer.name]),
      isOngoing: true
    },
    next: {
      name: nextPrayer.name,
      startTime: formatTime12h(timings[nextPrayer.name]),
      rawTime: timings[nextPrayer.name],
      isTomorrow: nextIndex === 0 && currentMinutes >= prayerMinutes[4].mins
    }
  };
};

export const getNextPrayer = (settings: AppSettings) => {
  const context = getPrayerContext(settings);
  return context.next;
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
