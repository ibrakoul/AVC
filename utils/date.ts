const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date as local "YYYY-MM-DD HH:MM" (input format of the tracker). */
export function toLocalInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parses local "YYYY-MM-DD HH:MM". Returns null for invalid dates (incl. 2026-02-31). */
export function parseLocalInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number) as [number, number, number, number, number, number];
  const date = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== mo - 1 ||
    date.getDate() !== d ||
    date.getHours() !== h ||
    date.getMinutes() !== mi
  ) {
    return null;
  }
  return date;
}

export function formatDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return toLocalInput(date);
  }
}

export function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return date.toLocaleDateString(locale, { dateStyle: 'medium' });
  } catch {
    return toLocalInput(date).slice(0, 10);
  }
}

export function formatTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return toLocalInput(date).slice(11);
  }
}

export function minutesBetween(fromIso: string, to: Date = new Date()): number {
  return Math.max(0, Math.floor((to.getTime() - new Date(fromIso).getTime()) / 60_000));
}
