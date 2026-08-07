import {
  getLearningModule,
  lessonHasQuizMedia,
  type LearningModuleId,
  type Lesson,
} from './learning';

export type ModuleUnit = {
  id: string;
  moduleId: LearningModuleId;
  /** Short range label on the path island, e.g. "0-4". */
  title: string;
  /** Longer label for headers. */
  label: string;
  /** Sign ids within the module (letter, number, or vocab id). */
  signIds: string[];
  lessonIds: string[];
};

type UnitChunk = {
  id: string;
  title: string;
  label: string;
  signIds: string[];
};

function buildUnits(
  moduleId: LearningModuleId,
  chunks: UnitChunk[],
): ModuleUnit[] {
  return chunks.map((chunk) => ({
    id: chunk.id,
    moduleId,
    title: chunk.title,
    label: chunk.label,
    signIds: chunk.signIds,
    lessonIds: chunk.signIds.map((signId) => `${moduleId}-${signId}`),
  }));
}

export const ALPHABET_UNITS: ModuleUnit[] = buildUnits('alphabet', [
  {
    id: 'alphabet-ag',
    title: 'A-G',
    label: 'Letters A to G',
    signIds: 'abcdefg'.split(''),
  },
  {
    id: 'alphabet-hn',
    title: 'H-N',
    label: 'Letters H to N',
    signIds: 'hijklmn'.split(''),
  },
  {
    id: 'alphabet-ot',
    title: 'O-T',
    label: 'Letters O to T',
    signIds: 'opqrst'.split(''),
  },
  {
    id: 'alphabet-uz',
    title: 'U-Z',
    label: 'Letters U to Z',
    signIds: 'uvwxyz'.split(''),
  },
]);

/** Numbers 0-9 in two mastery blocks. */
export const NUMBERS_UNITS: ModuleUnit[] = buildUnits('numbers', [
  {
    id: 'numbers-04',
    title: '0-4',
    label: 'Numbers 0 to 4',
    signIds: ['0', '1', '2', '3', '4'],
  },
  {
    id: 'numbers-59',
    title: '5-9',
    label: 'Numbers 5 to 9',
    signIds: ['5', '6', '7', '8', '9'],
  },
]);

/**
 * Conversation units (ready once illustrations exist).
 * Path stays lesson-based until the module has enough quiz media.
 */
export const CONVERSATION_UNITS: ModuleUnit[] = buildUnits('conversation', [
  {
    id: 'conversation-greetings',
    title: 'Greet',
    label: 'Greetings',
    signIds: [
      'hello',
      'goodbye',
      'good-morning',
      'meet-you',
      'nice-to-meet-you',
    ],
  },
  {
    id: 'conversation-courtesy',
    title: 'Courtesy',
    label: 'Courtesy',
    signIds: [
      'im-fine',
      'excuse-me',
      'thank-you',
      'youre-welcome',
      'please',
    ],
  },
  {
    id: 'conversation-basics',
    title: 'Basics',
    label: 'Yes, no, again',
    signIds: ['again', 'yes', 'no'],
  },
]);

const ALL_UNITS: ModuleUnit[] = [
  ...ALPHABET_UNITS,
  ...NUMBERS_UNITS,
  ...CONVERSATION_UNITS,
];

export function getUnitsForModule(moduleId: string): ModuleUnit[] {
  if (moduleId === 'alphabet') {
    return ALPHABET_UNITS;
  }
  if (moduleId === 'numbers') {
    return NUMBERS_UNITS;
  }
  if (moduleId === 'conversation') {
    return CONVERSATION_UNITS;
  }
  return [];
}

/** Modules that use unit islands on the path when media is ready enough. */
export function moduleUsesUnitPath(moduleId: string): boolean {
  if (moduleId === 'alphabet' || moduleId === 'numbers') {
    return true;
  }
  if (moduleId === 'conversation') {
    const module = getLearningModule('conversation');
    if (!module) {
      return false;
    }
    // Need at least 4 illustrated signs so a unit session can run.
    return getModuleMediaLessonsSafe(module) >= 4;
  }
  return false;
}

function getModuleMediaLessonsSafe(module: {
  lessons: Lesson[];
}): number {
  return module.lessons.filter((lesson) => lessonHasQuizMedia(lesson)).length;
}

export function getModuleUnit(unitId: string): ModuleUnit | undefined {
  return ALL_UNITS.find((unit) => unit.id === unitId);
}

export function getUnitLessons(unit: ModuleUnit): Lesson[] {
  const module = getLearningModule(unit.moduleId);
  if (!module) {
    return [];
  }
  const byId = new Map(module.lessons.map((lesson) => [lesson.id, lesson]));
  return unit.lessonIds
    .map((id) => byId.get(id))
    .filter((lesson): lesson is Lesson => Boolean(lesson));
}

export function getUnitMediaLessons(unit: ModuleUnit): Lesson[] {
  return getUnitLessons(unit).filter((lesson) => lessonHasQuizMedia(lesson));
}

export function isUnitComplete(
  unit: ModuleUnit,
  completedIds: string[],
): boolean {
  return unit.lessonIds.every((id) => completedIds.includes(id));
}

export function getCurrentModuleUnit(
  moduleId: string,
  completedIds: string[],
): ModuleUnit | null {
  const units = getUnitsForModule(moduleId);
  if (units.length === 0) {
    return null;
  }
  return (
    units.find((unit) => !isUnitComplete(unit, completedIds)) ??
    units[units.length - 1]
  );
}

export function getModuleUnitForLesson(
  lessonId: string,
): ModuleUnit | undefined {
  return ALL_UNITS.find((unit) => unit.lessonIds.includes(lessonId));
}

export function isModuleUnitUnlocked(
  unitId: string,
  completedIds: string[],
): boolean {
  const unit = getModuleUnit(unitId);
  if (!unit) {
    return false;
  }
  const units = getUnitsForModule(unit.moduleId);
  const index = units.findIndex((item) => item.id === unitId);
  if (index < 0) {
    return false;
  }
  for (let i = 0; i < index; i += 1) {
    if (!isUnitComplete(units[i], completedIds)) {
      return false;
    }
  }
  return true;
}

/** First incomplete lesson in the current unit (Mirror CTA). */
export function getCurrentUnitLesson(
  moduleId: string,
  completedIds: string[],
): Lesson | null {
  const unit = getCurrentModuleUnit(moduleId, completedIds);
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

export function unitQuizResultId(unit: ModuleUnit): string {
  return `unit-${unit.id}`;
}

/** @deprecated Prefer ModuleUnit / getModuleUnit. */
export type AlphabetUnit = ModuleUnit;
