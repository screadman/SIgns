import type { ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
} from '../../constants/theme';

type OnboardingSlideProps = {
  title: string;
  subtitle: string;
  illustration: ReactNode;
  width: number;
  animatedStyle?: StyleProp<ViewStyle>;
};

export function OnboardingSlide({
  title,
  subtitle,
  illustration,
  width,
  animatedStyle,
}: OnboardingSlideProps) {
  return (
    <Animated.View
      style={[styles.container, { width }, animatedStyle]}
      accessibilityRole="summary"
    >
      <View style={styles.illustration}>{illustration}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight['3xl'],
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
