import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { radius, spacing } from '@/constants/theme';
import { useEmergencyCountry } from '@/hooks/useEmergencyCountry';
import { useTheme } from '@/hooks/useTheme';
import { EmergencyCallButton } from './EmergencyCallButton';

export function ThinkStrokeCard() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const { config } = useEmergencyCountry();

  return (
    <View style={[styles.card, { backgroundColor: c.emergency }]} testID="think-stroke-card">
      <View style={styles.header}>
        <Icon name="Siren" size={30} color={c.onEmergency} />
        <AppText variant="title" tone="onEmergency" style={styles.flex}>
          {t('home.thinkStrokeTitle')}
        </AppText>
      </View>
      <AppText tone="onEmergency">{t('home.thinkStrokeBody')}</AppText>
      <View style={[styles.inner, { backgroundColor: c.surface }]}>
        {config ? (
          <EmergencyCallButton number={config.primary.number} size="lg" label={t('home.callButton', { number: config.primary.number })} showHint={false} testID="home-call-button" />
        ) : null}
        <Button
          testID="home-open-emergency"
          label={t('home.openEmergency')}
          variant={config ? 'danger' : 'emergency'}
          icon="Siren"
          onPress={() => router.push('/emergency')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  inner: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
});
