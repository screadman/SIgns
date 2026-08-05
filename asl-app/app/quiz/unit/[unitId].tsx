import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GlassBackButton,
  LearningBottomNav,
  PrimaryButton,
  SignGlassFrame,
} from '../../../components/ui';
import {
  getAlphabetUnit,
  getUnitLessons,
  isAlphabetUnitUnlocked,
  unitQuizResultId,
} from '../../../constants/alphabetUnits';
import type { Lesson } from '../../../constants/learning';
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
import {
  generateAlphabetUnitSession,
  getQuizStars,
  getQuizXp,
  shuffle,
  type QuizFormat,
  type QuizQuestion,
} from '../../../lib/quiz';
import {
  getLessonImageSource,
  lessonHasSignImage,
} from '../../../lib/signImages';
import { recordSignAnswers } from '../../../lib/signStrength';
import {
  getCompletedLessons,
  saveBestLessonStars,
  saveBestModuleStars,
  saveCompletedLesson,
} from '../../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

type AnswerState = 'default' | 'correct' | 'incorrect';
type Phase = 'mcq' | 'matching';

function SessionHeader({
  progress,
  lives,
  onBack,
}: {
  progress: number;
  lives: number;
  onBack?: () => void;
}) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.header}>
      {onBack ? <GlassBackButton onPress={onBack} /> : null}
      <View
        style={styles.progressTrack}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(clamped * 100),
        }}
      >
        <View style={[styles.progressFill, { width: `${clamped * 100}%` }]} />
      </View>
      <View style={styles.hearts} accessibilityLabel={`${lives} lives left`}>
        {[0, 1, 2].map((heart) => (
          <Ionicons
            key={heart}
            name={heart < lives ? 'heart' : 'heart-outline'}
            size={20}
            color={heart < lives ? colors.accent : colors.disabled}
          />
        ))}
      </View>
    </View>
  );
}

function AnswerButton({
  lesson,
  format,
  state,
  disabled,
  onPress,
}: {
  lesson: Lesson;
  format: QuizFormat;
  state: AnswerState;
  disabled: boolean;
  onPress: () => void;
}) {
  const imageSource = getLessonImageSource(lesson);
  const showImage = format === 'label-to-image';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        showImage
          ? `ASL sign for ${lesson.sign.label}`
          : lesson.sign.label
      }
      style={({ pressed }) => [
        styles.answer,
        showImage && styles.imageAnswer,
        state === 'correct' && styles.correctAnswer,
        state === 'incorrect' && styles.incorrectAnswer,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {!showImage ? (
        <Text
          style={[
            styles.answerLabel,
            state !== 'default' && styles.selectedAnswerLabel,
          ]}
        >
          {lesson.sign.label}
        </Text>
      ) : imageSource ? (
        <Image
          source={imageSource}
          style={styles.answerImage}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={styles.answerLabel}>{lesson.sign.label}</Text>
      )}

      {state !== 'default' && (
        <View style={styles.answerStateIcon}>
          <Ionicons
            name={state === 'correct' ? 'checkmark' : 'close'}
            size={14}
            color={colors.white}
          />
        </View>
      )}
    </Pressable>
  );
}

export default function AlphabetUnitQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ unitId?: string | string[] }>();
  const unitId = getParam(params.unitId);
  const unit = getAlphabetUnit(unitId);

  const [ready, setReady] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [matchingLessons, setMatchingLessons] = useState<Lesson[]>([]);
  const [matchingLabels, setMatchingLabels] = useState<Lesson[]>([]);
  const [phase, setPhase] = useState<Phase>('mcq');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchMistakes, setMatchMistakes] = useState(0);
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLog = useRef<
    Array<{ signId: string; correct: boolean; lessonId: string }>
  >([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!unit) {
        if (active) {
          setReady(true);
        }
        return;
      }

      const completed = await getCompletedLessons();
      if (!isAlphabetUnitUnlocked(unit.id, completed)) {
        if (active) {
          setLockedOut(true);
          setReady(true);
        }
        return;
      }

      const lessons = getUnitLessons(unit);
      const session = generateAlphabetUnitSession(lessons);
      if (active) {
        setQuestions(session.questions);
        setMatchingLessons(session.matchingLessons);
        setMatchingLabels(shuffle(session.matchingLessons));
        setReady(true);
      }
    }

    void load();

    return () => {
      active = false;
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
    };
  }, [unit]);

  const currentQuestion = questions[currentQuestionIndex];
  const matchingComplete =
    matchingLessons.length > 0 &&
    matchedIds.length === matchingLessons.length;

  const totalSteps = questions.length + (matchingLessons.length > 0 ? 1 : 0);

  async function finishSession(finalMcqScore: number, matchingOk: boolean) {
    if (isFinishing || !unit) {
      return;
    }

    setIsFinishing(true);

    await recordSignAnswers(
      answerLog.current.map((entry) => ({
        signId: entry.signId,
        correct: entry.correct,
      })),
    );

    const matchingPoint = matchingOk ? 1 : 0;
    const finalScore = finalMcqScore + matchingPoint;
    const total = Math.max(1, questions.length + (matchingLessons.length > 0 ? 1 : 0));
    const earnedStars = getQuizStars(finalScore, total);
    const earnedXp = getQuizXp(finalScore, total);
    const passed = earnedStars >= 1;

    if (passed) {
      for (const lessonId of unit.lessonIds) {
        await saveCompletedLesson(lessonId);
        await saveBestLessonStars(lessonId, Math.max(1, earnedStars));
      }
      await saveBestLessonStars(unitQuizResultId(unit), earnedStars);
      await saveBestModuleStars('alphabet', earnedStars);
    }

    const resultId = `${unitQuizResultId(unit)}-${Date.now()}`;
    const missedLessonIds = [
      ...new Set(
        answerLog.current
          .filter((entry) => !entry.correct)
          .map((entry) => entry.lessonId),
      ),
    ];

    router.replace({
      pathname: '/quiz/results',
      params: {
        lessonId: unitQuizResultId(unit),
        score: String(finalScore),
        total: String(total),
        xp: String(earnedXp),
        stars: String(earnedStars),
        resultId,
        source: 'unit',
        moduleId: 'alphabet',
        missed: missedLessonIds.join(','),
        continueTo: '/module/alphabet',
      },
    } as Href);
  }

  function startMatchingOrFinish(nextScore: number) {
    if (matchingLessons.length >= 4) {
      setPhase('matching');
      setSelectedAnswerId(null);
      return;
    }
    void finishSession(nextScore, true);
  }

  function handleAnswer(answerId: string) {
    if (
      !currentQuestion ||
      phase !== 'mcq' ||
      selectedAnswerId ||
      isFinishing
    ) {
      return;
    }

    const isCorrect = answerId === currentQuestion.correctAnswerId;
    const nextScore = score + (isCorrect ? 1 : 0);

    answerLog.current.push({
      signId: currentQuestion.prompt.sign.id,
      lessonId: currentQuestion.prompt.id,
      correct: isCorrect,
    });

    setSelectedAnswerId(answerId);
    setScore(nextScore);

    let nextLives = lives;
    if (!isCorrect) {
      nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
    }

    advanceTimer.current = setTimeout(() => {
      const isLastQuestion = currentQuestionIndex === questions.length - 1;
      const outOfLives = nextLives <= 0;

      if (outOfLives) {
        void finishSession(nextScore, false);
        return;
      }

      if (isLastQuestion) {
        startMatchingOrFinish(nextScore);
        return;
      }

      setCurrentQuestionIndex((index) => index + 1);
      setSelectedAnswerId(null);
    }, isCorrect ? 900 : 1200);
  }

  function tryMatch(labelLessonId: string) {
    if (matchingComplete || matchedIds.includes(labelLessonId) || isFinishing) {
      return;
    }

    if (!selectedImageId) {
      setMatchFeedback('Pick a sign picture first.');
      return;
    }

    if (selectedImageId === labelLessonId) {
      const nextMatched = [...matchedIds, labelLessonId];
      setMatchedIds(nextMatched);
      setSelectedImageId(null);
      setMatchFeedback('Match!');

      if (nextMatched.length === matchingLessons.length) {
        setTimeout(() => {
          void finishSession(score, true);
        }, 700);
      }
      return;
    }

    setMatchMistakes((count) => count + 1);
    setSelectedImageId(null);
    setMatchFeedback('Not a match. Try again.');
  }

  const progressRatio = useMemo(() => {
    if (totalSteps <= 0) {
      return 0;
    }
    if (phase === 'matching') {
      const matchShare =
        matchingLessons.length > 0
          ? matchedIds.length / matchingLessons.length
          : 1;
      return (questions.length + matchShare) / totalSteps;
    }
    return (currentQuestionIndex + 1) / totalSteps;
  }, [
    phase,
    totalSteps,
    questions.length,
    matchingLessons.length,
    matchedIds.length,
    currentQuestionIndex,
  ]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!unit || lockedOut || questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>
            {lockedOut ? 'Unit locked' : 'Unit unavailable'}
          </Text>
          <Text style={styles.notFoundBody}>
            {lockedOut
              ? 'Finish the previous alphabet unit first.'
              : 'Need enough illustrated letters in this unit.'}
          </Text>
          <Pressable
            onPress={() => router.replace('/module/alphabet' as Href)}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Back to Alphabet</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'matching') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.screen}>
          <SessionHeader
            progress={progressRatio}
            lives={lives}
            onBack={() => router.replace('/module/alphabet' as Href)}
          />

          <ScrollView
            contentContainerStyle={styles.matchContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.matchInstructions}>
              Match each sign to its letter. Tap a picture, then a letter.
            </Text>

            <Text style={styles.columnTitle}>Signs</Text>
            <View style={styles.imageGrid}>
              {matchingLessons.map((lesson) => {
                const matched = matchedIds.includes(lesson.id);
                const selected = selectedImageId === lesson.id;
                const source = getLessonImageSource(lesson);

                return (
                  <Pressable
                    key={`img-${lesson.id}`}
                    disabled={matched || matchingComplete || isFinishing}
                    onPress={() => {
                      setMatchFeedback(null);
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

            <Text style={styles.columnTitle}>Letters</Text>
            <View style={styles.labelGrid}>
              {matchingLabels.map((lesson) => {
                const matched = matchedIds.includes(lesson.id);
                return (
                  <Pressable
                    key={`lbl-${lesson.id}`}
                    disabled={matched || matchingComplete || isFinishing}
                    onPress={() => tryMatch(lesson.id)}
                    style={[styles.labelTile, matched && styles.tileMatched]}
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

            {matchFeedback ? (
              <Text style={styles.matchFeedback}>{matchFeedback}</Text>
            ) : (
              <Text style={styles.feedbackMuted}>
                Mistakes: {matchMistakes}
              </Text>
            )}

            {matchingComplete ? (
              <View style={styles.completeBlock}>
                <Text style={styles.completeTitle}>All matched!</Text>
                <PrimaryButton
                  title="See results"
                  onPress={() => void finishSession(score, true)}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
        <LearningBottomNav />
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Quiz unavailable</Text>
          <Pressable
            onPress={() => router.replace('/module/alphabet' as Href)}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Back to Alphabet</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const selectedIsCorrect =
    selectedAnswerId === currentQuestion.correctAnswerId;
  const promptImage =
    currentQuestion.format === 'image-to-label' &&
    lessonHasSignImage(currentQuestion.prompt)
      ? getLessonImageSource(currentQuestion.prompt)
      : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <SessionHeader
          progress={progressRatio}
          lives={lives}
          onBack={() => router.replace('/module/alphabet' as Href)}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {promptImage ? (
            <SignGlassFrame style={styles.promptImageContainer}>
              <Image
                source={promptImage}
                style={styles.promptImage}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </SignGlassFrame>
          ) : (
            <View style={styles.promptLabelContainer}>
              <Text style={styles.promptLabel}>
                {currentQuestion.prompt.sign.label}
              </Text>
            </View>
          )}

          <Text style={styles.question}>
            {currentQuestion.format === 'image-to-label'
              ? 'What letter is this?'
              : `Which sign matches ${currentQuestion.prompt.sign.label}?`}
          </Text>

          <View style={styles.answerGrid}>
            {currentQuestion.options.map((option) => {
              let answerState: AnswerState = 'default';
              if (selectedAnswerId) {
                if (option.id === currentQuestion.correctAnswerId) {
                  answerState = 'correct';
                } else if (option.id === selectedAnswerId) {
                  answerState = 'incorrect';
                }
              }

              return (
                <AnswerButton
                  key={option.id}
                  lesson={option}
                  format={currentQuestion.format}
                  state={answerState}
                  disabled={selectedAnswerId !== null}
                  onPress={() => handleAnswer(option.id)}
                />
              );
            })}
          </View>

          {selectedAnswerId ? (
            <Text
              style={[
                styles.feedback,
                {
                  color: selectedIsCorrect ? colors.success : colors.error,
                },
              ]}
            >
              {selectedIsCorrect
                ? 'Correct!'
                : currentQuestion.prompt.sign.tip}
            </Text>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  progressTrack: {
    flex: 1,
    height: 14,
    overflow: 'hidden',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  hearts: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    gap: spacing['2md'],
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  promptImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.xl,
  },
  promptImage: {
    width: 200,
    height: 200,
  },
  promptLabelContainer: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.lg,
  },
  promptLabel: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 72,
    lineHeight: 84,
    textAlign: 'center',
  },
  question: {
    width: '100%',
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    textAlign: 'center',
  },
  answerGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing['2sm'],
  },
  answer: {
    width: '48%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
  },
  imageAnswer: {
    height: 112,
  },
  correctAnswer: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  incorrectAnswer: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  answerLabel: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  selectedAnswerLabel: {
    color: colors.textInverse,
  },
  answerImage: {
    width: 88,
    height: 88,
  },
  answerStateIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  feedback: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  matchContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  matchInstructions: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  columnTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageTile: {
    width: '47%',
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageTileGlass: {
    height: 110,
  },
  imageTileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImage: {
    width: 88,
    height: 88,
  },
  fallbackLabel: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  labelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  labelTile: {
    minWidth: '22%',
    flexGrow: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  labelText: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  labelTextMatched: {
    color: colors.white,
  },
  tileSelected: {
    borderColor: colors.primary,
  },
  tileMatched: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  matchFeedback: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  feedbackMuted: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  completeBlock: {
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  completeTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
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
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
  },
  notFoundBody: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
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
