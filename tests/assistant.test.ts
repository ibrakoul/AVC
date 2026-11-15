import { answerOffline, matchKnowledgeBase } from '@/features/assistant/faqEngine';
import { detectEmergencyLanguage, detectMedicationRequest } from '@/features/assistant/safetyFilters';
import { askAssistant } from '@/services/ai/assistantClient';

describe('AI assistant — emergency safety behaviour', () => {
  it.each([
    'I think my husband is having a stroke',
    'My face is drooping and I can’t speak',
    'Help, my mother suddenly cannot move her arm',
    'je pense que mon père fait un AVC',
    'ma mère ne peut plus parler depuis 10 minutes',
    'Mein Vater kann plötzlich nicht mehr sprechen',
    'Notfall! Gesicht hängt auf einer Seite',
    'I have sudden double vision',
  ])('detects emergency language: "%s"', (msg) => {
    expect(detectEmergencyLanguage(msg)).toBe(true);
  });

  it.each(['What are the types of stroke?', 'Comment réduire mon risque ?', 'Was ist Vorhofflimmern?'])('does not flag general education question: "%s"', (msg) => {
    expect(detectEmergencyLanguage(msg)).toBe(false);
  });

  it('answers emergencies WITHOUT calling the network, even with consent', async () => {
    const invoke = jest.fn();
    const r = await askAssistant('I think I am having a stroke right now', 'en', { onlineConsent: true, invoke });
    expect(r.emergency).toBe(true);
    expect(r.kbId).toBe('wait');
    expect(invoke).not.toHaveBeenCalled();
  });

  it('refuses medication advice (aspirin) without calling the network', async () => {
    const invoke = jest.fn();
    expect(detectMedicationRequest('Should I take an aspirin?')).toBe(true);
    expect(detectMedicationRequest('Dois-je arrêter mon traitement ? médicament')).toBe(true);
    expect(detectMedicationRequest('Soll ich meine Blutverdünner absetzen?')).toBe(true);
    const r = await askAssistant('Should I give aspirin to my father?', 'en', { onlineConsent: true, invoke });
    expect(r.medicationRefusal).toBe(true);
    expect(r.kbId).toBeNull();
    expect(invoke).not.toHaveBeenCalled();
  });
});

describe('AI assistant — FAQ mode and fallback', () => {
  it('matches the knowledge base in every language', () => {
    expect(matchKnowledgeBase('What is a TIA?', 'en')?.id).toBe('tia');
    expect(matchKnowledgeBase('Qu’est-ce que la fibrillation atriale ?', 'fr')?.id).toBe('atrialFibrillation');
    expect(matchKnowledgeBase('Wie kann ich vorbeugen?', 'de')?.id).toBe('prevention');
    expect(matchKnowledgeBase('heart', 'en')).toBeNull();
  });

  it('returns references with FAQ answers', () => {
    const r = answerOffline('What are the warning signs?', 'en');
    expect(r.kbId).toBe('symptoms');
    expect(r.sourceIds.length).toBeGreaterThan(0);
    expect(r.mode).toBe('faq');
  });

  it('uses offline FAQ when the user has not consented', async () => {
    const invoke = jest.fn();
    const r = await askAssistant('What is a TIA?', 'en', { onlineConsent: false, invoke });
    expect(invoke).not.toHaveBeenCalled();
    expect(r).toMatchObject({ mode: 'faq', kbId: 'tia' });
  });

  it('uses the server answer when available and filters unknown sources', async () => {
    const invoke = jest.fn().mockResolvedValue({ answer: 'Grounded answer', sourceIds: ['who', 'evil'], emergency: false });
    const r = await askAssistant('What is a TIA?', 'en', { onlineConsent: true, invoke });
    expect(r).toMatchObject({ mode: 'ai', text: 'Grounded answer', sourceIds: ['who'] });
  });

  it('honours a server-side emergency flag', async () => {
    const invoke = jest.fn().mockResolvedValue({ answer: 'Call now', sourceIds: [], emergency: true });
    expect((await askAssistant('tell me about recovery', 'en', { onlineConsent: true, invoke })).emergency).toBe(true);
  });

  it('falls back to the FAQ when the backend fails or returns garbage (never a broken chatbot)', async () => {
    const failing = jest.fn().mockRejectedValue(new Error('500'));
    expect(await askAssistant('What is a TIA?', 'en', { onlineConsent: true, invoke: failing })).toMatchObject({ mode: 'faq', kbId: 'tia', fellBackToOffline: true });
    const garbage = jest.fn().mockResolvedValue({ nope: true });
    expect(await askAssistant('What is a TIA?', 'en', { onlineConsent: true, invoke: garbage })).toMatchObject({ mode: 'faq', fellBackToOffline: true });
  });
});

describe('sources', () => {
  it('every KB source id exists in the verified source list', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SOURCES } = require('@/constants/sources') as typeof import('@/constants/sources');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KNOWLEDGE_BASE } = require('@/features/assistant/knowledgeBase') as typeof import('@/features/assistant/knowledgeBase');
    for (const e of KNOWLEDGE_BASE) for (const id of e.sourceIds) expect(SOURCES[id]).toBeDefined();
    for (const s of Object.values(SOURCES)) expect(s.url).toMatch(/^https:\/\//);
  });
});
