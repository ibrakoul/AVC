import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { KNOWLEDGE_BASE } from '@/features/assistant/knowledgeBase';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('server-side assistant stays in sync with the app', () => {
  it('server safety filters mirror the app filters (same phrase lists)', () => {
    const strip = (s: string) => s.slice(s.indexOf('const ACUTE_PHRASES'));
    expect(strip(read('supabase/functions/_shared/safetyFilters.ts'))).toBe(strip(read('features/assistant/safetyFilters.ts')));
  });

  it('server knowledge base is generated from the current locale files', () => {
    const kb = JSON.parse(read('supabase/functions/_shared/knowledgeBase.json')) as {
      entries: { id: string; sourceIds: string[]; content: Record<string, { q: string; a: string }> }[];
    };
    const en = JSON.parse(read('locales/en/translation.json')) as { assistant: { kb: Record<string, { q: string; a: string }> } };
    expect(kb.entries.map((e) => e.id)).toEqual(KNOWLEDGE_BASE.map((e) => e.id));
    for (const entry of kb.entries) {
      expect(entry.content.en).toEqual(en.assistant.kb[entry.id]);
      expect(entry.sourceIds).toEqual(KNOWLEDGE_BASE.find((e) => e.id === entry.id)?.sourceIds);
    }
  });

  it('the API key is only read server-side', () => {
    expect(read('supabase/functions/assistant/index.ts')).toContain("Deno.env.get('ANTHROPIC_API_KEY')");
  });
});
