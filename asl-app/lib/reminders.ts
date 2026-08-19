import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// -----------------------------------------------------------------------------
// Expo Notifications
// -----------------------------------------------------------------------------
// We intentionally avoid the expo-notifications barrel import.
//
// Expo Go on Android does not support remote push notifications from SDK 53,
// while local notifications remain supported.
//
// These deep imports are intentional for local notifications.
// -----------------------------------------------------------------------------

import { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

import {
  getReminderSettings,
  type ReminderSettings,
} from './onboardingStorage';

import { calculateStreak } from './storage';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const REMINDER_IDS_KEY =
  '@signs/practice-reminder-notification-ids';

const APP_NAME = 'SIGNS';

const DEFAULT_HOUR = 18;
const DEFAULT_MINUTE = 30;

// -----------------------------------------------------------------------------
// Notification handler
// -----------------------------------------------------------------------------

let handlerConfigured = false;

function ensureNotificationHandler(): void {
  if (Platform.OS === 'web' || handlerConfigured) {
    return;
  }

  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  handlerConfigured = true;
}

// -----------------------------------------------------------------------------
// Time helpers
// -----------------------------------------------------------------------------

function parseTimeLocal(timeLocal: string): {
  hour: number;
  minute: number;
} {
  const match = /^(\d{1,2}):(\d{2})$/.exec(
    timeLocal.trim(),
  );

  if (!match) {
    return {
      hour: DEFAULT_HOUR,
      minute: DEFAULT_MINUTE,
    };
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return {
      hour: DEFAULT_HOUR,
      minute: DEFAULT_MINUTE,
    };
  }

  return {
    hour,
    minute,
  };
}

// -----------------------------------------------------------------------------
// Weekday conversion
// -----------------------------------------------------------------------------
//
// SIGNS:
// 0 = Monday
// 1 = Tuesday
// 2 = Wednesday
// 3 = Thursday
// 4 = Friday
// 5 = Saturday
// 6 = Sunday
//
// Expo:
// 1 = Sunday
// 2 = Monday
// 3 = Tuesday
// 4 = Wednesday
// 5 = Thursday
// 6 = Friday
// 7 = Saturday
// -----------------------------------------------------------------------------

function toExpoWeekday(day: number): number | null {
  if (!Number.isInteger(day) || day < 0 || day > 6) {
    return null;
  }

  return day === 6 ? 1 : day + 2;
}

// -----------------------------------------------------------------------------
// Notification messages
// -----------------------------------------------------------------------------

type ReminderMessage = {
  title: string;
  body: string;
};

const ZERO_STREAK_MESSAGES: ReminderMessage[] = [
  {
    title: 'no streak, no problem (yet) 👀',
    body: "start one today, it's free real estate.",
  },
  {
    title: "bestie it's day zero",
    body: 'one quiz starts the whole streak arc. lock in.',
  },
  {
    title: 'main character origin story starts now',
    body: 'every streak starts at 1. be the 1.',
  },
  {
    title: 'lowkey the perfect day to start',
    body: "future you is watching. don't disappoint them.",
  },
  {
    title: "let's get this streak started fr",
    body: 'one quiz, zero pressure, big payoff later.',
  },
];

const ACTIVE_STREAK_MESSAGES: ReminderMessage[] = [
  {
    title: 'bestie your {streak} day streak is calling 🔥',
    body: "one quiz and you're still that girl/guy. let's go.",
  },
  {
    title: "it's giving skipped practice 👀",
    body: 'not you leaving a {streak} day streak on read. open SIGNS.',
  },
  {
    title: 'no cap this takes 2 minutes ✋',
    body: '{streak} days in and your streak said "don\'t do this to me".',
  },
  {
    title: 'lowkey proud of your {streak} day streak',
    body: "keep it going, it's free clout. open SIGNS.",
  },
  {
    title: 'main character energy only 💅',
    body: "main characters don't break a {streak} day streak. that's the lore.",
  },
  {
    title: 'ok but have you signed today?',
    body: 'asking for your {streak} day streak. it looks nervous.',
  },
  {
    title: 'quick vibe check ✨',
    body: "did the quiz happen yet? your {streak} day streak needs it.",
  },
  {
    title: 'this is your sign (literally) 🤟',
    body: '2 minutes, one quiz, {streak} days protected.',
  },
  {
    title: 'streak anxiety incoming 😭',
    body: 'open SIGNS before your {streak} day streak starts questioning the friendship.',
  },
  {
    title: 'pov: you almost forgot',
    body: 'plot twist: you open the app and save the {streak} day streak.',
  },
  {
    title: 'highkey easiest W of the day',
    body: 'one quiz, instant W, {streak} days and counting.',
  },
  {
    title: 'not the {streak} day streak slipping away 💀',
    body: "reel it back in. one quiz, you're good.",
  },
  {
    title: 'brb, texting your streak for you',
    body: '"where are you" — your {streak} day streak, probably.',
  },
  {
    title: 'the algorithm respects consistency',
    body: "so does your {streak} day streak. give it today's quiz.",
  },
  {
    title: 'red flag: skipping today 🚩',
    body: 'green flag: keeping the {streak} day streak alive.',
  },
  {
    title: 'not to be dramatic but',
    body: 'your {streak} day streak genuinely needs you rn. 2 min tops.',
  },
  {
    title: 'the streak is the moment',
    body: 'be the moment. {streak} days deep, keep it alive.',
  },
];

function fillTemplate(
  message: ReminderMessage,
  streak: number,
): ReminderMessage {
  return {
    title: message.title.replaceAll(
      '{streak}',
      String(streak),
    ),
    body: message.body.replaceAll(
      '{streak}',
      String(streak),
    ),
  };
}

function pickReminderMessage(
  streak: number,
): ReminderMessage {
  const pool =
    streak > 0
      ? ACTIVE_STREAK_MESSAGES
      : ZERO_STREAK_MESSAGES;

  const index = Math.floor(
    Math.random() * pool.length,
  );

  return fillTemplate(pool[index], streak);
}

// -----------------------------------------------------------------------------
// Notification IDs
// -----------------------------------------------------------------------------

async function getReminderNotificationIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(
      REMINDER_IDS_KEY,
    );

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (value): value is string =>
        typeof value === 'string',
    );
  } catch {
    return [];
  }
}

async function saveReminderNotificationIds(
  ids: string[],
): Promise<void> {
  await AsyncStorage.setItem(
    REMINDER_IDS_KEY,
    JSON.stringify(ids),
  );
}

async function clearReminderNotificationIds(): Promise<void> {
  await AsyncStorage.removeItem(REMINDER_IDS_KEY);
}

// -----------------------------------------------------------------------------
// Cancel SIGNS notifications only
// -----------------------------------------------------------------------------

async function cancelPracticeReminders(): Promise<void> {
  const ids = await getReminderNotificationIds();

  if (ids.length === 0) {
    return;
  }

  await Promise.all(
    ids.map(async (id) => {
      try {
        await cancelScheduledNotificationAsync(id);
      } catch {
        // Notification may already be gone.
      }
    }),
  );

  await clearReminderNotificationIds();
}

// -----------------------------------------------------------------------------
// Permissions
// -----------------------------------------------------------------------------

async function ensureNotificationPermission(): Promise<boolean> {
  const permission = await requestPermissionsAsync();

  return permission.granted === true;
}

// -----------------------------------------------------------------------------
// Notification content
// -----------------------------------------------------------------------------

function buildReminderContent(
  streak: number,
  deepLink: string,
) {
  const message = pickReminderMessage(streak);

  return {
    title: message.title,
    body: message.body,

    data: {
      type: 'practice-reminder',
      app: APP_NAME,
      deepLink,
    },
  };
}

// -----------------------------------------------------------------------------
// Main synchronization
// -----------------------------------------------------------------------------

/**
 * Synchronizes SIGNS practice reminders.
 *
 * Call this:
 *
 * 1. When the app starts.
 * 2. When reminder settings change.
 * 3. After a quiz changes the streak.
 *
 * This intentionally does NOT run on every screen render.
 */
export async function syncPracticeReminders(
  settings?: ReminderSettings,
): Promise<{
  scheduled: number;
  skippedReason?: string;
}> {
  if (Platform.OS === 'web') {
    return {
      scheduled: 0,
      skippedReason: 'web',
    };
  }

  ensureNotificationHandler();

  const reminder =
    settings ?? (await getReminderSettings());

  // Remove only notifications created by SIGNS.
  await cancelPracticeReminders();

  // Nothing to schedule.
  if (
    !reminder.enabled ||
    reminder.days.length === 0
  ) {
    return {
      scheduled: 0,
      skippedReason: 'disabled',
    };
  }

  const permissionGranted =
    await ensureNotificationPermission();

  if (!permissionGranted) {
    return {
      scheduled: 0,
      skippedReason: 'permission',
    };
  }

  const {
    hour,
    minute,
  } = parseTimeLocal(reminder.timeLocal);

  // IMPORTANT:
  // The streak is calculated every time we synchronize.
  const currentStreak = await calculateStreak();

  const notificationIds: string[] = [];

  for (const day of reminder.days) {
    const weekday = toExpoWeekday(day);

    if (weekday === null) {
      console.warn(
        `[${APP_NAME}] Invalid practice day: ${day}`,
      );

      continue;
    }

    const content = buildReminderContent(
      currentStreak,
      reminder.deepLink,
    );

    try {
      const notificationId =
        await scheduleNotificationAsync({
          content,

          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
          },
        });

      notificationIds.push(notificationId);
    } catch (error) {
      console.warn(
        `[${APP_NAME}] Failed to schedule notification`,
        {
          day,
          error,
        },
      );
    }
  }

  await saveReminderNotificationIds(
    notificationIds,
  );

  return {
    scheduled: notificationIds.length,
  };
}

// -----------------------------------------------------------------------------
// Disable reminders
// -----------------------------------------------------------------------------

export async function disablePracticeReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await cancelPracticeReminders();
}

// -----------------------------------------------------------------------------
// Refresh reminders
// -----------------------------------------------------------------------------

export async function refreshPracticeReminders(): Promise<{
  scheduled: number;
  skippedReason?: string;
}> {
  return syncPracticeReminders();
}

// -----------------------------------------------------------------------------
// Call this after a quiz
// -----------------------------------------------------------------------------

/**
 * Call this immediately after a quiz successfully changes progress/streak.
 *
 * Example:
 *
 * await saveQuizResult(...);
 * await syncPracticeRemindersAfterQuiz();
 */
export async function syncPracticeRemindersAfterQuiz(): Promise<{
  scheduled: number;
  skippedReason?: string;
}> {
  return syncPracticeReminders();
}

// -----------------------------------------------------------------------------
// Debug
// -----------------------------------------------------------------------------

export async function getPracticeReminderIds(): Promise<string[]> {
  return getReminderNotificationIds();
}

// -----------------------------------------------------------------------------
// Export local progress
// -----------------------------------------------------------------------------

/**
 * Exports all SIGNS AsyncStorage data.
 *
 * This intentionally uses getAllKeys() so new storage keys are automatically
 * included in exports.
 */
export async function exportLocalProgress(): Promise<string> {
  const keys = await AsyncStorage.getAllKeys();

  const pairs =
    keys.length > 0
      ? await AsyncStorage.multiGet(keys)
      : [];

  const payload: Record<string, unknown> = {};

  for (const [key, value] of pairs) {
    if (value === null) {
      continue;
    }

    try {
      payload[key] = JSON.parse(value);
    } catch {
      payload[key] = value;
    }
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: APP_NAME,
      version: 1,
      data: payload,
    },
    null,
    2,
  );
}

// -----------------------------------------------------------------------------
// Reset local progress
// -----------------------------------------------------------------------------

export async function resetLocalProgress(): Promise<void> {
  // First remove scheduled SIGNS notifications.
  await disablePracticeReminders();

  // Then clear local application data.
  const keys = await AsyncStorage.getAllKeys();

  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
  }
}