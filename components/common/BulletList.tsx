import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

export function BulletList({ items, numbered, tone = 'default' }: { items: string[]; numbered?: boolean; tone?: 'default' | 'onEmergencySoft' }) {
  const { c } = useTheme();
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <View key={item} style={styles.row}>
          <AppText variant="bodyStrong" tone={tone} style={[styles.marker, !numbered && { color: tone === 'default' ? c.accentStrong : c.emergency }]}>
            {numbered ? `${i + 1}.` : '•'}
          </AppText>
          <AppText tone={tone} style={styles.flex}>
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  marker: { minWidth: 22 },
  flex: { flex: 1 },
});
