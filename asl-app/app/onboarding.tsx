import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  OnboardingDots,
  OnboardingSlide,
} from '../components/onboarding';
import { PrimaryButton } from '../components/ui';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../constants/theme';

const WELCOME_ILLUSTRATION = require('../assets/onboarding/welcome.png');
const START_ILLUSTRATION = require('../assets/onboarding/start.png');
const SLIDES = ['welcome', 'features', 'start'] as const;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const BOTTOM_CONTROLS_HEIGHT = 118;

type SlideId = (typeof SLIDES)[number];
type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Feature = {
  icon: IoniconName;
  title: string;
  subtitle: string;
  tone: 'primary' | 'accent';
};

const FEATURES: Feature[] = [
  {
    icon: 'eye-outline',
    title: 'Watch',
    subtitle: 'See signs through images',
    tone: 'primary',
  },
  {
    icon: 'hand-left-outline',
    title: 'Practice',
    subtitle: 'Test your knowledge with quizzes',
    tone: 'accent',
  },
  {
    icon: 'trophy-outline',
    title: 'Earn',
    subtitle: 'Unlock badges and level up',
    tone: 'primary',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<SlideId>>(null);
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const finishOnboarding = () => {
    if (isFinishing) {
      return;
    }

    setIsFinishing(true);

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      setIsFinishing(false);
      router.replace('/onboarding-ready');
    });
  };

  const updateActiveIndex = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(nextIndex, SLIDES.length - 1)));
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const goToNextSlide = () => {
    if (isLastSlide) {
      finishOnboarding();
      return;
    }

    const nextIndex = Math.min(activeIndex + 1, SLIDES.length - 1);
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View
          style={styles.carouselArea}
          onLayout={(event) => {
            const nextHeight = Math.floor(event.nativeEvent.layout.height);

            if (nextHeight > 0 && nextHeight !== pageHeight) {
              setPageHeight(nextHeight);
            }
          }}
        >
          {pageHeight > 0 ? (
            <FlatList
              ref={listRef}
              style={styles.carousel}
              data={SLIDES}
              extraData={activeIndex}
              keyExtractor={(item) => item}
              horizontal
              pagingEnabled
              bounces
              decelerationRate="fast"
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onScroll={updateActiveIndex}
              onMomentumScrollEnd={updateActiveIndex}
              renderItem={({ item, index }) => {
                if (item === 'welcome') {
                  return (
                    <OnboardingSlide
                      badge="👋 SIGNS"
                      title="Learn Sign Language"
                      subtitle="Accessible, fun and progressive"
                      illustration={WELCOME_ILLUSTRATION}
                      width={width}
                      height={pageHeight}
                      active={activeIndex === index}
                    />
                  );
                }

                if (item === 'features') {
                  return (
                    <FeaturesSlide
                      width={width}
                      height={pageHeight}
                      active={activeIndex === index}
                    />
                  );
                }

                return (
                  <OnboardingSlide
                    badge="🎉 LET'S GO"
                    badgeTone="accent"
                    animateBadge
                    title="Ready to Start?"
                    subtitle="A few quick questions, then you are in."
                    illustration={START_ILLUSTRATION}
                    width={width}
                    height={pageHeight}
                    active={activeIndex === index}
                  />
                );
              }}
            />
          ) : null}
        </View>

        <View style={styles.bottomControls}>
          <OnboardingDots total={SLIDES.length} activeIndex={activeIndex} />
          <PrimaryButton
            title={isLastSlide ? 'Get Started' : 'Next'}
            fullWidth
            compact
            loading={isFinishing}
            onPress={goToNextSlide}
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

function FeaturesSlide({
  width,
  height,
  active,
}: {
  width: number;
  height: number;
  active: boolean;
}) {
  const animationValues = useRef(
    FEATURES.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    animationValues.forEach((value) => value.setValue(0));

    if (!active) {
      return;
    }

    const animation = Animated.stagger(
      100,
      animationValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ),
    );

    animation.start();

    return () => animation.stop();
  }, [active, animationValues]);

  return (
    <View style={[styles.featuresSlide, { width, height }]}>
      <View style={styles.featuresContent}>
        <View style={styles.titleGroup}>
          <Text style={styles.featuresTitle}>How It Works</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.featuresList}>
          {FEATURES.map((feature, index) => {
            const isAccent = feature.tone === 'accent';
            const toneColor = isAccent ? colors.accent : colors.primary;
            const toneSurface = isAccent
              ? colors.accentSurface
              : colors.primarySurface;

            return (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureItem,
                  { borderColor: toneSurface },
                  {
                    opacity: animationValues[index],
                    transform: [
                      {
                        translateY: animationValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [16, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: toneSurface },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={28}
                    color={toneColor}
                  />
                </View>

                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>
                    {feature.subtitle}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carouselArea: {
    flex: 1,
    overflow: 'hidden',
  },
  carousel: {
    flex: 1,
  },
  bottomControls: {
    height: BOTTOM_CONTROLS_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 20,
    elevation: 20,
  },
  featuresSlide: {
    overflow: 'hidden',
    justifyContent: 'flex-start',
    backgroundColor: colors.background,
  },
  featuresContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  titleGroup: {
    gap: spacing.sm,
  },
  featuresTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 28,
    lineHeight: 35,
  },
  titleUnderline: {
    width: 48,
    height: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  featuresList: {
    gap: spacing['2md'],
  },
  featureItem: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: borderWidth.thin,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  featureIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  featureText: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  featureSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.xs,
  },

});

