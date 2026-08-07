import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyGoalMinutes } from './onboardingStorage';
import { startStreakToday } from './storage';

export const DAILY_QUIZ_PREFIX = 'daily_quiz_';

export type DailyQuizSession = {
  dayKey: string;
  /** Deterministic seed for this day's deck. */
  seed: number;
  /** Lesson ids (moduleId-signId) selected for today's daily. */
  questionLessonIds: string[];
  questionCount: number;
  score: number | null;
  completedAt: string | null;
  missedLessonIds: string[];
};

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dailyKey(dayKey = toDayKey(new Date())) {
  return `${DAILY_QUIZ_PREFIX}${dayKey}`;
}

export function questionCountForDailyMinutes(
  minutes: DailyGoalMinutes | null | undefined,
): number {
  if (minutes === 10) return 8;
  if (minutes === 15 || minutes === 20) return 10;
  return 5;
}

/** 0 = Monday ... 6 = Sunday (matches onboarding practiceDays). */
export function getTodayPracticeIndex(date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isPracticeDayToday(
  practiceDays: number[] | null | undefined,
  date = new Date(),
): boolean {
  if (!practiceDays || practiceDays.length === 0) {
    return true;
  }
  return practiceDays.includes(getTodayPracticeIndex(date));
}

export async function getDailyQuizSession(
  dayKey = toDayKey(new Date()),
): Promise<DailyQuizSession | null> {
  const raw = await AsyncStorage.getItem(dailyKey(dayKey));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DailyQuizSession;
  } catch {
    return null;
  }
}

export async function saveDailyQuizSession(
  session: DailyQuizSession,
): Promise<DailyQuizSession> {
  await AsyncStorage.setItem(dailyKey(session.dayKey), JSON.stringify(session));
  return session;
}

/**
 * Returns today's session if present; otherwise creates a shell session.
 * Question ids are filled later by the daily generator (Phase 1).
 */
export async function getOrCreateDailyQuizSession(input: {
  questionCount: number;
  questionLessonIds?: string[];
  seed?: number;
}): Promise<DailyQuizSession> {
  const dayKey = toDayKey(new Date());
  const existing = await getDailyQuizSession(dayKey);

  if (existing) {
    return existing;
  }

  const session: DailyQuizSession = {
    dayKey,
    seed: input.seed ?? Date.now(),
    questionLessonIds: input.questionLessonIds ?? [],
    questionCount: input.questionCount,
    score: null,
    completedAt: null,
    missedLessonIds: [],
  };

  return saveDailyQuizSession(session);
}

export async function attachDailyQuestions(
  questionLessonIds: string[],
): Promise<DailyQuizSession> {
  const dayKey = toDayKey(new Date());
  const current =
    (await getDailyQuizSession(dayKey)) ??
    (await getOrCreateDailyQuizSession({
      questionCount: questionLessonIds.length,
      questionLessonIds,
    }));

  if (current.questionLessonIds.length > 0) {
    return current;
  }

  return saveDailyQuizSession({
    ...current,
    questionLessonIds,
    questionCount: questionLessonIds.length,
  });
}

export type CompleteDailyInput = {
  score: number;
  missedLessonIds: string[];
  /** When true (practice day), marks activity for streak. */
  secureStreak: boolean;
};

export async function completeDailyQuizSession(
  input: CompleteDailyInput,
): Promise<DailyQuizSession> {
  const dayKey = toDayKey(new Date());
  const current =
    (await getDailyQuizSession(dayKey)) ??
    (await getOrCreateDailyQuizSession({
      questionCount: Math.max(1, input.score),
    }));

  const completed: DailyQuizSession = {
    ...current,
    score: Math.max(0, Math.floor(input.score)),
    completedAt: current.completedAt ?? new Date().toISOString(),
    missedLessonIds: input.missedLessonIds,
  };

  await saveDailyQuizSession(completed);

  if (input.secureStreak) {
    await startStreakToday();
  }

  return completed;
}

export function isDailyCompleted(
  session: DailyQuizSession | null | undefined,
): boolean {
  return Boolean(session?.completedAt);
}
