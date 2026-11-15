/**
 * STROKE GUARD AI — design tokens.
 *
 * Brand palette (from the product brief):
 *   navy #102A43 · medical blue #168DCE · turquoise #21B6AD
 *   white #FFFFFF · light background #F4F8FB · emergency red #B42318
 *
 * Accessibility notes:
 * - #168DCE on white is ~3.6:1, so it is only used for large/bold text,
 *   icons and accents. Buttons with white text use `primaryStrong` (≥4.5:1).
 * - Emergency red is reserved for emergency actions and warnings ONLY.
 */
export const palette = {
  navy: '#102A43',
  navy700: '#243B53',
  navy500: '#486581',
  navy300: '#9FB3C8',
  blue: '#168DCE',
  blueStrong: '#0B6A9F',
  turquoise: '#21B6AD',
  turquoiseStrong: '#13807A',
  white: '#FFFFFF',
  background: '#F4F8FB',
  emergency: '#B42318',
  emergencyDark: '#8F1C13',
  emergencySoft: '#FDECEA',
  warningSoft: '#FFF6E0',
  warningText: '#7A4B00',
  successSoft: '#E3F7F5',
  black: '#000000',
} as const;

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryStrong: string;
  onPrimary: string;
  accent: string;
  accentStrong: string;
  emergency: string;
  onEmergency: string;
  emergencySoft: string;
  onEmergencySoft: string;
  warningSoft: string;
  onWarningSoft: string;
  successSoft: string;
  tabBar: string;
  tabInactive: string;
}

export const colors: Record<ColorScheme, ThemeColors> = {
  light: {
    background: palette.background,
    surface: palette.white,
    surfaceAlt: '#E8F1F8',
    text: palette.navy,
    textMuted: palette.navy500,
    border: '#D9E2EC',
    primary: palette.blue,
    primaryStrong: palette.blueStrong,
    onPrimary: palette.white,
    accent: palette.turquoise,
    accentStrong: palette.turquoiseStrong,
    emergency: palette.emergency,
    onEmergency: palette.white,
    emergencySoft: palette.emergencySoft,
    onEmergencySoft: palette.emergencyDark,
    warningSoft: palette.warningSoft,
    onWarningSoft: palette.warningText,
    successSoft: palette.successSoft,
    tabBar: palette.white,
    tabInactive: palette.navy500,
  },
  dark: {
    background: '#0A1B2B',
    surface: '#13293D',
    surfaceAlt: '#1B3550',
    text: '#F0F4F8',
    textMuted: '#BCCCDC',
    border: '#2A4A66',
    primary: '#4FB3EA',
    primaryStrong: '#1F8FCF',
    onPrimary: '#04131F',
    accent: '#3DD6CC',
    accentStrong: '#3DD6CC',
    emergency: '#D92D20',
    onEmergency: palette.white,
    emergencySoft: '#3D1512',
    onEmergencySoft: '#FFD3CE',
    warningSoft: '#3A2E10',
    onWarningSoft: '#FFE3A3',
    successSoft: '#123B39',
    tabBar: '#13293D',
    tabInactive: '#9FB3C8',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Typography scale. Base body size is deliberately large (17) for older adults. */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  body: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const },
  bodyStrong: { fontSize: 17, lineHeight: 25, fontWeight: '600' as const },
  small: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  button: { fontSize: 18, lineHeight: 22, fontWeight: '700' as const },
} as const;

/** Minimum touch target (Apple HIG 44pt / Material 48dp). We use 52 for older adults. */
export const MIN_TOUCH = 52;
