import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../constants/theme';

export type ScreenBackdropVariant =
  | 'home'
  | 'learn'
  | 'practice'
  | 'profile'
  | 'path'
  | 'quiz'
  | 'onboarding'
  | 'soft';

type ScreenBackdropProps = {
  variant?: ScreenBackdropVariant;
  /** Optional brand/module tint (path, lesson, module screens). */
  accent?: string;
  children: ReactNode;
};

type VariantConfig = {
  gradient: readonly [string, string, ...string[]];
  locations: readonly [number, number, ...number[]];
};

function mixWithWhite(hex: string, whiteRatio: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return '#F8FAFC';
  }
  const value = Number.parseInt(raw, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const mix = (channel: number) =>
    Math.round(channel * (1 - whiteRatio) + 255 * whiteRatio);
  return `#${((mix(r) << 16) | (mix(g) << 8) | mix(b))
    .toString(16)
    .padStart(6, '0')}`;
}

/**
 * Soft vertical washes only. Neighboring stops stay close in hue
 * so the blend reads as one continuous gradient, not color bands.
 */
const BASE_VARIANTS: Record<ScreenBackdropVariant, VariantConfig> = {
  home: {
    gradient: ['#FFF6EF', '#F7F4FF', '#F3F6FF', '#F8FAFC'],
    locations: [0, 0.38, 0.72, 1],
  },
  learn: {
    gradient: ['#F6F3FF', '#F8F7FF', '#F5FBFA', '#F8FAFC'],
    locations: [0, 0.4, 0.75, 1],
  },
  practice: {
    gradient: ['#FFF3EC', '#FFF8F4', '#FFF9F5', '#F8FAFC'],
    locations: [0, 0.4, 0.75, 1],
  },
  profile: {
    gradient: ['#EFF8FE', '#F3FBFA', '#F7F6FF', '#F8FAFC'],
    locations: [0, 0.4, 0.75, 1],
  },
  path: {
    gradient: ['#F3F0FF', '#F7F5FF', '#FAF8FF', '#F8FAFC'],
    locations: [0, 0.4, 0.75, 1],
  },
  quiz: {
    gradient: ['#F0F1FF', '#F7F8FF', '#FBFCFF', '#FFFFFF'],
    locations: [0, 0.4, 0.75, 1],
  },
  onboarding: {
    gradient: ['#EEF1FF', '#F4F5FF', '#FFF8F4', '#FFFFFF'],
    locations: [0, 0.4, 0.75, 1],
  },
  soft: {
    gradient: ['#F8FAFC', '#FFFFFF', '#F8FAFC'],
    locations: [0, 0.55, 1],
  },
};

function resolveConfig(
  variant: ScreenBackdropVariant,
  accent?: string,
): VariantConfig {
  const base = BASE_VARIANTS[variant];
  if (!accent || variant !== 'path') {
    return base;
  }

  const top = mixWithWhite(accent, 0.92);
  const mid = mixWithWhite(accent, 0.96);
  const soft = mixWithWhite(accent, 0.98);

  return {
    gradient: [top, mid, soft, '#F8FAFC'],
    locations: [0, 0.4, 0.75, 1],
  };
}

/**
 * Clean vertical gradient shell. No ribbons, orbs, or hard color bands.
 */
export function ScreenBackdrop({
  variant = 'soft',
  accent,
  children,
}: ScreenBackdropProps) {
  const config = resolveConfig(variant, accent);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...config.gradient]}
        locations={[...config.locations]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
