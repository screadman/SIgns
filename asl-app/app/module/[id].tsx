import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningBottomNav } from '../../components/ui';
import {
  getFirstPracticeLesson,
  getLearningModule,
  lessonHasQuizMedia,
} from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';
import { getCompletedLessons } from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function ModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const module = getLearningModule(getParam(params.id));
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        setIsLoading(true);

        try {
          const completedLessons = await getCompletedLessons();

          if (isActive) {
            setCompletedLessonIds(completedLessons);
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadProgress();

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (!module) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Module not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = module.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;
  const practiceLesson = getFirstPracticeLesson(module);
  const canPractice =
    practiceLesson !== null && lessonHasQuizMedia(practiceLesson);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Pressable
              onPress={() => {
                if (router.canDismiss()) {
                  router.dismiss();
                  return;
                }

                if (router.canGoBack()) {
                  router.back();
                  return;
                }

                router.replace('/(tabs)/learn' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>{module.title}</Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {completedCount}/{module.lessons.length}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color={colors.primary}
            />
          ) : (
            <>
              <Pressable
                disabled={!canPractice}
                onPress={() => {
                  if (!practiceLesson || !canPractice) {
                    return;
                  }

                  router.push(`/quiz/${practiceLesson.id}` as Href);
                }}
                accessibilityRole="button"
                accessibilityLabel="Start optional practice"
                accessibilityState={{ disabled: !canPractice }}
                style={({ pressed }) => [
                  styles.practiceCard,
                  !canPractice && styles.practiceCardDisabled,
                  pressed && canPractice && styles.pressed,
                ]}
              >
                <View style={styles.practiceCopy}>
                  <Text
                    style={[
                      styles.practiceEyebrow,
                      !canPractice && styles.practiceTextDisabled,
                    ]}
                  >
                    Let&apos;s put it into practice
                  </Text>
                  <Text
                    style={[
                      styles.practiceTitle,
                      !canPractice && styles.practiceTextDisabled,
                    ]}
                  >
                    {canPractice ? 'Ready, set, go' : 'Practice coming soon'}
                  </Text>
                </View>
                <View style={styles.practiceIconWrap}>
                  <Ionicons
                    name="extension-puzzle"
                    size={28}
                    color={canPractice ? colors.white : colors.textMuted}
                  />
                </View>
              </Pressable>

              <Text style={styles.sectionTitle}>Signs in collection</Text>

              {module.listLayout ? (
                <View style={styles.signList}>
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <Pressable
                        key={lesson.id}
                        onPress={() =>
                          router.push(`/lesson/${lesson.id}` as Href)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${lesson.title}${
                          isCompleted ? ', completed' : ''
                        }`}
                        style={({ pressed }) => [
                          styles.signRow,
                          isCompleted && styles.completedSignRow,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.signRowLabel,
                            isCompleted && styles.completedLabel,
                          ]}
                        >
                          {lesson.sign.label}
                        </Text>
                        {isCompleted ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={colors.success}
                          />
                        ) : (
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.textMuted}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.grid}>
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <Pressable
                        key={lesson.id}
                        onPress={() =>
                          router.push(`/lesson/${lesson.id}` as Href)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${lesson.title}${
                          isCompleted ? ', completed' : ''
                        }`}
                        style={({ pressed }) => [
                          styles.bubble,
                          isCompleted
                            ? styles.completedBubble
                            : styles.openBubble,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bubbleLabel,
                            isCompleted && styles.completedLabel,
                          ]}
                        >
                          {lesson.sign.label}
                        </Text>
                        {isCompleted ? (
                          <Ionicons
                            name="checkmark"
                            size={10}
                            color={colors.success}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
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
    height: 60,
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
    fontSize: fontSize['2xl'],
    lineHeight: 30,
  },
  progressBadge: {
    paddingHorizontal: spacing['2sm'],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  progressBadgeText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  loader: {
    marginTop: spacing.xl,
  },
  practiceCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
  },
  practiceCardDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  practiceCopy: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4,
  },
  practiceEyebrow: {
    color: colors.white,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  practiceTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    lineHeight: 26,
  },
  practiceTextDisabled: {
    color: colors.textMuted,
  },
  practiceIconWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  sectionTitle: {
    marginBottom: spacing['2sm'],
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  grid: {
    width: 288,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2sm'],
    paddingVertical: spacing.sm,
  },
  signList: {
    width: '100%',
  },
  signRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['2sm'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  completedSignRow: {
    borderBottomColor: colors.border,
  },
  signRowLabel: {
    flex: 1,
    marginRight: spacing.sm,
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  bubble: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  openBubble: {
    backgroundColor: colors.primarySurface,
  },
  completedBubble: {
    backgroundColor: colors.successSurface,
  },
  bubbleLabel: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  completedLabel: {
    color: colors.success,
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
