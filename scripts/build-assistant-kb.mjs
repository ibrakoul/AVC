// Generates supabase/functions/_shared/knowledgeBase.json from the reviewed
// locale files, so the server-side AI is grounded ONLY in approved content.
// Run: node scripts/build-assistant-kb.mjs   (tests fail if it is stale)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = {
  symptoms: ['who', 'dsh'],
  tia: ['who', 'gesund'],
  types: ['who', 'gesund'],
  bloodPressure: ['who', 'whoHypertension'],
  atrialFibrillation: ['who', 'gesund'],
  prevention: ['who'],
  recovery: ['who', 'gesund'],
  doctorQuestions: ['gesund'],
  terms: ['who', 'gesund'],
  wait: ['dsh', 'gesund'],
};

export function buildKb() {
  const out = { generatedFrom: 'locales/*/translation.json', entries: [] };
  const locales = Object.fromEntries(['en', 'fr', 'de'].map((l) => [l, JSON.parse(readFileSync(join(root, 'locales', l, 'translation.json'), 'utf8'))]));
  for (const id of Object.keys(SOURCES)) {
    out.entries.push({
      id,
      sourceIds: SOURCES[id],
      content: Object.fromEntries(Object.entries(locales).map(([l, t]) => [l, { q: t.assistant.kb[id].q, a: t.assistant.kb[id].a }])),
    });
  }
  out.emergencyText = Object.fromEntries(Object.entries(locales).map(([l, t]) => [l, `${t.assistant.emergencyDetectedBody} ${t.safety.mainWarning}`]));
  out.medicationRefusal = Object.fromEntries(Object.entries(locales).map(([l, t]) => [l, t.assistant.medicationRefusal]));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(root, 'supabase/functions/_shared/knowledgeBase.json'), `${JSON.stringify(buildKb(), null, 2)}\n`);
  console.log('knowledgeBase.json written');
}
