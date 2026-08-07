import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/ui';
import {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../constants/theme';

const INTRO_ILLUSTRATION = require('../assets/onboarding/questions-ready.png');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function OnboardingReadyScreen() {
  const router = useRouter();
  const illustrationOpacity = useRef(new Animated.Value(0)).current;
  const illustrationScale = useRef(new Animated.Value(0.86)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(10)).current;
  const titleScale = useRef(new Animated.Value(0.96)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(14)).current;
  const buttonScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(illustrationOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(illustrationScale, {
        toValue: 1,
        friction: 6,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 200,
        delay: 40,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(titleY, {
        toValue: 0,
        delay: 40,
        friction: 7,
        tension: 170,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        delay: 40,
        friction: 6,
        tension: 190,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 180,
        delay: 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(subtitleY, {
        toValue: 0,
        delay: 70,
        friction: 7,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 180,
        delay: 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(buttonY, {
        toValue: 0,
        delay: 90,
        friction: 6,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        delay: 90,
        friction: 6,
        tension: 200,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    floatLoop.start();

    return () => floatLoop.stop();
  }, [
    buttonOpacity,
    buttonScale,
    buttonY,
    floatY,
    illustrationOpacity,
    illustrationScale,
    subtitleOpacity,
    subtitleY,
    titleOpacity,
    titleScale,
    titleY,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <Animated.View
            style={{
              opacity: illustrationOpacity,
              transform: [
                { translateY: floatY },
                { scale: illustrationScale },
              ],
            }}
          >
            <Image
              source={INTRO_ILLUSTRATION}
              style={styles.illustration}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>

          <Animated.Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [
                  { translateY: titleY },
                  { scale: titleScale },
                ],
              },
            ]}
          >
            Just a few quick questions before we start your first lesson!
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleY }],
              },
            ]}
          >
            This helps us personalize your practice path.
          </Animated.Text>
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: buttonOpacity,
              transform: [
                { translateY: buttonY },
                { scale: buttonScale },
              ],
            },
          ]}
        >
          <PrimaryButton
            title="Continue"
            fullWidth
            compact
            onPress={() => {
              router.replace('/onboarding-setup');
            }}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  footer: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
