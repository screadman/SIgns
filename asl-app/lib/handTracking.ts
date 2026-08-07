import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import {
  handInGuideFrame,
  matchLandmarksToLetter,
  type HandLandmark,
  type LetterMatchResult,
} from './aslHandMatch';

export type HandTrackingMode = 'unavailable' | 'guided-only' | 'live';

export type HandTrackingState = {
  mode: HandTrackingMode;
  landmarks: HandLandmark[] | null;
  inFrame: boolean;
  match: LetterMatchResult | null;
  /** True when running inside a custom development build (not Expo Go). */
  isDevBuild: boolean;
};

function detectDevBuild(): boolean {
  // Expo Go app ownership is "expo"; standalone / dev clients differ.
  const ownership = Constants.appOwnership;
  if (ownership === 'expo') {
    return false;
  }
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Hand tracking facade.
 * Live landmark feeding is wired from VisionCamera frame processors in a
 * development build. Expo Go stays on guided-only mode.
 */
export function useHandTracking(letterId: string | null): HandTrackingState & {
  reportLandmarks: (points: HandLandmark[] | null) => void;
} {
  const isDevBuild = detectDevBuild();
  const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
  const lastReport = useRef(0);

  const reportLandmarks = useCallback((points: HandLandmark[] | null) => {
    const now = Date.now();
    // Throttle UI updates (~10 fps).
    if (now - lastReport.current < 100) {
      return;
    }
    lastReport.current = now;
    setLandmarks(points);
  }, []);

  useEffect(() => {
    setLandmarks(null);
  }, [letterId]);

  const mode: HandTrackingMode = isDevBuild ? 'live' : 'guided-only';
  const inFrame = landmarks ? handInGuideFrame(landmarks) : false;
  const match =
    letterId && landmarks
      ? matchLandmarksToLetter(landmarks, letterId)
      : letterId
        ? ({ letterId, score: 0, label: 'no-hand' } as LetterMatchResult)
        : null;

  return {
    mode,
    landmarks,
    inFrame,
    match,
    isDevBuild,
    reportLandmarks,
  };
}

export function isHandTrackingLiveAvailable(): boolean {
  return detectDevBuild();
}
