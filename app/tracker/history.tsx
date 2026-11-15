import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { Segmented } from '@/components/common/Segmented';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { formatMeasurementValue } from '@/features/tracker/summary';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useTheme } from '@/hooks/useTheme';
import { deleteAllMeasurements, deleteMeasurement } from '@/services/storage/measurementsRepository';
import { MEASUREMENT_TYPES, type MeasurementType } from '@/types/health';
import { confirmDestructive as confirm } from '@/utils/confirm';
import { formatDateTime } from '@/utils/date';

type Filter = MeasurementType | 'all';

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useTheme();
  const { data, loading, error, reload } = useMeasurements();
  const [filter, setFilter] = useState<Filter>('all');
  const items = (data ?? []).filter((m) => filter === 'all' || m.type === filter);

  const remove = (id: string) =>
    confirm(t('common.confirmDeleteTitle'), t('common.confirmDeleteMessage'), t('common.delete'), t('common.cancel'), () => {
      void deleteMeasurement(id).then(reload);
    });

  return (
    <Screen testID="history-screen">
      <Segmented<Filter>
        testIDPrefix="filter"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'all', label: '∗' }, ...MEASUREMENT_TYPES.map((type) => ({ value: type, label: t(`tracker.types.${type}`) }))]}
      />
      {loading && data === undefined ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}
      {!loading && items.length === 0 ? <EmptyState title={t('tracker.empty')} hint={t('tracker.emptyHint')} /> : null}
      {items.map((m) => (
        <ListItem
          key={m.id}
          testID={`measurement-${m.id}`}
          title={`${t(`tracker.types.${m.type}`)}: ${formatMeasurementValue(m, t)}`}
          subtitle={`${formatDateTime(m.measuredAt, i18n.language)}${m.note ? ` — ${m.note}` : ''}`}
          right={
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.delete')} onPress={() => remove(m.id)} hitSlop={12} testID={`delete-${m.id}`}>
              <Icon name="Trash2" color={c.emergency} />
            </Pressable>
          }
        />
      ))}
      {(data ?? []).length > 0 ? (
        <Button
          testID="delete-all-measurements"
          variant="danger"
          icon="Trash2"
          label={t('tracker.deleteAll')}
          onPress={() =>
            confirm(t('common.confirmDeleteTitle'), t('tracker.deleteAllConfirm'), t('common.delete'), t('common.cancel'), () => {
              void deleteAllMeasurements().then(reload);
            })
          }
        />
      ) : null}
      <Banner tone="info" text={t('safety.measurementDisclaimer')} />
      <AppText variant="caption" tone="muted">
        {t('tracker.entries', { count: (data ?? []).length })}
      </AppText>
    </Screen>
  );
}
