import { Text, type TextProps } from 'react-native';

import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Variant = keyof typeof typography;
type Tone = 'default' | 'muted' | 'primary' | 'emergency' | 'onPrimary' | 'onEmergency' | 'onEmergencySoft' | 'onWarningSoft';

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
}

export function AppText({ variant = 'body', tone = 'default', center, style, ...rest }: AppTextProps) {
  const { c } = useTheme();
  const color = {
    default: c.text,
    muted: c.textMuted,
    primary: c.primaryStrong,
    emergency: c.emergency,
    onPrimary: c.onPrimary,
    onEmergency: c.onEmergency,
    onEmergencySoft: c.onEmergencySoft,
    onWarningSoft: c.onWarningSoft,
  }[tone];
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={2}
      style={[typography[variant], { color }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
