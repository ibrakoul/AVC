import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { MeasurementTrend } from '@/components/health/MeasurementTrend';
import { spacing } from '@/constants/theme';
import { buildHealthSummary, groupByType } from '@/features/tracker/summary';
import { useMeasurements } from '@/hooks/useMeasurements';
import { shareText } from '@/services/api/share';
import { MEASUREMENT_TYPES } from '@/types/health';

export default function HealthTrackerScreen() {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = useMeasurements();
  const measurements = data ?? [];
  const groups = groupByType(measurements);

  return (
    <Screen testID="tracker-screen">
      <AppText>{t('tracker.intro')}</AppText>
      <Banner tone="info" text={t('safety.measurementDisclaimer')} testID="measurement-disclaimer" />
      <Button testID="add-measurement" icon="Plus" label={t('tracker.addMeasurement')} onPress={() => router.push('/tracker/add')} />
      <View style={styles.row}>
        <Button style={styles.grow} variant="secondary" icon="History" label={t('tracker.history')} onPress={() => router.push('/tracker/history')} />
        <Button
          style={styles.grow}
          variant="secondary"
          icon="Share2"
          label={t('tracker.export')}
          disabled={measurements.length === 0}
          onPress={() => void shareText(buildHealthSummary(measurements, t, i18n.language), t('tracker.exportTitle'))}
        />
      </View>
      {loading && data === undefined ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}
      {!loading && !error && measurements.length === 0 ? <EmptyState icon="HeartPulse" title={t('tracker.empty')} hint={t('tracker.emptyHint')} /> : null}
      {MEASUREMENT_TYPES.map((type) => (
        <MeasurementTrend key={type} type={type} items={groups[type]} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }, grow: { flexGrow: 1 } });
