import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderRadius, borderWidth, colors } from '../../constants/theme';

type SignGlassFrameProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Translucent liquid-glass plate behind sign illustrations
 * (replaces the old opaque beige fill).
 */
export function SignGlassFrame({
  children,
  style,
  contentStyle,
}: SignGlassFrameProps) {
  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={[...colors.signGlassGradient]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={styles.sheen}
        pointerEvents="none"
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.signGlassBorder,
    backgroundColor: colors.signSurface,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
