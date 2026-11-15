import type { SupportedLanguage } from '@/types/i18n';
import { normalizeText } from '@/utils/text';
import { KNOWLEDGE_BASE, type KbEntry, type KbId } from './knowledgeBase';
import { detectEmergencyLanguage, detectMedicationRequest } from './safetyFilters';

export interface AssistantReply {
  /** Show the emergency card above everything else. */
  emergency: boolean;
  /** Refuse medication advice. */
  medicationRefusal: boolean;
  /** Matched KB entry (offline mode) or null. */
  kbId: KbId | null;
  /** Free text from the online AI (already safety-checked server-side). */
  text?: string;
  sourceIds: string[];
  mode: 'faq' | 'ai';
}

export function matchKnowledgeBase(question: string, language: SupportedLanguage): KbEntry | null {
  const text = ` ${normalizeText(question)} `;
  let best: { entry: KbEntry; score: number } | null = null;
  for (const entry of KNOWLEDGE_BASE) {
    const keywords = [...entry.keywords[language], ...entry.keywords.en];
    let score = 0;
    for (const kw of keywords) {
      const k = normalizeText(kw);
      // Whole-word-ish match to avoid "art" matching "heart".
      const re = new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`);
      if (re.test(text)) score += k.includes(' ') ? 2 : 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  return best?.entry ?? null;
}

/** Offline FAQ answer. Safety filters always run first. */
export function answerOffline(question: string, language: SupportedLanguage): AssistantReply {
  const emergency = detectEmergencyLanguage(question);
  const medicationRefusal = detectMedicationRequest(question);
  const entry = medicationRefusal ? null : matchKnowledgeBase(question, language);
  return {
    emergency,
    medicationRefusal,
    kbId: entry?.id ?? (emergency ? 'wait' : null),
    sourceIds: entry?.sourceIds ?? (emergency ? ['dsh', 'gesund'] : []),
    mode: 'faq',
  };
}
