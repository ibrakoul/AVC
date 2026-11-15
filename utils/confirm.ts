import { Alert, Platform } from 'react-native';

/** Destructive-action confirmation (native Alert; window.confirm on web). */
export function confirmDestructive(title: string, message: string, confirmLabel: string, cancelLabel: string, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
