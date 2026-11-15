import en from '@/locales/en/translation.json';
import fr from '@/locales/fr/translation.json';
import de from '@/locales/de/translation.json';
import i18n from '@/locales';
import { EMERGENCY_DATASET } from '@/constants/emergencyNumbers';

type Json = string | Json[] | { [k: string]: Json };

function flatten(obj: Json, prefix = ''): Record<string, Json> {
  if (typeof obj === 'string' || Array.isArray(obj)) return { [prefix]: obj };
  return Object.entries(obj).reduce<Record<string, Json>>((acc, [k, v]) => ({ ...acc, ...flatten(v, prefix ? `${prefix}.${k}` : k) }), {});
}

const flat = { en: flatten(en as Json), fr: flatten(fr as Json), de: flatten(de as Json) };

describe('translations', () => {
  it.each(['fr', 'de'] as const)('%s has exactly the same keys as en', (lng) => {
    expect(Object.keys(flat[lng]).sort()).toEqual(Object.keys(flat.en).sort());
  });

  it.each(['en', 'fr', 'de'] as const)('%s has no empty strings and arrays have the same length as en', (lng) => {
    for (const [key, value] of Object.entries(flat[lng])) {
      if (Array.isArray(value)) {
        expect([key, value.length]).toEqual([key, (flat.en[key] as Json[]).length]);
        value.forEach((v) => expect(typeof v === 'string' && v.trim().length > 0).toBe(true));
      } else {
        expect([key, typeof value === 'string' && value.trim().length > 0]).toEqual([key, true]);
      }
    }
  });

  it.each(['en', 'fr', 'de'] as const)('%s keeps interpolation placeholders', (lng) => {
    for (const [key, value] of Object.entries(flat.en)) {
      if (typeof value !== 'string') continue;
      const placeholders = (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();
      const translated = flat[lng][key] as string;
      expect([key, (translated.match(/{{\s*\w+\s*}}/g) ?? []).sort()]).toEqual([key, placeholders]);
    }
  });

  it('contains the mandatory emergency warning verbatim (EN)', () => {
    expect(en.safety.mainWarning).toBe(
      'Possible stroke symptoms are a medical emergency. Call emergency services immediately. Do not wait for symptoms to disappear.',
    );
  });

  it('every dataset country has a name in every language', () => {
    for (const c of EMERGENCY_DATASET.countries) {
      for (const lng of ['en', 'fr', 'de'] as const) expect(flat[lng][`countries.${c.code}`]).toBeTruthy();
    }
  });

  it('switches language at runtime', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('emergency.title')).toBe('Urgence');
    await i18n.changeLanguage('de');
    expect(i18n.t('emergency.title')).toBe('Notfall');
    await i18n.changeLanguage('en');
    expect(i18n.t('emergency.title')).toBe('Emergency');
  });

  it('no content recommends aspirin/anticoagulants or waiting', () => {
    const dangerous = [/give (an )?aspirin/i, /take (an )?aspirin/i, /wait and see/i, /donnez de l.aspirine/i, /aspirin geben/i];
    for (const lng of ['en', 'fr', 'de'] as const) {
      const all = JSON.stringify(flat[lng]);
      // Only negative phrasing ("Do not give aspirin") is allowed.
      for (const re of dangerous) {
        const matches = all.match(new RegExp(`.{0,20}${re.source}`, 'gi')) ?? [];
        for (const m of matches) expect(m).toMatch(/not|ne |kein|nicht|never|jamais|niemals|ni /i);
      }
    }
  });
});
