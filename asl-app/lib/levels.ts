export type LevelInfo = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNext: number;
  progress: number;
  isMaxLevel: boolean;
};

/** Cumulative XP required to reach each level (index 0 = level 1). */
export const LEVEL_THRESHOLDS = [
  0, 100, 200, 350, 500, 700, 900, 1150, 1400, 1700,
] as const;

export function getLevel(xp: number): LevelInfo {
  const totalXp = Math.max(0, Math.floor(xp));
  let levelIndex = 0;

  for (let index = LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (totalXp >= LEVEL_THRESHOLDS[index]) {
      levelIndex = index;
      break;
    }
  }

  const level = levelIndex + 1;
  const isMaxLevel = levelIndex >= LEVEL_THRESHOLDS.length - 1;
  const currentThreshold = LEVEL_THRESHOLDS[levelIndex];
  const nextThreshold = isMaxLevel
    ? LEVEL_THRESHOLDS[levelIndex]
    : LEVEL_THRESHOLDS[levelIndex + 1];
  const xpIntoLevel = totalXp - currentThreshold;
  const xpForNext = isMaxLevel ? 0 : nextThreshold - currentThreshold;
  const progress = isMaxLevel
    ? 1
    : xpForNext === 0
      ? 1
      : Math.min(1, Math.max(0, xpIntoLevel / xpForNext));

  return {
    level,
    totalXp,
    xpIntoLevel,
    xpForNext,
    progress,
    isMaxLevel,
  };
}
