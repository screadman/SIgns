import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
} from '../../constants/theme';

const FLAME = require('../../assets/onboarding/streak-flame-lit.png');
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type PracticeDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type StreakCommitProps = {
  selectedDays: PracticeDayIndex[];
  onToggleDay: (day: PracticeDayIndex) => void;
};

export function StreakCommit({
  selectedDays,
  onToggleDay,
}: StreakCommitProps) {
  return (
    <View style={styles.wrap}>
      <Image source={FLAME} style={styles.flame} resizeMode="contain" />

      <View style={styles.titleGroup}>
        <Text style={styles.title}>Which days will you practice?</Text>
        <Text style={styles.subtitle}>
          Pick a rhythm that fits your week. You can change this later.
        </Text>
      </View>

      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, index) => {
          const day = index as PracticeDayIndex;
          const selected = selectedDays.includes(day);

          return (
            <Pressable
              key={`${label}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}, ${selected ? 'selected' : 'not selected'}`}
              onPress={() => onToggleDay(day)}
              style={styles.dayCol}
            >
              <Text
                style={[styles.weekLabel, selected && styles.weekLabelActive]}
              >
                {label}
              </Text>
              <View
                style={[styles.dayCircle, selected && styles.dayCircleActive]}
              >
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.textInverse}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  flame: {
    width: 132,
    height: 132,
  },
  titleGroup: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  weekRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  dayCol: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
  },
  weekLabelActive: {
    color: colors.streak,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.streak,
  },
});
