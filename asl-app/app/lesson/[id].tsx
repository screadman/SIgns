import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { saveCompletedLesson } from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const lessonData = getLesson(getParam(params.id));
  const [isSaving, setIsSaving] = useState(false);

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
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await saveCompletedLesson(lesson.id);
    } finally {
      setIsSaving(false);
    }
  }

  async function goToNeighbor(targetId: string) {
    await markLearned();
    router.replace(`/lesson/${targetId}` as Href);
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
              disabled={!previousLesson}
              onPress={() => {
                if (previousLesson) {
                  void goToNeighbor(previousLesson.id);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Previous sign"
              style={({ pressed }) => [
                styles.navArrow,
                !previousLesson && styles.navArrowDisabled,
                pressed && previousLesson && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={previousLesson ? colors.text : colors.disabled}
              />
            </Pressable>

            <View style={styles.currentSign}>
              <Text style={styles.currentSignLabel}>Current sign</Text>
              <Text style={styles.currentSignValue}>{lesson.sign.label}</Text>
            </View>

            <Pressable
              disabled={!nextLesson}
              onPress={() => {
                if (nextLesson) {
                  void goToNeighbor(nextLesson.id);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Next sign"
              style={({ pressed }) => [
                styles.navArrow,
                !nextLesson && styles.navArrowDisabled,
                pressed && nextLesson && styles.pressed,
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={20}
                color={nextLesson ? colors.text : colors.disabled}
              />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              disabled={!canQuiz}
              onPress={() => {
                if (!canQuiz) {
                  return;
                }

                void markLearned().then(() => {
                  router.push(`/quiz/${lesson.id}` as Href);
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Optional practice"
              accessibilityState={{ disabled: !canQuiz }}
              style={({ pressed }) => [
                styles.actionButton,
                !canQuiz && styles.actionButtonDisabled,
                pressed && canQuiz && styles.pressed,
              ]}
            >
              <Ionicons
                name="flash"
                size={26}
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

            <Pressable
              onPress={() => {
                void markLearned();
              }}
              accessibilityRole="button"
              accessibilityLabel="Mark as learned"
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={26}
                color={colors.success}
              />
              <Text style={styles.actionLabel}>
                {isSaving ? 'Saving...' : 'Got it'}
              </Text>
            </Pressable>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.md,
  },
  signNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrow: {
    width: 44,
    height: 44,
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
    fontSize: fontSize.xs,
    lineHeight: 15,
  },
  currentSignValue: {
    marginTop: 2,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 96,
    paddingVertical: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: opacity.muted,
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
