import { Platform } from 'react-native';

/**
 * Optional local reminders (never contain health values). Notifications are
 * scheduled on-device only; no push token is collected.
 */
export type ReminderKind = 'guide' | 'bp';
export type ReminderResult = { ok: true; id: string } | { ok: false; reason: 'permission_denied' | 'unavailable' };

type NotificationsModule = typeof import('expo-notifications');

function load(): NotificationsModule | null {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

export async function scheduleReminder(kind: ReminderKind, title: string, body: string): Promise<ReminderResult> {
  const N = load();
  if (!N) return { ok: false, reason: 'unavailable' };
  try {
    const current = await N.getPermissionsAsync();
    const status = current.granted ? current : await N.requestPermissionsAsync();
    if (!status.granted) return { ok: false, reason: 'permission_denied' };
    const trigger: import('expo-notifications').NotificationTriggerInput =
      kind === 'bp'
        ? { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 9, minute: 30 }
        : { type: N.SchedulableTriggerInputTypes.MONTHLY, day: 1, hour: 18, minute: 0 };
    const id = await N.scheduleNotificationAsync({ content: { title, body }, trigger });
    return { ok: true, id };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export async function cancelReminder(id: string | null): Promise<void> {
  const N = load();
  if (!N || !id) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    /* already gone */
  }
}
