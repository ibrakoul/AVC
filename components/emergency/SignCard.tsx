import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { radius, spacing } from '@/constants/theme';
import { SIGN_ICONS, isObservable, type ObservableSign, type SignLetter } from '@/features/stroke/signs';
import { useTheme } from '@/hooks/useTheme';

export function SignCard({ letter, onObserve, timeAction }: { letter: SignLetter; onObserve: (sign: ObservableSign) => void; timeAction?: React.ReactNode }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const word = t(`stroke.signs.${letter}.word`);
  const isTime = letter === 'T';

  return (
    <Card testID={`sign-${letter}`} tone={isTime ? 'emergency' : 'default'}>
      <View style={styles.header}>
        <View style={[styles.letter, { backgroundColor: isTime ? c.emergency : c.primaryStrong }]}>
          <AppText variant="title" tone={isTime ? 'onEmergency' : 'onPrimary'}>
            {letter}
          </AppText>
        </View>
        <Icon name={SIGN_ICONS[letter]} size={32} color={isTime ? c.emergency : c.accentStrong} />
        <View style={styles.flex}>
          <AppText variant="caption" tone="muted">
            {word.toUpperCase()}
          </AppText>
          <AppText variant="heading">{t(`stroke.signs.${letter}.title`)}</AppText>
        </View>
      </View>
      <AppText>{t(`stroke.signs.${letter}.description`)}</AppText>
      <View style={[styles.check, { backgroundColor: c.surfaceAlt }]}>
        <AppText variant="caption" tone="muted">
          {t('stroke.howToCheck')}
        </AppText>
        <AppText variant="bodyStrong">{t(`stroke.signs.${letter}.check`)}</AppText>
      </View>
      {isObservable(letter) ? (
        <Button
          testID={`observe-${letter}`}
          variant="emergency"
          icon="Siren"
          label={t('stroke.observeNow')}
          accessibilityLabel={t('stroke.observeA11y', { sign: word })}
          onPress={() => onObserve(letter)}
        />
      ) : (
        timeAction
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  letter: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  check: { borderRadius: radius.md, padding: spacing.md, gap: 2 },
});
