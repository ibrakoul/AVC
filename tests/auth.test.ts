import type { SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/constants/config';
import { deleteAccount, requestPasswordReset, signIn, signOut, signUp, validateEmail } from '@/features/authentication/authService';
import { pushLocalData } from '@/services/api/syncService';
import { secureSessionStorage } from '@/services/supabase/secureStorage';

function mockClient(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ data: { session: { access_token: 'x' } }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      ...overrides,
    },
    functions: { invoke: jest.fn().mockResolvedValue({ error: null }) },
  } as unknown as SupabaseClient;
}

describe('authentication without backend credentials', () => {
  it('build is not configured in tests', () => expect(isSupabaseConfigured()).toBe(false));
  it.each([
    ['signIn', () => signIn('a@b.co', 'password1', null)],
    ['signUp', () => signUp('a@b.co', 'password1', true, null)],
    ['reset', () => requestPasswordReset('a@b.co', null)],
    ['signOut', () => signOut(null)],
    ['deleteAccount', () => deleteAccount(null)],
  ])('%s reports not_configured instead of pretending success', async (_n, fn) => {
    await expect(fn()).resolves.toEqual({ ok: false, error: 'not_configured' });
  });
  it('cloud sync refuses without backend', async () => {
    await expect(pushLocalData(true, null)).resolves.toEqual({ ok: false, reason: 'not_configured' });
  });
});

describe('authentication with a (mocked) Supabase client', () => {
  it('validates input before calling the server', async () => {
    const sb = mockClient();
    expect(validateEmail('nope')).toBe(false);
    await expect(signIn('nope', 'password1', sb)).resolves.toEqual({ ok: false, error: 'invalid_email' });
    await expect(signIn('a@b.co', 'short', sb)).resolves.toEqual({ ok: false, error: 'invalid_password' });
    await expect(signUp('a@b.co', 'password1', false, sb)).resolves.toEqual({ ok: false, error: 'consent_required' });
    expect(sb.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('signs in, signs up (email confirmation), resets and signs out', async () => {
    const sb = mockClient();
    await expect(signIn(' a@b.co ', 'password1', sb)).resolves.toMatchObject({ ok: true });
    expect(sb.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.co', password: 'password1' });
    await expect(signUp('a@b.co', 'password1', true, sb)).resolves.toEqual({ ok: true, session: null, needsConfirmation: true });
    await expect(requestPasswordReset('a@b.co', sb)).resolves.toEqual({ ok: true });
    await expect(signOut(sb)).resolves.toEqual({ ok: true });
  });

  it('surfaces server errors', async () => {
    const sb = mockClient({ signInWithPassword: jest.fn().mockResolvedValue({ data: { session: null }, error: { message: 'Invalid login' } }) });
    await expect(signIn('a@b.co', 'password1', sb)).resolves.toEqual({ ok: false, error: 'server', message: 'Invalid login' });
  });

  it('account deletion goes through the server function (no service key in app)', async () => {
    const sb = mockClient();
    await expect(deleteAccount(sb)).resolves.toEqual({ ok: true });
    expect(sb.functions.invoke).toHaveBeenCalledWith('delete-account', { method: 'POST' });
  });

  it('sync requires consent and a signed-in user', async () => {
    const sb = mockClient();
    await expect(pushLocalData(false, sb)).resolves.toEqual({ ok: false, reason: 'no_consent' });
    await expect(pushLocalData(true, sb)).resolves.toEqual({ ok: false, reason: 'not_signed_in' });
  });
});

describe('secure session storage', () => {
  it('stores long sessions in chunks and removes them', async () => {
    const long = 'x'.repeat(5000);
    await secureSessionStorage.setItem('sb-auth-token', long);
    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBe(long);
    await secureSessionStorage.removeItem('sb-auth-token');
    await expect(secureSessionStorage.getItem('sb-auth-token')).resolves.toBeNull();
  });
});
