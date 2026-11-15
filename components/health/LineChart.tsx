import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';

export interface ChartSeries {
  values: number[];
  color: string;
  label: string;
}

/**
 * Minimal, dependency-free trend chart. It shows only the user's own values —
 * no target zones or "normal" bands, because the app must not interpret
 * measurements. An accessible text summary is provided by the parent.
 */
export function LineChart({ series, height = 160, accessibilityLabel }: { series: ChartSeries[]; height?: number; accessibilityLabel: string }) {
  const { c } = useTheme();
  const width = 320;
  const pad = 28;
  const all = series.flatMap((s) => s.values);
  if (all.length === 0) return null;
  let min = Math.min(...all);
  let max = Math.max(...all);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const count = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => pad + (count <= 1 ? 0 : (i * (width - pad * 2)) / (count - 1));
  const y = (v: number) => height - pad - ((v - min) / (max - min)) * (height - pad * 2);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke={c.border} strokeWidth={1} />
        <SvgText x={4} y={y(max) + 4} fontSize={11} fill={c.textMuted}>
          {Math.round(max)}
        </SvgText>
        <SvgText x={4} y={y(min) + 4} fontSize={11} fill={c.textMuted}>
          {Math.round(min)}
        </SvgText>
        {series.map((s) => (
          <Polyline
            key={s.label}
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        ))}
        {series.map((s) => s.values.map((v, i) => <Circle key={`${s.label}-${i}`} cx={x(i)} cy={y(v)} r={4} fill={s.color} />))}
      </Svg>
    </View>
  );
}
