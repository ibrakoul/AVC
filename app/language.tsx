import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { LanguagePicker } from '@/components/common/LanguagePicker';
import { Screen } from '@/components/common/Screen';

export default function LanguageScreen() {
  const { t } = useTranslation();
  return (
    <Screen testID="language-screen">
      <AppText variant="title">{t('language.title')}</AppText>
      <AppText tone="muted">{t('language.subtitle')}</AppText>
      <LanguagePicker onSelected={() => router.canGoBack() && router.back()} />
    </Screen>
  );
}
