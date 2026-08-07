import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LearningBottomNav, GlassBackButton, SignGlassFrame } from '../../../components/ui';
import {
  LEARNING_MODULES,
  getLearningModule,
  getModuleMediaLessons,
  type Lesson,
} from '../../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../../constants/theme';
import { getLastMissedLessonIds } from '../../../lib/missedSigns';
import { getLessonImageSource } from '../../../lib/signImages';
import {
  getSignStrengthMap,
  isWeakSign,
} from '../../../lib/signStrength';
import { getFavoriteLessons } from '../../../lib/storage';

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function FlashcardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    moduleId?: string | string[];
    missed?: string | string[];
    favorites?: string | string[];
  }>();
  const moduleId = getParam(params.moduleId);
  const useMissed = getParam(params.missed) === '1';
  const useFavorites = getParam(params.favorites) === '1';
  const module = getLearningModule(moduleId);
  const [specialDeck, setSpecialDeck] = useState<Lesson[] | null>(
    useMissed || useFavorites ? null : [],
  );

  useEffect(() => {
    if (!useMissed && !useFavorites) {
      return;
    }

    let active = true;

    async function loadSpecialDeck() {
      const all = LEARNING_MODULES.flatMap((item) => item.lessons);

      if (useFavorites) {
        const [favoriteIds, strengthMap] = await Promise.all([
          getFavoriteLessons(),
          getSignStrengthMap(),
        ]);
        const now = Date.now();
        const lessons = favoriteIds
          .map((id) => all.find((lesson) => lesson.id === id))
          .filter((lesson): lesson is Lesson => Boolean(lesson))
          .sort((a, b) => {
            const aWeak = isWeakSign(strengthMap[a.sign.id], now) ? 0 : 1;
            const bWeak = isWeakSign(strengthMap[b.sign.id], now) ? 0 : 1;
            if (aWeak !== bWeak) {
              return aWeak - bWeak;
            }
            return (
              (strengthMap[a.sign.id]?.strength ?? 0) -
              (strengthMap[b.sign.id]?.strength ?? 0)
            );
          });

        if (active) {
          setSpecialDeck(lessons);
        }
        return;
      }

      const ids = await getLastMissedLessonIds();
      const lessons = ids
        .map((id) => all.find((lesson) => lesson.id === id))
        .filter((lesson): lesson is Lesson => Boolean(lesson));

      if (active) {
        setSpecialDeck(shuffle(lessons));
      }
    }

    void loadSpecialDeck();

    return () => {
      active = false;
    };
  }, [useMissed, useFavorites]);

  const moduleDeck = useMemo(() => {
    if (!module || useMissed || useFavorites) {
      return [];
    }
    return shuffle(getModuleMediaLessons(module));
  }, [module, useMissed, useFavorites]);

  const deck =
    useMissed || useFavorites ? specialDeck ?? [] : moduleDeck;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if ((useMissed || useFavorites) && specialDeck === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if ((!useMissed && !useFavorites && !module) || deck.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Flashcards unavailable</Text>
          <Text style={styles.notFoundBody}>
            {useFavorites
              ? 'Favorite some signs first, then review weak ones here.'
              : useMissed
                ? 'No missed signs to review right now.'
                : 'Add at least one illustrated sign in this collection.'}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const card = deck[index];
  const imageSource = getLessonImageSource(card);
  const title = useFavorites
    ? 'Favorite review'
    : useMissed
      ? 'Missed signs'
      : (module?.title ?? 'Flashcards');

  function go(delta: number) {
    setFlipped(false);
    setIndex((current) => {
      const next = current + delta;
      if (next < 0) {
        return deck.length - 1;
      }
      if (next >= deck.length) {
        return 0;
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <GlassBackButton onPress={() => router.back()} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.counter}>
            {index + 1}/{deck.length}
          </Text>
        </View>

        <View style={styles.body}>
          <Pressable
            onPress={() => setFlipped((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={flipped ? 'Show sign again' : 'Reveal meaning'}
            style={({ pressed }) => [
              styles.cardPress,
              pressed && styles.pressed,
            ]}
          >
            <SignGlassFrame style={styles.card} contentStyle={styles.cardContent}>
              {!flipped ? (
                imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.cardLabel}>{card.sign.label}</Text>
                )
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardLabel}>{card.sign.label}</Text>
                  <Text style={styles.cardTip}>{card.sign.description}</Text>
                  <Text style={styles.cardTip}>{card.sign.tip}</Text>
                </View>
              )}
              <Text style={styles.flipHint}>
                {flipped ? 'Tap to see the sign' : 'Tap to flip'}
              </Text>
            </SignGlassFrame>
          </Pressable>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => go(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous card"
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
              <Text style={styles.navLabel}>Prev</Text>
            </Pressable>
            <Pressable
              onPress={() => go(1)}
              accessibilityRole="button"
              accessibilityLabel="Next card"
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.navLabel}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.replace('/(tabs)/practice' as Href)}
            style={styles.doneLink}
          >
            <Text style={styles.doneLinkText}>Done reviewing</Text>
          </Pressable>
        </View>
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
    gap: spacing['2sm'],
    paddingHorizontal: spacing.lg,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  counter: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  cardPress: {
    flex: 1,
    maxHeight: 420,
  },
  card: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardImage: {
    width: 240,
    height: 240,
  },
  cardBack: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cardLabel: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 36,
    textAlign: 'center',
  },
  cardTip: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing.md,
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  navLabel: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
  },
  doneLink: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  doneLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.base,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  notFoundTitle: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.xl,
  },
  notFoundBody: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.md,
    padding: spacing['2sm'],
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
});
