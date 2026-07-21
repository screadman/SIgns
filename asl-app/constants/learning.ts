import { ASL_LETTERS, ASL_NUMBERS, type AslGlyph } from './aslLetters';
import { colors } from './theme';

export type LearningModuleId = 'alphabet' | 'numbers';
export type LearningModuleIcon = 'text-outline' | 'calculator-outline';

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
  lessons: Lesson[];
};

function createLessons(
  moduleId: LearningModuleId,
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

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'alphabet',
    title: 'ASL Alphabet',
    description: 'Learn the 26 letters of the American Sign Language alphabet.',
    icon: 'text-outline',
    color: colors.primary,
    surfaceColor: colors.primarySurface,
    lessons: createLessons('alphabet', ASL_LETTERS, 'Letter'),
  },
  {
    id: 'numbers',
    title: 'Numbers 0–9',
    description: 'Learn how to sign the first ten numbers with confidence.',
    icon: 'calculator-outline',
    color: colors.accent,
    surfaceColor: colors.accentSurface,
    lessons: createLessons('numbers', ASL_NUMBERS, 'Number'),
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
