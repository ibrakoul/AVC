import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { spacing } from '@/constants/theme';
import { openEmergencyDialer, type DialResult } from '@/services/emergency/emergencyService';

/**
 * The single most important control of the app. It opens the native phone
 * app via a `tel:` link. It never claims that a call was placed: the
 * feedback text only says the phone app should be open.
 */
export function EmergencyCallButton({
  number,
  size = 'xl',
  label,
  testID = 'emergency-call-button',
  showHint = true,
}: {
  number: string;
  size?: 'lg' | 'xl';
  label?: string;
  testID?: string;
  showHint?: boolean;
}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<DialResult | null>(null);

  return (
    <View style={styles.wrap}>
      <Button
        testID={testID}
        variant="emergency"
        size={size}
        icon="Phone"
        label={label ?? t('emergency.callButton', { number })}
        accessibilityLabel={t('emergency.callButtonA11y', { number })}
        onPress={async () => setResult(await openEmergencyDialer(number))}
      />
      {result ? (
        <AppText
          testID="dial-feedback"
          accessibilityLiveRegion="polite"
          variant="small"
          tone={result.status === 'failed' ? 'emergency' : 'muted'}
          center
        >
          {result.status === 'dialer_opened' ? t('emergency.dialerOpened', { number }) : t('emergency.dialerFailed', { number })}
        </AppText>
      ) : showHint ? (
        <AppText variant="caption" tone="muted" center>
          {t('emergency.callHint')}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: spacing.sm } });
