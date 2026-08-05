import type { Lesson } from '../constants/learning';
import {
  LEARNING_MODULES,
  getLearningModule,
  lessonHasQuizMedia,
} from '../constants/learning';
import {
  attachDailyQuestions,
  getOrCreateDailyQuizSession,
  questionCountForDailyMinutes,
} from './dailyQuizStorage';
import { resolveMissedLessonIds } from './missedSigns';
import type { DailyGoalMinutes } from './onboardingStorage';
import {
  type SignStrengthMap,
  getSignStrengthMap,
  isRecentSign,
  isWeakSign,
} from './signStrength';
import { buildQuestionsFromPrompts, type QuizQuestion } from './quiz';

export type QuizPreset = 'daily' | 'module' | 'missed' | 'boss';

export type GeneratePresetInput = {
  preset: QuizPreset;
  allLessons: Lesson[];
  moduleId?: string;
  lessonId?: string;
  dailyMinutes?: DailyGoalMinutes | null;
  missedLessonIds?: string[];
  focusModuleId?: string;
  strengthMap?: SignStrengthMap;
};

function mediaLessons(lessons: Lesson[]) {
  return lessons.filter((lesson) => lessonHasQuizMedia(lesson));
}

function uniqueById(lessons: Lesson[]) {
  const seen = new Set<string>();
  return lessons.filter((lesson) => {
    if (seen.has(lesson.id)) {
      return false;
    }
    seen.add(lesson.id);
    return true;
  });
}

function pickDailyPrompts(input: {
  media: Lesson[];
  questionCount: number;
  strengthMap: SignStrengthMap;
  focusModuleId?: string;
}): Lesson[] {
  const { media, questionCount, strengthMap, focusModuleId } = input;
  const now = Date.now();
  const selected: Lesson[] = [];
  const selectedIds = new Set<string>();

  const takeUpTo = (pool: Lesson[], maxAdd: number) => {
    let added = 0;
    for (const lesson of pool) {
      if (selected.length >= questionCount || added >= maxAdd) {
        break;
      }
      if (selectedIds.has(lesson.id)) {
        continue;
      }
      selected.push(lesson);
      selectedIds.add(lesson.id);
      added += 1;
    }
  };

  const weak = media
    .filter((lesson) => isWeakSign(strengthMap[lesson.sign.id], now))
    .sort(
      (a, b) =>
        (strengthMap[a.sign.id]?.strength ?? 0) -
        (strengthMap[b.sign.id]?.strength ?? 0),
    );

  // Weak wins over Recent on overlap: exclude weak from recent pool.
  const recent = media
    .filter((lesson) => {
      if (isWeakSign(strengthMap[lesson.sign.id], now)) {
        return false;
      }
      return isRecentSign(strengthMap[lesson.sign.id], now);
    })
    .sort(
      (a, b) =>
        Date.parse(strengthMap[b.sign.id]?.lastSeenAt ?? '0') -
        Date.parse(strengthMap[a.sign.id]?.lastSeenAt ?? '0'),
    );

  const focus =
    getLearningModule(focusModuleId ?? '') ??
    getLearningModule('alphabet') ??
    LEARNING_MODULES[0];
  const anchor = mediaLessons(focus?.lessons ?? media);

  const filler = [...media]
    .filter((lesson) => {
      const entry = strengthMap[lesson.sign.id];
      // Anti-farm: skip mastered undued signs while weaker ones remain.
      if (entry && entry.strength >= 0.9 && !isWeakSign(entry, now)) {
        return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        (strengthMap[a.sign.id]?.strength ?? 0) -
        (strengthMap[b.sign.id]?.strength ?? 0),
    );

  const weakQuota = Math.ceil(questionCount * 0.4);
  const recentQuota = Math.ceil(questionCount * 0.35);

  takeUpTo(weak, weakQuota);
  takeUpTo(recent, recentQuota);
  if (questionCount >= 5) {
    takeUpTo(anchor, 1);
  }
  takeUpTo(filler, questionCount - selected.length);
  // If anti-farm filtered too hard, fill from all media by weakest.
  if (selected.length < questionCount) {
    takeUpTo(
      [...media].sort(
        (a, b) =>
          (strengthMap[a.sign.id]?.strength ?? 0) -
          (strengthMap[b.sign.id]?.strength ?? 0),
      ),
      questionCount - selected.length,
    );
  }

  return selected.slice(0, questionCount);
}

export function getFocusModuleId(nextLesson: Lesson | null): string {
  return nextLesson?.moduleId ?? LEARNING_MODULES[0]?.id ?? 'alphabet';
}

export async function generateQuizPreset(
  input: GeneratePresetInput,
): Promise<QuizQuestion[]> {
  const allMedia = mediaLessons(input.allLessons);

  if (input.preset === 'daily') {
    if (allMedia.length < 4) {
      return [];
    }

    const questionCount = Math.min(
      questionCountForDailyMinutes(input.dailyMinutes),
      allMedia.length,
    );
    const strengthMap = input.strengthMap ?? (await getSignStrengthMap());
    const session = await getOrCreateDailyQuizSession({ questionCount });

    let prompts: Lesson[];

    if (session.questionLessonIds.length > 0) {
      prompts = session.questionLessonIds
        .map((id) => allMedia.find((lesson) => lesson.id === id))
        .filter((lesson): lesson is Lesson => Boolean(lesson));
    } else {
      prompts = pickDailyPrompts({
        media: allMedia,
        questionCount,
        strengthMap,
        focusModuleId: input.focusModuleId,
      });
      await attachDailyQuestions(prompts.map((lesson) => lesson.id));
    }

    if (prompts.length < 4) {
      return [];
    }

    return buildQuestionsFromPrompts(prompts, allMedia, {
      includeDescription: prompts.length >= 8,
      seedKey: `daily-${session.dayKey}`,
    });
  }

  if (input.preset === 'missed') {
    const missedIds =
      input.missedLessonIds && input.missedLessonIds.length > 0
        ? input.missedLessonIds
        : await resolveMissedLessonIds(input.allLessons);

    const missed = uniqueById(
      missedIds
        .map((id) => allMedia.find((lesson) => lesson.id === id))
        .filter((lesson): lesson is Lesson => Boolean(lesson)),
    );

    // Need enough distractor pool; prompts can be fewer than 4.
    if (missed.length === 0 || allMedia.length < 4) {
      return [];
    }

    const prompts = missed.slice(0, Math.min(8, missed.length));
    return buildQuestionsFromPrompts(prompts, allMedia, {
      seedKey: `missed-${prompts.map((lesson) => lesson.id).join('|')}`,
    });
  }

  if (input.preset === 'boss') {
    const module = getLearningModule(input.moduleId ?? '');
    const moduleMedia = mediaLessons(module?.lessons ?? []);
    // Boss needs a real challenge: at least 8 illustrated signs.
    if (moduleMedia.length < 8) {
      return [];
    }

    const count = Math.min(10, moduleMedia.length);
    const shuffled = [...moduleMedia];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const prompts = shuffled.slice(0, count);

    return buildQuestionsFromPrompts(prompts, moduleMedia, {
      includeDescription: true,
      seedKey: `boss-${module?.id ?? 'x'}-${Date.now()}`,
    });
  }

  const seedLesson =
    input.allLessons.find((lesson) => lesson.id === input.lessonId) ??
    mediaLessons(getLearningModule(input.moduleId ?? '')?.lessons ?? [])[0];

  if (!seedLesson || !lessonHasQuizMedia(seedLesson)) {
    return [];
  }

  const moduleMedia = allMedia.filter(
    (lesson) => lesson.moduleId === seedLesson.moduleId,
  );

  if (moduleMedia.length < 4) {
    return [];
  }

  const count = Math.min(5, moduleMedia.length);
  const prompts = [...moduleMedia]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  return buildQuestionsFromPrompts(prompts, moduleMedia, {
    seedKey: `module-${seedLesson.moduleId}`,
  });
}
