import AsyncStorage from '@react-native-async-storage/async-storage';

import { isSupportedLanguage, type SupportedLanguage } from '@/types/i18n';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  /** null = not chosen yet → device language. */
  language: SupportedLanguage | null;
  countryCode: string | null;
  /** True once the user confirmed/selected the country manually. */
  countryConfirmed: boolean;
  theme: ThemePreference;
  onboardingDone: boolean;
  consents: { cloudSync: boolean; assistantOnline: boolean };
  reminders: { guide: string | null; bp: string | null };
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: null,
  countryCode: null,
  countryConfirmed: false,
  theme: 'system',
  onboardingDone: false,
  consents: { cloudSync: false, assistantOnline: false },
  reminders: { guide: null, bp: null },
};

const KEY = 'sg.settings.v1';

export function sanitizeSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const r = raw as Record<string, unknown>;
  const consents = (r.consents ?? {}) as Record<string, unknown>;
  const reminders = (r.reminders ?? {}) as Record<string, unknown>;
  return {
    language: isSupportedLanguage(r.language) ? r.language : null,
    countryCode: typeof r.countryCode === 'string' && /^[A-Z]{2}$/.test(r.countryCode) ? r.countryCode : null,
    countryConfirmed: r.countryConfirmed === true,
    theme: r.theme === 'light' || r.theme === 'dark' ? r.theme : 'system',
    onboardingDone: r.onboardingDone === true,
    consents: { cloudSync: consents.cloudSync === true, assistantOnline: consents.assistantOnline === true },
    reminders: {
      guide: typeof reminders.guide === 'string' ? reminders.guide : null,
      bp: typeof reminders.bp === 'string' ? reminders.bp : null,
    },
  };
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

// --- Emergency times (symptom onset / last known well) -----------------------

export interface EmergencyTimes {
  onsetAt: string | null;
  lastKnownWellAt: string | null;
}

const TIMES_KEY = 'sg.emergencyTimes.v1';

export async function loadEmergencyTimes(): Promise<EmergencyTimes> {
  try {
    const raw = await AsyncStorage.getItem(TIMES_KEY);
    if (!raw) return { onsetAt: null, lastKnownWellAt: null };
    const r = JSON.parse(raw) as Record<string, unknown>;
    const iso = (v: unknown) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);
    return { onsetAt: iso(r.onsetAt), lastKnownWellAt: iso(r.lastKnownWellAt) };
  } catch {
    return { onsetAt: null, lastKnownWellAt: null };
  }
}

export async function saveEmergencyTimes(times: EmergencyTimes): Promise<void> {
  try {
    await AsyncStorage.setItem(TIMES_KEY, JSON.stringify(times));
  } catch {
    // Non-fatal: times are still kept in memory for this session.
  }
}

export async function clearAllKeyValueData(): Promise<void> {
  await AsyncStorage.multiRemove([KEY, TIMES_KEY]);
}
