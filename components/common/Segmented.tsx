import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  testIDPrefix,
}: {
  options: SegmentOption<T>[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
  testIDPrefix?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.row, { borderColor: c.border, backgroundColor: c.surfaceAlt }]} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={testIDPrefix ? `${testIDPrefix}-${o.value}` : undefined}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[styles.item, selected && { backgroundColor: c.primaryStrong }]}
          >
            <AppText variant="bodyStrong" tone={selected ? 'onPrimary' : 'default'} center>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.md, padding: 3, gap: 3, flexWrap: 'wrap' },
  item: { flexGrow: 1, flexBasis: 0, minWidth: 70, minHeight: MIN_TOUCH - 6, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
});
