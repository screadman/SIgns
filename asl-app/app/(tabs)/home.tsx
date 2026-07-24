import { Ionicons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleCard, SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import {
  LEARNING_MODULES,
  getLearningModule,
  type Lesson,
} from '../../constants/learning';
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
const PREVIEW_MODULE_COUNT = 4;

type HomeData = {
  xp: number;
  streak: number;
  nextLesson: Lesson | null;
  dailyProgress: DailyChallengeProgress;
  completedLessonIds: string[];
};

function motivationalMessage(streak: number, allCaughtUp: boolean): string {
  if (allCaughtUp) {
    return "You've completed every lesson! Explore the dictionary anytime 🎉";
  }

  if (streak >= 7) {
    return `${streak} days strong — you're unstoppable 🔥`;
  }

  if (streak >= 3) {
    return `${streak} day streak! Keep the momentum going 🔥`;
  }

  if (streak >= 1) {
    return "You're on a roll — keep it up today!";
  }

  return 'Ready to learn a new sign today?';
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

  const level = useMemo(() => getLevel(data?.xp ?? 0), [data?.xp]);

  const previewModules = useMemo(
    () => LEARNING_MODULES.slice(0, PREVIEW_MODULE_COUNT),
    [],
  );

  const nextLessonModule = data?.nextLesson
    ? getLearningModule(data.nextLesson.moduleId)
    : undefined;

  const dailyGoalCount = data?.dailyProgress.quizzesFinished ?? 0;
  const dailyGoalProgress = Math.min(1, dailyGoalCount / DAILY_QUIZ_GOAL);

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <SkeletonLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👋</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={14} color={colors.accent} />
                <Text style={styles.streakText}>
                  {data.streak} day{data.streak === 1 ? '' : 's'} streak
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.xpPill}>
            <Text style={styles.xpText}>{data.xp} XP</Text>
          </View>
        </View>

        <Text style={styles.motivation}>
          {motivationalMessage(data.streak, data.nextLesson === null)}
        </Text>

        {data.nextLesson && nextLessonModule ? (
          <Pressable
            style={styles.continueCard}
            onPress={() =>
              router.push(`/lesson/${data.nextLesson!.id}` as Href)
            }
            accessibilityRole="button"
            accessibilityLabel={`Continue learning: ${data.nextLesson.title}`}
          >
            <Text style={styles.continueLabel}>CONTINUE LEARNING</Text>
            <View style={styles.continueRow}>
              <View style={styles.continueTextCol}>
                <Text style={styles.continueModule}>
                  {nextLessonModule.title}
                </Text>
                <Text style={styles.continueTitle}>
                  {data.nextLesson.title}
                </Text>
              </View>
              <View style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.continueCardDone}>
            <Text style={styles.continueDoneText}>
              You're all caught up! Browse the dictionary to keep practicing.
            </Text>
          </View>
        )}

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>
            Today's goal — {dailyGoalCount} of {DAILY_QUIZ_GOAL} quizzes
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${dailyGoalProgress * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.levelCard}>
          <Text style={styles.levelLabel}>
            Level {level.level}
            {level.isMaxLevel ? ' (max)' : ` — ${level.xpIntoLevel}/${level.xpForNext} XP`}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                styles.levelFill,
                { width: `${level.progress * 100}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Keep exploring</Text>
        <View style={styles.moduleGrid}>
          {previewModules.map((module) => {
            const completedInModule = module.lessons.filter((lesson) =>
              data.completedLessonIds.includes(lesson.id),
            ).length;

            return (
              <ModuleCard
                key={module.id}
                module={module}
                completedLessons={completedInModule}
                onPress={() => router.push(`/module/${module.id}` as Href)}
              />
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
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  greeting: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  streakText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  xpPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2sm'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  xpText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  motivation: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  continueCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  continueLabel: {
    color: colors.white,
    opacity: 0.7,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueTextCol: {
    flex: 1,
    gap: 2,
  },
  continueModule: {
    color: colors.white,
    opacity: 0.75,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  continueTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  continueButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2sm'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  continueButtonText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
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
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing['2sm'],
  },
  progressLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  levelCard: {
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing['2sm'],
  },
  levelLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  levelFill: {
    backgroundColor: colors.accent,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  moduleGrid: {
    gap: spacing.md,
  },
});