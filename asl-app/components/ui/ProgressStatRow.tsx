import { StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

type ProgressStatRowProps = {
  hereLabel: string;
  leftLabel: string;
};

export function ProgressStatRow({
  hereLabel,
  leftLabel,
}: ProgressStatRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <Text style={styles.caption}>You are here</Text>
        <Text style={styles.value} numberOfLines={2}>
          {hereLabel}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.caption}>Still ahead</Text>
        <Text style={styles.value} numberOfLines={2}>
          {leftLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cell: {
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  caption: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
});
