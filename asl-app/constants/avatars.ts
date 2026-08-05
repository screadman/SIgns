import type { ImageSourcePropType } from 'react-native';

export type ProfileAvatar = {
  id: string;
  label: string;
  source: ImageSourcePropType;
};

export const PROFILE_AVATARS: ProfileAvatar[] = [
  {
    id: 'nova',
    label: 'Nova',
    source: require('../assets/avatars/nova.png'),
  },
  {
    id: 'mira',
    label: 'Mira',
    source: require('../assets/avatars/mira.png'),
  },
  {
    id: 'leo',
    label: 'Leo',
    source: require('../assets/avatars/leo.png'),
  },
  {
    id: 'aria',
    label: 'Aria',
    source: require('../assets/avatars/aria.png'),
  },
  {
    id: 'sky',
    label: 'Sky',
    source: require('../assets/avatars/sky.png'),
  },
  {
    id: 'jade',
    label: 'Jade',
    source: require('../assets/avatars/jade.png'),
  },
  {
    id: 'kit',
    label: 'Kit',
    source: require('../assets/avatars/kit.png'),
  },
  {
    id: 'rio',
    label: 'Rio',
    source: require('../assets/avatars/rio.png'),
  },
  {
    id: 'sol',
    label: 'Sol',
    source: require('../assets/avatars/sol.png'),
  },
  {
    id: 'lux',
    label: 'Lux',
    source: require('../assets/avatars/lux.png'),
  },
];

/** Alias used by profile UI. */
export const AVATARS = PROFILE_AVATARS;

export function getAvatarById(id: string): ProfileAvatar | undefined {
  return PROFILE_AVATARS.find((avatar) => avatar.id === id);
}
