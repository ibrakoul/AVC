import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Screen>
      <AppText variant="title">{t('notFound.title')}</AppText>
      <Button label={t('notFound.goHome')} icon="House" onPress={() => router.replace('/')} />
      <Button label={t('emergency.title')} variant="emergency" icon="Siren" onPress={() => router.push('/emergency')} />
    </Screen>
  );
}
