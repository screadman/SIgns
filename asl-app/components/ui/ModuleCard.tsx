import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LearningModule } from '../../constants/learning';
import {
  borderRadius,
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  opacity,
  spacing,
} from '../../constants/theme';
import { ProgressBar } from './ProgressBar';

type ModuleCardProps = {
  module: LearningModule;
  completedLessons: number;
  locked?: boolean;
  onPress: () => void;
};

export function ModuleCard({
  module,
  completedLessons,
  locked = false,
  onPress,
}: ModuleCardProps) {
  const totalLessons = module.lessons.length;
  const progress = totalLessons === 0 ? 0 : completedLessons / totalLessons;
  const progressPercentage = Math.round(progress * 100);
  const lessonUnit = module.id === 'alphabet' ? 'letters' : 'numbers';
  const progressLabel = `${completedLessons} of ${totalLessons} ${lessonUnit} completed`;

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={
        locked
          ? `${module.title}, lessons locked. Complete the alphabet first`
          : `${module.title}, ${progressPercentage}% complete`
      }
      style={({ pressed }) => [
        styles.card,
        locked && styles.lockedCard,
        pressed && !locked && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: locked
                ? colors.surfaceMuted
                : module.surfaceColor,
            },
          ]}
        >
          <Ionicons
            name={module.icon}
            size={24}
            color={locked ? colors.textMuted : module.color}
          />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.lessonCount}>
            {locked ? 'Complete the alphabet first' : progressLabel}
          </Text>
        </View>

        {locked && (
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
          </View>
        )}
      </View>

      <ProgressBar
        progress={progress}
        color={locked ? colors.textMuted : module.color}
        trackColor={colors.surfaceMuted}
        style={styles.progressBar}
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
    borderWidth: borderWidth.thick,
    borderColor: colors.primarySurface,
    gap: spacing.md,
  },
  lockedCard: {
    borderColor: colors.surfaceMuted,
    opacity: opacity.muted,
  },
  pressed: {
    opacity: opacity.pressed,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
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
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.lg,
    lineHeight: 23,
  },
  lessonCount: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 17,
  },
  lockIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  progressBar: {
    height: 10,
  },
});
