import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

type UnitBannerProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  completed: number;
  total: number;
  left: number;
  percent: number;
  accentColor?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
};

export function UnitBanner({
  eyebrow = 'UNIT',
  title,
  subtitle,
  completed,
  total,
  left,
  percent,
  accentColor = colors.primary,
  actionIcon,
  onActionPress,
  actionAccessibilityLabel,
}: UnitBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: accentColor }]}>
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        {actionIcon && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            accessibilityRole="button"
            accessibilityLabel={actionAccessibilityLabel ?? 'Unit action'}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={actionIcon} size={20} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>
          {completed}/{total} done
        </Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>{left} left</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.stat}>{percent}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  title: {
    color: colors.white,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stat: {
    color: colors.white,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
  },
  statDot: {
    color: 'rgba(255,255,255,0.6)',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  pressed: {
    opacity: 0.85,
  },
});
