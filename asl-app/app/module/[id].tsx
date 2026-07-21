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

import { ProgressBar } from '../../components/ui';
import { getLearningModule } from '../../constants/learning';
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
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
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
  const progress =
    module.lessons.length === 0 ? 0 : completedCount / module.lessons.length;

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
          <Text style={styles.navigationTitle}>Module</Text>
          <View style={styles.navigationSpacer} />
        </View>

        <View style={styles.moduleHeader}>
          <View
            style={[styles.moduleIcon, { backgroundColor: module.surfaceColor }]}
          >
            <Ionicons name={module.icon} size={32} color={module.color} />
          </View>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.description}>{module.description}</Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {completedCount} of {module.lessons.length} completed
            </Text>
            <Text style={[styles.progressValue, { color: module.color }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color={module.color}
            trackColor={module.surfaceColor}
          />
        </View>

        <Text style={styles.sectionTitle}>Lessons</Text>

        {isLoading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={module.color}
          />
        ) : (
          <View style={styles.lessonList}>
            {module.lessons.map((lesson, index) => {
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
                    styles.lessonCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.lessonNumber,
                      {
                        backgroundColor: isCompleted
                          ? module.color
                          : module.surfaceColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lessonNumberText,
                        { color: isCompleted ? colors.white : module.color },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDescription} numberOfLines={1}>
                      {lesson.sign.description}
                    </Text>
                  </View>

                  <Ionicons
                    name={isCompleted ? 'checkmark-circle' : 'play-circle-outline'}
                    size={26}
                    color={isCompleted ? colors.success : module.color}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  navigationTitle: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
  navigationSpacer: {
    width: 40,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  moduleHeader: {
    alignItems: 'center',
    padding: spacing['2md'],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  progressValue: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing['2sm'],
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  lessonList: {
    gap: spacing.sm,
  },
  lessonCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['2sm'],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  lessonNumber: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  lessonNumberText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  lessonContent: {
    flex: 1,
    marginHorizontal: spacing['2sm'],
  },
  lessonTitle: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  lessonDescription: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
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
