import { Share } from 'react-native';

/** Opens the OS share sheet. Returns false if sharing failed or was unavailable. */
export async function shareText(message: string, title?: string): Promise<boolean> {
  try {
    await Share.share({ message, title });
    return true;
  } catch {
    return false;
  }
}
