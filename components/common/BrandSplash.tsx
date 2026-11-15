import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { palette, spacing } from '@/constants/theme';
import { AppText } from './AppText';
import { Logo } from './Logo';

/** In-app splash (shown for at most ~1.5 s while settings load). */
export function BrandSplash() {
  return (
    <View style={styles.root} testID="brand-splash">
      <Logo size={96} inverted />
      <AppText variant="display" style={styles.text} center>
        STROKE GUARD AI
      </AppText>
      <AppText variant="bodyStrong" style={styles.tagline} center>
        Recognize. React. Prevent.
      </AppText>
      <ActivityIndicator color={palette.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  text: { color: palette.white },
  tagline: { color: palette.turquoise },
});
