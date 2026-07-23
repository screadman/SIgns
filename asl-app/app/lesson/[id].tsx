import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LearningBottomNav,
  SignCard,
} from '../../components/ui';
import { getLesson, lessonHasQuizMedia } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';
import { checkAndUnlockBadges, saveCompletedLesson } from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const lessonId = getParam(params.id);
  const lessonData = getLesson(lessonId);
  const [isSaving, setIsSaving] = useState(false);
  const [justLearned, setJustLearned] = useState(false);
  const gotItScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setJustLearned(false);
    setIsSaving(false);
    gotItScale.setValue(1);
    checkOpacity.setValue(0);
  }, [lessonId, gotItScale, checkOpacity]);

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Lesson not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { lesson, module, lessonIndex } = lessonData;
  const canQuiz = lessonHasQuizMedia(lesson);
  const previousLesson = module.lessons[lessonIndex - 1];
  const nextLesson = module.lessons[lessonIndex + 1];

  const accessibilityPrefix =
    lesson.moduleId === 'alphabet'
      ? 'ASL sign for letter'
      : lesson.moduleId === 'numbers'
        ? 'ASL sign for number'
        : 'ASL sign for';

  async function markLearned() {
    await saveCompletedLesson(lesson.id);
    await checkAndUnlockBadges();
  }

  async function goToNeighbor(targetId: string) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await markLearned();
      router.replace(`/lesson/${targetId}` as Href);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGotIt() {
    if (isSaving || justLearned) {
      return;
    }

    setIsSaving(true);

    try {
      await markLearned();
      setJustLearned(true);

      Animated.parallel([
        Animated.sequence([
          Animated.spring(gotItScale, {
            toValue: 1.12,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
          Animated.spring(gotItScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      await new Promise((resolve) => setTimeout(resolve, 650));

      if (nextLesson) {
        router.replace(`/lesson/${nextLesson.id}` as Href);
      } else {
        router.replace(`/module/${lesson.moduleId}` as Href);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Pressable
              onPress={() =>
                router.replace(`/module/${lesson.moduleId}` as Href)
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>

            <Text style={styles.title}>{module.title}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <SignCard
            sign={lesson.sign}
            accessibilityPrefix={accessibilityPrefix}
            featured
          />
        </ScrollView>

        <View style={styles.bottomPanel}>
          <View style={styles.signNav}>
            <Pressable
              disabled={!previousLesson || isSaving}
              onPress={() => {
                if (previousLesson) {
                  void goToNeighbor(previousLesson.id);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Previous sign"
              style={({ pressed }) => [
                styles.navArrow,
                (!previousLesson || isSaving) && styles.navArrowDisabled,
                pressed && previousLesson && !isSaving && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color={previousLesson ? colors.text : colors.disabled}
              />
            </Pressable>

            <View style={styles.currentSign}>
              <Text style={styles.currentSignLabel}>Current sign</Text>
              <Text style={styles.currentSignValue}>{lesson.sign.label}</Text>
            </View>

            <Pressable
              disabled={!nextLesson || isSaving}
              onPress={() => {
                if (nextLesson) {
                  void goToNeighbor(nextLesson.id);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Next sign"
              style={({ pressed }) => [
                styles.navArrow,
                (!nextLesson || isSaving) && styles.navArrowDisabled,
                pressed && nextLesson && !isSaving && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={18}
                color={nextLesson ? colors.text : colors.disabled}
              />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              disabled={!canQuiz || isSaving}
              onPress={() => {
                if (!canQuiz || isSaving) {
                  return;
                }

                void (async () => {
                  setIsSaving(true);

                  try {
                    await markLearned();
                    router.push(`/quiz/${lesson.id}` as Href);
                  } finally {
                    setIsSaving(false);
                  }
                })();
              }}
              accessibilityRole="button"
              accessibilityLabel="Optional practice"
              accessibilityState={{ disabled: !canQuiz || isSaving }}
              style={({ pressed }) => [
                styles.actionButton,
                (!canQuiz || isSaving) && styles.actionButtonDisabled,
                pressed && canQuiz && !isSaving && styles.pressed,
              ]}
            >
              <Ionicons
                name="extension-puzzle"
                size={20}
                color={canQuiz ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.actionLabel,
                  !canQuiz && styles.actionLabelDisabled,
                ]}
              >
                Practice
              </Text>
            </Pressable>

            <Animated.View style={{ transform: [{ scale: gotItScale }] }}>
              <Pressable
                disabled={isSaving || justLearned}
                onPress={() => {
                  void handleGotIt();
                }}
                accessibilityRole="button"
                accessibilityLabel="Mark as learned"
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.gotItButton,
                  justLearned && styles.gotItButtonDone,
                  pressed && !justLearned && !isSaving && styles.pressed,
                ]}
              >
                <View style={styles.gotItIconWrap}>
                  <Ionicons
                    name={justLearned ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={22}
                    color={justLearned ? colors.white : colors.success}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.gotItBurst, { opacity: checkOpacity }]}
                  />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    justLearned && styles.gotItLabelDone,
                  ]}
                >
                  {justLearned ? 'Nice!' : isSaving ? 'Saving...' : 'Got it'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </View>
      <LearningBottomNav />
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
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    lineHeight: 26,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    gap: spacing['2md'],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  bottomPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  signNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  navArrowDisabled: {
    opacity: opacity.disabled,
  },
  currentSign: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  currentSignLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 11,
    lineHeight: 13,
  },
  currentSignValue: {
    marginTop: 0,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.base,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 96,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: opacity.muted,
  },
  gotItButton: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.successSurface,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  gotItButtonDone: {
    backgroundColor: colors.success,
  },
  gotItIconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItBurst: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    opacity: 0.25,
  },
  actionLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  actionLabelDisabled: {
    color: colors.textMuted,
  },
  gotItLabelDone: {
    color: colors.white,
    fontFamily: fontFamily.bodySemibold,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing['2sm'],
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
});
