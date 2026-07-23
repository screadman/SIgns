import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type BadgeId =
  | 'first-sign'
  | 'perfect-score'
  | 'alphabet-ace'
  | 'number-pro'
  | 'on-fire'
  | 'rising-star';

export type BadgeDefinition = {
  id: BadgeId;
  name: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-sign',
    name: 'First Sign',
    description: 'Complete your first lesson quiz.',
    icon: 'hand-left-outline',
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get every answer right in a quiz.',
    icon: 'star-outline',
  },
  {
    id: 'alphabet-ace',
    name: 'Alphabet Ace',
    description: 'Finish all alphabet lessons.',
    icon: 'text-outline',
  },
  {
    id: 'number-pro',
    name: 'Number Pro',
    description: 'Finish all number lessons.',
    icon: 'apps-outline',
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Keep a 3-day learning streak.',
    icon: 'flame-outline',
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach level 5.',
    icon: 'trophy-outline',
  },
];

export const BADGES_BY_ID = Object.fromEntries(
  BADGES.map((badge) => [badge.id, badge]),
) as Record<BadgeId, BadgeDefinition>;
