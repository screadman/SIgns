/**
 * Practice hub modes. Dictionary browses content; Practice trains skills.
 */

export type PracticeModeId =
  | 'quiz'
  | 'flashcards'
  | 'sign-matching'
  | 'alphabet-matching'
  | 'challenges';

export type PracticeMode = {
  id: PracticeModeId;
  title: string;
  description: string;
  icon:
    | 'help-circle-outline'
    | 'albums-outline'
    | 'swap-horizontal-outline'
    | 'text-outline'
    | 'trophy-outline';
  tileColor: string;
  /** When false, the mode screen shows a coming-soon state. */
  available: boolean;
};

export type DailyChallengeDef = {
  id: 'signsLearned' | 'quizzesFinished' | 'correctAnswers';
  title: string;
  target: number;
  rewardXp: number;
};

export const DAILY_CHALLENGES: DailyChallengeDef[] = [
  {
    id: 'signsLearned',
    title: 'Learn 5 new signs',
    target: 5,
    rewardXp: 50,
  },
  {
    id: 'quizzesFinished',
    title: 'Finish 1 quiz',
    target: 1,
    rewardXp: 30,
  },
  {
    id: 'correctAnswers',
    title: 'Get 10 correct answers',
    target: 10,
    rewardXp: 40,
  },
];

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Multiple choice on signs you already studied.',
    icon: 'help-circle-outline',
    tileColor: '#FB7185',
    available: true,
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Flip cards to review meaning and handshape.',
    icon: 'albums-outline',
    tileColor: '#2DD4BF',
    available: true,
  },
  {
    id: 'sign-matching',
    title: 'Sign matching',
    description: 'Match each picture with the right gloss.',
    icon: 'swap-horizontal-outline',
    tileColor: '#60A5FA',
    available: true,
  },
  {
    id: 'alphabet-matching',
    title: 'Alphabet matching',
    description: 'Pair letters with their ASL handshapes.',
    icon: 'text-outline',
    tileColor: '#FBBF24',
    available: true,
  },
  {
    id: 'challenges',
    title: 'Challenges',
    description: 'Daily goals with XP rewards. Resets each day.',
    icon: 'trophy-outline',
    tileColor: '#F59E0B',
    available: true,
  },
];

export function getPracticeMode(modeId: string): PracticeMode | undefined {
  return PRACTICE_MODES.find((mode) => mode.id === modeId);
}
