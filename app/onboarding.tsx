import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Icon, type IconName } from '@/components/common/Icon';
import { LanguagePicker } from '@/components/common/LanguagePicker';
import { Logo } from '@/components/common/Logo';
import { Screen } from '@/components/common/Screen';
import { spacing } from '@/constants/theme';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useTheme } from '@/hooks/useTheme';

const SLIDES: { title: 'slide1Title' | 'slide2Title' | 'slide3Title'; body: 'slide1Body' | 'slide2Body' | 'slide3Body'; icon: IconName }[] = [
  { title: 'slide1Title', body: 'slide1Body', icon: 'Brain' },
  { title: 'slide2Title', body: 'slide2Body', icon: 'Siren' },
  { title: 'slide3Title', body: 'slide3Body', icon: 'ShieldCheck' },
];

/**
 * Onboarding: language → 3 slides → disclaimer. The emergency button is
 * visible on EVERY step: onboarding never blocks emergency access.
 */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const { update } = useAppSettings();
  const [step, setStep] = useState(0); // 0 = language, 1..3 = slides, 4 = disclaimer

  const finish = async () => {
    await update({ onboardingDone: true });
    router.replace('/');
  };

  const emergencyBar = (
    <View style={styles.footer}>
      <AppText variant="small" tone="muted" center>
        {t('onboarding.emergencyAlways')}
      </AppText>
      <Button testID="onboarding-emergency" variant="emergency" icon="Siren" label={t('emergency.title')} onPress={() => router.push('/emergency')} />
    </View>
  );

  const slide = SLIDES[step - 1];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.background }]} edges={['top']}>
      <Screen testID="onboarding-screen" footer={emergencyBar} showOffline={false}>
        <View style={styles.brand}>
          <Logo size={72} />
          <AppText variant="display" center>
            {t('common.appName')}
          </AppText>
          <AppText variant="bodyStrong" tone="primary" center>
            {t('common.tagline')}
          </AppText>
        </View>

        {step === 0 ? (
          <>
            <AppText variant="title">{t('language.title')}</AppText>
            <AppText tone="muted">{t('language.subtitle')}</AppText>
            <LanguagePicker />
            <Button testID="onboarding-next" label={t('common.continue')} onPress={() => setStep(1)} />
          </>
        ) : slide ? (
          <>
            <Card style={styles.slide} testID={`onboarding-slide-${step}`}>
              <Icon name={slide.icon} size={48} color={slide.icon === 'Siren' ? c.emergency : c.primaryStrong} />
              <AppText variant="title" center>
                {t(`onboarding.${slide.title}`)}
              </AppText>
              <AppText center>{t(`onboarding.${slide.body}`)}</AppText>
            </Card>
            <Button testID="onboarding-next" label={t('common.continue')} onPress={() => setStep(step + 1)} />
            <Button variant="ghost" label={t('common.skip')} onPress={() => setStep(4)} />
          </>
        ) : (
          <>
            <AppText variant="title">{t('onboarding.disclaimerTitle')}</AppText>
            <Banner tone="emergency" text={t('safety.mainWarning')} />
            <Banner tone="info" text={t('safety.notDiagnostic')} />
            <Button testID="onboarding-accept" icon="Check" label={t('onboarding.acceptDisclaimer')} onPress={() => void finish()} />
          </>
        )}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brand: { alignItems: 'center', gap: spacing.sm },
  slide: { alignItems: 'center', paddingVertical: spacing.xl },
  footer: { gap: spacing.xs },
});
