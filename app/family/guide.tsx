import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { SignCard } from '@/components/emergency/SignCard';
import { BEFAST_SEQUENCE } from '@/features/stroke/signs';
import { router } from 'expo-router';
import { shareText } from '@/services/api/share';

export default function FamilyGuideScreen() {
  const { t } = useTranslation();
  return (
    <Screen testID="family-guide-screen">
      <AppText>{t('family.guideIntro')}</AppText>
      <Button testID="share-guide" icon="Share2" label={t('family.shareGuide')} onPress={() => void shareText(t('family.shareMessage'), t('family.guideTitle'))} />
      <Banner tone="emergency" text={t('safety.mainWarning')} />
      {BEFAST_SEQUENCE.map((letter) => (
        <SignCard
          key={letter}
          letter={letter}
          onObserve={(sign) => router.push({ pathname: '/emergency', params: { trigger: 'sign_observed', sign } })}
          timeAction={<Button variant="emergency" icon="Siren" label={t('home.openEmergency')} onPress={() => router.push('/emergency')} />}
        />
      ))}
    </Screen>
  );
}
