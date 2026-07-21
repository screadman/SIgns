import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { borderRadius, colors, spacing } from '../../constants/theme';

type OnboardingDotsProps = {
  total: number;
  activeIndex: number;
};

export function OnboardingDots({
  total,
  activeIndex,
}: OnboardingDotsProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: activeIndex + 1 }}
    >
      {Array.from({ length: total }, (_, index) => (
        <Dot key={index} active={index === activeIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 24],
          }),
          backgroundColor: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.disabled, colors.primary],
          }),
        },
      ]}
    />
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
    height: 8,
    borderRadius: borderRadius.full,
  },
});
