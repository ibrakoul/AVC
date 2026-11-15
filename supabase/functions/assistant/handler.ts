import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

import kb from '../_shared/knowledgeBase.json' with { type: 'json' };
import { detectEmergencyLanguage, detectMedicationRequest } from '../_shared/safetyFilters.ts';

/**
 * STROKE GUARD ASSISTANT — server-side handler (educational only).
 *
 * - The API key lives ONLY in the server environment (ANTHROPIC_API_KEY).
 * - Emergency + medication filters run before the model is called.
 * - The model is grounded exclusively in the approved knowledge base and
 *   must cite source ids from it. Its output is schema-validated.
 * - No user identifiers or health data are sent to the model.
 */
type Lang = 'en' | 'fr' | 'de';
export interface AssistantRequest {
  question: string;
  language: Lang;
}
export interface AssistantResponse {
  answer: string;
  sourceIds: string[];
  emergency: boolean;
}

const KNOWN_SOURCES = new Set(kb.entries.flatMap((e) => e.sourceIds));

const ReplySchema = z.object({
  answer: z.string(),
  source_ids: z.array(z.string()),
  emergency_suspected: z.boolean(),
  in_scope: z.boolean(),
});

export function parseRequest(body: unknown): AssistantRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.question !== 'string') return null;
  const question = b.question.trim().slice(0, 1000);
  if (!question) return null;
  const language: Lang = b.language === 'fr' || b.language === 'de' ? b.language : 'en';
  return { question, language };
}

export function systemPrompt(language: Lang): string {
  const entries = kb.entries
    .map((e) => `<entry id="${e.id}" sources="${e.sourceIds.join(',')}">\nQ: ${e.content[language].q}\nA: ${e.content[language].a}\n</entry>`)
    .join('\n');
  return [
    'You are STROKE GUARD ASSISTANT, an educational assistant inside a free stroke-awareness app.',
    `Answer in ${language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}, in plain language for the general public and older adults, in at most 150 words.`,
    'Rules you must always follow:',
    '- Use ONLY facts contained in the approved knowledge base below. If the question cannot be answered from it, set in_scope=false and say you do not have a reviewed answer and suggest asking a healthcare professional.',
    '- You are not a doctor. Never diagnose, never say someone is or is not having a stroke, never estimate personal risk, never interpret measurements.',
    '- Never recommend, start, stop or change any medication (including aspirin or anticoagulants). Never recommend waiting to see if symptoms pass.',
    '- If the message could describe current or recent stroke symptoms, set emergency_suspected=true and tell the user to call emergency services immediately.',
    '- source_ids must only contain source ids listed on the knowledge-base entries you used.',
    '<knowledge_base>',
    entries,
    '</knowledge_base>',
  ].join('\n');
}

export async function handleAssistant(req: AssistantRequest, client: Pick<Anthropic, 'beta'>, model: string): Promise<AssistantResponse> {
  if (detectEmergencyLanguage(req.question)) {
    return { answer: kb.emergencyText[req.language], sourceIds: ['dsh', 'gesund'], emergency: true };
  }
  if (detectMedicationRequest(req.question)) {
    return { answer: kb.medicationRefusal[req.language], sourceIds: [], emergency: false };
  }

  const response = await client.beta.messages.parse({
    model,
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: betaZodOutputFormat(ReplySchema) },
    system: systemPrompt(req.language),
    messages: [{ role: 'user', content: req.question }],
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    return { answer: '', sourceIds: [], emergency: false };
  }
  const out = response.parsed_output;
  return {
    answer: out.answer.slice(0, 4000),
    sourceIds: out.source_ids.filter((s) => KNOWN_SOURCES.has(s)),
    emergency: out.emergency_suspected,
  };
}
