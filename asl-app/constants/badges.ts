import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import {
  LEARNING_MODULES,
  type LearningModuleId,
} from './learning';

export type CoreBadgeId =
  | 'first-sign'
  | 'perfect-score'
  | 'alphabet-ace'
  | 'number-pro'
  | 'on-fire'
  | 'rising-star';

export type BossBadgeId = `boss-${LearningModuleId}`;

export type BadgeId = CoreBadgeId | BossBadgeId;

export type BadgeDefinition = {
  id: BadgeId;
  name: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export const CORE_BADGES: BadgeDefinition[] = [
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

export const BOSS_BADGES: BadgeDefinition[] = LEARNING_MODULES.map(
  (module) => ({
    id: `boss-${module.id}` as BossBadgeId,
    name: `${module.title} Boss`,
    description: `Perfect the ${module.title} Boss quiz (no mistakes).`,
    icon: 'ribbon-outline' as const,
  }),
);

export const BADGES: BadgeDefinition[] = [...CORE_BADGES, ...BOSS_BADGES];

export const BADGES_BY_ID = Object.fromEntries(
  BADGES.map((badge) => [badge.id, badge]),
) as Record<BadgeId, BadgeDefinition>;

export function bossBadgeId(moduleId: LearningModuleId): BossBadgeId {
  return `boss-${moduleId}`;
}

export function isBossBadgeId(id: string): id is BossBadgeId {
  return id.startsWith('boss-');
}
