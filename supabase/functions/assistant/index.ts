// Supabase Edge Function: POST /functions/v1/assistant  { question, language }
// Secrets (server-side only): ANTHROPIC_API_KEY, optional ASSISTANT_MODEL.
import Anthropic from '@anthropic-ai/sdk';

import { corsHeaders, json } from '../_shared/cors.ts';
import { handleAssistant, parseRequest } from './handler.ts';

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void };

const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
const model = Deno.env.get('ASSISTANT_MODEL') ?? 'claude-opus-5-5';
const client = apiKey ? new Anthropic({ apiKey, maxRetries: 1, timeout: 30_000 }) : null;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  // The app falls back to its offline FAQ on any non-2xx response.
  if (!client) return json({ error: 'assistant_not_configured' }, 503);

  const parsed = parseRequest(await req.json().catch(() => null));
  if (!parsed) return json({ error: 'invalid_request' }, 400);

  try {
    const result = await handleAssistant(parsed, client, model);
    if (!result.answer) return json({ error: 'no_answer' }, 502);
    return json(result);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'rate_limited' }, 429);
    if (error instanceof Anthropic.APIError) return json({ error: 'upstream_error', status: error.status }, 502);
    return json({ error: 'internal_error' }, 500);
  }
});
