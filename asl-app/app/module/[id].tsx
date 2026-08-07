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

import {
  GlassBackButton,
  LearningBottomNav,
  LearningPath,
  ScreenBackdrop,
  SignGlassFrame,
  type LearningPathItem,
} from '../../components/ui';
import {
  getLearningModule,
  type Lesson,
} from '../../constants/learning';
import {
  getModuleUnitForLesson,
  isModuleUnitUnlocked,
  moduleUsesUnitPath,
} from '../../constants/moduleUnits';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';
import { getLessonPathState, isModuleUnlocked } from '../../lib/learningPath';
import {
  getLessonImageSource,
  lessonHasSignImage,
} from '../../lib/signImages';
import {
  getCompletedLessons,
  getFavoriteLessons,
  getLessonStarsMap,
  isFavoriteLesson,
  resolveLessonDisplayStars,
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
      <SignGlassFrame style={styles.signMedia}>
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
      </SignGlassFrame>
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
  const [lessonStars, setLessonStars] = useState<Record<string, number>>({});
  const [browseMode, setBrowseMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        try {
          const [completedLessons, favorites, starsMap] = await Promise.all([
            getCompletedLessons(),
            getFavoriteLessons(),
            getLessonStarsMap(),
          ]);

          if (isActive) {
            setCompletedLessonIds(completedLessons);
            setFavoriteLessonIds(favorites);
            setLessonStars(starsMap);

            if (
              module &&
              !isModuleUnlocked(module.id, completedLessons)
            ) {
              router.replace('/(tabs)/home' as Href);
            }
          }
        } catch {
          if (isActive) {
            setCompletedLessonIds([]);
            setFavoriteLessonIds([]);
            setLessonStars({});
          }
        }
      }

      void loadProgress();

      return () => {
        isActive = false;
      };
    }, [module, router]),
  );

  const lessonPath = useMemo(
    () =>
      module
        ? getLessonPathState(module, completedLessonIds)
        : null,
    [module, completedLessonIds],
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

  if (!module || !lessonPath) {
    return (
      <ScreenBackdrop variant="path" accent={module?.color}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundTitle}>Module not found</Text>
            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScreenBackdrop>
    );
  }

  async function handleToggleFavorite(lessonId: string) {
    const updated = await toggleFavoriteLesson(lessonId);
    setFavoriteLessonIds(updated);
  }

  const pathItems: LearningPathItem[] = lessonPath.nodes.map((node) => {
    const isCurrent = node.state === 'current';
    const isLocked = node.state === 'locked' || node.locked;
    if (node.kind === 'boss') {
      const bossDone = node.state === 'done';
      return {
        id: node.id,
        state: node.state,
        label: node.title,
        icon: 'trophy' as const,
        stars: resolveLessonDisplayStars(
          `boss-${module.id}`,
          lessonStars,
          bossDone,
        ),
        bubbleLabel: isCurrent ? 'BOSS' : null,
        accessibilityLabel: isLocked
          ? `${node.title}, locked`
          : `${node.title}${isCurrent ? ', ready' : ''}`,
        onPress: isLocked
          ? undefined
          : () => router.push(`/quiz/boss/${module.id}` as Href),
      };
    }

    if (node.kind === 'unit' && node.unitId) {
      const unitIcon =
        module.id === 'numbers' ? 'apps-outline' : 'text';
      return {
        id: node.id,
        state: node.state,
        label: node.label,
        icon: (node.state === 'done'
          ? 'checkmark'
          : unitIcon) as LearningPathItem['icon'],
        progressPercent: node.state === 'done' ? 100 : isCurrent ? 35 : 0,
        accentColor: module.color,
        stars: resolveLessonDisplayStars(
          `unit-${node.unitId}`,
          lessonStars,
          node.state === 'done',
        ),
        bubbleLabel: isCurrent ? lessonPath.bubbleLabel : null,
        accessibilityLabel: isLocked
          ? `${node.title}, locked. Finish the previous unit first.`
          : `${node.title}, ${node.state}`,
        onPress: isLocked
          ? undefined
          : () => router.push(`/quiz/unit/${node.unitId}` as Href),
      };
    }

    return {
      id: node.id,
      state: node.state,
      label: node.label,
      icon: (node.state === 'done'
        ? 'checkmark'
        : 'hand-left-outline') as LearningPathItem['icon'],
      progressPercent: node.state === 'done' ? 100 : isCurrent ? 35 : 0,
      accentColor: module.color,
      stars: resolveLessonDisplayStars(
        node.lessonId,
        lessonStars,
        node.state === 'done',
      ),
      bubbleLabel: isCurrent ? lessonPath.bubbleLabel : null,
      accessibilityLabel: isLocked
        ? `${node.title}, locked. Complete the previous sign first.`
        : `${node.title}, ${node.state}`,
      onPress: isLocked
        ? undefined
        : () => router.push(`/lesson/${node.lessonId}` as Href),
    };
  });

  return (
    <ScreenBackdrop variant="path" accent={module.color}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <GlassBackButton
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/(tabs)/home' as Href);
            }}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {module.title}
          </Text>
          <Pressable
            onPress={() => setBrowseMode((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={browseMode ? 'Show learning path' : 'Search and browse'}
            style={({ pressed }) => [
              styles.modeChip,
              browseMode && styles.modeChipActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={browseMode ? 'map-outline' : 'search'}
              size={16}
              color={browseMode ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.modeChipText,
                browseMode && styles.modeChipTextActive,
              ]}
            >
              {browseMode ? 'Path' : 'Browse'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {browseMode ? (
            <>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search signs…"
                placeholderTextColor={colors.textMuted}
                style={styles.search}
                accessibilityLabel="Search signs"
              />
              <View style={styles.grid}>
                {filteredLessons.map((lesson) => {
                  let locked = false;
                  if (moduleUsesUnitPath(module.id)) {
                    const unit = getModuleUnitForLesson(lesson.id);
                    locked = unit
                      ? !isModuleUnitUnlocked(unit.id, completedLessonIds)
                      : true;
                  } else {
                    const pathNode = lessonPath.nodes.find(
                      (node) => node.lessonId === lesson.id,
                    );
                    locked = Boolean(pathNode?.locked);
                  }
                  return (
                    <SignGridCard
                      key={lesson.id}
                      lesson={lesson}
                      isCompleted={completedLessonIds.includes(lesson.id)}
                      isFavorite={isFavoriteLesson(lesson.id, favoriteLessonIds)}
                      onPress={
                        locked
                          ? () => undefined
                          : () => router.push(`/lesson/${lesson.id}` as Href)
                      }
                      onToggleFavorite={() => {
                        void handleToggleFavorite(lesson.id);
                      }}
                    />
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Lesson path</Text>
              <LearningPath items={pathItems} size="md" layout="pairs" />
              {lessonPath.currentLesson ? (
                <Pressable
                  style={styles.mirrorCta}
                  onPress={() =>
                    router.push(
                      `/practice/mirror?lessonId=${encodeURIComponent(lessonPath.currentLesson!.id)}` as Href,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Open Practice Mirror for current sign"
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.mirrorCtaText}>
                    Mirror this sign
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </ScrollView>

        <LearningBottomNav />
      </View>
      </SafeAreaView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.transparent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySurface,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
  },
  modeChipText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  modeChipTextActive: {
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  search: {
    minHeight: 44,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    backgroundColor: colors.surfaceElevated,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  signCard: {
    width: '31%',
    flexGrow: 1,
    maxWidth: '32%',
  },
  signMedia: {
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
  },
  signImage: {
    width: '90%',
    height: '90%',
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  completedBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    zIndex: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  mirrorCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySurface,
  },
  mirrorCtaText: {
    color: colors.primary,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
  },
  backLink: {
    padding: spacing.sm,
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});
