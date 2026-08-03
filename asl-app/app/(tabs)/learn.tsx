import { Ionicons } from '@expo/vector-icons';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
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

import { ModuleCard, SkeletonLoader } from '../../components/ui';
import { PILL_TAB_BAR_HEIGHT } from '../../components/ui/PillTabBar';
import {
  LEARNING_MODULES,
  getAllLessons,
  getLesson,
  isModuleLocked,
  type Lesson,
} from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  shadows,
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

type DictionaryTab = 'all' | 'favorites';

export default function DictionaryScreen() {
  const router = useRouter();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DictionaryTab>('all');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProgress() {
        setIsLoading(true);

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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!normalizedQuery) {
      return LEARNING_MODULES;
    }

    return LEARNING_MODULES.filter((module) => {
      if (module.title.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return module.lessons.some(
        (lesson) =>
          lesson.sign.label.toLowerCase().includes(normalizedQuery) ||
          lesson.sign.id.toLowerCase().includes(normalizedQuery) ||
          lesson.title.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [normalizedQuery]);

  const favoriteLessons = useMemo(() => {
    const lessons = getAllLessons().filter((lesson) =>
      isFavoriteLesson(lesson.id, favoriteLessonIds),
    );

    if (!normalizedQuery) {
      return lessons;
    }

    return lessons.filter(
      (lesson) =>
        lesson.sign.label.toLowerCase().includes(normalizedQuery) ||
        lesson.title.toLowerCase().includes(normalizedQuery),
    );
  }, [favoriteLessonIds, normalizedQuery]);

  async function handleToggleFavorite(lessonId: string) {
    const updated = await toggleFavoriteLesson(lessonId);
    setFavoriteLessonIds(updated);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dictionary</Text>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="TESTTEST123"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel="Search dictionary"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Ionicons name="search" size={20} color={colors.textMuted} />
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setActiveTab('all')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'all' }}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'all' && styles.tabLabelActive,
              ]}
            >
              All signs
            </Text>
            {activeTab === 'all' ? <View style={styles.tabUnderline} /> : null}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('favorites')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'favorites' }}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'favorites' && styles.tabLabelActive,
              ]}
            >
              Favorites
            </Text>
            {activeTab === 'favorites' ? (
              <View style={styles.tabUnderline} />
            ) : null}
          </Pressable>
        </View>

        {isLoading ? (
          <SkeletonLoader />
        ) : activeTab === 'all' ? (
              <View style={styles.moduleGrid}>
                {filteredModules.map((module) => {
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
                {filteredModules.length === 0 ? (
                  <Text style={styles.emptyText}>No categories match your search.</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.favoriteGrid}>
                {favoriteLessons.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No favorites yet. Tap the heart on a sign to save it here.
                  </Text>
                ) : (
                  favoriteLessons.map((lesson) => (
                    <FavoriteSignCard
                      key={lesson.id}
                      lesson={lesson}
                      isFavorite
                      onPress={() =>
                        router.push(`/lesson/${lesson.id}` as Href)
                      }
                      onToggleFavorite={() => {
                        void handleToggleFavorite(lesson.id);
                      }}
                    />
                  ))
                )}
              </View>
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoriteSignCard({
  lesson,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  lesson: Lesson;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const lessonData = getLesson(lesson.id);
  const imageSource = getLessonImageSource(lesson);
  const hasImage = lessonHasSignImage(lesson);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.sign.label}${
        lessonData ? `, ${lessonData.module.title}` : ''
      }`}
      style={[styles.signCard]}
    >
      <View style={styles.signMedia}>
        {hasImage && imageSource ? (
          <Image
            source={imageSource}
            style={styles.signImage}
            resizeMode="contain"
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
      </View>
      <Text style={styles.signLabel} numberOfLines={1}>
        {lesson.sign.label}
      </Text>
    </Pressable>
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
  searchBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    paddingVertical: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  tabLabelActive: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    rowGap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  favoriteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  emptyText: {
    width: '100%',
    marginTop: spacing.lg,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
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
  pressed: {
    opacity: opacity.pressed,
  },
});