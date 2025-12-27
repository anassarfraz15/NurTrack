
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION:
 * 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
 * 2. Go to Settings > API
 * 3. Copy "Project URL" and "anon public" key
 * 4. Paste them into the strings below:
 */
const SUPABASE_URL = 'https://kmmukykeswqgqqyoquxv.supabase.co'; // <-- PASTE YOUR PROJECT URL HERE
const SUPABASE_ANON_KEY = 'sb_publishable_QywUVoTx8WTK9Vf0QL6ZWA_aUfh76Lw'; // <-- PASTE YOUR ANON KEY HERE

// Fallback to environment variables if the above are empty
const supabaseUrl = SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const supabaseAnonKey = SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

let supabaseInstance: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http');
  } catch {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('NurTrack: Supabase cloud sync enabled.');
  } catch (e) {
    console.error('NurTrack: Supabase initialization error:', e);
  }
} else {
  console.warn('NurTrack: Running in Local Mode (No Supabase keys found). Set your credentials in services/supabase.ts for cloud backup.');
}

// Export a robust proxy to ensure calls like supabase.auth.getSession() don't crash the app
export const supabase = (supabaseInstance || {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error('Supabase project not connected. Check services/supabase.ts')),
    signUp: () => Promise.reject(new Error('Supabase project not connected. Check services/supabase.ts')),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    upsert: () => Promise.resolve({ error: null }),
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
}) as unknown as SupabaseClient;

export async function syncUserData(userId: string, data: any) {
  if (!supabaseInstance) return;
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, data: data }, { onConflict: 'user_id' });
    if (error) console.error('NurTrack Sync Error:', error.message);
  } catch (e) {
    console.error('NurTrack Sync Failed:', e);
  }
}

export async function fetchUserData(userId: string) {
  if (!supabaseInstance) return null;
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('data')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data?.data;
  } catch (e) {
    return null;
  }
}
