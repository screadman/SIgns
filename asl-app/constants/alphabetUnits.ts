/**
 * Alphabet unit helpers.
 * Implementation lives in `moduleUnits.ts` so Numbers / Conversation share the same loop.
 */
import {
  ALPHABET_UNITS,
  getCurrentModuleUnit,
  getCurrentUnitLesson,
  getModuleUnit,
  getModuleUnitForLesson,
  getUnitLessons,
  getUnitMediaLessons,
  isModuleUnitUnlocked,
  isUnitComplete,
  unitQuizResultId,
  type ModuleUnit,
} from './moduleUnits';

export type AlphabetUnit = ModuleUnit;

export {
  ALPHABET_UNITS,
  getUnitLessons,
  getUnitMediaLessons,
  isUnitComplete,
  unitQuizResultId,
};

export function getAlphabetUnit(unitId: string) {
  const unit = getModuleUnit(unitId);
  return unit?.moduleId === 'alphabet' ? unit : undefined;
}

export function getCurrentAlphabetUnit(completedIds: string[]) {
  return getCurrentModuleUnit('alphabet', completedIds);
}

export function getCurrentAlphabetLetter(completedIds: string[]) {
  return getCurrentUnitLesson('alphabet', completedIds);
}

export function getAlphabetUnitForLesson(lessonId: string) {
  const unit = getModuleUnitForLesson(lessonId);
  return unit?.moduleId === 'alphabet' ? unit : undefined;
}

export function isAlphabetUnitUnlocked(
  unitId: string,
  completedIds: string[],
) {
  const unit = getModuleUnit(unitId);
  if (!unit || unit.moduleId !== 'alphabet') {
    return false;
  }
  return isModuleUnitUnlocked(unitId, completedIds);
}
