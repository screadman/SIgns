import AsyncStorage from '@react-native-async-storage/async-storage';

export const COMPLETED_LESSONS_KEY = 'completed_lessons';

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
