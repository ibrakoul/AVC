import type { CholesterolKind, MeasurementType, MeasurementUnit, NewMeasurement } from '@/types/health';
import { parseLocalInput } from '@/utils/date';
import { MEASUREMENT_CONFIG } from './measurementConfig';

export interface MeasurementForm {
  type: MeasurementType;
  unit: MeasurementUnit;
  value: string;
  value2: string;
  subtype: CholesterolKind | null;
  dateTime: string;
  note: string;
}

/** Translation key + interpolation params, resolved by the UI. */
export interface FieldError {
  key: 'tracker.validation.required' | 'tracker.validation.number' | 'tracker.validation.range' | 'tracker.validation.date' | 'tracker.validation.bpOrder';
  params?: Record<string, number>;
}

export type ValidationResult =
  | { ok: true; measurement: NewMeasurement }
  | { ok: false; errors: Partial<Record<'value' | 'value2' | 'dateTime', FieldError>> };

function parseNumber(raw: string): number | null {
  const normalised = raw.trim().replace(',', '.');
  if (normalised === '' || !/^-?\d+(\.\d+)?$/.test(normalised)) return null;
  return Number(normalised);
}

export function validateMeasurement(form: MeasurementForm, now: Date = new Date()): ValidationResult {
  const config = MEASUREMENT_CONFIG[form.type];
  const errors: Partial<Record<'value' | 'value2' | 'dateTime', FieldError>> = {};
  const unit = config.units.includes(form.unit) ? form.unit : config.units[0]!;
  const range = config.ranges[unit];

  const checkValue = (raw: string, r: { min: number; max: number } | undefined): number | FieldError => {
    if (raw.trim() === '') return { key: 'tracker.validation.required' };
    const n = parseNumber(raw);
    if (n === null) return { key: 'tracker.validation.number' };
    if (r && (n < r.min || n > r.max)) return { key: 'tracker.validation.range', params: { min: r.min, max: r.max } };
    return n;
  };

  const v1 = checkValue(form.value, range);
  if (typeof v1 !== 'number') errors.value = v1;

  let v2: number | null = null;
  if (config.dual) {
    const res = checkValue(form.value2, config.range2);
    if (typeof res !== 'number') errors.value2 = res;
    else v2 = res;
    if (typeof v1 === 'number' && v2 !== null && v2 >= v1) errors.value2 = { key: 'tracker.validation.bpOrder' };
  }

  const date = parseLocalInput(form.dateTime);
  // Allow 5 minutes of clock skew.
  if (!date || date.getTime() > now.getTime() + 5 * 60_000) errors.dateTime = { key: 'tracker.validation.date' };

  if (Object.keys(errors).length > 0 || typeof v1 !== 'number' || !date) return { ok: false, errors };

  const note = form.note.trim().slice(0, 500);
  return {
    ok: true,
    measurement: {
      type: form.type,
      value: v1,
      value2: config.dual ? v2 : null,
      unit,
      subtype: form.type === 'cholesterol' ? (form.subtype ?? 'total') : null,
      measuredAt: date.toISOString(),
      note: note === '' ? null : note,
    },
  };
}
