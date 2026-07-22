import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  LEARNING_MODULES,
  type Lesson,
} from '../constants/learning';

export const COMPLETED_LESSONS_KEY = 'completed_lessons';
export const STARS_KEY = 'stars';
export const XP_KEY = 'xp';
export const ACTIVITY_DATES_KEY = 'activity_dates';
export const LAST_QUIZ_RESULT_ID_KEY = 'last_quiz_result_id';

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

  return updatedLessons;
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

async function getQuizResultSnapshot(): Promise<QuizResultSnapshot> {
  const [completedLessons, stars, xp, streak, nextLesson] = await Promise.all([
    getCompletedLessons(),
    getStars(),
    getTotalXP(),
    calculateStreak(),
    getNextLesson(),
  ]);

  return {
    completedLessons,
    stars,
    xp,
    streak,
    nextLesson,
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
  await AsyncStorage.setItem(LAST_QUIZ_RESULT_ID_KEY, resultId);

  return getQuizResultSnapshot();
}
