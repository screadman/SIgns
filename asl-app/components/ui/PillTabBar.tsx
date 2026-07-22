import { Ionicons } from '@expo/vector-icons';
import { type Href, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  borderRadius,
  colors,
  iconSize,
  shadows,
  spacing,
} from '../../constants/theme';

type TabItem = {
  key: string;
  label: string;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabsPillTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

const TABS: TabItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/(tabs)/home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'learn',
    label: 'Learn',
    href: '/(tabs)/learn',
    icon: 'book-outline',
    activeIcon: 'book',
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/(tabs)/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export const PILL_TAB_BAR_HEIGHT = 52;
export const PILL_TAB_BAR_GAP = spacing.sm;


function resolveActiveKey(pathname: string) {
  if (
    pathname.includes('learn') ||
    pathname.includes('module') ||
    pathname.includes('lesson') ||
    pathname.includes('quiz')
  ) {
    return 'learn';
  }

  if (pathname.includes('profile')) {
    return 'profile';
  }

  return 'home';
}

type PillTabBarContentProps = {
  activeKey: string;
  onPressTab: (tab: TabItem) => void;
  floating?: boolean;
};

function PillTabBarContent({
  activeKey,
  onPressTab,
  floating = false,
}: PillTabBarContentProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        floating && styles.wrapperFloating,
        { paddingBottom: Math.max(insets.bottom, PILL_TAB_BAR_GAP) },
      ]}
    >
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeKey;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onPressTab(tab)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={iconSize.md}
                  color={isActive ? colors.text : colors.textInverse}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TabsPillTabBar({ state, navigation }: TabsPillTabBarProps) {
  const activeKey = TABS[state.index]?.key ?? 'home';

  return (
    <PillTabBarContent
      floating
      activeKey={activeKey}
      onPressTab={(tab) => {
        const route = state.routes.find(
          (item: TabRoute) => item.name === tab.key,
        );

        if (!route) {
          return;
        }

        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (
          !event.defaultPrevented &&
          state.index !== state.routes.indexOf(route)
        ) {
          navigation.navigate(route.name, route.params);
        }
      }}
    />
  );
}

export function LearningBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeKey = resolveActiveKey(pathname);

  return (
    <PillTabBarContent
      activeKey={activeKey}
      onPressTab={(tab) => {
        router.replace(tab.href);
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.transparent,
  },
  wrapperFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 220,
    maxWidth: 280,
    width: '72%',
    height: PILL_TAB_BAR_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text,
    ...shadows.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  iconWrapActive: {
    backgroundColor: colors.white,
  },
});
