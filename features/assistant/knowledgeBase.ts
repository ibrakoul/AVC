import type { SupportedLanguage } from '@/types/i18n';

/**
 * Approved knowledge base for the STROKE GUARD ASSISTANT.
 *
 * Answers are stored in the locale files (`assistant.kb.<id>`), so they are
 * reviewed and translated like the rest of the app. The keyword lists drive
 * the offline FAQ matcher. The same entries are sent to the server-side AI
 * endpoint as its ONLY grounding context (see supabase/functions/assistant).
 */
export type KbId =
  | 'symptoms'
  | 'tia'
  | 'types'
  | 'bloodPressure'
  | 'atrialFibrillation'
  | 'prevention'
  | 'recovery'
  | 'doctorQuestions'
  | 'terms'
  | 'wait';

export interface KbEntry {
  id: KbId;
  sourceIds: string[];
  keywords: Record<SupportedLanguage, string[]>;
}

export const KNOWLEDGE_BASE: readonly KbEntry[] = [
  {
    id: 'symptoms',
    sourceIds: ['who', 'dsh'],
    keywords: {
      en: ['sign', 'signs', 'symptom', 'symptoms', 'fast', 'befast', 'warning', 'recognize', 'recognise'],
      fr: ['signe', 'signes', 'symptome', 'symptomes', 'fast', 'befast', 'alerte', 'reconnaitre'],
      de: ['zeichen', 'warnzeichen', 'symptom', 'symptome', 'fast', 'befast', 'erkennen'],
    },
  },
  {
    id: 'tia',
    sourceIds: ['who', 'gesund'],
    keywords: {
      en: ['tia', 'transient', 'mini', 'ministroke', 'mini-stroke'],
      fr: ['ait', 'transitoire', 'mini'],
      de: ['tia', 'transitorisch', 'mini'],
    },
  },
  {
    id: 'types',
    sourceIds: ['who', 'gesund'],
    keywords: {
      en: ['type', 'types', 'ischemic', 'ischaemic', 'hemorrhagic', 'haemorrhagic', 'bleed', 'clot'],
      fr: ['type', 'types', 'ischemique', 'hemorragique', 'caillot', 'saignement'],
      de: ['art', 'arten', 'ischamisch', 'hamorrhagisch', 'blutung', 'gerinnsel'],
    },
  },
  {
    id: 'bloodPressure',
    sourceIds: ['who', 'whoHypertension'],
    keywords: {
      en: ['blood pressure', 'pressure', 'hypertension'],
      fr: ['tension', 'hypertension', 'pression'],
      de: ['blutdruck', 'bluthochdruck', 'hypertonie'],
    },
  },
  {
    id: 'atrialFibrillation',
    sourceIds: ['who', 'gesund'],
    keywords: {
      en: ['atrial', 'fibrillation', 'afib', 'irregular', 'heartbeat', 'rhythm'],
      fr: ['fibrillation', 'atriale', 'auriculaire', 'irregulier', 'rythme'],
      de: ['vorhofflimmern', 'flimmern', 'unregelmassig', 'rhythmus', 'herzrhythmus'],
    },
  },
  {
    id: 'prevention',
    sourceIds: ['who'],
    keywords: {
      en: ['prevent', 'prevention', 'reduce', 'lower', 'risk', 'avoid'],
      fr: ['prevenir', 'prevention', 'reduire', 'risque', 'eviter'],
      de: ['vorbeugen', 'vorbeugung', 'pravention', 'senken', 'risiko', 'vermeiden'],
    },
  },
  {
    id: 'recovery',
    sourceIds: ['who', 'gesund'],
    keywords: {
      en: ['recovery', 'after', 'rehabilitation', 'rehab', 'survivor', 'therapy'],
      fr: ['recuperation', 'apres', 'reeducation', 'therapie', 'survivant'],
      de: ['genesung', 'nach', 'rehabilitation', 'reha', 'therapie', 'erholung'],
    },
  },
  {
    id: 'doctorQuestions',
    sourceIds: ['gesund'],
    keywords: {
      en: ['doctor', 'appointment', 'ask', 'questions', 'gp'],
      fr: ['medecin', 'rendez-vous', 'demander', 'questions', 'consultation'],
      de: ['arzt', 'arztin', 'termin', 'fragen', 'hausarzt'],
    },
  },
  {
    id: 'terms',
    sourceIds: ['who', 'gesund'],
    keywords: {
      en: ['neurologist', 'thrombolysis', 'thrombectomy', 'mean', 'term', 'definition'],
      fr: ['neurologue', 'thrombolyse', 'thrombectomie', 'signifie', 'definition', 'terme'],
      de: ['neurologe', 'neurologin', 'thrombolyse', 'thrombektomie', 'bedeutet', 'begriff'],
    },
  },
  {
    id: 'wait',
    sourceIds: ['dsh', 'gesund'],
    keywords: {
      en: ['wait', 'pass', 'go away', 'disappear', 'later'],
      fr: ['attendre', 'passer', 'disparaitre', 'plus tard'],
      de: ['warten', 'abwarten', 'vergehen', 'verschwinden', 'spater'],
    },
  },
];
