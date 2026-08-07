import type { ImageSourcePropType } from 'react-native';

import { LETTER_IMAGES } from '../constants/aslLetterImages';
import { MODULE_IMAGES } from '../constants/aslModuleImages';
import { NUMBER_IMAGES } from '../constants/aslNumberImages';
import { hasMediaAsset, toImageSource } from '../constants/aslLetters';
import type { Lesson } from '../constants/learning';
import { WH_QUESTION_IMAGES } from '../constants/whQuestionImages';

function isImageModule(
  moduleId: string | undefined,
): moduleId is 'alphabet' | 'numbers' | 'wh-questions' {
  return (
    moduleId === 'alphabet' ||
    moduleId === 'numbers' ||
    moduleId === 'wh-questions'
  );
}


export function peekSignImage(
  moduleId: string | undefined,
  signId: string,
): ImageSourcePropType | undefined {
  if (!moduleId) {
    return undefined;
  }

  if (moduleId === 'alphabet') {
    return LETTER_IMAGES[signId];
  }

  if (moduleId === 'numbers') {
    return NUMBER_IMAGES[signId];
  }


  if (moduleId === 'wh-questions') {
    return WH_QUESTION_IMAGES[signId];
  }


  return MODULE_IMAGES[moduleId]?.[signId];
}

export function getLessonImageSource(
  lesson: Pick<Lesson, 'moduleId' | 'sign'>,
): ImageSourcePropType | undefined {
  const fromGlyph = toImageSource(lesson.sign.image);
  if (fromGlyph) {
    return fromGlyph;
  }

  return peekSignImage(lesson.moduleId, lesson.sign.id);
}

export function lessonHasSignImage(
  lesson: Pick<Lesson, 'moduleId' | 'sign'>,
): boolean {
  if (hasMediaAsset(lesson.sign.image)) {
    return true;
  }

  return peekSignImage(lesson.moduleId, lesson.sign.id) !== undefined;
}

/** Kept for call sites that warm a category before navigation. Now a no-op sync hit. */
export function loadSignImagesForModule(_moduleId: string): Promise<void> {
  return Promise.resolve();
}

/** Images are bundled and available immediately. */
export function useSignImages(_moduleId?: string): boolean {
  return true;
}