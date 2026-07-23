import { ASL_LETTERS, ASL_NUMBERS, type AslGlyph } from './aslLetters';
import { CONVERSATION_SIGNS, type VocabSign } from './conversation';
import { colors } from './theme';
import { WH_QUESTION_SIGNS } from './whQuestions';

export type LearningModuleId =
  | 'alphabet'
  | 'conversation'
  | 'wh-questions'
  | 'numbers';

export type LearningModuleIcon =
  | 'close-circle-outline'
  | 'apps-outline'
  | 'chatbubbles-outline'
  | 'help-circle-outline';

export type Lesson = {
  id: string;
  moduleId: LearningModuleId;
  title: string;
  sign: AslGlyph;
};

export type LearningModule = {
  id: LearningModuleId;
  title: string;
  description: string;
  icon: LearningModuleIcon;
  color: string;
  surfaceColor: string;
  /** Solid fill for the Learn grid tile. */
  tileColor: string;
  /** When true, module screen uses a vertical sign list instead of letter bubbles. */
  listLayout: boolean;
  lessons: Lesson[];
};

function createGlyphLessons(
  moduleId: 'alphabet' | 'numbers',
  signs: AslGlyph[],
  label: 'Letter' | 'Number',
): Lesson[] {
  return signs.map((sign) => ({
    id: `${moduleId}-${sign.id}`,
    moduleId,
    title: `${label} ${sign.label}`,
    sign,
  }));
}

function createVocabLessons(
  moduleId: 'conversation' | 'wh-questions',
  signs: VocabSign[],
): Lesson[] {
  return signs.map((sign) => ({
    id: `${moduleId}-${sign.id}`,
    moduleId,
    title: sign.label,
    sign: {
      id: sign.id,
      label: sign.label,
      description: sign.description,
      tip: sign.tip,
    },
  }));
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'alphabet',
    title: 'Alphabet',
    description: 'Learn the 26 letters of the American Sign Language alphabet.',
    icon: 'close-circle-outline',
    color: colors.primary,
    surfaceColor: colors.primarySurface,
    tileColor: '#F472B6',
    listLayout: false,
    lessons: createGlyphLessons('alphabet', ASL_LETTERS, 'Letter'),
  },
  {
    id: 'wh-questions',
    title: 'WH Questions',
    description: 'Ask what, where, when, who, why, how, and common question phrases.',
    icon: 'help-circle-outline',
    color: '#0D9488',
    surfaceColor: '#F0FDFA',
    tileColor: '#2DD4BF',
    listLayout: true,
    lessons: createVocabLessons('wh-questions', WH_QUESTION_SIGNS),
  },
  {
    id: 'conversation',
    title: 'Conversation',
    description: 'Greetings and everyday courtesy signs for first conversations.',
    icon: 'chatbubbles-outline',
    color: colors.secondary,
    surfaceColor: '#EFF6FF',
    tileColor: '#FB7185',
    listLayout: true,
    lessons: createVocabLessons('conversation', CONVERSATION_SIGNS),
  },
  {
    id: 'numbers',
    title: 'Numbers',
    description: 'Learn how to sign the first ten numbers with confidence.',
    icon: 'apps-outline',
    color: colors.accent,
    surfaceColor: colors.accentSurface,
    tileColor: '#FB923C',
    listLayout: false,
    lessons: createGlyphLessons('numbers', ASL_NUMBERS, 'Number'),
  },
];

export function getLearningModule(moduleId: string): LearningModule | undefined {
  return LEARNING_MODULES.find((module) => module.id === moduleId);
}

export function getLesson(
  lessonId: string,
): { lesson: Lesson; module: LearningModule; lessonIndex: number } | undefined {
  for (const module of LEARNING_MODULES) {
    const lessonIndex = module.lessons.findIndex((lesson) => lesson.id === lessonId);

    if (lessonIndex >= 0) {
      return {
        lesson: module.lessons[lessonIndex],
        module,
        lessonIndex,
      };
    }
  }

  return undefined;
}

export function isAlphabetComplete(completedLessonIds: string[]): boolean {
  const alphabetModule = getLearningModule('alphabet');

  if (!alphabetModule) {
    return false;
  }

  return alphabetModule.lessons.every((lesson) =>
    completedLessonIds.includes(lesson.id),
  );
}

/** All core modules stay open for free browsing. */
export function isModuleLocked(
  _moduleId: LearningModuleId,
  _completedLessonIds: string[],
): boolean {
  return false;
}

export function getModuleLessonUnit(moduleId: LearningModuleId): string {
  if (moduleId === 'alphabet') {
    return 'letters';
  }

  if (moduleId === 'numbers') {
    return 'numbers';
  }

  return 'signs';
}

export function lessonHasQuizMedia(lesson: Lesson): boolean {
  return typeof lesson.sign.image === 'number';
}

export function getFirstPracticeLesson(module: LearningModule): Lesson | null {
  return (
    module.lessons.find((lesson) => lessonHasQuizMedia(lesson)) ??
    module.lessons[0] ??
    null
  );
}
