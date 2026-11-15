import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { EmergencyCallButton } from '@/components/emergency/EmergencyCallButton';
import { isOnlineAssistantConfigured } from '@/constants/config';
import { SOURCES } from '@/constants/sources';
import { radius, spacing } from '@/constants/theme';
import { KNOWLEDGE_BASE } from '@/features/assistant/knowledgeBase';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useEmergencyCountry } from '@/hooks/useEmergencyCountry';
import { useTheme } from '@/hooks/useTheme';
import { askAssistant, type AskResult } from '@/services/ai/assistantClient';
import { recordConsent } from '@/services/api/syncService';
import { isSupportedLanguage, type SupportedLanguage } from '@/types/i18n';

interface Turn {
  id: number;
  question: string;
  reply: AskResult;
}

export default function AssistantScreen() {
  const { t, i18n } = useTranslation();
  const { c } = useTheme();
  const { settings, update } = useAppSettings();
  const { config } = useEmergencyCountry();
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const language: SupportedLanguage = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
  const onlineMode = isOnlineAssistantConfigured() && settings.consents.assistantOnline;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    try {
      const reply = await askAssistant(q, language, { onlineConsent: settings.consents.assistantOnline });
      setTurns((prev) => [...prev, { id: Date.now(), question: q, reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen testID="assistant-screen">
      <AppText>{t('assistant.intro')}</AppText>
      <Banner tone="info" icon="Bot" text={onlineMode ? t('assistant.onlineMode') : t('assistant.faqMode')} testID="assistant-mode" />
      {isOnlineAssistantConfigured() && !settings.consents.assistantOnline ? (
        <Card tone="alt" testID="assistant-consent">
          <AppText variant="bodyStrong">{t('assistant.enableAiTitle')}</AppText>
          <AppText variant="small">{t('assistant.enableAiBody')}</AppText>
          <Button
            testID="assistant-enable-ai"
            variant="secondary"
            icon="Bot"
            label={t('assistant.enableAiButton')}
            onPress={async () => {
              await update({ consents: { ...settings.consents, assistantOnline: true } });
              await recordConsent('assistant_online', true);
            }}
          />
        </Card>
      ) : null}

      {turns.map((turn) => (
        <View key={turn.id} style={styles.turn}>
          <View style={[styles.bubble, styles.user, { backgroundColor: c.primaryStrong }]}>
            <AppText variant="caption" tone="onPrimary">
              {t('assistant.you')}
            </AppText>
            <AppText tone="onPrimary">{turn.question}</AppText>
          </View>
          {turn.reply.emergency ? (
            <Card tone="emergency" testID="assistant-emergency">
              <AppText variant="heading" tone="onEmergencySoft">
                {t('assistant.emergencyDetectedTitle')}
              </AppText>
              <AppText tone="onEmergencySoft">{t('assistant.emergencyDetectedBody')}</AppText>
              {config ? <EmergencyCallButton number={config.primary.number} size="lg" showHint={false} testID="assistant-call-button" /> : null}
              <Button variant="danger" icon="Siren" label={t('home.openEmergency')} onPress={() => router.push('/emergency')} />
            </Card>
          ) : null}
          <Card testID="assistant-answer">
            <AppText variant="caption" tone="muted">
              {t('assistant.assistantLabel')}
            </AppText>
            {turn.reply.fellBackToOffline ? <AppText variant="small" tone="muted">{t('assistant.error')}</AppText> : null}
            <AppText>
              {turn.reply.medicationRefusal
                ? t('assistant.medicationRefusal')
                : turn.reply.text ?? (turn.reply.kbId ? t(`assistant.kb.${turn.reply.kbId}.a`) : t('assistant.noMatch'))}
            </AppText>
            {turn.reply.sourceIds.length > 0 ? (
              <View style={styles.sources}>
                <AppText variant="caption" tone="muted">
                  {t('common.sources')}
                </AppText>
                {turn.reply.sourceIds.map((id) => {
                  const s = SOURCES[id];
                  return s ? (
                    <Pressable key={id} accessibilityRole="link" onPress={() => void Linking.openURL(s.url).catch(() => undefined)}>
                      <AppText variant="small" tone="primary">
                        {s.title}
                      </AppText>
                    </Pressable>
                  ) : null;
                })}
              </View>
            ) : null}
            <AppText variant="caption" tone="muted">
              {t('assistant.disclaimer')}
            </AppText>
          </Card>
        </View>
      ))}

      {busy ? <AppText tone="muted">{t('assistant.thinking')}</AppText> : null}

      <TextField
        testID="assistant-input"
        label={t('assistant.placeholder')}
        value={input}
        onChangeText={setInput}
        multiline
        maxLength={1000}
        onSubmitEditing={() => void ask(input)}
      />
      <Button testID="assistant-send" label={t('assistant.send')} icon="Send" loading={busy} disabled={input.trim() === ''} onPress={() => void ask(input)} />

      <AppText variant="bodyStrong">{t('assistant.suggestionsTitle')}</AppText>
      <View style={styles.chips}>
        {KNOWLEDGE_BASE.map((entry) => (
          <Pressable
            key={entry.id}
            testID={`suggestion-${entry.id}`}
            accessibilityRole="button"
            onPress={() => void ask(t(`assistant.kb.${entry.id}.q`))}
            style={[styles.chip, { borderColor: c.primaryStrong, backgroundColor: c.surface }]}
          >
            <AppText variant="small" tone="primary">
              {t(`assistant.kb.${entry.id}.q`)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <Banner tone="warning" text={t('safety.notDiagnostic')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  turn: { gap: spacing.sm },
  bubble: { padding: spacing.md, borderRadius: radius.lg, gap: 2 },
  user: { alignSelf: 'flex-end', maxWidth: '90%' },
  sources: { gap: 4, marginTop: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center' },
});
