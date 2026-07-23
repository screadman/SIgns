/**
 * App navigation model: Learn discovers content, Practice trains with quizzes.
 */

export type MainTabId = 'home' | 'learn' | 'practice' | 'profile';

export type MainTab = {
  id: MainTabId;
  label: string;
  href: '/(tabs)/home' | '/(tabs)/learn' | '/(tabs)/practice' | '/(tabs)/profile';
  icon: 'home-outline' | 'book-outline' | 'flash-outline' | 'person-outline';
  activeIcon: 'home' | 'book' | 'flash' | 'person';
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
    label: 'Learn',
    href: '/(tabs)/learn',
    icon: 'book-outline',
    activeIcon: 'book',
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/(tabs)/practice',
    icon: 'flash-outline',
    activeIcon: 'flash',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/(tabs)/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];
