import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * CONFIGURATION:
 * When deploying to Netlify, add these as Environment Variables in the Netlify Dashboard.
 */
const FALLBACK_URL = 'https://kmmukykeswqgqqyoquxv.supabase.co';
const FALLBACK_KEY = 'sb_publishable_QywUVoTx8WTK9Vf0QL6ZWA_aUfh76Lw';

const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || FALLBACK_URL;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || FALLBACK_KEY;

let supabaseInstance: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  try {
    return url && url.startsWith('http');
  } catch {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('NurTrack: Supabase client initialization skipped or failed.');
  }
}

export const supabase = (supabaseInstance || {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error('Authentication Service Unavailable')),
    signUp: () => Promise.reject(new Error('Authentication Service Unavailable')),
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
    await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, data: data }, { onConflict: 'user_id' });
  } catch (e) {
    // Fail silently to prevent UI disruption
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