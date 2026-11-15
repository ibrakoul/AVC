import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

/** Always-visible emergency shortcut placed in every screen header. */
export function EmergencyHeaderButton() {
  const { t } = useTranslation();
  const { c } = useTheme();
  return (
    <Pressable
      testID="header-emergency-button"
      accessibilityRole="button"
      accessibilityLabel={t('emergency.title')}
      onPress={() => router.push('/emergency')}
      hitSlop={10}
      style={({ pressed }) => [styles.pill, { backgroundColor: c.emergency, opacity: pressed ? 0.85 : 1 }]}
    >
      <Icon name="Siren" size={18} color={c.onEmergency} />
      <AppText variant="caption" tone="onEmergency" style={styles.label}>
        {t('common.emergency')}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, minHeight: 40, borderRadius: radius.pill, marginHorizontal: spacing.sm },
  label: { fontWeight: '800' },
});
