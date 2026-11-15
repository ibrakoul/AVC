import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { signOut } from '@/features/authentication/authService';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { configured, session } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <Screen testID="profile-screen">
      <SectionTitle>{t('profile.sections.account')}</SectionTitle>
      <Card testID="account-card">
        {session ? (
          <>
            <AppText variant="bodyStrong">{t('profile.signedInAs', { email: session.user.email ?? '' })}</AppText>
            <Button
              variant="secondary"
              icon="LogOut"
              label={t('profile.signOut')}
              loading={busy}
              onPress={async () => {
                setBusy(true);
                await signOut();
                setBusy(false);
              }}
            />
          </>
        ) : (
          <>
            <AppText variant="bodyStrong">{t('profile.guest')}</AppText>
            <AppText tone="muted">{t('profile.guestHint')}</AppText>
            {configured ? (
              <>
                <Button testID="profile-sign-in" icon="User" label={t('profile.signIn')} onPress={() => router.push('/auth/sign-in')} />
                <Button variant="secondary" label={t('profile.signUp')} onPress={() => router.push('/auth/sign-up')} />
              </>
            ) : (
              <AppText variant="small" tone="muted" testID="auth-not-configured">
                {t('auth.notConfigured')}
              </AppText>
            )}
          </>
        )}
      </Card>

      <SectionTitle>{t('profile.sections.tools')}</SectionTitle>
      <ListItem icon="Users" title={t('profile.family')} onPress={() => router.push('/family')} />
      <ListItem icon="History" title={t('profile.history')} onPress={() => router.push('/tracker/history')} />
      <ListItem icon="Bot" title={t('profile.assistant')} onPress={() => router.push('/assistant')} />
      <ListItem icon="BookOpen" title={t('profile.education')} onPress={() => router.push('/education')} />

      <SectionTitle>{t('profile.sections.app')}</SectionTitle>
      <ListItem icon="Settings" title={t('profile.settings')} onPress={() => router.push('/settings')} testID="open-settings" />
      <ListItem icon="ShieldCheck" title={t('profile.privacy')} onPress={() => router.push('/settings/privacy')} testID="open-privacy" />
      <ListItem icon="Info" title={t('profile.about')} onPress={() => router.push('/settings/about')} testID="open-about" />
    </Screen>
  );
}
