import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAvatarView, ScreenBackdrop, SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import { PROFILE_AVATARS } from '../../constants/avatars';
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
  getOnboardingProfile,
  getReminderSettings,
  saveOnboardingProfile,
  updateReminderSettings,
  type OnboardingProfile,
} from '../../lib/onboardingStorage';
import {
  clearProfilePhoto,
  getProfileIdentity,
  saveProfilePhotoFromUri,
  updateProfileAvatar,
  updateProfileName,
  type ProfileIdentity,
} from '../../lib/profileIdentity';
import {
  exportLocalProgress,
  resetLocalProgress,
  syncPracticeReminders,
} from '../../lib/reminders';
import {
  calculateStreak,
  getCompletedLessons,
  getTotalXP,
  getUnlockedBadges,
} from '../../lib/storage';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function levelTier(level: number): string {
  if (level <= 1) return 'Beginner';
  if (level <= 3) return 'Learner';
  if (level <= 6) return 'Signer';
  if (level <= 10) return 'Fluent';
  return 'Master';
}

export default function ProfileScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<ProfileIdentity>({
    name: 'Learner',
    avatarId: null,
    photoUri: null,
  });
  const [profileSnapshot, setProfileSnapshot] = useState<OnboardingProfile | null>(null);
  const [nameDraft, setNameDraft] = useState('Learner');
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [unlocked, setUnlocked] = useState<BadgeId[]>([]);
  const [practiceDays, setPracticeDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:30');

  const refresh = useCallback(async () => {
    const [profile, reminders, totalXp, done, badges, currentStreak, nextIdentity] =
      await Promise.all([
        getOnboardingProfile(),
        getReminderSettings(),
        getTotalXP(),
        getCompletedLessons(),
        getUnlockedBadges(),
        calculateStreak(),
        getProfileIdentity(),
      ]);
    setProfileSnapshot(profile);
    setIdentity(nextIdentity);
    setNameDraft(nextIdentity.name ?? 'Learner');
    setPracticeDays(profile?.practiceDays ?? [0, 1, 2, 3, 4]);
    setRemindersEnabled(reminders.enabled);
    setReminderTime(reminders.timeLocal);
    setXp(totalXp);
    setLessonsDone(done.length);
    setUnlocked(badges);
    setStreak(currentStreak);
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const levelInfo = useMemo(() => getLevel(xp), [xp]);
  const progressPct = Math.round(levelInfo.progress * 100);
  const displayName = identity.name?.trim() || 'Learner';

  const persistPracticeDays = async (days: number[]) => {
    const sorted = [...days].sort((a, b) => a - b);
    setPracticeDays(sorted);
    const base = profileSnapshot;
    if (!base) {
      return;
    }
    const next = await saveOnboardingProfile({
      name: base.name,
      experience: base.experience,
      goal: base.goal,
      dailyMinutes: base.dailyMinutes,
      notificationsOptIn: remindersEnabled,
      practiceDays: sorted,
      avatarId: identity.avatarId,
      photoUri: identity.photoUri,
    });
    setProfileSnapshot(next);
    await syncPracticeReminders();
  };

  const toggleDay = (day: number) => {
    const next = practiceDays.includes(day)
      ? practiceDays.filter((d) => d !== day)
      : [...practiceDays, day];
    if (next.length === 0) {
      Alert.alert('Pick at least one day', 'Choose one or more practice days.');
      return;
    }
    void persistPracticeDays(next);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to set a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    const photoUri = await saveProfilePhotoFromUri(result.assets[0].uri);
    setIdentity((prev) => ({ ...prev, photoUri, avatarId: null }));
    setShowAvatarSheet(false);
    await refresh();
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    const photoUri = await saveProfilePhotoFromUri(result.assets[0].uri);
    setIdentity((prev) => ({ ...prev, photoUri, avatarId: null }));
    setShowAvatarSheet(false);
    await refresh();
  };

  const selectAvatar = async (avatarId: string) => {
    await updateProfileAvatar(avatarId);
    setIdentity((prev) => ({ ...prev, avatarId, photoUri: null }));
    setShowAvatarSheet(false);
    await refresh();
  };

  const removePhoto = async () => {
    await clearProfilePhoto();
    setIdentity((prev) => ({ ...prev, photoUri: null }));
    await refresh();
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Enter a name to continue.');
      return;
    }
    await updateProfileName(trimmed);
    setIdentity((prev) => ({ ...prev, name: trimmed }));
    setShowNameEdit(false);
    await refresh();
  };

  if (!ready) {
    return (
      <ScreenBackdrop>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <SkeletonLoader />
          </ScrollView>
        </SafeAreaView>
      </ScreenBackdrop>
    );
  }

  return (
    <ScreenBackdrop>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Text style={styles.brand}>SIGNS</Text>
          <ProfileAvatarView
            name={displayName}
            photoUri={identity.photoUri}
            avatarId={identity.avatarId}
            size={80}
            showEditBadge
            onPress={() => setShowAvatarSheet(true)}
          />
          <Pressable
            onPress={() => {
              setNameDraft(displayName);
              setShowNameEdit(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Edit name"
            style={styles.nameRow}
          >
            <Text style={styles.name}>{displayName}</Text>
            <Ionicons name="pencil" size={14} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.levelSubtitle}>
            Level {levelInfo.level} · {levelTier(levelInfo.level)}
          </Text>
        </View>

        <View style={styles.levelProgressCard}>
          <View style={styles.levelProgressHeader}>
            <Text style={styles.levelProgressLabel}>Level progress</Text>
            <View style={styles.levelProgressValueRow}>
              <Ionicons name="diamond" size={12} color={colors.primary} />
              <Text style={styles.levelProgressValue}>
                {levelInfo.xpIntoLevel}/{levelInfo.xpForNext}
              </Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={18} color={colors.error} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="diamond" size={18} color={colors.primary} />
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>Gems</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.statValue}>{lessonsDone}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Practice days</Text>
        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, index) => {
            const day = index;
            const active = practiceDays.includes(day);
            return (
              <Pressable
                key={label}
                onPress={() => toggleDay(day)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => {
            const isUnlocked = unlocked.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !isUnlocked && { opacity: 0.45 }]}
              >
                <View style={styles.badgeIconWrap}>
                  <Ionicons
                    name={badge.icon}
                    size={22}
                    color={isUnlocked ? colors.primary : colors.textMuted}
                  />
                  {!isUnlocked ? (
                    <View style={styles.badgeLockBadge}>
                      <Ionicons name="lock-closed" size={10} color={colors.white} />
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]} numberOfLines={1}>
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
            <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            <View>
              <Text style={styles.settingsLabel}>Practice reminders</Text>
              <Text style={styles.settingsHint}>Get a reminder on the days you chose to practice</Text>
            </View>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={(value) => {
              setRemindersEnabled(value);
              void (async () => {
                await updateReminderSettings({ enabled: value });
                await syncPracticeReminders();
              })();
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.timeRow}>
          <TextInput
            value={reminderTime}
            onChangeText={setReminderTime}
            onBlur={() => {
              void (async () => {
                await updateReminderSettings({ timeLocal: reminderTime.trim() || '18:30' });
                await syncPracticeReminders();
              })();
            }}
            placeholder="18:30"
            placeholderTextColor={colors.textMuted}
            style={styles.timeInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => {
              void (async () => {
                await updateReminderSettings({ timeLocal: reminderTime.trim() || '18:30' });
                await syncPracticeReminders();
                Alert.alert('Reminders synced', 'Your practice reminder schedule is up to date.');
              })();
            }}
            style={styles.syncButton}
          >
            <Text style={styles.syncButtonText}>Sync</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.linkRow}
          onPress={() => {
            void (async () => {
              const payload = await exportLocalProgress();
              Alert.alert('Progress exported', `${payload.length} characters ready to copy.`);
            })();
          }}
        >
          <Text style={styles.linkLabel}>Export progress</Text>
          <Ionicons name="download-outline" size={16} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={styles.linkRow}
          onPress={() => {
            Alert.alert(
              'Reset all data?',
              'This clears lessons, gems, streak, and local profile settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      await resetLocalProgress();
                      router.replace('/onboarding' as Href);
                    })();
                  },
                },
              ],
            );
          }}
        >
          <Text style={[styles.linkLabel, styles.danger]}>Reset all data</Text>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </Pressable>
      </ScrollView>
      </SafeAreaView>

      <Modal visible={showAvatarSheet} transparent animationType="slide" onRequestClose={() => setShowAvatarSheet(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAvatarSheet(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Profile photo</Text>
            <Pressable style={styles.sheetAction} onPress={() => void pickFromLibrary()}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={styles.sheetActionText}>Choose from library</Text>
            </Pressable>
            {Platform.OS !== 'web' ? (
              <Pressable style={styles.sheetAction} onPress={() => void takePhoto()}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={styles.sheetActionText}>Take photo</Text>
              </Pressable>
            ) : null}
            {identity.photoUri ? (
              <Pressable style={styles.sheetAction} onPress={() => void removePhoto()}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.sheetActionText, styles.danger]}>Remove photo</Text>
              </Pressable>
            ) : null}
            <Text style={styles.sheetSubtitle}>Or pick an avatar</Text>
            <View style={styles.avatarGrid}>
              {PROFILE_AVATARS.map((avatar) => {
                const selected = identity.avatarId === avatar.id && !identity.photoUri;
                return (
                  <Pressable
                    key={avatar.id}
                    onPress={() => void selectAvatar(avatar.id)}
                    style={[styles.avatarOption, selected && styles.avatarOptionSelected]}
                    accessibilityLabel={avatar.label}
                  >
                    <ProfileAvatarView
                      name={avatar.label}
                      photoUri={null}
                      avatarId={avatar.id}
                      size={56}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.sheetCancel} onPress={() => setShowAvatarSheet(false)}>
              <Text style={styles.sheetCancelText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showNameEdit} transparent animationType="fade" onRequestClose={() => setShowNameEdit(false)}>
        <Pressable style={styles.modalBackdropCentered} onPress={() => setShowNameEdit(false)}>
          <Pressable style={styles.nameModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Edit name</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              maxLength={40}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              style={styles.nameInput}
            />
            <View style={styles.nameActions}>
              <Pressable style={styles.sheetCancel} onPress={() => setShowNameEdit(false)}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveNameButton} onPress={() => void saveName()}>
                <Text style={styles.saveNameText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'] + PILL_TAB_BAR_HEIGHT + spacing.lg,
    gap: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  brand: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.sm,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
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
  levelProgressValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  dayTextActive: {
    color: colors.white,
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
    flex: 1,
  },
  settingsLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
  settingsHint: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
  },
  syncButton: {
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  linkLabel: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
  danger: {
    color: colors.error,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdropCentered: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  sheetTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sheetActionText: {
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  avatarOption: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.transparent,
    padding: 2,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
  },
  sheetCancel: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  sheetCancelText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
  nameModal: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  nameInput: {
    minHeight: 48,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
  },
  nameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  saveNameButton: {
    paddingHorizontal: spacing.lg,
    minHeight: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveNameText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
});
