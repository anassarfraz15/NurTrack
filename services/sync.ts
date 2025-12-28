
import { db } from './db';
import { supabase } from './supabase';
import { PrayerEntry } from '../types';

export class SyncEngine {
  private isSyncing = false;

  async sync(userId: string): Promise<void> {
    if (this.isSyncing || !navigator.onLine || !userId) return;

    this.isSyncing = true;
    console.debug('NurTrack: Background sync started...');

    try {
      const unsynced = await db.getUnsyncedEntries();
      if (unsynced.length === 0) return;

      // Filter entries for the current user only
      const userUnsynced = unsynced.filter(e => e.user_id === userId);
      if (userUnsynced.length === 0) return;

      // Prepare data for Supabase upsert
      // We use the composite key (user_id, prayer_date, prayer_name) defined in Postgres
      const payload = userUnsynced.map(({ synced, ...rest }) => ({
        ...rest,
        // Ensure remote uses the correct types
      }));

      const { error } = await supabase
        .from('prayer_logs')
        .upsert(payload, { 
          onConflict: 'user_id, prayer_date, prayer_name',
          ignoreDuplicates: false 
        });

      if (!error) {
        await db.markAsSynced(userUnsynced.map(e => e.id));
        console.debug(`NurTrack: Successfully synced ${userUnsynced.length} records.`);
      } else {
        console.error('NurTrack: Sync error:', error);
      }
    } catch (e) {
      console.error('NurTrack: Critical sync failure:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  // Initial pull to hydrate local DB if empty (optional but recommended)
  async hydrateLocal(userId: string): Promise<void> {
    if (!navigator.onLine || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('*')
        .eq('user_id', userId)
        .order('prayer_timestamp', { ascending: false })
        .limit(100);

      if (data && !error) {
        for (const remoteEntry of data) {
          await db.saveEntry({ ...remoteEntry, synced: true });
        }
      }
    } catch (e) {
      console.error('NurTrack: Hydration failed:', e);
    }
  }
}

export const syncEngine = new SyncEngine();
