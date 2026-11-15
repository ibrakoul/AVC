import { goBackOr } from '@/utils/navigation';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { authErrorMessage } from '@/features/authentication/authMessages';
import { signIn } from '@/features/authentication/authService';
import { useAuth } from '@/hooks/useAuth';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    const msg = authErrorMessage(res, t);
    setError(msg);
    if (!msg) goBackOr('/profile');
  };

  return (
    <Screen testID="sign-in-screen">
      <AppText tone="muted">{t('auth.optionalNotice')}</AppText>
      {!configured ? <Banner tone="info" text={t('auth.notConfigured')} /> : null}
      <TextField testID="email" label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField testID="password" label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      {error ? <Banner tone="warning" text={error} testID="auth-error" /> : null}
      <Button testID="submit-sign-in" label={t('auth.submitSignIn')} loading={busy} disabled={!configured} onPress={() => void submit()} />
      <Button variant="ghost" label={t('auth.forgotPassword')} onPress={() => router.push('/auth/reset')} />
      <Button variant="ghost" label={t('auth.noAccount')} onPress={() => router.replace('/auth/sign-up')} />
    </Screen>
  );
}
