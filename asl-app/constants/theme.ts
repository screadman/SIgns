import type { ViewStyle } from 'react-native';

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',
  primarySurface: '#EEF2FF',
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  accent: '#FF7235',
  accentSurface: '#FFF1EC',
  success: '#10B981',
  successSurface: '#ECFDF5',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  streak: '#FF9600',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceMuted: '#F3F4F6',
  signSurface: '#F8F7EF',
  surfaceElevated: '#FFFFFF',
  text: '#1E1B4B',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  disabled: '#E5E7EB',
  border: '#E5E7EB',
  overlay: 'rgba(15, 23, 42, 0.5)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#0F172A',
} as const;

export const fontFamily = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  heading: 'Outfit_700Bold',
  headingExtraBold: 'Outfit_800ExtraBold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 44,
} as const;

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  '2sm': 12,
  md: 16,
  '2md': 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const borderWidth = {
  none: 0,
  thin: 1,
  thick: 2,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const controlHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  pressed: 0.8,
  full: 1,
} as const;

export const shadows = {
  none: {},
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;

export const theme = {
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  borderWidth,
  iconSize,
  controlHeight,
  opacity,
  shadows,
} as const;

export type Theme = typeof theme;
