/**
 * Reference sources used by educational content and the assistant
 * knowledge base. ⚠️ Every URL and its mapping to content must be validated
 * by the medical reviewer before publication (see docs/MEDICAL_SAFETY.md).
 */
export interface ReferenceSource {
  id: string;
  title: string;
  url: string;
}

export const SOURCES: Record<string, ReferenceSource> = {
  nhs: { id: 'nhs', title: 'NHS — Stroke', url: 'https://www.nhs.uk/conditions/stroke/' },
  asa: {
    id: 'asa',
    title: 'American Stroke Association — Stroke symptoms',
    url: 'https://www.stroke.org/en/about-stroke/stroke-symptoms',
  },
  who: {
    id: 'who',
    title: 'World Health Organization — Cardiovascular diseases fact sheet',
    url: 'https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)',
  },
  eso: { id: 'eso', title: 'European Stroke Organisation', url: 'https://eso-stroke.org' },
  dsg: { id: 'dsg', title: 'Stiftung Deutsche Schlaganfall-Hilfe', url: 'https://www.schlaganfall-hilfe.de' },
  ameli: { id: 'ameli', title: 'Assurance Maladie (ameli.fr) — AVC', url: 'https://www.ameli.fr' },
};
