import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
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

import { LearningBottomNav, PrimaryButton } from '../../components/ui';
import { getLesson } from '../../constants/learning';
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

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

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
  }>();
  const lessonId = getParam(params.lessonId);
  const score = Math.max(0, getNumberParam(params.score, 0));
  const total = Math.max(1, getNumberParam(params.total, 3));
  const xp = Math.max(0, getNumberParam(params.xp, score * 10));
  const earnedStars = Math.min(3, Math.max(1, getNumberParam(params.stars, 1)));
  const lessonData = getLesson(lessonId);
  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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

  function continueLearning() {
    if (!lessonData) {
      router.replace('/(tabs)/learn' as Href);
      return;
    }

    const nextLesson = lessonData.module.lessons[lessonData.lessonIndex + 1];

    if (nextLesson) {
      router.replace(`/lesson/${nextLesson.id}` as Href);
      return;
    }

    router.replace('/(tabs)/learn' as Href);
  }

  return (
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

          <Text style={styles.title}>Quiz complete!</Text>
          <Text style={styles.subtitle}>
            {score === total
              ? 'Perfect score. Amazing work!'
              : 'Great practice. Keep building your skills!'}
          </Text>

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
              <Text style={[styles.statValue, styles.xpValue]}>+{xp}</Text>
              <Text style={styles.statLabel}>XP earned</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              title="Play again"
              fullWidth
              onPress={() =>
                router.replace({
                  pathname: '/quiz/[lessonId]',
                  params: {
                    lessonId,
                    retry: String(Date.now()),
                  },
                } as Href)
              }
            />
            <Pressable
              onPress={continueLearning}
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
          </View>
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
    color: colors.success,
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
