import Svg, { Circle, Path } from 'react-native-svg';

import { palette } from '@/constants/theme';

/** STROKE GUARD AI mark: a shield with a pulse line forming a brain-like curve. */
export function Logo({ size = 48, inverted = false }: { size?: number; inverted?: boolean }) {
  const shield = inverted ? palette.white : palette.navy;
  const pulse = inverted ? palette.navy : palette.white;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="STROKE GUARD AI">
      <Path d="M32 4 L56 12 V30 C56 45 45.5 56 32 60 C18.5 56 8 45 8 30 V12 Z" fill={shield} />
      <Path d="M32 8 L52 14.5 V30 C52 42.5 43.5 51.8 32 55.6 Z" fill={palette.blue} opacity={0.9} />
      <Path d="M14 33 H23 L27 24 L33 42 L37 30 L40 33 H50" stroke={pulse} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={50} cy={33} r={3.5} fill={palette.turquoise} />
    </Svg>
  );
}
