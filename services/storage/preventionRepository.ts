import { RISK_FACTORS, type PreventionAnswers, type PreventionRecord, type RiskAnswer } from '@/types/health';
import { getDb, type Db } from './database';

const CURRENT_ID = 'current';
const VALID: readonly RiskAnswer[] = ['yes', 'no', 'unknown'];

/** Drops unknown keys/values so corrupted storage can never crash the UI. */
export function sanitizeAnswers(raw: unknown): PreventionAnswers {
  const out: PreventionAnswers = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const factor of RISK_FACTORS) {
    const value = (raw as Record<string, unknown>)[factor];
    if (typeof value === 'string' && (VALID as readonly string[]).includes(value)) out[factor] = value as RiskAnswer;
  }
  return out;
}

export async function loadPrevention(db?: Db): Promise<PreventionRecord | null> {
  const d = db ?? (await getDb());
  const row = await d.getFirstAsync<{ answers: string; updated_at: string }>(
    'SELECT answers, updated_at FROM prevention_answers WHERE id = ?',
    [CURRENT_ID],
  );
  if (!row) return null;
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(row.answers);
  } catch {
    parsed = null;
  }
  return { answers: sanitizeAnswers(parsed), updatedAt: row.updated_at };
}

export async function savePrevention(answers: PreventionAnswers, db?: Db): Promise<PreventionRecord> {
  const d = db ?? (await getDb());
  const clean = sanitizeAnswers(answers);
  const updatedAt = new Date().toISOString();
  await d.runAsync(
    `INSERT INTO prevention_answers (id, answers, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET answers = excluded.answers, updated_at = excluded.updated_at`,
    [CURRENT_ID, JSON.stringify(clean), updatedAt],
  );
  return { answers: clean, updatedAt };
}
