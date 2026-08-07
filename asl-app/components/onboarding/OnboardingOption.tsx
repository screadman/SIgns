import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type OnboardingOptionProps = {
  label: string;
  subtitle?: string;
  icon: IoniconName;
  selected: boolean;
  onPress: () => void;
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export function OnboardingOption({
  label,
  subtitle,
  icon,
  selected,
  onPress,
}: OnboardingOptionProps) {
  const cardScale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const iconSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!selected) {
      Animated.timing(checkScale, {
        toValue: 0,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      return;
    }

    cardScale.setValue(0.96);
    checkScale.setValue(0);
    iconSpin.setValue(0);

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.sequence([
        Animated.timing(iconSpin, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]).start();
  }, [cardScale, checkScale, iconSpin, selected]);

  const iconRotate = iconSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '0deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={onPress}
          onPressIn={() => {
            Animated.spring(pressScale, {
              toValue: 0.97,
              friction: 6,
              tension: 200,
              useNativeDriver: USE_NATIVE_DRIVER,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(pressScale, {
              toValue: 1,
              friction: 5,
              tension: 180,
              useNativeDriver: USE_NATIVE_DRIVER,
            }).start();
          }}
          style={[styles.option, selected && styles.optionSelected]}
        >
          <Animated.View
            style={[
              styles.iconWrap,
              selected && styles.iconWrapSelected,
              { transform: [{ rotate: iconRotate }] },
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={selected ? colors.primary : colors.textMuted}
            />
          </Animated.View>

          <View style={styles.textWrap}>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {label}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
          </View>

          <View style={[styles.check, selected && styles.checkSelected]}>
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.textInverse}
              />
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceMuted,
  },
  iconWrapSelected: {
    backgroundColor: colors.background,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  check: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  checkSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});
