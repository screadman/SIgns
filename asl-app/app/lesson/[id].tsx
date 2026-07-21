import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, ProgressBar, SignCard } from '../../components/ui';
import { getLesson } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';
import { getCompletedLessons } from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const lessonData = getLesson(getParam(params.id));
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        try {
          const completedLessons = await getCompletedLessons();

          if (isActive) {
            setCompletedLessonIds(completedLessons);
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
          }
        }
      }

      void loadProgress();

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Lesson not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { lesson, module, lessonIndex } = lessonData;
  const completedCount = module.lessons.filter((moduleLesson) =>
    completedLessonIds.includes(moduleLesson.id),
  ).length;
  const moduleProgress = completedCount / module.lessons.length;
  const isCompleted = completedLessonIds.includes(lesson.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navigationRow}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.navigationHeading}>
            <Text style={styles.navigationTitle}>{lesson.title}</Text>
            <Text style={styles.navigationMeta}>
              Lesson {lessonIndex + 1} of {module.lessons.length}
            </Text>
          </View>

          <View style={styles.completionIcon}>
            {isCompleted && (
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={colors.success}
              />
            )}
          </View>
        </View>

        <ProgressBar
          progress={moduleProgress}
          color={module.color}
          trackColor={module.surfaceColor}
          style={styles.headerProgress}
        />

        <SignCard
          sign={lesson.sign}
          accessibilityPrefix={
            lesson.moduleId === 'alphabet'
              ? 'ASL sign for letter'
              : 'ASL sign for number'
          }
          featured
        />

        <View style={styles.tipCard}>
          <View
            style={[styles.tipIcon, { backgroundColor: module.surfaceColor }]}
          >
            <Ionicons name="hand-left-outline" size={24} color={module.color} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>How to sign</Text>
            <Text style={styles.tipText}>{lesson.sign.tip}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Practice"
            onPress={() =>
              router.push(`/quiz/${lesson.id}` as Href)
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['2md'],
    paddingBottom: spacing['2xl'],
  },
  navigationRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  navigationHeading: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  navigationTitle: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  navigationMeta: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  completionIcon: {
    width: 40,
    alignItems: 'center',
  },
  headerProgress: {
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  tipIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  tipContent: {
    flex: 1,
    marginLeft: spacing['2sm'],
  },
  tipTitle: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  tipText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    marginTop: spacing.md,
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
