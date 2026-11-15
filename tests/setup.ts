/* Global Jest setup. */


jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('expo-crypto', () => ({ randomUUID: () => (require('node:crypto') as typeof import('node:crypto')).randomUUID() }));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: (globalThis as { __TEST_REGION__?: string }).__TEST_REGION__ ?? 'DE' }],
  useLocales: () => [{ languageCode: 'en', regionCode: 'DE' }],
}));

// Network state: tests can flip `globalThis.__TEST_OFFLINE__`.
jest.mock('expo-network', () => ({
  useNetworkState: () =>
    (globalThis as { __TEST_OFFLINE__?: boolean }).__TEST_OFFLINE__
      ? { isConnected: false, isInternetReachable: false }
      : { isConnected: true, isInternetReachable: true },
}));

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
  };
});

jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(async () => true), hide: jest.fn(), hideAsync: jest.fn(async () => undefined) }));
