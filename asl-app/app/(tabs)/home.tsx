import { Ionicons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LearningPath,
  ProfileAvatarView,
  ScreenBackdrop,
  SkeletonLoader,
  type LearningPathItem,
} from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';
import { getModulePathState } from '../../lib/learningPath';
import {
  getProfileIdentity,
  type ProfileIdentity,
} from '../../lib/profileIdentity';
import {
  calculateStreak,
  getCompletedLessons,
  getLessonStarsMap,
  getModuleStarsMap,
  getTotalXP,
  resolveModuleDisplayStars,
} from '../../lib/storage';

type HomeData = {
  xp: number;
  streak: number;
  completedLessonIds: string[];
  identity: ProfileIdentity;
  moduleStars: Record<string, number>;
  lessonStars: Record<string, number>;
};

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadHome() {
        const [xp, streak, completedLessonIds, identity, moduleStars, lessonStars] =
          await Promise.all([
            getTotalXP(),
            calculateStreak(),
            getCompletedLessons(),
            getProfileIdentity(),
            getModuleStarsMap(),
            getLessonStarsMap(),
          ]);

        if (isActive) {
          setData({
            xp,
            streak,
            completedLessonIds,
            identity,
            moduleStars,
            lessonStars,
          });
          setIsLoading(false);
        }
      }

      void loadHome();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const pathState = useMemo(
    () => getModulePathState(data?.completedLessonIds ?? []),
    [data?.completedLessonIds],
  );

  if (isLoading || !data) {
    return (
      <ScreenBackdrop variant="home">
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <SkeletonLoader />
          </View>
        </SafeAreaView>
      </ScreenBackdrop>
    );
  }

  const pathItems: LearningPathItem[] = pathState.nodes.map((node) => {
    const isCurrent = node.state === 'current';
    const isLocked = node.state === 'locked' || node.locked;
    const bubble =
      isCurrent
        ? node.completed === 0
          ? 'START'
          : 'CONTINUE'
        : null;

    return {
      id: node.id,
      state: node.state,
      label: node.title,
      icon: node.icon as LearningPathItem['icon'],
      progressPercent: node.percent,
      accentColor: node.color,
      stars: resolveModuleDisplayStars(
        node.id,
        data.moduleStars,
        data.lessonStars,
        data.completedLessonIds,
      ),
      bubbleLabel: bubble,
      accessibilityLabel: isLocked
        ? `${node.title}, locked. Finish the previous unit first.`
        : `${node.title}, ${node.completed} of ${node.total} done, ${node.left} left`,
      onPress: isLocked
        ? undefined
        : () => router.push(`/module/${node.id}` as Href),
    };
  });

  return (
    <ScreenBackdrop variant="home">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.identityRow}>
              <ProfileAvatarView
                name={data.identity.name}
                avatarId={data.identity.avatarId}
                photoUri={data.identity.photoUri}
                size={40}
                accessibilityLabel="Open profile"
                onPress={() => router.push('/(tabs)/profile' as Href)}
              />
              <View style={styles.streakPill}>
                <Ionicons name="flame" size={14} color={colors.error} />
                <Text style={styles.streakPillText}>{data.streak}</Text>
              </View>
            </View>
            <View style={styles.xpPill}>
              <Ionicons name="diamond" size={14} color={colors.gem} />
              <Text style={styles.xpText}>{data.xp}</Text>
            </View>
          </View>

          <LearningPath items={pathItems} />
        </ScrollView>
      </SafeAreaView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: PILL_TAB_BAR_HEIGHT + spacing['2xl'],
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.accentSurface,
  },
  streakPillText: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.gemSurface,
  },
  xpText: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
});
