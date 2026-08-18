import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  getReminderSettings,
  type ReminderSettings,
} from './onboardingStorage';
import { calculateStreak } from './storage';

let Notifications: typeof import('expo-notifications') | null = null;

async function loadNotifications() {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!Notifications) {
    Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return Notifications;
}

function parseTimeLocal(timeLocal: string): { hour: number; minute: number } {
  const [hourRaw, minuteRaw] = timeLocal.split(':').map(Number);
  return {
    hour: Number.isFinite(hourRaw) ? hourRaw : 18,
    minute: Number.isFinite(minuteRaw) ? minuteRaw : 30,
  };
}

/**
 * Reminder copy — Gen Z tone, Duolingo-style: escalates based on whether
 * you actually have a streak going, and bakes the real number in.
 * {streak} gets replaced with the live value from calculateStreak().
 */
const ZERO_STREAK_MESSAGES: Array<{ title: string; body: string }> = [
  {
    title: 'no streak, no problem (yet) 👀',
    body: "start one today, it's free real estate.",
  },
  {
    title: 'bestie it\'s day zero',
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
    title: 'lets get this streak started fr',
    body: 'one quiz, zero pressure, big payoff later.',
  },
];

const ACTIVE_STREAK_MESSAGES: Array<{ title: string; body: string }> = [
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
    body: 'so does your {streak} day streak. give it today\'s quiz.',
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
  message: { title: string; body: string },
  streak: number,
): { title: string; body: string } {
  return {
    title: message.title.replace('{streak}', String(streak)),
    body: message.body.replace('{streak}', String(streak)),
  };
}

function pickReminderMessage(streak: number): { title: string; body: string } {
  const pool = streak > 0 ? ACTIVE_STREAK_MESSAGES : ZERO_STREAK_MESSAGES;
  const index = Math.floor(Math.random() * pool.length);
  return fillTemplate(pool[index], streak);
}

/** Schedules local notifications for practice days. No-ops on web. */
export async function syncPracticeReminders(
  settings?: ReminderSettings,
): Promise<{ scheduled: number; skippedReason?: string }> {
  const NotificationsApi = await loadNotifications();
  if (!NotificationsApi) {
    return { scheduled: 0, skippedReason: 'web' };
  }

  const reminder = settings ?? (await getReminderSettings());
  await NotificationsApi.cancelAllScheduledNotificationsAsync();

  if (!reminder.enabled || reminder.days.length === 0) {
    return { scheduled: 0, skippedReason: 'disabled' };
  }

  const permission = await NotificationsApi.requestPermissionsAsync();
  if (!permission.granted) {
    return { scheduled: 0, skippedReason: 'permission' };
  }

  const { hour, minute } = parseTimeLocal(reminder.timeLocal);
  const currentStreak = await calculateStreak();
  let scheduled = 0;

  for (const day of reminder.days) {
    // expo weekday: 1 = Sunday ... 7 = Saturday
    // our practiceDays: 0 = Monday ... 6 = Sunday
    const weekday = day === 6 ? 1 : day + 2;
    const message = pickReminderMessage(currentStreak);
    await NotificationsApi.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        data: { deepLink: reminder.deepLink },
      },
      trigger: {
        type: NotificationsApi.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
    scheduled += 1;
  }

  return { scheduled };
}

export async function exportLocalProgress(): Promise<string> {
  const keys = await AsyncStorage.getAllKeys();
  const pairs = await AsyncStorage.multiGet(keys);
  const payload: Record<string, unknown> = {};
  for (const [key, value] of pairs) {
    if (!value) {
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
      app: 'SIGNS',
      data: payload,
    },
    null,
    2,
  );
}

export async function resetLocalProgress(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
  }
}