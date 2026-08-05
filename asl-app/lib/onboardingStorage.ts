import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_SEEN_KEY = 'onboarding_seen';
export const ONBOARDING_PROFILE_KEY = 'onboarding_profile';
export const REMINDER_SETTINGS_KEY = 'reminder_settings_v1';

export type ExperienceLevel = 'beginner' | 'some' | 'conversational';
export type LearningGoal =
  | 'community'
  | 'school'
  | 'travel'
  | 'fun'
  | 'work';
export type DailyGoalMinutes = 5 | 10 | 15 | 20;

export type OnboardingProfile = {
  name: string;
  experience: ExperienceLevel;
  goal: LearningGoal;
  dailyMinutes: DailyGoalMinutes;
  notificationsOptIn: boolean;
  /** 0 = Monday ... 6 = Sunday */
  practiceDays: number[];
  /** Preset avatar id from constants/avatars, or null. */
  avatarId?: string | null;
  /** Local file URI for a custom profile photo, or null. */
  photoUri?: string | null;
  completedAt: string;
};

/** Push-ready reminder contract (native scheduling comes later). */
export type ReminderSettings = {
  enabled: boolean;
  /** 0 = Monday ... 6 = Sunday */
  days: number[];
  /** Local time HH:mm */
  timeLocal: string;
  deepLink: '/quiz/daily';
};

export const DEFAULT_REMINDER_TIME = '18:30';

export async function hasSeenOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === 'true';
}

export async function markOnboardingAsSeen() {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
}

export async function getOnboardingProfile() {
  const raw = await AsyncStorage.getItem(ONBOARDING_PROFILE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OnboardingProfile;
    return {
      ...parsed,
      avatarId: parsed.avatarId ?? null,
      photoUri: parsed.photoUri ?? null,
    };
  } catch {
    return null;
  }
}

export async function getLearnerName() {
  const profile = await getOnboardingProfile();
  const name = profile?.name?.trim();
  return name ? name : null;
}

export async function saveOnboardingProfile(
  profile: Omit<OnboardingProfile, 'completedAt'>,
) {
  const payload: OnboardingProfile = {
    ...profile,
    name: profile.name.trim(),
    avatarId: profile.avatarId ?? null,
    photoUri: profile.photoUri ?? null,
    completedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(payload));
  await markOnboardingAsSeen();

  // Keep reminder settings in sync with onboarding choices.
  await saveReminderSettings({
    enabled: profile.notificationsOptIn,
    days: [...profile.practiceDays].sort((a, b) => a - b),
    timeLocal: (await getReminderSettings()).timeLocal,
    deepLink: '/quiz/daily',
  });

  return payload;
}

export async function completeOnboardingWithoutProfile() {
  await markOnboardingAsSeen();
}

function normalizeTimeLocal(value: string | undefined): string {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return DEFAULT_REMINDER_TIME;
  }
  const [hours, minutes] = value.split(':').map(Number);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return DEFAULT_REMINDER_TIME;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  const raw = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
  const profile = await getOnboardingProfile();

  const fallback: ReminderSettings = {
    enabled: profile?.notificationsOptIn ?? false,
    days: profile?.practiceDays?.length
      ? [...profile.practiceDays]
      : [0, 1, 2, 3, 4, 5, 6],
    timeLocal: DEFAULT_REMINDER_TIME,
    deepLink: '/quiz/daily',
  };

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled:
        typeof parsed.enabled === 'boolean'
          ? parsed.enabled
          : fallback.enabled,
      days: Array.isArray(parsed.days)
        ? parsed.days.filter(
            (day): day is number =>
              typeof day === 'number' && day >= 0 && day <= 6,
          )
        : fallback.days,
      timeLocal: normalizeTimeLocal(parsed.timeLocal),
      deepLink: '/quiz/daily',
    };
  } catch {
    return fallback;
  }
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<ReminderSettings> {
  const payload: ReminderSettings = {
    enabled: settings.enabled,
    days: [...new Set(settings.days.filter((day) => day >= 0 && day <= 6))].sort(
      (a, b) => a - b,
    ),
    timeLocal: normalizeTimeLocal(settings.timeLocal),
    deepLink: '/quiz/daily',
  };

  await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(payload));

  try {
    const { syncPracticeReminders } = await import('./reminders');
    await syncPracticeReminders(payload);
  } catch {
    // Native modules may be unavailable on web.
  }

  return payload;
}

export async function updateReminderSettings(
  patch: Partial<Omit<ReminderSettings, 'deepLink'>>,
): Promise<ReminderSettings> {
  const current = await getReminderSettings();
  return saveReminderSettings({
    ...current,
    ...patch,
    deepLink: '/quiz/daily',
  });
}
