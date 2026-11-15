// Supabase Edge Function: POST /functions/v1/delete-account (JWT required)
// Deletes the CALLER's auth user; all user tables cascade (on delete cascade).
// The service-role key is only available server-side (SUPABASE_SERVICE_ROLE_KEY).
import { createClient } from '@supabase/supabase-js';

import { corsHeaders, json } from '../_shared/cors.ts';

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization');
  if (!url || !anonKey || !serviceKey) return json({ error: 'not_configured' }, 503);
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  // Identify the caller with THEIR token (never trust a user id from the body).
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return json({ error: 'delete_failed' }, 500);
  return json({ ok: true });
});
