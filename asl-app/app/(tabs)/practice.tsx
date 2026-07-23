import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import { LEARNING_MODULES, lessonHasQuizMedia } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';

export default function PracticeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>
          Choose a collection when you want to quiz. Learning stays free to
          browse.
        </Text>

        <View style={styles.moduleList}>
          {LEARNING_MODULES.map((module) => {
            const hasQuizMedia = module.lessons.some((lesson) =>
              lessonHasQuizMedia(lesson),
            );

            return (
              <Pressable
                key={module.id}
                onPress={() => {
                  router.push({
                    pathname: '/module/[id]',
                    params: { id: module.id },
                  });
                }}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{module.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {hasQuizMedia
                      ? 'Open the orange banner when you are ready'
                      : 'Browse signs now. Quiz when videos are ready'}
                  </Text>
                </View>
                <Ionicons
                  name={hasQuizMedia ? 'flash' : 'chevron-forward'}
                  size={18}
                  color={hasQuizMedia ? colors.accent : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: PILL_TAB_BAR_HEIGHT + spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    marginBottom: spacing.md,
  },
  moduleList: {
    gap: spacing['2sm'],
  },
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primarySurface,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  cardCopy: {
    flex: 1,
    marginRight: spacing.sm,
    gap: 2,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});
