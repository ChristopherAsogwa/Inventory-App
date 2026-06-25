import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  /** Primary icon colour. Defaults to white (for use on indigo splash bg). */
  color?: string;
}

/**
 * Storefront icon rendered with react-native-svg.
 * Renders at native resolution on every screen density.
 *
 * Usage:
 *   <AppLogo size={96} />                 // white on dark bg
 *   <AppLogo size={56} color="#4f46e5" /> // indigo on light bg
 */
export default function AppLogo({ size = 80, color = '#ffffff' }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* ── Roof / triangular awning ─────────────────── */}
      <Path d="M6 44 L40 6 L74 44 Z" fill={color} />

      {/* ── Building body ────────────────────────────── */}
      <Rect x="12" y="41" width="56" height="34" rx="4" fill={color} />

      {/* ── Store sign strip at top of building ──────── */}
      <Rect x="12" y="41" width="56" height="10" rx="2" fill={color} opacity={0.15} />

      {/* ── Left window ──────────────────────────────── */}
      <Rect x="16" y="53" width="18" height="13" rx="2.5" fill={color} opacity={0.28} />

      {/* ── Right window ─────────────────────────────── */}
      <Rect x="46" y="53" width="18" height="13" rx="2.5" fill={color} opacity={0.28} />

      {/* ── Door (centred) ───────────────────────────── */}
      <Rect x="31" y="57" width="18" height="18" rx="3" fill={color} opacity={0.22} />

      {/* ── Door knob ────────────────────────────────── */}
      <Circle cx="46" cy="66.5" r="1.8" fill={color} opacity={0.55} />

      {/* ── Small chimney / detail on roof ───────────── */}
      <Rect x="33" y="24" width="14" height="5" rx="1.5" fill={color} opacity={0.45} />
    </Svg>
  );
}
