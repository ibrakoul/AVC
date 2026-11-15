import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';

export function LoadingState({ label }: { label?: string }) {
  const { c } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label ?? t('common.loading')} testID="loading-state">
      <ActivityIndicator size="large" color={c.primaryStrong} />
      <AppText tone="muted">{label ?? t('common.loading')}</AppText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <Card tone="warning" testID="error-state">
      <AppText tone="onWarningSoft">{message ?? t('common.errorGeneric')}</AppText>
      {onRetry ? <Button label={t('common.retry')} variant="secondary" onPress={onRetry} icon="History" /> : null}
    </Card>
  );
}

export function EmptyState({ title, hint, icon = 'ClipboardList' }: { title: string; hint?: string; icon?: IconName }) {
  const { c } = useTheme();
  return (
    <Card style={styles.empty} testID="empty-state">
      <Icon name={icon} size={36} color={c.textMuted} />
      <AppText variant="bodyStrong" center>
        {title}
      </AppText>
      {hint ? (
        <AppText tone="muted" center>
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  empty: { alignItems: 'center' },
});
