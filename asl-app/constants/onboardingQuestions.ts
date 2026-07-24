import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import type {
  DailyGoalMinutes,
  ExperienceLevel,
  LearningGoal,
} from '../lib/onboardingStorage';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type QuestionOption<T extends string | number> = {
  id: T;
  label: string;
  subtitle?: string;
  icon: IoniconName;
};

export type SetupStepId =
  | 'name'
  | 'hello'
  | 'experience'
  | 'experience-react'
  | 'goal'
  | 'goal-react'
  | 'daily'
  | 'daily-react'
  | 'notifications'
  | 'streak-commit';

export type SetupStepKind =
  | 'name'
  | 'choice'
  | 'react'
  | 'streak-commit';

export type SetupStep = {
  id: SetupStepId;
  kind: SetupStepKind;
};

export const SETUP_FLOW: SetupStep[] = [
  { id: 'name', kind: 'name' },
  { id: 'hello', kind: 'react' },
  { id: 'experience', kind: 'choice' },
  { id: 'experience-react', kind: 'react' },
  { id: 'goal', kind: 'choice' },
  { id: 'goal-react', kind: 'react' },
  { id: 'daily', kind: 'choice' },
  { id: 'daily-react', kind: 'react' },
  { id: 'notifications', kind: 'choice' },
  { id: 'streak-commit', kind: 'streak-commit' },
];

export const EXPERIENCE_OPTIONS: QuestionOption<ExperienceLevel>[] = [
  {
    id: 'beginner',
    label: 'Complete beginner',
    subtitle: 'I am just getting started',
    icon: 'sparkles-outline',
  },
  {
    id: 'some',
    label: 'I know a few signs',
    subtitle: 'Alphabet, greetings, basics',
    icon: 'hand-left-outline',
  },
  {
    id: 'conversational',
    label: 'I can chat a little',
    subtitle: 'Simple conversations',
    icon: 'chatbubbles-outline',
  },
];

export const GOAL_OPTIONS: QuestionOption<LearningGoal>[] = [
  {
    id: 'community',
    label: 'Connect with the Deaf community',
    icon: 'people-outline',
  },
  {
    id: 'school',
    label: 'School or coursework',
    icon: 'school-outline',
  },
  {
    id: 'travel',
    label: 'Travel and culture',
    icon: 'airplane-outline',
  },
  {
    id: 'fun',
    label: 'Just for fun',
    icon: 'happy-outline',
  },
  {
    id: 'work',
    label: 'Work or career',
    icon: 'briefcase-outline',
  },
];

export const DAILY_GOAL_OPTIONS: QuestionOption<DailyGoalMinutes>[] = [
  {
    id: 5,
    label: '5 minutes / day',
    subtitle: 'A light daily habit',
    icon: 'timer-outline',
  },
  {
    id: 10,
    label: '10 minutes / day',
    subtitle: 'Steady progress',
    icon: 'flash-outline',
  },
  {
    id: 15,
    label: '15 minutes / day',
    subtitle: 'Build real momentum',
    icon: 'rocket-outline',
  },
  {
    id: 20,
    label: '20+ minutes / day',
    subtitle: 'Go deep each day',
    icon: 'trophy-outline',
  },
];

export const NOTIFICATION_OPTIONS: QuestionOption<'yes' | 'later'>[] = [
  {
    id: 'yes',
    label: 'Yes, remind me',
    subtitle: 'Gentle nudges to keep your streak',
    icon: 'notifications-outline',
  },
  {
    id: 'later',
    label: 'Not now',
    subtitle: 'You can turn this on later',
    icon: 'moon-outline',
  },
];

export function formatLearnerName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'friend';
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getChoiceCopy(stepId: SetupStepId, _name: string) {
  switch (stepId) {
    case 'experience':
      return {
        title: 'Where are you starting?',
        subtitle: 'We will adapt the difficulty to you.',
      };
    case 'goal':
      return {
        title: 'What is your main goal?',
        subtitle: 'This helps us personalize your path.',
      };
    case 'daily':
      return {
        title: 'How much time fits your day?',
        subtitle: 'Pick a pace you can stick with.',
      };
    case 'notifications':
      return {
        title: 'Want practice reminders?',
        subtitle: 'Stay consistent with optional alerts.',
      };
    default:
      return {
        title: '',
        subtitle: '',
      };
  }
}

export type ReactionTone = 'accent' | 'primary';

export type ReactionTextPart = {
  text: string;
  tone?: ReactionTone;
};

export type ReactionCopy = {
  eyebrow: string;
  eyebrowIcon: ComponentProps<typeof Ionicons>['name'];
  titleParts: ReactionTextPart[];
  subtitleParts: ReactionTextPart[];
  highlight: string | null;
};

export function estimateMonthlySigns(minutes: DailyGoalMinutes) {
  return minutes * 26;
}

export function getReactionCopy({
  stepId,
  name,
  experience,
  goal,
  dailyMinutes,
}: {
  stepId: SetupStepId;
  name: string;
  experience: ExperienceLevel | null;
  goal: LearningGoal | null;
  dailyMinutes: DailyGoalMinutes | null;
}): ReactionCopy {
  const displayName = formatLearnerName(name);

  if (stepId === 'hello') {
    return {
      eyebrow: 'Hey there',
      eyebrowIcon: 'hand-left-outline',
      titleParts: [
        { text: 'Nice to meet you, ' },
        { text: displayName, tone: 'primary' },
        { text: '!' },
      ],
      subtitleParts: [
        { text: 'A few quick choices and we will build your path.' },
      ],
      highlight: null,
    };
  }

  if (stepId === 'experience-react') {
    const lines: Record<
      ExperienceLevel,
      { titleParts: ReactionTextPart[]; subtitle: string }
    > = {
      beginner: {
        titleParts: [
          { text: 'Perfect starting point, ' },
          { text: displayName, tone: 'primary' },
          { text: '!' },
        ],
        subtitle: 'We will begin with clear visuals and easy wins.',
      },
      some: {
        titleParts: [
          { text: 'Solid base, ' },
          { text: displayName, tone: 'primary' },
          { text: '!' },
        ],
        subtitle: 'We will fill the gaps and grow your vocabulary fast.',
      },
      conversational: {
        titleParts: [
          { text: 'You are already ahead, ' },
          { text: displayName, tone: 'primary' },
          { text: '!' },
        ],
        subtitle: 'Time to sharpen fluency and tougher practice.',
      },
    };

    const content = experience ? lines[experience] : lines.beginner;
    return {
      eyebrow: 'Nice pick',
      eyebrowIcon: 'sparkles-outline',
      titleParts: content.titleParts,
      subtitleParts: [{ text: content.subtitle }],
      highlight: null,
    };
  }

  if (stepId === 'goal-react') {
    const lines: Record<LearningGoal, ReactionTextPart[]> = {
      community: [
        { text: 'Great goal', tone: 'accent' },
        { text: '! Everyday signs unlock real conversations.' },
      ],
      school: [
        { text: 'Nice', tone: 'accent' },
        { text: '! We will keep lessons clear and quiz-ready.' },
      ],
      travel: [
        { text: 'Love that', tone: 'accent' },
        { text: '! Useful signs for culture and travel ahead.' },
      ],
      fun: [
        { text: 'Awesome', tone: 'accent' },
        { text: '! Learning should feel playful and rewarding.' },
      ],
      work: [
        { text: 'Strong focus', tone: 'accent' },
        { text: '! Practical signs for real-world use.' },
      ],
    };

    return {
      eyebrow: 'Love that',
      eyebrowIcon: 'heart-outline',
      titleParts: goal
        ? lines[goal]
        : [{ text: 'Great choice', tone: 'accent' }, { text: '!' }],
      subtitleParts: [
        { text: 'Next, we set a ' },
        { text: 'daily rhythm', tone: 'primary' },
        { text: ' that fits your life.' },
      ],
      highlight: null,
    };
  }

  if (stepId === 'daily-react') {
    const minutes = dailyMinutes ?? 5;
    const signs = estimateMonthlySigns(minutes);

    return {
      eyebrow: "Let's go",
      eyebrowIcon: 'rocket-outline',
      titleParts: [
        { text: 'With just ' },
        { text: `${minutes} minutes`, tone: 'accent' },
        { text: ' a day, you can learn about ' },
        { text: `${signs} signs`, tone: 'primary' },
        { text: ' in a ' },
        { text: 'month', tone: 'accent' },
        { text: '.' },
      ],
      subtitleParts: [
        { text: 'That is enough to build ' },
        { text: 'real confidence', tone: 'primary' },
        { text: '.' },
      ],
      highlight: String(minutes),
    };
  }

  return {
    eyebrow: '',
    eyebrowIcon: 'sparkles-outline',
    titleParts: [],
    subtitleParts: [],
    highlight: null,
  };
}
