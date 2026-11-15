import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { ToggleRow } from '@/components/common/ToggleRow';
import { authErrorMessage } from '@/features/authentication/authMessages';
import { signUp } from '@/features/authentication/authService';
import { useAuth } from '@/hooks/useAuth';
import { recordConsent } from '@/services/api/syncService';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const res = await signUp(email, password, consent);
    setBusy(false);
    const msg = authErrorMessage(res, t);
    setError(msg);
    if (res.ok) {
      await recordConsent('account_terms', true);
      setInfo(t('auth.signUpSuccess'));
    }
  };

  return (
    <Screen testID="sign-up-screen">
      <AppText tone="muted">{t('auth.optionalNotice')}</AppText>
      {!configured ? <Banner tone="info" text={t('auth.notConfigured')} /> : null}
      <TextField testID="email" label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField testID="password" label={t('auth.password')} hint={t('auth.passwordHint')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <ToggleRow testID="signup-consent" label={t('auth.consentLabel')} value={consent} onChange={setConsent} />
      {error ? <Banner tone="warning" text={error} testID="auth-error" /> : null}
      {info ? <Banner tone="info" text={info} /> : null}
      <Button testID="submit-sign-up" label={t('auth.submitSignUp')} loading={busy} disabled={!configured} onPress={() => void submit()} />
      <Button variant="ghost" label={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
      <Button variant="ghost" label={t('auth.haveAccount')} onPress={() => router.replace('/auth/sign-in')} />
    </Screen>
  );
}
