import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleCard } from '../../components/ui';
import { LEARNING_MODULES } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import { getCompletedLessons, getStars } from '../../lib/storage';

function LearnSkeleton() {
  return (
    <View style={styles.moduleList} accessibilityLabel="Loading learning modules">
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonHeading}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMeta} />
            </View>
          </View>
          <View style={styles.skeletonDescription} />
          <View style={styles.skeletonDescriptionShort} />
          <View style={styles.skeletonProgress} />
        </View>
      ))}
    </View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        setIsLoading(true);

        try {
          const [completedLessons, storedStars] = await Promise.all([
            getCompletedLessons(),
            getStars(),
          ]);

          if (isActive) {
            setCompletedLessonIds(completedLessons);
            setStars(storedStars);
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
            setStars(0);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadProgress();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={styles.heading}>
            <Text style={styles.title}>Learn</Text>
            <Text style={styles.subtitle}>Choose a module and start signing.</Text>
          </View>

          <View
            style={styles.starsBadge}
            accessible
            accessibilityLabel={`${stars} stars`}
          >
            <Ionicons name="star" size={18} color={colors.warning} />
            <Text style={styles.starsText}>{stars}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Learning modules</Text>

        {isLoading ? (
          <LearnSkeleton />
        ) : (
          <View style={styles.moduleList}>
            {LEARNING_MODULES.map((module) => {
              const completedLessons = module.lessons.filter((lesson) =>
                completedLessonIds.includes(lesson.id),
              ).length;

              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  completedLessons={completedLessons}
                  onPress={() =>
                    router.push({
                      pathname: '/module/[id]',
                      params: { id: module.id },
                    })
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['2md'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heading: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  starsBadge: {
    minWidth: 64,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing['2sm'],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  starsText: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing['2sm'],
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  moduleList: {
    gap: spacing.md,
  },
  skeletonCard: {
    width: '100%',
    padding: spacing['2md'],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.disabled,
  },
  skeletonHeading: {
    flex: 1,
    marginLeft: spacing['2sm'],
  },
  skeletonTitle: {
    width: '58%',
    height: 20,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  skeletonMeta: {
    width: '38%',
    height: 12,
    marginTop: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  skeletonDescription: {
    width: '92%',
    height: 14,
    marginTop: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  skeletonDescriptionShort: {
    width: '64%',
    height: 14,
    marginTop: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  skeletonProgress: {
    width: '100%',
    height: 8,
    marginTop: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.disabled,
  },
});
