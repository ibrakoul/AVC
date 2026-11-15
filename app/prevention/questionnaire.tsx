import { goBackOr } from '@/utils/navigation';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Screen } from '@/components/common/Screen';
import { Segmented } from '@/components/common/Segmented';
import { ErrorState } from '@/components/common/States';
import { spacing } from '@/constants/theme';
import { loadPrevention, savePrevention } from '@/services/storage/preventionRepository';
import { RISK_FACTORS, type PreventionAnswers, type RiskAnswer } from '@/types/health';

export default function QuestionnaireScreen() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PreventionAnswers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    void loadPrevention()
      .then((r) => r && setAnswers(r.answers))
      .catch(() => undefined);
  }, []);

  const factor = RISK_FACTORS[index]!;
  const isLast = index === RISK_FACTORS.length - 1;

  const finish = async () => {
    setSaving(true);
    setError(false);
    try {
      await savePrevention(answers);
      goBackOr('/prevention');
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="questionnaire-screen">
      <AppText tone="muted" testID="questionnaire-progress">
        {t('prevention.questionnaire.progress', { current: index + 1, total: RISK_FACTORS.length })}
      </AppText>
      <Card>
        <AppText variant="heading" testID="questionnaire-question">
          {t(`prevention.factors.${factor}.question`)}
        </AppText>
        <Segmented<RiskAnswer>
          testIDPrefix="answer"
          accessibilityLabel={t(`prevention.factors.${factor}.question`)}
          value={answers[factor]}
          onChange={(v) => setAnswers((prev) => ({ ...prev, [factor]: v }))}
          options={[
            { value: 'yes', label: t('common.yes') },
            { value: 'no', label: t('common.no') },
            { value: 'unknown', label: t('common.unknown') },
          ]}
        />
      </Card>
      {error ? <ErrorState /> : null}
      <View style={styles.row}>
        <Button style={styles.grow} variant="secondary" label={t('prevention.questionnaire.previous')} disabled={index === 0} onPress={() => setIndex((i) => i - 1)} />
        {isLast ? (
          <Button style={styles.grow} testID="questionnaire-finish" label={t('prevention.questionnaire.finish')} icon="Check" loading={saving} onPress={() => void finish()} />
        ) : (
          <Button style={styles.grow} testID="questionnaire-next" label={t('prevention.questionnaire.next')} onPress={() => setIndex((i) => i + 1)} />
        )}
      </View>
      <AppText variant="small" tone="muted">
        {t('prevention.questionnaire.privacy')}
      </AppText>
      <AppText variant="small" tone="muted">
        {t('prevention.noScoreNote')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.sm }, grow: { flex: 1 } });
