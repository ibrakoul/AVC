import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { getSupabase } from '@/services/supabase/client';

/**
 * Optional account management. Every function returns an explicit
 * `not_configured` result when the build has no Supabase credentials —
 * we never pretend that a backend operation succeeded.
 */
export type AuthResult =
  | { ok: true; session?: Session | null; needsConfirmation?: boolean }
  | { ok: false; error: 'not_configured' | 'invalid_email' | 'invalid_password' | 'consent_required' | 'server'; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function client(override?: SupabaseClient | null): SupabaseClient | null {
  return override === undefined ? getSupabase() : override;
}

export async function signIn(email: string, password: string, sb?: SupabaseClient | null): Promise<AuthResult> {
  const c = client(sb);
  if (!c) return { ok: false, error: 'not_configured' };
  if (!validateEmail(email)) return { ok: false, error: 'invalid_email' };
  if (!validatePassword(password)) return { ok: false, error: 'invalid_password' };
  const { data, error } = await c.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, error: 'server', message: error.message };
  return { ok: true, session: data.session };
}

export async function signUp(
  email: string,
  password: string,
  consent: boolean,
  sb?: SupabaseClient | null,
): Promise<AuthResult> {
  const c = client(sb);
  if (!c) return { ok: false, error: 'not_configured' };
  if (!validateEmail(email)) return { ok: false, error: 'invalid_email' };
  if (!validatePassword(password)) return { ok: false, error: 'invalid_password' };
  if (!consent) return { ok: false, error: 'consent_required' };
  const { data, error } = await c.auth.signUp({ email: email.trim(), password });
  if (error) return { ok: false, error: 'server', message: error.message };
  return { ok: true, session: data.session, needsConfirmation: !data.session };
}

export async function requestPasswordReset(email: string, sb?: SupabaseClient | null): Promise<AuthResult> {
  const c = client(sb);
  if (!c) return { ok: false, error: 'not_configured' };
  if (!validateEmail(email)) return { ok: false, error: 'invalid_email' };
  const { error } = await c.auth.resetPasswordForEmail(email.trim());
  // Do not reveal whether the account exists.
  if (error && error.status !== undefined && error.status >= 500) return { ok: false, error: 'server', message: error.message };
  return { ok: true };
}

export async function signOut(sb?: SupabaseClient | null): Promise<AuthResult> {
  const c = client(sb);
  if (!c) return { ok: false, error: 'not_configured' };
  const { error } = await c.auth.signOut();
  if (error) return { ok: false, error: 'server', message: error.message };
  return { ok: true };
}

/** Calls the `delete-account` Edge Function (service role stays server-side). */
export async function deleteAccount(sb?: SupabaseClient | null): Promise<AuthResult> {
  const c = client(sb);
  if (!c) return { ok: false, error: 'not_configured' };
  const { error } = await c.functions.invoke('delete-account', { method: 'POST' });
  if (error) return { ok: false, error: 'server', message: error.message };
  await c.auth.signOut();
  return { ok: true };
}
