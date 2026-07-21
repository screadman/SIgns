import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LearningModule } from '../../constants/learning';
import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  opacity,
  shadows,
  spacing,
} from '../../constants/theme';
import { ProgressBar } from './ProgressBar';

type ModuleCardProps = {
  module: LearningModule;
  completedLessons: number;
  onPress: () => void;
};

export function ModuleCard({
  module,
  completedLessons,
  onPress,
}: ModuleCardProps) {
  const totalLessons = module.lessons.length;
  const progress = totalLessons === 0 ? 0 : completedLessons / totalLessons;
  const progressPercentage = Math.round(progress * 100);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${module.title}, ${progressPercentage}% complete`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: module.surfaceColor }]}
        >
          <Ionicons name={module.icon} size={28} color={module.color} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.lessonCount}>
            {completedLessons} of {totalLessons} lessons
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      </View>

      <Text style={styles.description}>{module.description}</Text>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={[styles.progressValue, { color: module.color }]}>
          {progressPercentage}%
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={module.color}
        trackColor={module.surfaceColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: spacing['2md'],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceElevated,
    ...shadows.sm,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  heading: {
    flex: 1,
    marginHorizontal: spacing['2sm'],
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  lessonCount: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
  },
  description: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
  },
  progressValue: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
});
