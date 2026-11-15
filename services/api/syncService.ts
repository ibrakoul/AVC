import type { SupabaseClient } from '@supabase/supabase-js';

import { listContacts } from '@/services/storage/contactsRepository';
import { listMeasurements } from '@/services/storage/measurementsRepository';
import { loadPrevention } from '@/services/storage/preventionRepository';
import { getSupabase } from '@/services/supabase/client';

/**
 * Optional cloud sync (push-only upsert). Runs ONLY when the user is signed
 * in AND has granted the `cloud_sync` consent. RLS on the server guarantees
 * that rows can only be written for `auth.uid()`.
 */
export type SyncResult = { ok: true; counts: { measurements: number; contacts: number } } | { ok: false; reason: 'not_configured' | 'not_signed_in' | 'no_consent' | 'server' };

export async function pushLocalData(consentGiven: boolean, sb: SupabaseClient | null = getSupabase()): Promise<SyncResult> {
  if (!sb) return { ok: false, reason: 'not_configured' };
  if (!consentGiven) return { ok: false, reason: 'no_consent' };
  const { data: userData } = await sb.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, reason: 'not_signed_in' };

  try {
    const measurements = await listMeasurements();
    const contacts = await listContacts();
    const prevention = await loadPrevention();

    if (measurements.length > 0) {
      const { error } = await sb.from('health_measurements').upsert(
        measurements.map((m) => ({
          id: m.id,
          user_id: userId,
          measurement_type: m.type,
          value_primary: m.value,
          value_secondary: m.value2,
          unit: m.unit,
          subtype: m.subtype,
          measured_at: m.measuredAt,
          note: m.note,
        })),
      );
      if (error) return { ok: false, reason: 'server' };
    }
    if (contacts.length > 0) {
      const { error } = await sb
        .from('emergency_contacts')
        .upsert(contacts.map((c) => ({ id: c.id, user_id: userId, name: c.name, phone: c.phone, relationship: c.relationship })));
      if (error) return { ok: false, reason: 'server' };
    }
    if (prevention) {
      const { error } = await sb.from('prevention_questionnaires').insert({ user_id: userId, answers: prevention.answers });
      if (error) return { ok: false, reason: 'server' };
    }
    return { ok: true, counts: { measurements: measurements.length, contacts: contacts.length } };
  } catch {
    return { ok: false, reason: 'server' };
  }
}

/** Records a consent decision server-side (audit trail) when signed in. Never throws. */
export async function recordConsent(consentType: 'cloud_sync' | 'assistant_online' | 'account_terms', granted: boolean, sb: SupabaseClient | null = getSupabase()): Promise<void> {
  if (!sb) return;
  try {
    const { data } = await sb.auth.getUser();
    if (!data.user) return;
    await sb.from('consent_records').insert({ user_id: data.user.id, consent_type: consentType, granted, policy_version: '2026-11' });
  } catch {
    /* non-blocking */
  }
}
