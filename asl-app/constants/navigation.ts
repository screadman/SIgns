/**
 * App navigation model: Dictionary browses signs, Practice trains skills.
 */

export type MainTabId = 'home' | 'learn' | 'practice' | 'profile';

export type MainTab = {
  id: MainTabId;
  label: string;
  href: '/(tabs)/home' | '/(tabs)/learn' | '/(tabs)/practice' | '/(tabs)/profile';
  icon:
    | 'home-outline'
    | 'book-outline'
    | 'extension-puzzle-outline'
    | 'person-outline';
  activeIcon: 'home' | 'book' | 'extension-puzzle' | 'person';
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
    id: 'learn',
    label: 'Dictionary',
    href: '/(tabs)/learn',
    icon: 'book-outline',
    activeIcon: 'book',
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
