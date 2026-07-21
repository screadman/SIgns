import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  OnboardingDots,
  OnboardingSlide,
} from '../components/onboarding';
import {
  borderRadius,
  colors,
  controlHeight,
  fontSize,
  fontWeight,
  iconSize,
  opacity as opacityTokens,
  spacing,
} from '../constants/theme';
import { markOnboardingAsSeen } from '../lib/onboardingStorage';

type OnboardingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const SLIDES: OnboardingItem[] = [
  {
    id: 'learn',
    title: 'Apprenez la langue des signes',
    subtitle: 'Découvrez l’alphabet ASL et enrichissez votre vocabulaire à votre rythme.',
    icon: 'hand-left-outline',
  },
  {
    id: 'practice',
    title: 'Entraînez-vous simplement',
    subtitle: 'Parcourez des leçons courtes pour mémoriser chaque signe progressivement.',
    icon: 'school-outline',
  },
  {
    id: 'progress',
    title: 'Progressez chaque jour',
    subtitle: 'Développez vos connaissances et suivez votre apprentissage au quotidien.',
    icon: 'trending-up-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const finishOnboarding = async () => {
    if (isFinishing) {
      return;
    }

    setIsFinishing(true);

    try {
      await markOnboardingAsSeen();
    } finally {
      router.replace('/(tabs)/home');
    }
  };

  const goToNextSlide = () => {
    const nextIndex = activeIndex + 1;

    if (nextIndex >= SLIDES.length) {
      void finishOnboarding();
      return;
    }

    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const updateActiveIndex = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(nextIndex, SLIDES.length - 1)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Passer l’introduction"
          hitSlop={12}
          onPress={() => void finishOnboarding()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={updateActiveIndex}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const animatedStyle = {
            opacity: scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: scrollX.interpolate({
                  inputRange,
                  outputRange: [20, 0, 20],
                  extrapolate: 'clamp',
                }),
              },
              {
                scale: scrollX.interpolate({
                  inputRange,
                  outputRange: [0.94, 1, 0.94],
                  extrapolate: 'clamp',
                }),
              },
            ],
          };

          return (
            <OnboardingSlide
              title={item.title}
              subtitle={item.subtitle}
              width={width}
              animatedStyle={animatedStyle}
              illustration={
                <View style={styles.illustrationPlaceholder}>
                  <Ionicons
                    name={item.icon}
                    size={iconSize.xl * 3}
                    color={colors.primary}
                  />
                </View>
              }
            />
          );
        }}
      />

      <View style={styles.footer}>
        <OnboardingDots
          count={SLIDES.length}
          activeIndex={activeIndex}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isFinishing}
          onPress={goToNextSlide}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            isFinishing && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {activeIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: controlHeight.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  illustrationPlaceholder: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  button: {
    minHeight: controlHeight.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  pressed: {
    opacity: opacityTokens.pressed,
  },
  disabled: {
    opacity: opacityTokens.disabled,
  },
});
