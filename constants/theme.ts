import { Platform } from 'react-native';

export const colors = {
  background: '#faf9f7',
  foreground: '#1a1412',
  card: '#ffffff',
  muted: '#eff6ff',           // blue-50 tint
  mutedForeground: 'rgba(26, 20, 18, 0.5)',
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  primaryLight: '#eff6ff',    // blue-50 for tinted backgrounds
  primaryDark: '#1d4ed8',     // blue-700 for pressed / dark states
  accent: '#3b82f6',
  border: 'rgba(26, 20, 18, 0.1)',
  success: '#16a34a',
  warning: '#d97706',
  destructive: '#dc2626',
  dark: '#1a1412',
  /** Gradient stops: blue-500 → blue-600 */
  gradientPrimary: ['#3b82f6', '#2563eb'] as [string, string],
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

/**
 * Cross-platform shadow styles.
 * iOS uses shadow* props; Android uses elevation.
 * Spread into a StyleSheet object or inline style.
 */
export const shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: '#1a1412',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#1a1412',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#1a1412',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
  }),
} as const;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  colors,
  spacing,
  shadow,
  components,
} as const;
