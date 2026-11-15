import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  onPress?: () => void;
  right?: React.ReactNode;
  testID?: string;
  accessibilityHint?: string;
}

export function ListItem({ title, subtitle, icon, onPress, right, testID, accessibilityHint }: ListItemProps) {
  const { c } = useTheme();
  const body = (
    <>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
          <Icon name={icon} color={c.primaryStrong} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="small" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="ChevronRight" color={c.textMuted} /> : null)}
    </>
  );
  if (!onPress) {
    return (
      <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]} testID={testID}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.8 : 1 }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
