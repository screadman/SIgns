import { Ionicons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import { LEARNING_MODULES, type Lesson } from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import { getLevel } from '../../lib/levels';
import {
  calculateStreak,
  getCompletedLessons,
  getDailyChallengeProgress,
  getNextLesson,
  getTotalXP,
  type DailyChallengeProgress,
} from '../../lib/storage';

const DAILY_QUIZ_GOAL = 2;
const PREVIEW_MODULE_COUNT = 3;

type HomeData = {
  xp: number;
  streak: number;
  nextLesson: Lesson | null;
  dailyProgress: DailyChallengeProgress;
  completedLessonIds: string[];
};

function headline(streak: number, allCaughtUp: boolean): string {
  if (allCaughtUp) {
    return "You've finished every lesson! 🎉";
  }
  if (streak >= 1) {
    return 'Great streak! Keep it up! 🔥';
  }
  return 'Ready to learn today?';
}

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadHome() {
        const [xp, streak, nextLesson, dailyProgress, completedLessonIds] =
          await Promise.all([
            getTotalXP(),
            calculateStreak(),
            getNextLesson(),
            getDailyChallengeProgress(),
            getCompletedLessons(),
          ]);

        if (isActive) {
          setData({ xp, streak, nextLesson, dailyProgress, completedLessonIds });
          setIsLoading(false);
        }
      }

      void loadHome();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const previewModules = useMemo(
    () => LEARNING_MODULES.slice(0, PREVIEW_MODULE_COUNT),
    [],
  );

  const dailyGoalCount = data?.dailyProgress.quizzesFinished ?? 0;
  const dailyGoalPercent = Math.round(
    Math.min(1, dailyGoalCount / DAILY_QUIZ_GOAL) * 100,
  );

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <SkeletonLoader />
        </View>
      </SafeAreaView>
    );
  }

  const nextLessonModule = data.nextLesson
    ? LEARNING_MODULES.find((m) => m.id === data.nextLesson!.moduleId)
    : undefined;
  const nextLessonModuleCompleted = nextLessonModule
    ? nextLessonModule.lessons.filter((lesson) =>
        data.completedLessonIds.includes(lesson.id),
      ).length
    : 0;
  const nextLessonModuleProgress = nextLessonModule
    ? nextLessonModuleCompleted / nextLessonModule.lessons.length
    : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SA</Text>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={14} color={colors.accent} />
              <Text style={styles.streakPillText}>{data.streak}</Text>
            </View>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpText}>XP {data.xp}</Text>
          </View>
        </View>

        <Text style={styles.headline}>
          {headline(data.streak, data.nextLesson === null)}
        </Text>

        {data.nextLesson && nextLessonModule ? (
          <Pressable
            style={styles.continueCard}
            onPress={() =>
              router.push(`/lesson/${data.nextLesson!.id}` as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={`Continue lesson: ${data.nextLesson.title}`}
          >
            <View style={styles.continueThumb}>
              {data.nextLesson.sign.image ? (
                <Image
                  source={data.nextLesson.sign.image}
                  style={styles.continueThumbImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="hand-left-outline"
                  size={28}
                  color={colors.primary}
                />
              )}
            </View>
            <View style={styles.continueTextCol}>
              <Text style={styles.continueLabel}>CONTINUE LESSON</Text>
              <Text style={styles.continueTitle}>{data.nextLesson.title}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.trackFill,
                    { width: `${nextLessonModuleProgress * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : (
          <View style={styles.continueCardDone}>
            <Text style={styles.continueDoneText}>
              You're all caught up! Browse the dictionary to keep practicing.
            </Text>
          </View>
        )}

        <View style={styles.progressCard}>
          <View style={styles.progressRing}>
            <Text style={styles.progressRingText}>{dailyGoalPercent}%</Text>
          </View>
          <View style={styles.progressTextCol}>
            <Text style={styles.progressTitle}>Today&apos;s progress</Text>
            <Text style={styles.progressSubtitle}>
              Complete {DAILY_QUIZ_GOAL} lessons today ({dailyGoalCount}/
              {DAILY_QUIZ_GOAL} done)
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Learning Modules</Text>
        <View style={styles.moduleList}>
          {previewModules.map((module) => {
            const completedInModule = module.lessons.filter((lesson) =>
              data.completedLessonIds.includes(lesson.id),
            ).length;
            const totalInModule = module.lessons.length;
            const moduleProgress =
              totalInModule === 0 ? 0 : completedInModule / totalInModule;

            return (
              <Pressable
                key={module.id}
                style={styles.moduleRow}
                onPress={() => router.push(`/module/${module.id}` as Href)}
                accessibilityRole="button"
                accessibilityLabel={`${module.title}, ${completedInModule} of ${totalInModule} completed`}
              >
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: module.surfaceColor },
                  ]}
                >
                  <Ionicons
                    name={module.icon}
                    size={22}
                    color={module.color}
                  />
                </View>
                <View style={styles.moduleTextCol}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleSubtitle}>
                    {completedInModule} of {totalInModule} completed
                  </Text>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.trackFill,
                        { width: `${moduleProgress * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'] + PILL_TAB_BAR_HEIGHT + spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin + 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['2sm'],
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentSurface,
  },
  streakPillText: {
    color: colors.accent,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  xpPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2sm'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  xpText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  headline: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  continueThumb: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueThumbImage: {
    width: '100%',
    height: '100%',
  },
  continueTextCol: {
    flex: 1,
    gap: spacing.xs,
  },
  continueLabel: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  continueTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  continueCardDone: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primarySurface,
    padding: spacing.lg,
  },
  continueDoneText: {
    color: colors.primary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  progressRing: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  progressTextCol: {
    flex: 1,
    gap: 2,
  },
  progressTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  progressSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  moduleList: {
    gap: spacing.md,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTextCol: {
    flex: 1,
    gap: spacing.xs,
  },
  moduleTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  moduleSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  track: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  trackFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
});