import { getCountryConfig } from '@/services/emergency/emergencyService';
import type { CountryEmergencyConfig } from '@/types/emergency';
import { useAppSettings } from './useAppSettings';

export interface EmergencyCountryState {
  config: CountryEmergencyConfig | null;
  /** 'user' = confirmed by the user; 'device' = suggested from region settings. */
  source: 'user' | 'device' | null;
}

export function useEmergencyCountry(): EmergencyCountryState {
  const { settings, effectiveCountry } = useAppSettings();
  const config = getCountryConfig(effectiveCountry);
  if (!config) return { config: null, source: null };
  return { config, source: settings.countryConfirmed ? 'user' : 'device' };
}
