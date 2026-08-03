import AsyncStorage from '@react-native-async-storage/async-storage';

export const SIGN_STRENGTH_KEY = 'sign_strength_v1';

export type SignStrengthEntry = {
  strength: number;
  seen: number;
  correct: number;
  wrong: number;
  lastSeenAt: string | null;
  lastWrongAt: string | null;
};

export type SignStrengthMap = Record<string, SignStrengthEntry>;

const DEFAULT_ENTRY: SignStrengthEntry = {
  strength: 0.2,
  seen: 0,
  correct: 0,
  wrong: 0,
  lastSeenAt: null,
  lastWrongAt: null,
};

function clampStrength(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function getStrengthTier(
  strength: number,
): 'cold' | 'warm' | 'strong' | 'mastered' {
  if (strength >= 0.9) return 'mastered';
  if (strength >= 0.7) return 'strong';
  if (strength >= 0.35) return 'warm';
  return 'cold';
}

export async function getSignStrengthMap(): Promise<SignStrengthMap> {
  const raw = await AsyncStorage.getItem(SIGN_STRENGTH_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as SignStrengthMap;
  } catch {
    return {};
  }
}

export async function getSignStrength(
  signId: string,
): Promise<SignStrengthEntry> {
  const map = await getSignStrengthMap();
  return map[signId] ?? { ...DEFAULT_ENTRY };
}

export async function recordSignAnswer(
  signId: string,
  correct: boolean,
): Promise<SignStrengthEntry> {
  const map = await getSignStrengthMap();
  const current = map[signId] ?? { ...DEFAULT_ENTRY };
  const now = new Date().toISOString();

  const next: SignStrengthEntry = {
    seen: current.seen + 1,
    correct: current.correct + (correct ? 1 : 0),
    wrong: current.wrong + (correct ? 0 : 1),
    lastSeenAt: now,
    lastWrongAt: correct ? current.lastWrongAt : now,
    strength: clampStrength(
      correct ? current.strength + 0.12 : current.strength - 0.2,
    ),
  };

  map[signId] = next;
  await AsyncStorage.setItem(SIGN_STRENGTH_KEY, JSON.stringify(map));
  return next;
}

export async function recordSignAnswers(
  results: Array<{ signId: string; correct: boolean }>,
): Promise<SignStrengthMap> {
  const map = await getSignStrengthMap();
  const now = new Date().toISOString();

  for (const result of results) {
    const current = map[result.signId] ?? { ...DEFAULT_ENTRY };
    map[result.signId] = {
      seen: current.seen + 1,
      correct: current.correct + (result.correct ? 1 : 0),
      wrong: current.wrong + (result.correct ? 0 : 1),
      lastSeenAt: now,
      lastWrongAt: result.correct ? current.lastWrongAt : now,
      strength: clampStrength(
        result.correct ? current.strength + 0.12 : current.strength - 0.2,
      ),
    };
  }

  await AsyncStorage.setItem(SIGN_STRENGTH_KEY, JSON.stringify(map));
  return map;
}

export async function markSignExposed(signId: string): Promise<SignStrengthEntry> {
  const map = await getSignStrengthMap();
  const current = map[signId] ?? { ...DEFAULT_ENTRY };
  const now = new Date().toISOString();

  const next: SignStrengthEntry = {
    ...current,
    seen: Math.max(current.seen, 1),
    lastSeenAt: now,
    // Soft warm-up when first learned from a lesson.
    strength:
      current.seen === 0 ? Math.max(current.strength, 0.25) : current.strength,
  };

  map[signId] = next;
  await AsyncStorage.setItem(SIGN_STRENGTH_KEY, JSON.stringify(map));
  return next;
}

/** Weak pool: low strength or wrong within last 7 days. */
export function isWeakSign(
  entry: SignStrengthEntry | undefined,
  now = Date.now(),
): boolean {
  if (!entry) {
    return true;
  }

  if (entry.strength < 0.45) {
    return true;
  }

  if (!entry.lastWrongAt) {
    return false;
  }

  const wrongAt = Date.parse(entry.lastWrongAt);
  if (!Number.isFinite(wrongAt)) {
    return false;
  }

  return now - wrongAt < 7 * 24 * 60 * 60 * 1000;
}

/** Recent pool: seen within 72h and not yet strong. */
export function isRecentSign(
  entry: SignStrengthEntry | undefined,
  now = Date.now(),
): boolean {
  if (!entry?.lastSeenAt) {
    return false;
  }

  if (entry.strength >= 0.85) {
    return false;
  }

  const seenAt = Date.parse(entry.lastSeenAt);
  if (!Number.isFinite(seenAt)) {
    return false;
  }

  return now - seenAt < 72 * 60 * 60 * 1000;
}
