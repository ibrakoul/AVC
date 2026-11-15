import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useAppSettings } from './useAppSettings';

export function useTheme(): { scheme: ColorScheme; c: ThemeColors } {
  const system = useColorScheme();
  const { settings } = useAppSettings();
  const scheme: ColorScheme = settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;
  return { scheme, c: colors[scheme] };
}
