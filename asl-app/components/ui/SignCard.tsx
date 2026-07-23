import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

import { hasMediaAsset, toImageSource, type AslGlyph } from '../../constants/aslLetters';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  shadows,
  spacing,
} from '../../constants/theme';

type SignCardProps = {
  sign: AslGlyph;
  accessibilityPrefix?: string;
  featured?: boolean;
};

export function SignCard({
  sign,
  accessibilityPrefix = 'ASL sign for',
  featured = false,
}: SignCardProps) {
  const hasImage = hasMediaAsset(sign.image);

  return (
    <View
      style={[styles.card, featured && styles.featuredCard]}
      accessible
      accessibilityLabel={`${accessibilityPrefix} ${sign.label}. ${sign.description}`}
    >
      <View
        style={[styles.imageContainer, featured && styles.featuredImageContainer]}
      >
        {hasImage ? (
          <Image
            source={toImageSource(sign.image)}
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
      </View>

      <Text style={[styles.label, featured && styles.featuredLabel]}>
        {sign.label}
      </Text>
      <Text style={[styles.description, featured && styles.featuredDescription]}>
        {sign.description}
      </Text>
      {featured && sign.tip ? (
        <Text style={styles.tip}>{sign.tip}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 238,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.primarySurface,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    ...shadows.sm,
  },
  featuredCard: {
    width: '100%',
    minHeight: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: colors.transparent,
    shadowOpacity: 0,
    elevation: 0,
  },
  imageContainer: {
    width: '100%',
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
  },
  featuredImageContainer: {
    height: 200,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.signSurface,
  },
  image: {
    width: 116,
    height: 116,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mediaPlaceholderText: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
  },
  label: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    marginTop: spacing['2sm'],
  },
  featuredLabel: {
    fontSize: 32,
    lineHeight: 38,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  featuredDescription: {
    width: '100%',
    maxWidth: 342,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  tip: {
    width: '100%',
    maxWidth: 342,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
  },
});
