export const MEASUREMENT_TYPES = [
  'blood_pressure',
  'heart_rate',
  'blood_glucose',
  'cholesterol',
  'weight',
  'activity',
  'sleep',
] as const;
export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export type MeasurementUnit = 'mmHg' | 'bpm' | 'mg/dL' | 'mmol/L' | 'kg' | 'lb' | 'min' | 'h';
export type CholesterolKind = 'total' | 'ldl' | 'hdl';

export interface Measurement {
  id: string;
  type: MeasurementType;
  /** Primary value (systolic for blood pressure). */
  value: number;
  /** Secondary value (diastolic for blood pressure), otherwise null. */
  value2: number | null;
  unit: MeasurementUnit;
  /** Cholesterol result kind, otherwise null. */
  subtype: CholesterolKind | null;
  /** ISO timestamp of the measurement. */
  measuredAt: string;
  note: string | null;
  createdAt: string;
}

export type NewMeasurement = Omit<Measurement, 'id' | 'createdAt'>;

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  createdAt: string;
  updatedAt: string;
}

export const RISK_FACTORS = [
  'hypertension',
  'diabetes',
  'cholesterol',
  'smoking',
  'alcohol',
  'inactivity',
  'overweight',
  'atrialFibrillation',
  'previousStroke',
  'familyHistory',
] as const;
export type RiskFactor = (typeof RISK_FACTORS)[number];
export type RiskAnswer = 'yes' | 'no' | 'unknown';
export type PreventionAnswers = Partial<Record<RiskFactor, RiskAnswer>>;

export interface PreventionRecord {
  answers: PreventionAnswers;
  updatedAt: string;
}
