import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { spacing } from '@/constants/theme';
import { formatTime, minutesBetween } from '@/utils/date';

export function TimeRecorder({
  title,
  help,
  value,
  onChange,
  testID,
}: {
  title: string;
  help: string;
  value: string | null;
  onChange: (iso: string | null) => void;
  testID: string;
}) {
  const { t, i18n } = useTranslation();
  const shift = (minutes: number) => {
    const base = value ? new Date(value) : new Date();
    onChange(new Date(base.getTime() - minutes * 60_000).toISOString());
  };
  return (
    <Card testID={testID}>
      <AppText variant="bodyStrong">{title}</AppText>
      <AppText variant="small" tone="muted">
        {help}
      </AppText>
      <AppText variant="heading" testID={`${testID}-value`} accessibilityLiveRegion="polite">
        {value ? `${formatTime(value, i18n.language)} · ${t('emergency.minutesAgo', { count: minutesBetween(value) })}` : t('emergency.notRecorded')}
      </AppText>
      <View style={styles.row}>
        <Button style={styles.grow} label={t('emergency.recordNow')} icon="Clock" onPress={() => onChange(new Date().toISOString())} testID={`${testID}-now`} />
      </View>
      <View style={styles.row}>
        <Button style={styles.grow} variant="secondary" label={t('emergency.minus5')} onPress={() => shift(5)} />
        <Button style={styles.grow} variant="secondary" label={t('emergency.minus15')} onPress={() => shift(15)} />
        {value ? <Button style={styles.grow} variant="ghost" label={t('emergency.clear')} onPress={() => onChange(null)} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  grow: { flexGrow: 1 },
});
