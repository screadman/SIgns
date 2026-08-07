import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningBottomNav, PrimaryButton, ScreenBackdrop } from '../../components/ui';
import { BADGES_BY_ID, bossBadgeId } from '../../constants/badges';
import {
  LEARNING_MODULES,
  getLearningModule,
  type LearningModuleId,
} from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';
import { resolveLessonsByIds } from '../../lib/missedSigns';
import {
  getNextLesson,
  checkAndUnlockBadges,
  saveQuizResult,
} from '../../lib/storage';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const ALL_LESSONS = LEARNING_MODULES.flatMap((module) => module.lessons);

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function getNumberParam(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const parsedValue = Number(getParam(value));
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export default function QuizResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lessonId?: string | string[];
    score?: string | string[];
    total?: string | string[];
    xp?: string | string[];
    stars?: string | string[];
    resultId?: string | string[];
    source?: string | string[];
    missed?: string | string[];
    moduleId?: string | string[];
    continueTo?: string | string[];
  }>();
  const lessonId = getParam(params.lessonId);
  const source = getParam(params.source) || 'module';
  const bossModuleId = getParam(params.moduleId);
  const continueTo = getParam(params.continueTo);
  const missedIds = getParam(params.missed)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const missedLessons = useMemo(
    () => resolveLessonsByIds(ALL_LESSONS, missedIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ids are stable via joined string
    [missedIds.join('|')],
  );
  const missedCount = missedLessons.length || missedIds.length;
  const isDaily = source === 'daily';
  const isMissed = source === 'missed';
  const isBoss = source === 'boss';
  const isUnit = source === 'unit';
  const bossModule = isBoss ? getLearningModule(bossModuleId) : undefined;
  const unitModule = isUnit ? getLearningModule(bossModuleId || 'alphabet') : undefined;
  const score = Math.max(0, getNumberParam(params.score, 0));
  const total = Math.max(1, getNumberParam(params.total, 3));
  const bossPerfect = isBoss && score >= total && total > 0;
  const bossBadge =
    bossPerfect && bossModule
      ? BADGES_BY_ID[bossBadgeId(bossModule.id as LearningModuleId)]
      : undefined;
  const xp = Math.max(0, getNumberParam(params.xp, score * 10));
  const earnedStars = Math.min(3, Math.max(0, getNumberParam(params.stars, 0)));
  const resultId = getParam(params.resultId);
  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const hasSavedResult = useRef(false);
  const savePromiseRef = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    if (!lessonId || hasSavedResult.current) {
      return;
    }

    hasSavedResult.current = true;
    savePromiseRef.current = saveQuizResult({
      lessonId,
      score,
      total,
      xp,
      stars: earnedStars,
      resultId: resultId || undefined,
      securesStreak: false,
    }).then(async (snapshot) => {
      await checkAndUnlockBadges({
        score,
        total,
        source: isBoss
          ? 'boss'
          : isDaily
            ? 'daily'
            : isMissed
              ? 'missed'
              : isUnit
                ? 'module'
                : 'module',
        bossModuleId: bossModule?.id,
      });
      return snapshot;
    });
  }, [
    bossModule?.id,
    earnedStars,
    isBoss,
    isDaily,
    isMissed,
    isUnit,
    lessonId,
    resultId,
    score,
    total,
    xp,
  ]);

  useEffect(() => {
    const animations = starScales.slice(0, earnedStars).map((scale, index) =>
      Animated.sequence([
        Animated.delay(index * 180),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 90,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );

    Animated.parallel(animations).start();
  }, [earnedStars, starScales]);

  async function goHomeOrContinue() {
    await savePromiseRef.current;

    if (isUnit && continueTo) {
      router.replace(continueTo as Href);
      return;
    }

    if (isUnit) {
      router.replace('/module/alphabet' as Href);
      return;
    }

    if (isDaily || isMissed || isBoss) {
      router.replace('/(tabs)/home' as Href);
      return;
    }

    const nextLesson = await getNextLesson();

    if (nextLesson) {
      router.replace(`/lesson/${nextLesson.id}` as Href);
      return;
    }

    router.replace('/(tabs)/home' as Href);
  }

  return (
    <ScreenBackdrop variant="quiz">
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.trophy}>
            <Ionicons name="trophy" size={48} color={colors.warning} />
          </View>

          <Text style={styles.title}>
            {isDaily
              ? 'Daily complete!'
              : isMissed
                ? 'Missed quiz done!'
                : isBoss
                  ? bossPerfect
                    ? 'Boss cleared!'
                    : 'Boss run over'
                  : isUnit
                    ? earnedStars >= 1
                      ? 'Unit complete!'
                      : 'Keep practicing'
                    : 'Quiz complete!'}
          </Text>
          <Text style={styles.subtitle}>
            {isDaily
              ? score === total
                ? 'Perfect day. Streak secured! Check your path on Home.'
                : 'Nice work. Streak secured. Keep moving along your path.'
              : isMissed
                ? score === total
                  ? 'Those signs are getting stronger.'
                  : 'Keep drilling. Weak signs will stick.'
                : isBoss
                  ? bossPerfect
                    ? `${bossModule?.title ?? 'Module'} Boss badge unlocked.`
                    : 'One miss ends it. Try again when you are ready.'
                  : isUnit
                    ? earnedStars >= 1
                      ? `${unitModule?.title ?? 'Alphabet'} unit cleared. Next island unlocked.`
                      : 'Score at least half to clear this unit, then try again.'
                    : score === total
                      ? 'Perfect score. That moves you forward on the path.'
                      : 'Great practice. Open Home to see what is left.'}
          </Text>

          {bossBadge ? (
            <View style={styles.bossBadgeUnlock}>
              <Ionicons name={bossBadge.icon} size={28} color={colors.warning} />
              <Text style={styles.bossBadgeUnlockText}>{bossBadge.name}</Text>
            </View>
          ) : null}

          <View style={styles.stars}>
            {starScales.map((scale, index) =>
              index < earnedStars ? (
                <Animated.View
                  key={index}
                  style={{ transform: [{ scale }] }}
                >
                  <Ionicons name="star" size={52} color={colors.warning} />
                </Animated.View>
              ) : (
                <Ionicons
                  key={index}
                  name="star-outline"
                  size={52}
                  color={colors.disabled}
                />
              ),
            )}
          </View>

          <View style={styles.statsCard}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {score}/{total}
              </Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <View style={styles.gemRow}>
                <Ionicons name="diamond" size={18} color={colors.gem} />
                <Text style={[styles.statValue, styles.xpValue]}>+{xp}</Text>
              </View>
              <Text style={styles.statLabel}>Gems earned</Text>
            </View>
          </View>

          {missedLessons.length > 0 ? (
            <View style={styles.missedCard}>
              <Text style={styles.missedTitle}>
                Missed ({missedLessons.length})
              </Text>
              <View style={styles.missedList}>
                {missedLessons.map((lesson) => (
                  <View key={lesson.id} style={styles.missedChip}>
                    <Text style={styles.missedChipText}>
                      {lesson.sign.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            {missedCount > 0 ? (
              <>
                <PrimaryButton
                  title="Quiz missed signs"
                  fullWidth
                  onPress={() => router.replace('/quiz/missed' as Href)}
                />
                <PrimaryButton
                  title={`Flashcards (${missedCount})`}
                  fullWidth
                  onPress={() =>
                    router.replace({
                      pathname: '/practice/flashcards/[moduleId]',
                      params: { moduleId: 'alphabet', missed: '1' },
                    } as Href)
                  }
                />
              </>
            ) : null}

            <PrimaryButton
              title={
                isUnit
                  ? 'Back to Alphabet'
                  : isDaily || isMissed || isBoss
                    ? 'Back to Home'
                    : 'Play again'
              }
              fullWidth
              onPress={() => {
                if (isDaily || isMissed || isBoss || isUnit) {
                  void goHomeOrContinue();
                  return;
                }

                router.replace({
                  pathname: '/quiz/[lessonId]',
                  params: {
                    lessonId,
                    retry: String(Date.now()),
                  },
                } as Href);
              }}
            />

            {isBoss && bossModule ? (
              <Pressable
                onPress={() =>
                  router.replace(`/quiz/boss/${bossModule.id}` as Href)
                }
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.continueButtonText}>
                  {bossPerfect ? 'Run again' : 'Retry Boss'}
                </Text>
              </Pressable>
            ) : null}

            {isUnit && earnedStars < 1 && lessonId.startsWith('unit-') ? (
              <Pressable
                onPress={() => {
                  const unitRouteId = lessonId.replace(/^unit-/, '');
                  router.replace(`/quiz/unit/${unitRouteId}` as Href);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.continueButtonText}>Retry unit</Text>
              </Pressable>
            ) : null}

            {!isDaily && !isMissed && !isBoss && !isUnit ? (
              <Pressable
                onPress={() => {
                  void goHomeOrContinue();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            ) : missedCount === 0 && !isBoss && !isUnit ? (
              <Pressable
                onPress={() => router.replace('/(tabs)/practice' as Href)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.continueButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.continueButtonText}>More practice</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </View>
      <LearningBottomNav />
      </SafeAreaView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  trophy: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFBEB',
  },
  title: {
    marginTop: spacing.lg,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 320,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  stars: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statsCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing['2md'],
    borderWidth: borderWidth.thin,
    borderColor: colors.primarySurface,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  xpValue: {
    color: colors.gem,
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
  },
  missedCard: {
    width: '100%',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.sm,
  },
  missedTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  missedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  missedChip: {
    paddingHorizontal: spacing['2sm'],
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  missedChipText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  bossBadgeUnlock: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFBEB',
  },
  bossBadgeUnlockText: {
    color: colors.warning,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  actions: {
    width: '100%',
    gap: spacing['2sm'],
    marginTop: spacing.xl,
  },
  continueButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: borderWidth.thick,
    borderColor: colors.primarySurface,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  continueButtonText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
