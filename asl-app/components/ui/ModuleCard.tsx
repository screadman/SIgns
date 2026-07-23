import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LearningModule } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';

type ModuleCardProps = {
  module: LearningModule;
  completedLessons: number;
  locked?: boolean;
  onPress: () => void;
};

function ModuleGlyph({
  moduleId,
  locked,
}: {
  moduleId: LearningModule['id'];
  locked: boolean;
}) {
  const color = locked ? colors.textMuted : colors.white;

  if (moduleId === 'alphabet') {
    return <Text style={[styles.glyphText, { color }]}>ABC</Text>;
  }

  if (moduleId === 'wh-questions') {
    return <Text style={[styles.glyphMark, { color }]}>?</Text>;
  }

  if (moduleId === 'conversation') {
    return <Ionicons name="hand-left-outline" size={32} color={color} />;
  }

  if (moduleId === 'numbers') {
    return <Text style={[styles.glyphText, { color }]}>123</Text>;
  }

  return <Ionicons name="apps-outline" size={30} color={color} />;
}

export function ModuleCard({
  module,
  completedLessons,
  locked = false,
  onPress,
}: ModuleCardProps) {
  const totalLessons = module.lessons.length;
  const progressPercentage =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

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
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: locked ? colors.surfaceMuted : module.tileColor,
        },
        pressed && !locked && styles.pressed,
      ]}
    >
      <View style={styles.glyphWrap}>
        {locked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={16} color={colors.white} />
          </View>
        ) : (
          <ModuleGlyph moduleId={module.id} locked={locked} />
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
    width: '47.5%',
    aspectRatio: 1.35,
    borderRadius: borderRadius.xl,
    padding: spacing['2sm'],
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pressed: {
    opacity: opacity.pressed,
  },
  glyphWrap: {
    alignSelf: 'flex-end',
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.6,
  },
  glyphMark: {
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 36,
    lineHeight: 40,
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
    paddingVertical: spacing.xs + 1,
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
