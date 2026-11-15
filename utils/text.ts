/** Lower-cases and strips diacritics ("Ischämisch" → "ischamisch"). */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[’']/g, "'");
}
