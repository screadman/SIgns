import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassBackButton, LearningBottomNav, PrimaryButton, SignGlassFrame } from '../../../components/ui';
import {
  getLearningModule,
  getModuleMediaLessons,
  type Lesson,
} from '../../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../../constants/theme';
import { getLessonImageSource } from '../../../lib/signImages';

const PAIR_COUNT = 4;

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function MatchingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ moduleId?: string | string[] }>();
  const moduleId = getParam(params.moduleId);
  const module = getLearningModule(moduleId);

  const round = useMemo(() => {
    if (!module) {
      return [] as Lesson[];
    }
    return shuffle(getModuleMediaLessons(module)).slice(0, PAIR_COUNT);
  }, [module]);

  const labels = useMemo(() => shuffle(round), [round]);

  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const complete = round.length > 0 && matchedIds.length === round.length;

  if (!module || round.length < PAIR_COUNT) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Matching unavailable</Text>
          <Text style={styles.notFoundBody}>
            Need at least {PAIR_COUNT} illustrated signs in this collection.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function tryMatch(labelLessonId: string) {
    if (complete || matchedIds.includes(labelLessonId)) {
      return;
    }

    if (!selectedImageId) {
      setFeedback('Pick a sign picture first.');
      return;
    }

    if (selectedImageId === labelLessonId) {
      setMatchedIds((current) => [...current, labelLessonId]);
      setSelectedImageId(null);
      setFeedback('Match!');
      return;
    }

    setMistakes((count) => count + 1);
    setSelectedImageId(null);
    setFeedback('Not a match. Try again.');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <GlassBackButton onPress={() => router.back()} />
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.counter}>
            {matchedIds.length}/{round.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.instructions}>
            Tap a sign, then tap the matching word.
          </Text>

          <Text style={styles.columnTitle}>Signs</Text>
          <View style={styles.imageGrid}>
            {round.map((lesson) => {
              const matched = matchedIds.includes(lesson.id);
              const selected = selectedImageId === lesson.id;
              const source = getLessonImageSource(lesson);

              return (
                <Pressable
                  key={`img-${lesson.id}`}
                  disabled={matched || complete}
                  onPress={() => {
                    setFeedback(null);
                    setSelectedImageId(lesson.id);
                  }}
                  style={[
                    styles.imageTile,
                    selected && styles.tileSelected,
                    matched && styles.tileMatched,
                  ]}
                >
                  <SignGlassFrame
                    style={styles.imageTileGlass}
                    contentStyle={styles.imageTileContent}
                  >
                    {source ? (
                      <Image
                        source={source}
                        style={styles.tileImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.fallbackLabel}>
                        {lesson.sign.label}
                      </Text>
                    )}
                  </SignGlassFrame>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.columnTitle}>Words</Text>
          <View style={styles.labelGrid}>
            {labels.map((lesson) => {
              const matched = matchedIds.includes(lesson.id);

              return (
                <Pressable
                  key={`lbl-${lesson.id}`}
                  disabled={matched || complete}
                  onPress={() => tryMatch(lesson.id)}
                  style={[
                    styles.labelTile,
                    matched && styles.tileMatched,
                  ]}
                >
                  <Text
                    style={[
                      styles.labelText,
                      matched && styles.labelTextMatched,
                    ]}
                  >
                    {lesson.sign.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {feedback ? (
            <Text style={styles.feedback}>{feedback}</Text>
          ) : (
            <Text style={styles.feedbackMuted}>Mistakes: {mistakes}</Text>
          )}

          {complete ? (
            <View style={styles.completeBlock}>
              <Text style={styles.completeTitle}>All matched!</Text>
              <Text style={styles.completeBody}>
                {mistakes === 0
                  ? 'Perfect round.'
                  : `Finished with ${mistakes} mistak${mistakes === 1 ? 'e' : 'es'}.`}
              </Text>
              <PrimaryButton
                title="Back to Practice"
                onPress={() => router.replace('/(tabs)/practice' as Href)}
              />
            </View>
          ) : null}
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  counter: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  instructions: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  columnTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2sm'],
    justifyContent: 'space-between',
  },
  imageTile: {
    width: '48%',
    height: 120,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageTileGlass: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: 0,
  },
  imageTileContent: {
    padding: spacing.xs,
  },
  tileImage: {
    width: 96,
    height: 96,
  },
  labelGrid: {
    gap: spacing['2sm'],
  },
  labelTile: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  labelText: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  labelTextMatched: {
    color: colors.textInverse,
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  tileMatched: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  fallbackLabel: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  feedback: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  feedbackMuted: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  completeBlock: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  completeTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  completeBody: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  notFoundBody: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing['2sm'],
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
});
