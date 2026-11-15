import type { TFunction } from 'i18next';

import type { Measurement, MeasurementType } from '@/types/health';
import { MEASUREMENT_TYPES } from '@/types/health';
import { formatDateTime } from '@/utils/date';
import { MEASUREMENT_CONFIG } from './measurementConfig';

export function formatMeasurementValue(m: Measurement, t: TFunction): string {
  const unit = t(`tracker.units.${m.unit}`);
  const decimals = MEASUREMENT_CONFIG[m.type].decimals;
  const fmt = (n: number) => (decimals === 0 ? String(Math.round(n)) : String(Number(n.toFixed(decimals))));
  if (m.type === 'blood_pressure' && m.value2 !== null) return `${fmt(m.value)}/${fmt(m.value2)} ${unit}`;
  const prefix = m.type === 'cholesterol' && m.subtype ? `${t(`tracker.form.${m.subtype}`)} ` : '';
  return `${prefix}${fmt(m.value)} ${unit}`;
}

export function groupByType(measurements: Measurement[]): Record<MeasurementType, Measurement[]> {
  const groups = Object.fromEntries(MEASUREMENT_TYPES.map((t) => [t, [] as Measurement[]])) as Record<
    MeasurementType,
    Measurement[]
  >;
  for (const m of measurements) groups[m.type].push(m);
  return groups;
}

/**
 * Plain-text health summary for export (share sheet). Contains no
 * interpretation of values — only what the user entered + disclaimer.
 */
export function buildHealthSummary(measurements: Measurement[], t: TFunction, locale: string, now = new Date()): string {
  if (measurements.length === 0) return t('tracker.exportEmpty');
  const lines: string[] = [t('tracker.exportTitle'), formatDateTime(now.toISOString(), locale), ''];
  const groups = groupByType(measurements);
  for (const type of MEASUREMENT_TYPES) {
    const items = groups[type];
    if (items.length === 0) continue;
    lines.push(`## ${t(`tracker.types.${type}`)}`);
    for (const m of items) {
      const note = m.note ? ` — ${m.note}` : '';
      lines.push(`• ${formatDateTime(m.measuredAt, locale)}: ${formatMeasurementValue(m, t)}${note}`);
    }
    lines.push('');
  }
  lines.push(t('safety.measurementDisclaimer'));
  return lines.join('\n');
}
