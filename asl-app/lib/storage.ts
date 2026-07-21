import AsyncStorage from '@react-native-async-storage/async-storage';

export const COMPLETED_LESSONS_KEY = 'completed_lessons';
export const STARS_KEY = 'stars';

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
  await AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(updatedLessons));

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
