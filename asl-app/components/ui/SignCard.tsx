import { Image, StyleSheet, Text, View } from 'react-native';

import type { AslGlyph } from '../../constants/aslLetters';
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
  return (
    <View
      style={[styles.card, featured && styles.featuredCard]}
      accessible
      accessibilityLabel={`${accessibilityPrefix} ${sign.label}. ${sign.description}`}
    >
      <View
        style={[styles.imageContainer, featured && styles.featuredImageContainer]}
      >
        <Image
          source={sign.image}
          style={[styles.image, featured && styles.featuredImage]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>

      <Text style={[styles.label, featured && styles.featuredLabel]}>
        {sign.label}
      </Text>
      <Text style={[styles.description, featured && styles.featuredDescription]}>
        {sign.description}
      </Text>
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
    padding: spacing['2md'],
    borderRadius: borderRadius.xl,
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
    height: 240,
    borderRadius: borderRadius.lg,
  },
  image: {
    width: 116,
    height: 116,
  },
  featuredImage: {
    width: 220,
    height: 220,
  },
  label: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    marginTop: spacing['2sm'],
  },
  featuredLabel: {
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    marginTop: spacing.md,
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
    maxWidth: 320,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    marginTop: spacing.sm,
  },
});
