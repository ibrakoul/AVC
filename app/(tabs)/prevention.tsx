import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { BulletList } from '@/components/common/BulletList';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ErrorState, LoadingState } from '@/components/common/States';
import { buildPreventionInsights } from '@/features/prevention/insights';
import { usePrevention } from '@/hooks/usePrevention';
import { formatDate } from '@/utils/date';

export default function PreventionDashboard() {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = usePrevention();
  const insights = buildPreventionInsights(data?.answers ?? {});

  return (
    <Screen testID="prevention-screen">
      <AppText>{t('prevention.intro')}</AppText>
      {loading && data === undefined ? <LoadingState /> : null}
      {error ? <ErrorState onRetry={reload} /> : null}

      <Card>
        {data ? (
          <AppText tone="muted">{t('prevention.lastUpdated', { date: formatDate(data.updatedAt, i18n.language) })}</AppText>
        ) : (
          <AppText tone="muted" testID="prevention-empty">
            {t('prevention.noAnswersYet')}
          </AppText>
        )}
        <Button
          testID="start-questionnaire"
          icon="ClipboardList"
          label={data ? t('prevention.updateQuestionnaire') : t('prevention.startQuestionnaire')}
          onPress={() => router.push('/prevention/questionnaire')}
        />
      </Card>

      {data ? (
        <>
          <SectionTitle>{t('prevention.discussTitle')}</SectionTitle>
          <Card testID="discuss-topics">
            {insights.discussTopics.length === 0 ? (
              <AppText>{t('prevention.discussEmpty')}</AppText>
            ) : (
              <BulletList items={insights.discussTopics.map((f) => `${t(`prevention.factors.${f}.label`)} — ${t(`prevention.discuss.${f}`)}`)} />
            )}
          </Card>
          {insights.unknownFactors.length > 0 ? (
            <Card tone="warning">
              <AppText variant="bodyStrong" tone="onWarningSoft">
                {t('prevention.unknownTitle')}
              </AppText>
              <AppText tone="onWarningSoft">{t('prevention.unknownBody')}</AppText>
              <BulletList items={insights.unknownFactors.map((f) => t(`prevention.factors.${f}.label`))} />
            </Card>
          ) : null}
        </>
      ) : null}

      <SectionTitle>{t('prevention.recommendationsTitle')}</SectionTitle>
      {insights.recommendations.map((id) => (
        <Card key={id} testID={`reco-${id}`}>
          <AppText variant="bodyStrong">{t(`prevention.recommendations.${id}.title`)}</AppText>
          <AppText>{t(`prevention.recommendations.${id}.body`)}</AppText>
        </Card>
      ))}
      <Banner tone="info" text={t('prevention.noScoreNote')} />
      <Banner tone="warning" text={t('prevention.medicationNote')} />
    </Screen>
  );
}
