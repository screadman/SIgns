import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import { BADGES, type BadgeId } from '../../constants/badges';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';
import { getLevel } from '../../lib/levels';
import {
  calculateStreak,
  getCompletedLessons,
  getTotalXP,
  getUnlockedBadges,
} from '../../lib/storage';
import { getOnboardingProfile } from '../../lib/onboardingStorage';

type ProfileData = {
  name: string | null;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  unlockedBadges: BadgeId[];
  notificationsOptIn: boolean;
};

export default function ProfileScreen() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProfile() {
        const [xp, streak, completedLessonIds, unlockedBadges, onboarding] =
          await Promise.all([
            getTotalXP(),
            calculateStreak(),
            getCompletedLessons(),
            getUnlockedBadges(),
            getOnboardingProfile(),
          ]);

        if (isActive) {
          const notificationsOptIn = onboarding?.notificationsOptIn ?? true;
          setData({
            name: onboarding?.name?.trim() || null,
            xp,
            streak,
            lessonsCompleted: completedLessonIds.length,
            unlockedBadges,
            notificationsOptIn,
          });
          setNotificationsEnabled(notificationsOptIn);
          setIsLoading(false);
        }
      }

      void loadProfile();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const level = useMemo(() => getLevel(data?.xp ?? 0), [data?.xp]);

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <SkeletonLoader />
        </View>
      </SafeAreaView>
    );
  }

  const avatarLetter = data.name ? data.name.charAt(0).toUpperCase() : '👋';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.name}>
            {data.name ? data.name : 'Your progress'}
          </Text>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {level.level}</Text>
          </View>
        </View>

        <View style={styles.levelProgressCard}>
          <Text style={styles.levelProgressLabel}>
            {level.isMaxLevel
              ? 'Max level reached'
              : `${level.xpIntoLevel} / ${level.xpForNext} XP to Level ${level.level + 1}`}
          </Text>
          <View style={styles.track}>
            <View
              style={[styles.trackFill, { width: `${level.progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const unlocked = data.unlockedBadges.includes(badge.id);

            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    unlocked
                      ? styles.badgeIconUnlocked
                      : styles.badgeIconLocked,
                  ]}
                >
                  <Ionicons
                    name={badge.icon}
                    size={22}
                    color={unlocked ? colors.white : colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.badgeLabel,
                    !unlocked && styles.badgeLabelLocked,
                  ]}
                  numberOfLines={2}
                >
                  {badge.name}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'] + PILL_TAB_BAR_HEIGHT + spacing.lg,
    gap: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 30,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  levelPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2sm'] / 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  levelPillText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  levelProgressCard: {
    gap: spacing['2sm'],
  },
  levelProgressLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  track: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing['2sm'],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySurface,
    gap: 2,
  },
  statValue: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2sm'],
  },
  badgeCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accentSurface,
    gap: spacing['2sm'],
  },
  badgeCardLocked: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconUnlocked: {
    backgroundColor: colors.accent,
  },
  badgeIconLocked: {
    backgroundColor: colors.textMuted,
    opacity: 0.4,
  },
  badgeLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: colors.textMuted,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  settingsLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
});