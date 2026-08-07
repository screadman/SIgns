import { ASL_LETTERS, ASL_NUMBERS, hasMediaAsset, type AslGlyph } from './aslLetters';
import { CONVERSATION_SIGNS, type VocabSign } from './conversation';
import {
  ANIMALS_SIGNS,
  BODY_PARTS_SIGNS,
  EMOTIONS_SIGNS,
  FOOD_SIGNS,
  INTERNET_SIGNS,
  SCHOOL_SIGNS,
  SPORTS_SIGNS,
  WORK_SIGNS,
} from './dictionaryCategories';
import { colors } from './theme';
import { WH_QUESTION_SIGNS } from './whQuestions';
import { peekSignImage } from '../lib/signImages';

export type LearningModuleId =
  | 'alphabet'
  | 'conversation'
  | 'wh-questions'
  | 'numbers'
  | 'emotions'
  | 'animals'
  | 'food'
  | 'body-parts'
  | 'work'
  | 'internet'
  | 'school'
  | 'sports';

export type LearningModuleIcon =
  | 'text-outline'
  | 'apps-outline'
  | 'chatbubbles-outline'
  | 'help-circle-outline'
  | 'happy-outline'
  | 'paw-outline'
  | 'restaurant-outline'
  | 'body-outline'
  | 'briefcase-outline'
  | 'globe-outline'
  | 'school-outline'
  | 'football-outline';

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
  /** Solid fill for module tiles in practice pickers. */
  tileColor: string;
  /** When true, module screen uses a vertical sign list instead of letter bubbles. */
  listLayout: boolean;
  lessons: Lesson[];
};

type VocabModuleId = Exclude<LearningModuleId, 'alphabet' | 'numbers'>;

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

function createVocabLessons(moduleId: VocabModuleId, signs: VocabSign[]): Lesson[] {
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

function vocabModule(
  id: VocabModuleId,
  title: string,
  description: string,
  icon: LearningModuleIcon,
  tileColor: string,
  color: string,
  surfaceColor: string,
  signs: VocabSign[],
): LearningModule {
  return {
    id,
    title,
    description,
    icon,
    color,
    surfaceColor,
    tileColor,
    listLayout: true,
    lessons: createVocabLessons(id, signs),
  };
}

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'alphabet',
    title: 'Alphabet',
    description: 'Learn the 26 letters of the American Sign Language alphabet.',
    icon: 'text-outline',
    color: colors.primary,
    surfaceColor: colors.primarySurface,
    tileColor: '#F472B6',
    listLayout: false,
    lessons: createGlyphLessons('alphabet', ASL_LETTERS, 'Letter'),
  },
  vocabModule(
    'wh-questions',
    'Questions',
    'Ask what, where, when, who, why, how, and common question phrases.',
    'help-circle-outline',
    '#2DD4BF',
    '#0D9488',
    '#F0FDFA',
    WH_QUESTION_SIGNS,
  ),
  vocabModule(
    'conversation',
    'Conversation',
    'Greetings and everyday courtesy signs for first conversations.',
    'chatbubbles-outline',
    '#FB7185',
    colors.secondary,
    '#EFF6FF',
    CONVERSATION_SIGNS,
  ),
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
  vocabModule(
    'emotions',
    'Emotions',
    'Feelings and facial expression based signs.',
    'happy-outline',
    '#A7F3D0',
    '#059669',
    '#ECFDF5',
    EMOTIONS_SIGNS,
  ),
  vocabModule(
    'animals',
    'Animals',
    'Common animal signs for everyday talk.',
    'paw-outline',
    '#BFDBFE',
    '#2563EB',
    '#EFF6FF',
    ANIMALS_SIGNS,
  ),
  vocabModule(
    'food',
    'Food',
    'Eating, drinking, and basic food vocabulary.',
    'restaurant-outline',
    '#BBF7D0',
    '#16A34A',
    '#F0FDF4',
    FOOD_SIGNS,
  ),
  vocabModule(
    'body-parts',
    'Body parts',
    'Name parts of the body in ASL.',
    'body-outline',
    '#BAE6FD',
    '#0284C7',
    '#F0F9FF',
    BODY_PARTS_SIGNS,
  ),
  vocabModule(
    'work',
    'Work',
    'Job, office, and workplace signs.',
    'briefcase-outline',
    '#C7D2FE',
    '#4F46E5',
    '#EEF2FF',
    WORK_SIGNS,
  ),
  vocabModule(
    'internet',
    'Internet',
    'Online, messaging, and tech signs.',
    'globe-outline',
    '#A7F3D0',
    '#0D9488',
    '#F0FDFA',
    INTERNET_SIGNS,
  ),
  vocabModule(
    'school',
    'School',
    'Classroom and learning vocabulary.',
    'school-outline',
    '#BFDBFE',
    '#2563EB',
    '#EFF6FF',
    SCHOOL_SIGNS,
  ),
  vocabModule(
    'sports',
    'Sports',
    'Play, movement, and sports vocabulary.',
    'football-outline',
    '#BBF7D0',
    '#15803D',
    '#F0FDF4',
    SPORTS_SIGNS,
  ),
];

export function getLearningModule(moduleId: string): LearningModule | undefined {
  return LEARNING_MODULES.find((module) => module.id === moduleId);
}

export function getAllLessons(): Lesson[] {
  return LEARNING_MODULES.flatMap((module) => module.lessons);
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

/** All dictionary modules stay open for free browsing. */
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
  if (hasMediaAsset(lesson.sign.image)) {
    return true;
  }

  return peekSignImage(lesson.moduleId, lesson.sign.id) !== undefined;
}

export function getModuleMediaLessons(module: LearningModule): Lesson[] {
  return module.lessons.filter((lesson) => lessonHasQuizMedia(lesson));
}

/** Seed lesson for starting a module quiz (random among media-ready signs). */
export function getFirstPracticeLesson(module: LearningModule): Lesson | null {
  const mediaLessons = getModuleMediaLessons(module);

  if (mediaLessons.length < 4) {
    return null;
  }

  const index = Math.floor(Math.random() * mediaLessons.length);
  return mediaLessons[index] ?? null;
}
