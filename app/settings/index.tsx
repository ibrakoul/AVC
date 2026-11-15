import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { LanguagePicker } from '@/components/common/LanguagePicker';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { Segmented } from '@/components/common/Segmented';
import { SectionTitle } from '@/components/common/SectionTitle';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useEmergencyCountry } from '@/hooks/useEmergencyCountry';
import type { ThemePreference } from '@/services/storage/settingsStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { settings, update } = useAppSettings();
  const { config } = useEmergencyCountry();

  return (
    <Screen testID="settings-screen">
      <SectionTitle>{t('settings.language')}</SectionTitle>
      <LanguagePicker />

      <SectionTitle>{t('settings.country')}</SectionTitle>
      <ListItem
        testID="settings-country"
        icon="Globe"
        title={config ? `${t(config.nameKey as 'countries.DE')} — ${config.primary.number}` : t('emergency.countryNotSet')}
        subtitle={t('emergency.changeCountry')}
        onPress={() => router.push('/emergency/country')}
      />

      <SectionTitle>{t('settings.theme')}</SectionTitle>
      <Segmented<ThemePreference>
        testIDPrefix="theme"
        accessibilityLabel={t('settings.theme')}
        value={settings.theme}
        onChange={(theme) => void update({ theme })}
        options={[
          { value: 'system', label: t('settings.themeSystem') },
          { value: 'light', label: t('settings.themeLight') },
          { value: 'dark', label: t('settings.themeDark') },
        ]}
      />

      <SectionTitle>{t('settings.notifications')}</SectionTitle>
      <ListItem icon="Bell" title={t('family.remindersTitle')} onPress={() => router.push('/family')} />
      <ListItem icon="ShieldCheck" title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      <ListItem icon="Info" title={t('settings.about')} onPress={() => router.push('/settings/about')} />
      <ListItem
        icon="BookOpen"
        title={t('settings.replayOnboarding')}
        onPress={async () => {
          await update({ onboardingDone: false });
          router.replace('/onboarding');
        }}
      />
      <AppText variant="caption" tone="muted">
        {t('safety.notDiagnostic')}
      </AppText>
    </Screen>
  );
}
