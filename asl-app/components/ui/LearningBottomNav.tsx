import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';

const TABS = [
  {
    label: 'Home',
    icon: 'home-outline' as const,
    href: '/(tabs)/home',
  },
  {
    label: 'Learn',
    icon: 'book-outline' as const,
    href: '/(tabs)/learn',
  },
  {
    label: 'Profile',
    icon: 'person-outline' as const,
    href: '/(tabs)/profile',
  },
];

export function LearningBottomNav() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = tab.label === 'Learn';
          const color = isActive ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={tab.label}
              onPress={() => router.replace(tab.href as Href)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              style={styles.tab}
            >
              <Ionicons name={tab.icon} size={24} color={color} />
              <Text style={[styles.label, { color }, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: borderWidth.thin,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tabs: {
    height: 67,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  tab: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  activeLabel: {
    fontFamily: fontFamily.heading,
  },
});
