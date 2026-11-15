import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import i18n, { detectDeviceLanguage } from '@/locales';
import { suggestCountryFromRegion } from '@/services/emergency/emergencyService';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AppSettings } from '@/services/storage/settingsStore';

interface AppSettingsContextValue {
  settings: AppSettings;
  ready: boolean;
  /** Country used for emergency numbers: confirmed choice or device-region suggestion. */
  effectiveCountry: string | null;
  update: (patch: Partial<AppSettings>) => Promise<void>;
  reset: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function deviceRegionSuggestion(): string | null {
  try {
    return suggestCountryFromRegion(getLocales().map((l) => l.regionCode));
  } catch {
    return null;
  }
}

/** Max time we wait for persisted settings before rendering with defaults. */
const LOAD_TIMEOUT_MS = 1500;

export function AppSettingsProvider({ children, initial }: { children: ReactNode; initial?: AppSettings }) {
  const [settings, setSettings] = useState<AppSettings>(initial ?? DEFAULT_SETTINGS);
  const [ready, setReady] = useState(initial !== undefined);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    const timeout = setTimeout(() => !cancelled && setReady(true), LOAD_TIMEOUT_MS);
    void loadSettings().then((loaded) => {
      if (cancelled) return;
      clearTimeout(timeout);
      setSettings(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [initial]);

  useEffect(() => {
    const lng = settings.language ?? detectDeviceLanguage();
    if (i18n.language !== lng) void i18n.changeLanguage(lng);
  }, [settings.language]);

  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    try {
      await saveSettings(next);
    } catch {
      // Keep in-memory value; persistence failure must never block the UI.
    }
  }, []);

  const reset = useCallback(async () => {
    settingsRef.current = DEFAULT_SETTINGS;
    setSettings(DEFAULT_SETTINGS);
    try {
      await saveSettings(DEFAULT_SETTINGS);
    } catch {
      /* ignore */
    }
  }, []);

  // countryConfirmed + null code = user explicitly said "my country is not listed".
  const effectiveCountry = settings.countryConfirmed ? settings.countryCode : (settings.countryCode ?? deviceRegionSuggestion());

  const value = useMemo(
    () => ({ settings, ready, effectiveCountry, update, reset }),
    [settings, ready, effectiveCountry, update, reset],
  );
  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}
