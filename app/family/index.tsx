import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { ToggleRow } from '@/components/common/ToggleRow';
import { spacing } from '@/constants/theme';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAsyncData } from '@/hooks/useAsyncData';
import { openEmergencyDialer } from '@/services/emergency/emergencyService';
import { cancelReminder, scheduleReminder, type ReminderKind } from '@/services/notifications/reminders';
import { deleteContact, listContacts } from '@/services/storage/contactsRepository';
import { confirmDestructive } from '@/utils/confirm';

export default function FamilyScreen() {
  const { t } = useTranslation();
  const { settings, update } = useAppSettings();
  const { data, loading, error, reload } = useAsyncData(() => listContacts());
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const toggleReminder = async (kind: ReminderKind, enabled: boolean) => {
    if (!enabled) {
      await cancelReminder(settings.reminders[kind]);
      await update({ reminders: { ...settings.reminders, [kind]: null } });
      setReminderMsg(t('family.reminderDisabled'));
      return;
    }
    const body = kind === 'bp' ? t('family.reminderBp') : t('family.reminderGuide');
    const res = await scheduleReminder(kind, t('common.appName'), body);
    if (res.ok) {
      await update({ reminders: { ...settings.reminders, [kind]: res.id } });
      setReminderMsg(t('family.reminderEnabled'));
    } else {
      setReminderMsg(res.reason === 'permission_denied' ? t('family.reminderPermissionDenied') : t('family.reminderUnavailable'));
    }
  };

  return (
    <Screen testID="family-screen">
      <AppText>{t('family.intro')}</AppText>
      <SectionTitle>{t('family.contactsTitle')}</SectionTitle>
      {loading && data === undefined ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}
      {!loading && (data ?? []).length === 0 ? <EmptyState icon="Users" title={t('family.empty')} /> : null}
      {(data ?? []).map((contact) => (
        <Card key={contact.id} testID={`contact-${contact.id}`}>
          <AppText variant="bodyStrong">{contact.name}</AppText>
          <AppText tone="muted">{[contact.relationship, contact.phone].filter(Boolean).join(' · ')}</AppText>
          <View style={styles.row}>
            <Button style={styles.grow} icon="Phone" label={t('family.call')} onPress={() => void openEmergencyDialer(contact.phone)} />
            <Button style={styles.grow} variant="secondary" icon="Pencil" label={t('common.edit')} onPress={() => router.push({ pathname: '/family/edit', params: { id: contact.id } })} />
            <Button
              style={styles.grow}
              variant="danger"
              icon="Trash2"
              label={t('family.remove')}
              onPress={() =>
                confirmDestructive(t('common.confirmDeleteTitle'), t('family.removeConfirm', { name: contact.name }), t('family.remove'), t('common.cancel'), () => {
                  void deleteContact(contact.id).then(reload);
                })
              }
            />
          </View>
        </Card>
      ))}
      <Button testID="add-contact" icon="Plus" label={t('family.add')} onPress={() => router.push('/family/edit')} />
      <Banner tone="info" icon="ShieldCheck" text={t('family.noHealthShared')} />

      <SectionTitle>{t('family.guideTitle')}</SectionTitle>
      <ListItem icon="BookOpen" title={t('family.guideTitle')} subtitle={t('family.guideIntro')} onPress={() => router.push('/family/guide')} testID="open-family-guide" />

      <SectionTitle>{t('family.remindersTitle')}</SectionTitle>
      <ToggleRow label={t('family.reminderGuide')} value={settings.reminders.guide !== null} onChange={(v) => void toggleReminder('guide', v)} testID="reminder-guide" />
      <ToggleRow label={t('family.reminderBp')} value={settings.reminders.bp !== null} onChange={(v) => void toggleReminder('bp', v)} testID="reminder-bp" />
      {reminderMsg ? (
        <AppText variant="small" tone="muted" accessibilityLiveRegion="polite">
          {reminderMsg}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }, grow: { flexGrow: 1 } });
