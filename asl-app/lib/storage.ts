import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BADGES,
  type BadgeId,
} from '../constants/badges';
import {
  LEARNING_MODULES,
  getLearningModule,
  type Lesson,
} from '../constants/learning';
import { getLevel } from './levels';

export const COMPLETED_LESSONS_KEY = 'completed_lessons';
export const STARS_KEY = 'stars';
export const XP_KEY = 'xp';
export const ACTIVITY_DATES_KEY = 'activity_dates';
export const LAST_QUIZ_RESULT_ID_KEY = 'last_quiz_result_id';
export const UNLOCKED_BADGES_KEY = 'unlocked_badges';
export const FAVORITE_LESSONS_KEY = 'favorite_lesson_ids';
export const DAILY_CHALLENGES_PREFIX = 'daily_challenges_';

export type DailyChallengeProgress = {
  signsLearned: number;
  quizzesFinished: number;
  correctAnswers: number;
};

const EMPTY_DAILY_PROGRESS: DailyChallengeProgress = {
  signsLearned: 0,
  quizzesFinished: 0,
  correctAnswers: 0,
};

export type QuizResultInput = {
  lessonId: string;
  score: number;
  total: number;
  xp: number;
  stars: number;
  resultId?: string;
};

export type QuizResultSnapshot = {
  completedLessons: string[];
  stars: number;
  xp: number;
  streak: number;
  nextLesson: Lesson | null;
  unlockedBadges: BadgeId[];
};

export type BadgeCheckContext = {
  score?: number;
  total?: number;
};

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function shiftDayKey(dayKey: string, offset: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offset);

  return toDayKey(date);
}

export async function getCompletedLessons(): Promise<string[]> {
  const storedValue = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const lessonIds = parsedValue.filter(
      (lessonId): lessonId is string => typeof lessonId === 'string',
    );

    return [...new Set(lessonIds)];
  } catch {
    return [];
  }
}

export async function saveCompletedLesson(lessonId: string): Promise<string[]> {
  const normalizedLessonId = lessonId.trim();

  if (!normalizedLessonId) {
    return getCompletedLessons();
  }

  const completedLessons = await getCompletedLessons();

  if (completedLessons.includes(normalizedLessonId)) {
    return completedLessons;
  }

  const updatedLessons = [...completedLessons, normalizedLessonId];
  await AsyncStorage.setItem(
    COMPLETED_LESSONS_KEY,
    JSON.stringify(updatedLessons),
  );
  await recordDailyChallengeProgress({ signsLearned: 1 });

  return updatedLessons;
}

export async function getFavoriteLessons(): Promise<string[]> {
  const storedValue = await AsyncStorage.getItem(FAVORITE_LESSONS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const lessonIds = parsedValue.filter(
      (lessonId): lessonId is string => typeof lessonId === 'string',
    );

    return [...new Set(lessonIds)];
  } catch {
    return [];
  }
}

export function isFavoriteLesson(
  lessonId: string,
  favoriteLessonIds: string[],
): boolean {
  return favoriteLessonIds.includes(lessonId);
}

export async function toggleFavoriteLesson(lessonId: string): Promise<string[]> {
  const normalizedLessonId = lessonId.trim();

  if (!normalizedLessonId) {
    return getFavoriteLessons();
  }

  const favorites = await getFavoriteLessons();
  const updatedFavorites = favorites.includes(normalizedLessonId)
    ? favorites.filter((id) => id !== normalizedLessonId)
    : [...favorites, normalizedLessonId];

  await AsyncStorage.setItem(
    FAVORITE_LESSONS_KEY,
    JSON.stringify(updatedFavorites),
  );

  return updatedFavorites;
}

function dailyChallengeStorageKey(dayKey = toDayKey(new Date())): string {
  return `${DAILY_CHALLENGES_PREFIX}${dayKey}`;
}

export async function getDailyChallengeProgress(): Promise<DailyChallengeProgress> {
  const storedValue = await AsyncStorage.getItem(dailyChallengeStorageKey());

  if (!storedValue) {
    return { ...EMPTY_DAILY_PROGRESS };
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return { ...EMPTY_DAILY_PROGRESS };
    }

    const record = parsedValue as Record<string, unknown>;

    return {
      signsLearned: Math.max(0, Math.floor(Number(record.signsLearned) || 0)),
      quizzesFinished: Math.max(
        0,
        Math.floor(Number(record.quizzesFinished) || 0),
      ),
      correctAnswers: Math.max(
        0,
        Math.floor(Number(record.correctAnswers) || 0),
      ),
    };
  } catch {
    return { ...EMPTY_DAILY_PROGRESS };
  }
}

export async function recordDailyChallengeProgress(
  delta: Partial<DailyChallengeProgress>,
): Promise<DailyChallengeProgress> {
  const current = await getDailyChallengeProgress();
  const updated: DailyChallengeProgress = {
    signsLearned: current.signsLearned + Math.max(0, delta.signsLearned ?? 0),
    quizzesFinished:
      current.quizzesFinished + Math.max(0, delta.quizzesFinished ?? 0),
    correctAnswers:
      current.correctAnswers + Math.max(0, delta.correctAnswers ?? 0),
  };

  await AsyncStorage.setItem(
    dailyChallengeStorageKey(),
    JSON.stringify(updated),
  );

  return updated;
}

export async function getStars(): Promise<number> {
  const storedValue = await AsyncStorage.getItem(STARS_KEY);

  if (!storedValue) {
    return 0;
  }

  const stars = Number(storedValue);

  return Number.isFinite(stars) && stars >= 0 ? Math.floor(stars) : 0;
}

export async function addStars(earnedStars: number): Promise<number> {
  const normalizedStars = Math.max(0, Math.floor(earnedStars));
  const currentStars = await getStars();
  const updatedStars = currentStars + normalizedStars;

  await AsyncStorage.setItem(STARS_KEY, String(updatedStars));

  return updatedStars;
}

export async function getTotalXP(): Promise<number> {
  const storedValue = await AsyncStorage.getItem(XP_KEY);

  if (!storedValue) {
    return 0;
  }

  const xp = Number(storedValue);

  return Number.isFinite(xp) && xp >= 0 ? Math.floor(xp) : 0;
}

export async function getXP(): Promise<number> {
  return getTotalXP();
}

async function addXP(earnedXp: number): Promise<number> {
  const normalizedXp = Math.max(0, Math.floor(earnedXp));
  const currentXp = await getTotalXP();
  const updatedXp = currentXp + normalizedXp;

  await AsyncStorage.setItem(XP_KEY, String(updatedXp));

  return updatedXp;
}

async function getActivityDates(): Promise<string[]> {
  const storedValue = await AsyncStorage.getItem(ACTIVITY_DATES_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const dates = parsedValue.filter(
      (value): value is string =>
        typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value),
    );

    return [...new Set(dates)].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  } catch {
    return [];
  }
}

async function recordActivityToday(): Promise<string[]> {
  const today = toDayKey(new Date());
  const dates = await getActivityDates();

  if (dates[0] === today) {
    return dates;
  }

  const updatedDates = [today, ...dates.filter((date) => date !== today)];
  await AsyncStorage.setItem(ACTIVITY_DATES_KEY, JSON.stringify(updatedDates));

  return updatedDates;
}

export async function calculateStreak(): Promise<number> {
  const dates = await getActivityDates();

  if (dates.length === 0) {
    return 0;
  }

  const today = toDayKey(new Date());
  const yesterday = shiftDayKey(today, -1);
  let cursor = dates[0];

  if (cursor !== today && cursor !== yesterday) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const expected = shiftDayKey(cursor, -1);

    if (dates[index] !== expected) {
      break;
    }

    streak += 1;
    cursor = dates[index];
  }

  return streak;
}

export async function getNextLesson(): Promise<Lesson | null> {
  const completedLessons = await getCompletedLessons();

  for (const module of LEARNING_MODULES) {
    for (const lesson of module.lessons) {
      if (!completedLessons.includes(lesson.id)) {
        return lesson;
      }
    }
  }

  return null;
}

export async function getUnlockedBadges(): Promise<BadgeId[]> {
  const storedValue = await AsyncStorage.getItem(UNLOCKED_BADGES_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const validIds = new Set(BADGES.map((badge) => badge.id));

    return [
      ...new Set(
        parsedValue.filter(
          (value): value is BadgeId =>
            typeof value === 'string' && validIds.has(value as BadgeId),
        ),
      ),
    ];
  } catch {
    return [];
  }
}

function isModuleFullyComplete(
  moduleId: 'alphabet' | 'numbers',
  completedLessonIds: string[],
): boolean {
  const module = getLearningModule(moduleId);

  if (!module) {
    return false;
  }

  return module.lessons.every((lesson) =>
    completedLessonIds.includes(lesson.id),
  );
}

export async function checkAndUnlockBadges(
  context: BadgeCheckContext = {},
): Promise<BadgeId[]> {
  const [unlockedBadges, completedLessons, streak, xp] = await Promise.all([
    getUnlockedBadges(),
    getCompletedLessons(),
    calculateStreak(),
    getTotalXP(),
  ]);

  const unlockedSet = new Set(unlockedBadges);
  const newlyUnlocked: BadgeId[] = [];
  const level = getLevel(xp).level;
  const hasPerfectScore =
    typeof context.score === 'number' &&
    typeof context.total === 'number' &&
    context.total > 0 &&
    context.score >= context.total;

  const conditions: Record<BadgeId, boolean> = {
    'first-sign': completedLessons.length >= 1,
    'perfect-score': hasPerfectScore,
    'alphabet-ace': isModuleFullyComplete('alphabet', completedLessons),
    'number-pro': isModuleFullyComplete('numbers', completedLessons),
    'on-fire': streak >= 3,
    'rising-star': level >= 5,
  };

  for (const badge of BADGES) {
    if (unlockedSet.has(badge.id) || !conditions[badge.id]) {
      continue;
    }

    newlyUnlocked.push(badge.id);
    unlockedSet.add(badge.id);
  }

  if (newlyUnlocked.length > 0) {
    await AsyncStorage.setItem(
      UNLOCKED_BADGES_KEY,
      JSON.stringify([...unlockedSet]),
    );
  }

  return newlyUnlocked;
}

async function getQuizResultSnapshot(): Promise<QuizResultSnapshot> {
  const [completedLessons, stars, xp, streak, nextLesson, unlockedBadges] =
    await Promise.all([
      getCompletedLessons(),
      getStars(),
      getTotalXP(),
      calculateStreak(),
      getNextLesson(),
      getUnlockedBadges(),
    ]);

  return {
    completedLessons,
    stars,
    xp,
    streak,
    nextLesson,
    unlockedBadges,
  };
}

export async function saveQuizResult(
  input: QuizResultInput,
): Promise<QuizResultSnapshot> {
  const lessonId = input.lessonId.trim();
  const xp = Math.max(0, Math.floor(input.xp));
  const stars = Math.max(0, Math.floor(input.stars));
  const resultId =
    input.resultId?.trim() ||
    `${lessonId}:${input.score}:${input.total}:${xp}:${stars}`;

  if (!lessonId) {
    return getQuizResultSnapshot();
  }

  const lastResultId = await AsyncStorage.getItem(LAST_QUIZ_RESULT_ID_KEY);

  if (lastResultId === resultId) {
    return getQuizResultSnapshot();
  }

  await saveCompletedLesson(lessonId);
  await addStars(stars);
  await addXP(xp);
  await recordActivityToday();
  await recordDailyChallengeProgress({
    quizzesFinished: 1,
    correctAnswers: Math.max(0, Math.floor(input.score)),
  });
  await AsyncStorage.setItem(LAST_QUIZ_RESULT_ID_KEY, resultId);

  return getQuizResultSnapshot();
}
