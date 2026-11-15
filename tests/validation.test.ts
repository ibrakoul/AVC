import { validateMeasurement, type MeasurementForm } from '@/features/tracker/validation';
import { parseLocalInput, toLocalInput } from '@/utils/date';
import { validateContact } from '@/features/family/contactValidation';

const now = new Date(2026, 10, 15, 12, 0);
const base: MeasurementForm = { type: 'heart_rate', unit: 'bpm', value: '72', value2: '', subtype: null, dateTime: '2026-11-15 11:30', note: '' };

describe('health data entry validation', () => {
  it('accepts a valid heart rate', () => {
    const r = validateMeasurement(base, now);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.measurement).toMatchObject({ type: 'heart_rate', value: 72, value2: null, unit: 'bpm', note: null });
  });

  it('accepts blood pressure and requires systolic > diastolic', () => {
    expect(validateMeasurement({ ...base, type: 'blood_pressure', unit: 'mmHg', value: '128', value2: '82' }, now).ok).toBe(true);
    const bad = validateMeasurement({ ...base, type: 'blood_pressure', unit: 'mmHg', value: '80', value2: '120' }, now);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.value2?.key).toBe('tracker.validation.bpOrder');
  });

  it('accepts comma decimals (European keyboards)', () => {
    const r = validateMeasurement({ ...base, type: 'blood_glucose', unit: 'mmol/L', value: '5,6' }, now);
    expect(r.ok && r.measurement.value).toBe(5.6);
  });

  it('rejects empty, non-numeric and implausible values', () => {
    const e1 = validateMeasurement({ ...base, value: '' }, now);
    const e2 = validateMeasurement({ ...base, value: 'abc' }, now);
    const e3 = validateMeasurement({ ...base, value: '900' }, now);
    expect(!e1.ok && e1.errors.value?.key).toBe('tracker.validation.required');
    expect(!e2.ok && e2.errors.value?.key).toBe('tracker.validation.number');
    expect(!e3.ok && e3.errors.value).toEqual({ key: 'tracker.validation.range', params: { min: 20, max: 250 } });
  });

  it('rejects future and invalid dates', () => {
    expect(validateMeasurement({ ...base, dateTime: '2026-11-16 10:00' }, now).ok).toBe(false);
    expect(validateMeasurement({ ...base, dateTime: '2026-02-31 10:00' }, now).ok).toBe(false);
    expect(validateMeasurement({ ...base, dateTime: 'yesterday' }, now).ok).toBe(false);
  });

  it('round-trips local date format', () => {
    const d = new Date(2026, 0, 5, 7, 9);
    expect(parseLocalInput(toLocalInput(d))?.getTime()).toBe(d.getTime());
  });

  it('defaults cholesterol subtype to total and trims notes', () => {
    const r = validateMeasurement({ ...base, type: 'cholesterol', unit: 'mmol/L', value: '5.2', note: '  fasting  ' }, now);
    expect(r.ok && r.measurement.subtype).toBe('total');
    expect(r.ok && r.measurement.note).toBe('fasting');
  });
});

describe('contact validation', () => {
  it('requires a name and a plausible phone number', () => {
    expect(validateContact('', '123')).toEqual({ name: 'family.nameRequired' });
    expect(validateContact('Anna', 'abc')).toEqual({ phone: 'family.phoneInvalid' });
    expect(validateContact('Anna', '+49 151 2345678')).toEqual({});
  });
});
