import type { SupportedLanguage } from './i18n';

/** Status of the human verification of a country's emergency data. */
export type VerificationStatus = 'verified' | 'pending_official_review';

export interface EmergencyNumber {
  /** Digits only, e.g. "112". Used to build the `tel:` link. */
  number: string;
  /** Translation key describing what this number is for. */
  labelKey: string;
}

export interface CountryEmergencyConfig {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  /** Translation key of the country name (countries.<code>). */
  nameKey: string;
  /** App languages that are relevant for this country, preferred first. */
  languages: SupportedLanguage[];
  /** Number to call for a suspected stroke (medical emergency). */
  primary: EmergencyNumber;
  /** Other valid emergency numbers (e.g. 112 in addition to a national one). */
  alternatives: EmergencyNumber[];
  /** Numbers people may confuse with emergency numbers that must NOT be used for a stroke (shown as a warning, never dialled). */
  notForStroke?: EmergencyNumber[];
  /** Official source that a reviewer must use to (re)verify this entry. */
  officialSource: { name: string; url: string };
  /** ISO date the entry was last checked against the official source, or null. */
  lastVerified: string | null;
  verificationStatus: VerificationStatus;
}

export interface EmergencyDataset {
  /** Version of the bundled dataset — shown in the UI. */
  version: string;
  /** ISO date the dataset was compiled. */
  compiledAt: string;
  countries: CountryEmergencyConfig[];
}
