import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type AppSettings } from '@/services/storage/settingsStore';

export async function seedSettings(patch: Partial<AppSettings>): Promise<void> {
  await AsyncStorage.setItem('sg.settings.v1', JSON.stringify({ ...DEFAULT_SETTINGS, ...patch }));
}
