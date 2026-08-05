import {
  getLearningModule,
  lessonHasQuizMedia,
  type Lesson,
} from './learning';

export type AlphabetUnit = {
  id: string;
  /** Short range label shown on the path island, e.g. "A-G". */
  title: string;
  /** Longer label for headers. */
  label: string;
  /** Inclusive letter ids from ASL letters, e.g. "a".."g". */
  letterIds: string[];
  lessonIds: string[];
};

const LETTER_CHUNKS: Array<{
  id: string;
  title: string;
  label: string;
  letters: string;
}> = [
  {
    id: 'alphabet-ag',
    title: 'A-G',
    label: 'Letters A to G',
    letters: 'abcdefg',
  },
  {
    id: 'alphabet-hn',
    title: 'H-N',
    label: 'Letters H to N',
    letters: 'hijklmn',
  },
  {
    id: 'alphabet-ot',
    title: 'O-T',
    label: 'Letters O to T',
    letters: 'opqrst',
  },
  {
    id: 'alphabet-uz',
    title: 'U-Z',
    label: 'Letters U to Z',
    letters: 'uvwxyz',
  },
];

export const ALPHABET_UNITS: AlphabetUnit[] = LETTER_CHUNKS.map((chunk) => {
  const letterIds = chunk.letters.split('');
  return {
    id: chunk.id,
    title: chunk.title,
    label: chunk.label,
    letterIds,
    lessonIds: letterIds.map((letter) => `alphabet-${letter}`),
  };
});

export function getAlphabetUnit(unitId: string): AlphabetUnit | undefined {
  return ALPHABET_UNITS.find((unit) => unit.id === unitId);
}

export function getUnitLessons(unit: AlphabetUnit): Lesson[] {
  const module = getLearningModule('alphabet');
  if (!module) {
    return [];
  }
  const byId = new Map(module.lessons.map((lesson) => [lesson.id, lesson]));
  return unit.lessonIds
    .map((id) => byId.get(id))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export function getUnitMediaLessons(unit: AlphabetUnit): Lesson[] {
  return getUnitLessons(unit).filter((lesson) => lessonHasQuizMedia(lesson));
}

export function isUnitComplete(
  unit: AlphabetUnit,
  completedIds: string[],
): boolean {
  return unit.lessonIds.every((id) => completedIds.includes(id));
}

export function getUnitCompletedCount(
  unit: AlphabetUnit,
  completedIds: string[],
): number {
  return unit.lessonIds.filter((id) => completedIds.includes(id)).length;
}

/** First incomplete unit, or the last unit when all are done. */
export function getCurrentAlphabetUnit(
  completedIds: string[],
): AlphabetUnit | null {
  if (ALPHABET_UNITS.length === 0) {
    return null;
  }
  return (
    ALPHABET_UNITS.find((unit) => !isUnitComplete(unit, completedIds)) ??
    ALPHABET_UNITS[ALPHABET_UNITS.length - 1]
  );
}

export function getAlphabetUnitForLesson(
  lessonId: string,
): AlphabetUnit | undefined {
  return ALPHABET_UNITS.find((unit) => unit.lessonIds.includes(lessonId));
}

/** True when this unit is open on the hard alphabet path. */
export function isAlphabetUnitUnlocked(
  unitId: string,
  completedIds: string[],
): boolean {
  const index = ALPHABET_UNITS.findIndex((unit) => unit.id === unitId);
  if (index < 0) {
    return false;
  }
  for (let i = 0; i < index; i += 1) {
    if (!isUnitComplete(ALPHABET_UNITS[i], completedIds)) {
      return false;
    }
  }
  return true;
}

/** First incomplete letter in the current unit (for Mirror CTA). */
export function getCurrentAlphabetLetter(
  completedIds: string[],
): Lesson | null {
  const unit = getCurrentAlphabetUnit(completedIds);
  if (!unit) {
    return null;
  }
  const lessons = getUnitLessons(unit);
  return (
    lessons.find((lesson) => !completedIds.includes(lesson.id)) ??
    lessons[0] ??
    null
  );
}

export function unitQuizResultId(unit: AlphabetUnit): string {
  return `unit-${unit.id}`;
}
