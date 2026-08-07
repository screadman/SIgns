import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import {
  borderWidth,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';
import type { PathNodeState } from '../../lib/learningPath';

export type PathNodeProps = {
  state: PathNodeState;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** 0–100 completion; drives the outer progress ring. */
  progressPercent?: number;
  /** Solid island fill while unlocked. */
  accentColor?: string;
  /** Best stars earned when validating this island (0–3). */
  stars?: number;
  bubbleLabel?: string | null;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: 'md' | 'lg';
};

/** Gap between island edge and ring stroke. */
const RING_GAP = 7;
const RING_STROKE = 7;
/** Visible “puck” thickness under the face. */
const PUCK_DEPTH = 8;

export function PathNode({
  state,
  label,
  icon = 'star',
  progressPercent,
  accentColor = colors.pathActive,
  stars = 0,
  bubbleLabel,
  onPress,
  accessibilityLabel,
  size = 'lg',
}: PathNodeProps) {
  const diameter = size === 'lg' ? 78 : 60;
  const isCurrent = state === 'current';
  const isDone = state === 'done';
  const isLocked = state === 'locked';
  const displayStars = Math.max(0, Math.min(3, Math.floor(stars)));
  const showStars = !isLocked && displayStars > 0;

  const percent = isLocked
    ? 0
    : isDone
      ? 100
      : Math.min(100, Math.max(0, progressPercent ?? (isCurrent ? 28 : 0)));

  const faceColor = isLocked
    ? colors.pathUpcoming
    : isDone
      ? colors.pathDone
      : accentColor;
  const deep = isLocked
    ? '#C4C9D1'
    : isDone
      ? colors.pathDoneDeep
      : shadeDeep(accentColor);
  const iconColor = isLocked ? colors.pathUpcomingIcon : colors.white;

  const ringOuter = diameter + (RING_GAP + RING_STROKE) * 2;
  const ringRadius = (ringOuter - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - percent / 100);
  const ringTrack = isLocked ? '#E5E7EB' : '#E8E4F5';
  const ringColor = isDone ? colors.pathDone : colors.warning;
  const iconSize = size === 'lg' ? 30 : 24;

  return (
    <View style={[styles.wrap, isLocked && styles.wrapLocked]}>
      {bubbleLabel && !isLocked ? (
        <View style={styles.bubble} accessibilityElementsHidden>
          <Text style={styles.bubbleText}>{bubbleLabel}</Text>
          <View style={styles.bubbleTail} />
        </View>
      ) : null}

      <View style={[styles.ringWrap, { width: ringOuter, height: ringOuter }]}>
        <Svg
          width={ringOuter}
          height={ringOuter}
          style={styles.ringSvg}
          accessibilityElementsHidden
        >
          <Circle
            cx={ringOuter / 2}
            cy={ringOuter / 2}
            r={ringRadius}
            stroke={ringTrack}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {!isLocked && percent > 0 ? (
            <Circle
              cx={ringOuter / 2}
              cy={ringOuter / 2}
              r={ringRadius}
              stroke={ringColor}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${ringOuter / 2}, ${ringOuter / 2}`}
            />
          ) : null}
        </Svg>

        <Pressable
          onPress={isLocked ? undefined : onPress}
          disabled={isLocked || !onPress}
          accessibilityRole="button"
          accessibilityLabel={
            isLocked
              ? `${accessibilityLabel}, locked`
              : showStars
                ? `${accessibilityLabel}, ${displayStars} stars`
                : accessibilityLabel
          }
          accessibilityState={{ disabled: isLocked || !onPress }}
          style={({ pressed }) => [
            styles.puck,
            {
              width: diameter,
              height: diameter + PUCK_DEPTH,
              borderRadius: diameter / 2,
              backgroundColor: deep,
            },
            pressed && !isLocked && onPress && styles.pressed,
            isCurrent && !isLocked && styles.puckCurrent,
          ]}
        >
          <View
            style={[
              styles.face,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                backgroundColor: faceColor,
              },
            ]}
          >
            {!isLocked ? (
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                style={styles.faceSheen}
                pointerEvents="none"
              />
            ) : null}
            <Ionicons
              name={isDone && !isLocked ? 'checkmark' : icon}
              size={iconSize}
              color={iconColor}
            />
          </View>
        </Pressable>

        {showStars ? (
          <View style={styles.starsBadge} accessibilityElementsHidden>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.starsText}>{displayStars}</Text>
          </View>
        ) : null}
      </View>

      {label ? (
        <Text
          style={[
            styles.label,
            isCurrent && styles.labelCurrent,
            isLocked && styles.labelLocked,
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function shadeDeep(hex: string): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return colors.pathActiveDeep;
  }
  const value = Number.parseInt(raw, 16);
  const r = Math.max(0, ((value >> 16) & 255) - 48);
  const g = Math.max(0, ((value >> 8) & 255) - 48);
  const b = Math.max(0, (value & 255) - 48);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 156,
    overflow: 'visible',
  },
  wrapLocked: {
    opacity: 0.78,
  },
  bubble: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 12,
    backgroundColor: colors.pathBubble,
    borderWidth: borderWidth.thin,
    borderColor: colors.pathTrack,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    color: colors.pathBubbleText,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.sm,
    letterSpacing: 0.6,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    left: '42%',
    width: 12,
    height: 12,
    backgroundColor: colors.pathBubble,
    borderRightWidth: borderWidth.thin,
    borderBottomWidth: borderWidth.thin,
    borderColor: colors.pathTrack,
    transform: [{ rotate: '45deg' }],
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  ringSvg: {
    position: 'absolute',
  },
  puck: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  puckCurrent: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faceSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  starsBadge: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    zIndex: 8,
    elevation: 8,
    minWidth: 36,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: borderWidth.thin,
    borderColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
  },
  starsText: {
    color: colors.text,
    fontFamily: fontFamily.headingExtraBold,
    fontSize: fontSize.sm,
  },
  label: {
    marginTop: spacing['2sm'],
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  labelCurrent: {
    color: colors.text,
    fontFamily: fontFamily.heading,
  },
  labelLocked: {
    color: colors.textMuted,
  },
  pressed: {
    transform: [{ translateY: PUCK_DEPTH - 2 }],
    opacity: 0.96,
  },
});
