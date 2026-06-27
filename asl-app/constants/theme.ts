export const colors = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  accent: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
  streak: '#FF9600',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  black: '#0F172A',
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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const theme = {
  colors,
  fontSize,
  spacing,
  borderRadius,
} as const;

export type Theme = typeof theme;
