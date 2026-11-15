import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function Card({ style, tone = 'default', ...rest }: ViewProps & { tone?: 'default' | 'emergency' | 'warning' | 'success' | 'alt' }) {
  const { c } = useTheme();
  const bg = { default: c.surface, emergency: c.emergencySoft, warning: c.warningSoft, success: c.successSoft, alt: c.surfaceAlt }[tone];
  const border = tone === 'emergency' ? c.emergency : c.border;
  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
});
