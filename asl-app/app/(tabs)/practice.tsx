import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
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
  shadows,
  spacing,
} from '../../constants/theme';

function ModeTile({
  mode,
  width,
  onPress,
}: {
  mode: PracticeMode;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${mode.title}. ${mode.description}`}
      style={({ pressed }) => [
        styles.tile,
        {
          width,
          backgroundColor: mode.tileColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.tileIconWrap}>
        <Ionicons name={mode.icon} size={34} color={colors.white} />
      </View>
      <Text style={styles.tileTitle}>{mode.title}</Text>
      <Text style={styles.tileDescription}>{mode.description}</Text>
    </Pressable>
  );
}

function ChallengesTile({
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
        styles.challengesTile,
        { backgroundColor: mode.tileColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.challengesIconWrap}>
        <Ionicons name={mode.icon} size={28} color={colors.white} />
      </View>
      <View style={styles.challengesCopy}>
        <Text style={styles.challengesTitle}>{mode.title}</Text>
        <Text style={styles.challengesDescription} numberOfLines={2}>
          {mode.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.white} />
    </Pressable>
  );
}

export default function PracticeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const gridModes = PRACTICE_MODES.filter((mode) => mode.id !== 'challenges');
  const challengesMode = PRACTICE_MODES.find((mode) => mode.id === 'challenges');

  const horizontalPadding = spacing.lg * 2;
  const gridGap = spacing['2sm'];
  const tileWidth = Math.max(
    140,
    Math.floor((windowWidth - horizontalPadding - gridGap) / 2),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>
          Pick a mode. Dictionary stays free to browse; practice is optional.
        </Text>

        {challengesMode ? (
          <ChallengesTile
            mode={challengesMode}
            onPress={() => {
              router.push(`/practice-mode/${challengesMode.id}` as Href);
            }}
          />
        ) : null}

        <View style={styles.grid}>
          {gridModes.map((mode) => (
            <ModeTile
              key={mode.id}
              mode={mode}
              width={tileWidth}
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
  challengesTile: {
    alignSelf: 'stretch',
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing['2sm'],
    overflow: 'hidden',
    ...shadows.md,
  },
  challengesIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  challengesCopy: {
    flex: 1,
    gap: 2,
  },
  challengesTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  challengesDescription: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    rowGap: spacing['2sm'],
  },
  tile: {
    minHeight: 168,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'flex-end',
    gap: spacing.xs,
    overflow: 'hidden',
    ...shadows.md,
  },
  tileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: spacing.md,
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
