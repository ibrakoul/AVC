import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Logo } from '@/components/common/Logo';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ThinkStrokeCard } from '@/components/emergency/ThinkStrokeCard';
import { spacing } from '@/constants/theme';
import type { SupportedLanguage } from '@/types/i18n';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const languageName = t(`language.${i18n.language as SupportedLanguage}`);

  return (
    <Screen testID="home-screen">
      <View style={styles.hero}>
        <Logo size={56} />
        <View style={styles.flex}>
          <AppText variant="title">{t('home.welcome')}</AppText>
          <AppText tone="muted">{t('home.subtitle')}</AppText>
        </View>
      </View>
      <ListItem
        icon="Languages"
        title={t('home.currentLanguage', { language: languageName })}
        onPress={() => router.push('/language')}
        testID="home-language"
      />

      <ThinkStrokeCard />

      <SectionTitle>{t('home.shortcutsTitle')}</SectionTitle>
      <ListItem icon="Brain" title={t('home.recognize')} subtitle={t('home.recognizeHint')} onPress={() => router.push('/stroke-test')} testID="shortcut-recognize" />
      <ListItem icon="ShieldCheck" title={t('home.prevent')} subtitle={t('home.preventHint')} onPress={() => router.push('/prevention')} />
      <ListItem icon="HeartPulse" title={t('home.track')} subtitle={t('home.trackHint')} onPress={() => router.push('/health-tracker')} />
      <ListItem icon="Users" title={t('home.family')} subtitle={t('home.familyHint')} onPress={() => router.push('/family')} testID="shortcut-family" />

      <SectionTitle>{t('home.learnTitle')}</SectionTitle>
      <ListItem icon="BookOpen" title={t('home.education')} subtitle={t('home.educationHint')} onPress={() => router.push('/education')} />
      <ListItem icon="Bot" title={t('home.assistant')} subtitle={t('home.assistantHint')} onPress={() => router.push('/assistant')} testID="shortcut-assistant" />

      <Card tone="alt">
        <AppText variant="bodyStrong">{t('home.didYouKnowTitle')}</AppText>
        <AppText>{t('home.didYouKnowBody')}</AppText>
      </Card>
      <Banner tone="info" text={t('safety.notDiagnostic')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
});
