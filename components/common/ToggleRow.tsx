import { StyleSheet, Switch, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export function ToggleRow({ label, hint, value, onChange, disabled, testID }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {hint ? (
          <AppText variant="small" tone="muted">
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        testID={testID}
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ true: c.primaryStrong, false: c.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  text: { flex: 1, gap: 2 },
});
