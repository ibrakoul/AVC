import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { authErrorMessage } from '@/features/authentication/authMessages';
import { requestPasswordReset } from '@/features/authentication/authService';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ tone: 'info' | 'warning'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Screen testID="reset-screen">
      {!configured ? <Banner tone="info" text={t('auth.notConfigured')} /> : null}
      <TextField testID="email" label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      {message ? <Banner tone={message.tone} text={message.text} /> : null}
      <Button
        label={t('auth.submitReset')}
        loading={busy}
        disabled={!configured}
        onPress={async () => {
          setBusy(true);
          const res = await requestPasswordReset(email);
          setBusy(false);
          const err = authErrorMessage(res, t);
          setMessage(err ? { tone: 'warning', text: err } : { tone: 'info', text: t('auth.resetSent') });
        }}
      />
    </Screen>
  );
}
