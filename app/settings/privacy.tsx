import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { BulletList } from '@/components/common/BulletList';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ToggleRow } from '@/components/common/ToggleRow';
import { isOnlineAssistantConfigured } from '@/constants/config';
import { deleteAccount } from '@/features/authentication/authService';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAuth } from '@/hooks/useAuth';
import { buildFullDataExport } from '@/services/api/dataExport';
import { shareText } from '@/services/api/share';
import { pushLocalData, recordConsent } from '@/services/api/syncService';
import { cancelReminder } from '@/services/notifications/reminders';
import { wipeLocalDatabase } from '@/services/storage/database';
import { clearAllKeyValueData } from '@/services/storage/settingsStore';
import { confirmDestructive } from '@/utils/confirm';

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  const { settings, update, reset } = useAppSettings();
  const { session, configured } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const principles = t('privacy.principles', { returnObjects: true }) as string[];

  const setConsent = async (key: 'cloudSync' | 'assistantOnline', value: boolean) => {
    await update({ consents: { ...settings.consents, [key]: value } });
    await recordConsent(key === 'cloudSync' ? 'cloud_sync' : 'assistant_online', value);
    if (key === 'cloudSync' && value) await pushLocalData(true);
    setMessage(t('privacy.consentUpdated'));
  };

  const deleteLocal = () =>
    confirmDestructive(t('common.confirmDeleteTitle'), t('privacy.deleteLocalConfirm'), t('common.delete'), t('common.cancel'), () => {
      void (async () => {
        await cancelReminder(settings.reminders.guide);
        await cancelReminder(settings.reminders.bp);
        await wipeLocalDatabase().catch(() => undefined);
        await clearAllKeyValueData().catch(() => undefined);
        await reset();
        setMessage(t('privacy.deleteLocalDone'));
        router.replace('/onboarding');
      })();
    });

  const removeAccount = () =>
    confirmDestructive(t('common.confirmDeleteTitle'), t('privacy.deleteAccountConfirm'), t('common.delete'), t('common.cancel'), () => {
      void deleteAccount().then((r) => setMessage(r.ok ? t('privacy.deleteAccountDone') : t('privacy.deleteAccountUnavailable')));
    });

  return (
    <Screen testID="privacy-screen">
      <AppText>{t('privacy.intro')}</AppText>
      <Card>
        <SectionTitle>{t('privacy.principlesTitle')}</SectionTitle>
        <BulletList items={principles} />
      </Card>

      <SectionTitle>{t('privacy.consentsTitle')}</SectionTitle>
      <ToggleRow
        testID="consent-cloud"
        label={t('privacy.consentCloudSync')}
        hint={session ? t('privacy.consentCloudSyncHint') : t('privacy.requiresAccount')}
        value={settings.consents.cloudSync}
        disabled={!session}
        onChange={(v) => void setConsent('cloudSync', v)}
      />
      <ToggleRow
        testID="consent-assistant"
        label={t('privacy.consentAssistant')}
        hint={isOnlineAssistantConfigured() ? t('privacy.consentAssistantHint') : t('assistant.faqMode')}
        value={settings.consents.assistantOnline}
        disabled={!isOnlineAssistantConfigured()}
        onChange={(v) => void setConsent('assistantOnline', v)}
      />
      {message ? <Banner tone="info" text={message} testID="privacy-message" /> : null}

      <SectionTitle>{t('privacy.dataTitle')}</SectionTitle>
      <Button
        testID="export-data"
        variant="secondary"
        icon="Download"
        label={t('privacy.exportData')}
        onPress={async () => {
          const text = await buildFullDataExport(t, i18n.language, settings).catch(() => null);
          if (text) await shareText(text, t('privacy.exportData'));
        }}
      />
      <AppText variant="small" tone="muted">
        {t('privacy.exportDataHint')}
      </AppText>
      <Button testID="delete-local-data" variant="danger" icon="Trash2" label={t('privacy.deleteLocal')} onPress={deleteLocal} />
      {configured && session ? <Button testID="delete-account" variant="danger" icon="Trash2" label={t('privacy.deleteAccount')} onPress={removeAccount} /> : null}
    </Screen>
  );
}
