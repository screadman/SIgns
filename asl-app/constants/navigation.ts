/**
 * App navigation: Home (path) · Practice (train) · Profile.
 */

export type MainTabId = 'home' | 'practice' | 'profile';

export type MainTab = {
  id: MainTabId;
  label: string;
  href: '/(tabs)/home' | '/(tabs)/practice' | '/(tabs)/profile';
  icon: 'home-outline' | 'extension-puzzle-outline' | 'person-outline';
  activeIcon: 'home' | 'extension-puzzle' | 'person';
};

export const MAIN_TABS: MainTab[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/(tabs)/home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/(tabs)/practice',
    icon: 'extension-puzzle-outline',
    activeIcon: 'extension-puzzle',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/(tabs)/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];
