import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';
import type { HandLandmark } from '../../lib/aslHandMatch';

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

type VisionHandCameraProps = {
  style?: object;
  onLandmarks?: (points: HandLandmark[] | null) => void;
};

/**
 * Development-build camera path using VisionCamera.
 * MediaPipe Hands frame processor plugs in here once the native plugin is linked
 * via `eas build --profile development`. Until then, the camera preview still
 * runs and Mirror keeps the Face ID guide + alphabet matcher ready.
 */
export function VisionHandCamera({ style, onLandmarks }: VisionHandCameraProps) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission().then((granted) => setReady(granted));
      return;
    }
    setReady(true);
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    // Placeholder: when a MediaPipe Hands frame processor is linked, push
    // landmarks through onLandmarks. Clearing keeps match UI in no-hand state.
    onLandmarks?.(null);
  }, [onLandmarks]);

  if (!ready) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>Allow camera for live mirror</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>No front camera found</Text>
      </View>
    );
  }

  return (
    <Camera
      style={[styles.camera, style]}
      device={device}
      isActive
      // Frame processors for MediaPipe Hands are registered in a native plugin
      // after `eas build --profile development`.
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    ...ABSOLUTE_FILL,
  },
  fallback: {
    ...ABSOLUTE_FILL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  fallbackText: {
    color: colors.textMuted,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
