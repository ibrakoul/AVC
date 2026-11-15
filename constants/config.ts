/**
 * Public runtime configuration. EXPO_PUBLIC_* variables are inlined into
 * the bundle at build time and are PUBLIC — never put secrets here.
 */
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  assistantEnabled: process.env.EXPO_PUBLIC_ASSISTANT_ENABLED === 'true',
  appVersion: '1.0.0',
} as const;

export function isSupabaseConfigured(): boolean {
  return /^https:\/\/.+/.test(config.supabaseUrl) && config.supabaseAnonKey.length > 20;
}

export function isOnlineAssistantConfigured(): boolean {
  return config.assistantEnabled && isSupabaseConfigured();
}
