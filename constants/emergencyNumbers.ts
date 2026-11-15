import type { EmergencyDataset } from '@/types/emergency';

/**
 * Bundled, versioned, OFFLINE emergency-number dataset.
 *
 * ⚠️ MEDICAL-SAFETY / REGULATORY NOTE
 * Every entry is marked `pending_official_review`. Before any public release a
 * qualified reviewer MUST verify each number against the listed official
 * source, set `lastVerified` and switch `verificationStatus` to `verified`.
 * The UI always shows the dataset version and the verification status so the
 * app never claims that an offline number is current when it has not been
 * verified.
 *
 * To add a country: add an entry here, add `countries.<CODE>` to every locale
 * file and run the test suite (tests/emergencyNumbers.test.ts checks shape).
 */
const EU_112 = {
  name: 'European Commission — 112 single European emergency number',
  url: 'https://digital-strategy.ec.europa.eu/en/policies/112',
};

const n112 = { number: '112', labelKey: 'emergency.numbers.euGeneral' };

export const EMERGENCY_DATASET: EmergencyDataset = {
  version: '2026.11-draft.1',
  compiledAt: '2026-11-15',
  countries: [
    {
      code: 'DE',
      nameKey: 'countries.DE',
      languages: ['de', 'en'],
      primary: { number: '112', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'FR',
      nameKey: 'countries.FR',
      languages: ['fr', 'en'],
      primary: { number: '15', labelKey: 'emergency.numbers.samu' },
      alternatives: [
        n112,
        { number: '114', labelKey: 'emergency.numbers.deafSms' },
      ],
      officialSource: { name: 'Service-Public.fr — numéros d’urgence', url: 'https://www.service-public.fr' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'AT',
      nameKey: 'countries.AT',
      languages: ['de', 'en'],
      primary: { number: '144', labelKey: 'emergency.numbers.ambulance' },
      alternatives: [n112],
      officialSource: { name: 'oesterreich.gv.at — Notrufnummern', url: 'https://www.oesterreich.gv.at' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'CH',
      nameKey: 'countries.CH',
      languages: ['de', 'fr', 'en'],
      primary: { number: '144', labelKey: 'emergency.numbers.ambulance' },
      alternatives: [n112],
      officialSource: { name: 'ch.ch — Notfallnummern / numéros d’urgence', url: 'https://www.ch.ch' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'BE',
      nameKey: 'countries.BE',
      languages: ['fr', 'de', 'en'],
      primary: { number: '112', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'LU',
      nameKey: 'countries.LU',
      languages: ['fr', 'de', 'en'],
      primary: { number: '112', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'NL',
      nameKey: 'countries.NL',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'IT',
      nameKey: 'countries.IT',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.euGeneral' },
      alternatives: [{ number: '118', labelKey: 'emergency.numbers.ambulanceRegional' }],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'ES',
      nameKey: 'countries.ES',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.euGeneral' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'PT',
      nameKey: 'countries.PT',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.euGeneral' },
      alternatives: [],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'PL',
      nameKey: 'countries.PL',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.euGeneral' },
      alternatives: [{ number: '999', labelKey: 'emergency.numbers.ambulance' }],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'IE',
      nameKey: 'countries.IE',
      languages: ['en'],
      primary: { number: '112', labelKey: 'emergency.numbers.euGeneral' },
      alternatives: [{ number: '999', labelKey: 'emergency.numbers.euGeneral' }],
      officialSource: EU_112,
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'GB',
      nameKey: 'countries.GB',
      languages: ['en'],
      primary: { number: '999', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [n112],
      officialSource: { name: 'NHS — when to call 999', url: 'https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'US',
      nameKey: 'countries.US',
      languages: ['en'],
      primary: { number: '911', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: { name: '911.gov', url: 'https://www.911.gov' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'CA',
      nameKey: 'countries.CA',
      languages: ['en', 'fr'],
      primary: { number: '911', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: { name: 'Government of Canada', url: 'https://www.canada.ca' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'AU',
      nameKey: 'countries.AU',
      languages: ['en'],
      primary: { number: '000', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [{ number: '112', labelKey: 'emergency.numbers.mobileAlternative' }],
      officialSource: { name: 'Triple Zero (000)', url: 'https://www.triplezero.gov.au' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'NZ',
      nameKey: 'countries.NZ',
      languages: ['en'],
      primary: { number: '111', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: { name: 'New Zealand Government', url: 'https://www.govt.nz' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
    {
      code: 'JP',
      nameKey: 'countries.JP',
      languages: ['en'],
      primary: { number: '119', labelKey: 'emergency.numbers.ambulanceFire' },
      alternatives: [],
      officialSource: { name: 'Fire and Disaster Management Agency (FDMA)', url: 'https://www.fdma.go.jp' },
      lastVerified: null,
      verificationStatus: 'pending_official_review',
    },
  ],
};

/**
 * Numbers offered when the country is unknown. They are shown WITH their
 * region so that nobody assumes 112 works everywhere.
 */
export const UNKNOWN_COUNTRY_SUGGESTIONS = [
  { number: '112', regionKey: 'emergency.unknown.region112' },
  { number: '911', regionKey: 'emergency.unknown.region911' },
  { number: '999', regionKey: 'emergency.unknown.region999' },
] as const;
