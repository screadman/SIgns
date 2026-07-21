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
import { getLearningModule } from '../../constants/learning';
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
  const currentLessonIndex = module.lessons.findIndex(
    (lesson) => !completedLessonIds.includes(lesson.id),
  );
  const alphabetModule = getLearningModule('alphabet');
  const isModuleLocked =
    module.id === 'numbers' &&
    alphabetModule !== undefined &&
    !alphabetModule.lessons.every((lesson) =>
      completedLessonIds.includes(lesson.id),
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Pressable
              onPress={() => router.back()}
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
            <View style={styles.grid}>
              {module.lessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isCurrent =
                  !isModuleLocked &&
                  (currentLessonIndex === index ||
                    (currentLessonIndex === -1 &&
                      index === module.lessons.length - 1));
                const isLocked =
                  isModuleLocked || (!isCompleted && !isCurrent);

                return (
                  <Pressable
                    key={lesson.id}
                    disabled={isLocked}
                    onPress={() =>
                      router.push(`/lesson/${lesson.id}` as Href)
                    }
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isLocked }}
                    accessibilityLabel={`${lesson.title}, ${
                      isCompleted
                        ? 'completed'
                        : isCurrent
                          ? 'available'
                          : 'locked'
                    }`}
                    style={({ pressed }) => [
                      styles.bubble,
                      isCompleted && styles.completedBubble,
                      isCurrent && !isCompleted && styles.currentBubble,
                      isLocked && styles.lockedBubble,
                      pressed && !isLocked && styles.pressed,
                    ]}
                  >
                    {isLocked ? (
                      <Ionicons
                        name="lock-closed-outline"
                        size={14}
                        color={colors.textMuted}
                      />
                    ) : (
                      <>
                        <Text
                          style={[
                            styles.bubbleLabel,
                            isCompleted && styles.completedLabel,
                            isCurrent && !isCompleted && styles.currentLabel,
                          ]}
                        >
                          {lesson.sign.label}
                        </Text>
                        {isCompleted && (
                          <Ionicons
                            name="checkmark"
                            size={10}
                            color={colors.success}
                          />
                        )}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
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
  },
  loader: {
    marginTop: spacing.xl,
  },
  grid: {
    width: 288,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2sm'],
    paddingVertical: spacing.sm,
  },
  bubble: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  completedBubble: {
    backgroundColor: colors.successSurface,
  },
  currentBubble: {
    backgroundColor: colors.primary,
  },
  lockedBubble: {
    backgroundColor: colors.surfaceMuted,
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
  currentLabel: {
    color: colors.textInverse,
    fontSize: fontSize.lg,
    lineHeight: 23,
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
