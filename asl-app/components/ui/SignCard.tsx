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
};

export function SignCard({
  sign,
  accessibilityPrefix = 'ASL sign for',
}: SignCardProps) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${accessibilityPrefix} ${sign.label}. ${sign.description}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={sign.image}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>

      <Text style={styles.label}>{sign.label}</Text>
      <Text style={styles.description}>{sign.description}</Text>
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
  imageContainer: {
    width: '100%',
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
  },
  image: {
    width: 116,
    height: 116,
  },
  label: {
    color: colors.primary,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    marginTop: spacing['2sm'],
  },
  description: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
