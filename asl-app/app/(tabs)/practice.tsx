import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import { PRACTICE_MODES, type PracticeMode } from '../../constants/practice';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';

function ModeTile({
  mode,
  onPress,
}: {
  mode: PracticeMode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${mode.title}. ${mode.description}`}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: mode.tileColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.tileIconWrap}>
        <Ionicons name={mode.icon} size={28} color={colors.white} />
      </View>
      <Text style={styles.tileTitle}>{mode.title}</Text>
      <Text style={styles.tileDescription}>{mode.description}</Text>
    </Pressable>
  );
}

export default function PracticeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>
          Pick a mode. Learn stays free to browse; practice is optional.
        </Text>

        <View style={styles.grid}>
          {PRACTICE_MODES.map((mode) => (
            <ModeTile
              key={mode.id}
              mode={mode}
              onPress={() => {
                router.push(`/practice-mode/${mode.id}` as Href);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: PILL_TAB_BAR_HEIGHT + spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing['2sm'],
  },
  tile: {
    width: '48%',
    minHeight: 168,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  tileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 'auto',
  },
  tileTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  tileDescription: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
