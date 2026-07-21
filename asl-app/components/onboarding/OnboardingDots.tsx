import { StyleSheet, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../constants/theme';

type OnboardingDotsProps = {
  count: number;
  activeIndex: number;
};

export function OnboardingDots({
  count,
  activeIndex,
}: OnboardingDotsProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: count, now: activeIndex + 1 }}
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <View
            key={index}
            style={[styles.dot, isActive && styles.activeDot]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.disabled,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
});
