import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassBackButton, LearningBottomNav, SignGlassFrame } from '../../components/ui';
import { ASL_LETTERS } from '../../constants/aslLetters';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  spacing,
} from '../../constants/theme';
import { peekSignImage } from '../../lib/signImages';

type Tier = 'slow' | 'normal' | 'fast';

const TIER_MS: Record<Tier, number> = {
  slow: 2500,
  normal: 1600,
  fast: 900,
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export default function FingerspellingTrainerScreen() {
  const router = useRouter();
  const deck = useMemo(
    () =>
      shuffle(
        ASL_LETTERS.filter((letter) =>
          Boolean(peekSignImage('alphabet', letter.id) || letter.image),
        ),
      ).slice(0, 12),
    [],
  );
  const [tier, setTier] = useState<Tier>('normal');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [imageVisible, setImageVisible] = useState(true);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];
  const image =
    current &&
    (peekSignImage('alphabet', current.id) ?? current.image);

  useEffect(() => {
    setImageVisible(true);
    setRevealed(false);
    const timer = setTimeout(() => {
      // Fast tier hides the still so recall is true receptive practice.
      if (tier === 'fast') {
        setImageVisible(false);
      }
    }, TIER_MS[tier]);
    return () => clearTimeout(timer);
  }, [index, tier]);

  const options = useMemo(() => {
    if (!current) {
      return [] as string[];
    }
    const distractors = shuffle(
      ASL_LETTERS.filter((letter) => letter.id !== current.id),
    )
      .slice(0, 3)
      .map((letter) => letter.label);
    return shuffle([current.label, ...distractors]);
  }, [current, index]);

  function answer(label: string) {
    if (!current || revealed || done) {
      return;
    }
    const correct = label === current.label;
    setRevealed(true);
    setImageVisible(true);
    if (correct) {
      setScore((value) => value + 1);
    }
    setTimeout(() => {
      if (index >= deck.length - 1) {
        setDone(true);
        return;
      }
      setIndex((value) => value + 1);
    }, Math.min(900, TIER_MS[tier] / 2));
  }

  if (deck.length < 4) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Fingerspelling locked</Text>
          <Text style={styles.body}>
            Need alphabet illustrations first.
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Round complete</Text>
          <Text style={styles.body}>
            {score}/{deck.length} correct · {tier} pace
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.replace('/(tabs)/practice' as Href)}
          >
            <Text style={styles.ctaText}>Back to Practice</Text>
          </Pressable>
        </View>
        <LearningBottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <GlassBackButton onPress={() => router.back()} />
          <Text style={styles.title}>Fingerspelling</Text>
          <Text style={styles.score}>
            {index + 1}/{deck.length}
          </Text>
        </View>

        <View style={styles.tiers}>
          {(['slow', 'normal', 'fast'] as Tier[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setTier(item)}
              style={[styles.tierChip, tier === item && styles.tierChipActive]}
            >
              <Text
                style={[
                  styles.tierText,
                  tier === item && styles.tierTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <SignGlassFrame style={styles.prompt}>
          {image && imageVisible ? (
            <Image source={image} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.fallback}>
              {imageVisible ? current.label : '?'}
            </Text>
          )}
        </SignGlassFrame>

        <Text style={styles.question}>
          {tier === 'fast' && !imageVisible && !revealed
            ? 'Which letter did you see?'
            : 'Which letter is this?'}
        </Text>

        <View style={styles.options}>
          {options.map((label) => {
            const state =
              revealed && label === current.label
                ? 'correct'
                : revealed && label !== current.label
                  ? 'dim'
                  : 'default';
            return (
              <Pressable
                key={label}
                disabled={revealed}
                onPress={() => answer(label)}
                style={[
                  styles.option,
                  state === 'correct' && styles.optionCorrect,
                  state === 'dim' && styles.optionDim,
                ]}
              >
                <Text style={styles.optionText}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <LearningBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, padding: spacing.lg, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
  },
  score: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
  },
  tiers: { flexDirection: 'row', gap: spacing.sm },
  tierChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  tierChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tierText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    textTransform: 'capitalize',
  },
  tierTextActive: { color: colors.white },
  prompt: {
    height: 220,
    borderRadius: borderRadius.xl,
  },
  image: { width: 180, height: 180 },
  fallback: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 72,
    color: colors.primary,
  },
  question: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  option: {
    width: '48%',
    minHeight: 52,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  optionDim: { opacity: opacity.pressed },
  optionText: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  body: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    textAlign: 'center',
    lineHeight: lineHeight.base,
  },
  link: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
  },
  cta: {
    marginTop: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.white,
    fontFamily: fontFamily.heading,
  },
});
