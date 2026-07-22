import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type OnboardingSlideProps = {
  badge: string;
  badgeTone?: 'primary' | 'accent';
  title: string;
  subtitle: string;
  illustration: ImageSourcePropType;
  width: number;
  height: number;
  active: boolean;
  animateBadge?: boolean;
  footer?: ReactNode;
};

export function OnboardingSlide({
  badge,
  badgeTone = 'primary',
  title,
  subtitle,
  illustration,
  width,
  height,
  active,
  animateBadge = false,
  footer,
}: OnboardingSlideProps) {
  const illustrationProgress = useRef(new Animated.Value(0)).current;
  const badgeProgress = useRef(
    new Animated.Value(animateBadge ? 0 : 1),
  ).current;
  const illustrationSize = Math.min(240, Math.max(180, width - spacing['3xl']));

  useEffect(() => {
    if (!active) {
      illustrationProgress.setValue(0);

      if (animateBadge) {
        badgeProgress.setValue(0);
      }

      return;
    }

    Animated.timing(illustrationProgress, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    if (animateBadge) {
      Animated.spring(badgeProgress, {
        toValue: 1,
        damping: 8,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }, [
    active,
    animateBadge,
    badgeProgress,
    illustrationProgress,
  ]);

  const badgeColors =
    badgeTone === 'accent'
      ? {
          backgroundColor: colors.accentSurface,
          color: colors.accent,
        }
      : {
          backgroundColor: colors.primarySurface,
          color: colors.primary,
        };

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: badgeColors.backgroundColor },
            animateBadge && {
              transform: [
                {
                  scale: badgeProgress.interpolate({
                    inputRange: [0, 0.75, 1],
                    outputRange: [0, 1.1, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: badgeColors.color }]}>
            {badge}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.illustration,
            {
              width: illustrationSize,
              height: illustrationSize,
              opacity: illustrationProgress,
              transform: [
                {
                  scale: illustrationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={illustration}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  badge: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  illustration: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  footer: {
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
