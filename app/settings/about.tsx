import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Logo } from '@/components/common/Logo';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { config } from '@/constants/config';
import { SOURCES, SOURCES_CHECKED_AT } from '@/constants/sources';
import { formatDate } from '@/utils/date';

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  return (
    <Screen testID="about-screen">
      <Logo size={64} />
      <AppText variant="title">{t('common.appName')}</AppText>
      <AppText tone="muted">
        {t('common.tagline')} · {t('about.version', { version: config.appVersion })}
      </AppText>
      <Card>
        <SectionTitle>{t('about.missionTitle')}</SectionTitle>
        <AppText>{t('about.mission')}</AppText>
      </Card>
      <Card tone="warning" testID="medical-disclaimer">
        <AppText variant="heading" tone="onWarningSoft">
          {t('about.disclaimerTitle')}
        </AppText>
        <AppText tone="onWarningSoft">{t('about.disclaimer')}</AppText>
        <AppText tone="onWarningSoft">{t('safety.mainWarning')}</AppText>
      </Card>
      <Card>
        <SectionTitle>{t('about.reviewTitle')}</SectionTitle>
        <AppText>{t('about.review')}</AppText>
      </Card>
      <Card>
        <SectionTitle>{t('about.freeTitle')}</SectionTitle>
        <AppText>{t('about.free')}</AppText>
      </Card>
      <SectionTitle>{t('about.sourcesTitle')}</SectionTitle>
      <AppText variant="small" tone="muted">
        {t('about.sourcesChecked', { date: formatDate(SOURCES_CHECKED_AT, i18n.language) })}
      </AppText>
      {Object.values(SOURCES).map((s) => (
        <ListItem key={s.id} icon="Globe" title={s.title} subtitle={s.url} onPress={() => void Linking.openURL(s.url).catch(() => undefined)} />
      ))}
    </Screen>
  );
}
