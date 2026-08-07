import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  getReminderSettings,
  type ReminderSettings,
} from './onboardingStorage';

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
  let scheduled = 0;

  for (const day of reminder.days) {
    // expo weekday: 1 = Sunday ... 7 = Saturday
    // our practiceDays: 0 = Monday ... 6 = Sunday
    const weekday = day === 6 ? 1 : day + 2;
    await NotificationsApi.scheduleNotificationAsync({
      content: {
        title: "Time for today's signs",
        body: 'Open SIGNS and complete your Daily Quiz.',
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
