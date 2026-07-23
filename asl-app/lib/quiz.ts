import type { Lesson } from '../constants/learning';
import { lessonHasQuizMedia } from '../constants/learning';

export type QuizFormat = 'image-to-label' | 'label-to-image';

export type QuizQuestion = {
  id: string;
  format: QuizFormat;
  prompt: Lesson;
  options: Lesson[];
  correctAnswerId: string;
};

function shuffle<T>(items: T[]): T[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[index],
      shuffledItems[randomIndex],
    ];
  }

  return shuffledItems;
}

export function generateQuiz(
  lessonId: string,
  allItems: Lesson[],
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

  return Array.from({ length: 3 }, (_, index) => {
    const distractors = shuffle(
      moduleItems.filter((lesson) => lesson.id !== requestedLesson.id),
    ).slice(0, 3);

    return {
      id: `${lessonId}-question-${index + 1}`,
      format: index % 2 === 0 ? 'image-to-label' : 'label-to-image',
      prompt: requestedLesson,
      options: shuffle([requestedLesson, ...distractors]),
      correctAnswerId: requestedLesson.id,
    };
  });
}

export function getQuizStars(score: number, totalQuestions = 3): 1 | 2 | 3 {
  if (score >= totalQuestions) {
    return 3;
  }

  if (score === totalQuestions - 1) {
    return 2;
  }

  return 1;
}

export function getQuizXp(score: number, totalQuestions = 3): number {
  return score * 10 + (score === totalQuestions ? 20 : 0);
}
