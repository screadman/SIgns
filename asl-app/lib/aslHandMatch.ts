/**
 * ASL alphabet hand matching from MediaPipe-style 21 hand landmarks.
 * Landmark indices follow MediaPipe Hands:
 * 0 wrist, 1-4 thumb, 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky.
 */

export type HandLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type FingerCurl = 0 | 1 | 2;
/** 0 = extended, 1 = half, 2 = curled */

export type HandFeatureVector = {
  thumb: FingerCurl;
  index: FingerCurl;
  middle: FingerCurl;
  ring: FingerCurl;
  pinky: FingerCurl;
};

export type LetterMatchResult = {
  letterId: string;
  score: number;
  label: 'no-hand' | 'far' | 'close' | 'match';
};

const LETTER_TEMPLATES: Record<string, HandFeatureVector> = {
  a: { thumb: 1, index: 2, middle: 2, ring: 2, pinky: 2 },
  b: { thumb: 2, index: 0, middle: 0, ring: 0, pinky: 0 },
  c: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
  d: { thumb: 1, index: 0, middle: 2, ring: 2, pinky: 2 },
  e: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 2 },
  f: { thumb: 1, index: 1, middle: 0, ring: 0, pinky: 0 },
  g: { thumb: 0, index: 0, middle: 2, ring: 2, pinky: 2 },
  h: { thumb: 1, index: 0, middle: 0, ring: 2, pinky: 2 },
  i: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 0 },
  j: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 0 },
  k: { thumb: 1, index: 0, middle: 0, ring: 2, pinky: 2 },
  l: { thumb: 0, index: 0, middle: 2, ring: 2, pinky: 2 },
  m: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 2 },
  n: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 2 },
  o: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
  p: { thumb: 1, index: 0, middle: 0, ring: 2, pinky: 2 },
  q: { thumb: 0, index: 0, middle: 2, ring: 2, pinky: 2 },
  r: { thumb: 1, index: 0, middle: 0, ring: 2, pinky: 2 },
  s: { thumb: 2, index: 2, middle: 2, ring: 2, pinky: 2 },
  t: { thumb: 1, index: 2, middle: 2, ring: 2, pinky: 2 },
  u: { thumb: 2, index: 0, middle: 0, ring: 2, pinky: 2 },
  v: { thumb: 2, index: 0, middle: 0, ring: 2, pinky: 2 },
  w: { thumb: 2, index: 0, middle: 0, ring: 0, pinky: 2 },
  x: { thumb: 1, index: 1, middle: 2, ring: 2, pinky: 2 },
  y: { thumb: 0, index: 2, middle: 2, ring: 2, pinky: 0 },
  z: { thumb: 2, index: 0, middle: 2, ring: 2, pinky: 2 },
};

function dist(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function fingerCurl(
  wrist: HandLandmark,
  mcp: HandLandmark,
  pip: HandLandmark,
  tip: HandLandmark,
): FingerCurl {
  const open = dist(wrist, tip);
  const folded = dist(mcp, tip);
  const pipSpan = dist(mcp, pip);
  if (open > pipSpan * 2.15 && folded > pipSpan * 1.1) {
    return 0;
  }
  if (folded < pipSpan * 0.85) {
    return 2;
  }
  return 1;
}

export function landmarksToFeatures(
  landmarks: HandLandmark[],
): HandFeatureVector | null {
  if (landmarks.length < 21) {
    return null;
  }

  const wrist = landmarks[0];
  return {
    thumb: fingerCurl(wrist, landmarks[1], landmarks[2], landmarks[4]),
    index: fingerCurl(wrist, landmarks[5], landmarks[6], landmarks[8]),
    middle: fingerCurl(wrist, landmarks[9], landmarks[10], landmarks[12]),
    ring: fingerCurl(wrist, landmarks[13], landmarks[14], landmarks[16]),
    pinky: fingerCurl(wrist, landmarks[17], landmarks[18], landmarks[20]),
  };
}

function featureDistance(a: HandFeatureVector, b: HandFeatureVector): number {
  return (
    Math.abs(a.thumb - b.thumb) +
    Math.abs(a.index - b.index) +
    Math.abs(a.middle - b.middle) +
    Math.abs(a.ring - b.ring) +
    Math.abs(a.pinky - b.pinky)
  );
}

/** Max distance across 5 fingers with curl 0..2 is 10. */
export function scoreFeaturesAgainstLetter(
  features: HandFeatureVector,
  letterId: string,
): number {
  const template = LETTER_TEMPLATES[letterId.toLowerCase()];
  if (!template) {
    return 0;
  }
  const distance = featureDistance(features, template);
  return Math.max(0, 1 - distance / 10);
}

export function matchLandmarksToLetter(
  landmarks: HandLandmark[] | null | undefined,
  letterId: string,
): LetterMatchResult {
  const id = letterId.toLowerCase();
  if (!landmarks || landmarks.length < 21) {
    return { letterId: id, score: 0, label: 'no-hand' };
  }

  const features = landmarksToFeatures(landmarks);
  if (!features) {
    return { letterId: id, score: 0, label: 'no-hand' };
  }

  const score = scoreFeaturesAgainstLetter(features, id);
  if (score >= 0.78) {
    return { letterId: id, score, label: 'match' };
  }
  if (score >= 0.55) {
    return { letterId: id, score, label: 'close' };
  }
  return { letterId: id, score, label: 'far' };
}

export function handInGuideFrame(landmarks: HandLandmark[]): boolean {
  if (landmarks.length < 21) {
    return false;
  }
  const xs = landmarks.map((p) => p.x);
  const ys = landmarks.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  // Normalized coords: large center signing zone (wide frame).
  return cx > 0.12 && cx < 0.88 && cy > 0.18 && cy < 0.78;
}

export function hasLetterTemplate(letterId: string): boolean {
  return Boolean(LETTER_TEMPLATES[letterId.toLowerCase()]);
}
