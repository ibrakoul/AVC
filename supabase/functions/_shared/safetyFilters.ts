// MIRROR of features/assistant/safetyFilters.ts — keep in sync (enforced by tests/edgeFunctions.test.ts).
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[’']/g, "'");
}

/**
 * Safety filters run on the device BEFORE any answer is shown or any network
 * request is made. They are deliberately over-inclusive: a false positive
 * only shows the emergency card; a false negative could delay a call.
 * The same lists are mirrored server-side (supabase/functions/assistant).
 */

/** Phrases that on their own indicate a possible acute emergency. */
const ACUTE_PHRASES = [
  // en
  "having a stroke", 'is having a stroke', 'think it is a stroke', "think it's a stroke", 'call an ambulance',
  'emergency', 'help me', 'right now', 'just now', 'suddenly', 'sudden', "can't speak", 'cannot speak', "can't talk",
  "can't move", 'cannot move', 'face is drooping', 'face drooping', 'slurred', 'collapsed', 'unconscious',
  // fr
  'fait un avc', 'faire un avc', 'je fais un avc', 'urgence', 'aidez-moi', 'aide moi', 'maintenant', "a l'instant",
  'tout a coup', 'soudain', 'soudainement', 'brutalement', 'ne peut plus parler', 'ne peux plus parler',
  'ne peut plus bouger', 'bouche de travers', 'visage paralyse', 'evanoui', 'inconscient',
  // de
  'schlaganfall hat', 'habe einen schlaganfall', 'notfall', 'hilfe', 'jetzt gerade', 'gerade eben', 'plotzlich',
  'kann nicht sprechen', 'kann nicht mehr sprechen', 'kann den arm nicht', 'gesicht hangt', 'mundwinkel hangt',
  'verwaschen', 'bewusstlos', 'zusammengebrochen',
];

/** Symptom words that, combined with a personal/present marker, are treated as acute. */
const SYMPTOM_TERMS = [
  'numb', 'weak', 'weakness', 'droop', 'vision', 'blind', 'double', 'dizzy', 'balance', 'headache', 'confus', 'speech',
  'engourdi', 'faiblesse', 'paralys', 'vision', 'vois double', 'vertige', 'equilibre', 'mal de tete', 'confus', 'parole',
  'taub', 'schwach', 'lahm', 'sehen', 'doppelt', 'schwindel', 'gleichgewicht', 'kopfschmerz', 'verwirrt', 'sprache',
];

const PERSONAL_MARKERS = [
  ' i ', ' my ', ' me ', 'mother', 'father', 'husband', 'wife', 'mum', 'mom', 'dad', ' he ', ' she ',
  ' je ', ' j\'', ' ma ', ' mon ', ' mes ', 'mere', 'pere', 'mari', 'femme', ' il ', ' elle ',
  ' ich ', ' mein', ' mir ', 'mutter', 'vater', 'mann', 'frau', ' er ', ' sie ',
];

const MEDICATION_TERMS = [
  'aspirin', 'aspirine', 'medication', 'medicine', 'pill', 'dose', 'dosage', 'prescribe', 'blood thinner',
  'anticoagulant', 'statin', 'stop taking', 'should i take', 'medicament', 'cachet', 'comprime', 'posologie',
  'prescrire', 'arreter mon traitement', 'statine', 'medikament', 'tablette', 'dosis', 'blutverdunner',
  'verschreiben', 'absetzen', 'statin', 'einnehmen',
];

function containsAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((n) => haystack.includes(normalizeText(n)));
}

export function detectEmergencyLanguage(message: string): boolean {
  const text = ` ${normalizeText(message)} `;
  if (containsAny(text, ACUTE_PHRASES)) return true;
  return containsAny(text, SYMPTOM_TERMS) && containsAny(text, PERSONAL_MARKERS);
}

export function detectMedicationRequest(message: string): boolean {
  return containsAny(` ${normalizeText(message)} `, MEDICATION_TERMS);
}
