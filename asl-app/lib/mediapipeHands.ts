/**
 * MediaPipe Hands integration point for VisionCamera frame processors.
 *
 * After `eas build --profile development`, link a native Hands landmarker
 * (MediaPipe Tasks Vision) as a VisionCamera frame processor plugin, then
 * call `emitHandLandmarks` from the worklet / native bridge.
 *
 * Expo Go cannot load this path; Mirror stays in guided-only mode there.
 */

import type { HandLandmark } from './aslHandMatch';
import { normalizeNativeLandmarks } from './handFrameProcessor';

type LandmarkListener = (points: HandLandmark[] | null) => void;

const listeners = new Set<LandmarkListener>();

export function subscribeHandLandmarks(listener: LandmarkListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitHandLandmarks(
  raw: Array<{ x: number; y: number; z?: number }> | null,
): void {
  const points = normalizeNativeLandmarks(raw);
  listeners.forEach((listener) => listener(points));
}

/**
 * Example feature checklist for the native plugin (not executed in JS):
 * 1. Load hand_landmarker.task model asset
 * 2. For each camera frame, run HandLandmarker.detect
 * 3. Map 21 landmarks to normalized x/y
 * 4. Call emitHandLandmarks from the JS runtime
 */
export const MEDIAPIPE_HANDS_INTEGRATION = {
  modelAsset: 'hand_landmarker.task',
  landmarkCount: 21,
  targetModules: ['alphabet'] as const,
} as const;
