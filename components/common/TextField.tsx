import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { MIN_TOUCH, radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, style, ...rest }: TextFieldProps) {
  const { c } = useTheme();
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          typography.body,
          { color: c.text, backgroundColor: c.surface, borderColor: error ? c.emergency : c.border },
          style,
        ]}
        {...rest}
      />
      {hint && !error ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="small" tone="emergency" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  input: { minHeight: MIN_TOUCH, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: spacing.md },
});
