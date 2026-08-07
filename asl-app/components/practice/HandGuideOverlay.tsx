import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '../../constants/theme';

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

type HandGuideOverlayProps = {
  /** Soft pulse while the user should align their hand. */
  pulse?: boolean;
  /** Stronger highlight once aligned / holding. */
  active?: boolean;
};

/**
 * Face ID style hand frame: dimmed vignette + silhouette where the signing hand belongs.
 */
export function HandGuideOverlay({
  pulse = true,
  active = false,
}: HandGuideOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (!pulse) {
      pulseAnim.setValue(active ? 0.9 : 0.55);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 900,
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
      <Animated.View style={[styles.frameWrap, { opacity: pulseAnim }]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 280">
          <Ellipse
            cx="100"
            cy="140"
            rx="72"
            ry="110"
            fill="none"
            stroke={strokeColor}
            strokeWidth={3}
            strokeDasharray={active ? undefined : '10 8'}
            opacity={0.95}
          />
          {/* Simplified open-hand silhouette inside the oval. */}
          <Path
            d="M78 170
               C76 150 78 128 82 112
               C84 102 90 98 96 108
               L98 88
               C99 78 105 76 108 88
               L112 82
               C114 72 120 72 122 84
               L126 90
               C128 80 134 82 134 94
               L136 118
               C148 122 156 138 152 158
               C148 178 130 190 110 188
               C92 186 80 180 78 170 Z"
            fill={strokeColor}
            opacity={0.18}
            stroke={strokeColor}
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...ABSOLUTE_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vignette: {
    ...ABSOLUTE_FILL,
    backgroundColor: 'rgba(10, 16, 40, 0.28)',
  },
  frameWrap: {
    width: '72%',
    maxWidth: 280,
    aspectRatio: 200 / 280,
  },
});
