import { isOnlineAssistantConfigured } from '@/constants/config';
import { answerOffline, type AssistantReply } from '@/features/assistant/faqEngine';
import { KNOWLEDGE_BASE } from '@/features/assistant/knowledgeBase';
import { getSupabase } from '@/services/supabase/client';
import type { SupportedLanguage } from '@/types/i18n';

export interface AskOptions {
  /** User consent for sending questions to the online AI. */
  onlineConsent: boolean;
  /** Injectable transport for tests. */
  invoke?: (body: { question: string; language: SupportedLanguage }) => Promise<unknown>;
}

export type AskResult = AssistantReply & { fellBackToOffline?: boolean };

const KNOWN_SOURCE_IDS = new Set(KNOWLEDGE_BASE.flatMap((e) => e.sourceIds));

function parseServerReply(raw: unknown): { answer: string; sourceIds: string[]; emergency: boolean } | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.answer !== 'string' || r.answer.trim() === '') return null;
  const sourceIds = Array.isArray(r.sourceIds) ? r.sourceIds.filter((s): s is string => typeof s === 'string' && KNOWN_SOURCE_IDS.has(s)) : [];
  return { answer: r.answer.slice(0, 4000), sourceIds, emergency: r.emergency === true };
}

async function defaultInvoke(body: { question: string; language: SupportedLanguage }): Promise<unknown> {
  const sb = getSupabase();
  if (!sb) throw new Error('not_configured');
  const { data, error } = await sb.functions.invoke('assistant', { body });
  if (error) throw error;
  return data;
}

/**
 * Asks the STROKE GUARD ASSISTANT.
 *
 * Order of operations (safety first):
 * 1. Local emergency + medication filters — always, before any network call.
 * 2. Emergency language → return immediately with the emergency card; we do
 *    NOT wait for a server round-trip.
 * 3. Online AI only if configured AND the user consented; any failure falls
 *    back to the offline FAQ (never a broken chatbot).
 */
export async function askAssistant(question: string, language: SupportedLanguage, options: AskOptions): Promise<AskResult> {
  const local = answerOffline(question, language);
  if (local.emergency || local.medicationRefusal) return local;

  const online = options.onlineConsent && (options.invoke !== undefined || isOnlineAssistantConfigured());
  if (!online) return local;

  try {
    const parsed = parseServerReply(await (options.invoke ?? defaultInvoke)({ question: question.slice(0, 1000), language }));
    if (!parsed) return { ...local, fellBackToOffline: true };
    return { emergency: parsed.emergency, medicationRefusal: false, kbId: null, text: parsed.answer, sourceIds: parsed.sourceIds, mode: 'ai' };
  } catch {
    return { ...local, fellBackToOffline: true };
  }
}
