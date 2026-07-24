import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingOption, StreakCommit } from '../components/onboarding';
import type { PracticeDayIndex } from '../components/onboarding';
import { PrimaryButton } from '../components/ui';
import {
  DAILY_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  NOTIFICATION_OPTIONS,
  SETUP_FLOW,
  formatLearnerName,
  getChoiceCopy,
  getReactionCopy,
  type ReactionTextPart,
} from '../constants/onboardingQuestions';
import {
  borderRadius,
  borderWidth,
  colors,
  controlHeight,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../constants/theme';
import type {
  DailyGoalMinutes,
  ExperienceLevel,
  LearningGoal,
} from '../lib/onboardingStorage';
import { saveOnboardingProfile } from '../lib/onboardingStorage';
import { startStreakToday } from '../lib/storage';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function SpringIn({
  delay,
  children,
  animKey,
  direction,
}: {
  delay: number;
  children: ReactNode;
  animKey: string | number;
  direction: 1 | -1;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const translateX = useRef(new Animated.Value(22 * direction)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(18);
    translateX.setValue(22 * direction);
    scale.setValue(0.92);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 110,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    ]);

    animation.start();

    return () => animation.stop();
  }, [animKey, delay, direction, opacity, scale, translateX, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function HighlightedText({
  parts,
  baseStyle,
  accentStyle,
  primaryStyle,
}: {
  parts: ReactionTextPart[];
  baseStyle: object;
  accentStyle: object;
  primaryStyle: object;
}) {
  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => (
        <Text
          key={`${part.text}-${index}`}
          style={
            part.tone === 'accent'
              ? accentStyle
              : part.tone === 'primary'
                ? primaryStyle
                : undefined
          }
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

export default function OnboardingSetupScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<DailyGoalMinutes | null>(
    null,
  );
  const [notificationsOptIn, setNotificationsOptIn] = useState<
    boolean | null
  >(null);
  const [practiceDays, setPracticeDays] = useState<PracticeDayIndex[]>(() => {
    const jsDay = new Date().getDay();
    const today = (jsDay === 0 ? 6 : jsDay - 1) as PracticeDayIndex;
    return [today];
  });
  const [isSaving, setIsSaving] = useState(false);

  const progressAnim = useRef(new Animated.Value(1 / SETUP_FLOW.length)).current;
  const panelX = useRef(new Animated.Value(0)).current;
  const panelOpacity = useRef(new Animated.Value(1)).current;
  const continueScale = useRef(new Animated.Value(1)).current;
  const continueGlow = useRef(new Animated.Value(0)).current;
  const highlightScale = useRef(new Animated.Value(0.7)).current;
  const eyebrowScale = useRef(new Animated.Value(0.6)).current;
  const eyebrowRotate = useRef(new Animated.Value(-8)).current;

  const step = SETUP_FLOW[stepIndex];
  const isLastStep = stepIndex === SETUP_FLOW.length - 1;
  const progressRatio = (stepIndex + 1) / SETUP_FLOW.length;
  const trimmedName = name.trim();
  const displayName = formatLearnerName(trimmedName);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressRatio,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, progressRatio]);

  useEffect(() => {
    if (step.kind !== 'react') {
      return;
    }

    highlightScale.setValue(0.7);
    eyebrowScale.setValue(0.6);
    eyebrowRotate.setValue(-8);

    Animated.parallel([
      Animated.spring(highlightScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.sequence([
        Animated.spring(eyebrowScale, {
          toValue: 1.08,
          friction: 4,
          tension: 160,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(eyebrowScale, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      Animated.spring(eyebrowRotate, {
        toValue: 0,
        friction: 5,
        tension: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [
    eyebrowRotate,
    eyebrowScale,
    highlightScale,
    step.id,
    step.kind,
  ]);

  const canContinue = useMemo(() => {
    if (step.kind === 'react') {
      return true;
    }

    if (step.kind === 'streak-commit') {
      return practiceDays.length > 0;
    }

    if (step.id === 'name') {
      return trimmedName.length >= 2;
    }

    if (step.id === 'experience') return experience !== null;
    if (step.id === 'goal') return goal !== null;
    if (step.id === 'daily') return dailyMinutes !== null;
    if (step.id === 'notifications') return notificationsOptIn !== null;
    return false;
  }, [
    dailyMinutes,
    experience,
    goal,
    notificationsOptIn,
    practiceDays.length,
    step.id,
    step.kind,
    trimmedName.length,
  ]);

  useEffect(() => {
    if (!canContinue) {
      continueGlow.setValue(0);
      continueScale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.sequence([
        Animated.timing(continueScale, {
          toValue: 1.04,
          duration: 160,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(continueScale, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      Animated.timing(continueGlow, {
        toValue: 1,
        duration: 220,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, [canContinue, continueGlow, continueScale, step.id]);

  const goHome = () => {
    router.replace('/(tabs)/home');
  };

  const finishSetup = async () => {
    if (
      trimmedName.length < 2 ||
      experience === null ||
      goal === null ||
      dailyMinutes === null ||
      notificationsOptIn === null
    ) {
      return;
    }

    setIsSaving(true);

    try {
      await saveOnboardingProfile({
        name: displayName,
        experience,
        goal,
        dailyMinutes,
        notificationsOptIn,
        practiceDays: [...practiceDays].sort((a, b) => a - b),
      });
      await startStreakToday();
      goHome();
    } catch {
      setIsSaving(false);
    }
  };

  const animateStepChange = (nextIndex: number, nextDirection: 1 | -1) => {
    setDirection(nextDirection);

    Animated.parallel([
      Animated.timing(panelX, {
        toValue: -nextDirection * Math.min(width * 0.2, 72),
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(panelOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      setStepIndex(nextIndex);
      panelX.setValue(nextDirection * Math.min(width * 0.2, 72));
      panelOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(panelX, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(panelOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    });
  };

  const goNext = () => {
    if (!canContinue || isSaving) {
      return;
    }

    if (isLastStep) {
      void finishSetup();
      return;
    }

    animateStepChange(Math.min(stepIndex + 1, SETUP_FLOW.length - 1), 1);
  };

  const goBack = () => {
    if (stepIndex === 0 || isSaving) {
      return;
    }

    animateStepChange(Math.max(stepIndex - 1, 0), -1);
  };

  const choiceCopy = getChoiceCopy(step.id, trimmedName || 'friend');
  const reaction = getReactionCopy({
    stepId: step.id,
    name: trimmedName || 'friend',
    experience,
    goal,
    dailyMinutes,
  });

  const choiceOptions =
    step.id === 'experience'
      ? EXPERIENCE_OPTIONS.map((option) => (
          <OnboardingOption
            key={option.id}
            icon={option.icon}
            label={option.label}
            subtitle={option.subtitle}
            selected={experience === option.id}
            onPress={() => setExperience(option.id)}
          />
        ))
      : step.id === 'goal'
        ? GOAL_OPTIONS.map((option) => (
            <OnboardingOption
              key={option.id}
              icon={option.icon}
              label={option.label}
              selected={goal === option.id}
              onPress={() => setGoal(option.id)}
            />
          ))
        : step.id === 'daily'
          ? DAILY_GOAL_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.id}
                icon={option.icon}
                label={option.label}
                subtitle={option.subtitle}
                selected={dailyMinutes === option.id}
                onPress={() => setDailyMinutes(option.id)}
              />
            ))
          : step.id === 'notifications'
            ? NOTIFICATION_OPTIONS.map((option) => (
                <OnboardingOption
                  key={option.id}
                  icon={option.icon}
                  label={option.label}
                  subtitle={option.subtitle}
                  selected={
                    notificationsOptIn === null
                      ? false
                      : option.id === 'yes'
                        ? notificationsOptIn
                        : !notificationsOptIn
                  }
                  onPress={() => setNotificationsOptIn(option.id === 'yes')}
                />
              ))
            : [];

  const continueLabel =
    step.kind === 'streak-commit' || isLastStep
      ? 'Start learning'
      : 'Continue';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {stepIndex > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            disabled={isSaving}
            onPress={goBack}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Animated.View
          style={[
            styles.centeredBlock,
            {
              opacity: panelOpacity,
              transform: [{ translateX: panelX }],
            },
          ]}
        >
          {step.kind === 'name' ? (
            <>
              <SpringIn animKey="name-title" delay={40} direction={direction}>
                <View style={styles.titleGroup}>
                  <Text style={styles.title}>What should we call you?</Text>
                  <Text style={styles.subtitle}>
                    We will use your name to personalize the journey.
                  </Text>
                </View>
              </SpringIn>

              <SpringIn animKey="name-input" delay={120} direction={direction}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your first name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={24}
                  returnKeyType="done"
                  onSubmitEditing={goNext}
                  style={styles.nameInput}
                />
              </SpringIn>
            </>
          ) : null}

          {step.kind === 'choice' ? (
            <>
              <SpringIn
                animKey={`${step.id}-title`}
                delay={40}
                direction={direction}
              >
                <View style={styles.titleGroup}>
                  <Text style={styles.title}>{choiceCopy.title}</Text>
                  <Text style={styles.subtitle}>{choiceCopy.subtitle}</Text>
                </View>
              </SpringIn>

              <View style={styles.options}>
                {choiceOptions.map((optionNode, index) => (
                  <SpringIn
                    key={`${step.id}-${index}`}
                    animKey={`${step.id}-${index}`}
                    delay={90 + index * 75}
                    direction={direction}
                  >
                    {optionNode}
                  </SpringIn>
                ))}
              </View>
            </>
          ) : null}

          {step.kind === 'react' ? (
            <View style={styles.reactBlock}>
              <SpringIn
                animKey={`${step.id}-eyebrow`}
                delay={20}
                direction={direction}
              >
                <Animated.View
                  style={[
                    styles.reactEyebrowPill,
                    {
                      transform: [
                        { scale: eyebrowScale },
                        {
                          rotate: eyebrowRotate.interpolate({
                            inputRange: [-8, 0],
                            outputRange: ['-8deg', '0deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={reaction.eyebrowIcon}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.reactEyebrow}>{reaction.eyebrow}</Text>
                </Animated.View>
              </SpringIn>

              {reaction.highlight ? (
                <SpringIn
                  animKey={`${step.id}-highlight`}
                  delay={60}
                  direction={direction}
                >
                  <Animated.Text
                    style={[
                      styles.reactHighlight,
                      { transform: [{ scale: highlightScale }] },
                    ]}
                  >
                    {reaction.highlight}
                  </Animated.Text>
                </SpringIn>
              ) : null}

              <SpringIn
                animKey={`${step.id}-title`}
                delay={110}
                direction={direction}
              >
                <HighlightedText
                  parts={reaction.titleParts}
                  baseStyle={styles.reactTitle}
                  accentStyle={styles.reactTitleAccent}
                  primaryStyle={styles.reactTitlePrimary}
                />
              </SpringIn>

              <SpringIn
                animKey={`${step.id}-subtitle`}
                delay={170}
                direction={direction}
              >
                <HighlightedText
                  parts={reaction.subtitleParts}
                  baseStyle={styles.reactSubtitle}
                  accentStyle={styles.reactSubtitleAccent}
                  primaryStyle={styles.reactSubtitlePrimary}
                />
              </SpringIn>
            </View>
          ) : null}
          {step.kind === 'streak-commit' ? (
            <SpringIn
              animKey="streak-commit"
              delay={30}
              direction={direction}
            >
              <StreakCommit
                selectedDays={practiceDays}
                onToggleDay={(day) => {
                  setPracticeDays((current) => {
                    if (current.includes(day)) {
                      if (current.length === 1) {
                        return current;
                      }
                      return current.filter((item) => item !== day);
                    }
                    return [...current, day].sort((a, b) => a - b);
                  });
                }}
              />
            </SpringIn>
          ) : null}
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: continueGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [0.72, 1],
            }),
            transform: [{ scale: continueScale }],
          },
        ]}
      >
        <PrimaryButton
          title={continueLabel}
          fullWidth
          compact
          disabled={!canContinue}
          loading={isSaving}
          onPress={goNext}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 56,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 14,
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  centeredBlock: {
    gap: spacing.xl,
    paddingBottom: spacing.md,
  },
  titleGroup: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  nameInput: {
    width: '100%',
    minHeight: controlHeight.lg + spacing.sm,
    borderWidth: borderWidth.thick,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    backgroundColor: colors.primarySurface,
  },
  options: {
    gap: spacing.sm,
  },
  reactBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  reactEyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  reactEyebrow: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  reactHighlight: {
    color: colors.accent,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 72,
    lineHeight: 78,
  },
  reactTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  reactTitleAccent: {
    color: colors.accent,
    fontFamily: fontFamily.headingExtraBold,
  },
  reactTitlePrimary: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
  },
  reactSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  reactSubtitleAccent: {
    color: colors.accent,
    fontFamily: fontFamily.bodySemibold,
  },
  reactSubtitlePrimary: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
  footer: {
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
