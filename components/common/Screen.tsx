import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing } from '@/constants/theme';
import { useIsOffline } from '@/hooks/useNetwork';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Banner } from './Banner';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
  testID?: string;
  showOffline?: boolean;
}

export function Screen({ children, scroll = true, edges = ['bottom'], footer, testID, showOffline = true }: ScreenProps) {
  const { c } = useTheme();
  const offline = useIsOffline();
  const { t } = useTranslation();
  const content = (
    <>
      {showOffline && offline ? <Banner tone="info" icon="WifiOff" text={t('common.offlineNotice')} testID="offline-banner" /> : null}
      {children}
    </>
  );
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: c.background }]} testID={testID}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content]}>{content}</View>
        )}
        {footer ? <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.surface }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  footer: { padding: spacing.md, borderTopWidth: 1 },
});
