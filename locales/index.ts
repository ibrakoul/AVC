import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en/translation.json';
import fr from './fr/translation.json';
import de from './de/translation.json';
import { isSupportedLanguage, type SupportedLanguage } from '@/types/i18n';

/**
 * Internationalization entry point.
 *
 * To add a language: create `locales/<code>/translation.json` with exactly the
 * same keys as `en`, register it in `resources` below and in
 * `SUPPORTED_LANGUAGES` (types/i18n.ts). tests/i18n.test.ts enforces key parity.
 */
export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
} as const;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Picks the first device language we support, or English. */
export function detectDeviceLanguage(): SupportedLanguage {
  try {
    for (const locale of getLocales()) {
      if (isSupportedLanguage(locale.languageCode)) return locale.languageCode;
    }
  } catch {
    // expo-localization unavailable (tests/web edge cases): fall through.
  }
  return DEFAULT_LANGUAGE;
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    returnNull: false,
    // Resources are bundled: initialise synchronously so emergency content
    // never waits on an async loader.
    initAsync: false,
  });
}

export default i18n;
