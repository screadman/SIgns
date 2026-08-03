import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { LearningBottomNav } from '../../components/ui';
import { LEARNING_MODULES } from '../../constants/learning';
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
import {
  generateQuizPreset,
  getFocusModuleId,
} from '../../lib/dailyQuiz';
import {
  completeDailyQuizSession,
  isPracticeDayToday,
} from '../../lib/dailyQuizStorage';
import { saveLastMissedLessonIds } from '../../lib/missedSigns';
import { getOnboardingProfile } from '../../lib/onboardingStorage';
import {
  getQuizStars,
  getQuizXp,
  type QuizFormat,
  type QuizQuestion,
} from '../../lib/quiz';
import {
  getLessonImageSource,
  lessonHasSignImage,
} from '../../lib/signImages';
import { recordSignAnswers } from '../../lib/signStrength';
import { getNextLesson } from '../../lib/storage';

const ALL_LESSONS = LEARNING_MODULES.flatMap((module) => module.lessons);

type AnswerState = 'default' | 'correct' | 'incorrect';

function AnswerButton({
  lesson,
  format,
  state,
  disabled,
  onPress,
}: {
  lesson: (typeof ALL_LESSONS)[number];
  format: QuizFormat;
  state: AnswerState;
  disabled: boolean;
  onPress: () => void;
}) {
  const imageSource = getLessonImageSource(lesson);
  const showImage =
    format === 'label-to-image' || format === 'description-to-image';

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

export default function DailyQuizScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const answerLog = useRef<Array<{ signId: string; correct: boolean; lessonId: string }>>(
    [],
  );
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [profile, nextLesson] = await Promise.all([
          getOnboardingProfile(),
          getNextLesson(),
        ]);

        const built = await generateQuizPreset({
          preset: 'daily',
          allLessons: ALL_LESSONS,
          dailyMinutes: profile?.dailyMinutes ?? 5,
          focusModuleId: getFocusModuleId(nextLesson),
        });

        if (!active) {
          return;
        }

        if (built.length < 4) {
          setLoadError(true);
          setQuestions([]);
          return;
        }

        setQuestions(built);
      } catch {
        if (active) {
          setLoadError(true);
          setQuestions([]);
        }
      }
    }

    void load();

    return () => {
      active = false;
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  const currentQuestion = questions?.[currentQuestionIndex];

  async function finishQuiz(finalScore: number) {
    if (isFinishing || !questions) {
      return;
    }

    setIsFinishing(true);

    const missedLessonIds = answerLog.current
      .filter((entry) => !entry.correct)
      .map((entry) => entry.lessonId);

    await recordSignAnswers(
      answerLog.current.map((entry) => ({
        signId: entry.signId,
        correct: entry.correct,
      })),
    );

    const profile = await getOnboardingProfile();
    await completeDailyQuizSession({
      score: finalScore,
      missedLessonIds,
      secureStreak: isPracticeDayToday(profile?.practiceDays),
    });
    await saveLastMissedLessonIds(missedLessonIds);

    const earnedStars = getQuizStars(finalScore, questions.length);
    const earnedXp = getQuizXp(finalScore, questions.length);
    const resultId = `daily-${Date.now()}`;

    router.replace({
      pathname: '/quiz/results',
      params: {
        lessonId: `daily-${new Date().toISOString().slice(0, 10)}`,
        score: String(finalScore),
        total: String(questions.length),
        xp: String(earnedXp),
        stars: String(earnedStars),
        resultId,
        source: 'daily',
        missed: missedLessonIds.join(','),
      },
    } as Href);
  }

  function handleAnswer(answerId: string) {
    if (!currentQuestion || !questions || selectedAnswerId || isFinishing) {
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
      const isLast = currentQuestionIndex === questions.length - 1;
      if (isLast || nextLives <= 0) {
        void finishQuiz(nextScore);
        return;
      }
      setCurrentQuestionIndex((index) => index + 1);
      setSelectedAnswerId(null);
    }, isCorrect ? 900 : 1200);
  }

  if (questions === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Building today’s quiz…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Daily quiz unavailable</Text>
          <Text style={styles.notFoundBody}>
            Need at least 4 illustrated signs. Start with Alphabet.
          </Text>
          <Pressable
            onPress={() => router.replace('/module/alphabet' as Href)}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>Open Alphabet</Text>
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
        <View style={styles.header}>
          <View style={styles.quizHeading}>
            <Text style={styles.title}>Daily Quiz</Text>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                Q {currentQuestionIndex + 1}/{questions.length}
              </Text>
            </View>
          </View>
          <View style={styles.hearts} accessibilityLabel={`${lives} lives left`}>
            {[0, 1, 2].map((heart) => (
              <Ionicons
                key={heart}
                name={heart < lives ? 'heart' : 'heart-outline'}
                size={22}
                color={heart < lives ? colors.accent : colors.disabled}
              />
            ))}
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {promptImage ? (
            <View style={styles.promptImageContainer}>
              <Image
                source={promptImage}
                style={styles.promptImage}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
          ) : (
            <View style={styles.promptLabelContainer}>
              <Text
                style={
                  currentQuestion.format === 'description-to-image'
                    ? styles.promptDescription
                    : styles.promptLabel
                }
              >
                {currentQuestion.format === 'description-to-image'
                  ? currentQuestion.prompt.sign.description
                  : currentQuestion.prompt.sign.label}
              </Text>
            </View>
          )}

          <Text style={styles.question}>
            {currentQuestion.format === 'image-to-label'
              ? 'What sign is this?'
              : currentQuestion.format === 'description-to-image'
                ? 'Which sign matches this description?'
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
                ? 'Correct! +10 XP'
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  quizHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  questionBadge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  questionBadgeText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.signSurface,
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
  promptDescription: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
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
    fontSize: fontSize.base,
  },
});
