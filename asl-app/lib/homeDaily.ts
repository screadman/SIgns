import {
  LEARNING_MODULES,
  lessonHasQuizMedia,
} from '../constants/learning';
import {
  getDailyQuizSession,
  getTodayPracticeIndex,
  isDailyCompleted,
  isPracticeDayToday,
  questionCountForDailyMinutes,
  type DailyQuizSession,
} from './dailyQuizStorage';
import {
  getOnboardingProfile,
  type DailyGoalMinutes,
} from './onboardingStorage';

export type HomeDailyState = 'pending' | 'done' | 'off_day' | 'blocked';

export type HomeDailyCtaAction =
  | 'daily'
  | 'alphabet'
  | 'missed'
  | 'missed_quiz'
  | 'next_lesson'
  | 'none';

export type HomeDailyCard = {
  state: HomeDailyState;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: HomeDailyCtaAction;
  /** Optional secondary link (ex: Bonus quiz on off days). */
  secondaryCtaLabel: string | null;
  secondaryCtaAction: HomeDailyCtaAction | null;
  headline: string;
  dailyMinutes: DailyGoalMinutes;
  questionCount: number;
  session: DailyQuizSession | null;
  missedCount: number;
  nextPracticeDayLabel: string | null;
  mediaCount: number;
};

const DAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const MIN_MEDIA_FOR_DAILY = 4;

export function countMediaSigns(): number {
  return LEARNING_MODULES.reduce(
    (total, module) =>
      total +
      module.lessons.filter((lesson) => lessonHasQuizMedia(lesson)).length,
    0,
  );
}

export function getNextPracticeDayLabel(
  practiceDays: number[],
  date = new Date(),
): string | null {
  if (!practiceDays.length) {
    return null;
  }

  const sorted = [...new Set(practiceDays)].sort((a, b) => a - b);
  const today = getTodayPracticeIndex(date);

  for (let offset = 1; offset <= 7; offset += 1) {
    const idx = (today + offset) % 7;
    if (sorted.includes(idx)) {
      return DAY_LABELS[idx];
    }
  }

  return DAY_LABELS[sorted[0]] ?? null;
}

export async function getHomeDailyCard(): Promise<HomeDailyCard> {
  const [profile, session] = await Promise.all([
    getOnboardingProfile(),
    getDailyQuizSession(),
  ]);

  const practiceDays = profile?.practiceDays ?? [0, 1, 2, 3, 4, 5, 6];
  const dailyMinutes = (profile?.dailyMinutes ?? 5) as DailyGoalMinutes;
  const questionCount = questionCountForDailyMinutes(dailyMinutes);
  const mediaCount = countMediaSigns();
  const practiceToday = isPracticeDayToday(practiceDays);
  const completed = isDailyCompleted(session);
  const missedCount = session?.missedLessonIds?.length ?? 0;
  const score = session?.score;
  const nextPracticeDayLabel = getNextPracticeDayLabel(practiceDays);

  if (mediaCount < MIN_MEDIA_FOR_DAILY) {
    return {
      state: 'blocked',
      title: 'Unlock more signs',
      subtitle: 'Learn a few illustrated signs first, then your Daily unlocks.',
      ctaLabel: 'Go to Alphabet',
      ctaAction: 'alphabet',
      secondaryCtaLabel: null,
      secondaryCtaAction: null,
      headline: 'Start with the Alphabet',
      dailyMinutes,
      questionCount,
      session,
      missedCount,
      nextPracticeDayLabel,
      mediaCount,
    };
  }

  if (!practiceToday) {
    const day = nextPracticeDayLabel ?? 'soon';
    return {
      state: 'off_day',
      title: `Next practice: ${day}`,
      subtitle: 'Rest day. Your streak stays safe.',
      ctaLabel: 'Browse a lesson',
      ctaAction: 'next_lesson',
      secondaryCtaLabel: 'Bonus quiz',
      secondaryCtaAction: 'daily',
      headline: `Rest day. See you ${day}.`,
      dailyMinutes,
      questionCount,
      session,
      missedCount,
      nextPracticeDayLabel,
      mediaCount,
    };
  }

  if (completed) {
    const scoreLabel =
      typeof score === 'number'
        ? `${score}/${session?.questionCount ?? questionCount}`
        : 'done';

    if (missedCount > 0) {
      return {
        state: 'done',
        title: `Streak safe · ${scoreLabel}`,
        subtitle: `${missedCount} sign${missedCount === 1 ? '' : 's'} to review.`,
        ctaLabel: `Review ${missedCount} missed`,
        ctaAction: 'missed',
        secondaryCtaLabel: 'Quiz missed signs',
        secondaryCtaAction: 'missed_quiz',
        headline: 'Great streak! Keep it up!',
        dailyMinutes,
        questionCount,
        session,
        missedCount,
        nextPracticeDayLabel,
        mediaCount,
      };
    }

    return {
      state: 'done',
      title: `Streak safe · ${scoreLabel}`,
      subtitle: "Today's quiz is done. Nice work.",
      ctaLabel: 'Great job',
      ctaAction: 'none',
      secondaryCtaLabel: null,
      secondaryCtaAction: null,
      headline: 'Great streak! Keep it up!',
      dailyMinutes,
      questionCount,
      session,
      missedCount,
      nextPracticeDayLabel,
      mediaCount,
    };
  }

  return {
    state: 'pending',
    title: `Today's quiz · ~${dailyMinutes}m`,
    subtitle: `${questionCount} questions. Completing it secures your streak.`,
    ctaLabel: 'Start quiz',
    ctaAction: 'daily',
    secondaryCtaLabel: null,
    secondaryCtaAction: null,
    headline: "Ready for today's signs?",
    dailyMinutes,
    questionCount,
    session,
    missedCount,
    nextPracticeDayLabel,
    mediaCount,
  };
}
