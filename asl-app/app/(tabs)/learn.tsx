import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModuleCard, SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import {
  LEARNING_MODULES,
  isModuleLocked,
} from '../../constants/learning';
import {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import { getCompletedLessons } from '../../lib/storage';

export default function LearnScreen() {
  const router = useRouter();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        setIsLoading(true);

        try {
          const completedLessons = await getCompletedLessons();

          if (isActive) {
            setCompletedLessonIds(completedLessons);
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
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
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>SIGNS</Text>
            </View>

            <View style={styles.moduleGrid}>
              {LEARNING_MODULES.map((module) => {
                const completedLessons = module.lessons.filter((lesson) =>
                  completedLessonIds.includes(lesson.id),
                ).length;
                const locked = isModuleLocked(module.id, completedLessonIds);

                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    completedLessons={completedLessons}
                    locked={locked}
                    onPress={() => {
                      if (locked) {
                        return;
                      }

                      router.push({
                        pathname: '/module/[id]',
                        params: { id: module.id },
                      });
                    }}
                  />
                );
              })}
            </View>
          </>
        )}
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
    paddingBottom: spacing['2xl'] + PILL_TAB_BAR_HEIGHT + spacing.lg,
  },
  header: {
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2sm'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
