import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

import i18n from '@/locales';
import { setDatabaseForTesting } from '@/services/storage/database';
import { createTestDb } from '../helpers/sqlJsDb';
import { seedSettings } from '../helpers/settings';

const g = globalThis as { __TEST_OFFLINE__?: boolean; __TEST_REGION__?: string };

/** Standard setup: fresh storage + DB, onboarding done, English, region DE. */
export function useAppTestEnvironment() {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setDatabaseForTesting(await createTestDb());
    g.__TEST_OFFLINE__ = false;
    g.__TEST_REGION__ = 'DE';
    await i18n.changeLanguage('en');
    await seedSettings({ onboardingDone: true });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
}

export const setOffline = (v: boolean) => {
  g.__TEST_OFFLINE__ = v;
};
