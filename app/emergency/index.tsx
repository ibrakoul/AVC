import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { BulletList } from '@/components/common/BulletList';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { SectionTitle } from '@/components/common/SectionTitle';
import { EmergencyCallButton } from '@/components/emergency/EmergencyCallButton';
import { TimeRecorder } from '@/components/emergency/TimeRecorder';
import { EMERGENCY_DATASET, UNKNOWN_COUNTRY_SUGGESTIONS } from '@/constants/emergencyNumbers';
import { spacing } from '@/constants/theme';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useEmergencyCountry } from '@/hooks/useEmergencyCountry';
import { useEmergencyTimes } from '@/hooks/useEmergencyTimes';
import { openEmergencyDialer, requiresVerification } from '@/services/emergency/emergencyService';
import { listContacts } from '@/services/storage/contactsRepository';
import { formatDate, formatTime } from '@/utils/date';

/**
 * EMERGENCY SCREEN — must work offline, without an account and without any
 * prior step. Everything shown here is bundled (translations + dataset).
 * Only the optional contacts list reads local storage, and its failure
 * never blocks the rest of the screen.
 */
export default function EmergencyScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ trigger?: string; sign?: string }>();
  const { config, source } = useEmergencyCountry();
  const { times, set } = useEmergencyTimes();
  const contacts = useAsyncData(() => listContacts().catch(() => []));

  const steps = t('emergency.steps', { returnObjects: true }) as string[];
  const dont = t('emergency.dont', { returnObjects: true }) as string[];
  const tell = t('emergency.tell', { returnObjects: true }) as string[];

  return (
    <Screen testID="emergency-screen">
      {params.trigger ? (
        <Banner
          testID="emergency-trigger-banner"
          tone="emergency"
          title={t('emergency.triggerTitle')}
          text={params.trigger === 'signs_disappeared' ? `${t('emergency.triggerBody')} ${t('emergency.triggerDisappeared')}` : t('emergency.triggerBody')}
        />
      ) : null}

      <Banner tone="emergency" text={t('safety.mainWarning')} testID="main-warning" />

      {config ? (
        <EmergencyCallButton number={config.primary.number} />
      ) : (
        <Card tone="emergency" testID="unknown-country">
          <AppText variant="heading" tone="onEmergencySoft">
            {t('emergency.unknown.title')}
          </AppText>
          <AppText tone="onEmergencySoft">{t('emergency.unknown.body')}</AppText>
          {UNKNOWN_COUNTRY_SUGGESTIONS.map((s) => (
            <View key={s.number} style={styles.suggestion}>
              <AppText variant="small" tone="onEmergencySoft">
                {t(s.regionKey)}
              </AppText>
              <EmergencyCallButton number={s.number} size="lg" showHint={false} testID={`unknown-call-${s.number}`} />
            </View>
          ))}
        </Card>
      )}

      <ListItem
        testID="emergency-country-row"
        icon="Globe"
        title={config ? `${t('emergency.countryLabel')}: ${t(config.nameKey as 'countries.DE')}` : t('emergency.countryNotSet')}
        subtitle={source === 'device' ? t('emergency.detectedFromDevice') : t('emergency.changeCountry')}
        onPress={() => router.push('/emergency/country')}
      />

      {config && config.alternatives.length > 0 ? (
        <Card>
          <AppText variant="bodyStrong">{t('emergency.alsoValid')}</AppText>
          {config.alternatives.map((alt) => (
            <ListItem
              key={alt.number}
              icon="Phone"
              title={alt.number}
              subtitle={t(alt.labelKey as 'emergency.numbers.euGeneral')}
              onPress={() => void openEmergencyDialer(alt.number)}
              testID={`alt-number-${alt.number}`}
            />
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionTitle>{t('emergency.stepsTitle')}</SectionTitle>
        <BulletList items={steps} numbered />
      </Card>

      <Card tone="emergency">
        <AppText variant="heading" tone="onEmergencySoft">
          {t('emergency.dontTitle')}
        </AppText>
        <BulletList items={dont} tone="onEmergencySoft" />
      </Card>

      <SectionTitle>{t('emergency.timesTitle')}</SectionTitle>
      <TimeRecorder testID="onset-time" title={t('emergency.onsetTitle')} help={t('emergency.onsetHelp')} value={times.onsetAt} onChange={(v) => set({ onsetAt: v })} />
      <TimeRecorder
        testID="lkw-time"
        title={t('emergency.lastKnownWellTitle')}
        help={t('emergency.lastKnownWellHelp')}
        value={times.lastKnownWellAt}
        onChange={(v) => set({ lastKnownWellAt: v })}
      />

      <Card>
        <SectionTitle>{t('emergency.tellTitle')}</SectionTitle>
        <BulletList items={tell} />
        {times.onsetAt || times.lastKnownWellAt ? (
          <View style={styles.times}>
            {times.onsetAt ? <AppText variant="bodyStrong">{`${t('emergency.onsetTitle')}: ${formatTime(times.onsetAt, i18n.language)}`}</AppText> : null}
            {times.lastKnownWellAt ? (
              <AppText variant="bodyStrong">{`${t('emergency.lastKnownWellTitle')}: ${formatTime(times.lastKnownWellAt, i18n.language)}`}</AppText>
            ) : null}
          </View>
        ) : null}
      </Card>

      <SectionTitle>{t('emergency.contactsTitle')}</SectionTitle>
      <AppText variant="small" tone="muted">
        {t('emergency.callResponderFirst')}
      </AppText>
      {(contacts.data ?? []).length === 0 ? (
        <Button label={t('emergency.addContact')} variant="secondary" icon="Plus" onPress={() => router.push('/family/edit')} />
      ) : (
        (contacts.data ?? []).map((contact) => (
          <ListItem
            key={contact.id}
            icon="User"
            title={t('emergency.callContact', { name: contact.name })}
            subtitle={contact.phone}
            onPress={() => void openEmergencyDialer(contact.phone)}
          />
        ))
      )}

      <Banner tone="warning" text={t('safety.noMedication')} />

      <Card tone="alt" testID="dataset-info">
        <AppText variant="caption" tone="muted">
          {t('emergency.availableOffline')} · {t('emergency.dataVersion', { version: EMERGENCY_DATASET.version, date: formatDate(EMERGENCY_DATASET.compiledAt, i18n.language) })}
        </AppText>
        {config ? (
          <>
            <AppText variant="caption" tone="muted" testID="verification-status">
              {requiresVerification(config) ? t('emergency.unverified') : t('emergency.verified', { date: formatDate(config.lastVerified ?? '', i18n.language) })}
            </AppText>
            <AppText variant="caption" tone="muted">
              {t('emergency.officialSource', { name: config.officialSource.name })}
            </AppText>
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestion: { gap: spacing.xs },
  times: { gap: spacing.xs, marginTop: spacing.sm },
});
