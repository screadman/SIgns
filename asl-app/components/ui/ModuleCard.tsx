import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import type { LearningModule } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  opacity,
  shadows,
  spacing,
} from '../../constants/theme';

type ModuleCardProps = {
  module: LearningModule;
  completedLessons: number;
  locked?: boolean;
  onPress: () => void;
};

function ModuleGlyph({
  module,
  locked,
}: {
  module: LearningModule;
  locked: boolean;
}) {
  const color = locked ? colors.textMuted : colors.white;

  if (module.id === 'alphabet') {
    return <Text style={[styles.glyphText, { color }]}>ABC</Text>;
  }

  if (module.id === 'wh-questions') {
    return <Text style={[styles.glyphMark, { color }]}>?</Text>;
  }

  if (module.id === 'numbers') {
    return <Text style={[styles.glyphText, { color }]}>123</Text>;
  }

  return <Ionicons name={module.icon} size={34} color={color} />;
}

export function ModuleCard({
  module,
  completedLessons,
  locked = false,
  onPress,
}: ModuleCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const totalLessons = module.lessons.length;
  const progressPercentage =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  // Pixel sizes avoid Android collapse with width % + aspectRatio in flexWrap grids.
  const gridGap = spacing['2sm'];
  const horizontalPadding = spacing.lg * 2;
  const cardWidth = Math.max(
    140,
    Math.floor((windowWidth - horizontalPadding - gridGap) / 2),
  );
  const cardHeight = Math.max(96, Math.round(cardWidth / 1.55));

  return (
   <Pressable
  onPress={onPress}
  disabled={locked}
  accessibilityRole="button"
  accessibilityState={{ disabled: locked }}
  accessibilityLabel={
    locked
      ? `${module.title}, locked`
      : `${module.title}, ${progressPercentage}% complete`
  }
  style={[
    styles.card,
    {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: locked
        ? colors.surfaceMuted
        : module.tileColor || colors.primary,
    },
  ]}
>
      <View style={styles.glyphWrap}>
        {locked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={colors.white} />
          </View>
        ) : (
          <ModuleGlyph module={module} locked={locked} />
        )}
      </View>

      <View style={styles.labelPill}>
        <Text style={styles.labelText} numberOfLines={1}>
          {module.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.md,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  glyphWrap: {
    alignSelf: 'flex-end',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  glyphMark: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 40,
    lineHeight: 44,
  },
  lockBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
  },
  labelPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  labelText: {
    color: colors.text,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
