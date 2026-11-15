import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Tone = 'info' | 'warning' | 'emergency';

export function Banner({ text, tone = 'info', icon, title, testID }: { text: string; tone?: Tone; icon?: IconName; title?: string; testID?: string }) {
  const { c } = useTheme();
  const map = {
    info: { bg: c.surfaceAlt, fg: 'default' as const, iconColor: c.primaryStrong, icon: 'Info' as IconName },
    warning: { bg: c.warningSoft, fg: 'onWarningSoft' as const, iconColor: c.onWarningSoft, icon: 'TriangleAlert' as IconName },
    emergency: { bg: c.emergencySoft, fg: 'onEmergencySoft' as const, iconColor: c.emergency, icon: 'Siren' as IconName },
  }[tone];
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole={tone === 'emergency' ? 'alert' : 'text'}
      style={[styles.banner, { backgroundColor: map.bg, borderColor: tone === 'emergency' ? c.emergency : 'transparent' }]}
    >
      <Icon name={icon ?? map.icon} color={map.iconColor} />
      <View style={styles.text}>
        {title ? (
          <AppText variant="bodyStrong" tone={map.fg}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="small" tone={map.fg}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
});
