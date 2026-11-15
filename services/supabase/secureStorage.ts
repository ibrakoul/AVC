import * as SecureStore from 'expo-secure-store';

/**
 * Supabase auth-session storage backed by the OS keychain/keystore.
 * SecureStore values are limited (~2 KB on some platforms), so long values
 * are split into chunks.
 */
const CHUNK = 1800;
const countKey = (key: string) => `${key}__n`;
const chunkKey = (key: string, i: number) => `${key}__${i}`;
// SecureStore keys may only contain alphanumerics, ".", "-" and "_".
const safe = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

export const secureSessionStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    const key = safe(rawKey);
    const n = await SecureStore.getItemAsync(countKey(key));
    if (!n) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(n); i += 1) {
      const part = await SecureStore.getItemAsync(chunkKey(key, i));
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(rawKey: string, value: string): Promise<void> {
    const key = safe(rawKey);
    await this.removeItem(rawKey);
    const total = Math.ceil(value.length / CHUNK) || 1;
    for (let i = 0; i < total; i += 1) {
      await SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
    await SecureStore.setItemAsync(countKey(key), String(total));
  },
  async removeItem(rawKey: string): Promise<void> {
    const key = safe(rawKey);
    const n = await SecureStore.getItemAsync(countKey(key));
    if (n) {
      for (let i = 0; i < Number(n); i += 1) await SecureStore.deleteItemAsync(chunkKey(key, i));
    }
    await SecureStore.deleteItemAsync(countKey(key));
  },
};
