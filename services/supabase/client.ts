import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { config, isSupabaseConfigured } from '@/constants/config';
import { secureSessionStorage } from './secureStorage';

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null when the build has no credentials.
 * Callers MUST handle null: the app is fully usable without a backend.
 * Only the public anon key is used; RLS protects every user table.
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (!isSupabaseConfigured()) return null;
  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : secureSessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function setSupabaseForTesting(c: SupabaseClient | null): void {
  client = c;
}
