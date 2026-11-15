import '@/locales';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandSplash } from '@/components/common/BrandSplash';
import { EmergencyHeaderButton } from '@/components/emergency/EmergencyHeaderButton';
import { AppSettingsProvider, useAppSettings } from '@/hooks/useAppSettings';
import { AuthProvider } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { ready } = useAppSettings();
  const { c, scheme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return <BrandSplash />;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: c.background },
          headerBackTitle: t('common.back'),
          headerRight: () => <EmergencyHeaderButton />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="emergency/index" options={{ title: t('emergency.title'), headerRight: () => null }} />
        <Stack.Screen name="emergency/country" options={{ title: t('emergency.selectCountryTitle'), headerRight: () => null }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ title: t('settings.language') }} />
        <Stack.Screen name="education/index" options={{ title: t('education.title') }} />
        <Stack.Screen name="prevention/questionnaire" options={{ title: t('prevention.questionnaire.title') }} />
        <Stack.Screen name="tracker/add" options={{ title: t('tracker.addMeasurement') }} />
        <Stack.Screen name="tracker/history" options={{ title: t('tracker.history') }} />
        <Stack.Screen name="assistant" options={{ title: t('assistant.title') }} />
        <Stack.Screen name="family/index" options={{ title: t('family.title') }} />
        <Stack.Screen name="family/edit" options={{ title: t('family.editTitle') }} />
        <Stack.Screen name="family/guide" options={{ title: t('family.guideTitle') }} />
        <Stack.Screen name="settings/index" options={{ title: t('settings.title') }} />
        <Stack.Screen name="settings/privacy" options={{ title: t('privacy.title') }} />
        <Stack.Screen name="settings/about" options={{ title: t('about.title') }} />
        <Stack.Screen name="auth/sign-in" options={{ title: t('auth.signInTitle') }} />
        <Stack.Screen name="auth/sign-up" options={{ title: t('auth.signUpTitle') }} />
        <Stack.Screen name="auth/reset" options={{ title: t('auth.resetTitle') }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}
