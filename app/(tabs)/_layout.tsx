import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/common/Icon';
import { EmergencyHeaderButton } from '@/components/emergency/EmergencyHeaderButton';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useTheme } from '@/hooks/useTheme';

const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: unknown; size: number }) {
    return <Icon name={name} color={typeof color === 'string' ? color : '#486581'} size={size} />;
  };

export default function TabsLayout() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const { settings } = useAppSettings();

  // First launch → onboarding. Emergency routes live outside this group, so
  // they stay reachable even before onboarding is completed.
  if (!settings.onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <EmergencyHeaderButton />,
        tabBarActiveTintColor: c.primaryStrong,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarStyle: { backgroundColor: c.tabBar, borderTopColor: c.border, minHeight: 64 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), headerTitle: t('common.appName'), tabBarIcon: tabIcon('House') }} />
      <Tabs.Screen name="stroke-test" options={{ title: t('tabs.strokeTest'), headerTitle: t('stroke.title'), tabBarIcon: tabIcon('Brain') }} />
      <Tabs.Screen name="prevention" options={{ title: t('tabs.prevention'), headerTitle: t('prevention.title'), tabBarIcon: tabIcon('ShieldCheck') }} />
      <Tabs.Screen name="health-tracker" options={{ title: t('tabs.tracker'), headerTitle: t('tracker.title'), tabBarIcon: tabIcon('HeartPulse') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), headerTitle: t('profile.title'), tabBarIcon: tabIcon('User') }} />
    </Tabs>
  );
}
