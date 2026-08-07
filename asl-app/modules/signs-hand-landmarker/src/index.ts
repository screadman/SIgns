import { requireNativeModule, NativeModule } from 'expo-modules-core';

export type NativeHandLandmark = {
  x: number;
  y: number;
  z?: number;
};

type SignsHandLandmarkerModuleType = {
  isAvailable(): boolean;
  detectFromUri(uri: string): Promise<NativeHandLandmark[] | null>;
};

let native: SignsHandLandmarkerModuleType | null = null;

try {
  native = requireNativeModule<SignsHandLandmarkerModuleType>(
    'SignsHandLandmarker',
  );
} catch {
  native = null;
}

export function isHandLandmarkerAvailable(): boolean {
  try {
    return Boolean(native?.isAvailable?.());
  } catch {
    return false;
  }
}

/**
 * Run MediaPipe Hand Landmarker on a local image file/uri.
 * Returns 21 landmarks in normalized 0..1 coords, or null.
 */
export async function detectHandsFromUri(
  uri: string,
): Promise<NativeHandLandmark[] | null> {
  if (!native?.detectFromUri) {
    return null;
  }
  try {
    const result = await native.detectFromUri(uri);
    if (!result || result.length < 21) {
      return null;
    }
    return result.slice(0, 21);
  } catch {
    return null;
  }
}

export type { SignsHandLandmarkerModuleType };
