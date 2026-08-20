import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: August 5, 2026</Text>
        <Text style={styles.body}>
          SIGNS stores your learning progress on this device (lessons completed,
          quiz results, streak, reminder preferences, and sign strength). We do
          not require an account for the current version.
        </Text>
        <Text style={styles.body}>
          If you enable reminders, the app may schedule local notifications on
          your practice days. Notification permission is optional.
        </Text>
        <Text style={styles.body}>
          If you set a profile photo from the camera, that access stays on device
          and is not uploaded in this version.
        </Text>
        <Text style={styles.body}>
          You can export or reset your local data from Profile. Contact the
          project maintainers for privacy questions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
  },
  updated: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  body: {
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
});
