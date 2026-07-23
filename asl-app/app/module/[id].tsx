import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningBottomNav } from '../../components/ui';
import {
  getFirstPracticeLesson,
  getLearningModule,
  lessonHasQuizMedia,
  type Lesson,
} from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';
import {
  getLessonImageSource,
  lessonHasSignImage,
} from '../../lib/signImages';
import {
  getCompletedLessons,
  getFavoriteLessons,
  isFavoriteLesson,
  toggleFavoriteLesson,
} from '../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function SignGridCard({
  lesson,
  isCompleted,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  lesson: Lesson;
  isCompleted: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const imageSource = getLessonImageSource(lesson);
  const hasImage = lessonHasSignImage(lesson);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}${isCompleted ? ', completed' : ''}${
        isFavorite ? ', favorite' : ''
      }`}
      style={({ pressed }) => [styles.signCard, pressed && styles.pressed]}
    >
      <View style={styles.signMedia}>
        {hasImage && imageSource ? (
          <Image
            source={imageSource}
            style={styles.signImage}
            resizeMode="contain"
            fadeDuration={0}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons name="images-outline" size={28} color={colors.textMuted} />
        )}
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
          style={styles.heartButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.error : colors.textMuted}
          />
        </Pressable>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.white} />
          </View>
        ) : null}
      </View>
      <Text style={styles.signLabel} numberOfLines={1}>
        {lesson.sign.label}
      </Text>
    </Pressable>
  );
}

export default function ModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const module = getLearningModule(getParam(params.id));
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        try {
          const [completedLessons, favorites] = await Promise.all([
            getCompletedLessons(),
            getFavoriteLessons(),
          ]);

          if (isActive) {
            setCompletedLessonIds(completedLessons);
            setFavoriteLessonIds(favorites);
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
            setFavoriteLessonIds([]);
          }
        }
      }

      void loadProgress();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const filteredLessons = useMemo(() => {
    if (!module) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return module.lessons;
    }

    return module.lessons.filter((lesson) => {
      const label = lesson.sign.label.toLowerCase();
      const title = lesson.title.toLowerCase();
      const id = lesson.sign.id.toLowerCase();

      return (
        label.includes(query) ||
        title.includes(query) ||
        id.includes(query) ||
        label.startsWith(query) ||
        id.startsWith(query)
      );
    });
  }, [module, searchQuery]);

  if (!module) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Module not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = module.lessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id),
  ).length;
  const practiceLesson = getFirstPracticeLesson(module);
  const canPractice =
    practiceLesson !== null && lessonHasQuizMedia(practiceLesson);

  async function handleToggleFavorite(lessonId: string) {
    const updated = await toggleFavoriteLesson(lessonId);
    setFavoriteLessonIds(updated);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Pressable
              onPress={() => {
                if (router.canDismiss()) {
                  router.dismiss();
                  return;
                }

                if (router.canGoBack()) {
                  router.back();
                  return;
                }

                router.replace('/(tabs)/learn' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>{module.title}</Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {completedCount}/{module.lessons.length}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable
            disabled={!canPractice}
            onPress={() => {
              if (!practiceLesson || !canPractice) {
                return;
              }

              router.push(`/quiz/${practiceLesson.id}` as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel="Start optional practice"
            accessibilityState={{ disabled: !canPractice }}
            style={({ pressed }) => [
              styles.practiceCard,
              !canPractice && styles.practiceCardDisabled,
              pressed && canPractice && styles.pressed,
            ]}
          >
            <View style={styles.practiceCopy}>
              <Text
                style={[
                  styles.practiceEyebrow,
                  !canPractice && styles.practiceTextDisabled,
                ]}
              >
                Let&apos;s put it into practice
              </Text>
              <Text
                style={[
                  styles.practiceTitle,
                  !canPractice && styles.practiceTextDisabled,
                ]}
              >
                {canPractice ? 'Ready, set, go' : 'Practice coming soon'}
              </Text>
            </View>
            <View style={styles.practiceIconWrap}>
              <Ionicons
                name="extension-puzzle"
                size={28}
                color={canPractice ? colors.white : colors.textMuted}
              />
            </View>
          </Pressable>

          <View style={styles.searchBar}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search signs..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              accessibilityLabel={`Search in ${module.title}`}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <Ionicons name="search" size={20} color={colors.textMuted} />
          </View>

          <Text style={styles.sectionTitle}>Signs in collection</Text>

          <View style={styles.signGrid}>
            {filteredLessons.map((lesson) => (
              <SignGridCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={completedLessonIds.includes(lesson.id)}
                isFavorite={isFavoriteLesson(lesson.id, favoriteLessonIds)}
                onPress={() => router.push(`/lesson/${lesson.id}` as Href)}
                onToggleFavorite={() => {
                  void handleToggleFavorite(lesson.id);
                }}
              />
            ))}
          </View>

          {filteredLessons.length === 0 ? (
            <Text style={styles.emptyText}>No signs match your search.</Text>
          ) : null}
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
    height: 60,
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
    flexShrink: 1,
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
    fontSize: fontSize['2xl'],
    lineHeight: 30,
    flexShrink: 1,
  },
  progressBadge: {
    paddingHorizontal: spacing['2sm'],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  progressBadgeText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  practiceCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
  },
  practiceCardDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  practiceCopy: {
    flex: 1,
    marginRight: spacing.md,
    gap: 4,
  },
  practiceEyebrow: {
    color: colors.white,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  practiceTitle: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
    lineHeight: 26,
  },
  practiceTextDisabled: {
    color: colors.textMuted,
  },
  practiceIconWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing['2sm'],
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  signGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing['2sm'],
  },
  signCard: {
    width: '47.5%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  signMedia: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.signSurface,
  },
  signImage: {
    width: '80%',
    height: '80%',
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  completedBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  signLabel: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    textAlign: 'center',
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
