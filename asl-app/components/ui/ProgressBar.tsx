import { StyleSheet, View, type ViewStyle } from 'react-native';

import { borderRadius, colors } from '../../constants/theme';

type ProgressBarProps = {
  progress: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
};

export function ProgressBar({
  progress,
  color = colors.primary,
  trackColor = colors.disabled,
  style,
}: ProgressBarProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor }, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(normalizedProgress * 100),
      }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
    borderRadius: borderRadius.full,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
