import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { formatMeasurementValue } from '@/features/tracker/summary';
import { useTheme } from '@/hooks/useTheme';
import type { Measurement, MeasurementType } from '@/types/health';
import { formatDate } from '@/utils/date';
import { LineChart } from './LineChart';

const MAX_POINTS = 10;

export function MeasurementTrend({ type, items }: { type: MeasurementType; items: Measurement[] }) {
  const { t, i18n } = useTranslation();
  const { c } = useTheme();
  if (items.length === 0) return null;
  // items arrive newest first; chart oldest → newest. Only same-unit values are charted.
  const unit = items[0]!.unit;
  const subtype = items[0]!.subtype;
  const points = items.filter((m) => m.unit === unit && m.subtype === subtype).slice(0, MAX_POINTS).reverse();
  const latest = items[0]!;
  const typeName = t(`tracker.types.${type}`);

  return (
    <Card testID={`trend-${type}`}>
      <AppText variant="heading">{typeName}</AppText>
      <AppText>
        {t('tracker.latest')}: <AppText variant="bodyStrong">{formatMeasurementValue(latest, t)}</AppText>
      </AppText>
      <AppText variant="caption" tone="muted">
        {formatDate(latest.measuredAt, i18n.language)} · {t('tracker.entries', { count: items.length })}
      </AppText>
      {points.length >= 2 ? (
        <>
          <AppText variant="small" tone="muted">
            {t('tracker.trendTitle', { count: points.length })}
          </AppText>
          <LineChart
            accessibilityLabel={t('tracker.trendA11y', {
              type: typeName,
              count: points.length,
              from: formatMeasurementValue(points[0]!, t),
              to: formatMeasurementValue(points[points.length - 1]!, t),
            })}
            series={
              type === 'blood_pressure'
                ? [
                    { label: 'sys', color: c.primaryStrong, values: points.map((p) => p.value) },
                    { label: 'dia', color: c.accentStrong, values: points.map((p) => p.value2 ?? p.value) },
                  ]
                : [{ label: type, color: c.primaryStrong, values: points.map((p) => p.value) }]
            }
          />
        </>
      ) : (
        <AppText variant="small" tone="muted">
          {t('tracker.notEnoughForChart')}
        </AppText>
      )}
    </Card>
  );
}
