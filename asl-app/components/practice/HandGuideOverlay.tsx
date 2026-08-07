import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { colors, fontFamily, fontSize } from '../../constants/theme';

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export type HandGuideOrientation = 'upright' | 'sideways';

type HandGuideOverlayProps = {
  pulse?: boolean;
  active?: boolean;
  /** Match how the model sign is held (H is sideways, A is upright). */
  orientation?: HandGuideOrientation;
  /** Short coaching line under the frame. */
  hint?: string;
};

/**
 * Large signing-space guide (not a tiny Face ID face oval).
 * Shows a roomy frame + hand silhouette oriented like the model.
 */
export function HandGuideOverlay({
  pulse = true,
  active = false,
  orientation = 'upright',
  hint,
}: HandGuideOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const sideways = orientation === 'sideways';

  useEffect(() => {
    if (!pulse) {
      pulseAnim.setValue(active ? 0.95 : 0.7);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.55,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, active, pulseAnim]);

  const strokeColor = active ? colors.success : colors.primary;

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.vignette} />
      <Animated.View
        style={[
          styles.frameWrap,
          sideways ? styles.frameSideways : styles.frameUpright,
          { opacity: pulseAnim },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={sideways ? '0 0 320 200' : '0 0 260 300'}
        >
          {sideways ? (
            <>
              <Rect
                x="18"
                y="22"
                width="284"
                height="156"
                rx="48"
                ry="48"
                fill="none"
                stroke={strokeColor}
                strokeWidth={4}
                strokeDasharray={active ? undefined : '12 9'}
                opacity={0.95}
              />
              {/* Sideways hand: fingers point left, like ASL H illustration. */}
              <Path
                d="M250 118
                   C240 96 210 78 180 74
                   C168 62 158 58 152 70
                   C146 54 136 52 132 68
                   C126 52 116 54 114 70
                   C108 58 98 62 100 78
                   C78 88 62 110 68 132
                   C74 152 98 166 128 164
                   C168 162 220 150 250 118 Z"
                fill={strokeColor}
                opacity={0.2}
                stroke={strokeColor}
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Ellipse
                cx="130"
                cy="150"
                rx="108"
                ry="128"
                fill="none"
                stroke={strokeColor}
                strokeWidth={4}
                strokeDasharray={active ? undefined : '12 9'}
                opacity={0.95}
              />
              {/* Upright open hand. */}
              <Path
                d="M95 200
                   C92 168 96 132 104 108
                   C108 94 118 88 126 104
                   L130 78
                   C132 64 142 62 146 78
                   L152 70
                   C156 56 166 56 168 72
                   L174 80
                   C178 66 188 68 188 84
                   L192 118
                   C212 124 224 148 218 176
                   C212 204 184 222 152 220
                   C122 218 98 214 95 200 Z"
                fill={strokeColor}
                opacity={0.2}
                stroke={strokeColor}
                strokeWidth={2}
              />
            </>
          )}
        </Svg>
      </Animated.View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...ABSOLUTE_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  vignette: {
    ...ABSOLUTE_FILL,
    backgroundColor: 'rgba(10, 16, 40, 0.22)',
  },
  frameWrap: {
    maxWidth: 420,
  },
  frameUpright: {
    width: '88%',
    aspectRatio: 260 / 300,
  },
  frameSideways: {
    width: '94%',
    aspectRatio: 320 / 200,
  },
  hint: {
    marginTop: 12,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
