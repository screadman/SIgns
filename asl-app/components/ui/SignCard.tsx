import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  hasMediaAsset,
  toImageSource,
  type AslGlyph,
} from '../../constants/aslLetters';
import type { LearningModuleId } from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';
import {
  PARAMETER_LABELS,
  getSignImageSequence,
  resolveSignParameters,
  type SignParameterKey,
} from '../../lib/signParameters';
import { peekSignImage } from '../../lib/signImages';
import { SignGlassFrame } from './SignGlassFrame';

type SignCardProps = {
  sign: AslGlyph;
  moduleId?: LearningModuleId;
  accessibilityPrefix?: string;
  featured?: boolean;
};

const PARAM_ORDER: SignParameterKey[] = [
  'handshape',
  'location',
  'movement',
  'orientation',
  'nmm',
];

export function SignCard({
  sign,
  moduleId,
  accessibilityPrefix = 'ASL sign for',
  featured = false,
}: SignCardProps) {
  const mappedImage = peekSignImage(moduleId, sign.id);
  const sequence = getSignImageSequence({
    ...sign,
    image: sign.image ?? mappedImage,
  }).map((item) => toImageSource(item)).filter(Boolean);
  const fallbackSource = toImageSource(sign.image) ?? mappedImage;
  const frames =
    sequence.length > 0
      ? sequence
      : fallbackSource
        ? [fallbackSource]
        : [];
  const [frameIndex, setFrameIndex] = useState(0);
  const activeSource = frames[Math.min(frameIndex, frames.length - 1)];
  const hasImage = hasMediaAsset(activeSource);
  const parameters = resolveSignParameters(sign);
  const isSequence = frames.length > 1;

  return (
    <View
      style={[styles.card, featured && styles.featuredCard]}
      accessible
      accessibilityLabel={`${accessibilityPrefix} ${sign.label}. ${sign.description}`}
    >
      <SignGlassFrame
        style={[styles.imageContainer, featured && styles.featuredImageContainer]}
      >
        {hasImage && activeSource ? (
          <Image
            source={activeSource}
            style={[styles.image, featured && styles.featuredImage]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons
              name="images-outline"
              size={featured ? 40 : 28}
              color={colors.textMuted}
            />
            <Text style={styles.mediaPlaceholderText}>
              Illustration coming soon
            </Text>
          </View>
        )}

        {isSequence ? (
          <View style={styles.sequenceControls}>
            <Pressable
              onPress={() =>
                setFrameIndex((index) =>
                  index === 0 ? frames.length - 1 : index - 1,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Previous frame"
              hitSlop={8}
              style={styles.sequenceButton}
            >
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
            </Pressable>
            <Text style={styles.sequenceLabel}>
              Frame {frameIndex + 1}/{frames.length}
            </Text>
            <Pressable
              onPress={() =>
                setFrameIndex((index) => (index + 1) % frames.length)
              }
              accessibilityRole="button"
              accessibilityLabel="Next frame"
              hitSlop={8}
              style={styles.sequenceButton}
            >
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </Pressable>
          </View>
        ) : null}
      </SignGlassFrame>

      <Text style={[styles.label, featured && styles.featuredLabel]}>
        {sign.label}
      </Text>
      <Text style={[styles.description, featured && styles.featuredDescription]}>
        {sign.description}
      </Text>

      {(featured || Boolean(sign.tip)) && sign.tip ? (
        <Text style={styles.tip}>{sign.tip}</Text>
      ) : null}

      {featured ? (
        <View style={styles.paramsBlock}>
          <Text style={styles.paramsTitle}>Parameters</Text>
          {PARAM_ORDER.map((key) => (
            <View key={key} style={styles.paramRow}>
              <Text style={styles.paramChip}>{PARAMETER_LABELS[key]}</Text>
              <Text style={styles.paramText}>{parameters[key]}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    gap: spacing.xs,
  },
  featuredCard: {
    width: '100%',
    gap: spacing.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
  },
  featuredImageContainer: {
    aspectRatio: 1.1,
    borderRadius: borderRadius.xl,
  },
  image: {
    width: '88%',
    height: '88%',
  },
  featuredImage: {
    width: '92%',
    height: '92%',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  mediaPlaceholderText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  sequenceControls: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
  },
  sequenceButton: {
    padding: spacing.xs,
  },
  sequenceLabel: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  featuredLabel: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    textAlign: 'left',
  },
  description: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
  },
  featuredDescription: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'left',
  },
  tip: {
    color: colors.primary,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  paramsBlock: {
    marginTop: spacing.xs,
    gap: spacing['2sm'],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  paramsTitle: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.sm,
  },
  paramRow: {
    gap: 4,
  },
  paramChip: {
    color: colors.primary,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  paramText: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
});
