import {
  ALPHABET_UNITS,
  getCurrentAlphabetLetter,
  isUnitComplete,
} from '../constants/alphabetUnits';
import {
  LEARNING_MODULES,
  getFirstPracticeLesson,
  getModuleMediaLessons,
  type LearningModule,
  type Lesson,
} from '../constants/learning';
import type { HomeDailyState } from './homeDaily';

export type PathNodeState = 'done' | 'current' | 'upcoming' | 'locked';

export type ModulePathNode = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  surfaceColor: string;
  state: PathNodeState;
  completed: number;
  total: number;
  percent: number;
  left: number;
  locked: boolean;
};

export type LessonPathNode = {
  id: string;
  title: string;
  label: string;
  state: PathNodeState;
  kind: 'lesson' | 'boss' | 'unit';
  lessonId?: string;
  unitId?: string;
  locked: boolean;
};

export type ModulePathState = {
  nodes: ModulePathNode[];
  currentModule: LearningModule | null;
  currentIndex: number;
  courseCompleted: number;
  courseTotal: number;
  coursePercent: number;
  courseLeft: number;
};

export type LessonPathState = {
  nodes: LessonPathNode[];
  currentLesson: Lesson | null;
  completed: number;
  total: number;
  percent: number;
  left: number;
  bubbleLabel: 'START' | 'CONTINUE';
  canBoss: boolean;
};

function moduleProgress(
  module: LearningModule,
  completedIds: string[],
): { completed: number; total: number; percent: number; left: number } {
  const total = module.lessons.length;
  const completed = module.lessons.filter((lesson) =>
    completedIds.includes(lesson.id),
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent, left: Math.max(0, total - completed) };
}

/** Hard path: only current + completed modules are open; later ones stay locked. */
export function getModulePathState(
  completedIds: string[],
): ModulePathState {
  const nodes: ModulePathNode[] = LEARNING_MODULES.map((module) => {
    const progress = moduleProgress(module, completedIds);
    return {
      id: module.id,
      title: module.title,
      subtitle: module.description,
      icon: module.icon,
      color: module.color,
      surfaceColor: module.surfaceColor,
      state: 'upcoming' as PathNodeState,
      locked: false,
      ...progress,
    };
  });

  let currentIndex = nodes.findIndex((node) => node.left > 0);
  if (currentIndex < 0) {
    currentIndex = Math.max(0, nodes.length - 1);
  }

  nodes.forEach((node, index) => {
    if (index > currentIndex) {
      node.state = 'locked';
      node.locked = true;
      return;
    }
    if (node.left === 0 && node.total > 0) {
      node.state = 'done';
      node.locked = false;
      return;
    }
    if (index === currentIndex) {
      node.state = 'current';
      node.locked = false;
      return;
    }
    node.state = 'upcoming';
    node.locked = false;
  });

  const courseTotal = nodes.reduce((sum, node) => sum + node.total, 0);
  const courseCompleted = nodes.reduce((sum, node) => sum + node.completed, 0);
  const coursePercent =
    courseTotal === 0 ? 0 : Math.round((courseCompleted / courseTotal) * 100);

  return {
    nodes,
    currentModule: LEARNING_MODULES[currentIndex] ?? null,
    currentIndex,
    courseCompleted,
    courseTotal,
    coursePercent,
    courseLeft: Math.max(0, courseTotal - courseCompleted),
  };
}

function getAlphabetUnitPathState(
  module: LearningModule,
  completedIds: string[],
): LessonPathState {
  const completed = module.lessons.filter((lesson) =>
    completedIds.includes(lesson.id),
  ).length;
  const total = module.lessons.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const left = Math.max(0, total - completed);

  let currentUnitIndex = ALPHABET_UNITS.findIndex(
    (unit) => !isUnitComplete(unit, completedIds),
  );
  if (currentUnitIndex < 0) {
    currentUnitIndex = Math.max(0, ALPHABET_UNITS.length - 1);
  }

  const bubbleLabel: 'START' | 'CONTINUE' =
    completed === 0 ? 'START' : 'CONTINUE';

  const nodes: LessonPathNode[] = ALPHABET_UNITS.map((unit, index) => {
    const unitDone = isUnitComplete(unit, completedIds);
    let state: PathNodeState = 'upcoming';
    let locked = false;

    if (unitDone) {
      state = 'done';
    } else if (index === currentUnitIndex) {
      state = 'current';
    } else if (index > currentUnitIndex) {
      state = 'locked';
      locked = true;
    }

    return {
      id: unit.id,
      title: unit.label,
      label: unit.title,
      state,
      kind: 'unit' as const,
      unitId: unit.id,
      locked,
    };
  });

  const media = getModuleMediaLessons(module);
  const canBoss = media.length >= 8;
  if (canBoss) {
    const allDone = left === 0;
    nodes.push({
      id: `${module.id}-boss`,
      title: 'Boss quiz',
      label: 'Boss',
      state: allDone ? 'current' : 'locked',
      kind: 'boss',
      locked: !allDone,
    });
  }

  const currentLesson = getCurrentAlphabetLetter(completedIds);

  return {
    nodes,
    currentLesson,
    completed,
    total,
    percent,
    left,
    bubbleLabel: left === 0 && canBoss ? 'START' : bubbleLabel,
    canBoss,
  };
}

export function getLessonPathState(
  module: LearningModule,
  completedIds: string[],
): LessonPathState {
  if (module.id === 'alphabet') {
    return getAlphabetUnitPathState(module, completedIds);
  }

  const lessons = module.lessons;
  const completed = lessons.filter((lesson) =>
    completedIds.includes(lesson.id),
  ).length;
  const total = lessons.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const left = Math.max(0, total - completed);

  let currentLesson: Lesson | null =
    lessons.find((lesson) => !completedIds.includes(lesson.id)) ?? null;
  if (!currentLesson && lessons.length > 0) {
    currentLesson = lessons[lessons.length - 1];
  }

  const currentIndex = currentLesson
    ? lessons.findIndex((lesson) => lesson.id === currentLesson!.id)
    : lessons.length - 1;

  const bubbleLabel: 'START' | 'CONTINUE' =
    completed === 0 ? 'START' : 'CONTINUE';

  const nodes: LessonPathNode[] = lessons.map((lesson, index) => {
    const isDone = completedIds.includes(lesson.id);
    let state: PathNodeState = 'upcoming';
    let locked = false;

    if (isDone) {
      state = 'done';
    } else if (index === currentIndex) {
      state = 'current';
    } else if (index > currentIndex) {
      state = 'locked';
      locked = true;
    }

    return {
      id: lesson.id,
      title: lesson.title,
      label: lesson.sign.label,
      state,
      kind: 'lesson' as const,
      lessonId: lesson.id,
      locked,
    };
  });

  const media = getModuleMediaLessons(module);
  const canBoss = media.length >= 8;
  if (canBoss) {
    const allDone = left === 0;
    nodes.push({
      id: `${module.id}-boss`,
      title: 'Boss quiz',
      label: 'Boss',
      state: allDone ? 'current' : 'locked',
      kind: 'boss',
      locked: !allDone,
    });
  }

  return {
    nodes,
    currentLesson,
    completed,
    total,
    percent,
    left,
    bubbleLabel: left === 0 && canBoss ? 'START' : bubbleLabel,
    canBoss,
  };
}

/** True when this module is reachable on the hard path. */
export function isModuleUnlocked(
  moduleId: string,
  completedIds: string[],
): boolean {
  const path = getModulePathState(completedIds);
  const node = path.nodes.find((item) => item.id === moduleId);
  return Boolean(node && !node.locked);
}

export function getRecommendedNext(input: {
  completedIds: string[];
  dailyState: HomeDailyState;
  nextLesson: Lesson | null;
}): {
  kind: 'daily' | 'lesson' | 'module' | 'browse';
  label: string;
  href: string;
} {
  if (input.dailyState === 'pending') {
    return {
      kind: 'daily',
      label: 'Do today’s Daily Quiz',
      href: '/quiz/daily',
    };
  }

  if (input.nextLesson) {
    return {
      kind: 'lesson',
      label: `Continue ${input.nextLesson.title}`,
      href: `/lesson/${input.nextLesson.id}`,
    };
  }

  const path = getModulePathState(input.completedIds);
  if (path.currentModule) {
    return {
      kind: 'module',
      label: `Open ${path.currentModule.title}`,
      href: `/module/${path.currentModule.id}`,
    };
  }

  return {
    kind: 'browse',
    label: 'Open your path',
    href: '/(tabs)/home',
  };
}

export function moduleHasPractice(module: LearningModule): boolean {
  return Boolean(getFirstPracticeLesson(module));
}
