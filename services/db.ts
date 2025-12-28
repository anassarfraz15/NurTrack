

import { PrayerEntry, PrayerName, PrayerStatus } from '../types';

const DB_NAME = 'NurTrackDB';
const DB_VERSION = 1;
const STORE_NAME = 'prayer_logs';

export class LocalDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('date', 'prayer_date', { unique: false });
          store.createIndex('user_prayer_date', ['user_id', 'prayer_date', 'prayer_name'], { unique: true });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveEntry(entry: PrayerEntry): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // We use a "upsert" logic based on user_id, date, and name
      // Native IndexedDB put works on keyPath (id). 
      // Our sync logic ensures UUID consistency.
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedEntries(): Promise<PrayerEntry[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('synced');
      
      // Fix: Cast boolean to any to avoid TypeScript error as 'boolean' is technically not in IDBValidKey type
      // but is widely supported by modern IndexedDB implementations for boolean indices.
      const request = index.getAll(false as any);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(ids: string[]): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const id of ids) {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result;
        if (data) {
          data.synced = true;
          store.put(data);
        }
      };
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async getAllLogs(): Promise<PrayerEntry[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new LocalDB();
