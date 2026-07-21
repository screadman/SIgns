import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LearningBottomNav,
  PrimaryButton,
  ProgressBar,
  SignCard,
} from '../../components/ui';
import { getLesson } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const lessonData = getLesson(getParam(params.id));

  if (!lessonData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Lesson not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { lesson, module, lessonIndex } = lessonData;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Pressable
              onPress={() =>
                router.replace(`/module/${lesson.moduleId}` as Href)
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>

            <View>
              <Text style={styles.title}>{lesson.title}</Text>
              <Text style={styles.step}>
                Step {lessonIndex + 1} of {module.lessons.length}
              </Text>
            </View>
          </View>

          <View style={styles.hearts} accessibilityLabel="3 lives">
            {[0, 1, 2].map((heart) => (
              <Ionicons
                key={heart}
                name="heart-outline"
                size={22}
                color={colors.accent}
              />
            ))}
          </View>
        </View>

        <View style={styles.headerProgressContainer}>
          <ProgressBar
            progress={(lessonIndex + 1) / module.lessons.length}
            color={colors.primary}
            trackColor={colors.primarySurface}
            style={styles.headerProgress}
          />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <SignCard
            sign={lesson.sign}
            accessibilityPrefix={
              lesson.moduleId === 'alphabet'
                ? 'ASL sign for letter'
                : 'ASL sign for number'
            }
            featured
          />

          <PrimaryButton
            title="Practice"
            fullWidth
            onPress={() => router.push(`/quiz/${lesson.id}` as Href)}
          />
        </ScrollView>
      </View>
      <LearningBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2sm'],
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  step: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: 15,
  },
  hearts: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerProgressContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerProgress: {
    height: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    gap: spacing['2md'],
    padding: spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing['2sm'],
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
});
