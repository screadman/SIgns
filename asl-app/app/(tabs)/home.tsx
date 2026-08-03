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
import {
  getHomeDailyCard,
  type HomeDailyCard,
  type HomeDailyCtaAction,
} from '../../lib/homeDaily';
import { getLearnerName } from '../../lib/onboardingStorage';
import { getLessonImageSource } from '../../lib/signImages';
import {
  calculateStreak,
  getCompletedLessons,
  getDailyChallengeProgress,
  getNextLesson,
  getTotalXP,
  type DailyChallengeProgress,
} from '../../lib/storage';

const PREVIEW_MODULE_COUNT = 3;

type HomeData = {
  xp: number;
  streak: number;
  nextLesson: Lesson | null;
  dailyProgress: DailyChallengeProgress;
  completedLessonIds: string[];
  dailyCard: HomeDailyCard;
  learnerInitials: string;
};

function initialsFromName(name: string | null): string {
  if (!name) {
    return 'SG';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'SG';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadHome() {
        const [
          xp,
          streak,
          nextLesson,
          dailyProgress,
          completedLessonIds,
          dailyCard,
          learnerName,
        ] = await Promise.all([
          getTotalXP(),
          calculateStreak(),
          getNextLesson(),
          getDailyChallengeProgress(),
          getCompletedLessons(),
          getHomeDailyCard(),
          getLearnerName(),
        ]);

        if (isActive) {
          setData({
            xp,
            streak,
            nextLesson,
            dailyProgress,
            completedLessonIds,
            dailyCard,
            learnerInitials: initialsFromName(learnerName),
          });
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

  function runDailyCta(action: HomeDailyCtaAction) {
    if (!data) {
      return;
    }

    switch (action) {
      case 'daily':
        router.push('/quiz/daily' as Href);
        break;
      case 'alphabet':
        router.push('/module/alphabet' as Href);
        break;
      case 'missed':
        router.push({
          pathname: '/practice/flashcards/[moduleId]',
          params: { moduleId: 'alphabet', missed: '1' },
        } as Href);
        break;
      case 'missed_quiz':
        router.push('/quiz/missed' as Href);
        break;
      case 'next_lesson':
        if (data.nextLesson) {
          router.push(`/lesson/${data.nextLesson.id}` as Href);
        } else {
          router.push('/(tabs)/learn' as Href);
        }
        break;
      case 'none':
      default:
        break;
    }
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <SkeletonLoader />
        </View>
      </SafeAreaView>
    );
  }

  const { dailyCard } = data;
  const dailyDone = dailyCard.state === 'done';
  const challengeQuizzes = data.dailyProgress.quizzesFinished;
  const challengeCorrect = data.dailyProgress.correctAnswers;

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
  const nextLessonImage = data.nextLesson
    ? getLessonImageSource(data.nextLesson)
    : undefined;

  const primaryAccent =
    dailyCard.state === 'done'
      ? colors.success
      : dailyCard.state === 'off_day'
        ? colors.textMuted
        : colors.primary;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.learnerInitials}</Text>
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

        <Text style={styles.headline}>{dailyCard.headline}</Text>

        <View
          style={[
            styles.dailyCard,
            dailyDone && styles.dailyCardDone,
            dailyCard.state === 'blocked' && styles.dailyCardBlocked,
          ]}
        >
          <View style={styles.dailyHeaderRow}>
            <View
              style={[
                styles.dailyIcon,
                { backgroundColor: `${primaryAccent}22` },
              ]}
            >
              <Ionicons
                name={
                  dailyCard.state === 'done'
                    ? 'checkmark-circle'
                    : dailyCard.state === 'off_day'
                      ? 'moon-outline'
                      : dailyCard.state === 'blocked'
                        ? 'lock-closed-outline'
                        : 'flash'
                }
                size={22}
                color={primaryAccent}
              />
            </View>
            <View style={styles.dailyTextCol}>
              <Text style={styles.dailyLabel}>DAILY QUIZ</Text>
              <Text style={styles.dailyTitle}>{dailyCard.title}</Text>
              <Text style={styles.dailySubtitle}>{dailyCard.subtitle}</Text>
            </View>
          </View>

          {dailyCard.ctaAction !== 'none' ? (
            <Pressable
              style={[
                styles.dailyCta,
                dailyCard.state === 'off_day' && styles.dailyCtaMuted,
              ]}
              onPress={() => runDailyCta(dailyCard.ctaAction)}
              accessibilityRole="button"
              accessibilityLabel={dailyCard.ctaLabel}
            >
              <Text style={styles.dailyCtaText}>{dailyCard.ctaLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </Pressable>
          ) : (
            <View style={styles.dailyCtaDone}>
              <Text style={styles.dailyCtaDoneText}>{dailyCard.ctaLabel}</Text>
            </View>
          )}

          {dailyCard.secondaryCtaLabel && dailyCard.secondaryCtaAction ? (
            <Pressable
              onPress={() => runDailyCta(dailyCard.secondaryCtaAction!)}
              accessibilityRole="button"
              accessibilityLabel={dailyCard.secondaryCtaLabel}
              style={styles.secondaryLink}
            >
              <Text style={styles.secondaryLinkText}>
                {dailyCard.secondaryCtaLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>

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
              {nextLessonImage ? (
                <Image
                  source={nextLessonImage}
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
              You&apos;re all caught up on lessons. Keep sharpening with Daily
              Quiz.
            </Text>
          </View>
        )}

        <View style={styles.progressCard}>
          <View
            style={[
              styles.progressRing,
              dailyDone && { borderColor: colors.success },
            ]}
          >
            <Ionicons
              name={dailyDone ? 'checkmark' : 'ellipse-outline'}
              size={22}
              color={dailyDone ? colors.success : colors.primary}
            />
          </View>
          <View style={styles.progressTextCol}>
            <Text style={styles.progressTitle}>Today&apos;s progress</Text>
            <Text style={styles.progressSubtitle}>
              {dailyDone
                ? `Daily done · ${challengeQuizzes} ${challengeQuizzes === 1 ? 'quiz' : 'quizzes'} · ${challengeCorrect} correct`
                : dailyCard.state === 'pending'
                  ? `Daily pending · ${challengeCorrect} correct answers so far`
                  : dailyCard.state === 'off_day'
                    ? `Rest day · ${challengeCorrect} correct answers today`
                    : 'Unlock more signs to start your Daily.'}
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
  dailyCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin + 1,
    borderColor: colors.primary,
  },
  dailyCardDone: {
    borderColor: colors.success,
    backgroundColor: colors.primarySurface,
  },
  dailyCardBlocked: {
    borderColor: colors.border,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dailyIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyTextCol: {
    flex: 1,
    gap: 4,
  },
  dailyLabel: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  dailyTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  dailySubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  dailyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2sm'],
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  dailyCtaMuted: {
    backgroundColor: colors.text,
  },
  dailyCtaText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  dailyCtaDone: {
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dailyCtaDoneText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
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
    color: colors.textMuted,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xs,
  },
  continueTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.base,
  },
  continueCardDone: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  continueDoneText: {
    color: colors.textMuted,
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
