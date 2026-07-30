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

// UI-only label — lib/levels.ts has no tier names, this is a display
// convenience derived from the level number, not stored/authoritative data.
function levelTier(level: number): string {
  if (level <= 1) return 'Beginner';
  if (level <= 3) return 'Intermediate';
  if (level <= 6) return 'Advanced';
  return 'Expert';
}

type ProfileData = {
  xp: number;
  streak: number;
  lessonsCompleted: number;
  unlockedBadges: BadgeId[];
};

export default function ProfileScreen() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // NOTE: local UI state only — no notification system exists yet in the
  // codebase (no permissions request, no storage key, no push setup).
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProfile() {
        const [xp, streak, completedLessonIds, unlockedBadges] =
          await Promise.all([
            getTotalXP(),
            calculateStreak(),
            getCompletedLessons(),
            getUnlockedBadges(),
          ]);

        if (isActive) {
          setData({
            xp,
            streak,
            lessonsCompleted: completedLessonIds.length,
            unlockedBadges,
          });
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SA</Text>
          </View>
          <Text style={styles.name}>Steven A.</Text>
          <Text style={styles.levelSubtitle}>
            Level {level.level} — {levelTier(level.level)}
          </Text>
        </View>

        <View style={styles.levelProgressCard}>
          <View style={styles.levelProgressHeader}>
            <Text style={styles.levelProgressLabel}>
              Level {level.level} Progress
            </Text>
            <Text style={styles.levelProgressValue}>
              {level.isMaxLevel
                ? 'Max'
                : `${level.xpIntoLevel} / ${level.xpForNext} XP`}
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[styles.trackFill, { width: `${level.progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={20} color={colors.accent} />
            <Text style={styles.statValue}>{data.streak} days</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{data.xp} XP</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
            <Text style={styles.statValue}>{data.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const unlocked = data.unlockedBadges.includes(badge.id);

            return (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={styles.badgeIconWrap}>
                  <Ionicons
                    name={badge.icon}
                    size={26}
                    color={unlocked ? colors.primary : colors.border}
                  />
                  {!unlocked && (
                    <View style={styles.badgeLockBadge}>
                      <Ionicons
                        name="lock-closed"
                        size={10}
                        color={colors.white}
                      />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.badgeName,
                    !unlocked && styles.badgeNameLocked,
                  ]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text style={styles.badgeDescription} numberOfLines={2}>
                  {badge.description}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsLabelRow}>
            <Ionicons
              name="notifications-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.settingsLabel}>Daily Reminders</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
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
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin + 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    marginTop: spacing.xs,
  },
  levelSubtitle: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  levelProgressCard: {
    gap: spacing['2sm'],
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelProgressLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
  },
  levelProgressValue: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
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
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    gap: 4,
  },
  statValue: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.base,
  },
  statLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
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
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    gap: 4,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceElevated,
  },
  badgeName: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },
  badgeDescription: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: 10,
    textAlign: 'center',
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
  settingsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  settingsLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
});