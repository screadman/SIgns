import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_SEEN_KEY = 'onboarding_seen';
export const ONBOARDING_PROFILE_KEY = 'onboarding_profile';

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
  completedAt: string;
};

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
    return JSON.parse(raw) as OnboardingProfile;
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
    completedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(payload));
  await markOnboardingAsSeen();

  return payload;
}

export async function completeOnboardingWithoutProfile() {
  await markOnboardingAsSeen();
}
