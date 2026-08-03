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

import { LearningBottomNav } from '../../components/ui';
import {
  LEARNING_MODULES,
  getFirstPracticeLesson,
  lessonHasQuizMedia,
  type LearningModule,
} from '../../constants/learning';
import {
  DAILY_CHALLENGES,
  getPracticeMode,
  type DailyChallengeDef,
} from '../../constants/practice';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';
import {
  getDailyChallengeProgress,
  type DailyChallengeProgress,
} from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function QuizModuleRow({
  module,
  onPress,
  enabled,
}: {
  module: LearningModule;
  onPress: () => void;
  enabled: boolean;
}) {
  return (
    <Pressable
      disabled={!enabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      accessibilityLabel={`${module.title} quiz`}
      style={[
        styles.row,
        !enabled && styles.rowDisabled,
            ]}
    >
      <View style={[styles.rowSwatch, { backgroundColor: module.tileColor }]} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, !enabled && styles.rowTextDisabled]}>
          {module.title}
        </Text>
        <Text style={[styles.rowSubtitle, !enabled && styles.rowTextDisabled]}>
          {enabled
            ? `${module.lessons.filter((lesson) => lessonHasQuizMedia(lesson)).length} signs ready`
            : 'Needs more sign media'}
        </Text>
      </View>
      <Ionicons
        name={enabled ? 'play' : 'time-outline'}
        size={18}
        color={enabled ? colors.text : colors.textMuted}
      />
    </Pressable>
  );
}

function ChallengeCard({
  challenge,
  progress,
}: {
  challenge: DailyChallengeDef;
  progress: number;
}) {
  const clamped = Math.min(progress, challenge.target);
  const ratio = challenge.target === 0 ? 0 : clamped / challenge.target;
  const complete = clamped >= challenge.target;

  return (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <View style={styles.challengeRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
          <Text style={styles.progressLabel}>
            {clamped}/{challenge.target}
          </Text>
        </View>
        <View style={styles.rewardChip}>
          <Ionicons
            name={complete ? 'checkmark-circle' : 'flash'}
            size={16}
            color={complete ? colors.success : colors.warning}
          />
          <Text style={styles.rewardText}>{challenge.rewardXp} XP</Text>
        </View>
      </View>
    </View>
  );
}

export default function PracticeModeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const mode = getPracticeMode(getParam(params.mode));
  const [dailyProgress, setDailyProgress] = useState<DailyChallengeProgress>({
    signsLearned: 0,
    quizzesFinished: 0,
    correctAnswers: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadChallenges() {
        try {
          const progress = await getDailyChallengeProgress();

          if (isActive) {
            setDailyProgress(progress);
          }
        } catch {
          if (isActive) {
            setDailyProgress({
              signsLearned: 0,
              quizzesFinished: 0,
              correctAnswers: 0,
            });
          }
        }
      }

      void loadChallenges();

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (!mode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Mode not found</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/practice' as Href)}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Back to Practice</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
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

              router.replace('/(tabs)/practice' as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={[
              styles.backButton,
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>{mode.title}</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { backgroundColor: mode.tileColor }]}>
            <View style={styles.heroIconWrap}>
              <Ionicons name={mode.icon} size={32} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>{mode.title}</Text>
            <Text style={styles.heroDescription}>{mode.description}</Text>
          </View>

          {mode.id === 'quiz' && mode.available ? (
            <>
              <Text style={styles.sectionTitle}>Choose a collection</Text>
              <View style={styles.list}>
                {LEARNING_MODULES.map((module) => {
                  const practiceLesson = getFirstPracticeLesson(module);
                  const enabled =
                    practiceLesson !== null &&
                    lessonHasQuizMedia(practiceLesson);

                  return (
                    <QuizModuleRow
                      key={module.id}
                      module={module}
                      enabled={enabled}
                      onPress={() => {
                        if (!practiceLesson) {
                          return;
                        }

                        router.push(`/quiz/${practiceLesson.id}` as Href);
                      }}
                    />
                  );
                })}
              </View>
            </>
          ) : mode.id === 'challenges' && mode.available ? (
            <>
              <View style={styles.challengeHeader}>
                <Text style={styles.sectionTitle}>Daily challenges</Text>
                <View style={styles.resetChip}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.resetText}>Resets daily</Text>
                </View>
              </View>
              <View style={styles.challengeList}>
                {DAILY_CHALLENGES.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    progress={dailyProgress[challenge.id]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.comingSoon}>
              <Ionicons
                name="construct-outline"
                size={36}
                color={colors.textMuted}
              />
              <Text style={styles.comingSoonTitle}>Coming soon</Text>
              <Text style={styles.comingSoonBody}>
                This mode is planned for a later build. Quiz and Challenges are
                ready to use now.
              </Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  hero: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  challengeList: {
    gap: spacing['2sm'],
  },
  challengeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  challengeTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.full,
  },
  progressLabel: {
    textAlign: 'center',
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  rewardText: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  list: {
    gap: spacing['2sm'],
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primarySurface,
  },
  rowDisabled: {
    opacity: opacity.muted,
  },
  rowSwatch: {
    width: 12,
    height: 40,
    borderRadius: borderRadius.full,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  rowTextDisabled: {
    color: colors.textMuted,
  },
  comingSoon: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  comingSoonTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    lineHeight: 26,
  },
  comingSoonBody: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  pressed: {
    opacity: opacity.pressed,
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