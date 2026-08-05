import * as FileSystem from 'expo-file-system/legacy';

import { getAvatarById } from '../constants/avatars';
import {
  getOnboardingProfile,
  saveOnboardingProfile,
  type OnboardingProfile,
} from './onboardingStorage';

export const PROFILE_PHOTO_FILENAME = 'profile_photo.jpg';

export type ProfileIdentity = {
  name: string | null;
  avatarId: string | null;
  photoUri: string | null;
};

function profilePhotoPath(): string {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
  return `${base}${PROFILE_PHOTO_FILENAME}`;
}

export function initialsFromName(name: string | null | undefined): string {
  if (!name?.trim()) {
    return '?';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return parts[0].charAt(0).toUpperCase();
}

export async function getProfileIdentity(): Promise<ProfileIdentity> {
  const profile = await getOnboardingProfile();
  let photoUri: string | null = profile?.photoUri?.trim() || null;

  if (photoUri) {
    try {
      const info = await FileSystem.getInfoAsync(photoUri);
      if (!info.exists) {
        photoUri = null;
      }
    } catch {
      photoUri = null;
    }
  }

  const avatarId = profile?.avatarId?.trim() || null;
  const validAvatar =
    avatarId && getAvatarById(avatarId) ? avatarId : null;

  return {
    name: profile?.name?.trim() || null,
    avatarId: validAvatar,
    photoUri,
  };
}

export async function updateProfileName(name: string): Promise<void> {
  const profile = await getOnboardingProfile();
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }

  if (!profile) {
    await saveOnboardingProfile({
      name: trimmed,
      experience: 'beginner',
      goal: 'fun',
      dailyMinutes: 5,
      notificationsOptIn: false,
      practiceDays: [0, 1, 2, 3, 4],
      avatarId: null,
      photoUri: null,
    });
    return;
  }

  await saveOnboardingProfile({
    ...profile,
    name: trimmed,
  });
}

export async function updateProfileAvatar(avatarId: string | null): Promise<void> {
  const profile = await getOnboardingProfile();
  const nextAvatar =
    avatarId && getAvatarById(avatarId) ? avatarId : null;

  // Choosing an avatar clears a custom photo so the preset shows.
  if (nextAvatar && profile?.photoUri) {
    try {
      const info = await FileSystem.getInfoAsync(profilePhotoPath());
      if (info.exists) {
        await FileSystem.deleteAsync(profilePhotoPath(), { idempotent: true });
      }
    } catch {
      // Ignore missing file.
    }
  }

  if (!profile) {
    await saveOnboardingProfile({
      name: 'Learner',
      experience: 'beginner',
      goal: 'fun',
      dailyMinutes: 5,
      notificationsOptIn: false,
      practiceDays: [0, 1, 2, 3, 4],
      avatarId: nextAvatar,
      photoUri: null,
    });
    return;
  }

  await saveOnboardingProfile({
    ...profile,
    avatarId: nextAvatar,
    photoUri: nextAvatar ? null : profile.photoUri ?? null,
  });
}

export async function saveProfilePhotoFromUri(sourceUri: string): Promise<string> {
  const dest = profilePhotoPath();
  await FileSystem.copyAsync({ from: sourceUri, to: dest });

  const profile = await getOnboardingProfile();
  if (!profile) {
    await saveOnboardingProfile({
      name: 'Learner',
      experience: 'beginner',
      goal: 'fun',
      dailyMinutes: 5,
      notificationsOptIn: false,
      practiceDays: [0, 1, 2, 3, 4],
      avatarId: null,
      photoUri: dest,
    });
  } else {
    await saveOnboardingProfile({
      ...profile,
      photoUri: dest,
      avatarId: null,
    });
  }

  return dest;
}

export async function clearProfilePhoto(): Promise<void> {
  const dest = profilePhotoPath();
  try {
    const info = await FileSystem.getInfoAsync(dest);
    if (info.exists) {
      await FileSystem.deleteAsync(dest, { idempotent: true });
    }
  } catch {
    // Ignore missing file.
  }

  const profile = await getOnboardingProfile();
  if (!profile) {
    return;
  }

  await saveOnboardingProfile({
    ...profile,
    photoUri: null,
  });
}

/** Normalize legacy profiles missing identity fields. */
export function withIdentityDefaults(
  profile: OnboardingProfile,
): OnboardingProfile {
  return {
    ...profile,
    avatarId: profile.avatarId ?? null,
    photoUri: profile.photoUri ?? null,
  };
}
