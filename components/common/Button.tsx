import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'emergency' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  size?: 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', icon, loading, size = 'md', disabled, style, ...rest }: ButtonProps) {
  const { c } = useTheme();
  const palette = {
    primary: { bg: c.primaryStrong, fg: c.onPrimary, border: c.primaryStrong },
    secondary: { bg: c.surface, fg: c.primaryStrong, border: c.primaryStrong },
    emergency: { bg: c.emergency, fg: c.onEmergency, border: c.emergency },
    danger: { bg: c.surface, fg: c.emergency, border: c.emergency },
    ghost: { bg: 'transparent', fg: c.primaryStrong, border: 'transparent' },
  }[variant];
  const minHeight = size === 'xl' ? 76 : size === 'lg' ? 60 : MIN_TOUCH;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border, minHeight, opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : icon ? (
          <Icon name={icon} color={palette.fg} size={size === 'xl' ? 30 : 22} />
        ) : null}
        <AppText variant={size === 'xl' ? 'title' : 'button'} style={{ color: palette.fg, flexShrink: 1 }} center>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
