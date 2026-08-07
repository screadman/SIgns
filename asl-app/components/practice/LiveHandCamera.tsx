import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSize,
  spacing,
} from '../../constants/theme';
import type { HandLandmark } from '../../lib/aslHandMatch';
import {
  detectHandsFromUri,
  isHandLandmarkerAvailable,
} from 'signs-hand-landmarker';

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const POLL_MS = 450;

type LiveHandCameraProps = {
  style?: object;
  onLandmarks?: (points: HandLandmark[] | null) => void;
  /** Pause detection while UI is idle. */
  active?: boolean;
};

/**
 * Dev-build camera: expo-camera preview + MediaPipe Hands on periodic snapshots.
 */
export function LiveHandCamera({
  style,
  onLandmarks,
  active = true,
}: LiveHandCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const busy = useRef(false);
  const onLandmarksRef = useRef(onLandmarks);
  const [landmarkerReady, setLandmarkerReady] = useState(false);

  useEffect(() => {
    onLandmarksRef.current = onLandmarks;
  }, [onLandmarks]);

  useEffect(() => {
    setLandmarkerReady(isHandLandmarkerAvailable());
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      void requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    if (!active || !permission?.granted || !landmarkerReady) {
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }

    const timer = setInterval(() => {
      void (async () => {
        if (busy.current || !cameraRef.current) {
          return;
        }
        busy.current = true;
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.35,
            skipProcessing: true,
            shutterSound: false,
          });
          if (!photo?.uri) {
            onLandmarksRef.current?.(null);
            return;
          }
          const points = await detectHandsFromUri(photo.uri);
          onLandmarksRef.current?.(
            points
              ? points.map((p) => ({ x: p.x, y: p.y, z: p.z }))
              : null,
          );
        } catch {
          onLandmarksRef.current?.(null);
        } finally {
          busy.current = false;
        }
      })();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [active, permission?.granted, landmarkerReady]);

  if (!permission?.granted) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>Allow camera for live mirror</Text>
      </View>
    );
  }

  return (
    <View style={[styles.camera, style]}>
      <CameraView
        ref={cameraRef}
        style={ABSOLUTE_FILL}
        facing="front"
        animateShutter={false}
      />
      {!landmarkerReady ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Hand model not linked yet. Rebuild with EAS development profile.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    ...ABSOLUTE_FILL,
    overflow: 'hidden',
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
  banner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bannerText: {
    color: colors.white,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
