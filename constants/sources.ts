/**
 * Reference sources. Each was opened and checked against the app content on
 * `SOURCES_CHECKED_AT` (content cross-check, not a professional medical review).
 * Re-check at least every 12 months and whenever content changes.
 */
export interface ReferenceSource {
  id: string;
  title: string;
  url: string;
}

export const SOURCES_CHECKED_AT = '2026-11-15';

export const SOURCES: Record<string, ReferenceSource> = {
  who: { id: 'who', title: 'World Health Organization — Stroke fact sheet (19 Dec 2025)', url: 'https://www.who.int/news-room/fact-sheets/detail/stroke' },
  whoHypertension: { id: 'whoHypertension', title: 'World Health Organization — Hypertension fact sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension' },
  gesund: { id: 'gesund', title: 'gesund.bund.de (Bundesministerium für Gesundheit) — Schlaganfall', url: 'https://gesund.bund.de/schlaganfall' },
  dsh: {
    id: 'dsh',
    title: 'Stiftung Deutsche Schlaganfall-Hilfe — Verhalten im Notfall',
    url: 'https://www.schlaganfall-hilfe.de/de/verstehen-vermeiden/verhalten-im-notfall',
  },
  cdc: { id: 'cdc', title: 'CDC — Signs and Symptoms of Stroke (BE FAST)', url: 'https://www.cdc.gov/stroke/signs-symptoms/index.html' },
  eu112: { id: 'eu112', title: 'European Commission — 112, the EU emergency number', url: 'https://digital-strategy.ec.europa.eu/en/policies/112' },
  kbv116117: { id: 'kbv116117', title: '116117.de — 116117 oder 112?', url: 'https://www.116117.de/de/aerztlicher-bereitschaftsdienst.php' },
};
