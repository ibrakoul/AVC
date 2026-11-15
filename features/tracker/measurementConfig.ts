import type { MeasurementType, MeasurementUnit } from '@/types/health';

/**
 * Per-type input configuration. Ranges are PLAUSIBILITY limits to catch
 * typing errors — they are not clinical thresholds and are never used to
 * interpret or flag values.
 */
export interface RangeConfig {
  min: number;
  max: number;
}

export interface MeasurementTypeConfig {
  type: MeasurementType;
  units: MeasurementUnit[];
  /** Two values (systolic/diastolic). */
  dual: boolean;
  ranges: Partial<Record<MeasurementUnit, RangeConfig>>;
  /** Range for the secondary value (diastolic). */
  range2?: RangeConfig;
  decimals: number;
  icon: 'HeartPulse' | 'Activity' | 'Droplet' | 'FlaskConical' | 'Scale' | 'Footprints' | 'Moon';
}

export const MEASUREMENT_CONFIG: Record<MeasurementType, MeasurementTypeConfig> = {
  blood_pressure: {
    type: 'blood_pressure',
    units: ['mmHg'],
    dual: true,
    ranges: { mmHg: { min: 50, max: 300 } },
    range2: { min: 30, max: 200 },
    decimals: 0,
    icon: 'HeartPulse',
  },
  heart_rate: { type: 'heart_rate', units: ['bpm'], dual: false, ranges: { bpm: { min: 20, max: 250 } }, decimals: 0, icon: 'Activity' },
  blood_glucose: {
    type: 'blood_glucose',
    units: ['mg/dL', 'mmol/L'],
    dual: false,
    ranges: { 'mg/dL': { min: 20, max: 800 }, 'mmol/L': { min: 1, max: 45 } },
    decimals: 1,
    icon: 'Droplet',
  },
  cholesterol: {
    type: 'cholesterol',
    units: ['mg/dL', 'mmol/L'],
    dual: false,
    ranges: { 'mg/dL': { min: 10, max: 1000 }, 'mmol/L': { min: 0.3, max: 26 } },
    decimals: 1,
    icon: 'FlaskConical',
  },
  weight: { type: 'weight', units: ['kg', 'lb'], dual: false, ranges: { kg: { min: 2, max: 400 }, lb: { min: 4, max: 880 } }, decimals: 1, icon: 'Scale' },
  activity: { type: 'activity', units: ['min'], dual: false, ranges: { min: { min: 0, max: 1440 } }, decimals: 0, icon: 'Footprints' },
  sleep: { type: 'sleep', units: ['h'], dual: false, ranges: { h: { min: 0, max: 24 } }, decimals: 1, icon: 'Moon' },
};
