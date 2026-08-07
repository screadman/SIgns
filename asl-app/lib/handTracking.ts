import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  handInGuideFrame,
  matchLandmarksToLetter,
  type HandLandmark,
  type LetterMatchResult,
} from './aslHandMatch';
import { isHandLandmarkerAvailable } from 'signs-hand-landmarker';

export type HandTrackingMode = 'unavailable' | 'guided-only' | 'live';

export type HandTrackingState = {
  mode: HandTrackingMode;
  landmarks: HandLandmark[] | null;
  inFrame: boolean;
  match: LetterMatchResult | null;
  /** True when running inside a custom development build (not Expo Go). */
  isDevBuild: boolean;
  landmarkerReady: boolean;
};

function detectDevBuild(): boolean {
  const ownership = Constants.appOwnership;
  if (ownership === 'expo') {
    return false;
  }
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Hand tracking facade.
 * Live mode requires a development build with the SignsHandLandmarker native module.
 */
export function useHandTracking(letterId: string | null): HandTrackingState & {
  reportLandmarks: (points: HandLandmark[] | null) => void;
} {
  const isDevBuild = detectDevBuild();
  const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
  const [landmarkerReady, setLandmarkerReady] = useState(false);
  const lastReport = useRef(0);

  useEffect(() => {
    setLandmarkerReady(isDevBuild && isHandLandmarkerAvailable());
  }, [isDevBuild]);

  const reportLandmarks = useCallback((points: HandLandmark[] | null) => {
    const now = Date.now();
    if (now - lastReport.current < 100) {
      return;
    }
    lastReport.current = now;
    setLandmarks(points);
  }, []);

  useEffect(() => {
    setLandmarks(null);
  }, [letterId]);

  const mode: HandTrackingMode =
    isDevBuild && landmarkerReady ? 'live' : 'guided-only';
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
    landmarkerReady,
    reportLandmarks,
  };
}

export function isHandTrackingLiveAvailable(): boolean {
  return detectDevBuild() && isHandLandmarkerAvailable();
}
