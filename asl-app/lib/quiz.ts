import type { Lesson } from '../constants/learning';
import { lessonHasQuizMedia } from '../constants/learning';

export type QuizFormat =
  | 'image-to-label'
  | 'label-to-image'
  | 'description-to-image';

export type QuizQuestion = {
  id: string;
  format: QuizFormat;
  prompt: Lesson;
  options: Lesson[];
  correctAnswerId: string;
};

const DEFAULT_QUESTION_COUNT = 5;

export function shuffle<T>(items: T[]): T[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function pickFormat(
  index: number,
  prompt: Lesson,
  includeDescription: boolean,
): QuizFormat {
  if (
    includeDescription &&
    index === 2 &&
    prompt.sign.description.trim().length > 0
  ) {
    return 'description-to-image';
  }

  return index % 2 === 0 ? 'image-to-label' : 'label-to-image';
}

export function buildQuestionsFromPrompts(
  prompts: Lesson[],
  distractorPool: Lesson[],
  options?: { includeDescription?: boolean; seedKey?: string },
): QuizQuestion[] {
  const includeDescription = options?.includeDescription ?? false;
  const seedKey = options?.seedKey ?? 'quiz';

  return prompts.map((prompt, index) => {
    const pool = distractorPool.filter((lesson) => lesson.id !== prompt.id);
    const sameModule = pool.filter(
      (lesson) => lesson.moduleId === prompt.moduleId,
    );
    const distractors = shuffle(
      sameModule.length >= 3 ? sameModule : pool,
    ).slice(0, 3);

    const format = pickFormat(index, prompt, includeDescription);

    return {
      id: `${seedKey}-q${index + 1}-${prompt.id}`,
      format,
      prompt,
      options: shuffle([prompt, ...distractors]),
      correctAnswerId: prompt.id,
    };
  });
}

/**
 * Mixed mastery session for one alphabet unit:
 * ~2 MCQ prompts per letter (cap 10-12), letter↔sign formats only,
 * plus a 4-pair matching set for the UI phase.
 */
export function generateAlphabetUnitSession(unitLessons: Lesson[]): {
  questions: QuizQuestion[];
  matchingLessons: Lesson[];
} {
  const media = unitLessons.filter((lesson) => lessonHasQuizMedia(lesson));
  if (media.length < 4) {
    return { questions: [], matchingLessons: [] };
  }

  const targetCount = Math.min(12, Math.max(media.length, media.length * 2));
  const prompts: Lesson[] = [];
  const shuffledOnce = shuffle(media);
  const shuffledTwice = shuffle(media);

  for (const lesson of shuffledOnce) {
    if (prompts.length >= targetCount) {
      break;
    }
    prompts.push(lesson);
  }
  for (const lesson of shuffledTwice) {
    if (prompts.length >= targetCount) {
      break;
    }
    // Prefer a second pass so most letters appear ~twice when the unit is small.
    if (prompts.filter((item) => item.id === lesson.id).length < 2) {
      prompts.push(lesson);
    }
  }

  while (prompts.length < Math.min(targetCount, media.length * 2)) {
    const next = shuffledOnce[prompts.length % shuffledOnce.length];
    if (!next) {
      break;
    }
    prompts.push(next);
  }

  const questions = buildQuestionsFromPrompts(
    shuffle(prompts).slice(0, targetCount),
    media,
    {
      includeDescription: false,
      seedKey: `unit-${media[0]?.moduleId ?? 'alphabet'}`,
    },
  ).map((question, index) => ({
    ...question,
    // Letter ↔ sign only: alternate image→label and label→image.
    format:
      index % 2 === 0
        ? ('image-to-label' as const)
        : ('label-to-image' as const),
  }));

  const matchingLessons = shuffle(media).slice(0, Math.min(4, media.length));

  return { questions, matchingLessons };
}

export function generateQuiz(
  lessonId: string,
  allItems: Lesson[],
  questionCount = DEFAULT_QUESTION_COUNT,
): QuizQuestion[] {
  const requestedLesson = allItems.find((lesson) => lesson.id === lessonId);

  if (!requestedLesson || !lessonHasQuizMedia(requestedLesson)) {
    return [];
  }

  const moduleItems = allItems.filter(
    (lesson) =>
      lesson.moduleId === requestedLesson.moduleId &&
      lessonHasQuizMedia(lesson),
  );

  if (moduleItems.length < 4) {
    return [];
  }

  const prompts = shuffle(moduleItems).slice(
    0,
    Math.min(questionCount, moduleItems.length),
  );

  return buildQuestionsFromPrompts(prompts, moduleItems, {
    includeDescription: false,
    seedKey: requestedLesson.moduleId,
  });
}

export function getQuizStars(
  score: number,
  totalQuestions = DEFAULT_QUESTION_COUNT,
): 0 | 1 | 2 | 3 {
  if (totalQuestions <= 0) {
    return 0;
  }

  if (score >= totalQuestions) {
    return 3;
  }

  if (score === totalQuestions - 1) {
    return 2;
  }

  if (score >= Math.ceil(totalQuestions / 2)) {
    return 1;
  }

  return 0;
}

export function getQuizXp(
  score: number,
  totalQuestions = DEFAULT_QUESTION_COUNT,
): number {
  return score * 10 + (score === totalQuestions && totalQuestions > 0 ? 20 : 0);
}
