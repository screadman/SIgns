import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Lesson } from '../constants/learning';
import { getSignStrengthMap } from './signStrength';

export const LAST_MISSED_LESSON_IDS_KEY = 'last_missed_lesson_ids';

export async function saveLastMissedLessonIds(
  lessonIds: string[],
): Promise<void> {
  await AsyncStorage.setItem(
    LAST_MISSED_LESSON_IDS_KEY,
    JSON.stringify(lessonIds),
  );
}

export async function getLastMissedLessonIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(LAST_MISSED_LESSON_IDS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

/**
 * Lesson ids for signs with a wrong answer inside the last N days
 * (newest first). Used by the Missed quiz preset.
 */
export async function getRecentWrongLessonIds(
  allLessons: Lesson[],
  withinDays = 7,
): Promise<string[]> {
  const map = await getSignStrengthMap();
  const now = Date.now();
  const windowMs = withinDays * 24 * 60 * 60 * 1000;
  const lessonBySignId = new Map(
    allLessons.map((lesson) => [lesson.sign.id, lesson.id]),
  );

  return Object.entries(map)
    .filter(([, entry]) => {
      if (!entry.lastWrongAt) {
        return false;
      }
      const wrongAt = Date.parse(entry.lastWrongAt);
      return Number.isFinite(wrongAt) && now - wrongAt < windowMs;
    })
    .sort((a, b) => {
      const aAt = Date.parse(a[1].lastWrongAt ?? '');
      const bAt = Date.parse(b[1].lastWrongAt ?? '');
      return bAt - aAt;
    })
    .map(([signId]) => lessonBySignId.get(signId))
    .filter((id): id is string => Boolean(id));
}

/**
 * Prefers last-session misses, then fills with wrongs from the last 7 days.
 */
export async function resolveMissedLessonIds(
  allLessons: Lesson[],
): Promise<string[]> {
  const lastSession = await getLastMissedLessonIds();
  const recentWrong = await getRecentWrongLessonIds(allLessons, 7);
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const id of [...lastSession, ...recentWrong]) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    merged.push(id);
  }

  return merged;
}

export function resolveLessonsByIds(
  allLessons: Lesson[],
  lessonIds: string[],
): Lesson[] {
  const byId = new Map(allLessons.map((lesson) => [lesson.id, lesson]));
  return lessonIds
    .map((id) => byId.get(id))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}
