import { Linking } from 'react-native';

import { EMERGENCY_DATASET } from '@/constants/emergencyNumbers';
import type { CountryEmergencyConfig, EmergencyDataset } from '@/types/emergency';

/**
 * Emergency service — pure, dependency-injected helpers so that the most
 * safety-critical logic is fully unit-tested.
 *
 * SAFETY RULES enforced here:
 * - We never claim a call has been placed. We only report whether the
 *   operating system accepted to open the phone app (`dialer_opened`).
 * - We never invent a number: unknown countries return `null` and the UI
 *   shows manual-selection guidance.
 */

export function getCountryConfig(
  code: string | null | undefined,
  dataset: EmergencyDataset = EMERGENCY_DATASET,
): CountryEmergencyConfig | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  return dataset.countries.find((c) => c.code === upper) ?? null;
}

export function listCountries(dataset: EmergencyDataset = EMERGENCY_DATASET): CountryEmergencyConfig[] {
  return dataset.countries;
}

/**
 * Suggests a country from the device REGION setting (not geolocation).
 * Returns null when the region is unknown or not in the dataset.
 */
export function suggestCountryFromRegion(
  regionCodes: (string | null | undefined)[],
  dataset: EmergencyDataset = EMERGENCY_DATASET,
): string | null {
  for (const region of regionCodes) {
    const config = getCountryConfig(region, dataset);
    if (config) return config.code;
  }
  return null;
}

/** Keeps digits, `+`, `*` and `#` only. Returns null if no digit remains. */
export function sanitizePhoneNumber(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+*#]/g, '');
  return /\d/.test(cleaned) ? cleaned : null;
}

export function buildTelUrl(number: string): string | null {
  const sanitized = sanitizePhoneNumber(number);
  return sanitized ? `tel:${sanitized}` : null;
}

export type DialResult =
  | { status: 'dialer_opened'; number: string }
  | { status: 'failed'; number: string; reason: 'invalid_number' | 'os_refused' };

export interface DialDeps {
  openURL: (url: string) => Promise<unknown>;
}

const defaultDeps: DialDeps = { openURL: (url) => Linking.openURL(url) };

/**
 * Asks the OS to open the native phone app with `number`.
 *
 * We intentionally do NOT call `canOpenURL` first: on iOS it requires
 * LSApplicationQueriesSchemes and may return false even when dialling works,
 * which could wrongly block an emergency call. We attempt to open directly
 * and fall back to manual-dialling guidance on failure.
 */
export async function openEmergencyDialer(number: string, deps: DialDeps = defaultDeps): Promise<DialResult> {
  const url = buildTelUrl(number);
  if (!url) return { status: 'failed', number, reason: 'invalid_number' };
  try {
    await deps.openURL(url);
    return { status: 'dialer_opened', number };
  } catch {
    return { status: 'failed', number, reason: 'os_refused' };
  }
}

/**
 * True when the bundled emergency data must be presented as
 * "requires verification": not human-verified, or older than `maxAgeDays`.
 */
export function requiresVerification(
  config: CountryEmergencyConfig,
  now: Date = new Date(),
  maxAgeDays = 365,
): boolean {
  if (config.verificationStatus !== 'verified' || !config.lastVerified) return true;
  const verifiedAt = new Date(config.lastVerified);
  if (Number.isNaN(verifiedAt.getTime())) return true;
  const ageDays = (now.getTime() - verifiedAt.getTime()) / 86_400_000;
  return ageDays > maxAgeDays;
}
