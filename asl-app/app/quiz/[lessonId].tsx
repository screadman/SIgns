import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLesson } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function QuizPlaceholderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lessonId?: string | string[];
  }>();
  const lessonData = getLesson(getParam(params.lessonId));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles-outline" size={40} color={colors.primary} />
        </View>
        <Text style={styles.title}>Practice is coming next</Text>
        <Text style={styles.description}>
          {lessonData
            ? `The quiz for ${lessonData.lesson.title} is ready to be designed.`
            : 'This quiz is ready to be designed.'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>Back to lesson</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    textAlign: 'center',
  },
  description: {
    maxWidth: 320,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.textInverse,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
});
