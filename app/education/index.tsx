import { router } from 'expo-router';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { SOURCES } from '@/constants/sources';

const SECTIONS = [
  ['ischemicTitle', 'ischemicBody'],
  ['hemorrhagicTitle', 'hemorrhagicBody'],
  ['tiaTitle', 'tiaBody'],
  ['whyTimeTitle', 'whyTimeBody'],
  ['afterTitle', 'afterBody'],
] as const;

export default function EducationScreen() {
  const { t } = useTranslation();
  return (
    <Screen testID="education-screen">
      <AppText>{t('education.intro')}</AppText>
      <Card tone="emergency">
        <AppText variant="heading" tone="onEmergencySoft">
          {t('education.disappearedTitle')}
        </AppText>
        <AppText tone="onEmergencySoft">{t('education.disappearedBody')}</AppText>
        <Button variant="emergency" icon="Siren" label={t('home.openEmergency')} onPress={() => router.push('/emergency')} />
      </Card>
      {SECTIONS.map(([title, body]) => (
        <Card key={title}>
          <AppText variant="heading">{t(`education.${title}`)}</AppText>
          <AppText>{t(`education.${body}`)}</AppText>
        </Card>
      ))}
      <SectionTitle>{t('common.sources')}</SectionTitle>
      {Object.values(SOURCES).map((s) => (
        <ListItem key={s.id} icon="Globe" title={s.title} subtitle={s.url} onPress={() => void Linking.openURL(s.url).catch(() => undefined)} />
      ))}
      <Banner tone="info" text={t('education.reviewNotice')} />
    </Screen>
  );
}
