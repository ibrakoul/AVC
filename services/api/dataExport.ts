import type { TFunction } from 'i18next';

import { buildHealthSummary } from '@/features/tracker/summary';
import { listContacts } from '@/services/storage/contactsRepository';
import { listMeasurements } from '@/services/storage/measurementsRepository';
import { loadPrevention } from '@/services/storage/preventionRepository';
import type { AppSettings } from '@/services/storage/settingsStore';
import { RISK_FACTORS } from '@/types/health';

/** Human-readable export of ALL locally stored personal data (GDPR access/portability). */
export async function buildFullDataExport(t: TFunction, locale: string, settings: AppSettings): Promise<string> {
  const [measurements, contacts, prevention] = await Promise.all([listMeasurements(), listContacts(), loadPrevention()]);
  const lines = [buildHealthSummary(measurements, t, locale), '', `## ${t('family.contactsTitle')}`];
  if (contacts.length === 0) lines.push(t('family.empty'));
  for (const c of contacts) lines.push(`• ${c.name} — ${c.phone}${c.relationship ? ` (${c.relationship})` : ''}`);
  lines.push('', `## ${t('prevention.questionnaire.title')}`);
  if (!prevention) lines.push(t('prevention.noAnswersYet'));
  else
    for (const f of RISK_FACTORS) {
      const a = prevention.answers[f];
      if (a) lines.push(`• ${t(`prevention.factors.${f}.label`)}: ${t(a === 'unknown' ? 'common.unknown' : `common.${a}`)}`);
    }
  lines.push(
    '',
    `## ${t('settings.title')}`,
    `• ${t('settings.language')}: ${settings.language ?? '—'}`,
    `• ${t('settings.country')}: ${settings.countryCode ?? '—'}`,
    `• ${t('privacy.consentCloudSync')}: ${settings.consents.cloudSync ? t('common.yes') : t('common.no')}`,
    `• ${t('privacy.consentAssistant')}: ${settings.consents.assistantOnline ? t('common.yes') : t('common.no')}`,
  );
  return lines.join('\n');
}
