/**
 * Vision Camera + MediaPipe Hands bridge for development builds.
 * In Expo Go this module is never loaded for live frames; Mirror stays guided-only.
 */
import type { HandLandmark } from './aslHandMatch';

export type HandFrameProcessorBridge = {
  /** Whether native VisionCamera + Hands plugins are linked. */
  isNativeReady: boolean;
  /** Optional: subscribe to landmark callbacks from native frame processor. */
  note: string;
};

let nativeReady = false;

/**
 * Called once from the Mirror screen when running a development build.
 * Attempts to resolve VisionCamera; if missing, stays in guided fallback.
 */
export async function initHandFrameProcessor(): Promise<HandFrameProcessorBridge> {
  try {
    // Dynamic import so Expo Go / web bundles do not hard-crash on missing native code.
    await import('react-native-vision-camera');
    nativeReady = true;
    return {
      isNativeReady: true,
      note: 'VisionCamera linked. Connect MediaPipe Hands frame processor for live landmarks.',
    };
  } catch {
    nativeReady = false;
    return {
      isNativeReady: false,
      note: 'VisionCamera not available. Use a development build with native modules.',
    };
  }
}

export function getHandFrameProcessorReady(): boolean {
  return nativeReady;
}

/**
 * Normalize MediaPipe hand landmark arrays (x,y in 0..1) into app landmarks.
 */
export function normalizeNativeLandmarks(
  raw: Array<{ x: number; y: number; z?: number }> | null | undefined,
): HandLandmark[] | null {
  if (!raw || raw.length < 21) {
    return null;
  }
  return raw.slice(0, 21).map((p) => ({
    x: clamp01(p.x),
    y: clamp01(p.y),
    z: p.z,
  }));
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}
