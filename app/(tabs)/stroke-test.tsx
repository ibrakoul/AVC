import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { BulletList } from '@/components/common/BulletList';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { Segmented } from '@/components/common/Segmented';
import { EmergencyCallButton } from '@/components/emergency/EmergencyCallButton';
import { SignCard } from '@/components/emergency/SignCard';
import { sequenceFor, type StrokeProtocol } from '@/features/stroke/signs';
import { emergencyRouteFor, evaluateSymptomReport, type SymptomReport } from '@/features/stroke/symptomAssessment';
import { useEmergencyCountry } from '@/hooks/useEmergencyCountry';

export default function StrokeTestScreen() {
  const { t } = useTranslation();
  const [protocol, setProtocol] = useState<StrokeProtocol>('BE-FAST');
  const { config } = useEmergencyCountry();

  /** Any report that warrants it navigates to the emergency screen IMMEDIATELY. */
  const report = (r: SymptomReport) => {
    const route = emergencyRouteFor(evaluateSymptomReport(r));
    if (route) router.push(route);
  };

  const callAction = config ? (
    <EmergencyCallButton number={config.primary.number} size="lg" showHint={false} testID="time-call-button" />
  ) : (
    <Button variant="emergency" icon="Siren" label={t('home.openEmergency')} onPress={() => router.push('/emergency')} />
  );
  const otherSigns = t('stroke.otherSigns', { returnObjects: true }) as string[];

  return (
    <Screen testID="stroke-test-screen">
      <Banner tone="emergency" text={t('safety.mainWarning')} />
      {callAction}
      <AppText>{t('stroke.intro')}</AppText>
      <Segmented<StrokeProtocol>
        testIDPrefix="protocol"
        accessibilityLabel={t('stroke.title')}
        value={protocol}
        onChange={setProtocol}
        options={[
          { value: 'FAST', label: t('stroke.fastTab') },
          { value: 'BE-FAST', label: t('stroke.befastTab') },
        ]}
      />
      <AppText tone="muted" testID="protocol-intro">
        {protocol === 'FAST' ? t('stroke.fastIntro') : t('stroke.befastIntro')}
      </AppText>

      {sequenceFor(protocol).map((letter) => (
        <SignCard key={letter} letter={letter} onObserve={(sign) => report({ kind: 'sign_observed', sign })} timeAction={callAction} />
      ))}

      <Button testID="signs-disappeared" variant="danger" icon="Timer" label={t('stroke.disappearedButton')} accessibilityLabel={t('stroke.disappearedA11y')} onPress={() => report({ kind: 'signs_disappeared' })} />
      <Card tone="alt">
        <AppText variant="bodyStrong">{t('stroke.notSureTitle')}</AppText>
        <AppText>{t('stroke.notSureBody')}</AppText>
        <Button testID="not-sure" variant="secondary" icon="CircleHelp" label={t('stroke.notSureButton')} onPress={() => report({ kind: 'not_sure' })} />
      </Card>

      <Banner tone="warning" text={t('stroke.noSignsNote')} testID="no-signs-note" />
      <Card>
        <AppText variant="bodyStrong">{t('stroke.otherSignsTitle')}</AppText>
        <BulletList items={otherSigns} />
      </Card>
      <ListItem icon="BookOpen" title={t('stroke.learnTypes')} onPress={() => router.push('/education')} />
    </Screen>
  );
}
