import { EMERGENCY_DATASET } from '@/constants/emergencyNumbers';
import {
  buildTelUrl,
  getCountryConfig,
  openEmergencyDialer,
  requiresVerification,
  sanitizePhoneNumber,
  suggestCountryFromRegion,
} from '@/services/emergency/emergencyService';

describe('emergency number selection', () => {
  it.each([
    ['DE', '112'],
    ['FR', '15'],
    ['AT', '144'],
    ['CH', '144'],
    ['GB', '999'],
    ['US', '911'],
    ['CA', '911'],
    ['AU', '000'],
    ['NZ', '111'],
    ['JP', '119'],
  ])('%s → %s', (code, number) => {
    expect(getCountryConfig(code)?.primary.number).toBe(number);
  });

  it('is case-insensitive', () => expect(getCountryConfig('de')?.code).toBe('DE'));

  it('does NOT assume 112 for unknown countries', () => {
    expect(getCountryConfig('ZZ')).toBeNull();
    expect(getCountryConfig(null)).toBeNull();
    expect(getCountryConfig(undefined)).toBeNull();
  });

  it('France also lists 112 and the 114 accessibility number', () => {
    const numbers = getCountryConfig('FR')!.alternatives.map((a) => a.number);
    expect(numbers).toEqual(expect.arrayContaining(['112', '114']));
  });

  it('suggests a country from device region only when supported', () => {
    expect(suggestCountryFromRegion(['FR'])).toBe('FR');
    expect(suggestCountryFromRegion([null, 'XX', 'ch'])).toBe('CH');
    expect(suggestCountryFromRegion(['XX', undefined])).toBeNull();
  });
});

describe('emergency phone link', () => {
  it('builds tel: URLs from sanitised digits', () => {
    expect(buildTelUrl('112')).toBe('tel:112');
    expect(buildTelUrl('+49 (0)30 123-456')).toBe('tel:+49030123456');
    expect(buildTelUrl('abc')).toBeNull();
    expect(sanitizePhoneNumber('  1 1 2 ')).toBe('112');
  });

  it('opens the native dialer and reports only "dialer_opened" (never "call placed")', async () => {
    const openURL = jest.fn().mockResolvedValue(true);
    const result = await openEmergencyDialer('112', { openURL });
    expect(openURL).toHaveBeenCalledWith('tel:112');
    expect(result).toEqual({ status: 'dialer_opened', number: '112' });
    expect(JSON.stringify(result)).not.toMatch(/placed|connected|called/i);
  });

  it('returns a failure (for manual-dial guidance) when the OS refuses', async () => {
    const openURL = jest.fn().mockRejectedValue(new Error('no dialer'));
    await expect(openEmergencyDialer('112', { openURL })).resolves.toEqual({ status: 'failed', number: '112', reason: 'os_refused' });
  });

  it('never calls the OS with an invalid number', async () => {
    const openURL = jest.fn();
    await expect(openEmergencyDialer('---', { openURL })).resolves.toMatchObject({ status: 'failed', reason: 'invalid_number' });
    expect(openURL).not.toHaveBeenCalled();
  });
});

describe('offline dataset verification status', () => {
  it('flags unverified entries as requiring verification', () => {
    expect(requiresVerification(getCountryConfig('DE')!)).toBe(true);
  });
  it('flags verified entries older than a year', () => {
    const base = getCountryConfig('DE')!;
    const verified = { ...base, verificationStatus: 'verified' as const, lastVerified: '2026-01-01' };
    expect(requiresVerification(verified, new Date('2026-06-01'))).toBe(false);
    expect(requiresVerification(verified, new Date('2027-06-01'))).toBe(true);
  });
});

describe('dataset integrity', () => {
  const codes = EMERGENCY_DATASET.countries.map((c) => c.code);
  it('has unique ISO codes', () => expect(new Set(codes).size).toBe(codes.length));
  it.each(EMERGENCY_DATASET.countries.map((c) => [c.code, c] as const))('%s has a valid number, source and status', (_code, c) => {
    expect(c.primary.number).toMatch(/^\d{2,4}$/);
    for (const alt of c.alternatives) expect(alt.number).toMatch(/^\d{2,4}$/);
    expect(c.officialSource.url).toMatch(/^https:\/\//);
    expect(['verified', 'pending_official_review']).toContain(c.verificationStatus);
    if (c.verificationStatus === 'verified') expect(c.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(c.languages.length).toBeGreaterThan(0);
  });
  it('is versioned', () => {
    expect(EMERGENCY_DATASET.version).toBeTruthy();
    expect(EMERGENCY_DATASET.compiledAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
