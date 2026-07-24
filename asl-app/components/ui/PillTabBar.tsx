import { Ionicons } from '@expo/vector-icons';
import { type Href, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAIN_TABS } from '../../constants/navigation';
import {
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

const TABS: TabItem[] = MAIN_TABS.map((tab) => ({
  key: tab.id,
  label: tab.label,
  href: tab.href,
  icon: tab.icon,
  activeIcon: tab.activeIcon,
}));

export const PILL_TAB_BAR_HEIGHT = 52;
export const PILL_TAB_BAR_GAP = spacing.sm;

function resolveActiveKey(pathname: string) {
  if (
    pathname.includes('practice') ||
    pathname.includes('practice-mode') ||
    pathname.includes('quiz')
  ) {
    return 'practice';
  }

  if (
    pathname.includes('learn') ||
    pathname.includes('module') ||
    pathname.includes('lesson')
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
    minWidth: 260,
    maxWidth: 320,
    width: '84%',
    height: PILL_TAB_BAR_HEIGHT,
    paddingHorizontal: spacing.sm,
    borderRadius: PILL_TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
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
    // Explicit half-size radius + clip: Android often draws a square with 9999 alone.
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconWrapActive: {
    backgroundColor: colors.white,
  },
});
